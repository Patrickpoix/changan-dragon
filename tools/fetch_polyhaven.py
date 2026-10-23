#!/usr/bin/env python3
"""Download selected, reviewed CC0 Poly Haven models with official checksums."""
import argparse
from datetime import datetime, timedelta, timezone
import hashlib
import json
from pathlib import Path
import shutil
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
HEADERS = {'User-Agent': 'ChanganDragonDevelopment/1.0'}

def request(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=60) as response:
        return response.read()

def fetch(model_id, max_source_mb=25):
    if not model_id.replace('_', '').isalnum():
        raise ValueError('Invalid model ID')
    info = json.loads(request('https://api.polyhaven.com/info/' + model_id))
    catalog = json.loads(request('https://api.polyhaven.com/files/' + model_id))
    asset = catalog['gltf']['1k']['gltf']
    listing = [(model_id + '_1k.gltf', asset), *asset.get('include', {}).items()]
    total = sum(entry.get('size', 0) for _, entry in listing)
    if total > max_source_mb * 1024 * 1024:
        raise ValueError(f'Review required before downloading {total:,} bytes for {model_id}')
    directory = ROOT / 'assets/library/polyhaven' / model_id
    directory.mkdir(parents=True, exist_ok=True)
    manifest = {'id': model_id, 'license': 'CC0-1.0', 'authors': info.get('authors'),
                'asset_page': 'https://polyhaven.com/a/' + model_id,
                'retrieved_at': str(datetime.now(timezone(timedelta(hours=8))).date()),
                'notes': 'Reviewed as a generic street prop; not claimed to be a Tang archaeological artifact.', 'files': []}
    for relative, item in listing:
        path = (directory / relative).resolve()
        if not path.is_relative_to(directory.resolve()):
            raise ValueError('Unsafe relative asset path')
        data = request(item['url'])
        if hashlib.md5(data).hexdigest() != item['md5']:
            raise ValueError('Official checksum mismatch: ' + relative)
        if path.exists() and path.read_bytes() != data:
            raise ValueError('Existing different asset preserved: ' + str(path))
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        manifest['files'].append({'file': relative, 'source_url': item['url'], 'source_md5': item['md5'],
                                  'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
    for name, data in [('asset-info.json', info), ('asset-files.json', catalog), ('manifest.json', manifest)]:
        (directory / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    for name in ['LICENSE-CC0-1.0.txt', 'PolyHaven-asset-license.json']:
        shutil.copyfile(ROOT / 'assets/library/polyhaven/ceramic_pot' / name, directory / name)
    (directory / 'README.md').write_text(f'# {info["name"]}\n\nSource: {manifest["asset_page"]}\n\n'
        f'Authors: {", ".join(info.get("authors", {}))}. License: CC0-1.0.\n\n'
        'Generic art-directed prop, not a verified Tang period object. Original files carry API MD5 and SHA256 records.\n'
        'Use tools/build_asset_bundle.py to prepare the embedded offline GLB.\n')
    print(f'{model_id}: {total:,} bytes downloaded and verified against official checksums', flush=True)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('ids', nargs='+')
    parser.add_argument('--max-source-mb',type=int,default=25,help='Explicit reviewed source-size budget; runtime derivatives stay separately bounded')
    args=parser.parse_args()
    if not 1 <= args.max_source_mb <= 512: parser.error('Source budget must be 1..512 MiB')
    for model_id in args.ids:
        fetch(model_id,args.max_source_mb)
