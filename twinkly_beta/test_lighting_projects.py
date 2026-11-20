import asyncio
import base64
from io import BytesIO
import stat
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock

from aiohttp import ClientSession, web
from aiohttp.test_utils import TestClient, TestServer
from PIL import Image

from modules.lighting_projects import install
from modules.provider_store import ProviderStore

GROUP = "1" * 32
FIRST = "2" * 32
SECOND = "3" * 32
POINT = ['["hue","bridge","lamp"]', [50, 75]]
SHOW = {"name": "Kerst", "group": GROUP, "steps": [{"scene": FIRST, "seconds": 20},
                                                   {"scene": SECOND, "seconds": 1}]}


class LightingProjectsTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.store = ProviderStore(directory.name)
        self.lighting = SimpleNamespace(store=self.store, valid_show=lambda show: show["group"] == GROUP,
                                        run_scene=AsyncMock(return_value={"light": {"power": "accepted"}}))
        self.client = await self.connect()

    async def connect(self):
        app = web.Application(client_max_size=720_000)
        install(app, self.lighting)
        client = TestClient(TestServer(app))
        await client.start_server()
        self.addAsyncCleanup(client.close)
        return client

    async def change(self, action, **body):
        return await self.client.post("/lighting/projects", json={"action": action, **body})

    @staticmethod
    def image():
        out = BytesIO()
        exif = Image.Exif()
        exif[270] = "Private photo metadata"
        Image.new("RGB", (20, 10), "red").save(out, "JPEG", exif=exif)
        return base64.b64encode(out.getvalue()).decode("ascii")

    async def test_photo_and_shows_persist_with_private_permissions(self):
        saved = await self.change("save", **SHOW)
        self.assertEqual(saved.status, 200)
        self.assertEqual((await saved.json())["shows"][0]["steps"], SHOW["steps"])
        uploaded = await self.change("layout", revision=None, photo=self.image(), points=[POINT])
        self.assertEqual(uploaded.status, 200)
        layout = (await uploaded.json())["layout"]
        self.assertNotIn("photo", layout)
        self.assertTrue(layout["photo_version"])
        path = self.store.path.parent / "lighting-projects.json"
        self.assertEqual(stat.S_IMODE(path.stat().st_mode), 0o600)

        restarted = await self.connect()
        status = await restarted.get("/lighting/projects")
        self.assertIn("no-store", status.headers["Cache-Control"])
        data = await status.json()
        self.assertEqual(data["layout"]["points"], [POINT])
        self.assertEqual(data["shows"][0]["name"], "Kerst")
        photo = await restarted.get("/lighting/projects/photo")
        self.assertEqual(photo.content_type, "image/jpeg")
        self.assertIn("no-store", photo.headers["Cache-Control"])
        with Image.open(BytesIO(await photo.read())) as image:
            self.assertEqual(image.size, (20, 10))
            self.assertNotIn(270, image.getexif())

    async def test_rejected_photo_and_stale_revisions_leave_data_unchanged(self):
        invalid = await self.change("layout", revision=None, photo="abc", points=[])
        self.assertEqual(invalid.status, 400)
        self.assertEqual((await self.client.get("/lighting/projects/photo")).status, 404)
        uploaded = await self.change("layout", revision=None, photo=self.image(), points=[POINT])
        previous = (await uploaded.json())["layout"]
        stale = await self.change("layout", revision=None, points=[])
        self.assertEqual(stale.status, 409)
        moved = await self.change("layout", revision=previous["revision"], points=[])
        self.assertEqual((await moved.json())["layout"]["photo_version"], previous["photo_version"])
        saved = await self.change("save", **SHOW)
        show = (await saved.json())["shows"][0]
        changed = await self.change("save", **{**show, "name": "Updated"})
        self.assertEqual(changed.status, 200)
        stale = await self.change("delete", id=show["id"], revision=show["revision"])
        self.assertEqual(stale.status, 409)

    async def test_lamp_scale_is_validated_and_preserved_with_legacy_points(self):
        other = ['["twinkly","strings"]', [12, 55, 24]]
        layout = await self.change("layout", revision=None, photo=self.image(), points=[POINT, other])
        self.assertEqual(layout.status, 200)
        before = (await layout.json())["layout"]
        self.assertEqual(before["points"], [POINT, other])
        invalid = await self.change("layout", revision=before["revision"], points=[[other[0], [12, 55, 41]]])
        self.assertEqual(invalid.status, 400)
        status = await self.client.get("/lighting/projects")
        self.assertEqual((await status.json())["layout"], before)

    async def test_import_deduplicates_shows_and_preserves_existing_photo(self):
        data = {"shows": [SHOW], "photo": self.image(), "points": [POINT]}
        first = await self.change("import", **data)
        first_data = await first.json()
        self.assertTrue(first_data["imported_photo"])
        again = await self.change("import", **{**data, "points": []})
        again_data = await again.json()
        self.assertFalse(again_data["imported_photo"])
        self.assertEqual(again_data["shows"], first_data["shows"])
        self.assertEqual(again_data["layout"], first_data["layout"])

    async def test_playback_survives_client_disconnect_and_stops_between_steps(self):
        started = asyncio.Event()

        async def apply(scene, group):
            started.set()
            return {"light": {"power": "unconfirmed"}}

        self.lighting.run_scene.side_effect = apply
        result = await self.change("save", **SHOW)
        identifier = (await result.json())["shows"][0]["id"]
        async with ClientSession() as starter:
            async with starter.post(self.client.make_url("/lighting/projects"),
                                    json={"action": "play", "id": identifier}) as response:
                self.assertEqual(response.status, 200)
        await asyncio.wait_for(started.wait(), 2)
        status = await self.client.get("/lighting/projects")
        self.assertEqual((await status.json())["playback"]["state"], "playing")
        self.assertEqual((await self.change("play", id=identifier)).status, 409)
        await self.change("stop")
        for _ in range(30):
            status = await self.client.get("/lighting/projects")
            if (await status.json())["playback"]["state"] == "stopped":
                break
            await asyncio.sleep(0.01)
        else:
            self.fail("Show did not stop")
        self.lighting.run_scene.assert_awaited_once_with(FIRST, GROUP)
