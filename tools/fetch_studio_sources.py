#!/usr/bin/env python3
"""Verify selected original Blender Studio sources; --fetch restores missing ones.
The complete archives stay outside Git; all retained original files have hashes.
"""
import argparse,hashlib,json,urllib.request,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'assets/library/characters/blender-studio'
p=argparse.ArgumentParser();p.add_argument('--fetch',action='store_true');p.add_argument('--cache',type=Path,default=Path('/workspace/.environment/changan-dragon/resource-prep/mature-source-check'));args=p.parse_args()
for name in ['snow','rain']:
    folder=BASE/name;m=json.loads((folder/'manifest.json').read_text());missing=[]
    for f in m['preserved_files']:
        dest=folder/f['file']
        if dest.exists():
            if hashlib.sha256(dest.read_bytes()).hexdigest()!=f['sha256']:raise RuntimeError('Different preserved original: '+str(dest))
        else:missing.append(f)
    if missing and not args.fetch:raise RuntimeError('Missing source files; rerun with --fetch: '+name)
    if missing:
        args.cache.mkdir(parents=True,exist_ok=True);archive=args.cache/(name+'-source.zip')
        if not archive.exists():
            pending=archive.with_suffix('.part')
            with urllib.request.urlopen(m['download'],timeout=60) as response,pending.open('wb') as out:
                while b:=response.read(1024*1024):out.write(b)
            if hashlib.sha256(pending.read_bytes()).hexdigest()!=m['sha256']:raise RuntimeError('Archive changed; preserving .part for inspection')
            pending.rename(archive)
        if hashlib.sha256(archive.read_bytes()).hexdigest()!=m['sha256']:raise RuntimeError('Archive checksum mismatch')
        with zipfile.ZipFile(archive) as z:
            for f in missing:
                dest=(folder/f['file']).resolve();dest.relative_to(folder.resolve());b=z.read(f['file'])
                if hashlib.sha256(b).hexdigest()!=f['sha256']:raise RuntimeError('Member mismatch')
                dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b)
    print('PASS',name,len(m['preserved_files']),'selected original files; source blend and face/hair/eye maps')
