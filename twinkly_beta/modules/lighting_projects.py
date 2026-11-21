"""Shared lighting projects and mixed-show playback behind Home Assistant Ingress."""
import asyncio
import base64
from hashlib import sha256
from io import BytesIO
import json
import logging
import re
import uuid

from aiohttp import web
from PIL import Image, ImageOps, UnidentifiedImageError

from .common import rgb
from .lighting import ERRORS

LOG = logging.getLogger(__name__)
MAX_PHOTO = 470_000
MAX_SHOWS = 20
MAX_STEPS = 20
MAX_WALLS = 8
PROJECT_LIMIT = 8 * 1024 * 1024
DEFAULT_WALL = "default"
RADIAL_EFFECTS = {"outward": 1, "inward": -1}
DIRECTIONS = {"right": (0, 1), "left": (0, -1), "down": (1, 1), "up": (1, -1)}
HEADERS = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
}


def empty_layout():
    return {"revision": None, "photo_version": None, "photo": None, "points": []}


def photo_jpeg(value):
    if not isinstance(value, str) or len(value) > 4 * ((MAX_PHOTO + 2) // 3):
        raise ValueError("Invalid photo size")
    raw = base64.b64decode(value, validate=True)
    if not 4 <= len(raw) <= MAX_PHOTO:
        raise ValueError("Invalid photo size")
    with Image.open(BytesIO(raw), formats=["JPEG", "PNG", "WEBP"]) as image:
        if not 1 <= min(image.size) <= max(image.size) <= 2048:
            raise ValueError("Invalid photo dimensions")
        # Re-encode pixels without retaining the source's metadata.
        pixels = ImageOps.exif_transpose(image).convert("RGB")
        pixels.thumbnail((1280, 1280))
        clean = Image.new("RGB", pixels.size)
        clean.paste(pixels)
        out = BytesIO()
        clean.save(out, "JPEG", quality=80, optimize=True)
        if out.tell() > MAX_PHOTO:
            raise ValueError("Photo too large")
        return base64.b64encode(out.getvalue()).decode("ascii")


def positions(value):
    if not isinstance(value, list) or len(value) > 128:
        raise ValueError("Invalid positions")
    points = {}
    for key, coordinate in value:
        parts = json.loads(key)
        if (not isinstance(parts, list) or not parts or parts[0] not in ("twinkly", "hue", "govee", "group")
                or len(parts) != (2 if parts[0] in ("twinkly", "group") else 3)
                or any(not isinstance(part, str) or not 1 <= len(part) <= 128 for part in parts)):
            raise ValueError("Invalid light")
        if (not isinstance(coordinate, list) or len(coordinate) not in (2, 3, 4)
                or any(type(n) not in (int, float) or not 0 <= n <= 100 for n in coordinate[:2])
                or (len(coordinate) >= 3 and (type(coordinate[2]) not in (int, float)
                                             or not 4 <= coordinate[2] <= 40))
                or (len(coordinate) == 4 and (type(coordinate[3]) is not int or not 0 <= coordinate[3] <= 1000))):
            raise ValueError("Invalid position")
        points[json.dumps(parts, separators=(",", ":"))] = coordinate
    return list(points.items())


def identifier(value):
    if not isinstance(value, str) or re.fullmatch(r"[a-f0-9]{32}", value) is None:
        raise ValueError("Invalid identifier")
    return value


def show_settings(data):
    name, group, steps = data["name"], identifier(data["group"]), data["steps"]
    if (not isinstance(name, str) or not 1 <= len(name.strip()) <= 60
            or not isinstance(steps, list) or not 1 <= len(steps) <= MAX_STEPS):
        raise ValueError("Invalid show")
    normalized = []
    for step in steps:
        seconds = step["seconds"]
        if type(seconds) is not int or not 1 <= seconds <= 300:
            raise ValueError("Invalid hold time")
        normalized.append({"scene": identifier(step["scene"]), "seconds": seconds})
    return {"name": name.strip(), "group": group, "steps": normalized}


def spatial_position(point, direction, effect):
    radial = RADIAL_EFFECTS.get(effect)
    if radial is not None:
        return radial * ((point[0] - 50) ** 2 + (point[1] - 50) ** 2)
    axis, sign = DIRECTIONS[direction]
    return sign * point[axis]


def spatial_steps(eligible, lights, axis, sign, color, delay, end_color):
    if not eligible:
        return []
    first = sign * eligible[0][1][axis]
    distance = sign * eligible[-1][1][axis] - first
    advances = [point[3] if len(point) == 4 else 0 for _, point in eligible]
    calibrated = any(advances) or end_color is not None
    steps = []
    for index, ((key, point), advance) in enumerate(zip(eligible, advances)):
        channels = color
        if end_color is not None and distance:
            ratio = (sign * point[axis] - first) / distance
            channels = [int(start + (end - start) * ratio + 0.5) for start, end in zip(color, end_color)]
            if not any(channels):
                channels[channels.index(max(channels))] = 1
        step = {"lamp": key, "light": lights[key], "color": channels, "seconds": delay / 1000}
        if calibrated:
            step["due"] = (0 if end_color is not None else index * delay) - advance
        steps.append(step)
    if calibrated:
        steps.sort(key=lambda step: step["due"])
        earliest = steps[0]["due"]
        for step in steps:
            step["due"] = (step["due"] - earliest) / 1000
    return steps


class Playback:
    def __init__(self, lighting):
        self.lighting = lighting
        self.task = None
        self.stop = asyncio.Event()
        self.status = {"state": "idle"}

    def start(self, show):
        if not self.lighting.valid_show(show):
            raise ValueError("Unavailable scene")

        async def apply(step):
            return await self.lighting.run_scene(step["scene"], show["group"])

        self.schedule("show", show["steps"], apply, show["id"])

    def start_spatial(self, points, direction, color, delay, end_color=None, effect=None):
        axis, sign = DIRECTIONS[direction]
        async def plan():
            lights, _ = await self.lighting.lights()
            groups = getattr(self.lighting, "spatial_groups", lambda: {})()
            owners = {}
            for group, row in groups.items():
                for member in row["members"]:
                    owners.setdefault(member, group)
            placements = dict(points)
            for key, point in points:
                group = owners.get(key)
                if group is not None:
                    placements.setdefault(group, point)
                    placements.pop(key, None)

            eligible = []
            targets = {}
            claimed = set()
            for key, point in sorted(placements.items(), key=lambda item: spatial_position(item[1], direction, effect)):
                members = groups.get(key, {}).get("members", [key])
                active = {}
                for member in members:
                    light = lights.get(member)
                    if (member not in claimed and light and light["status"] != "unavailable"
                            and light["capabilities"].get("rgb") and light["state"].get("on") is True):
                        active[member] = light
                if active:
                    claimed.update(active)
                    eligible.append((key, point))
                    targets[key] = active if key in groups else active[key]
            return spatial_steps(eligible, targets, axis, sign, color, delay, end_color)

        async def apply(step):
            key = step["lamp"]
            if json.loads(key)[0] == "group":
                return {key: await self.lighting.send_spatial_group_color(step["light"], step["color"], self.stop)}
            result = await self.lighting.send_spatial_color(key, step["light"], step["color"], self.stop)
            return {key: {"color": result}}

        self.schedule("spatial", [], apply, prepare=plan)
        self.status["effect"] = effect or ("gradient" if end_color is not None else "sweep")

    def schedule(self, kind, steps, apply, identifier=None, prepare=None):
        if self.task is not None:
            raise web.HTTPConflict()
        self.stop.clear()
        self.status = {"state": "playing", "kind": kind, "id": identifier, "step": 0, "total": len(steps),
                       "uncertain": False, "partial": False, "last": None}
        self.task = asyncio.create_task(self.run(steps, apply, prepare))

    async def run(self, steps, apply, prepare):
        outcome = "complete"
        try:
            if prepare:
                steps = await prepare()
                self.status["total"] = len(steps)
            succeeded = False
            loop = asyncio.get_running_loop()
            timeline_start = loop.time()
            for number, step in enumerate(steps, 1):
                if "due" in step:
                    await self.wait_until_stopped(timeline_start + step["due"] - loop.time())
                if self.stop.is_set():
                    break
                self.status["step"] = number
                started = loop.time()
                results = await apply(step)
                self.status["last"] = {"step": number, "milliseconds": round((loop.time() - started) * 1000),
                                       "results": results}
                outcomes = {value for commands in results.values() for value in commands.values()}
                self.status["uncertain"] |= "unconfirmed" in outcomes
                self.status["partial"] |= bool(outcomes.intersection({"failed", "skipped"}))
                sent = bool(outcomes.intersection({"accepted", "unconfirmed"}))
                succeeded |= sent
                if not sent and prepare is None:
                    outcome = "failed"
                    break
                if prepare and number == len(steps):
                    break
                if "due" not in step:
                    await self.wait_until_stopped(step["seconds"])
            if not succeeded:
                outcome = "failed"
        except (*ERRORS, KeyError, TypeError):
            LOG.exception("Lighting playback interrupted")
            outcome = "failed"
        finally:
            self.status["state"] = "stopped" if self.stop.is_set() else outcome
            self.task = None

    async def wait_until_stopped(self, seconds):
        if seconds > 0:
            try:
                await asyncio.wait_for(self.stop.wait(), seconds)
            except TimeoutError:
                pass

    def request_stop(self):
        if self.task is not None:
            self.stop.set()
            self.status["state"] = "stopping"

    async def cleanup(self, app):
        yield
        self.request_stop()
        if self.task is not None:
            await self.task


def wall_layout(data, wall_id):
    return data["layout"] if wall_id == DEFAULT_WALL else data["walls"][wall_id]


def wall_dimensions(body):
    width, height = body["width_m"], body["height_m"]
    if any(type(value) not in (int, float) or not 0.25 <= value <= 20 for value in (width, height)):
        raise ValueError("Invalid wall dimensions")
    return {"width_m": round(width, 2), "height_m": round(height, 2)}


def wall_name(data):
    name = data["name"]
    if not isinstance(name, str) or not 1 <= len(name.strip()) <= 60:
        raise ValueError("Invalid wall name")
    return name.strip()


def update_wall_layout(data, wall_id, layout):
    if wall_id == DEFAULT_WALL:
        data["layout"] = layout
    else:
        data["walls"][wall_id] = {**data["walls"][wall_id], **layout}


def plan_slots(data):
    walls = (DEFAULT_WALL, *data["walls"])
    saved = data.get("plan_slots", {})
    assigned = {}
    for wall_id in walls:
        slot = saved.get(wall_id)
        if type(slot) is int and 0 <= slot < MAX_WALLS and slot not in assigned.values():
            assigned[wall_id] = slot
    free = iter(sorted(set(range(MAX_WALLS)) - set(assigned.values())))
    for wall_id in walls:
        if wall_id not in assigned:
            assigned[wall_id] = next(free)
    return assigned


def plan_revision(slots):
    return sha256(json.dumps(slots, sort_keys=True).encode()).hexdigest()


def install(app, lighting):
    store = lighting.store
    path = store.path.parent / "lighting-projects.json"
    lock = asyncio.Lock()
    playback = Playback(lighting)
    invalid = (ValueError, KeyError, TypeError, OverflowError, UnidentifiedImageError, Image.DecompressionBombError)
    state = None

    async def load():
        nonlocal state
        if state is None:
            state = await asyncio.to_thread(
                store.read, path, {"shows": {}, "layout": empty_layout()}, PROJECT_LIMIT
            )
            state.setdefault("walls", {})
        return state

    async def current():
        if state is not None:
            return state
        async with lock:
            return await load()

    def response(data, wall_id, **extra):
        layout = wall_layout(data, wall_id)
        walls = [{"id": DEFAULT_WALL, "name": data["layout"].get("name", "")}]
        walls.extend({"id": key, "name": wall["name"]} for key, wall in data["walls"].items())
        return web.json_response({
            "shows": list(data["shows"].values()),
            "walls": walls, "wall_id": wall_id,
            "layout": {"revision": layout["revision"], "photo_version": layout["photo_version"],
                       "points": layout["points"], "dimensions": layout.get("dimensions")},
            "playback": playback.status, **extra,
        }, headers=HEADERS)

    async def get(request):
        try:
            data = await current()
            wall_id = request.query.get("wall", DEFAULT_WALL)
            if wall_id not in data["walls"]:
                wall_id = DEFAULT_WALL
            return response(data, wall_id)
        except (ValueError, OSError):
            raise web.HTTPServiceUnavailable()

    def overview_response(data):
        slots = plan_slots(data)
        result = []
        for wall_id, slot in sorted(slots.items(), key=lambda item: item[1]):
            layout = wall_layout(data, wall_id)
            result.append({"id": wall_id, "name": layout.get("name", ""), "slot": slot,
                           "photo_version": layout["photo_version"], "points": layout["points"],
                           "dimensions": layout.get("dimensions")})
        return web.json_response({"revision": plan_revision(slots), "walls": result}, headers=HEADERS)

    async def overview(request):
        try:
            return overview_response(await current())
        except (ValueError, OSError):
            raise web.HTTPServiceUnavailable()

    async def move_wall(request):
        nonlocal state
        try:
            body = await request.json()
            wall_id, slot, revision = body["wall"], body["slot"], body["revision"]
            if not isinstance(wall_id, str) or type(slot) is not int or not 0 <= slot < MAX_WALLS:
                raise ValueError("Invalid wall position")
            async with lock:
                latest = await load()
                slots = plan_slots(latest)
                if wall_id not in slots or revision != plan_revision(slots):
                    return web.json_response({"error": "project_conflict"}, status=409, headers=HEADERS)
                previous = slots[wall_id]
                if previous == slot:
                    return overview_response(latest)
                occupant = next((other for other, value in slots.items() if value == slot), None)
                if occupant is not None:
                    slots[occupant] = previous
                slots[wall_id] = slot
                data = {**latest, "plan_slots": slots}
                await asyncio.to_thread(store.write, path, data, PROJECT_LIMIT)
                state = data
                return overview_response(data)
        except invalid:
            return web.json_response({"error": "invalid_project"}, status=400, headers=HEADERS)
        except OSError:
            return web.json_response({"error": "project_storage_unavailable"}, status=503, headers=HEADERS)

    async def photo(request):
        try:
            layout = wall_layout(await current(), request.query.get("wall", DEFAULT_WALL))
            if layout["photo"] is None:
                raise web.HTTPNotFound()
            return web.Response(body=base64.b64decode(layout["photo"], validate=True),
                                content_type="image/jpeg", headers=HEADERS)
        except KeyError:
            raise web.HTTPNotFound()
        except (ValueError, OSError):
            raise web.HTTPServiceUnavailable()

    async def change(request):
        nonlocal state
        try:
            body = await request.json()
            action = body["action"]
            encoded = body.get("photo")
            wall_id = request.query.get("wall", DEFAULT_WALL)
            async with lock:
                latest = await load()
                walls = latest["walls"].copy()
                if wall_id != DEFAULT_WALL and wall_id not in walls:
                    raise web.HTTPConflict()
                shows = latest["shows"].copy()
                layout = wall_layout(latest, wall_id)
                data = {**latest, "shows": shows, "walls": walls}
                if action == "add_wall":
                    if len(walls) >= MAX_WALLS - 1:
                        raise web.HTTPConflict()
                    wall_id = uuid.uuid4().hex
                    walls[wall_id] = {**empty_layout(), "name": wall_name(body), "revision": uuid.uuid4().hex}
                elif action in ("rename_wall", "delete_wall"):
                    if body["revision"] != layout["revision"]:
                        raise web.HTTPConflict()
                    if action == "rename_wall":
                        update_wall_layout(data, wall_id, {**layout, "name": wall_name(body), "revision": uuid.uuid4().hex})
                    elif wall_id != DEFAULT_WALL:
                        saved = plan_slots(latest)
                        del saved[wall_id]
                        data["plan_slots"] = saved
                        del walls[wall_id]
                        wall_id = DEFAULT_WALL
                    else:
                        raise ValueError("Cannot delete primary wall")
                elif action == "save":
                    show_id = body.get("id")
                    show = show_settings(body)
                    if not lighting.valid_show(show):
                        raise ValueError("Unavailable scene")
                    if show_id is None:
                        if len(shows) >= MAX_SHOWS:
                            raise web.HTTPConflict()
                        show_id = uuid.uuid4().hex
                    elif shows[identifier(show_id)]["revision"] != body.get("revision"):
                        raise web.HTTPConflict()
                    shows[show_id] = {**show, "id": show_id, "revision": uuid.uuid4().hex}
                elif action == "delete":
                    show_id = identifier(body["id"])
                    if shows[show_id]["revision"] != body.get("revision"):
                        raise web.HTTPConflict()
                    del shows[show_id]
                elif action == "wall_dimensions":
                    if body["revision"] != layout["revision"]:
                        raise web.HTTPConflict()
                    update_wall_layout(data, wall_id, {**layout, "dimensions": wall_dimensions(body),
                                                       "revision": uuid.uuid4().hex})
                elif action == "layout":
                    if body["revision"] != layout["revision"]:
                        raise web.HTTPConflict()
                    current_photo = layout["photo"]
                    photo_version = layout["photo_version"]
                    if "photo" in body:
                        current_photo = await asyncio.to_thread(photo_jpeg, encoded) if encoded is not None else None
                        photo_version = uuid.uuid4().hex if current_photo is not None else None
                    points = positions(body["points"])
                    if points and current_photo is None and not layout.get("dimensions"):
                        raise ValueError("Positions require a photo or wall dimensions")
                    update_wall_layout(data, wall_id, {**layout, "revision": uuid.uuid4().hex,
                                      "photo_version": photo_version, "photo": current_photo, "points": points})
                elif action == "import":
                    entries = body["shows"]
                    if not isinstance(entries, list) or len(entries) > MAX_SHOWS:
                        raise ValueError("Invalid import")
                    imported = [show_settings(entry) for entry in entries]
                    for show in imported:
                        if any(all(existing[key] == value for key, value in show.items()) for existing in shows.values()):
                            continue
                        if len(shows) >= MAX_SHOWS:
                            raise web.HTTPConflict()
                        show_id = uuid.uuid4().hex
                        shows[show_id] = {**show, "id": show_id, "revision": uuid.uuid4().hex}
                    if encoded is not None and layout["photo"] is None:
                        update_wall_layout(data, wall_id, {**layout, "revision": uuid.uuid4().hex,
                                          "photo_version": uuid.uuid4().hex,
                                          "photo": await asyncio.to_thread(photo_jpeg, encoded),
                                          "points": positions(body["points"])})
                elif action == "play":
                    playback.start(shows[identifier(body["id"])])
                    return response(data, wall_id)
                elif action == "spatial":
                    effect = body.get("effect")
                    direction = body.get("direction", "right") if effect is not None else body["direction"]
                    color, delay = rgb(body["color"]), body["delay"]
                    if ((effect is not None and effect not in RADIAL_EFFECTS) or direction not in DIRECTIONS
                            or not any(color) or type(delay) is not int
                            or not 250 <= delay <= 2000 or not layout["points"]):
                        raise ValueError("Invalid spatial effect")
                    if body["revision"] != layout["revision"]:
                        raise web.HTTPConflict()
                    end_color = rgb(body["end_color"]) if "end_color" in body else None
                    if end_color is not None and (effect or not any(end_color)):
                        raise ValueError("Invalid end color")
                    playback.start_spatial(layout["points"], direction, color, delay, end_color, effect)
                    return response(data, wall_id)
                elif action == "stop":
                    playback.request_stop()
                    return response(data, wall_id)
                else:
                    raise ValueError("Invalid action")
                await asyncio.to_thread(store.write, path, data, PROJECT_LIMIT)
                state = data
                return response(data, wall_id, imported_photo=action == "import" and wall_layout(data, wall_id) is not layout)
        except invalid:
            return web.json_response({"error": "invalid_project"}, status=400, headers=HEADERS)
        except OSError:
            return web.json_response({"error": "project_storage_unavailable"}, status=503, headers=HEADERS)
        except web.HTTPConflict:
            return web.json_response({"error": "project_conflict"}, status=409, headers=HEADERS)

    app.router.add_get("/lighting/projects", get)
    app.router.add_post("/lighting/projects", change)
    app.router.add_get("/lighting/projects/photo", photo)
    app.router.add_get("/lighting/projects/overview", overview)
    app.router.add_post("/lighting/projects/overview", move_wall)
    app.cleanup_ctx.append(playback.cleanup)
