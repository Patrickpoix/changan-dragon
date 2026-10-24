#!/usr/bin/env python3
"""Verify exact acquired native originals and dependencies; no art approval."""
import gzip,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
count=0
for folder,field in [('assets/library/characters/blender-studio/einar','preserved_files'),('assets/library/dragons/grab3d/cartoon-dragon','files'),('assets/library/dragons/grab3d/chinese-dragon','files')]:
 d=ROOT/folder;m=json.loads((d/'manifest.json').read_text())
 for x in m[field]:
  p=d/x['file'];data=p.read_bytes();assert len(data)==x['bytes'] and hashlib.sha256(data).hexdigest()==x['sha256'],str(p);count+=1
  if 'original_sha256' in x:
   data=gzip.decompress(data);assert len(data)==x['original_bytes'] and hashlib.sha256(data).hexdigest()==x['original_sha256']
print(f'PASS {count} original source/dependency hashes, native files, lossless original blend restoration; no mesh reduction or texture downscaling')
