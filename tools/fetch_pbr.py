#!/usr/bin/env python3
"""Fetch reviewed CC0 architectural microdetail without importing source colors."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
def read(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'ChanganDragonDevelopment/1.0'})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()

reviewed=['clay_roof_tiles_02','white_plaster_rough_01','clay_plaster']
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('assets',nargs='*',help='Reviewed ids: '+', '.join(reviewed))
args=parser.parse_args()
if set(args.assets)-set(reviewed):parser.error('Only visually reviewed material ids may be fetched')
for asset_id in args.assets or reviewed:
    info = json.loads(read('https://api.polyhaven.com/info/' + asset_id))
    files = json.loads(read('https://api.polyhaven.com/files/' + asset_id))
    folder = ROOT / 'assets/library/architecture/pbr' / asset_id
    folder.mkdir(parents=True, exist_ok=True)
    manifest = {'id': asset_id, 'license': 'CC0-1.0', 'authors': info.get('authors'), 'files': [],
                'use': 'Normal and roughness only; base color belongs to the game art direction. No archaeological dating claimed.'}
    for field, suffix in [('nor_gl', 'normal'), ('Rough', 'roughness')]:
        source = files[field]['1k']['jpg']
        content = read(source['url'])
        if hashlib.md5(content).hexdigest() != source['md5']:
            raise SystemExit('Official checksum mismatch: ' + asset_id + '/' + field)
        destination = folder / (suffix + '.jpg')
        if destination.exists() and destination.read_bytes() != content:
            raise SystemExit('Existing different resource preserved: ' + str(destination))
        destination.write_bytes(content)
        manifest['files'].append({'file': destination.name, 'source_url': source['url'], 'md5': source['md5'],
                                 'sha256': hashlib.sha256(content).hexdigest(), 'bytes': len(content)})
    (folder / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    (folder / 'asset-info.json').write_text(json.dumps(info, ensure_ascii=False, indent=2) + '\n')
    shutil.copyfile(ROOT / 'assets/library/polyhaven/ceramic_pot/LICENSE-CC0-1.0.txt', folder / 'LICENSE-CC0-1.0.txt')
    print(asset_id, '1k normal + roughness verified', flush=True)
