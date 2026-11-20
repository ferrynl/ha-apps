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
    return [min(255, (channel + 8) // 16 * 16) for channel in pixel] if max(pixel) >= 8 else None


class MixedMusic:
    def __init__(self, controller, send):
        self.controller = controller
        self.send = send
        self.group = None
        self.members = set()
        self.twinkly = set()
        self.external = {}
        self.changed = set()
        self.live = False
        self.task = None

    def status(self):
        return {"group": self.group, "live": self.live}

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

    async def restore(self):
        keys = tuple(self.changed)
        results = await asyncio.gather(*(self.send(key, self.external[key][0], *self.external[key][1])
                                         for key in keys))
        for key, result in zip(keys, results):
            if result in {"accepted", "unconfirmed"}:
                self.changed.discard(key)
            else:
                LOG.warning("Could not restore the color of %s after mixed music", self.external[key][0]["name"])

    async def run(self):
        last_color = None
        last_lit = None
        while True:
            color = sample_color(self.controller.music_frame())
            now = time.monotonic()
            if color:
                last_lit = now
                self.live = True
                if color != last_color:
                    # Record attempted changes before awaiting I/O so Stop also
                    # repairs writes that finished as cancellation arrived.
                    self.changed.update(self.external)
                    await asyncio.gather(*(self.send(key, light, "color", color)
                                           for key, (light, _) in self.external.items()))
                    last_color = color
            elif last_lit is not None and now - last_lit >= 3:
                await self.restore()
                last_lit = last_color = None
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
        self.task = None
        self.group = None
        self.members.clear()
        self.twinkly.clear()
        self.external.clear()
        self.changed.clear()
        self.live = False
