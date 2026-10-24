#!/usr/bin/env python3
"""blender -b --disable-autoexec -t 2 -P tools/build_unified_study.py
Existing independent architecture/landscape/material study plus new natural
adult character studies. Static pose bake only; never deploys to the game.
"""
import bpy,json,hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/library/preparation-study';SOURCE=OUT/'assembly.glb';CHAR=ROOT/'assets/library/characters/tang-studies'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(SOURCE))
removed=[]
old_people=[obj for obj in bpy.context.scene.objects if obj.type=='EMPTY' and obj.name in ['round collar resident','ruqun resident']]
for obj in old_people:
 if obj.name:
  for child in list(obj.children_recursive):bpy.data.objects.remove(child,do_unlink=True)
  removed.append(obj.name);bpy.data.objects.remove(obj,do_unlink=True)
assert len(removed)==2,removed
choices=[]
for kind,position,clip in [('male',(-2.3,-3.4,0),'OfferTray'),('female',(-1.3,-3.4,0),'InspectFabric')]:
 before=set(bpy.context.scene.objects);bpy.ops.import_scene.gltf(filepath=str(CHAR/(kind+'.glb')));imported=set(bpy.context.scene.objects)-before
 action_names=[]
 for obj in imported:
  if not obj.animation_data:continue
  obj.animation_data.action=None
  for track in obj.animation_data.nla_tracks:
   names=[strip.action.name for strip in track.strips];match=any(clip in name for name in names);track.mute=not match
   if match:action_names+=names
 assert action_names,(kind,'No imported matching animation')
 # Importer stores clips in NLA strips; evaluate a genuine work mid-pose.
 bpy.context.scene.frame_set(25);bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
 root=bpy.data.objects.new(kind+' natural connected tailoring static pose',None);bpy.context.collection.objects.link(root);root.location=position;root['source_clip']=clip;root['status']='Static evaluated bake of actual rig for joint scale/material inspection, not replacement NPC animation'
 for obj in imported:
  if obj.type!='MESH' or obj.hide_render or obj.name.startswith('Icosphere') or not len(obj.data.materials):continue
  evaluated=obj.evaluated_get(deps);g=bpy.data.meshes.new_from_object(evaluated,preserve_all_data_layers=True,depsgraph=deps);g.transform(obj.matrix_world)
  # Remove collapsed inactive prop remnants so Box3 and scene costs are honest.
  # Faces whose evaluated world-space area is effectively zero are not content.
  import bmesh
  bm=bmesh.new();bm.from_mesh(g);bmesh.ops.delete(bm,geom=[f for f in bm.faces if f.calc_area()<1e-10],context='FACES');loose=[v for v in bm.verts if not v.link_faces]
  if loose:bmesh.ops.delete(bm,geom=loose,context='VERTS')
  bm.to_mesh(g);bm.free()
  if not g.polygons:bpy.data.meshes.remove(g);continue
  baked=bpy.data.objects.new(kind+' '+obj.name,g);bpy.context.collection.objects.link(baked);baked.parent=root
 for obj in imported:bpy.data.objects.remove(obj,do_unlink=True)
 choices.append({'excluded_importer_helpers':True,'type':kind,'source':str((CHAR/(kind+'.glb')).relative_to(ROOT)),'sha256':hashlib.sha256((CHAR/(kind+'.glb')).read_bytes()).hexdigest(),'selected_clip':clip,'static_pose_frame':25,'actions':action_names,'position_blender_xyz':position})
# No live rig or discarded actions is exported from this derived static assembly.
for obj in bpy.context.scene.objects:
 if obj.animation_data:obj.animation_data_clear()
triangles=0
for obj in bpy.context.scene.objects:
 if obj.type=='MESH':obj.data.calc_loop_triangles();triangles+=len(obj.data.loop_triangles)
bpy.context.scene['status']='Unified independent construction/material/scale proof; no final film art or game integration'
bpy.context.scene['sources']='Existing full MIT timber structure + CC0 PBR/plant/source anatomy/eyes/morph assets, project-authored tailoring/props and gestures; original notices preserved in their library directories and inherited geometry extras'
path=OUT/'natural-unified.glb';bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',export_yup=True,export_extras=True,export_animations=False)
manifest={'style_rejected_by_user':True,'production_basis_allowed':False,'status':'unified_independent_static_study','generator':'tools/build_unified_study.py','generator_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'base_assembly':str(SOURCE.relative_to(ROOT)),'base_assembly_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'characters':choices,'triangles':triangles,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'runtime_integrated':False,'final_art_accepted':False,'scope':'Existing architecture/dragon/bicycle/landscape/PBR plus genuinely posed natural adult characters; static bake for unity/scale, independent GLBs retain skin/morph/animations','remaining':['Architecture/dragon/trees retain documented art shortcomings; do not infer all G1 types approved','Current character garment skin/hem/hair and production locomotion/LOD still require art and motion work','No physical-phone GPU or complete-city acceptance']}
(OUT/'natural-unified.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print('UNIFIED STUDY',triangles,path.stat().st_size,choices)
