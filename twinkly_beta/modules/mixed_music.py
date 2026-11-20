"""Mirror one color from the shared LedFX stream to slower LAN lights."""
import asyncio
import json
import logging
import time


LOG = logging.getLogger(__name__)


def sample_color(frame):
    if not frame:
        return None
    pixels = zip(frame[::3], frame[1::3], frame[2::3])
    pixel = max(pixels, key=sum, default=(0, 0, 0))
    return pixel if max(pixel) >= 8 else None


class MixedMusic:
    def __init__(self, controller, send):
        self.controller = controller
        self.send = send
        self.group = None
        self.members = set()
        self.twinkly = set()
        self.external = {}
        self.changed = set()
        self.level = 100
        self.brightness_changed = set()
        self.controller.mixed_music_levels = {}
        self.live = False
        self.timings = {}
        self.task = None

    def status(self):
        result = {"group": self.group, "live": self.live}
        if self.group is not None:
            result["timings"] = self.timings
            result["level"] = self.level
        return result

    async def start(self, group, lights):
        self.group = group
        eligible = []
        skipped = []
        for key, light in lights.items():
            if not light or light["status"] == "unavailable":
                skipped.append(key)
                continue
            state = light["state"]
            if light["provider"] == "twinkly":
                _, identifier = json.loads(key)
                controller = self.controller
                async with controller.edit:
                    if (identifier not in controller.devices or identifier in controller.music
                            or identifier in controller.patterns or identifier in controller.physical_tests):
                        skipped.append(key)
                        continue
                    controller.music.add(identifier)
                    self.twinkly.add(identifier)
            elif light["capabilities"].get("rgb") and state.get("on") is True:
                if light["provider"] == "hue" and state.get("mirek") is not None:
                    restore = ("temperature", state["mirek"])
                elif (state.get("color") and any(state["color"])
                      and not state.get("color_temperature_kelvin")):
                    restore = ("color", state["color"])
                else:
                    skipped.append(key)
                    continue
                self.external[key] = (light, restore)
            else:
                skipped.append(key)
                continue
            eligible.append(key)
        if eligible:
            self.members = set(eligible)
            self.task = asyncio.create_task(self.run())
        else:
            self.group = None
        return {"eligible": eligible, "skipped": skipped}

    async def set_level(self, level):
        self.level = level
        self.controller.mixed_music_levels.update(dict.fromkeys(self.twinkly, level))
        targets = {}
        for key, (light, _) in self.external.items():
            initial = light["state"].get("brightness")
            if light["capabilities"].get("brightness") and type(initial) in (int, float) and 1 <= initial <= 100:
                targets[key] = (light, max(1, round(initial * level / 100)))
        self.brightness_changed.update(targets)
        results = await asyncio.gather(*(self.send(key, light, "brightness", brightness)
                                         for key, (light, brightness) in targets.items()))
        return dict(zip(targets, results))

    async def restore(self):
        keys = tuple(self.changed)
        results = await asyncio.gather(*(self.send(key, self.external[key][0], *self.external[key][1])
                                         for key in keys))
        for key, result in zip(keys, results):
            if result in {"accepted", "unconfirmed"}:
                self.changed.discard(key)
            else:
                LOG.warning("Could not restore the color of %s after mixed music", self.external[key][0]["name"])

    async def dispatch(self, color, received):
        started = time.monotonic()

        async def command(key, light):
            outcome = await self.send(key, light, "color", color)
            return light["provider"], outcome, round((time.monotonic() - started) * 1000)

        # Record attempted changes before awaiting I/O to cover cancellation.
        self.changed.update(self.external)
        results = await asyncio.gather(*(command(key, light) for key, (light, _) in self.external.items()))
        timings = {}
        for provider, outcome, elapsed in results:
            entry = timings.setdefault(provider, {"frame_age_ms": round(max(0, started - received) * 1000),
                                                 "command_ms": 0, "failed": 0})
            entry["command_ms"] = max(entry["command_ms"], elapsed)
            entry["failed"] += outcome not in ("accepted", "unconfirmed")
        self.timings = timings

    async def run(self):
        last_color = None
        smoothed = None
        last_lit = None
        while True:
            color = sample_color(self.controller.music_frame())
            now = time.monotonic()
            if color:
                last_lit = now
                self.live = True
                smoothed = color if smoothed is None else tuple(
                    (previous + 3 * current) / 4 for previous, current in zip(smoothed, color))
                outgoing = [min(255, (int(channel + 8) // 16) * 16) for channel in smoothed]
                if any(outgoing) and outgoing != last_color:
                    await self.dispatch(outgoing, self.controller.ddp.received)
                    last_color = outgoing
            elif last_lit is not None and now - last_lit >= 3:
                await self.restore()
                last_lit = last_color = smoothed = None
                self.live = False
            await asyncio.sleep(1)

    async def stop(self):
        if self.task:
            self.task.cancel()
            await asyncio.gather(self.task, return_exceptions=True)
        if self.twinkly:
            async with self.controller.edit:
                self.controller.music.difference_update(self.twinkly)
        await self.restore()
        for key in self.brightness_changed:
            light, _ = self.external[key]
            result = await self.send(key, light, "brightness", round(light["state"]["brightness"]))
            if result not in {"accepted", "unconfirmed"}:
                LOG.warning("Could not restore the brightness of %s after mixed music", light["name"])
        self.brightness_changed.clear()
        self.controller.mixed_music_levels.clear()
        self.level = 100
        self.task = None
        self.group = None
        self.members.clear()
        self.twinkly.clear()
        self.external.clear()
        self.changed.clear()
        self.timings = {}
        self.live = False
