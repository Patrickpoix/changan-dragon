#!/usr/bin/env python3
"""Blender development tool: complete three-bay timber shop modeling sample.

Run node tools/export_bracket_component.mjs, then:
blender -b -t 2 -P tools/build_timber_shop.py

The sample is not automatically deployed throughout the city. Dimensions,
structure, full roof shell, rafters, tile courses and openings are editable
here. The bracket component reuses the existing MIT miniLibs-derived port.
No movie artwork or film production meshes are included.
"""
import bpy, math, json, hashlib
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
BUILD_SOURCE_SHA=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
OUT=ROOT/'assets/library/architecture/timber-shop'
OUT.mkdir(parents=True,exist_ok=True)
SOURCE=Path('/workspace/.environment/changan-dragon/timber-shop-source.blend')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for block in list(bpy.data.materials):bpy.data.materials.remove(block)

def linear(v):
    x=v/255
    return x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4

def mat(name,hexcolour,rough=.8):
    m=bpy.data.materials.new(name);m.use_nodes=True
    rgb=tuple(linear((hexcolour>>shift)&255) for shift in [16,8,0])
    m.diffuse_color=(*rgb,1)
    bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*rgb,1)
    bs.inputs['Roughness'].default_value=rough
    return m

M={
 'timber':mat('Warm weathered structural timber',0x82503a,.77),
 'column':mat('Muted vermilion columns',0x934b37,.78),
 'edge':mat('Freshly cut end grain and joinery',0xb1895b,.82),
 'dark':mat('Recessed dark timber',0x4f3b2d,.87),
 'plaster':mat('Warm lime plaster',0xd4c5a2,.96),
 'stone':mat('Pale worn stone',0xb8b2a0,.95),
 'paper':mat('Muted window paper',0x9c9b7d,1),
 'roofUnder':mat('Shadowed tile underside',0x414a49,.92),
}
for i,c in enumerate([0x68777b,0x647378,0x6e7d80,0x728083]):M['tile'+str(i)]=mat('Grey clay tile '+str(i),c,.87)

def finish(obj,material,bevel=0,smooth=False):
    obj.data.materials.append(M[material]);obj.name=material+'-'+obj.name
    if bevel:
        mod=obj.modifiers.new('Physical edge bevel','BEVEL');mod.width=bevel;mod.segments=1 if min(obj.dimensions)<.10 else 2
        bpy.context.view_layer.objects.active=obj;bpy.ops.object.modifier_apply(modifier=mod.name)
        for p in obj.data.polygons:p.use_smooth=True
        normals=obj.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL');normals.keep_sharp=True
        bpy.ops.object.modifier_apply(modifier=normals.name)
    elif smooth:
        for p in obj.data.polygons:p.use_smooth=True
    return obj

def box(name,loc,size,material='timber',bevel=.015,angle=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name
    o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.rotation_euler.z=angle
    return finish(o,material,min(bevel,min(size)*.2) if bevel else 0)

def column(name,x,y,z0,z1,r=.15,material='column'):
    bpy.ops.mesh.primitive_cone_add(vertices=20,radius1=r,radius2=r*.91,depth=z1-z0,location=(x,y,(z0+z1)/2))
    o=bpy.context.object;o.name=name;return finish(o,material,.012,True)

def curve(name,points,r=.05,material='timber',resolution=2):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=resolution
    s=c.splines.new('POLY');s.points.add(len(points)-1)
    for p,xyz in zip(s.points,points):p.co=(*xyz,1)
    c.bevel_depth=r;c.bevel_resolution=1;c.use_fill_caps=True
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o)
    c.materials.append(M[material]);return o

def mesh(name,vertices,faces,material,smooth=False):
    g=bpy.data.meshes.new(name);g.from_pydata(vertices,[],faces);g.update()
    o=bpy.data.objects.new(name,g);bpy.context.collection.objects.link(o)
    return finish(o,material,smooth=smooth)

W,D,FLOOR,UPPER,EAVE=10.8,7.2,.42,3.95,6.95
XS=[-W/2+i*W/3 for i in range(4)]
side_windows=[]
def side_wall_panel(side,a,b,z0,z1,wz,wh):
    cy=(a+b)/2;span=b-a-.24;ww=span*.62;bottom=wz-wh/2;top=wz+wh/2;x=side*(W/2-.08)
    box('side sill wall',(x,cy,(z0+bottom)/2),(.14,span,bottom-z0),'plaster',.012)
    box('side lintel wall',(x,cy,(top+z1)/2),(.14,span,z1-top),'plaster',.012)
    jamb=(span-ww)/2
    for end in [-1,1]:box('side window jamb',(x,cy+end*(ww/2+jamb/2),wz),(.14,jamb,wh),'plaster',.01)
    side_windows.append((side,cy,wz,ww,wh))

box('continuous stone footing',(0,0,.18),(W+.8,D+.8,.36),'stone',.055)
box('stone platform cap',(0,0,.375),(W+1.0,D+1.0,.09),'stone',.022)
for i in range(3):
    h=.14*(3-i)
    box('front approach tread',(0,-D/2-.75-i*.34,h/2),(5.8,.58,h),'stone',.025)

# Lower rooms have three genuine outer walls and open front bays.
for side in [-1,1]:
    for a,b in [(-3.6,0),(0,3.6)]:
        side_wall_panel(side,a,b,FLOOR,3.45,2.18,1.10)
        for z in [.75,2.9,3.40]:box('side continuous rail',(side*(W/2+.01),(a+b)/2,z),(.16,b-a,.14),'timber')
    for y in [-3.6,0,3.6]:
        column('ground floor column',side*W/2,y,FLOOR,3.65)
        box('stone column foot',(side*W/2,y,FLOOR+.08),(.49,.49,.16),'stone',.03)
for x in XS[1:-1]:
    for y in [-3.6,3.6]:
        column('ground floor column',x,y,FLOOR,3.65)
        box('stone column foot',(x,y,FLOOR+.08),(.49,.49,.16),'stone',.03)
for y in [-3.6,3.6]:box('ground floor spanning lintel',(0,y,3.45),(W+.26,.24,.30),'timber',.022)
for x in XS:box('first floor transverse joist',(x,0,3.74),(.23,D+.5,.30),'timber',.02)
box('upper floor structure',(0,-.1,UPPER-.11),(W+.18,D+.6,.22),'dark',.014)
for i in range(40):
    box('individual upper gallery board',(-W/2+(i+.5)*W/40,-2.92,UPPER+.015),(W/40-.012,2.1,.04),'edge',.006)

def screen(name,cx,y,z,width,height,paper=True):
    if paper:box(name+' paper',(cx,y+.06,z),(width-.06,.018,height-.06),'paper',0)
    for side in [-1,1]:
        box(name+' stile',(cx+side*width/2,y,z),(.07,.10,height+.08),'edge',.009)
        box(name+' rail',(cx,y,z+side*height/2),(width,.10,.075),'edge',.009)
    count=max(4,round(width/.20))
    for i in range(1,count):box(name+' mullion',(cx-width/2+i*width/count,y-.015,z),(.027,.065,height),'edge',.004)
    for f in [-.26,0,.26]:box(name+' transom',(cx,y-.025,z+height*f),(width,.068,.03),'edge',.004)

# The room frontage is recessed from the column line, leaving a walk-in porch.
for i in range(3):
    cx=(XS[i]+XS[i+1])/2
    if i!=1:
        box('lower recessed shop counter',(cx,-2.0,.91),(2.8,.58,.98),'timber',.025)
        screen('ground shop side screen',cx,-1.95,2.40,2.8,1.22,False)
    for side in [-1,1]:box('recessed storefront jamb',(cx+side*1.48,-1.92,1.85),(.15,.20,2.85),'column')
    box('storefront lintel',(cx,-1.92,3.20),(3.12,.22,.22),'timber')
    box('upper lower wall panel',(cx,-1.84,4.40),(3.3,.14,.76),'plaster',.01)
    box('upper room transom band',(cx,-1.84,6.67),(3.3,.14,.45),'plaster',.01)
    screen('recessed upper lattice',cx,-1.96,5.68,2.78,1.48)
    for side in [-1,1]:
        box('upper window side wall',(cx+side*1.56,-1.84,5.68),(.35,.14,1.48),'plaster',.01)
        box('upper window shutter',(cx+side*1.50,-2.09,5.68),(.27,.065,1.59),'timber',.009,side*.68)
    # Back facade has the same articulated bays, rather than a blank box.
    for lower,upper in [(FLOOR,3.45),(UPPER,6.7)]:
        mid=(lower+upper)/2
        box('back lower wall panel',(cx,D/2-.08,lower+.52),(3.3,.14,1.0),'plaster')
        box('back upper wall panel',(cx,D/2-.08,upper-.26),(3.3,.14,.52),'plaster')
        screen('back window',cx,D/2-.17,mid+.18,2.7,1.35)

# Upper side frames, real columns and a full-depth gallery.
for side in [-1,1]:
    for y in [-3.6,0,3.6]:column('upper structural column',side*W/2,y,UPPER,EAVE-.28,.14)
    for a,b in [(-1.75,0),(0,3.6)]:side_wall_panel(side,a,b,UPPER,6.7,5.65,1.35)
    for z in [4.45,6.65]:box('upper side rail',(side*(W/2+.015),.88,z),(.16,5.4,.13),'timber')
for x in XS[1:-1]:
    for y in [-3.6,3.6]:column('upper structural column',x,y,UPPER,EAVE-.28,.14)
for y in [-3.6,3.6]:box('upper frame lintel',(0,y,6.61),(W+.28,.26,.30),'timber',.018)
for x in XS:box('upper cross beam',(x,0,6.63),(.24,D+.3,.30),'timber',.018)
for y in [-3.84]:
    for z in [UPPER+.17,UPPER+.56,UPPER+1.0]:box('gallery long rail',(0,y,z),(W+.34,.12,.11),'timber')
    for i in range(13):box('gallery post',(-W/2+i*W/12,y,UPPER+.56),(.085,.12,1.14),'edge',.008)
    for i in range(12):
        cx=-W/2+(i+.5)*W/12
        for xx in [-.21,0,.21]:box('gallery openwork',(cx+xx,y,UPPER+.36),(.035,.07,.32),'timber',.005)
for side in [-1,1]:
    for z in [UPPER+.17,UPPER+1]:box('gallery end return',(side*W/2,-2.90,z),(.11,1.95,.11),'timber')

for side,cy,wz,ww,wh in side_windows:
    before=set(bpy.context.scene.objects)
    screen('side recessed lattice',0,0,wz,ww,wh)
    for o in set(bpy.context.scene.objects)-before:
        lx,ly=o.location.x,o.location.y
        o.location.x=side*(W/2+.02)-side*ly;o.location.y=cy+side*lx
        o.rotation_euler.z+=side*math.pi/2

# Authored MIT component, shared mesh data across every structural seat.
data=json.loads((OUT/'bracket-component.json').read_text())
pts=[(data['positions'][i],-data['positions'][i+2],data['positions'][i+1]) for i in range(0,len(data['positions']),3)]
bracket_mesh=bpy.data.meshes.new('miniLibs MIT bracket');bracket_mesh.from_pydata(pts,[],[tuple(range(i,i+3)) for i in range(0,len(pts),3)]);bracket_mesh.materials.append(M['timber'])
for x in XS:
    for side in [-1,1]:
        o=bpy.data.objects.new('licensed bracket at column head',bracket_mesh);bpy.context.collection.objects.link(o)
        o.location=(x,side*3.6,6.35);o.scale=(.64,.75,.61)

# Physical hip roof: ridge length follows width/depth, with independent faces,
# restrained eave lift, real thickness, closed rim and coherent tile/rafter flow.
RW,RD,RH=W+2.4,D+2.4,2.55
RIDGE=RW-RD
def roof_height(t,x=0,y=0):
    corner=max(abs(x)/(RW/2),abs(y)/(RD/2))
    return EAVE+RH*max(0,1-t)**1.35+.10*t**8+.10*corner**8*t**8

def face_point(kind,side,u,t):
    hx=RIDGE/2+RD/2*t;hy=RD/2*t
    x,y=(-hx+u*2*hx,side*hy) if kind=='long' else (side*hx,-hy+u*2*hy)
    return (x,y,roof_height(t,x,y))

for kind in ['long','hip']:
    for side in [-1,1]:
        verts=[face_point(kind,side,i/24,j/16) for j in range(17) for i in range(25)];faces=[]
        for j in range(16):
            for i in range(24):
                a=j*25+i;b=a+1;c=a+25;d=c+1
                for tri in [(a,b,d),(a,d,c)]:
                    v=[Vector(verts[k]) for k in tri];normal=(v[1]-v[0]).cross(v[2]-v[0])
                    if normal.length_squared<1e-12:continue
                    faces.append(tri if normal.z>0 else tuple(reversed(tri)))
        o=mesh('curved hip roof shell',verts,faces,'tile1',True)
        o.data.materials.append(M['roofUnder'])
        mod=o.modifiers.new('Closed physical roof thickness','SOLIDIFY');mod.thickness=.10;mod.offset=-1;mod.material_offset=1;mod.material_offset_rim=1
        bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)

def cap_strip(kind,fixed,side,t0,index):
    count=max(2,math.ceil((1-t0)*14));verts=[];faces=[]
    def point(t):
        x,y=(fixed,side*RD/2*t) if kind=='long' else (side*(RIDGE/2+RD/2*t),fixed)
        return Vector((x,y,roof_height(t,x,y)))
    for j in range(count+1):
        t=t0+(1-t0)*j/count;center=point(t)
        tangent=point(t+.0001)-point(t)
        across=Vector((1,0,0) if kind=='long' else (0,1,0));normal=tangent.cross(across).normalized()
        if normal.z<0:normal.negate()
        for k in range(5):
            a=k/4*math.pi;p=center+across*(math.cos(a)*.095)+normal*(math.sin(a)*.062+.006)
            verts.append(tuple(p))
    for j in range(count):
        for k in range(4):
            n=j*5+k;face=(n,n+1,n+6,n+5)
            a,b,c=(Vector(verts[i]) for i in face[:3])
            faces.append(face if (b-a).cross(c-a).z>=0 else tuple(reversed(face)))
    return mesh('continuous half round cover tile',verts,faces,'tile'+str(index%4),True)

for side in [-1,1]:
    for i in range(55):
        x=-RW/2+.16+i*(RW-.32)/54
        t0=max(.008,(abs(x)-RIDGE/2)/(RD/2)+.004)
        if t0<.96:cap_strip('long',x,side,t0,i)
    # Exposed round rafters follow the same actual roof, not a flat slab.
    for i in range(33):
        x=-W/2+i*W/32;t0=max(.64,(abs(x)-RIDGE/2)/(RD/2)+.01)
        curve('curved exposed rafter',[(x,side*RD/2*t,roof_height(t,x,side*RD/2*t)-.21) for t in [t0+(1-t0)*j/7 for j in range(8)]],.055,'edge')
    curve('curved eave fascia',[(x,side*RD/2,roof_height(1,x,side*RD/2)-.13) for x in [-RW/2+i*RW/32 for i in range(33)]],.075,'dark')
    for i in range(39):
        y=-RD/2+.16+i*(RD-.32)/38;t0=max(.008,abs(y)/(RD/2)+.005)
        if t0<.96:cap_strip('hip',y,side,t0,i)
    for other in [-1,1]:
        curve('hip junction cover tiles',[(side*(RIDGE/2+RD/2*t),other*RD/2*t,roof_height(t,side*(RIDGE/2+RD/2*t),other*RD/2*t)+.04) for t in [i/16 for i in range(17)]],.072,'tile2')
for t in [.40,.68,.91]:
    length=RIDGE+RD*t
    for side in [-1,1]:box('roof supporting purlin',(0,side*RD/2*t,roof_height(t,0,side*RD/2*t)-.30),(length,.18,.18),'timber',.018)
box('continuous grey ridge cap',(0,0,EAVE+RH+.06),(RIDGE+.35,.26,.19),'tile2',.055)
for side in [-1,1]:
    curve('restrained ridge end',[(side*(RIDGE/2-.15),0,EAVE+RH+.10),(side*(RIDGE/2+.12),0,EAVE+RH+.18),(side*(RIDGE/2+.19),0,EAVE+RH+.42),(side*(RIDGE/2+.04),0,EAVE+RH+.55)],.065,'tile2')

# Thin lower lean-to eave over the ground frontage, with a visible underside.
verts=[];faces=[]
for j in range(9):
    t=j/8
    for i in range(25):verts.append((-W/2-.6+i*(W+1.2)/24,-3.98-1.07*t,3.78-.55*t+.055*t**5))
for j in range(8):
    for i in range(24):
        a=j*25+i;faces.append((a,a+25,a+26,a+1))
o=mesh('lower street facing tiled eave',verts,faces,'tile0',True)
solid=o.modifiers.new('Lower eave thickness','SOLIDIFY');solid.thickness=.085;solid.offset=-1
bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=solid.name)
for i in range(44):
    x=-W/2-.42+i*(W+.84)/43
    curve('lower tile roll',[(x,-3.98-1.07*t,3.78-.55*t+.055*t**5+.035) for t in [j/6 for j in range(7)]],.045,'tile'+str(i%4))
box('lower eave fascia',(0,-5.05,3.22),(W+1.2,.12,.14),'dark',.015)

# Preserve editable source before joining runtime material batches.
SOURCE.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE))
for o in list(bpy.context.scene.objects):
    if o.type=='CURVE':
        bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
bpy.ops.object.select_all(action='DESELECT')
for material in M.values():
    group=[o for o in bpy.context.scene.objects if o.type=='MESH' and len(o.data.materials)==1 and o.data.materials[0]==material]
    if not group:continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in group:o.select_set(True)
    bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join();bpy.context.object.name='runtime-'+material.name
runtime=OUT/'runtime.glb'
credit_root=bpy.data.objects.new('Timber shop - project sample and third-party notices',None)
bpy.context.collection.objects.link(credit_root)
credit_root['model_source']='Editable project model generated by tools/build_timber_shop.py; not a film production asset.'
credit_root['third_party_notices']=(ROOT/'vendor/miniLibs-LICENSE.txt').read_text()
for o in list(bpy.context.scene.objects):
    if o!=credit_root:o.parent=credit_root
bpy.ops.export_scene.gltf(filepath=str(runtime),export_format='GLB',export_apply=True,export_yup=True,export_materials='EXPORT',export_animations=False,export_extras=True)
triangles=sum(len(p.vertices)-2 for o in bpy.context.scene.objects if o.type=='MESH' for p in o.data.polygons)
info={'status':'modeling sample; not yet cinematic art acceptance or city deployment','generator':'tools/build_timber_shop.py','generatorSha256':BUILD_SOURCE_SHA,'blenderVersion':bpy.app.version_string,'units':'metres','dimensions':{'frontage':W,'roomDepth':D,'platform':FLOOR,'galleryFloor':UPPER,'eave':EAVE,'roofRise':RH},'triangles':triangles,'runtimeBytes':runtime.stat().st_size,'sha256':hashlib.sha256(runtime.read_bytes()).hexdigest(),'editableSource':str(SOURCE),'thirdParty':[{'component':'dougong','source':'existing src/10-world.js miniLibsBracketGeometry, EMPTY / miniLibs','license':'MIT','notice':'vendor/miniLibs-LICENSE.txt'}],'filmArtworkIncluded':False}
temporary=OUT/'manifest.json.tmp';temporary.write_text(json.dumps(info,ensure_ascii=False,indent=2));temporary.replace(OUT/'manifest.json');print('TIMBER_SAMPLE',json.dumps(info),flush=True)
