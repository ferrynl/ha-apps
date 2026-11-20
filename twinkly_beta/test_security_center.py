import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from app import ingress_only
from modules.security_center import credentials_check, dependencies, local_checks


class SecurityCenterTest(unittest.IsolatedAsyncioTestCase):
    async def test_local_controls_use_real_middleware_and_inspect_permissions(self):
        with tempfile.TemporaryDirectory() as temp:
            directory = Path(temp)
            keyfile = directory / "light-providers.json"
            checks = await local_checks(ingress_only, directory)
            self.assertEqual([row["result"] for row in checks], ["pass"] * 5 + ["not_configured"])
            keyfile.write_text("not read")
            keyfile.chmod(0o600)
            self.assertEqual(credentials_check(keyfile), "pass")
            keyfile.chmod(0o644)
            self.assertEqual(credentials_check(keyfile), "fail")

    def test_dependency_inventory_compares_installed_with_lock(self):
        with tempfile.TemporaryDirectory() as temp:
            lockfile = Path(temp) / "requirements.lock"
            lockfile.write_text('twinkly-test==2.0\nwindows-only==1.0 ; platform_system == "Windows"\n')
            with patch("modules.security_center.platform.system", return_value="Linux"), \
                 patch("modules.security_center.metadata.version", return_value="1.0") as installed:
                self.assertEqual(dependencies(lockfile), [
                    {"name": "twinkly-test", "expected": "2.0", "installed": "1.0"}
                ])
                installed.assert_called_once_with("twinkly-test")
