#!/usr/bin/env python3
"""Round the licensed, hollow artist hull; retain editable compact 3D arrays.

Seats, planking, actors and articulated oars are implemented separately in JS.
No glTF loader, image or decoder is needed for this small static derivative.
"""
import base64,hashlib,json,struct,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DIRECTORY=ROOT/'assets/library/quaternius/boat_hull'

def worker():
    import bpy,bmesh
    from mathutils import Matrix,Vector
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(DIRECTORY/'source.glb'))
    boat=next(o for o in bpy.context.scene.objects if o.type=='MESH')
    points=[boat.matrix_world@v.co for v in boat.data.vertices]
    lo=Vector([min(p[i] for p in points) for i in range(3)]);hi=Vector([max(p[i] for p in points) for i in range(3)])
    center=(lo+hi)/2;size=hi-lo
    for vertex,p in zip(boat.data.vertices,points):
        # Imported glTF is Z-up inside Blender. Rotate a transverse source if
        # needed, then bake metre dimensions before beveling its real edges.
        if size.y>=size.x:x=(p.x-center.x)/size.x;y=(p.y-center.y)/size.y
        else:x=(p.y-center.y)/size.y;y=-(p.x-center.x)/size.x
        vertex.co=(x*2.15,y*4.4,(p.z-lo.z)/size.z*.83)
    boat.parent=None;boat.matrix_world=Matrix.Identity(4)
    bm=bmesh.new();bm.from_mesh(boat.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001)
    bm.to_mesh(boat.data);bm.free()
    bpy.context.view_layer.objects.active=boat
    for face in boat.data.polygons:face.use_smooth=True
    bevel=boat.modifiers.new('Soft hand-shaped timber edges','BEVEL');bevel.width=.022;bevel.segments=3;bevel.limit_method='ANGLE';bevel.angle_limit=.4;bevel.harden_normals=True
    weighted=boat.modifiers.new('Preserve broad plank normals','WEIGHTED_NORMAL');weighted.keep_sharp=True;weighted.weight=50
    evaluated=boat.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=evaluated.to_mesh();mesh.calc_loop_triangles()
    positions=[];normals=[];colours=[];indices=[];lookup={}
    for triangle in mesh.loop_triangles:
        material=boat.material_slots[triangle.material_index].material
        color=list(material.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value)[:3]
        for loop_index in triangle.loops:
            vertex_index=mesh.loops[loop_index].vertex_index;p=mesh.vertices[vertex_index].co;n=mesh.corner_normals[loop_index].vector
            key=(vertex_index,triangle.material_index,*(round(v,6) for v in n))
            if key not in lookup:
                lookup[key]=len(positions)//3;positions.extend([p.x,p.z-.2,-p.y]);normals.extend([n.x,n.z,-n.y]);colours.extend(color)
            indices.append(lookup[key])
    evaluated.to_mesh_clear()
    def pack(values,code):return base64.b64encode(struct.pack('<'+code*len(values),*values)).decode()
    record={'positions':pack(positions,'f'),'normals':pack(normals,'f'),'colours':pack(colours,'f'),'indices':pack(indices,'H'),'vertices':len(positions)//3,'triangles':len(indices)//3,'source':'Quaternius / Ships Pack / Boat','license':'CC0-1.0'}
    output=ROOT/'assets/boat-hulls.js';temporary=output.with_suffix('.js.tmp')
    temporary.write_text('/* Quaternius CC0 hollow boat, bevelled at development time. See tools/prepare_boats.py and assets/library/quaternius/boat_hull. */\nconst BOAT_HULLS=Object.freeze('+json.dumps({'rowboat':record},separators=(',',':'))+');\n');temporary.replace(output)
    metadata={'source':'source.glb','runtime':'assets/boat-hulls.js','vertices':record['vertices'],'triangles':record['triangles'],'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'dimensions':[2.15,.83,4.4],'keel':-.2,'gunwale':.63,'derivation':'Original hollow hull, seam weld, 22mm three-segment timber edge bevel and weighted normals; original wood material regions retained as indexed vertex-colour data. Normalized in metres; seats, planks, oars and people added by editable JS.'}
    (DIRECTORY/'runtime-metadata.json').write_text(json.dumps(metadata,indent=2)+'\n');print('Boat hull:',metadata)
    # Optional review GLB stays outside the library runtime.glb scan.
    if '--preview' in sys.argv:
        bpy.ops.export_scene.gltf(filepath='/tmp/changan-boat-review/rounded.glb',export_format='GLB',export_apply=True,export_animations=False,export_cameras=False,export_lights=False)

if __name__=='__main__':
    if '--worker' in sys.argv:worker()
    else:
        record=json.loads((DIRECTORY/'manifest.json').read_text())
        if record['license']!='CC0-1.0' or hashlib.sha256((DIRECTORY/'source.glb').read_bytes()).hexdigest()!=record['sha256']:raise ValueError('Unverified boat source')
        subprocess.run(['/usr/bin/blender','--background','--threads','2','--python-exit-code','1','--python',str(Path(__file__).resolve()),'--','--worker',*(['--preview'] if '--preview' in sys.argv else [])],check=True)
