"""Optional Home Assistant light provider bridge. No Twinkly dependency."""
import asyncio
import os
import re
from aiohttp import ClientSession, ClientTimeout, ClientError, web

ENTITY = re.compile(r"light\.[a-z0-9_]+")
BRANDS = {"hue", "govee"}

def command(data):
    if not isinstance(data, dict):
        raise ValueError("Invalid command")
    entity = data.get("entity")
    action = data.get("action")
    if not isinstance(entity, str) or not ENTITY.fullmatch(entity):
        raise ValueError("Invalid light entity")
    if action not in ("turn_on", "turn_off"):
        raise ValueError("Invalid action")
    payload = {"entity_id": entity}
    if action == "turn_on":
        if "brightness_pct" in data:
            value = data["brightness_pct"]
            if type(value) is not int or not 1 <= value <= 100:
                raise ValueError("Invalid brightness")
            payload["brightness_pct"] = value
        if "rgb_color" in data:
            rgb = data["rgb_color"]
            if not isinstance(rgb, list) or len(rgb) != 3 or any(type(x) is not int or not 0 <= x <= 255 for x in rgb):
                raise ValueError("Invalid colour")
            payload["rgb_color"] = rgb
    return action, payload

async def ha(method, path, payload=None):
    token = os.environ.get("SUPERVISOR_TOKEN")
    if not token:
        raise web.HTTPServiceUnavailable(text="Home Assistant API unavailable")
    try:
        async with ClientSession(timeout=ClientTimeout(total=8)) as session:
            async with session.request(method, "http://supervisor/core/api/" + path,
                headers={"Authorization": "Bearer " + token}, json=payload,
                allow_redirects=False) as response:
                if response.status >= 300:
                    raise web.HTTPBadGateway(text="Home Assistant rejected request")
                return await response.json()
    except (ClientError, asyncio.TimeoutError, ValueError):
        raise web.HTTPBadGateway(text="Home Assistant unavailable")

async def lights(request):
    states = await ha("GET", "states")
    return web.json_response([{"entity": s["entity_id"], "name": s.get("attributes", {}).get("friendly_name", s["entity_id"]),
        "state": s["state"], "modes": s.get("attributes", {}).get("supported_color_modes", [])}
        for s in states if ENTITY.fullmatch(s.get("entity_id", ""))])

async def control(request):
    try:
        action, payload = command(await request.json())
    except (ValueError, TypeError):
        raise web.HTTPBadRequest(text="Invalid light command")
    await ha("POST", "services/light/" + action, payload)
    return web.json_response({"ok": True})

async def page(request):
    if request.match_info["brand"] not in BRANDS:
        raise web.HTTPNotFound()
    return web.FileResponse("provider_lights.html", headers={"Cache-Control":"no-store"})

def register(app):
    app.router.add_get("/providers/{brand}", page)
    app.router.add_get("/provider-lights", lights)
    app.router.add_post("/provider-control", control)
