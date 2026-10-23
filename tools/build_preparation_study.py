#!/usr/bin/env python3
"""blender -b -t 2 -P tools/build_preparation_study.py

Independent, metre-scale preparation proof. Never replaces recovered assets or
the game. Source recipes, not final character topology/rigs or approved artwork.
"""
import bpy, math, json, hashlib
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'docs/production-spec.json').read_text())
OUT=ROOT/'assets/library/preparation-study'
OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def linear(x):
    x=x/255; return x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4
def material(name,colour,rough=.8,texture=None,scale=1):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    rgb=tuple(linear((colour>>i)&255) for i in [16,8,0])
    m.diffuse_color=(*rgb,1);p.inputs['Base Color'].default_value=(*rgb,1);p.inputs['Roughness'].default_value=rough
    if texture:
        nodes=m.node_tree.nodes; links=m.node_tree.links
        coord=nodes.new('ShaderNodeTexCoord'); mapping=nodes.new('ShaderNodeVectorMath'); mapping.operation='SCALE';mapping.inputs[3].default_value=scale
        links.new(coord.outputs['UV'],mapping.inputs[0])
        # Keep broad authored colour; only micro-normal/roughness from scans.
        for role in ['normal','roughness']:
            t=nodes.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(ROOT/'assets/library/production-materials'/texture/(role+'_512.png')),check_existing=True);t.image.colorspace_settings.name='Non-Color'
            links.new(mapping.outputs[0],t.inputs['Vector'])
            if role=='normal':
                n=nodes.new('ShaderNodeNormalMap');n.inputs['Strength'].default_value=SPEC['surface']['normal_strength'];links.new(t.outputs['Color'],n.inputs['Color']);links.new(n.outputs[0],p.inputs['Normal'])
            else: links.new(t.outputs['Color'],p.inputs['Roughness'])
    return m
M={
 'wood':material('warm wood micro-surface',0x926043,.79,'fine_grained_wood'),
 'bark':material('quiet willow bark',0x635446,.92,'bark_willow_02'),
 'stone':material('warm stone',0xb4ad96,.94,'grey_stone_path'),
 'earth':material('compressed earth',0xb29b76,.98,'brown_mud_02'),
 'cloth':material('indigo cloth',0x526b78,.85,'Fabric081C'),
 'silk':material('muted ochre silk silhouette',0xc29561,.75,'Fabric081C'),
 'jade':material('jade skin',0x73ac8c,.63),
 'cream':material('warm belly horn and muzzle',0xe3d7b0,.72),
 'skin':material('warm human skin',0xd3a583,.79),
 'dark':material('hair pupils and mouth',0x302e29,.72),
 'red':material('scarf and belt',0xa75c46,.82),
 'leaf':material('willow foliage',0x788d59,.9),
 'flower':material('petal warm ivory rose',0xe7b8b1,.9),
}
records={}
def finish(o,name,mat):
    o.name=name;o.data.materials.clear();o.data.materials.append(M[mat])
    for p in o.data.polygons:p.use_smooth=True
    return o
def mesh(name,v,f,mat):
    used=sorted({i for face in f for i in face});remap={old:i for i,old in enumerate(used)}
    v=[v[i] for i in used];f=[tuple(remap[i] for i in face) for face in f]
    g=bpy.data.meshes.new(name);g.from_pydata(v,[],f);g.update();o=bpy.data.objects.new(name,g);bpy.context.collection.objects.link(o);finish(o,name,mat)
    uv=g.uv_layers.new(name='metre surface UV')
    for p in g.polygons:
        axis=max(range(3),key=lambda i:abs(p.normal[i]));axes=[i for i in range(3) if i!=axis]
        for li in p.loop_indices:
            co=g.vertices[g.loops[li].vertex_index].co;uv.data[li].uv=(co[axes[0]],co[axes[1]])
    return o
def box(name,loc,size,mat='wood',bevel=.015):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);finish(o,name,mat)
    mod=o.modifiers.new('edge radius','BEVEL');mod.width=min(bevel,min(size)*.2);mod.segments=2
    bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
    return o
def ellipsoid(name,loc,size,mat='jade'):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,radius=1,location=loc);o=bpy.context.object;o.scale=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,name,mat)
def tube(name,points,r,mat='wood'):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=2;c.use_fill_caps=True
    s=c.splines.new('POLY');s.points.add(len(points)-1)
    for p,co in zip(s.points,points):p.co=(*co,1)
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);c.materials.append(M[mat]);return o
def loft(name,rings,mat,segments=48,pleats=0):
    v=[]
    for z,rx,ry,cx,cy in rings:
        for i in range(segments):
            a=2*math.pi*i/segments; k=1+pleats*math.cos(a*12)
            v.append((cx+rx*math.cos(a)*k,cy+ry*math.sin(a)*k,z))
    f=[]
    for j in range(len(rings)-1):
        for i in range(segments):a=j*segments+i;b=j*segments+(i+1)%segments;f.append((a,b,b+segments,a+segments))
    o=mesh(name,v,f,mat);mod=o.modifiers.new('real cloth thickness','SOLIDIFY');mod.thickness=.006
    bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name);return o
def group_since(before,name,loc):
    parent=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(parent)
    children=set(bpy.context.scene.objects)-before-{parent}
    for o in children:
        if o.parent not in children:o.parent=parent
    parent.location=loc;bpy.context.view_layer.update()
    return parent
def start():return set(bpy.context.scene.objects)
def human(name,loc,female=False):
    before=start();src=ROOT/'assets/library/characters/makehuman-base/base.obj'
    verts=[];faces=[];groups={};group=''
    for line in src.read_text().splitlines():
        s=line.split()
        if not s:continue
        if s[0]=='v':verts.append(tuple(map(float,s[1:4])))
        if s[0]=='g':group=s[1]
        if s[0]=='f':
            face=tuple(int(q.split('/')[0])-1 for q in s[1:]);groups.setdefault(group,set()).update(face)
            if group=='body':faces.append(face)
    target_file=ROOT/'assets/library/characters/makehuman-base'/('asian-female-young.target' if female else 'asian-male-young.target')
    for line in target_file.read_text().splitlines():
        s=line.split()
        if len(s)==4 and not s[0].startswith('#'):
            i=int(s[0]);verts[i]=tuple(a+float(b) for a,b in zip(verts[i],s[1:]))
    used=sorted({i for f in faces for i in f});remap={a:i for i,a in enumerate(used)};raw=[verts[i] for i in used]
    lo=min(p[1] for p in raw);hi=max(p[1] for p in raw);height=SPEC['characters']['female_body_height' if female else 'male_body_height'];scale=height/(hi-lo)
    # MH Y-up -> Blender Z-up. Natural anatomy, no head/eye enlargement.
    v=[]
    for x,y,z in raw:
        h=(y-lo)*scale
        v.append((x*scale,-z*scale,h))
    body_faces=[tuple(remap[i] for i in f) for f in faces]
    # Production clothing also removes occluded skin. Keep neck/head and hands;
    # the acquired full base remains untouched, so this is reproducible masking.
    visible=[f for f in body_faces if min(v[i][2] for i in f)>height*.82 or (min(abs(v[i][0]) for i in f)>.45 and min(v[i][2] for i in f)>.85)]
    mesh(name+' natural adult head neck and hands',v,visible,'skin')
    scalp=[f for f in body_faces if min(v[i][2] for i in f)>height-.08 or (min(v[i][2] for i in f)>height-.18 and min(v[i][1] for i in f)>-.045)]
    mesh(name+' fitted natural scalp hair',[(x*1.009,y*1.009,(z-height)*1.009+height) for x,y,z in v],scalp,'dark')
    ellipsoid('tied hair',(0,.025,height+.015),(.046,.047,.046),'dark')
    for label in ['helper-l-eye','helper-r-eye']:
        points=[Vector((verts[i][0]*scale,-verts[i][2]*scale,(verts[i][1]-lo)*scale)) for i in groups[label]]
        c=sum(points,Vector())/len(points)
        ellipsoid('natural size eyeball',c,(.0145,.0145,.0145),'cream')
        ellipsoid('natural iris',c+Vector((0,-.013,0)),(.0058,.0025,.0058),'dark')
        tube('natural eyebrow',[c+Vector((-.014,-.009,.022)),c+Vector((0,-.012,.025)),c+Vector((.014,-.009,.022))],.0027,'dark')
    for side in [-1,1]:
        # Sleeves are closed annular cloth sections, distinct work/ruqun widths.
        o=loft(name+' sleeve',[(0,.08,.085,0,0),(.16,.09,.085,0,0),(.38,.12 if female else .072,.085 if female else .065,0,0)],'silk' if female else 'cloth')
        o.rotation_euler.y=side*(math.pi-1.13);o.location=(side*.18,0,1.35)
        ellipsoid('shoe',(side*.10,-.035,.07),(.065,.16,.07),'dark')
    loft(name+' shaped upper garment',[(.79,.18,.13,0,0),(1.02,.18,.12,0,0),(1.23,.23,.14,0,0),(1.36,.21,.13,0,0),(1.43,.08,.075,0,0)],'silk' if female else 'cloth',pleats=.025)
    loft(name+' pleated skirt or robe',[(.14,.27,.19,0,0),(.35,.25,.18,0,0),(.65,.21,.145,0,0),(.91 if female else .83,.175,.13,0,0)],'red' if female else 'cloth',pleats=.055)
    loft(name+' belt',[(.83,.184,.137,0,0),(.87,.184,.137,0,0)],'cream')
    tube('diagonal collar seam',[(.07,-.083,1.425),(-.08,-.15,1.29),(-.13,-.14,1.16)],.012,'cream')
    return group_since(before,name,loc)
def dragon(loc):
    before=start();parts=[]
    for label,p,s in [('torso',(0,0,.51),(.24,.18,.29)),('head',(0,-.035,.89),(.275,.215,.235)),('muzzle',(0,-.205,.82),(.21,.12,.115))]:parts.append(ellipsoid(label,p,s))
    for side in [-1,1]:
        for label,p,s in [('hip',(side*.16,.03,.28),(.115,.125,.17)),('foot',(side*.16,-.07,.11),(.12,.16,.10)),('shoulder',(side*.23,-.015,.61),(.105,.095,.16)),('hand',(side*.27,-.095,.46),(.09,.10,.095))]:parts.append(ellipsoid(label,p,s))
    # Fuse main skin so head/cheeks/shoulders and hips have a shared surface.
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:o.select_set(True)
    bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();skin=parts[0];skin.name='continuous dragon skin study'
    mod=skin.modifiers.new('continuous voxel sculpt base','REMESH');mod.mode='VOXEL';mod.voxel_size=.018;mod.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=mod.name)
    mod=skin.modifiers.new('soft sculpt relaxation','SMOOTH');mod.factor=.7;mod.iterations=4;bpy.ops.object.modifier_apply(modifier=mod.name)
    ellipsoid('belly',(0,-.157,.49),(.17,.045,.225),'cream')
    for side in [-1,1]:
        # Recess eyes into head; surrounding dark rim serves as eyelid study.
        ellipsoid('eyelid',(side*.13,-.211,.925),(.103,.045,.11),'jade')
        ellipsoid('warm sclera',(side*.13,-.237,.925),(.080,.030,.088),'cream')
        ellipsoid('iris',(side*.13,-.262,.925),(.054,.012,.068),'dark')
        ellipsoid('eye glint',(side*.13-.017,-.274,.951),(.015,.006,.019),'cream')
        ellipsoid('ear',(side*.27,.02,.96),(.075,.036,.11))
        tube('soft horn',[(side*.16,.015,1.045),(side*.18,.03,1.15),(side*.15,.055,1.22)],.035,'cream')
        tube('nostril',[(side*.07,-.314,.85),(side*.085,-.31,.854)],.012,'dark')
    tube('smile',[(-.13,-.286,.80),(-.075,-.315,.778),(0,-.323,.77),(.075,-.315,.778),(.13,-.286,.80)],.008,'dark')
    tube('curved tail',[(0,.12,.43),(.13,.30,.30),(.27,.48,.22),(.38,.60,.31),(.39,.66,.42)],.075,'jade')
    loft('scarf collar',[(.695,.135,.13,0,0),(.74,.135,.13,0,0)],'red')
    for z in [.38,.52,.66,1.05]:ellipsoid('back mane',(0,.17,z),(.045,.065,.07),'cream')
    return group_since(before,'dragon 1.255m silhouette study',loc)
def bicycle(loc):
    before=start();radius=.25
    for y in [-.40,.40]:
        points=[(0,y+radius*math.cos(a*math.tau/48),.25+radius*math.sin(a*math.tau/48)) for a in range(49)];tube('wood rim',points,.023)
        for i in range(12):
            a=i*math.tau/12;tube('spoke',[(0,y,.25),(0,y+radius*.93*math.cos(a),.25+radius*.93*math.sin(a))],.008)
        tube('axle',[(-.065,y,.25),(.065,y,.25)],.025,'dark')
    for p,q in [((0,-.4,.25),(0,-.23,.64)),((0,-.23,.64),(0,.10,.57)),((0,.10,.57),(0,.4,.25)),((0,.4,.25),(0,.03,.26)),((0,.03,.26),(0,-.23,.64)),((0,.03,.26),(0,.10,.57))]:tube('joined frame',[p,q],.027)
    box('saddle',(0,.12,.63),(.16,.22,.055),'dark')
    tube('steering stem',[(0,-.23,.63),(0,-.26,.77)],.022);tube('grips',[(-.18,-.26,.77),(.18,-.26,.77)],.021)
    tube('crank',[(-.09,.03,.26),(-.09,.03,.15),(.09,.03,.37)],.012,'dark')
    for side in [-1,1]:box('pedal',(side*.12,.03,.26+side*.11),(.08,.09,.025))
    return group_since(before,'wood bicycle wheel diameter 0.50m',loc)

# Existing architecture remains untouched; imported instances are independent.
bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/library/architecture/timber-shop/runtime.glb'))
before=set()
building=group_since(before,'existing architecture study', (0,4,0))
human('round collar resident',(-2.3,-3.4,0));human('ruqun resident',(-1.3,-3.4,0),True)
dragon((0,-3.4,0));bicycle((1,-3.4,0))
# Actual alpha-mask foliage shares r160 loading with new embedded PBR textures.
before=start();bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/library/vegetation/authored-studies/willow-lod1.glb'));group_since(before,'rooted drooping willow revision',(7,2,0))
before=start();bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/library/vegetation/studies/pine-lod2.glb'));group_since(before,'recovered alpha-mask pine comparison',(-7,4,0))
box('earth study pad',(0,1,-.10),(17,16,.18),'earth')
box('stone walking strip',(0,-2.4,.015),(12,2,.03),'stone')
for i,key in enumerate(['wood','bark','stone','cloth','silk','jade','cream','red']):
    box('one metre material swatch '+key,(-5.6+i*1.6,-5.7,.10),(1,1,.2),key)
    records[key]={'baseColor_sRGB_hex':{'wood':'926043','bark':'635446','stone':'b4ad96','cloth':'526b78','silk':'c29561','jade':'73ac8c','cream':'e3d7b0','red':'a75c46'}[key]}
# Meter markers in all three axes.
for axis in range(3):
    a=Vector((-6.8,-4,0));b=a.copy();b[axis]+=1;tube('one metre axis '+str(axis),[a,b],.015,'red')

for o in list(bpy.context.scene.objects):
    if o.type=='CURVE':
        bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
bpy.context.view_layer.update()
dimensions={}
for o in bpy.context.scene.objects:
    if o.type=='EMPTY' and o.children:
        vs=[c.matrix_world@Vector(p) for c in o.children_recursive if c.type=='MESH' for p in c.bound_box]
        if vs:dimensions[o.name]=[round(max(v[i] for v in vs)-min(v[i] for v in vs),5) for i in range(3)]
triangles=0
for o in bpy.context.scene.objects:
    if o.type=='MESH':o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
bpy.context.scene['status']='Independent preparation prototype; no final art, rig or runtime approval'
bpy.context.scene['third_party']='MakeHuman core body and official adult male/female macro targets CC0, Poly Haven/ambientCG CC0, EZ-Tree MIT, miniLibs MIT; source notices preserved in adjacent source directories. Snow/Rain stylized heads rejected for this project and not included.'
bpy.ops.wm.save_as_mainfile(filepath='/workspace/.environment/changan-dragon/preparation-study.blend')
dest=OUT/'assembly.glb'
bpy.ops.export_scene.gltf(filepath=str(dest),export_format='GLB',export_yup=True,export_texcoords=True,export_normals=True,export_extras=True)
(OUT/'manifest.json').write_text(json.dumps({'status':'preparation_geometry_and_material_study','final_art_accepted':False,'runtime_integrated':False,'generator':'tools/build_preparation_study.py','generator_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'spec':'docs/production-spec.json','units':'metres; glTF Y-up; character faces +Z','triangles':triangles,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'dimensions_blender_xyz':dimensions,'palette':records,'limitations':['Unrigged character proportion and clothing prototypes; sleeve/hand and neck/face seams need production retopology','Dragon remesh is a sculpt base; eye sockets, expressions, tail continuity and rig not production-approved','Authored willow crown remains a study and architecture exceeds normal-shop LOD0 target','Physical UV study uses per-face planar mapping; seam/bake work remains','No game deployment or physical phone performance claim']},ensure_ascii=False,indent=2)+'\n')
print('PREPARATION STUDY',dest.stat().st_size,triangles,dimensions)
