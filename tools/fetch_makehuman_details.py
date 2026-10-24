#!/usr/bin/env python3
"""Verify acquired fixed-revision CC0 eye/expression assets; optionally fetch missing.
No interactive accounts, license inference from unrelated software, or overwrite.
"""
import argparse,hashlib,json,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];FOLDER=ROOT/'assets/library/characters/makehuman-details'
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--download-missing',action='store_true');args=p.parse_args()
manifest=json.loads((FOLDER/'manifest.json').read_text())
for item in manifest['files']:
 dest=FOLDER/item['file']
 if not dest.exists():
  if not args.download_missing:raise SystemExit('Missing '+str(dest))
  with urllib.request.urlopen(urllib.request.Request(item['url'],headers={'User-Agent':'ChanganDragon-asset-preparation'}),timeout=60) as response:data=response.read()
 else:data=dest.read_bytes()
 assert len(data)==item['bytes'] and hashlib.sha256(data).hexdigest()==item['sha256'],str(dest)
 assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==item['git_blob_sha1'],str(dest)
 if not dest.exists():dest.write_bytes(data)
print('PASS',len(manifest['files']),'fixed-revision eye/expression source assets; existing files protected')
