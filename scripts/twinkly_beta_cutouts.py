"""Generate transparent PNG cutouts from the verified Twinkly reference photos."""
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image
from rembg import new_session, remove

PRODUCT_PHOTO_URLS = {
    "c9-bulbs": "https://twinkly.com/cdn/shop/files/TWC9040STP_Packaging.png?v=1756727766&width=480",
    "cluster-gold-silver": "https://twinkly.com/cdn/shop/files/TWC400GOP-BEU_Out-of-the-box.jpg?v=1757667667&width=480",
    "cluster-multicolor": "https://twinkly.com/cdn/shop/files/TWC400STP-BEU_Out-of-the-box.jpg?v=1757667667&width=480",
    "cluster-multicolor-white": "https://twinkly.com/cdn/shop/files/TWC400SPP-BEU.png?v=1794654897&width=480",
    "curtain": "https://twinkly.com/cdn/shop/files/curtain-rgb-210-clear-eu.png?v=1794406032&width=480",
    "curtain-rgbw": "https://twinkly.com/cdn/shop/files/curtain-rgbw-210-clear-eu.png?v=1794405992&width=480",
    "dots": "https://twinkly.com/cdn/shop/files/TWD060STP-B_Packaging.png?v=1756728081&width=480",
    "festoon-gold-silver": "https://twinkly.com/cdn/shop/files/TWF020GOP-BEU_Out-of-the-box.jpg?v=1757667667&width=480",
    "festoon-multicolor": "https://twinkly.com/cdn/shop/files/TWF020STP-BEU_Out-of-the-box.jpg?v=1757667668&width=480",
    "flex": "https://twinkly.com/cdn/shop/files/TWFL200STW-WEU_Out-of-the-box.jpg?v=1757667667&width=480",
    "icicle-gold-silver": "https://twinkly.com/cdn/shop/files/TWI190GOP-TEU_Out-of-the-box.jpg?v=1757667666&width=480",
    "icicle-multicolor": "https://twinkly.com/cdn/shop/files/TWI190STP-TEU_Out-of-the-box.jpg?v=1757667668&width=480",
    "icicle-multicolor-white": "https://twinkly.com/cdn/shop/files/TWI190SPP-TEU_Out-of-the-box.jpg?v=1757667666&width=480",
    "light-tree": "https://twinkly.com/cdn/shop/files/TWP300SPP-BEU_Out-of-the-box.jpg?v=1757926381&width=480",
    "light-tree-2d": "https://twinkly.com/cdn/shop/files/TWWT050SPP-BEU_Out-of-the-box.jpg?v=1757926381&width=480",
    "lightwall": "https://twinkly.com/cdn/shop/files/TWDJ1120STP-BEU_Out-of-the-box_2023.jpg?v=1760362206&width=480",
    "line": "https://twinkly.com/cdn/shop/files/TWL100STW-BEU_Out-of-the-box.jpg?v=1757667667&width=480",
    "matrix": "https://twinkly.com/cdn/shop/files/TWW500STP-TEU.png?v=1794656780&width=480",
    "net-lights": "https://twinkly.com/cdn/shop/files/TWN240RGB_Packaging.png?v=1756728820&width=480",
    "permanent-lights": "https://twinkly.com/cdn/shop/files/TWPL072STP_Packaging.png?v=1756728937&width=480",
    "pre-lit-garland": "https://twinkly.com/cdn/shop/files/GT90P4425P0X_Packshot.jpg?v=1757925629&width=480",
    "pre-lit-tree": "https://twinkly.com/cdn/shop/files/TG50P4425P00_Packshot.jpg?v=1757925984&width=480",
    "pre-lit-wreath": "https://twinkly.com/cdn/shop/files/GD20P4425P0X_Packshot.jpg?v=1757925816&width=480",
    "reindeers": "https://twinkly.com/cdn/shop/files/TW3RD140SPP_Packshot.jpg?v=1757932442&width=480",
    "spheres": "https://twinkly.com/cdn/shop/files/TW3DB200SPP_Packshot.jpg?v=1762846497&width=480",
    "spritzer": "https://twinkly.com/cdn/shop/files/TWB200STP_Packaging.png?v=1757925078&width=480",
    "squares": "https://twinkly.com/cdn/shop/files/TWQ064STW-07-BEU_Out-of-the-box.jpg?v=1757667666&width=480",
    "strings-gold-silver": "https://twinkly.com/cdn/shop/files/strings-gold-silver-250-eu.png?v=1794408486&width=480",
    "strings-hd": "https://twinkly.com/cdn/shop/files/strings-hd-500-green-eu.png?v=1794405457&width=480",
    "strings-multicolor": "https://twinkly.com/cdn/shop/files/strings-750-eu_2de0f16d-95cf-4fe8-affe-20662b81cfa8.png?v=1794406879&width=480",
    "strings-rgbw": "https://twinkly.com/cdn/shop/files/TWS250SPP-BEU_Out-of-the-box.jpg?v=1769612111&width=480",
    "strings-usb-c-candles": "https://twinkly.com/cdn/shop/files/candies-candles-100-clear_77a61a0e-5cf1-44a0-ae9f-5af53f095e9e.png?v=1794320059&width=480",
    "strings-usb-c-hearts": "https://twinkly.com/cdn/shop/files/TWKH100RGB-T_Packaging.png?v=1756975341&width=480",
    "strings-usb-c-pearls": "https://twinkly.com/cdn/shop/files/TWKP100RGB-G_Packaging.png?v=1769612261&width=480",
    "strings-usb-c-stars": "https://twinkly.com/cdn/shop/files/TWKS100RGB-T_Packaging.png?v=1756975395&width=480",
    "tree-topper": "https://help.twinkly.com/hc/article_attachments/21539036626973",
}
DESTINATION = Path("twinkly_beta/product_photos")


def make_cutout(key, url, session):
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=25) as response:
        raw = response.read(2_000_001)
    if len(raw) > 2_000_000:
        raise ValueError(f"{key}: source image is too large")

    with Image.open(BytesIO(raw)) as original:
        source = original.convert("RGBA")
    source.thumbnail((480, 480), Image.Resampling.LANCZOS)
    alpha = source.getchannel("A")
    if alpha.getextrema() == (255, 255):
        alpha = remove(source.convert("RGB"), session=session, only_mask=True)
    alpha = alpha.point(lambda value: 0 if value < 24 else value)
    opaque = alpha.histogram()[224:]
    bbox = alpha.getbbox()
    if bbox is None or sum(opaque) < alpha.width * alpha.height * 0.005:
        raise ValueError(f"{key}: cutout has no usable foreground")
    if alpha.histogram()[0] < alpha.width * alpha.height * 0.05:
        raise ValueError(f"{key}: cutout still has an opaque background")

    source.putalpha(alpha)
    cropped = source.crop(bbox)
    canvas = Image.new("RGBA", (cropped.width + 16, cropped.height + 16))
    canvas.paste(cropped, (8, 8))
    canvas.save(DESTINATION / f"{key}.png", optimize=True)
    print(f"{key}: {canvas.width}x{canvas.height}", flush=True)


if __name__ == "__main__":
    DESTINATION.mkdir(exist_ok=True)
    session = new_session("isnet-general-use", providers=["CPUExecutionProvider"])
    for photo_key, photo_url in PRODUCT_PHOTO_URLS.items():
        make_cutout(photo_key, photo_url, session)
