#!/usr/bin/env python3
"""Prepare a reviewed tree while retaining its authored leaf distribution.

Unlike uniform decimation, connected leaves become folded, textured four-face
surfaces; deterministic thinning keeps complete leaves. Trunk and branches are
simplified independently. Requires Blender (includes NumPy). No downloads.
"""
import argparse,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'assets/library/polyhaven/tree_small_02/tree_small_02_1k.gltf'

def worker():
 import bpy,numpy as np
 from collections import defaultdict
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.gltf(filepath=str(SOURCE))
 original=next(o for o in bpy.context.scene.objects if o.type=='MESH');mesh=original.data
 positions=np.empty((len(mesh.vertices),3),np.float32);mesh.vertices.foreach_get('co',positions.ravel())
 loop_ids=np.empty(len(mesh.loops),np.int32);mesh.loops.foreach_get('vertex_index',loop_ids)
 totals=np.empty(len(mesh.polygons),np.int32);mesh.polygons.foreach_get('loop_total',totals)
 if not np.all(totals==3): raise ValueError('Expected triangulated reviewed source')
 faces=loop_ids.reshape(-1,3)
 material_ids=np.empty(len(mesh.polygons),np.int32);mesh.polygons.foreach_get('material_index',material_ids)
 uv=np.empty((len(mesh.loops),2),np.float32);mesh.uv_layers.active.data.foreach_get('uv',uv.ravel());face_uv=uv.reshape(-1,3,2)
 leaf_slot=next(i for i,m in enumerate(mesh.materials) if 'leaves' in m.name.lower())
 leaf_mask=material_ids==leaf_slot
 materials=list(mesh.materials)
 def make_mesh(name,vertices,triangles,coords,slots):
  data=bpy.data.meshes.new(name);data.from_pydata(vertices,[],triangles);data.update()
  for m in materials:data.materials.append(m)
  data.polygons.foreach_set('material_index',np.asarray(slots,np.int32));data.polygons.foreach_set('use_smooth',np.ones(len(data.polygons),bool))
  layer=data.uv_layers.new(name='UVMap');layer.data.foreach_set('uv',np.asarray(coords,np.float32).ravel())
  obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj);obj.matrix_world=original.matrix_world.copy();return obj
 # Keep exact source UVs on the trunk/branches before their separate reduction.
 used,remapped=np.unique(faces[~leaf_mask],return_inverse=True)
 timber=make_mesh('authored-trunk-branches',positions[used].tolist(),remapped.reshape(-1,3).tolist(),face_uv[~leaf_mask],material_ids[~leaf_mask])
 modifier=timber.modifiers.new('Timber budget','DECIMATE');modifier.ratio=min(1,7000/max(1,int(np.sum(~leaf_mask))));modifier.use_collapse_triangulate=True
 # Weld coincident source coordinates for connectivity, preserving the source UV
 # at each leaf point instead of generating unrelated foliage placements.
 ids=np.unique(faces[leaf_mask]);unique,inverse=np.unique(np.round(positions[ids],5),axis=0,return_inverse=True)
 vertex_map=np.full(len(positions),-1,np.int32);vertex_map[ids]=inverse
 leaf_faces=vertex_map[faces[leaf_mask]];parent=np.arange(len(unique),dtype=np.int32)
 def root(a):
  while parent[a]!=a:parent[a]=parent[parent[a]];a=parent[a]
  return a
 for a,b,c in leaf_faces:
  a=root(a);b=root(b);c=root(c)
  if a!=b:parent[b]=a
  if a!=c:parent[c]=a
 groups=defaultdict(list)
 for i in range(len(unique)):groups[root(i)].append(i)
 _,first=np.unique(loop_ids,return_index=True);first_map=np.zeros(len(positions),np.int32);first_map[np.unique(loop_ids)]=first
 _,unique_first=np.unique(inverse,return_index=True);unique_uv=uv[first_map[ids[unique_first]]]
 vertices=[];triangles=[];coords=[];rng=np.random.default_rng(160);retained=0
 for indices in groups.values():
  if len(indices)<3 or rng.random()>.38:continue
  points=unique[indices];center=points.mean(axis=0);p=points-center
  eigen,axes=np.linalg.eigh(p.T@p);long=axes[:,-1];wide=axes[:,-2];normal=np.cross(long,wide)
  u=p@long;v=p@wide;span_u=max(float(np.ptp(u)),.008);span_v=max(float(np.ptp(v)),.004)
  # A shallow central fold gives each leaf a volume and a lit/shaded side.
  corners=[center+long*span_u*.725,center+wide*span_v*.725,center-long*span_u*.725,center-wide*span_v*.725]
  nearest=[int(np.argmin(np.linalg.norm(points-corner,axis=1))) for corner in corners]
  tex=[unique_uv[indices[i]] for i in nearest];base=len(vertices)
  vertices.extend([x.tolist() for x in corners]);vertices.append((center+normal*span_v*.09).tolist())
  middle=np.mean(tex,axis=0)
  for i in range(4):triangles.append([base+i,base+(i+1)%4,base+4]);coords.extend([tex[i],tex[(i+1)%4],middle])
  retained+=1
 leaves=make_mesh('authored-leaf-distribution',vertices,triangles,coords,[leaf_slot]*len(triangles))
 bpy.data.objects.remove(original,do_unlink=True)
 for image in bpy.data.images:
  if max(image.size)>512:
   scale=512/max(image.size);image.scale(max(1,round(image.size[0]*scale)),max(1,round(image.size[1]*scale)))
  if image.size[0]>0:image.pack()
 output=SOURCE.with_name('runtime.glb')
 bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',export_image_format='AUTO',export_materials='EXPORT',export_apply=True,export_animations=False,export_cameras=False,export_lights=False,export_yup=True)
 deps=bpy.context.evaluated_depsgraph_get();count=0
 for obj in [timber,leaves]:
  evaluated=obj.evaluated_get(deps);evaluated_mesh=evaluated.to_mesh();count+=sum(len(p.vertices)-2 for p in evaluated_mesh.polygons);evaluated.to_mesh_clear()
 metadata={'source':SOURCE.relative_to(ROOT).as_posix(),'runtime':output.relative_to(ROOT).as_posix(),'sourceTriangles':len(faces),'runtimeTriangles':count,'sourceLeafComponents':len(groups),'retainedLeaves':retained,'textureMaxSize':512,'derivation':'Authored leaf positions/orientations/UVs retained as deterministic 38% folded leaf surfaces enlarged 1.45x; timber independently decimated to 7000 triangles. Original source preserved. Visual review required.'}
 output.with_name('runtime-metadata.json').write_text(json.dumps(metadata,indent=2)+'\n');print(json.dumps(metadata),flush=True)

if __name__=='__main__':
 if '--worker' in sys.argv:worker()
 else:
  if not SOURCE.is_file():raise SystemExit('Download the reviewed local source first')
  subprocess.run(['/usr/bin/blender','--background','--threads','2','--python-exit-code','1','--python',str(Path(__file__).resolve()),'--','--worker'],check=True,cwd=ROOT)
