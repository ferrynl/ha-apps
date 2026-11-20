"""Direct Hue CLIP v2 transport with caller-supplied verified TLS context."""
import re
import ssl
from aiohttp import ClientError, ClientSession, ClientTimeout, Fingerprint
from .common import lan_ip, rgb, brightness, RateGate
from .profiles import color_from_xy

def xy_color(value):
    r,g,b = [v/255 for v in rgb(value)]
    r,g,b = [((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in (r,g,b)]
    x = .664511*r+.154324*g+.162028*b
    y = .283881*r+.668433*g+.047685*b
    z = .000088*r+.072310*g+.986039*b
    total = x+y+z
    if not total:
        raise ValueError("Use off for black")
    return {"x":x/total,"y":y/total}

class Hue:
    def __init__(self, address, application_key, tls):
        if not isinstance(tls, Fingerprint) and (not isinstance(tls, ssl.SSLContext) or tls.verify_mode != ssl.CERT_REQUIRED or not tls.check_hostname):
            raise ValueError("Verified TLS context required")
        self.address = lan_ip(address)
        self.key = application_key
        self.tls = tls
        self.gate = RateGate(.15)
        self.last_profiles = []

    async def request(self, method, path, body=None):
        async def send():
            async with ClientSession(timeout=ClientTimeout(total=5)) as session:
                async with session.request(method, f"https://{self.address}/clip/v2/resource/{path}",
                    headers={"hue-application-key":self.key}, json=body, ssl=self.tls,
                    allow_redirects=False) as response:
                    response.raise_for_status()
                    data = await response.json()
                    if data.get("errors"):
                        raise RuntimeError("Hue rejected request")
                    return data.get("data", [])
        return await self.gate.run(send)

    async def lights(self):
        return await self.request("GET","light")

    async def profiles(self):
        from .profiles import hue_profiles
        lights = await self.lights()
        devices = await self.request("GET", "device")
        try:
            connectivity = await self.request("GET", "zigbee_connectivity")
        except (ClientError, OSError, TimeoutError, RuntimeError, ValueError):
            connectivity = []
        return hue_profiles(lights, devices, connectivity)

    async def control(self, light_id, *, on=None, level=None, color=None, mirek=None):
        if not re.fullmatch(r"[0-9a-fA-F-]{36}",light_id):
            raise ValueError("Invalid resource ID")
        body = {}
        if on is not None:
            if type(on) is not bool: raise ValueError("Invalid on state")
            body["on"] = {"on":on}
        if level is not None: body["dimming"] = {"brightness":brightness(level)}
        if color is not None: body["color"] = {"xy":xy_color(color)}
        if mirek is not None:
            if type(mirek) is not int or not 1 <= mirek <= 1000:
                raise ValueError("Invalid color temperature")
            body["color_temperature"] = {"mirek": mirek}
        if not body: raise ValueError("Empty command")
        return await self.request("PUT","light/"+light_id,body)

    async def collections(self):
        grouped_lights = {light["id"]: light for light in await self.request("GET", "grouped_light")}
        collections = []
        for kind in ("room", "zone"):
            for resource in await self.request("GET", kind):
                grouped_id = next((service["rid"] for service in resource.get("services", [])
                                   if service.get("rtype") == "grouped_light"), None)
                grouped_light = grouped_lights.get(grouped_id, {})
                collections.append({
                    "id": resource["id"],
                    "kind": kind,
                    "name": resource.get("metadata", {}).get("name") or resource["id"],
                    "grouped_light": grouped_id if grouped_light else None,
                    "on": grouped_light.get("on", {}).get("on"),
                    "brightness": grouped_light.get("dimming", {}).get("brightness"),
                    "scenes": [],
                })

        by_group = {(entry["kind"], entry["id"]): entry for entry in collections}
        for scene in await self.request("GET", "scene"):
            group = scene.get("group", {})
            entry = by_group.get((group.get("rtype"), group.get("rid")))
            if entry is not None:
                info = {"id": scene["id"], "name": scene.get("metadata", {}).get("name") or scene["id"]}
                palette = []
                for target in scene.get("actions", ()):
                    action = target.get("action", {})
                    if action.get("on", {}).get("on") is False:
                        continue
                    color = color_from_xy(action.get("color", {}).get("xy"))
                    if color and color not in palette:
                        palette.append(color)
                    if len(palette) == 5:
                        break
                if palette:
                    info["palette"] = palette
                entry["scenes"].append(info)
        return collections

    async def control_collection(self, resource_id, action, value=None):
        if not isinstance(resource_id, str) or not re.fullmatch(
            r"[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}", resource_id
        ):
            raise ValueError("Invalid resource ID")
        if action == "recall" and value is None:
            return await self.request("PUT", "scene/" + resource_id, {"recall": {"action": "active"}})
        if action == "power" and type(value) is bool:
            body = {"on": {"on": value}}
        elif action == "brightness":
            body = {"dimming": {"brightness": brightness(value)}}
        else:
            raise ValueError("Invalid command")
        return await self.request("PUT", "grouped_light/" + resource_id, body)
