"""Shared lighting projects and mixed-show playback behind Home Assistant Ingress."""
import asyncio
import base64
from io import BytesIO
import json
import logging
import re
import uuid

from aiohttp import web
from PIL import Image, ImageOps, UnidentifiedImageError

from .lighting import ERRORS

LOG = logging.getLogger(__name__)
MAX_PHOTO = 470_000
MAX_SHOWS = 20
MAX_STEPS = 20
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
        if (not isinstance(parts, list) or not parts or parts[0] not in ("twinkly", "hue", "govee")
                or len(parts) != (2 if parts[0] == "twinkly" else 3)
                or any(not isinstance(part, str) or not 1 <= len(part) <= 128 for part in parts)):
            raise ValueError("Invalid light")
        if (not isinstance(coordinate, list) or len(coordinate) not in (2, 3)
                or any(type(n) not in (int, float) or not 0 <= n <= 100 for n in coordinate[:2])
                or (len(coordinate) == 3 and (type(coordinate[2]) not in (int, float)
                                             or not 4 <= coordinate[2] <= 40))):
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


class Playback:
    def __init__(self, lighting):
        self.lighting = lighting
        self.task = None
        self.stop = asyncio.Event()
        self.status = {"state": "idle"}

    def start(self, show):
        if self.task is not None:
            raise web.HTTPConflict()
        if not self.lighting.valid_show(show):
            raise ValueError("Unavailable scene")
        self.stop.clear()
        self.status = {"state": "playing", "id": show["id"], "step": 0, "total": len(show["steps"]),
                       "uncertain": False, "partial": False}
        self.task = asyncio.create_task(self.run(show))

    async def run(self, show):
        outcome = "complete"
        try:
            for number, step in enumerate(show["steps"], 1):
                if self.stop.is_set():
                    break
                self.status["step"] = number
                results = await self.lighting.run_scene(step["scene"], show["group"])
                outcomes = {value for commands in results.values() for value in commands.values()}
                self.status["uncertain"] |= "unconfirmed" in outcomes
                self.status["partial"] |= bool(outcomes.intersection({"failed", "skipped"}))
                if not outcomes.intersection({"accepted", "unconfirmed"}):
                    outcome = "failed"
                    break
                try:
                    await asyncio.wait_for(self.stop.wait(), step["seconds"])
                except TimeoutError:
                    pass
        except (*ERRORS, KeyError, TypeError):
            LOG.exception("Mixed show interrupted")
            outcome = "failed"
        finally:
            self.status["state"] = "stopped" if self.stop.is_set() else outcome
            self.task = None

    def request_stop(self):
        if self.task is not None:
            self.stop.set()
            self.status["state"] = "stopping"

    async def cleanup(self, app):
        yield
        self.request_stop()
        if self.task is not None:
            await self.task


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
            state = await asyncio.to_thread(store.read, path, {"shows": {}, "layout": empty_layout()})
        return state

    async def current():
        if state is not None:
            return state
        async with lock:
            return await load()

    def response(data, **extra):
        layout = data["layout"]
        return web.json_response({
            "shows": list(data["shows"].values()),
            "layout": {"revision": layout["revision"], "photo_version": layout["photo_version"],
                       "points": layout["points"]},
            "playback": playback.status, **extra,
        }, headers=HEADERS)

    async def get(request):
        try:
            return response(await current())
        except (ValueError, OSError):
            raise web.HTTPServiceUnavailable()

    async def photo(request):
        try:
            layout = (await current())["layout"]
            if layout["photo"] is None:
                raise web.HTTPNotFound()
            return web.Response(body=base64.b64decode(layout["photo"], validate=True),
                                content_type="image/jpeg", headers=HEADERS)
        except (ValueError, OSError):
            raise web.HTTPServiceUnavailable()

    async def change(request):
        nonlocal state
        try:
            body = await request.json()
            action = body["action"]
            encoded = body.get("photo")
            async with lock:
                latest = await load()
                shows, layout = latest["shows"].copy(), latest["layout"]
                data = {"shows": shows, "layout": layout}
                if action == "save":
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
                elif action == "layout":
                    if body["revision"] != layout["revision"]:
                        raise web.HTTPConflict()
                    current_photo = layout["photo"]
                    photo_version = layout["photo_version"]
                    if "photo" in body:
                        current_photo = await asyncio.to_thread(photo_jpeg, encoded) if encoded is not None else None
                        photo_version = uuid.uuid4().hex if current_photo is not None else None
                    points = positions(body["points"])
                    if points and current_photo is None:
                        raise ValueError("Positions require a photo")
                    data["layout"] = {"revision": uuid.uuid4().hex, "photo_version": photo_version,
                                      "photo": current_photo, "points": points}
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
                        data["layout"] = {"revision": uuid.uuid4().hex, "photo_version": uuid.uuid4().hex,
                                          "photo": await asyncio.to_thread(photo_jpeg, encoded),
                                          "points": positions(body["points"])}
                elif action == "play":
                    playback.start(shows[identifier(body["id"])])
                    return response(data)
                elif action == "stop":
                    playback.request_stop()
                    return response(data)
                else:
                    raise ValueError("Invalid action")
                await asyncio.to_thread(store.write, path, data)
                state = data
                return response(data, imported_photo=action == "import" and data["layout"] is not layout)
        except invalid:
            return web.json_response({"error": "invalid_project"}, status=400, headers=HEADERS)
        except OSError:
            return web.json_response({"error": "project_storage_unavailable"}, status=503, headers=HEADERS)
        except web.HTTPConflict:
            return web.json_response({"error": "project_conflict"}, status=409, headers=HEADERS)

    app.router.add_get("/lighting/projects", get)
    app.router.add_post("/lighting/projects", change)
    app.router.add_get("/lighting/projects/photo", photo)
    app.cleanup_ctx.append(playback.cleanup)
