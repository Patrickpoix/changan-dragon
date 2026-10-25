#!/usr/bin/env python3
"""Content-addressed static asset release for the desktop HTTP build.

Unlike the legacy offline HTML packer, writes each selected *byte-identical*
asset once and maps all asset IDs to its single URL. No texture/mesh downscaling.
Does not select artwork or certify licensing; only pre-reviewed source paths
may be selected. This is a staging tool, not the formal game release.

Example:
  python tools/build_shared_web_assets.py --out dist/shared-assets \
    --asset shop=assets/library/architecture/timber-shop/runtime.glb \
    --asset gate=assets/library/architecture/ward-archetypes/courtyard-gate.glb
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ID_PATTERN = re.compile(r"^[a-zA-Z][\w.-]{0,90}$")
COPY_CHUNK_BYTES = 1024 * 1024


def hash_file(path: Path) -> tuple[str, int]:
    """Stream source/object content; never hold GB-scale source bytes in RAM."""
    digest = hashlib.sha256()
    total = 0
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(COPY_CHUNK_BYTES), b""):
            digest.update(block)
            total += len(block)
    return digest.hexdigest(), total


def build(root: Path, output: Path, pairs: list[str]) -> dict:
    root = root.resolve()
    library = (root / "assets/library").resolve()
    output = output.resolve()
    if output == library or output.is_relative_to(library):
        raise ValueError("Output cannot overwrite source assets/library")
    if not pairs:
        raise ValueError("Select at least one reviewed source asset")
    if len({p.split("=", 1)[0] for p in pairs}) != len(pairs):
        raise ValueError("Duplicate asset ID")

    entries = {}
    grouped = {}
    requested = 0
    for spec in pairs:
        asset_id, sep, relative = spec.partition("=")
        if not sep or not ID_PATTERN.fullmatch(asset_id):
            raise ValueError(f"Invalid asset ID or selector: {spec}")
        source = (root / relative).resolve()
        if not source.is_relative_to(library) or not source.is_file():
            raise ValueError(f"Asset must already exist within reviewed assets/library: {relative}")
        # Never imply that checking a sidecar proves all usage rights.
        digest, size = hash_file(source)
        suffix = source.suffix.lower()
        if not suffix or len(suffix) > 12:
            raise ValueError(f"Unsupported extension for {relative}")
        # Different file suffix/MIME = potentially different delivery semantics.
        key = (digest, suffix)
        if key not in grouped:
            grouped[key] = (source, size)
        requested += size
        entries[asset_id] = {
            "url": "objects/" + digest + suffix,
            "sha256": digest, "bytes": size,
            "source": source.relative_to(root).as_posix(),
        }

    (output / "objects").mkdir(parents=True, exist_ok=True)
    for (digest, suffix), (source, size) in grouped.items():
        dest = output / "objects" / (digest + suffix)
        if dest.exists():
            if hash_file(dest) != (digest, size):
                raise ValueError(f"Existing output object differs: {dest}")
        else:
            # Per-build staging avoids two builds writing the same fixed .tmp;
            # only complete, verified files receive the immutable output URL.
            with tempfile.NamedTemporaryFile(dir=dest.parent, prefix=".staging-", delete=False) as stage:
                tmp = Path(stage.name)
                try:
                    with source.open("rb") as input_file:
                        shutil.copyfileobj(input_file, stage, length=COPY_CHUNK_BYTES)
                except BaseException:
                    stage.close()
                    tmp.unlink(missing_ok=True)
                    raise
            # On Windows, open temporary handles cannot be renamed/deleted.
            # Verify after closing the stream, before publishing the new URL.
            try:
                if hash_file(tmp) != (digest, size):
                    raise ValueError(f"Source changed during export: {source}")
                tmp.replace(dest)
            finally:
                tmp.unlink(missing_ok=True)
    unique = sum(size for _source, size in grouped.values())
    report = {
        "format": "changan-shared-web-assets-v1",
        "note": "Release references, not an alternative source catalogue. Rights and art approval are external.",
        "assets": dict(sorted(entries.items())),
        "statistics": {
            "references": len(entries),
            "uniqueFiles": len(grouped),
            "requestedBytes": requested,
            "publishedObjectBytes": unique,
            "exactDuplicateBytesAvoided": requested - unique,
        },
    }
    temp = output / "manifest.json.tmp"
    temp.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temp.replace(output / "manifest.json")
    print(json.dumps(report["statistics"], ensure_ascii=False))
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--asset", action="append", default=[], metavar="ID=LIBRARY_PATH")
    args = parser.parse_args()
    build(ROOT, (ROOT / args.out), args.asset)


if __name__ == "__main__":
    main()
