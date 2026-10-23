#!/usr/bin/env python3
"""Synchronize reviewed source provenance and runtime checksums, without downloads."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def library(name):
    directory = ROOT/'assets/library'/name
    previous = directory/'manifest.json'
    old = json.loads(previous.read_text()) if previous.exists() else {}
    records = {item['id']:item for item in old.get('models',[])}
    for path in sorted(directory.glob('*/runtime.glb')):
        source_record = path.with_name('manifest.json')
        if not source_record.is_file():
            raise ValueError('Missing source provenance: '+str(path))
        source = json.loads(source_record.read_text())
        record = {**records.get(source['id'],{}),**source}
        record['runtime'] = {'file':path.relative_to(ROOT).as_posix(), 'bytes':path.stat().st_size,
            'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
            **json.loads(path.with_name('runtime-metadata.json').read_text())}
        records[source['id']] = record
    result = {'license':'CC0-1.0', 'status':'reviewed_local_runtime', 'models':list(records.values())}
    previous.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    return result['models']


if __name__ == '__main__':
    polyhaven = library('polyhaven');quaternius = library('quaternius')
    path=ROOT/'docs/asset-manifest.json';document=json.loads(path.read_text())
    document['selected_polyhaven_models']=polyhaven
    document['selected_quaternius_models']=quaternius
    face_directory=ROOT/'assets/library/quaternius/merchant_face'
    if face_directory.exists():
        face=json.loads((face_directory/'manifest.json').read_text())
        face['runtime']=json.loads((face_directory/'runtime-metadata.json').read_text())
        document['selected_character_faces']=[face]
    boat_directory=ROOT/'assets/library/quaternius/boat_hull'
    if boat_directory.exists():
        hull=json.loads((boat_directory/'manifest.json').read_text())
        hull['runtime']=json.loads((boat_directory/'runtime-metadata.json').read_text())
        document['selected_boat_hulls']=[hull]
    document['architecture_materials']=[json.loads(p.read_text()) for p in sorted((ROOT/'assets/library/architecture/pbr').glob('*/manifest.json'))]
    document['game_integration']=str(len(polyhaven)+len(quaternius))+'_local_GLTF_sources_with_materials_HDR_and_authored_rig_animation'
    document['notes']=f'{len(polyhaven)} reviewed Poly Haven GLB sources, {len(quaternius)} Quaternius animated animal GLBs, and two Quaternius-derived indexed geometry sources (merchant face and hollow boat hull). Source provenance, original and derived files remain separate. Kenney stays an unused optional library. Runtime geometry, bone ownership, animations and placement require browser verification; research-only candidates are not bundled.'
    path.write_text(json.dumps(document,ensure_ascii=False,indent=2)+'\n')
    print('Synchronized',len(polyhaven),'Poly Haven and',len(quaternius),'Quaternius source records')
