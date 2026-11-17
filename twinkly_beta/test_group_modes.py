import unittest
from types import SimpleNamespace
from app import Controller, PIXELS

class GroupModes(unittest.TestCase):
    def setUp(self):
        self.controller = Controller.__new__(Controller)
        self.controller.devices = {
            k: SimpleNamespace(row={"leds": 2}, layout={"points": [[0, 0, 0, 0], [1, .9, .9, 0]]})
            for k in ("a", "b")
        }

    def test_sync(self):
        self.assertIsNone(self.controller.group_mapping("a", ["a", "b"], "sync"))

    def test_join(self):
        a = self.controller.group_mapping("a", ["a", "b"], "join")
        b = self.controller.group_mapping("b", ["a", "b"], "join")
        self.assertEqual(a+b, tuple(3*i*PIXELS//4 for i in range(4)))

    def test_area(self):
        a = self.controller.group_mapping("a", ["a", "b"], "area")
        b = self.controller.group_mapping("b", ["a", "b"], "area")
        self.assertEqual(a, (0, 339))
        self.assertEqual(b, (18, 357))
