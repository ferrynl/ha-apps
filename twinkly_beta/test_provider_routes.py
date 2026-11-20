import unittest
import tempfile
from unittest.mock import AsyncMock, patch
from aiohttp import web
from aiohttp.test_utils import TestClient, TestServer
from modules.provider_routes import install
from modules.provider_store import ProviderStore

class RouteTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.store=ProviderStore(self.temp.name)
        app=web.Application()
        install(app,self.store)
        self.client=TestClient(TestServer(app))
        await self.client.start_server()
        self.addAsyncCleanup(self.client.close)
    async def test_configured(self):
        r=await self.client.get("/providers/configured")
        self.assertEqual(await r.json(),{"hue":{},"govee":{}})
    async def test_unknown(self):
        r=await self.client.post("/providers/other/discover",json={})
        self.assertEqual(r.status,404)
    async def test_empty_inventory(self):
        r=await self.client.get("/providers/hue/inventory")
        self.assertEqual(await r.json(),{"devices":[]})
    async def test_secret_redaction(self):
        self.store.save({"version":1,"govee":{},"hue":{"a":{"address":"192.168.1.2","application_key":"abcdefghij","certificate_sha256":"ab"*32}}})
        r=await self.client.get("/providers/configured")
        self.assertNotIn("abcdefghij",await r.text())
    async def test_govee_inventory(self):
        self.store.save({"version":1,"hue":{},"govee":{"a":{"address":"192.168.1.2"}}})
        r=await self.client.get("/providers/govee/inventory")
        self.assertEqual((await r.json())["devices"][0]["status"],"unknown")

    async def test_connect_govee(self):
        r=await self.client.post("/providers/govee/connect",json={"id":"test","address":"192.168.1.4"})
        self.assertEqual(r.status,200)
        self.assertEqual(self.store.load()["govee"]["test"]["address"],"192.168.1.4")
    async def test_connect_public_ip_rejected(self):
        r=await self.client.post("/providers/govee/connect",json={"id":"test","address":"8.8.8.8"})
        self.assertEqual(r.status,400)
        self.assertEqual(self.store.load()["govee"],{})
    async def test_hue_pairing_button(self):
        with patch("modules.provider_routes.pair",new=AsyncMock(side_effect=PermissionError)):
            r=await self.client.post("/providers/hue/connect",json={"id":"bridge","address":"192.168.1.4","certificate_sha256":"ab"*32})
        self.assertEqual(r.status,409)
        self.assertEqual(self.store.load()["hue"],{})
    async def test_hue_pairing_redacts_credentials(self):
        with patch("modules.provider_routes.pair",new=AsyncMock(return_value={"application_key":"abcdefghij","client_key":None})):
            r=await self.client.post("/providers/hue/connect",json={"id":"bridge","address":"192.168.1.4","certificate_sha256":"ab"*32})
        self.assertEqual(r.status,200)
        self.assertNotIn("abcdefghij",await r.text())
        self.assertEqual(self.store.load()["hue"]["bridge"]["application_key"],"abcdefghij")
    async def test_govee_control_unconfirmed(self):
        self.store.save({"version":1,"hue":{},"govee":{"test":{"address":"192.168.1.4"}}})
        with patch("modules.provider_routes.Govee.power",new=AsyncMock()) as send:
            r=await self.client.post("/providers/govee/control",json={"id":"test","action":"power","value":True})
            send.assert_awaited_once_with(True)
        self.assertEqual(await r.json(),{"ok":True,"confirmed":False})
    async def test_unknown_device_control(self):
        r=await self.client.post("/providers/govee/control",json={"id":"missing","action":"power","value":True})
        self.assertEqual(r.status,400)
    async def test_unknown_action(self):
        self.store.save({"version":1,"hue":{},"govee":{"test":{"address":"192.168.1.4"}}})
        r=await self.client.post("/providers/govee/control",json={"id":"test","action":"unknown","value":True})
        self.assertEqual(r.status,400)
    async def test_invalid_brightness(self):
        self.store.save({"version":1,"hue":{},"govee":{"test":{"address":"192.168.1.4"}}})
        r=await self.client.post("/providers/govee/control",json={"id":"test","action":"brightness","value":101})
        self.assertEqual(r.status,400)

    async def test_certificate_inspection_is_unverified(self):
        with patch("modules.provider_routes.inspect_certificate",new=AsyncMock(return_value="ab"*32)) as inspect:
            r=await self.client.post("/providers/hue/certificate",json={"address":"192.168.1.4"})
            inspect.assert_awaited_once_with("192.168.1.4")
        self.assertEqual(await r.json(),{"certificate_sha256":"ab"*32,"verified":False})
        self.assertEqual(self.store.load()["hue"],{})
    async def test_certificate_public_address_rejected(self):
        with patch("modules.provider_routes.inspect_certificate",new=AsyncMock()) as inspect:
            r=await self.client.post("/providers/hue/certificate",json={"address":"8.8.8.8"})
            inspect.assert_not_awaited()
        self.assertEqual(r.status,400)

    async def test_hue_collections_report_rooms_zones_and_scenes_per_bridge(self):
        self.store.save({"version": 1, "govee": {}, "hue": {
            name: {"address": address, "application_key": "abcdefghij", "certificate_sha256": "ab" * 32}
            for name, address in [("first", "192.168.1.2"), ("offline", "192.168.1.3")]
        }})
        resources = {
            "room": [{"id": "room", "metadata": {"name": "Woonkamer"},
                      "services": [{"rtype": "grouped_light", "rid": "room-control"}]}],
            "zone": [{"id": "zone", "metadata": {"name": "Kersthoek"}}],
            "grouped_light": [{"id": "room-control", "on": {"on": True}, "dimming": {"brightness": 42}}],
            "scene": [{"id": "scene", "metadata": {"name": "Avondlicht"},
                       "group": {"rtype": "zone", "rid": "zone"}}],
        }

        async def request(client, method, resource):
            if client.address == "192.168.1.3":
                raise TimeoutError()
            self.assertEqual(method, "GET")
            return resources[resource]

        with patch("modules.hue.Hue.request", autospec=True, side_effect=request):
            response = await self.client.get("/providers/hue/collections")
        self.assertEqual(response.status, 200)
        self.assertEqual((await response.json())["bridges"], [
            {"id": "first", "status": "online", "address": "192.168.1.2", "collections": [
                {"id": "room", "kind": "room", "name": "Woonkamer", "grouped_light": "room-control",
                 "on": True, "brightness": 42, "scenes": []},
                {"id": "zone", "kind": "zone", "name": "Kersthoek", "grouped_light": None,
                 "on": None, "brightness": None, "scenes": [{"id": "scene", "name": "Avondlicht"}]},
            ]},
            {"id": "offline", "status": "unavailable", "address": "192.168.1.3", "collections": []},
        ])

    async def test_hue_collection_actions_use_native_resource_commands(self):
        self.store.save({"version": 1, "govee": {}, "hue": {
            "bridge": {"address": "192.168.1.2", "application_key": "abcdefghij", "certificate_sha256": "ab" * 32},
        }})
        resource = "00000000-0000-4000-8000-000000000001"
        cases = [
            ("power", False, "grouped_light", {"on": {"on": False}}),
            ("brightness", 42, "grouped_light", {"dimming": {"brightness": 42}}),
            ("recall", None, "scene", {"recall": {"action": "active"}}),
        ]
        with patch("modules.hue.Hue.request", new=AsyncMock()) as send:
            for action, value, kind, payload in cases:
                response = await self.client.post("/providers/hue/collections/control", json={
                    "bridge": "bridge", "id": resource, "action": action, "value": value,
                })
                self.assertEqual(response.status, 200)
                send.assert_awaited_once_with("PUT", f"{kind}/{resource}", payload)
                send.reset_mock()
            response = await self.client.post("/providers/hue/collections/control", json={
                "bridge": "bridge", "id": "../resource", "action": "recall",
            })
            self.assertEqual(response.status, 400)
            send.assert_not_awaited()
