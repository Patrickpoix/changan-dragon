#!/usr/bin/env python3
"""Verify/restore the pinned offline compatibility engine; never alter original uploads."""
import base64
import hashlib
import io
from pathlib import Path
import tarfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
BUNDLE = ROOT / 'vendor' / 'three.compat.min.js'
SHA256 = '170c6789f43217c96b3170f4b42fafe135de7f7cd48497a4218f9757ee1d49fa'
ARCHIVE_INTEGRITY = 'Bgl2wPJypDOZ1stAxwfWAcJ0WQf7QzlptsxkjYiURPz+n5k4RBDLsq+6f9Y75TYxn6aHLcWz+JNmwTOXWrQTBQ=='

if BUNDLE.is_symlink():
    raise SystemExit('Refusing to replace a symlink: ' + str(BUNDLE))
if BUNDLE.exists():
    if hashlib.sha256(BUNDLE.read_bytes()).hexdigest() != SHA256:
        raise SystemExit('Compatibility bundle differs from the pinned file; preserved, please inspect it')
    print('Three.js 0.160.1 compatibility bundle checksum verified')
else:
    with urllib.request.urlopen('https://registry.npmjs.org/three/-/three-0.160.1.tgz', timeout=60) as response:
        archive = response.read()
    if base64.b64encode(hashlib.sha512(archive).digest()).decode() != ARCHIVE_INTEGRITY:
        raise SystemExit('npm archive integrity check failed; nothing installed')
    with tarfile.open(fileobj=io.BytesIO(archive), mode='r:gz') as package:
        bundle = package.extractfile('package/build/three.min.js').read()
        license_text = package.extractfile('package/LICENSE').read()
    if hashlib.sha256(bundle).hexdigest() != SHA256:
        raise SystemExit('Engine bundle checksum failed; nothing installed')
    BUNDLE.parent.mkdir(exist_ok=True)
    BUNDLE.write_bytes(bundle)
    license_path = BUNDLE.with_name('THREE-LICENSE.txt')
    if not license_path.exists():
        license_path.write_bytes(license_text)
    print('Installed verified local compatibility engine; original vendor/three.min.js preserved')
