#!/usr/bin/env python3
"""Blender -b --disable-autoexec -t 2 -P tools/prepare_mature_dragons.py.
Acquired source sculpt -> silhouette LOD -> new UV atlas -> high/low PBR bake.
Do not directly shrink the original dense UV atlas: that causes seam bleeding.
These are honest static donor studies, not an animated Chinese game hero.
"""
import sys
if '--allow-rejected-conversion-experiment' not in sys.argv:
 raise SystemExit('Disabled: user prioritizes original high-resolution models. This rejected reduction experiment requires explicit diagnostic flag; it must never generate desktop defaults.')

import bpy,json,hashlib,numpy as np
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'assets/library/dragons/grab3d'

def image(name,colour=False):
 im=bpy.data.images.new(name,width=1024,height=1024,alpha=True);im.colorspace_settings.name='sRGB' if colour else 'Non-Color';return im

def bake(high,low,im,kind,diag):
 bpy.ops.object.select_all(action='DESELECT');high.select_set(True);low.select_set(True);bpy.context.view_layer.objects.active=low
 mat=low.data.materials[0];node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=im;mat.node_tree.nodes.active=node
 bpy.ops.object.bake(type=kind,use_selected_to_active=True,cage_extrusion=diag*.006,max_ray_distance=diag*.025,margin=16,margin_type='EXTEND',normal_space='TANGENT')
 mat.node_tree.nodes.remove(node)

def emit_source(material,socket):
 nodes=material.node_tree.nodes;links=material.node_tree.links;output=next(n for n in nodes if n.type=='OUTPUT_MATERIAL');original=output.inputs['Surface'].links[0].from_socket;em=nodes.new('ShaderNodeEmission')
 if socket.is_linked:links.new(socket.links[0].from_socket,em.inputs['Color'])
 else:
  val=socket.default_value;em.inputs['Color'].default_value=tuple(val) if hasattr(val,'__len__') else (val,val,val,1)
 links.new(em.outputs[0],output.inputs['Surface'])
 return output,original,em

for kind in ['cartoon-dragon','chinese-dragon']:
 folder=BASE/kind;source=folder/'source.glb';manifest=json.loads((folder/'manifest.json').read_text());record=next(x for x in manifest['files'] if x['file']=='source.glb');assert hashlib.sha256(source.read_bytes()).hexdigest()==record['sha256']
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);bpy.ops.import_scene.gltf(filepath=str(source));high=next(o for o in bpy.context.scene.objects if o.type=='MESH' and len(o.data.polygons));high.name=kind+' original high resolution sculpt'
 high.data.calc_loop_triangles();before=len(high.data.loop_triangles);original_mat=high.data.materials[0];principled=next(n for n in original_mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 low=high.copy();low.data=high.data.copy();bpy.context.collection.objects.link(low);low.name=kind+' rebaked inspection LOD';bpy.context.view_layer.objects.active=low
 bpy.ops.object.select_all(action='DESELECT');low.select_set(True);mod=low.modifiers.new('silhouette preserving inspection decimation','DECIMATE');mod.ratio=min(1,45000/before);mod.use_collapse_triangulate=True;bpy.ops.object.modifier_apply(modifier=mod.name)
 if low.data.has_custom_normals:bpy.ops.mesh.customdata_custom_splitnormals_clear()
 for p in low.data.polygons:p.use_smooth=True
 # New charts make the 1K texture footprint meaningful after simplification.
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.151917,island_margin=.025,area_weight=.15);bpy.ops.object.mode_set(mode='OBJECT')
 material=bpy.data.materials.new(kind+' rebaked original PBR');material.use_nodes=True;low.data.materials.clear();low.data.materials.append(material)
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=4;scene.cycles.use_denoising=False;scene.render.bake.use_clear=True;diag=max(.1,high.dimensions.length)
 maps={role:image(kind+' '+role,role=='basecolor') for role in ['basecolor','roughness','metallic','normal']}
 for role,socket_name in [('basecolor','Base Color'),('roughness','Roughness'),('metallic','Metallic')]:
  output,original,em=emit_source(original_mat,principled.inputs[socket_name]);bake(high,low,maps[role],'EMIT',diag);original_mat.node_tree.links.new(original,output.inputs['Surface']);original_mat.node_tree.nodes.remove(em)
 bake(high,low,maps['normal'],'NORMAL',diag)
 rough=np.empty(1024*1024*4,dtype=np.float32);metal=np.empty_like(rough);maps['roughness'].pixels.foreach_get(rough);maps['metallic'].pixels.foreach_get(metal);rgba=np.ones((1024*1024,4),dtype=np.float32);rgba[:,1]=rough.reshape(-1,4)[:,0];rgba[:,2]=metal.reshape(-1,4)[:,0]
 orm=image(kind+' ORM');orm.pixels.foreach_set(rgba.ravel());orm.update()
 nodes=material.node_tree.nodes;links=material.node_tree.links;bsdf=nodes.get('Principled BSDF')
 for role,im in [('basecolor',maps['basecolor']),('normal',maps['normal']),('orm',orm)]:
  im.file_format='PNG';im.pack();node=nodes.new('ShaderNodeTexImage');node.image=im
  if role=='basecolor':links.new(node.outputs['Color'],bsdf.inputs['Base Color'])
  elif role=='normal':
   normal=nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=1;links.new(node.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs[0],bsdf.inputs['Normal'])
  else:
   channels=nodes.new('ShaderNodeSeparateColor');links.new(node.outputs['Color'],channels.inputs[0]);links.new(channels.outputs['Green'],bsdf.inputs['Roughness']);links.new(channels.outputs['Blue'],bsdf.inputs['Metallic'])
 low['source_url']=manifest['source_page'];low['license']='CC0-1.0 / Grab3D; LICENSE.txt retained';low['origin']='AI-assisted static Meshy/Blender source, not a rigged game character';low['derivation']='45k silhouette geometry, new 1K atlas with 16px padding, original high-to-low base colour/normal/roughness/metallic rebake'
 bpy.data.objects.remove(high,do_unlink=True);bpy.ops.object.select_all(action='DESELECT');low.select_set(True);bpy.context.view_layer.objects.active=low
 path=folder/'inspection-lod.glb';bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_yup=True,export_extras=True,export_animations=False,export_tangents=True)
 low.data.calc_loop_triangles();output={'file':path.name,'source_sha256':record['sha256'],'generator':'tools/prepare_mature_dragons.py','generator_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'source_triangles':before,'triangles':len(low.data.loop_triangles),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'textures':[{'role':role,'size':[1024,1024]} for role in ['basecolor','normal','ORM']],'uv_and_bake':'New Smart UV charts, 16px dilated margins, selected high-to-low emission-channel and tangent-normal baking; original dense atlas not directly downsampled','runtime_integrated':False,'final_art_accepted':False,'scope':'Rebaked static inspection donor, no hero redesign, wing removal, retopology rig or animation claimed'}
 (folder/'inspection-lod.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n');print('SOURCE PBR REBAKE',kind,output['triangles'],output['bytes'],flush=True)
