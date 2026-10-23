#!/usr/bin/env python3
"""Pack licensed scene materials for local-file and standalone WebGL loading."""
import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def encoded(path):
    return base64.b64encode((ROOT / path).read_bytes()).decode('ascii')
cloth = 'assets/library/pbr-cloth/technicalFabricSmall_'
data = {
    'cloth': {key: 'data:image/png;base64,' + encoded(cloth + name + '_256.png') for key, name in
              [('normal', 'normal'), ('orm', 'orm'), ('sheen', 'sheen')]},
    'environment': encoded('assets/environment/venice_sunset_1k.hdr'),
    'architecture': {name: {kind: 'data:image/jpeg;base64,' + encoded('assets/library/architecture/pbr/' + asset + '/' + kind + '.jpg')
                           for kind in ['normal', 'roughness']}
                     for name, asset in [('roof', 'clay_roof_tiles_02'), ('plaster', 'white_plaster_rough_01')]},
}
header = '''/* Local CC0 physical material inputs: Microsoft SheenCloth normal/ORM/sheen,
 * and Greg Zaal / Poly Haven Venice Sunset HDR. See assets/library/pbr-cloth
 * and assets/environment for authors, licenses, source metadata and checksums.
 * Original cloth basecolor is deliberately not used as Tang textile evidence. */
'''
output = ROOT / 'assets/scene-materials.js'
output.write_text(header + 'const SCENE_MATERIALS = ' + json.dumps(data, separators=(',', ':')) + ';\n')
print(f'Packed {output.relative_to(ROOT)} ({output.stat().st_size:,} bytes)')
