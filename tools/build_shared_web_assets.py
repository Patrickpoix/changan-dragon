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
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ID_PATTERN = re.compile(r"^[a-zA-Z][\w.-]{0,90}$")


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
        raw = source.read_bytes()
        suffix = source.suffix.lower()
        if not suffix or len(suffix) > 12:
            raise ValueError(f"Unsupported extension for {relative}")
        digest = hashlib.sha256(raw).hexdigest()
        # Different file suffix/MIME = potentially different delivery semantics.
        key = (digest, suffix)
        if key not in grouped:
            grouped[key] = (source, raw)
        requested += len(raw)
        entries[asset_id] = {
            "url": "objects/" + digest + suffix,
            "sha256": digest, "bytes": len(raw),
            "source": source.relative_to(root).as_posix(),
        }

    (output / "objects").mkdir(parents=True, exist_ok=True)
    for (digest, suffix), (_source, raw) in grouped.items():
        dest = output / "objects" / (digest + suffix)
        if dest.exists():
            if hashlib.sha256(dest.read_bytes()).hexdigest() != digest:
                raise ValueError(f"Existing output object differs: {dest}")
        else:
            tmp = dest.with_suffix(dest.suffix + ".tmp")
            tmp.write_bytes(raw)
            tmp.replace(dest)
    unique = sum(len(raw) for _source, raw in grouped.values())
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
