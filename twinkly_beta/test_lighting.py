import asyncio
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from aiohttp import web
from aiohttp.test_utils import TestClient, TestServer

from modules.lighting import light_key
from modules.provider_routes import install
from modules.provider_store import ProviderStore


class LightingTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.store = ProviderStore(temp.name)
        self.store.save({
            "version": 1,
            "hue": {"bridge": {"address": "192.168.1.2", "application_key": "private_key",
                               "certificate_sha256": "ab" * 32}},
            "govee": {"strip": {"address": "192.168.1.3"}, "silent": {"address": "192.168.1.4"}},
        })
        self.controller = SimpleNamespace(
            devices={"tree": SimpleNamespace(row={"name": "Tree"}, offline=False, mode="color",
                                             last_brightness=70, last_color=[255, 10, 0])},
            edit=asyncio.Lock(), music=set(), patterns={}, physical_tests={},
            music_frame=lambda: bytes([255, 2, 1, 0, 0, 0]),
            apply_control=AsyncMock(return_value={"failed": []}),
        )
        self.hue_id = "f735a5a7-819a-4bbf-89d4-e48b8c11db8c"
        self.twinkly = light_key("twinkly", "tree")
        self.hue = light_key("hue", "bridge", self.hue_id)
        self.govee = light_key("govee", "strip", "strip")
        self.silent = light_key("govee", "silent", "silent")
        for name, value in {
            "Hue.profiles": [{"id": self.hue_id, "name": "White Hue",
                              "capabilities": {"power": True, "rgb": False}, "state": {"on": True}}],
            "govee_statuses": {"192.168.1.3": {"onOff": 1, "color": {"r": 255, "g": 1, "b": 2}}},
            "Hue.control": None,
            "Govee.color": None,
            "Govee.power": None,
        }.items():
            patcher = patch("modules.provider_routes." + name, new=AsyncMock(return_value=value))
            setattr(self, name.split(".")[-1], patcher.start())
            self.addCleanup(patcher.stop)
        app = web.Application()
        install(app, self.store, self.controller)
        self.client = TestClient(TestServer(app))
        await self.client.start_server()
        self.addAsyncCleanup(self.client.close)

    async def test_normalized_inventory_and_redaction(self):
        response = await self.client.get("/lighting")
        self.assertNotIn("private_key", await response.text())
        self.assertNotIn("certificate_sha256", await response.text())
        data = await response.json()
        self.assertEqual(data["connections"]["hue"][0]["status"], "online")
        lights = {light["id"]: light for light in data["lights"]}
        self.assertEqual(lights[self.twinkly]["state"]["brightness"], 70)
        self.assertFalse(lights[self.hue]["capabilities"]["rgb"])
        self.assertTrue(lights[self.govee]["capabilities"]["rgb"])
        self.assertFalse(lights[self.govee]["verified"])
        self.assertEqual(lights[self.govee]["status"], "reported")
        self.assertEqual(lights[self.silent]["status"], "unknown")
        self.assertFalse(lights[self.silent]["capabilities"]["power"])

    async def test_cross_brand_group_gates_color_and_persists(self):
        response = await self.client.post("/lighting/groups", json={
            "name": "Wall", "members": [self.twinkly, self.hue, self.govee, self.silent, self.hue],
        })
        self.assertEqual(response.status, 200)
        group = (await response.json())["id"]
        self.assertEqual(ProviderStore(self.store.path.parent).load_groups()[group]["members"],
                         [self.twinkly, self.hue, self.govee, self.silent])
        response = await self.client.post("/lighting/control", json={
            "group": group, "action": "color", "value": [255, 10, 0],
        })
        self.assertEqual((await response.json())["results"], {
            self.twinkly: "accepted", self.hue: "skipped", self.govee: "unconfirmed", self.silent: "skipped",
        })
        self.controller.apply_control.assert_awaited_once_with(
            {"id": "tree", "action": "color", "value": "#ff0a00"})
        self.control.assert_not_awaited()
        self.color.assert_awaited_once_with([255, 10, 0])

        self.profiles.side_effect = TimeoutError
        response = await self.client.post("/lighting/groups", json={
            "id": group, "name": "Wall 2", "members": [self.twinkly, self.hue],
        })
        self.assertEqual(response.status, 200)
        response = await self.client.post("/lighting/control", json={"group": group, "action": "power", "value": False})
        self.assertEqual((await response.json())["results"], {self.twinkly: "accepted", self.hue: "skipped"})
        response = await self.client.post("/lighting/groups", json={"id": group, "delete": True})
        self.assertEqual(response.status, 200)
        self.assertEqual(self.store.load_groups(), {})

    async def test_hue_power_and_invalid_payloads(self):
        response = await self.client.post("/lighting/control", json={"id": self.hue, "action": "power", "value": True})
        self.assertEqual((await response.json())["results"], {self.hue: "accepted"})
        self.control.assert_awaited_once_with(self.hue_id, on=True)
        for payload in ([],
                        {"id": self.hue, "action": "brightness", "value": True},
                        {"id": self.hue, "action": "power", "value": 1}):
            response = await self.client.post("/lighting/control", json=payload)
            self.assertEqual(response.status, 400)

    async def test_hue_white_range_and_offline_lights_stay_on_home(self):
        profile = self.profiles.return_value[0]
        profile.update(status="online", temperature_mirek={"min": 153, "max": 500})
        profile["capabilities"]["temperature"] = True
        payload = {"id": self.hue, "action": "temperature", "value": 370}
        for value, outcome in ((370, "accepted"), (501, "skipped")):
            response = await self.client.post("/lighting/control", json={**payload, "value": value})
            self.assertEqual((await response.json())["results"], {self.hue: outcome})
        self.control.assert_awaited_once_with(self.hue_id, mirek=370)

        profile["status"] = "unavailable"
        response = await self.client.post("/lighting/control", json=payload)
        self.assertEqual((await response.json())["results"], {self.hue: "skipped"})
        self.profiles.side_effect = TimeoutError
        response = await self.client.get("/lighting")
        data = await response.json()
        self.assertEqual(data["connections"]["hue"][0]["status"], "unavailable")
        lights = {light["id"]: light for light in data["lights"]}
        self.assertEqual(lights[self.hue]["status"], "unavailable")
        self.control.assert_awaited_once()

    async def test_scene_applies_to_current_group_and_reports_each_command(self):
        group = "a" * 32
        self.store.save_groups({group: {"name": "Wall", "members": [self.twinkly]}})
        reply = await self.client.post("/lighting/scenes", json={
            "name": " Christmas Eve ", "group": group, "on": True,
            "brightness": 40, "color": [255, 10, 0],
        })
        self.assertEqual(reply.status, 200)
        scene = (await reply.json())["id"]
        self.assertEqual(ProviderStore(self.store.path.parent).load_scenes()[scene]["name"], "Christmas Eve")
        self.store.save_groups({group: {"name": "Wall", "members": [self.twinkly, self.hue, self.govee]}})
        reply = await self.client.post(f"/lighting/scenes/{scene}/apply")
        self.assertEqual(reply.status, 200)
        self.assertEqual((await reply.json())["results"], {
            self.twinkly: dict.fromkeys(("power", "color", "brightness"), "accepted"),
            self.hue: {"power": "accepted", "color": "skipped", "brightness": "skipped"},
            self.govee: {"power": "unconfirmed", "color": "unconfirmed", "brightness": "skipped"},
        })
        self.assertEqual([call.args[0]["action"] for call in self.controller.apply_control.await_args_list],
                         ["on", "color", "brightness"])

        self.store.save_groups({})
        reply = await self.client.post(f"/lighting/scenes/{scene}/apply")
        self.assertEqual(reply.status, 409)
        reply = await self.client.post("/lighting/scenes", json={"id": scene, "delete": True})
        self.assertEqual(reply.status, 200)
        self.assertEqual(self.store.load_scenes(), {})

    async def test_scene_rejects_invalid_input_and_off_only_sends_power(self):
        group = "a" * 32
        self.store.save_groups({group: {"name": "Wall", "members": [self.twinkly]}})
        payload = {"name": "Off", "group": group, "on": True}
        for change in ({"group": "missing"}, {"on": 1}, {"color": [0, 0, 0]}, {"brightness": 101}):
            response = await self.client.post("/lighting/scenes", json={**payload, **change})
            self.assertEqual(response.status, 400)
        reply = await self.client.post("/lighting/scenes", json={**payload, "on": False, "brightness": 20})
        self.assertEqual(reply.status, 200)
        scene = (await reply.json())["id"]
        reply = await self.client.post(f"/lighting/scenes/{scene}/apply")
        self.assertEqual((await reply.json())["results"], {self.twinkly: {"power": "accepted"}})
        self.controller.apply_control.assert_awaited_once_with({"id": "tree", "action": "off", "value": False})


    async def test_mixed_music_mirrors_and_restores_then_releases_twinkly(self):
        group = "a" * 32
        self.profiles.return_value[0]["capabilities"]["rgb"] = True
        self.profiles.return_value[0]["state"]["xy"] = {"x": 0.31, "y": 0.33}
        self.store.save_groups({group: {"name": "Wall", "members": [self.twinkly, self.hue, self.govee, self.silent]}})
        response = await self.client.post("/lighting/music", json={"group": group})
        self.assertEqual(response.status, 200)
        info = await response.json()
        self.assertEqual(info["eligible"], [self.twinkly, self.hue, self.govee])
        self.assertEqual(info["skipped"], [self.silent])
        self.assertEqual(self.controller.music, {"tree"})
        for _ in range(50):
            if self.control.await_count and self.color.await_count:
                break
            await asyncio.sleep(.01)
        self.control.assert_awaited_once_with(self.hue_id, color=[255, 0, 0])
        self.color.assert_awaited_once_with([255, 0, 0])
        response = await self.client.post("/lighting/music", json={"stop": True})
        self.assertEqual(await response.json(), {"group": None, "live": False})
        self.assertEqual(self.controller.music, set())
        self.assertEqual(self.control.await_count, 2)
        self.assertEqual(self.color.await_args.args, ([255, 1, 2],))
