import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().with_name("build_shared_web_assets.py")
SPEC = importlib.util.spec_from_file_location("build_shared_web_assets", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class SharedReleaseTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.source = self.root / "assets/library/models"
        self.source.mkdir(parents=True)
        (self.source / "a.glb").write_bytes(b"same exact reviewed model")
        (self.source / "b.glb").write_bytes(b"same exact reviewed model")
        (self.source / "c.glb").write_bytes(b"distinct geometry data")
        self.out = self.root / "dist/shared"

    def tearDown(self):
        self.temp.cleanup()

    def test_deduplicates_bytes_without_touching_source(self):
        pairs = ["house=assets/library/models/a.glb",
                 "courtyard=assets/library/models/b.glb",
                 "tree=assets/library/models/c.glb"]
        data = MODULE.build(self.root, self.out, pairs)
        self.assertEqual(data["statistics"]["references"], 3)
        self.assertEqual(data["statistics"]["uniqueFiles"], 2)
        self.assertEqual(data["assets"]["house"]["url"], data["assets"]["courtyard"]["url"])
        self.assertNotEqual(data["assets"]["tree"]["url"], data["assets"]["house"]["url"])
        self.assertEqual(data["statistics"]["exactDuplicateBytesAvoided"],
                         len(b"same exact reviewed model"))
        self.assertEqual(len(list((self.out / "objects").iterdir())), 2)
        self.assertEqual((self.source / "a.glb").read_bytes(), b"same exact reviewed model")
        self.assertEqual(json.loads((self.out / "manifest.json").read_text())["assets"], data["assets"])
        # Rebuild is repeatable without duplicating objects.
        MODULE.build(self.root, self.out, pairs)
        self.assertEqual(len(list((self.out / "objects").iterdir())), 2)

    def test_rejects_traversal_and_duplicate_ids(self):
        with self.assertRaises(ValueError):
            MODULE.build(self.root, self.out, ["x=../../secret.glb"])
        with self.assertRaises(ValueError):
            MODULE.build(self.root, self.out, ["x=assets/library/models/a.glb",
                                              "x=assets/library/models/b.glb"])

    def test_existing_object_integrity_is_enforced(self):
        data = MODULE.build(self.root, self.out, ["x=assets/library/models/a.glb"])
        target = self.out / data["assets"]["x"]["url"]
        target.write_bytes(b"tampered")
        with self.assertRaisesRegex(ValueError, "differs"):
            MODULE.build(self.root, self.out, ["x=assets/library/models/a.glb"])


if __name__ == "__main__":
    unittest.main()
