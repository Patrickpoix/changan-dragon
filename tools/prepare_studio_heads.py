#!/usr/bin/env python3
"""blender -b --disable-autoexec -t 2 -P tools/prepare_studio_heads.py
Neutral static topology studies; not a rig conversion or approved Tang character.
"""
import bpy,json,hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'assets/library/characters/blender-studio'
for name,filename in [('snow','snow_v02.blend'),('rain','rain_rig.blend')]:
    folder=BASE/name;bpy.ops.wm.open_mainfile(filepath=str(folder/filename),load_ui=False,use_scripts=False)
    if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
    def mat(label,rgb,rough=.75):
        m=bpy.data.materials.new(label);m.use_nodes=True;m.diffuse_color=(*rgb,1);p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*rgb,1);p.inputs['Roughness'].default_value=rough;return m
    skin=mat('neutral warm skin topology study',(.56,.36,.24));hair=mat('dark hair topology study',(.035,.028,.024));white=mat('eye whites',(.8,.75,.63),.38);iris=mat('warm iris',(.08,.045,.018),.32);mouth=mat('mouth interior',(.16,.048,.04));teeth=mat('teeth ivory',(.72,.66,.54))
    eye_path=folder/('maps/bake/eyes_diffuse.png' if name=='snow' else 'maps/TEX-rain_eyes_diffuse.png')
    eye_image=bpy.data.images.load(str(eye_path),check_existing=False);eye_image.scale(512,512)
    eye_node=white.node_tree.nodes.new('ShaderNodeTexImage');eye_node.image=eye_image
    white.node_tree.links.new(eye_node.outputs['Color'],white.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    selected=[]
    for obj in list(bpy.data.objects):
        if obj.type!='MESH' or not obj.name.startswith('GEO-'+name+'_'):continue
        suffix=obj.name.split('GEO-'+name+'_',1)[1]
        include=suffix in ['head','eyebrows','eyelashes','eyes','hair_base','hair_main','hair_ponytail','hair_strand','teeth_upper','teeth_lower','tongue','gums_lower','gums_upper']
        if not include:continue
        # Drop Blender-only constraints, drivers and rig dependencies in this
        # static proof, while preserving untouched original .blend for rig work.
        obj.hide_set(False);obj.hide_viewport=False;obj.hide_render=False
        for mod in obj.modifiers:
            if mod.type not in ['MIRROR','SUBSURF']:mod.show_viewport=False;mod.show_render=False
            if mod.type=='SUBSURF':mod.levels=0;mod.render_levels=0
        bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get();ev=obj.evaluated_get(dg)
        g=bpy.data.meshes.new_from_object(ev,preserve_all_data_layers=True,depsgraph=dg);new=bpy.data.objects.new('study-'+suffix,g);bpy.context.scene.collection.objects.link(new);new.matrix_world=obj.matrix_world.copy()
        old_slots=[m.name.lower() if m else '' for m in g.materials]
        g.materials.clear()
        if suffix=='head':g.materials.append(skin)
        elif suffix.startswith('hair') or suffix in ['eyebrows','eyelashes']:g.materials.append(hair)
        elif suffix=='eyes':
            g.materials.append(white);g.materials.append(iris)
            # Keep original eye-region material separation if present; source
            # texture baking for exact iris/pupil appearance remains a G1 task.
            for p in g.polygons:p.material_index=1 if 'iris' in (old_slots[p.material_index] if p.material_index<len(old_slots) else '') else 0
        elif 'teeth' in suffix:g.materials.append(teeth)
        else:g.materials.append(mouth)
        for p in g.polygons:p.use_smooth=True
        new['attribution']=name.title()+' by Blender Studio, CC BY 4.0; neutral static head conversion by Changan Dragon project'
        new['source_page']='https://studio.blender.org/characters/'+name+'/v2/'
        selected.append(new)
    # Build a clean scene so custom bone widgets, helpers and modern clothes
    # cannot accidentally leak into the exported object list.
    bpy.ops.object.select_all(action='DESELECT')
    for o in selected:o.select_set(True)
    if not selected:raise RuntimeError('No studio head geometry')
    for o in list(bpy.context.scene.objects):
        if o not in selected:bpy.data.objects.remove(o,do_unlink=True)
    bpy.context.view_layer.update()
    points=[o.matrix_world@Vector(v) for o in selected for v in o.bound_box]
    centre=Vector(((min(p.x for p in points)+max(p.x for p in points))/2,(min(p.y for p in points)+max(p.y for p in points))/2,min(p.z for p in points)))
    for o in selected:o.location-=centre
    dest=folder/'head-study.glb';bpy.ops.export_scene.gltf(filepath=str(dest),export_format='GLB',use_selection=True,export_extras=True,export_animations=False)
    triangles=0
    for o in selected:o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
    (folder/'head-study.json').write_text(json.dumps({'status':'static_neutral_head_topology_study','source':filename,'generator':'tools/prepare_studio_heads.py','generator_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'file':dest.name,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'triangles':triangles,'license':'CC-BY-4.0','attribution':name.title()+' by Blender Studio, https://studio.blender.org/characters/'+name+'/v2/, CC BY 4.0. Modified: neutral static head geometry, rig and clothing excluded.','final_art_accepted':False,'rig_exported':False,'runtime_integrated':False,'limitations':['Static base topology, source expressions/rig remain only in original blend','Neutral replacement materials; original skin and eye shaders not baked','Modern hair/face styling requires Tang and film-style adaptation','Base hair silhouettes may require subdivision/bake before art review']},ensure_ascii=False,indent=2)+'\n')
    print('STUDIO HEAD',name,triangles,dest.stat().st_size)
