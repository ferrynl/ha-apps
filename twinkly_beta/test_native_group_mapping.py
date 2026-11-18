import unittest
from types import SimpleNamespace
from app import Device

class NativeGroupMapping(unittest.TestCase):
    def test_combines_summary_and_sync(self):
        replies = {
            "summary": {"group": {"mode":"slave","uid":"group","name":"Muur"}},
            "led/movie/config": {"sync":{"mode":"slave","offset":420,"size":840}},
        }
        d = SimpleNamespace(native_group_until=0, native_group=None, api=replies.__getitem__)
        Device.load_native_group(d)
        self.assertEqual(d.native_group["id"], "group")
        self.assertEqual(d.native_group["offset"], 420)
        self.assertEqual(d.native_group["size"], 840)
