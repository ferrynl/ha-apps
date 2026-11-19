import unittest
from light_providers import command
class ProviderTests(unittest.TestCase):
    def test_on(self):
        self.assertEqual(command({"entity":"light.hue","action":"turn_on","rgb_color":[255,0,0]})[1]["rgb_color"],[255,0,0])
    def test_invalid(self):
        for data in [{"entity":"switch.test","action":"turn_on"},{"entity":"light.test","action":"delete"},{"entity":"light.test","action":"turn_on","brightness_pct":True},{"entity":"light.test","action":"turn_on","rgb_color":[256,0,0]}]:
            with self.assertRaises(ValueError): command(data)
    def test_off(self):
        self.assertEqual(command({"entity":"light.govee","action":"turn_off"})[1],{"entity_id":"light.govee"})
