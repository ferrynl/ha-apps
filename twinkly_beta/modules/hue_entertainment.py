"""Server-side Hue Entertainment effects using a paired Bridge."""
import asyncio
import colorsys
import logging
import math
import uuid

from aiohttp import ClientError

RESOURCE = "entertainment_configuration"
BRIDGE_ERRORS = (ClientError, OSError, RuntimeError, ValueError)
EFFECTS = {"rainbow", "sunset"}
LOGGER = logging.getLogger(__name__)


class EntertainmentError(Exception):
    def __init__(self, code, status):
        super().__init__(code)
        self.code = code
        self.status = status


def channel_ids(area):
    return sorted({channel["channel_id"] for channel in area.get("channels", [])
                   if type(channel.get("channel_id")) is int
                   and 0 <= channel["channel_id"] <= 255})


def effect_frame(effect, elapsed, channels, brightness):
    from hue_entertainment import LightColorCommand

    level = 65535 * brightness / 100
    commands = []
    for index, channel in enumerate(channels):
        position = index / len(channels)
        if effect == "rainbow":
            color = colorsys.hsv_to_rgb((elapsed / 12 + position) % 1, 1, 1)
        else:
            wave = (1 + math.sin(elapsed * math.tau / 8 + position * math.tau)) / 2
            color = (0.65 + 0.35 * wave, 0.10 + 0.30 * wave, 0.025 + 0.10 * (1 - wave))
        red, green, blue = (round(component * level) for component in color)
        commands.append(LightColorCommand(channel, red, green, blue))
    return commands


def new_streamer():
    from hue_entertainment import HueDtlsStreamer

    return HueDtlsStreamer()


class HueEntertainment:
    def __init__(self, streamer_factory=new_streamer):
        self.streamer_factory = streamer_factory
        self.active = None
        self.error = None
        self.task = None
        self.stop_event = asyncio.Event()

    @property
    def active_bridge(self):
        return self.active["bridge"] if self.active else None

    def status(self):
        return {"active": self.active, "error": self.error}

    async def areas(self, identifier, record, hue):
        result = {"bridge": identifier, "address": record["address"],
                  "has_client_key": bool(record.get("client_key")), "areas": []}
        try:
            resources = await hue.request("GET", RESOURCE)
        except BRIDGE_ERRORS:
            return {**result, "unavailable": True}
        for area in resources:
            if not channel_ids(area):
                continue
            name = (area.get("metadata") or {}).get("name") or area.get("name") or area["id"]
            result["areas"].append({"id": area["id"], "name": name,
                                    "busy": area.get("status") == "active"})
        return result

    async def start(self, identifier, record, hue, area_id, effect, brightness):
        if self.active:
            raise EntertainmentError("busy", 409)
        if not record.get("client_key"):
            raise EntertainmentError("pair_again", 409)
        if (not isinstance(area_id, str) or str(uuid.UUID(area_id)) != area_id
                or not isinstance(effect, str) or effect not in EFFECTS
                or type(brightness) is not int or not 1 <= brightness <= 100):
            raise ValueError("Invalid Hue effect settings")
        self.error = None
        resources = await hue.request("GET", RESOURCE)
        area = next((resource for resource in resources if resource.get("id") == area_id), None)
        if area is None or not (channels := channel_ids(area)):
            raise EntertainmentError("missing_area", 404)
        if any(resource.get("status") == "active" for resource in resources):
            raise EntertainmentError("busy", 409)

        path = RESOURCE + "/" + area_id
        streamer = self.streamer_factory()
        await hue.request("PUT", path, {"action": "start"})
        try:
            connect = asyncio.create_task(asyncio.to_thread(
                streamer.connect, record["address"], record["application_key"],
                record["client_key"], area_id,
            ))
            try:
                await asyncio.shield(connect)
            except asyncio.CancelledError:
                await asyncio.gather(connect, return_exceptions=True)
                raise
            if not streamer.is_connected:
                raise RuntimeError("Hue DTLS handshake failed")
        except BaseException:
            await self.release(hue, path, streamer)
            raise

        self.active = {"bridge": identifier, "area": area_id, "effect": effect,
                       "brightness": brightness}
        self.stop_event.clear()
        self.task = asyncio.create_task(self.run(hue, path, streamer, effect, brightness, channels))

    async def run(self, hue, path, streamer, effect, brightness, channels):
        loop = asyncio.get_running_loop()
        started = loop.time()
        try:
            while not self.stop_event.is_set():
                if not streamer.is_connected:
                    raise RuntimeError("Hue stream disconnected")
                streamer.send_colors(effect_frame(effect, loop.time() - started, channels, brightness))
                try:
                    await asyncio.wait_for(self.stop_event.wait(), 1 / 25)
                except TimeoutError:
                    pass
        except Exception:
            self.error = "stream_lost"
            LOGGER.warning("Hue Entertainment stream ended unexpectedly")
        finally:
            try:
                await self.release(hue, path, streamer)
            finally:
                self.active = None

    async def release(self, hue, path, streamer):
        try:
            await asyncio.to_thread(streamer.disconnect)
        finally:
            try:
                await hue.request("PUT", path, {"action": "stop"})
            except BRIDGE_ERRORS:
                self.error = "stop_failed"
                LOGGER.warning("Hue Entertainment Bridge did not confirm stop")

    async def stop(self):
        if self.task:
            self.stop_event.set()
            await asyncio.shield(self.task)
            self.task = None

    async def cleanup(self, app):
        yield
        await self.stop()
