import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from sync_twinkly import releases, sync, version_key


class SyncTwinklyTest(unittest.TestCase):
    def test_versions_sort_numerically(self):
        self.assertLess(version_key("0.1.9"), version_key("0.1.10"))
        self.assertLess(version_key("0.1.10-beta.9"), version_key("0.1.10-beta.10"))

    @patch("sync_twinkly.subprocess.check_output")
    def test_release_flags_must_match_tag(self, command):
        beta = {"tag_name": "v0.1.41-beta.1", "prerelease": True, "draft": False}
        stable = {"tag_name": "v0.1.41", "prerelease": False, "draft": False}
        command.return_value = json.dumps([
            [beta, dict(stable, draft=True), dict(beta, prerelease=False)],
            [stable, dict(stable, tag_name="nightly")],
        ])
        self.assertEqual(releases(), [beta, stable])

    @patch("sync_twinkly.run")
    def test_legacy_release_cannot_downgrade_store(self, run):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            (folder / "config.yaml").write_text('version: "0.1.40"\n', encoding="utf-8")
            sync(folder, 18489, False, [
                {"tag_name": "v0.1.36", "prerelease": False},
                {"tag_name": "v0.1.41-beta.1", "prerelease": True},
            ])
            run.assert_not_called()


if __name__ == "__main__":
    unittest.main()
