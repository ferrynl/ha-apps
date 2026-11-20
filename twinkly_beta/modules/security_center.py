"""Read-only release inventory and local verification of access controls."""
from datetime import datetime, timezone
from importlib import metadata
import os
import platform
import re
import stat
import sys
from types import SimpleNamespace

from aiohttp import web


def dependencies(lock):
    packages = []
    for raw in lock.read_text(encoding="utf-8").splitlines():
        line = raw.partition("#")[0].strip()
        if not line:
            continue
        pin, _, marker = line.partition(";")
        marker = marker.strip()
        if marker == 'platform_system == "Windows"':
            if platform.system() != "Windows":
                continue
        elif marker == 'python_version < "3.13"':
            if sys.version_info >= (3, 13):
                continue
        elif marker:
            raise ValueError("Unknown lockfile marker")
        match = re.fullmatch(r"([A-Za-z0-9_.-]+)==([^\s]+)", pin.strip())
        if not match:
            raise ValueError("Expected a pinned dependency")
        name, expected = match.groups()
        try:
            installed = metadata.version(name)
        except metadata.PackageNotFoundError:
            installed = None
        packages.append({"name": name, "expected": expected, "installed": installed})
    if not packages:
        raise ValueError("Empty lockfile")
    return packages


def credentials_check(path):
    try:
        info = path.lstat()
    except FileNotFoundError:
        return "not_configured"
    return ("pass" if stat.S_ISREG(info.st_mode) and info.st_uid == os.geteuid()
            and not info.st_mode & 0o077 else "fail")


async def local_checks(middleware, data_dir):
    async def accepted(request):
        return web.Response(status=204)

    scenarios = (
        ("ingress_access", "/security-center/status", "172.30.32.2", "GET", "application/json", 204),
        ("direct_access", "/security-center/status", "127.0.0.1", "GET", "application/json", 403),
        ("json_only", "/lighting/groups", "172.30.32.2", "POST", "text/plain", 415),
        ("health_loopback", "/healthz", "127.0.0.1", "GET", "application/json", 204),
        ("health_ingress_denied", "/healthz", "172.30.32.2", "GET", "application/json", 403),
    )
    checks = []
    for key, path, remote, method, content_type, expected in scenarios:
        request = SimpleNamespace(path=path, remote=remote, method=method, content_type=content_type)
        try:
            status = (await middleware(request, accepted)).status
        except web.HTTPException as error:
            status = error.status
        checks.append({"id": key, "result": "pass" if status == expected else "fail"})
    try:
        result = credentials_check(data_dir / "light-providers.json")
    except OSError:
        result = "unavailable"
    checks.append({"id": "credentials_permissions", "result": result})
    return checks


def install(app, directory, data_dir, middleware):
    lock = directory / "requirements.lock"
    config = directory / "config.yaml"

    async def status(request):
        try:
            match = re.search(r"^version:\s*(['\"]?)([^\s'\"]+)\1\s*$",
                              config.read_text(encoding="utf-8"), re.MULTILINE)
            version = match.group(2) if match else None
        except OSError:
            version = None
        try:
            packages = dependencies(lock)
        except (OSError, ValueError):
            packages = None
        checks = await local_checks(middleware, data_dir)
        checks.insert(0, {"id": "middleware_installed",
                          "result": "pass" if middleware in request.app.middlewares else "fail"})
        return web.json_response({
            "version": version,
            "runtime": {"python": platform.python_version(), "architecture": platform.machine(),
                        "root": os.geteuid() == 0},
            "dependencies": packages,
            "checks": checks,
            "checked_at": datetime.now(timezone.utc).isoformat(),
        }, headers={"Cache-Control": "no-store"})

    app.router.add_get("/security-center/status", status)
