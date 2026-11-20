"""Local JPEG covers for Hue scenes."""
import asyncio
import base64
from hashlib import sha256
from io import BytesIO
from pathlib import Path
import re
from tempfile import NamedTemporaryFile

from aiohttp import web
from PIL import Image


MAX_BYTES = 160_000
MAX_IMAGES = 128


def scene_image_path(directory, bridge, scene):
    if not re.fullmatch(r"[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}", scene):
        raise ValueError("Invalid Hue scene identifier")
    name = sha256((bridge + ":" + scene.lower()).encode()).hexdigest()
    return directory / (name + ".jpg")


def encode_image(raw):
    if not 4 <= len(raw) <= MAX_BYTES:
        raise ValueError("Invalid image size")
    with Image.open(BytesIO(raw), formats=["JPEG"]) as image:
        if not 1 <= min(image.size) <= max(image.size) <= 480:
            raise ValueError("Invalid image dimensions")
        output = BytesIO()
        image.convert("RGB").save(output, "JPEG", quality=85)
        if output.tell() > MAX_BYTES:
            raise ValueError("Image too large")
        return output.getvalue()


def install(app, store):
    directory = store.path.parent / "hue-scene-images"
    write_lock = asyncio.Lock()
    headers = {"Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff"}

    def path_for(request):
        bridge, scene = request.match_info["bridge"], request.match_info["scene"]
        try:
            if bridge in store.load()["hue"]:
                return scene_image_path(directory, bridge, scene)
        except ValueError:
            pass
        raise web.HTTPNotFound()

    async def read(request):
        path = path_for(request)
        if not path.is_file():
            raise web.HTTPNotFound()
        return web.FileResponse(path, headers=headers)

    async def write(request):
        path = path_for(request)
        try:
            data = await request.json()
            encoded = data["image"]
            raw = None if encoded is None else await asyncio.to_thread(
                encode_image, base64.b64decode(encoded, validate=True)
            )
        except (ValueError, TypeError, KeyError, OSError, Image.DecompressionBombError) as error:
            raise web.HTTPBadRequest() from error

        async with write_lock:
            if raw is None:
                path.unlink(missing_ok=True)
            else:
                directory.mkdir(mode=0o700, exist_ok=True)
                if not path.exists() and sum(1 for _ in directory.glob("*.jpg")) >= MAX_IMAGES:
                    raise web.HTTPConflict()
                with NamedTemporaryFile(dir=directory, delete=False) as temp:
                    temporary = Path(temp.name)
                    try:
                        temp.write(raw)
                        temp.close()
                        temporary.replace(path)
                    finally:
                        temporary.unlink(missing_ok=True)
        return web.json_response({"ok": True})

    app.router.add_get("/providers/hue/scene-image/{bridge}/{scene}", read)
    app.router.add_post("/providers/hue/scene-image/{bridge}/{scene}", write)
    return directory
