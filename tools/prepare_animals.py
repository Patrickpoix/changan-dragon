#!/usr/bin/env python3
"""Derive smooth, single-material animals from the licensed original rigs.

Original files are preserved. Blender supplies subdivision and glTF skin export;
the artist's idle, walking and grazing clips stay attached to their own bones.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def worker(directory):
    import bpy
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(directory / 'source.glb'))
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH' and any(m.type == 'ARMATURE' for m in o.modifiers)]
    # Blender's importer creates an Icosphere solely as an armature UI shape.
    # It has no source glTF mesh/material and must never become a scene animal.
    for obj in list(bpy.context.scene.objects):
        if obj.type == 'MESH' and obj not in meshes:
            bpy.data.objects.remove(obj, do_unlink=True)
    before = sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes)
    material = bpy.data.materials.new('Authored coat colours')
    material.use_nodes = True
    shader = material.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Metallic'].default_value = 0
    shader.inputs['Roughness'].default_value = .83
    colour = material.node_tree.nodes.new('ShaderNodeVertexColor')
    colour.layer_name = 'AuthoredColour'
    material.node_tree.links.new(colour.outputs['Color'], shader.inputs['Base Color'])
    for obj in meshes:
        # Per-corner colour retains all original coat/eye/hoof regions while
        # reducing eight material primitives to one skinned draw call.
        mesh = obj.data
        attr = mesh.color_attributes.new(name='AuthoredColour', type='FLOAT_COLOR', domain='CORNER')
        for face in mesh.polygons:
            source = obj.material_slots[face.material_index].material
            source_shader = source.node_tree.nodes.get('Principled BSDF') if source.use_nodes else None
            value = source_shader.inputs['Base Color'].default_value if source_shader else source.diffuse_color
            for i in face.loop_indices:
                attr.data[i].color = value
        mesh.materials.clear(); mesh.materials.append(material)
        for face in mesh.polygons:
            face.material_index = 0
            face.use_smooth = True
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles(threshold=0.00001)
        bpy.ops.object.mode_set(mode='OBJECT')
        obj.select_set(False)
        modifier = obj.modifiers.new('Rounded animation silhouette', 'SUBSURF')
        modifier.levels = modifier.render_levels = 1
    selected = []
    for action in list(bpy.data.actions):
        clip_name = action.name.rsplit('|', 1)[-1].removesuffix('_AnimalArmature')
        if clip_name in {'Walk', 'Idle', 'Eating'}:
            action.name = clip_name
            selected.append(clip_name)
        else:
            bpy.data.actions.remove(action, do_unlink=True)
    for obj in bpy.context.scene.objects:
        if not obj.animation_data:
            continue
        for track in list(obj.animation_data.nla_tracks):
            if not any(strip.action and strip.action.name in selected for strip in track.strips):
                obj.animation_data.nla_tracks.remove(track)
    if set(selected) != {'Walk', 'Idle', 'Eating'}:
        raise ValueError('Expected the three original clips, got '+repr(selected))
    temporary = directory/'runtime-preparing.glb'
    bpy.ops.export_scene.gltf(filepath=str(temporary), export_format='GLB',
        export_apply=True, export_materials='EXPORT', export_animations=True,
        export_animation_mode='ACTIONS', export_force_sampling=True,
        export_cameras=False, export_lights=False, export_extras=False)
    import struct
    payload = temporary.read_bytes()
    chunk_length = struct.unpack_from('<I',payload,12)[0]
    document = json.loads(payload[20:20+chunk_length])
    exported_names=[a.get('name','').rsplit('|',1)[-1] for a in document.get('animations',[])]
    if set(exported_names) != {'Walk','Idle','Eating'} or not document.get('skins'):
        raise ValueError('The exported model lost its skin or clips')
    temporary.replace(directory/'runtime.glb')
    triangles=sum(document['accessors'][p['indices']]['count']//3 for m in document['meshes'] for p in m['primitives'])
    metadata = {'sourceTriangles': before, 'runtimeTriangles':triangles, 'runtimeMaterials':len(document.get('materials',[])), 'retainedClips': selected,
        'derivation': 'Original rig, skin weights and authored idle/walk/grazing clips. Coat regions converted to corner vertex colours; metallic removed; one level of subdivision and smooth normals. One material per animal.'}
    (directory/'runtime-metadata.json').write_text(json.dumps(metadata,indent=2)+'\n')
    print(json.dumps(metadata))


def main():
    for name in ['horse','deer']:
        directory = ROOT/'assets/library/quaternius'/name
        manifest = json.loads((directory/'manifest.json').read_text())
        if manifest['license'] != 'CC0-1.0' or hashlib.sha256((directory/'source.glb').read_bytes()).hexdigest() != manifest['sha256']:
            raise ValueError('Unverified source: '+name)
        subprocess.run(['/usr/bin/blender','--background','--threads','2','--python-exit-code','1','--python',str(Path(__file__).resolve()),'--','--worker',str(directory)],check=True)


if __name__ == '__main__':
    if '--worker' in sys.argv:
        worker(Path(sys.argv[-1]))
    else:
        main()
