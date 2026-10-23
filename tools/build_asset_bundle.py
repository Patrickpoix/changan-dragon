#!/usr/bin/env python3
"""Pack reviewed local glTF assets and embed offline GLBs for the browser.

Examples:
  python3 tools/build_asset_bundle.py --prepare ceramic_pot=assets/library/polyhaven/ceramic_pot/ceramic_pot_1k.gltf
  python3 tools/build_asset_bundle.py --bundle

The preparer uses local Blender, retains the source PBR materials and UVs, bounds
texture dimensions, and only decimates meshes above the triangle budget. Source
models and their provenance remain beside the derived runtime.glb. No downloads.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def glb_document(path: Path, require_textures=True) -> dict:
    data = path.read_bytes()
    if len(data) < 20:
        raise ValueError(f'Truncated GLB: {path}')
    magic, version, length = struct.unpack_from('<4sII', data)
    if magic != b'glTF' or version != 2 or length != len(data):
        raise ValueError(f'Invalid GLB header: {path}')
    chunk_length, chunk_type = struct.unpack_from('<II', data, 12)
    if chunk_type != 0x4E4F534A:
        raise ValueError(f'GLB JSON chunk missing: {path}')
    document = json.loads(data[20:20 + chunk_length])
    for collection in ('buffers', 'images'):
        for item in document.get(collection, []):
            if item.get('uri'):
                raise ValueError(f'External {collection} URI prevents offline loading: {path}')
    if not document.get('meshes') or (require_textures and not document.get('images')):
        raise ValueError(f'Expected renderable 3D meshes and required textures: {path}')
    unsupported = set(document.get('extensionsRequired', [])) - {
        'KHR_materials_ior', 'KHR_materials_specular', 'KHR_materials_transmission',
        'KHR_materials_clearcoat', 'KHR_materials_sheen', 'KHR_texture_transform',
        'KHR_materials_emissive_strength', 'KHR_materials_unlit',
    }
    if unsupported:
        raise ValueError(f'Runtime decoder is not bundled for {unsupported}: {path}')
    return document


def blender_prepare(source: Path, output: Path, texture_size: int, triangles: int):
    import bpy
    from mathutils import Vector

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source))
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    if not meshes:
        raise ValueError(f'No mesh imported from {source}')
    before = sum(sum(len(face.vertices) - 2 for face in obj.data.polygons) for obj in meshes)
    ratio = min(1.0, triangles / max(1, before))
    for obj in meshes:
        # High density scans retain silhouette and texture coordinates; tiny
        # handles are protected by leaving meshes under 500 triangles untouched.
        count = sum(len(face.vertices) - 2 for face in obj.data.polygons)
        if ratio < 0.98 and count > 500:
            modifier = obj.modifiers.new('Runtime triangle budget', 'DECIMATE')
            modifier.ratio = ratio
            modifier.use_collapse_triangulate = True
    for image in bpy.data.images:
        if image.size[0] <= 0 or image.size[1] <= 0:
            continue
        largest = max(image.size)
        if largest > texture_size:
            scale = texture_size / largest
            image.scale(max(1, round(image.size[0] * scale)), max(1, round(image.size[1] * scale)))
        image.pack()
    bpy.context.view_layer.update()
    points = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
    lo = [min(v[i] for v in points) for i in range(3)]
    hi = [max(v[i] for v in points) for i in range(3)]
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB',
        export_image_format='AUTO', export_materials='EXPORT', export_apply=True,
        export_animations=False, export_cameras=False, export_lights=False,
        export_yup=True, export_extras=False)
    after = 0
    depsgraph = bpy.context.evaluated_depsgraph_get()
    for obj in meshes:
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        after += sum(len(face.vertices) - 2 for face in mesh.polygons)
        evaluated.to_mesh_clear()
    metadata = {'source': source.relative_to(ROOT).as_posix(),
        'runtime': output.relative_to(ROOT).as_posix(), 'sourceTriangles': before,
        'runtimeTriangles': after, 'textureMaxSize': texture_size,
        'blenderDimensionsXYZ': [round(hi[i] - lo[i], 6) for i in range(3)],
        'derivation': 'Original PBR materials and UVs preserved; textures resized; meshes simplified only above the triangle budget.'}
    output.with_name('runtime-metadata.json').write_text(json.dumps(metadata, indent=2) + '\n')
    print(json.dumps(metadata))


def prepare(spec: str, texture_size: int, triangles: int):
    model_id, separator, source_path = spec.partition('=')
    if not separator or not model_id.replace('_', '').isalnum():
        raise ValueError('--prepare expects model_id=path/to/source.gltf')
    source = (ROOT / source_path).resolve()
    if not source.is_relative_to(ROOT / 'assets/library') or not source.is_file():
        raise ValueError(f'Expected an existing reviewed asset under assets/library: {source}')
    # Explicit local license evidence is required before producing a runtime asset.
    evidence = [p for p in source.parent.iterdir() if p.is_file() and
                any(word in p.name.lower() for word in ('license', 'provenance', 'manifest'))]
    if not evidence:
        raise ValueError(f'No local license/provenance record beside {source}')
    output = source.parent / 'runtime.glb'
    subprocess.run(['/usr/bin/blender', '--background', '--threads', '2', '--python-exit-code', '1',
        '--python', str(Path(__file__).resolve()), '--', '--blender-worker',
        str(source), str(output), str(texture_size), str(triangles)],
        check=True, cwd=ROOT)
    glb_document(output)


def bundle():
    models = {}
    for path in sorted((ROOT / 'assets/library/polyhaven').glob('*/runtime.glb')):
        document = glb_document(path)
        model_id = path.parent.name
        payload = path.read_bytes()
        materials = document.get('materials', [])
        provenance=json.loads(path.with_name('manifest.json').read_text())
        models[model_id] = {
            'id': model_id, 'source': f'https://polyhaven.com/a/{model_id}',
            'authors':provenance.get('authors',{}),
            'license': 'CC0-1.0', 'path': path.relative_to(ROOT).as_posix(),
            'bytes': len(payload), 'sha256': hashlib.sha256(payload).hexdigest(),
            'meshes': len(document['meshes']), 'materials': len(materials),
            'base64': base64.b64encode(payload).decode('ascii')}
    for path in sorted((ROOT/'assets/library/quaternius').glob('*/runtime.glb')):
        document = glb_document(path, require_textures=False)
        provenance = json.loads(path.with_name('manifest.json').read_text())
        if provenance['license'] != 'CC0-1.0' or not document.get('skins') or not document.get('animations'):
            raise ValueError(f'Expected a licensed, rigged and animated animal: {path}')
        payload = path.read_bytes();model_id = provenance['id']
        models[model_id] = {'id':model_id,'source':provenance['source'],'license':provenance['license'],
            'author':provenance['author'],'category':'animated_animal','path':path.relative_to(ROOT).as_posix(),
            'bytes':len(payload),'sha256':hashlib.sha256(payload).hexdigest(),
            'meshes':len(document['meshes']),'materials':len(document.get('materials',[])),
            'animations':[a.get('name') for a in document['animations']],
            'base64':base64.b64encode(payload).decode('ascii')}
    if not models:
        raise ValueError('No reviewed runtime.glb files to bundle; prepare sources first')
    destination = ROOT / 'assets/runtime-models.js'
    temporary=destination.with_suffix('.js.tmp')
    temporary.write_text('/* Generated by tools/build_asset_bundle.py. Local CC0 Poly Haven and Quaternius 3D assets; source provenance stays in assets/library. */\n'
        + 'const RUNTIME_MODELS = Object.freeze(' + json.dumps(models, separators=(',', ':')) + ');\n', encoding='utf-8')
    temporary.replace(destination)
    print(f'Embedded {len(models)} real GLBs: {sum(m["bytes"] for m in models.values()):,} binary bytes; {destination.stat().st_size:,} JavaScript bytes')
    for model_id, model in models.items():
        print(f'  {model_id}: {model["bytes"]:,} bytes, {model["meshes"]} meshes, {model["materials"]} materials')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prepare', action='append', default=[], metavar='ID=GLTF')
    parser.add_argument('--bundle', action='store_true')
    parser.add_argument('--texture-size', type=int, default=512)
    parser.add_argument('--triangles', type=int, default=6000)
    args = parser.parse_args()
    if not 128 <= args.texture_size <= 2048 or args.triangles < 500:
        parser.error('Texture size must be 128..2048 and triangle budget at least 500')
    if not args.prepare and not args.bundle:
        parser.error('Choose --prepare ID=GLTF and/or --bundle')
    for spec in args.prepare:
        prepare(spec, args.texture_size, args.triangles)
    if args.bundle:
        bundle()


if __name__ == '__main__':
    if '--blender-worker' in sys.argv:
        position = sys.argv.index('--blender-worker')
        source, output, size, triangles = sys.argv[position + 1:position + 5]
        blender_prepare(Path(source), Path(output), int(size), int(triangles))
    else:
        main()
