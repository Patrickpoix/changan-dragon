#!/usr/bin/env python3
"""Blender -b -t 2 -P tools/build_boat_studies.py.

Original editable three-type boat construction studies, not archaeological
reconstructions or production art. Metres; Blender Z-up -> glTF Y-up.
No downloaded mesh, movie image, commercial pack or external texture required.
"""
import bpy, math, json, hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/library/boats/construction-studies';OUT.mkdir(parents=True,exist_ok=True)
SPEC=json.loads((ROOT/'docs/production-spec.json').read_text())

def lin(x):
    x=x/255;return x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4

def material(name,colour,rough):
    m=bpy.data.materials.new(name);m.use_nodes=True
    rgb=tuple(lin((colour>>s)&255) for s in [16,8,0]);m.diffuse_color=(*rgb,1)
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*rgb,1);p.inputs['Roughness'].default_value=rough
    return m
M={k:material(k,c,r) for k,c,r in [('wood',0x926043,.8),('hull',0x684b39,.86),('roof',0x68777b,.87),('cloth',0xd6c6a1,.91),('cushion',0x526b78,.85),('edge',0xb19a69,.74)]}

def mesh(name,v,f,mat,smooth=False):
    g=bpy.data.meshes.new(name);g.from_pydata(v,[],f);g.update();o=bpy.data.objects.new(name,g);bpy.context.collection.objects.link(o);g.materials.append(M[mat])
    for p in g.polygons:p.use_smooth=smooth
    uv=g.uv_layers.new(name='physical metre UV')
    for p in g.polygons:
        axis=max(range(3),key=lambda i:abs(p.normal[i]));axes=[i for i in range(3) if i!=axis]
        for li in p.loop_indices:
            co=g.vertices[g.loops[li].vertex_index].co;uv.data[li].uv=(co[axes[0]],co[axes[1]])
    return o

def box(name,loc,size,mat='wood',bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(M[mat])
    if bevel:
        m=o.modifiers.new('small physical worn edge','BEVEL');m.width=bevel;m.segments=2;bpy.ops.object.modifier_apply(modifier=m.name)
        m=o.modifiers.new('weighted corner normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=m.name)
    uv=o.data.uv_layers.active
    if uv:
        for p in o.data.polygons:
            axis=max(range(3),key=lambda i:abs(p.normal[i]));axes=[i for i in range(3) if i!=axis]
            for li in p.loop_indices:
                co=o.data.vertices[o.data.loops[li].vertex_index].co;uv.data[li].uv=(co[axes[0]],co[axes[1]])
    return o

def beam(name,a,b,r=.035,mat='wood',sides=8):
    a,b=Vector(a),Vector(b);d=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=sides,radius=r,depth=d.length,location=(a+b)/2);o=bpy.context.object;o.name=name;o.rotation_euler=d.to_track_quat('Z','Y').to_euler();o.data.materials.append(M[mat])
    for p in o.data.polygons:p.use_smooth=len(p.vertices)==4
    return o

def line(name,pts,r=.035,mat='wood',sides=8):
    for i in range(len(pts)-1):beam(name,pts[i],pts[i+1],r,mat,sides)

def socket(name,co,meta=None):
    o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.location=co;o['socket']=True
    if meta:o['contract']=json.dumps(meta,ensure_ascii=False)
    return o

TYPES={name:dict(cfg) for name,cfg in SPEC['small_boats'].items()}
bcfg=SPEC['barge']
TYPES['barge']={'length':bcfg['length'],'beam':bcfg['beam'],'draft':bcfg['design_draft'],'freeboard':bcfg['freeboard'],'deck':bcfg['deck_height'],'thickness':bcfg['hull_thickness']}

def hull(cfg,lod):
    n=[48,28,16][lod];k=[14,10,8][lod];v=[];f=[];L=cfg['length'];B=cfg['beam'];draft=cfg['draft'];free=cfg['freeboard'];th=cfg['thickness']
    def halfwidth(t):return B*.5*(.065+.935*math.sin(math.pi*t)**.60)
    # Both skins, top rim and end plates form one closed, consistently wound shell.
    # Cross-section from starboard sheer -> keel -> port sheer.
    for inner in [False,True]:
        for i in range(n+1):
            t=i/n;x=(t-.5)*L;rise=.30*abs(2*t-1)**4
            w=halfwidth(t)-(th if inner else 0)
            gate_drop=.12 if L>7 and abs(x)<=.90 else 0.
            for j in range(k+1):
                a=-math.pi/2+math.pi*j/k
                y=w*math.sin(a);z=-draft+rise+(free-gate_drop+draft)*abs(math.sin(a))**1.65+(th if inner else 0)
                v.append((x,y,z))
    offset=(n+1)*(k+1)
    for inner in [False,True]:
        off=offset if inner else 0
        for i in range(n):
            for j in range(k):
                a=off+i*(k+1)+j;q=(a,a+1,a+k+2,a+k+1)
                f.append(tuple(reversed(q)) if inner else q)
    for i in range(n):
        for j in [0,k]:
            a=i*(k+1)+j;b=(i+1)*(k+1)+j;q=(a,b,b+offset,a+offset)
            f.append(q if j==0 else tuple(reversed(q)))
    for i in [0,n]:
        for j in range(k):
            a=i*(k+1)+j;q=(a,a+offset,a+offset+1,a+1)
            f.append(q if i==0 else tuple(reversed(q)))
        # Skin cross section end face, required to close the original hull volume.
    o=mesh('closed inner outer planked hull',v,f,'hull',True)
    # Correct geometric orientation without relying on double-sided materials.
    bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT');o.select_set(False)
    o['construction']='Closed .035/.045/.060m transverse shell; sheer remains open above inner bottom'
    # Gunwales follow each independent hull rather than scaled houseboat meshes.
    for side in [-1,1]:
        pts=[((i/n-.5)*L,side*(halfwidth(i/n)-th/2),free+.30*abs(2*i/n-1)**4+th/2-(.12 if L>7 and abs((i/n-.5)*L)<=.90 else 0.)) for i in range(n+1)]
        line('curved gunwale',pts,.038 if L<7 else .055,sides=[8,6,5][lod])
    return o,halfwidth

def deck(cfg,lod,width):
    L=cfg['length'];z=cfg['deck'];n=[32,20,12][lod];v=[];f=[]
    for i in range(n+1):
        t=.08+.84*i/n;x=(t-.5)*L
        # Barge at sheer height; smaller craft have inset floorboards, not a lid.
        w=width(t)-cfg['thickness']-.035
        if cfg['length']<7:w*=.68
        v.extend([(x,-w,z-.07),(x,w,z-.07),(x,-w,z),(x,w,z)])
    for i in range(n):
        a=i*4;b=a+4;f.extend([(a+2,a+3,b+3,b+2),(a,b,b+1,a+1),(a,a+2,b+2,b),(a+1,b+1,b+3,a+3)])
    f.extend([(0,1,3,2),(n*4,n*4+2,n*4+3,n*4+1)])
    mesh('walkable deck solid',v,f,'wood')
    # Board seams are physical shallow strips, only near LOD; no baked sunlight.
    if lod==0:
        for i in range(1,20):
            t=.10+.80*i/20;x=(t-.5)*L;w=(width(t)-.13)*(1 if L>7 else .66)
            box('plank end joint',(x,0,z+.001),(.009,w*2,.003),'hull')
    return {'height':z,'longitudinal_range':[-L*.40,L*.40],'centre_aisle':1.2 if L>7 else .55}

def barge(lod,cfg,width):
    floor=cfg['deck'];posttop=floor+2.2;cx=[-3.3,-1.1,1.1,3.3];cy=1.29
    for x in cx:
        for y in [-cy,cy]:
            beam('cabin column',(x,y,floor),(x,y,posttop),.065,sides=[12,8,6][lod]);box('column capital',(x,y,posttop-.04),(.28,.23,.12),bevel=.01 if lod==0 else 0)
    for y in [-cy,cy]:box('longitudinal load beam',(0,y,posttop),(6.92,.15,.18))
    for x in cx:box('transverse tie beam',(x,0,posttop-.09),(.13,2.70,.15))
    # Low, broad closed hipped roof. Every side and underside is modelled.
    nx=[28,16,8][lod];ny=[16,10,6][lod];rx=3.85;ry=1.72
    def roofz(x,y):
        t=max(abs(y)/ry,max(0,(abs(x)-(rx-ry))/ry))
        t=max(0.,min(1.,t))
        return posttop+.10+.62*(1-t)**1.35+.07*t**6
    v=[];f=[]
    for lower in [False,True]:
        for i in range(nx+1):
            x=-rx+2*rx*i/nx
            for j in range(ny+1):
                y=-ry+2*ry*j/ny;v.append((x,y,roofz(x,y)-(.085 if lower else 0)))
    off=(nx+1)*(ny+1)
    for i in range(nx):
        for j in range(ny):
            a=i*(ny+1)+j;q=(a,a+ny+1,a+ny+2,a+1);f.append(q);f.append(tuple(a+off for a in reversed(q)))
    perimeter=[i*(ny+1) for i in range(nx+1)]+[nx*(ny+1)+j for j in range(1,ny+1)]+[i*(ny+1)+ny for i in range(nx-1,-1,-1)]+list(range(ny-1,0,-1))
    for a,b in zip(perimeter,perimeter[1:]+perimeter[:1]):f.append((a,b,b+off,a+off))
    mesh('four sided closed hipped roof',v,f,'roof',True)
    beam('ridge',(-2.12,0,posttop+.78),(2.12,0,posttop+.78),.060,'roof')
    if lod<2:
        for i in range(-18,19,1 if lod==0 else 3):
            x=i*.20
            for side in [-1,1]:
                pts=[(x,side*ry*j/8,roofz(x,side*ry*j/8)+.014) for j in range(9)]
                line('tile cover rolls',pts,.018 if lod==0 else .022,'roof',6)
    # Furniture on both sides leaves a clear central aisle and central cross-entry.
    for x in [-2.2,2.2]:
        for side in [-1,1]:
            box('bench seat',(x,side*.98,floor+.44),(1.70,.42,.10),bevel=.018 if lod==0 else 0)
            box('bench cushion',(x,side*.97,floor+.51),(1.58,.35,.06),'cushion',.02 if lod==0 else 0)
            for dx in [-.62,.62]:box('bench leg',(x+dx,side*.98,floor+.21),(.09,.29,.42))
            box('bench back',(x,side*1.19,floor+.72),(1.7,.07,.42))
        box('low tea table',(x,0,floor+.55),(.70,.58,.08),bevel=.012 if lod==0 else 0)
        # Tables are off the through aisle: shift to an end alcove instead.
        bpy.context.object.location.x=x+(.65 if x>0 else -.65)
        for dx in [-.22,.22]:box('table pedestal',(x+(.65 if x>0 else -.65)+dx,0,floor+.26),(.08,.42,.50))
    # Rail segments omit a real 1.2m opening at midship on BOTH sides.
    for side in [-1,1]:
        y=side*1.62
        for start,end in [(-4.5,-.60),(.60,4.5)]:
            for z in [floor+.48,floor+1.05]:box('rail with boarding gap',((start+end)/2,y,z),(end-start,.055,.06))
            count=math.ceil((end-start)/.65)
            for i in range(count+1):box('rail post',(start+(end-start)*i/count,y,floor+.52),(.065,.065,1.04))
    for x in [-4.7,4.7]:
        w=width(.5+x/12)-.17
        for z in [floor+.48,floor+1.05]:box('end railing',(x,0,z),(.06,w*2,.06))
        for y in [-w,w]:box('end post',(x,y,floor+.52),(.07,.07,1.04))
    for side in [-1,1]:socket('boarding.gate.'+str(side),(0,side*1.62,floor),{'clear_width':1.2,'must_be_docked':True})
    socket('cabin.aisle',(0,0,floor),{'clear_width':1.2,'clear_height':2.2,'avoid_tables_at_x':[-2.85,2.85]})
    socket('mooring.bow',(5.35,0,floor+.22));socket('mooring.stern',(-5.35,0,floor+.22))
    socket('helm',(-4.3,0,floor));beam('steering oar shaft',(-4.9,0,floor+.8),(-6.6,0,-.15),.04);box('steering oar blade',(-6.4,0,-.10),(.55,.08,.25),'wood')
    return {'cabin_clear_height':2.2,'boarding_gap':1.2,'aisle_centreline_x':[-2.45,2.45], 'gate_y':[-1.62,1.62], 'through_aisle_clear_width':1.2}

def small(cfg,lod,covered=False):
    floor=cfg['deck'];L=cfg['length']
    for seat_id,x in enumerate([-L*.23,0,L*.23]):
        if covered and x==0:continue
        z=cfg['freeboard']-.07
        box('removable thwart',(x,0,z),(.24,cfg['beam']*.79,.075),bevel=.012 if lod==0 else 0)
        socket('seat.'+str(seat_id),(x,0,z+.04))
    for side in [-1,1]:
        socket('rowlock.'+str(side),(-L*.23,side*cfg['beam']*.46,cfg['freeboard']))
        beam('oar shaft',(-L*.23,side*cfg['beam']*.3,cfg['freeboard']+.1),(-L*.12,side*(cfg['beam']*.5+.80),-.03),.025)
        box('oar blade',(-L*.12,side*(cfg['beam']*.5+.85),-.05),(.32,.38,.045))
    if covered:
        # Woven/clothed arched shelter, open at both ends, no Tang claim.
        radius=cfg['beam']*.47;z0=cfg['freeboard']+.63;length=2.65;n=[20,12,8][lod]
        v=[];f=[]
        for end in [-1,1]:
            for i in range(n+1):
                a=math.pi*i/n;v.append((end*length/2,radius*math.cos(a),z0+radius*math.sin(a)))
        for i in range(n):f.append((i,i+1,i+n+2,i+n+1))
        o=mesh('arched shelter cloth with real thickness',v,f,'cloth',True);m=o.modifiers.new('cloth thickness','SOLIDIFY');m.thickness=.012;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=m.name)
        for x in [-length/2,0,length/2]:
            pts=[(x,radius*math.cos(math.pi*i/n),z0+radius*math.sin(math.pi*i/n)) for i in range(n+1)]
            line('bent canopy ribs',pts,.027)
            for side in [-1,1]:beam('canopy upright',(x,side*radius,floor),(x,side*radius,z0),.033)
        socket('shelter.entrance',(length/2,0,floor),{'clear_width':1.0,'seated_passengers_only':True})
    socket('mooring.bow',(L*.43,0,cfg['freeboard']));socket('mooring.stern',(-L*.43,0,cfg['freeboard']))
    return {'rowing_seat_x':-L*.23,'standing_headroom_claim':False}

records=[]
for kind,cfg in TYPES.items():
    levels=[];interfaces=None
    for lod in range(3):
        bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
        h,width=hull(cfg,lod);walk=deck(cfg,lod,width);details=barge(lod,cfg,width) if kind=='barge' else small(cfg,lod,kind=='covered')
        socket('waterline.origin',(0,0,0),{'draft':cfg['draft'],'hydrostatics_validated':False})
        socket('deck.origin',(0,0,cfg['deck']))
        # Sockets remain separate; static geometry shares six material batches.
        socket_list={o.name:[o.location.x,o.location.z,-o.location.y] for o in bpy.context.scene.objects if o.type=='EMPTY'}
        hull_mesh=h.data;edges={}
        for p in hull_mesh.polygons:
            for e in p.edge_keys:edges[e]=edges.get(e,0)+1
        assert all(n==2 for n in edges.values()),'Hull must be closed without boundary/nonmanifold edges'
        triangles=0
        for o in list(bpy.context.scene.objects):
            if o.type!='MESH':continue
            o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
        # Bake primitive transforms before joining: a rotated active beam otherwise
        # leaves a rotated aggregate local AABB, inflating r160 bounds per LOD.
        bpy.ops.object.select_all(action='DESELECT')
        for obj in bpy.context.scene.objects:
            if obj.type=='MESH':obj.select_set(True);bpy.context.view_layer.objects.active=obj
        bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        for key,mat in M.items():
            objs=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials and o.data.materials[0]==mat]
            if not objs:continue
            bpy.ops.object.select_all(action='DESELECT')
            for o in objs:o.select_set(True)
            bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();o=bpy.context.object;o.name=kind+'.'+key
        bpy.context.scene['status']='Original construction study; no production art or historic/hydrostatic acceptance'
        bpy.context.scene['source']='tools/build_boat_studies.py; original geometry, no external samples'
        path=OUT/f'{kind}-lod{lod}.glb';bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',export_yup=True,export_extras=True)
        levels.append({'file':path.name,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'triangles':triangles,'hull_all_edges_two_faces':True,'meshes':len([o for o in bpy.context.scene.objects if o.type=='MESH'])})
        if lod==0:interfaces={'sockets_gltf_xyz':socket_list,'walkable':walk,'details':details}
    records.append({'type':kind,'parameters':cfg,'levels':levels,'interfaces':interfaces})
# Complete static boarding fixture: actual plank, dock edge and waterline.
# It is deliberately separate from the nine boat assets and game integration.
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(OUT/'barge-lod0.glb'))
floor=TYPES['barge']['deck']
box('gangplank 1.2m clear',(0,2.42,floor-.055),(1.2,1.60,.11),bevel=.012)
box('dock walking slab',(0,4.1,floor-.12),(5.0,1.80,.24),'wood',.018)
for x in [-2.1,2.1]:
    for y in [3.5,4.65]:box('pier piles continue underwater',(x,y,-.15),(.20,.20,1.40),'hull')
for y in [1.72,3.12]:
    for side in [-1,1]:
        box('gangplank edge strip',(side*.625,y,floor+.025),(.05,.16,.05),'edge')
water=material('water transparency compatibility study',0x638c88,.29)
water.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.62
water.diffuse_color=(*water.diffuse_color[:3],.62)
M['water']=water
mesh('water surface at design waterline',[(-8,-4,0),(8,-4,0),(8,5.5,0),(-8,5.5,0)],[(0,1,2,3)],'water')
socket('dock.entry',(0,4.0,floor),{'scope':'static boarding fixture; no game controller'})
bpy.context.scene['status']='Static dock and plank clearance fixture; no sailing or passenger implementation'
fixture_path=OUT/'boarding-fixture.glb'
bpy.ops.export_scene.gltf(filepath=str(fixture_path),export_format='GLB',export_yup=True,export_extras=True)
fixture={'file':fixture_path.name,'sha256':hashlib.sha256(fixture_path.read_bytes()).hexdigest(),'bytes':fixture_path.stat().st_size,'deck_and_dock_height':floor,'plank_clear_width':1.2,'scope':'static contact, full geometry and alpha-water compatibility; not actual game boarding'}
manifest={'version':1,'status':'original_construction_studies','generator':'tools/build_boat_studies.py','generator_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'source_and_rights':'Original project geometry; no third-party mesh/image/sample. Project code remains under repository terms; no blanket relicensing.','units':'metres; glTF +Y up, longitudinal +X; waterline at Y=0','runtime_integrated':False,'final_art_accepted':False,'types':records,'boarding_fixture':fixture,'remaining':['No hydrostatic stability or historically exact hull claim','No new moving passenger system or game navigation integration','Roof/wood UV/material wear and Tang-era art review remain','No painted gold motifs or historical authenticity inferred from generated concept','LOD visibility and phone GPU performance require representative scene test']}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('BOAT STUDIES',[(r['type'],[(l['triangles'],l['bytes']) for l in r['levels']]) for r in records])
