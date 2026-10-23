#!/usr/bin/env python3
"""blender -b -t 2 -P tools/build_botanical_studies.py
Authored species silhouettes. Separate from, and never overwrites, EZ-Tree recovery.
"""
import bpy,math,random,json,hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/library/vegetation/authored-studies';OUT.mkdir(parents=True,exist_ok=True)
def lin(v):
    v=v/255;return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
def mat(name,hex):
    m=bpy.data.materials.new(name);m.use_nodes=True;c=tuple(lin((hex>>s)&255) for s in [16,8,0]);m.diffuse_color=(*c,1);p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=.88;return m
bark=mat('quiet bark',0x6b5949);leaf=mat('willow sage leaves',0x819459);needle=mat('pine deep green',0x526c53);petal=mat('warm ivory rose petals',0xe8bdb2);heart=mat('flower warm centres',0xbe9956)
for m in [leaf,needle,petal]:m.use_backface_culling=False
class Batch:
    def __init__(self):self.v=[];self.f=[]
    def patch(self,v,f):
        n=len(self.v);self.v.extend(v);self.f.extend(tuple(n+i for i in face) for face in f)
    def tube(self,points,radius,sides=6):
        points=[Vector(p) for p in points];v=[]
        for i,p in enumerate(points):
            tangent=(points[min(i+1,len(points)-1)]-points[max(i-1,0)]).normalized();ref=Vector((0,0,1))
            if abs(tangent.dot(ref))>.9:ref=Vector((1,0,0))
            x=tangent.cross(ref).normalized();y=tangent.cross(x).normalized();r=radius*(1-.92*i/(len(points)-1))
            for j in range(sides):v.append(p+r*(x*math.cos(j*math.tau/sides)+y*math.sin(j*math.tau/sides)))
        f=[]
        for i in range(len(points)-1):
            for j in range(sides):a=i*sides+j;b=i*sides+(j+1)%sides;f.append((a,b,b+sides,a+sides))
        f.extend([tuple(reversed(range(sides))),tuple((len(points)-1)*sides+j for j in range(sides))]);self.patch(v,f)
    def lance(self,p,d,length,width):
        p=Vector(p);d=Vector(d).normalized();x=d.cross(Vector((0,0,1)))
        if x.length<.01:x=d.cross(Vector((0,1,0)))
        x.normalize();n=x.cross(d).normalized();a=p+d*length*.42;b=p+d*length*.77
        # A bent midrib gives volume from side views, no alpha-card rectangle.
        v=[p,a-x*width,a+n*width*.3,a+x*width,b+n*width*.22,p+d*length]
        self.patch(v,[(0,1,2),(0,2,3),(1,4,2),(2,4,3),(1,5,4),(3,4,5)])
    def blossom(self,p,size,angle):
        p=Vector(p);normal=Vector((math.cos(angle)*.5,math.sin(angle)*.5,.7)).normalized();u=normal.cross(Vector((0,1,0))).normalized();v=normal.cross(u)
        for i in range(5):
            a=angle+i*math.tau/5;d=u*math.cos(a)+v*math.sin(a);s=normal.cross(d)
            self.patch([p,p+d*size*.55-s*size*.35+normal*size*.1,p+d*size+normal*size*.3,p+d*size*.55+s*size*.35+normal*size*.1],[(0,1,2),(0,2,3)])
    def object(self,name,m):
        g=bpy.data.meshes.new(name);g.from_pydata(self.v,[],self.f);g.update();o=bpy.data.objects.new(name,g);bpy.context.collection.objects.link(o);g.materials.append(m)
        for p in g.polygons:p.use_smooth=True
        uv=g.uv_layers.new(name='branch physical UV')
        for l in g.loops:
            p=g.vertices[l.vertex_index].co;uv.data[l.index].uv=(p.x+p.y,p.z)
        return o
def bezier(a,b,c,d,t):return a*(1-t)**3+3*b*t*(1-t)**2+3*c*t*t*(1-t)+d*t**3
records=[]
for species,height in [('willow',8),('blossom',5),('pine',9),('street',7)]:
    levels=[]
    for lod in range(3):
        bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
        rng=random.Random({'willow':733,'blossom':922,'pine':11744,'street':413}[species]);wood=Batch();leaves=Batch();flowers=Batch();centres=Batch()
        sides=[8,6,5][lod];stride=[1,2,4][lod];steps=[12,8,5][lod]
        trunk=[Vector((.12*math.sin(t*2),.10*math.sin(t*3),height*.83*t)) for t in [j/steps for j in range(steps+1)]];wood.tube(trunk,.23 if species!='blossom' else .16,sides)
        count=12 if species!='pine' else 15
        for i in range(count):
            a=i*2.39996+.15*math.sin(i);z=height*(.40+.38*i/(count-1));start=Vector((.1*math.sin(z/height*2),0,z))
            reach=(2.5 if species!='blossom' else 1.9)*(1-.22*i/count)
            if species=='pine':reach=3*(1-.6*i/count)
            end=start+Vector((math.cos(a)*reach,math.sin(a)*reach,height*(.09 if species!='pine' else .018)))
            points=[start.lerp(end,t)+Vector((0,0,.25*math.sin(math.pi*t))) for t in [j/steps for j in range(steps+1)]];wood.tube(points,.075*(1-.45*i/count),sides)
            for twig in range(6):
                # All LODs retain the same major limbs and centres.
                fraction=.35+.65*twig/5;anchor=start.lerp(end,fraction);twista=a+(twig%2*2-1)*.45
                if species=='willow':
                    tip=anchor+Vector((math.cos(twista)*.5,math.sin(twista)*.5,-(1.9+.5*math.sin(i+twig))))
                    tip.z=max(.55,tip.z)
                    b=anchor+Vector((math.cos(a)*.45,math.sin(a)*.45,.12));c=tip+Vector((0,0,.8))
                    pts=[bezier(anchor,b,c,tip,j/steps) for j in range(steps+1)];wood.tube(pts,.013,[5,4,3][lod])
                    for j in range(0,24,stride):
                        t=(j+.5)/24;p=bezier(anchor,b,c,tip,t);direction=Vector((math.cos(j*2.4)*.6,math.sin(j*2.4)*.6,-1))
                        leaves.lance(p,direction,.22*(1+.1*lod),.025*(1+.15*lod))
                elif species=='blossom':
                    tip=anchor+Vector((math.cos(twista)*.65,math.sin(twista)*.65,.5));wood.tube([anchor,anchor.lerp(tip,.5),tip],.018,sides)
                    for j in range(0,12,stride):
                        p=anchor.lerp(tip,.25+.75*j/11)+Vector((math.cos(j*2.4)*.10,math.sin(j*2.4)*.1,.05))
                        flowers.blossom(p,.075*(1+.15*lod),j*2.4)
                        if j%3==0:leaves.lance(p,(math.cos(twista),math.sin(twista),.2),.12,.035)
                else:
                    for j in range(0,20,stride):
                        p=anchor+Vector((math.cos(j*2.399)*.48,math.sin(j*2.399)*.48,.05+.1*math.sin(j)))
                        d=(math.cos(j*2.399),math.sin(j*2.399),.3)
                        if species=='pine':
                            for k in [-.3,0,.3]:leaves.lance(p,(d[0]+k,d[1]-k,.25),.35*(1+.15*lod),.026)
                        else:leaves.lance(p,d,.28*(1+.2*lod),.10*(1+.15*lod))
        objects=[wood.object('rooted trunk and branch hierarchy',bark)]
        if leaves.v:objects.append(leaves.object('three dimensional leaves',needle if species=='pine' else leaf))
        if flowers.v:objects.append(flowers.object('actual five petal flowers',petal))
        for o in objects:o['source']='project-authored seeded geometry; no third-party mesh or texture';o['wind']='static export; root-anchored wind deformation remains production work'
        file=f'{species}-lod{lod}.glb';bpy.ops.export_scene.gltf(filepath=str(OUT/file),export_format='GLB',export_extras=True)
        triangles=0
        for o in objects:o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
        vs=[o.matrix_world@Vector(v) for o in objects for v in o.bound_box];bounds=[[min(v[i] for v in vs),max(v[i] for v in vs)] for i in range(3)]
        levels.append({'file':file,'sha256':hashlib.sha256((OUT/file).read_bytes()).hexdigest(),'bytes':(OUT/file).stat().st_size,'triangles':triangles,'blender_xyz_bounds':bounds})
    records.append({'species':species,'levels':levels})
(OUT/'manifest.json').write_text(json.dumps({'status':'authored_species_silhouette_studies','generator':'tools/build_botanical_studies.py','source_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'source':'original deterministic geometry; no downloaded mesh/images','units':'metres, glTF Y-up','root':'trunk base at local origin; fine drooping twigs clamped above ground','alpha':'none; thin curved leaves and petals are double-sided physical meshes','runtime_integrated':False,'final_art_accepted':False,'limitations':['Colour, branch taper, crown composition and translucency require reference-led refinement','Static GLB has no wind shader','LOD branch/leaf density differs; real transition/hysteresis and phone overdraw test remain'],'types':records},ensure_ascii=False,indent=2)+'\n')
print('PASS authored botanical study generation',[(r['species'],[l['triangles'] for l in r['levels']]) for r in records])
