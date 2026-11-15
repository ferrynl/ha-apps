import base64
import io
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from aiohttp import web
from PIL import Image

from app import Controller


class EffectPreviewTests(unittest.IsolatedAsyncioTestCase):
    async def test_gif_keeps_animation_and_follows_movie_uuid(self):
        controller = Controller.__new__(Controller)
        effect = {"kind": "movie", "id": 1, "name": "Peachy", "unique_id": "movie-a"}
        controller.devices = {"lamp": SimpleNamespace(effects=[effect])}
        with tempfile.TemporaryDirectory() as folder, patch("app.IMAGES", Path(folder)):
            frames = [Image.new("RGB", (4, 4), color) for color in ("red", "blue")]
            content = io.BytesIO()
            frames[0].save(content, format="GIF", save_all=True, append_images=frames[1:], duration=100)
            original = content.getvalue()
            path = controller.effect_gif_path("lamp", effect)
            query = {"id": "lamp", "kind": "movie", "index": "1", "ref": path.stem}

            async def body():
                return {"image": base64.b64encode(original).decode()}

            response = await controller.effect_image(SimpleNamespace(query=query, method="POST", json=body))
            self.assertEqual(response.status, 200)
            self.assertEqual(path.read_bytes(), original)
            with Image.open(path) as image:
                self.assertEqual(image.n_frames, 2)

            effect["id"] = 4
            query["index"] = "4"
            self.assertIsInstance(await controller.effect_image(SimpleNamespace(query=query, method="GET")), web.FileResponse)
            effect["unique_id"] = "different-movie"
            with self.assertRaises(web.HTTPNotFound):
                await controller.effect_image(SimpleNamespace(query=query, method="GET"))

    def test_name_prevents_reuse_of_unidentified_movie_slot(self):
        first = {"kind": "movie", "id": 1, "name": "Flare"}
        second = dict(first, name="Showtime")
        self.assertNotEqual(Controller.effect_gif_path("lamp", first), Controller.effect_gif_path("lamp", second))
