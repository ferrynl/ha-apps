"""Mirror published Twinkly versions after validating their source and startup."""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import yaml


REPO = "ferrynl/ha-twinkly"
VERSION = re.compile(r"(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-beta\.([1-9][0-9]*))?")


def run(*command):
    env = {key: value for key, value in os.environ.items() if key != "GH_TOKEN"}
    subprocess.run(command, check=True, env=env)


def version_key(value):
    match = VERSION.fullmatch(value)
    if match is None:
        raise ValueError(f"Invalid Twinkly version: {value}")
    return tuple(int(part or 0) for part in match.groups())


def releases():
    data = subprocess.check_output(
        ["gh", "api", "--paginate", "--slurp", f"repos/{REPO}/releases?per_page=100"], text=True
    )
    return [
        item for page in json.loads(data) for item in page
        if not item["draft"] and item["tag_name"].startswith("v")
        and VERSION.fullmatch(item["tag_name"][1:])
        and item["prerelease"] == ("-beta." in item["tag_name"])
    ]


def sync(folder, port, beta, published):
    versions = [release["tag_name"][1:] for release in published if release["prerelease"] == beta]
    if not versions:
        return
    version = max(versions, key=version_key)
    config = folder / "config.yaml"
    if config.exists():
        installed = yaml.safe_load(config.read_text(encoding="utf-8"))["version"]
        if version_key(installed) >= version_key(version):
            return

    with tempfile.TemporaryDirectory(dir=os.environ.get("RUNNER_TEMP")) as temp:
        upstream = Path(temp) / "upstream"
        candidate = Path(temp) / "candidate"
        run("git", "clone", "--depth", "1", "--branch", f"v{version}", "--",
            f"https://github.com/{REPO}.git", str(upstream))
        scripts = upstream / "scripts"
        if not (scripts / "prepare_release.py").is_file():
            raise RuntimeError(f"v{version} mist de verplichte Twinkly-releasecontrole")
        run(sys.executable, str(scripts / "prepare_release.py"),
            str(upstream / "twinkly"), str(candidate), version)
        run("bash", str(scripts / "smoke.sh"), str(candidate), str(port))
        if folder.exists():
            shutil.rmtree(folder)
        shutil.copytree(candidate, folder)


if __name__ == "__main__":
    published = releases()
    sync(Path("twinkly"), 18489, False, published)
    sync(Path("twinkly_beta"), 18491, True, published)
