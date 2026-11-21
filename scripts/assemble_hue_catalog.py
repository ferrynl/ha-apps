from concurrent.futures import ThreadPoolExecutor
import hashlib
from io import BytesIO
import json
from pathlib import Path
import re
import time
import subprocess
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "twinkly_beta" / "images" / "HUE"
SOURCE = "https://raw.githubusercontent.com/Koenkk/zigbee2mqtt.io/f00f83d14dec0afe45f385f0be47ae19f6948239/public/images/devices/"
SAFE_MODEL = re.compile(r"[A-Z0-9_-]{1,32}")


def fetch(model):
    url = SOURCE + quote(model.replace("/", "-"), safe="") + ".png"
    for attempt in range(3):
        try:
            with urlopen(url, timeout=20) as response:
                raw = response.read(8_000_001)
            if len(raw) > 8_000_000:
                return model, None, "Bron-PNG is te groot"
            with Image.open(BytesIO(raw), formats=["PNG"]) as image:
                if max(image.size) > 4000 or getattr(image, "is_animated", False):
                    return model, None, "Ongeldige bronafmetingen of animatie"
                low, high = image.convert("RGBA").getchannel("A").getextrema()
                if low != 0 or high == 0:
                    return model, None, "Bron-PNG mist een transparante achtergrond"
                resize = max(image.size) > 480 or len(raw) > 480_000
            if resize:
                raw = subprocess.run(
                    ["convert", "-limit", "thread", "1", "png:-", "-resize", "320x320>", "-strip", "png:-"],
                    input=raw, capture_output=True, check=True, timeout=20,
                ).stdout
            return model, raw, None
        except HTTPError as error:
            if error.code == 404:
                return model, None, "Geen bron-PNG"
            if attempt == 2:
                raise
        except (TimeoutError, URLError):
            if attempt == 2:
                raise
        time.sleep(attempt + 1)


def add(index, model, photo):
    key = model.upper()
    if SAFE_MODEL.fullmatch(key):
        index.setdefault(key, set()).add(photo)


def main():
    definition = json.loads((ROOT / "scripts" / "hue-catalog-models.json").read_text(encoding="utf-8"))
    entries = definition["entries"]
    models = sorted({code for entry in entries for code in [entry["model"], *entry["white"]]})
    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(fetch, models))
    available = {key: data for key, data, _ in results if data is not None}
    if len(available) < 40:
        raise RuntimeError("Unexpectedly few transparent product photos")
    DEST.mkdir(parents=True, exist_ok=True)
    photos = {}
    file_by_hash = {}
    existing = {file.stem for file in DEST.glob("*.png")}
    for key, data in sorted(available.items(), key=lambda item: (item[0] not in existing, item[0])):
        digest = hashlib.sha256(data).hexdigest()
        filename = file_by_hash.setdefault(digest, key.replace("/", "-") + ".png")
        photos[key] = filename
        (DEST / filename).write_bytes(data)
    aliases = {}
    for item in entries:
        for key in [*item["ids"], *item["extra"], *item["white"]]:
            if item["model"] in photos and key not in photos:
                add(aliases, key, photos[item["model"]])
    manifest = {key.upper(): filename for key, filename in photos.items() if SAFE_MODEL.fullmatch(key.upper())}
    manifest.update({key: next(iter(files)) for key, files in aliases.items() if len(files) == 1 and key not in manifest})
    (DEST / "models.json").write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    missing = [f"| {key} | {reason} |" for key, _, reason in results if reason]
    descriptions = {item["model"]: item["name"] or "" for item in entries}
    descriptions.update({code: item["name"] or "" for item in entries for code in item["white"] if code not in descriptions})
    rows = [f"| {key} | {descriptions.get(key, '').replace('|', '/')} | [{filename}]({filename}) |"
            for key, filename in sorted(photos.items())]
    notes = [
        "# Philips Hue-productfoto’s", "",
        f"{len(file_by_hash)} unieke transparante productfoto’s, {len(photos)} productcodes en {len(manifest)} koppelbare codes.",
        "",
        "De PNG’s komen uit de Zigbee2MQTT-apparaatcatalogus. De bestandsnamen zijn productcodes. "
        "De index koppelt ook unieke Zigbee-modelcodes aan de bijbehorende foto. Eigen uploads hebben voorrang.",
        "",
        "- [Bronfoto’s](https://github.com/Koenkk/zigbee2mqtt.io/tree/f00f83d14dec0afe45f385f0be47ae19f6948239/public/images/devices)",
        "- [Modeldefinities](https://github.com/Koenkk/zigbee-herdsman-converters/blob/9d19151d867e96bac907e5aa249517cb2d7acb9a/src/devices/philips.ts)",
        "- [Licentie van de bronrepository](https://github.com/Koenkk/zigbee2mqtt.io/blob/f00f83d14dec0afe45f385f0be47ae19f6948239/LICENSE)",
        "",
        "## Productfoto’s", "", "| Productcode | Type | PNG |", "|---|---|---|", *rows,
        "", "## Bronfoto ontbreekt of is ongeschikt", "", "| Productcode | Reden |", "|---|---|", *missing, "",
    ]
    (DEST / "README.md").write_text("\n".join(notes), encoding="utf-8")
    print(notes[2])


if __name__ == "__main__":
    main()
