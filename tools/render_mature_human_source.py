#!/usr/bin/env python3
"""Inspect the acquired Einar source with original materials, without executing its scripts.
This is a Blender source render, not a Three browser/game screenshot.
"""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
import argparse,sys
parser=argparse.ArgumentParser();parser.add_argument('--samples',type=int,default=256);parser.add_argument('--resolution',type=int,default=1000);parser.add_argument('--guides',action='store_true');parser.add_argument('--source-dir',type=Path,default=Path('/workspace/.environment/changan-dragon/mature-character-sources/einar'));parser.add_argument('--output',type=Path,default=Path('/workspace/.environment/changan-dragon/einar-clean-source.png'));args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []);folder=args.source_dir
bpy.ops.wm.open_mainfile(filepath=str(folder/'einar_release_v1.blend'),use_scripts=False,load_ui=False)
# Preserve original artist materials. Only isolate the head and set a neutral studio.
selected=[]
for o in bpy.data.objects:
 keep=o.name in ['GEO-einar_head','Eye_Sphere.L','Eye_Sphere.R','GEO-einar_teeth_lower','GEO-einar_teeth_upper','GEO-einar_hat'] or (o.type=='CURVES' and any(k in o.name for k in ['beard','mustache','eyebrow','eyelash','hair']))
 if o.type not in ['ARMATURE','EMPTY','CAMERA','LIGHT']:o.hide_render=not keep
 if keep:selected.append(o.name)
 for m in o.modifiers:
  if m.type=='SUBSURF':m.levels=min(m.levels,2);m.render_levels=min(m.render_levels,2)
# Build a clean review scene rather than rendering the artist's entire
# collection-instancing/compositor setup. Source mesh/material data is retained.
review=bpy.data.scenes.new('Einar original material source review')
for name in selected:review.collection.objects.link(bpy.data.objects[name])
for obj in bpy.data.objects:
 if obj.type=='ARMATURE':
  review.collection.objects.link(obj)
  if obj.animation_data:obj.animation_data_clear()
  for pb in obj.pose.bones:
   pb.location=(0,0,0);pb.rotation_mode='QUATERNION';pb.rotation_quaternion=(1,0,0,0);pb.scale=(1,1,1)
for name in selected:
 obj=bpy.data.objects[name]
 if obj.type=='MESH' and obj.data.shape_keys:
  for key in obj.data.shape_keys.key_blocks:key.value=0
bpy.context.window.scene=review

# Resolve the downloaded original relative paths; no fake replacement skin.
for im in bpy.data.images:
 if im.source in ['FILE','TILED'] and not im.packed_file:
  relative=im.filepath.replace('\\','/').split('textures/',1)[-1]
  path=folder/'textures'/relative
  if path.exists():im.filepath=str(path)
head=bpy.data.objects['GEO-einar_head'];bpy.context.view_layer.update();pts=[head.matrix_world@Vector(v) for v in head.bound_box];lo=Vector([min(p[i] for p in pts) for i in range(3)]);hi=Vector([max(p[i] for p in pts) for i in range(3)]);centre=(lo+hi)/2;span=(hi-lo).length
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=args.samples;scene.cycles.use_denoising=False;scene.cycles.max_bounces=5;scene.render.resolution_x=args.resolution;scene.render.resolution_y=int(args.resolution*1.125);scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('neutral source review world');scene.world.use_nodes=True;scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.15,.17,.18,1);scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.55
for name,offset,energy,size in [('key',(1.2,-1.7,1.5),220,1.4),('fill',(-1.5,-.8,.7),100,1.3),('rim',(1,1.1,1),260,1.)]:
 data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.shape='DISK';data.size=size;o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=centre+Vector(offset);o.rotation_euler=(centre-o.location).to_track_quat('-Z','Y').to_euler()
camdata=bpy.data.cameras.new('source review camera');cam=bpy.data.objects.new('source review camera',camdata);scene.collection.objects.link(cam);scene.camera=cam;camdata.type='ORTHO';camdata.ortho_scale=max(.65,(hi.z-lo.z)*1.8);cam.location=centre+Vector((.5,-1.2,.15));cam.rotation_euler=(centre-cam.location).to_track_quat('-Z','Y').to_euler();scene.view_settings.view_transform='AgX'
scene.use_nodes=False;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(args.output)
Path('/workspace/.environment/changan-dragon/einar-render-setup.json').write_text(json.dumps({'scope':'Original mature source materials, neutral head-only studio; no Tang conversion or browser export','selected_objects':selected,'head_bounds':[list(lo),list(hi)],'scripts_enabled':False,'render':f'Cycles CPU {args.samples} samples; neutral source pose, {scene.render.resolution_x}x{scene.render.resolution_y}, guides={args.guides}'},indent=2))
if args.guides:
 scene.cycles.use_denoising=False
 scene.view_layers[0].cycles.denoising_store_passes=True
 scene.use_nodes=True
 tree=scene.node_tree;tree.nodes.clear();layer=tree.nodes.new('CompositorNodeRLayers');composite=tree.nodes.new('CompositorNodeComposite');tree.links.new(layer.outputs['Image'],composite.inputs['Image'])
 for name,socket in [('color','Image'),('albedo','Denoising Albedo'),('normal','Denoising Normal')]:
  out=tree.nodes.new('CompositorNodeOutputFile');out.base_path=str(args.output.parent);out.file_slots[0].path=args.output.stem+'-'+name+'-';out.format.file_format='OPEN_EXR';out.format.color_depth='32';tree.links.new(layer.outputs[socket],out.inputs[0])
bpy.ops.render.render(write_still=True)
if args.guides:
 import array
 for role in ['color','albedo','normal']:
  path=args.output.parent/(args.output.stem+'-'+role+'-0001.exr');im=bpy.data.images.load(str(path),check_existing=False);w,h=im.size;buf=array.array('f',[0])*(w*h*4);im.pixels.foreach_get(buf);rgb=array.array('f',(buf[i+j] for i in range(0,len(buf),4) for j in range(3)));dest=path.with_suffix('.pfm');dest.write_bytes(f'PF\n{w} {h}\n-1.0\n'.encode()+rgb.tobytes())

print('EINAR ORIGINAL SHADING RENDER COMPLETE')
