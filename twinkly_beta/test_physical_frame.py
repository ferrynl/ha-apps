import unittest
from app import Controller

class PhysicalFrames(unittest.TestCase):
    def test_identification(self):
        for i,rgb in enumerate([(90,0,0),(0,90,0),(0,0,90),(90,90,0)]):
            self.assertEqual(Controller.physical_frame("identify",i,[(0,0,0)]*210,0),bytes(rgb)*210)

    def test_axes(self):
        coords=[(0,1,0),(1,0,0)]
        self.assertEqual(Controller.physical_frame("horizontal",0,coords,0),bytes([90]*3+[0]*3))
        self.assertEqual(Controller.physical_frame("vertical",0,coords,0),bytes([0]*3+[90]*3))

    def test_led_order(self):
        self.assertEqual(Controller.physical_frame("led",0,[(0,0,0)]*2,.125),bytes([0]*3+[90]*3))
