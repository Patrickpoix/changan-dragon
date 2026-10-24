#!/usr/bin/env python3
"""blender -b --disable-autoexec -t 2 -P tools/build_character_studies.py

Natural adult anatomy, connected tailored garments, reduced author skeleton and
real morph/prop animation studies. No enlargement of heads or eyes. Separate
from rejected stylized heads and from both the old study and formal game.
"""
import bpy,math,json,hashlib
from pathlib import Path
from collections import defaultdict
from mathutils import Vector,Matrix
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'assets/library/characters/makehuman-base';DETAIL=ROOT/'assets/library/characters/makehuman-details';OUT=ROOT/'assets/library/characters/tang-studies';OUT.mkdir(parents=True,exist_ok=True)
SPEC=json.loads((ROOT/'docs/production-spec.json').read_text());RIG=json.loads((BASE/'default.mhskel').read_text());WEIGHTS=json.loads((BASE/'default_weights.mhw').read_text())['weights']

def linear(n):
 n=n/255;return n/12.92 if n<=.04045 else ((n+.055)/1.055)**2.4

def mat(name,col,rough=.8):
 m=bpy.data.materials.new(name);m.use_nodes=True;rgb=tuple(linear((col>>s)&255) for s in [16,8,0]);m.diffuse_color=(*rgb,1);p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*rgb,1);p.inputs['Roughness'].default_value=rough;return m
M={key:mat(key,col,rough) for key,col,rough in [('skin',0xd3aa8c,.66),('lips',0x98695c,.72),('hair',0x302b25,.82),('cloth',0x526b78,.84),('cream',0xdbcfad,.83),('skirt',0xa86250,.80),('leather',0x554536,.79),('wood',0x926043,.81),('ivory',0xd8c7a7,.79),('bread',0xddc79d,.88)]}
# Acquired CC0 normal map is only a quiet micro-surface, not a substitute for folds.
for key in ['cloth','cream','skirt']:
 m=M[key];n=m.node_tree.nodes;t=n.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(ROOT/'assets/library/production-materials/Fabric081C/normal_512.png'),check_existing=True);t.image.colorspace_settings.name='Non-Color'
 normal=n.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.10;m.node_tree.links.new(t.outputs['Color'],normal.inputs['Color']);m.node_tree.links.new(normal.outputs[0],n.get('Principled BSDF').inputs['Normal'])
eye=mat('author brown eyes ordinary PBR',0xffffff,.32);image=bpy.data.images.load(str(DETAIL/'brown_eye.png'));image.scale(512,512);n=eye.node_tree.nodes.new('ShaderNodeTexImage');n.image=image;eye.node_tree.links.new(n.outputs['Color'],eye.node_tree.nodes.get('Principled BSDF').inputs['Base Color']);eye.node_tree.links.new(n.outputs['Alpha'],eye.node_tree.nodes.get('Principled BSDF').inputs['Alpha']);M['eye']=eye

RAW=[];BODY=[];UV=[];FACEUV=[];GROUPS=defaultdict(set);group=''
for line in (BASE/'base.obj').read_text().splitlines():
 s=line.split()
 if not s:continue
 if s[0]=='v':RAW.append(Vector(tuple(map(float,s[1:4]))))
 elif s[0]=='vt':UV.append(tuple(map(float,s[1:3])))
 elif s[0]=='g':group=s[1]
 elif s[0]=='f':
  f=[int(x.split('/')[0])-1 for x in s[1:]];GROUPS[group].update(f)
  if group=='body':BODY.append(f);FACEUV.append([int(x.split('/')[1])-1 for x in s[1:]])

# Keep limb twist segments and two phalanges per finger; collapse other source
# weights to nearest retained ancestor, then normalize the four strongest.
KEEP={n for n in RIG['bones'] if n in ['root','head','jaw','eye.L','eye.R'] or n.startswith(('spine','neck','clavicle','shoulder','upperarm','lowerarm','wrist','pelvis','upperleg','lowerleg','foot')) or (n.startswith('finger') and n.split('.')[0].endswith(('-1','-2')))}
MAP={}
for n in RIG['bones']:
 p=n
 while p not in KEEP:p=RIG['bones'][p]['parent'] or 'root'
 MAP[n]=p
source_weights=defaultdict(lambda:defaultdict(float))
for name,values in WEIGHTS.items():
 for index,weight in values:source_weights[index][MAP[name]]+=weight

def normalize(weights):
 top=sorted(weights.items(),key=lambda x:(-x[1],x[0]))[:4];total=sum(v for k,v in top)
 return {k:v/total for k,v in top} if total>1e-8 else {'root':1.}
SOURCE_WEIGHTS={i:normalize(w) for i,w in source_weights.items()}

def mesh(name,v,f,material,weights=None,uvfaces=None):
 used=sorted({i for face in f for i in face});remap={old:new for new,old in enumerate(used)}
 g=bpy.data.meshes.new(name);g.from_pydata([v[i] for i in used],[],[tuple(remap[i] for i in face) for face in f]);g.update();o=bpy.data.objects.new(name,g);bpy.context.collection.objects.link(o);g.materials.append(M[material])
 for p in g.polygons:p.use_smooth=True
 uv=g.uv_layers.new(name='physical or source UV')
 for pi,p in enumerate(g.polygons):
  for k,li in enumerate(p.loop_indices):
   co=g.vertices[g.loops[li].vertex_index].co;uv.data[li].uv=uvfaces[pi][k] if uvfaces else (co.x*3,co.z*3+co.y)
 if weights:
  names=sorted({name for i in used for name in weights.get(i,{'root':1})})
  for name in names:o.vertex_groups.new(name=name)
  for old,new in remap.items():
   for bone,value in normalize(weights.get(old,{'root':1})).items():o.vertex_groups[bone].add([new],value,'REPLACE')
 return o,used

def rig_object(v):
 data=bpy.data.armatures.new('natural adult reduced source rig');o=bpy.data.objects.new('natural adult rig',data);bpy.context.collection.objects.link(o);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
 def joint(name):return sum((v[i] for i in RIG['joints'][name]),Vector())/len(RIG['joints'][name])
 for name in sorted(KEEP):
  source=RIG['bones'][name];b=data.edit_bones.new(name);b.head=joint(source['head']);b.tail=joint(source['tail'])
  if (b.tail-b.head).length<1e-5:b.tail=b.head+Vector((0,0,.01))
  plane=RIG.get('planes',{}).get(source['rotation_plane'])
  if plane:
   pts=[joint(p) for p in plane];normal=(pts[1]-pts[0]).cross(pts[2]-pts[0])
   if normal.length>.0001:b.align_roll(normal.normalized())
 for name in sorted(KEEP):
  p=RIG['bones'][name]['parent']
  if p:data.edit_bones[name].parent=data.edit_bones[MAP[p]]
 for name in ['activity_tray','activity_fabric']:
  b=data.edit_bones.new(name);b.head=(0,0,0);b.tail=(0,0,.1);b.parent=data.edit_bones['root']
 bpy.ops.object.mode_set(mode='OBJECT');o.select_set(False)
 for pb in o.pose.bones:pb.rotation_mode='QUATERNION'
 return o

def bind(o,rig):
 o.parent=rig;mod=o.modifiers.new('reduced source rig','ARMATURE');mod.object=rig

def assign_rigid(o,bone,rig):
 g=o.vertex_groups.new(name=bone);g.add(list(range(len(o.data.vertices))),1,'REPLACE');bind(o,rig)

def sphere(name,location,scale,material,rig=None,bone='head'):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=1,location=location);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);o.data.materials.append(M[material])
 for p in o.data.polygons:p.use_smooth=True
 if rig:assign_rigid(o,bone,rig)
 return o

def tube(name,pts,r,material,rig=None,bone='head'):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=2;c.use_fill_caps=True;s=c.splines.new('POLY');s.points.add(len(pts)-1)
 for p,co in zip(s.points,pts):p.co=(*co,1)
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False);o.data.materials.append(M[material])
 if rig:assign_rigid(o,bone,rig)
 return o

def nearest_weights(v,bodyverts):
 from mathutils.kdtree import KDTree
 valid=sorted({i for face in BODY for i in face} & set(SOURCE_WEIGHTS))
 kd=KDTree(len(valid))
 for i in valid:kd.insert(bodyverts[i],i)
 kd.balance();out={}
 for i,p in enumerate(v):
  neighbours=kd.find_n(p,3);w=defaultdict(float)
  for co,index,d in neighbours:
   for name,value in SOURCE_WEIGHTS.get(index,{'root':1}).items():w[name]+=value/max(.003,d)**2
  out[i]=normalize(w)
 return out

def garment(body,rig,height,female):
 # One continuous shoulder/body/sleeve surface. Armholes are actual openings
 # in a closed torso ring grid, not disconnected cylinders intersecting a cone.
 n=64;H=height/1.74;rows=[(.84,.190,.135),(1.00,.185,.130),(1.16,.215,.145),(1.25,.235,.145),(1.34,.225,.133),(1.40,.195,.107),(1.455,.102,.092)]
 v=[];f=[];tailoring_weights={}
 for j,(z,rx,ry) in enumerate(rows):
  for i in range(n):
   a=i*math.tau/n;fold=.004*math.sin(a*10+z*4)*(1 if j<4 else .2)
   v.append(Vector(((rx+fold)*math.cos(a)*H,(ry+fold)*math.sin(a)*H,z*H)))
 for j in range(len(rows)-1):
  for i in range(n):
   angle=(i+.5)*math.tau/n;side_distance=min(abs(math.sin(angle)),1)
   if j in [2,3,4] and side_distance<.47:continue
   a=j*n+i;b=j*n+(i+1)%n;f.append((a,b,b+n,a+n))
 # Extract the two true armhole boundary loops from face adjacency.
 edges=defaultdict(int)
 for face in f:
  for a,b in zip(face,face[1:]+face[:1]):edges[tuple(sorted((a,b)))]+=1
 boundary=defaultdict(list)
 for (a,b),count in edges.items():
  if count==1 and min(v[a].z,v[b].z)>.86*H and max(v[a].z,v[b].z)<1.43*H:
   boundary[a].append(b);boundary[b].append(a)
 holes=[];unused=set(boundary)
 while unused:
  start=min(unused);loop=[start];prev=None;now=start
  while True:
   choices=[x for x in boundary[now] if x!=prev];nxt=choices[0]
   if nxt==start:break
   loop.append(nxt);prev,now=now,nxt
  unused.difference_update(loop);holes.append(loop)
 assert len(holes)==2,(len(holes),[len(l) for l in holes])
 for loop in holes:
  side=1 if sum(v[i].x for i in loop)>0 else -1;tag='L' if side>0 else 'R'
  shoulder=rig.data.bones['upperarm01.'+tag].head_local;wrist=rig.data.bones['wrist.'+tag].head_local
  centre=sum((v[i] for i in loop),Vector())/len(loop);axis=(wrist-shoulder).normalized();end=wrist-axis*.035
  u=Vector((0,-1,0));u=(u-axis*u.dot(axis)).normalized();q=axis.cross(u).normalized()
  angles=[math.atan2((v[i]-centre).dot(q),(v[i]-centre).dot(u)) for i in loop]
  for index in loop:tailoring_weights[index]={'spine01':.75,'upperarm01.'+tag:.25}
  previous=loop
  for t in [.25,.50,.75,1.]:
   c=centre.lerp(end,t);radius=(.112*(1-t)+(.110 if female else .067)*t)*H
   ring=[]
   for angle in angles:
    p=c+u*(math.cos(angle)*radius)+q*(math.sin(angle)*radius*(1.15 if female else 1.0))
    p.z-=max(0.,-math.sin(angle))*.055*math.sin(t*math.pi)*H
    index=len(v);ring.append(index);v.append(p)
    if t<=.25:tailoring_weights[index]={'spine01':.15,'upperarm01.'+tag:.85}
    elif t<=.50:tailoring_weights[index]={'upperarm01.'+tag:.8,'lowerarm01.'+tag:.2}
    elif t<=.75:tailoring_weights[index]={'upperarm01.'+tag:.2,'lowerarm01.'+tag:.8}
    else:tailoring_weights[index]={'lowerarm01.'+tag:.75,'wrist.'+tag:.25}
   for i in range(len(loop)):f.append((previous[i],previous[(i+1)%len(loop)],ring[(i+1)%len(loop)],ring[i]))
   previous=ring
 # Extend the robe from the exact torso hem. The female layered skirt is a
 # distinct high-waist garment; it is not an open seam in the upper shirt.
 if not female:
  prev=list(range(n))
  for z,rx,ry in [(.70,.22,.16),(.50,.255,.18),(.30,.285,.20),(.15,.305,.22)]:
   ring=[]
   for i in range(n):
    a=i*math.tau/n;fold=.012*(1-z/.9)*math.cos(14*a+.25*math.sin(z*4))
    ring.append(len(v));v.append(Vector(((rx+fold)*math.cos(a)*H,(ry+fold)*math.sin(a)*H,z*H)))
   for i in range(n):f.append((prev[(i+1)%n],prev[i],ring[i],ring[(i+1)%n]))
   prev=ring
 weights=nearest_weights(v,body)
 for i in range(len(rows)*n):weights[i]={'spine01':1}
 weights.update(tailoring_weights)
 # Robe/skirt lower panels need their own root/hip distribution, not nearest
 # calf influences which split the centre seam on every step.
 for i,p in enumerate(v):
  if p.z<.86*H:weights[i]={'root':1}
 o,_=mesh('connected jacket and sleeves' if female else 'continuous round collar robe and sleeves',v,f,'cream' if female else 'cloth',weights);bind(o,rig)
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT');o.select_set(False)
 # Subdivision follows the connected sewn surface and shared weights.
 sub=o.modifiers.new('soft tailored shoulder and sleeve transitions','SUBSURF');sub.levels=1;sub.render_levels=1;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_move_up(modifier=sub.name);bpy.ops.object.modifier_apply(modifier=sub.name)
 # Apply shell thickness before skinning; source vertex groups are interpolated.
 mod=o.modifiers.new('sewn cloth thickness 4mm','SOLIDIFY');mod.thickness=.004;mod.offset=0;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_move_up(modifier=mod.name);bpy.ops.object.modifier_apply(modifier=mod.name)
 if female:
  vs=[];fs=[]
  for j,(z,rx,ry) in enumerate([(1.17,.19,.145),(1.10,.20,.15),(.85,.235,.165),(.55,.28,.20),(.30,.32,.225),(.13,.34,.235)]):
   for i in range(n):
    a=i*math.tau/n;fold=.012*(1.2-z)*math.cos(16*a+.18*math.sin(z*5));vs.append(Vector(((rx+fold)*math.cos(a)*H,(ry+fold)*math.sin(a)*H,z*H)))
   if j:
    for i in range(n):a=(j-1)*n+i;b=(j-1)*n+(i+1)%n;fs.append((b,a,a+n,b+n))
  skirt,_=mesh('high waist layered ruqun skirt',vs,fs,'skirt',{i:{'root':1} for i in range(len(vs))});bind(skirt,rig)
  bpy.context.view_layer.objects.active=skirt;mod=skirt.modifiers.new('skirt hem thickness','SOLIDIFY');mod.thickness=.004;bpy.ops.object.modifier_move_up(modifier=mod.name);bpy.ops.object.modifier_apply(modifier=mod.name)
  tube('high waist silk tie',[(-.15*H,-.155*H,1.165*H),(0,-.165*H,1.17*H),(.15*H,-.155*H,1.165*H)],.012,'ivory',rig,'spine03')
  # Real crossed lapel ribbon, not a pipe masquerading as garment cutting.
  corners=[(-.063,-.084,1.453),(.05,-.155,1.33),(.13,-.155,1.20)]
  lv=[];lf=[]
  for x,y,z in corners:lv.extend([Vector(((x-.018)*H,y*H,z*H)),Vector(((x+.018)*H,(y-.006)*H,z*H))])
  lf=[(0,1,3,2),(2,3,5,4)];lapel,_=mesh('crossed lapel broad facing',lv,lf,'ivory',nearest_weights(lv,body));bind(lapel,rig)
 else:
  pts=[(.106*H*math.cos(i*math.tau/48),.097*H*math.sin(i*math.tau/48),1.456*H) for i in range(49)]
  tube('round collar bound edge',pts,.008,'ivory',rig,'spine01')
  pts=[(.199*H*math.cos(i*math.tau/48),.146*H*math.sin(i*math.tau/48),.90*H) for i in range(49)]
  tube('robe leather waist belt',pts,.015,'leather',rig,'root')
 return o


def fit_eyes(raw,convert,rig):
 verts=[];faces=[];uvs=[];faceuv=[]
 for line in (DETAIL/'high-poly.obj').read_text().splitlines():
  s=line.split()
  if not s:continue
  if s[0]=='v':verts.append(Vector(tuple(map(float,s[1:4]))))
  if s[0]=='vt':uvs.append(tuple(map(float,s[1:3])))
  if s[0]=='f':faces.append([int(p.split('/')[0])-1 for p in s[1:]]);faceuv.append([uvs[int(p.split('/')[1])-1] for p in s[1:]])
 mappings=[];scales=[1.,1.,1.];started=False
 for line in (DETAIL/'high-poly.mhclo').read_text().splitlines():
  s=line.split()
  if not s or s[0].startswith('#'):continue
  if s[0] in ['x_scale','y_scale','z_scale']:
   axis={'x_scale':0,'y_scale':1,'z_scale':2}[s[0]];scales[axis]=abs(raw[int(s[1])][axis]-raw[int(s[2])][axis])/float(s[3])
  elif s[0]=='verts':started=True
  elif started and len(s)==9:
   ids=list(map(int,s[:3]));w=list(map(float,s[3:6]));offset=list(map(float,s[6:]));p=sum((raw[i]*a for i,a in zip(ids,w)),Vector())+Vector([offset[k]*scales[k] for k in range(3)]);mappings.append(convert(p))
 assert len(mappings)==len(verts),(len(mappings),len(verts))
 weights={i:{'head':1} for i in range(len(mappings))};o,_=mesh('fitted author eye meshes',mappings,faces,'eye',weights,faceuv);bind(o,rig)
 return o


def quaternion_aim(rig,name,target):
 bpy.context.view_layer.update();pb=rig.pose.bones[name];origin=pb.head.copy();old=(pb.tail-pb.head).normalized();new=(Vector(target)-origin).normalized();q=old.rotation_difference(new)
 pb.matrix=Matrix.Translation(origin)@q.to_matrix().to_4x4()@Matrix.Translation(-origin)@pb.matrix;bpy.context.view_layer.update()

def arm_ik(rig,side,target):
 tag='L' if side>0 else 'R';bones=rig.data.bones;s=bones['upperarm01.'+tag].head_local;e=bones['lowerarm01.'+tag].head_local;w=bones['wrist.'+tag].head_local;l1=(e-s).length;l2=(w-e).length;t=Vector(target);delta=t-s;distance=min(delta.length,l1+l2-.003);direction=delta.normalized();t=s+direction*distance
 a=(l1*l1-l2*l2+distance*distance)/(2*distance);pole=Vector((side,0,-.35));bend=(pole-direction*pole.dot(direction)).normalized();elbow=s+direction*a+bend*math.sqrt(max(0,l1*l1-a*a))
 quaternion_aim(rig,'upperarm01.'+tag,elbow);quaternion_aim(rig,'lowerarm01.'+tag,t)
 return (rig.pose.bones['wrist.'+tag].head-t).length


def activity_props(height,rig):
 H=height/1.74;roots={}
 def box(name,loc,size,material):
  bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(M[material]);m=o.modifiers.new('soft functional edge','BEVEL');m.width=.008;m.segments=2;bpy.ops.object.modifier_apply(modifier=m.name);return o
 for kind in ['OfferTray','InspectFabric']:
  before=set(bpy.context.scene.objects)
  if kind=='OfferTray':
   box('tray base',(0,0,0),(.48,.28,.025),'wood')
   for side in [-1,1]:
    box('tray end rail',(side*.235,0,.022),(.018,.28,.044),'wood');box('tray side rail',(0,side*.135,.022),(.48,.018,.044),'wood')
   for x in [-.13,0,.13]:
    for y in [-.06,.06]:sphere('baked bun study',(x,y,.045),(.055,.045,.026),'bread')
  else:
   box('cloth work counter',(0,0,-.025),(.70,.38,.05),'wood')
   for x in [-.28,.28]:
    for y in [-.13,.13]:box('counter leg',(x,y,-.48),(.045,.045,.94),'wood')
   vs=[];fs=[]
   for row in range(9):
    for col in range(17):
     x=-.30+.60*col/16;y=-.16+.28*row/8;vs.append(Vector((x,y,.009+.003*math.sin(col*.8+row*.5))))
   for row in range(8):
    for col in range(16):a=row*17+col;fs.append((a,a+1,a+18,a+17))
   cloth,_=mesh('cloth laid out for inspection',vs,fs,'cloth')
   tube('rolled cloth at rear',[(-.27,.12,.055),(.27,.12,.055)],.052,'cream')
  bone='activity_tray' if kind=='OfferTray' else 'activity_fabric'
  for obj in set(bpy.context.scene.objects)-before:assign_rigid(obj,bone,rig)
  roots[kind]=bone
 return roots


def clips(rig,height,props):
 H=height/1.74;scene=bpy.context.scene;scene.render.fps=24;errors=[]
 for name in ['OfferTray','InspectFabric']:
  rig.animation_data_create();action=bpy.data.actions.new(name);rig.animation_data.action=action
  for frame in range(1,74,6):
   phase=(frame-1)/72;wave=(1-math.cos(phase*math.tau))*.5
   for pb in rig.pose.bones:pb.rotation_quaternion=(1,0,0,0);pb.location=(0,0,0);pb.scale=(1,1,1)
   for side in [-1,1]:
    if name=='OfferTray':target=(side*.205*H,(-.31-.075*wave)*H,(1.09+.035*wave)*H)
    else:target=((side*.25-(.12*wave if side>0 else 0))*H,-.39*H,(.99+.008*wave)*H)
    errors.append(arm_ik(rig,side,target))
    tag='L' if side>0 else 'R';wrist=rig.pose.bones['wrist.'+tag];quaternion_aim(rig,'wrist.'+tag,wrist.head+Vector((0,-.1,0)))
   for owner,bone in props.items():
    pb=rig.pose.bones[bone];pb.scale=(H,H,H) if owner==name else (1e-5,1e-5,1e-5)
    location=Vector((0,(-.31-.075*wave)*H,(1.075+.035*wave)*H)) if owner=='OfferTray' else Vector((0,-.34*H,.95*H))
    pb.location=pb.bone.matrix_local.to_3x3().inverted()@location
   for pb in rig.pose.bones:
    for channel in ['rotation_quaternion','location','scale']:pb.keyframe_insert(channel,frame=frame,group=pb.name)
  # Explicit duplicate endpoint. Work gestures are in-place root clips.
  for fcurve in action.fcurves:
   for key in fcurve.keyframe_points:key.interpolation='BEZIER'
  track=rig.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,1,action)
  rig.animation_data.action=None

 # Store geometric hand reach independently from any visual claim.
 return max(errors)

records=[]
for female in [False,True]:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 height=SPEC['characters']['female_body_height' if female else 'male_body_height'];raw=[p.copy() for p in RAW]
 for line in (BASE/('asian-female-young.target' if female else 'asian-male-young.target')).read_text().splitlines():
  s=line.split()
  if len(s)==4 and not s[0].startswith('#'):raw[int(s[0])]+=Vector(tuple(map(float,s[1:])))
 body_indices={i for f in BODY for i in f};lo=min(raw[i].y for i in body_indices);hi=max(raw[i].y for i in body_indices);scale=height/(hi-lo)
 def convert(p):return Vector((p.x*scale,-p.z*scale,(p.y-lo)*scale))
 v=[convert(p) for p in raw];rig=rig_object(v)
 # Visible skin: head/neck, hands and ankles. No helper vertices or unused bounds.
 faces=[];uvfaces=[]
 for face,uv in zip(BODY,FACEUV):
  if min(v[i].z for i in face)>height*.86 or (min(v[i].z for i in face)>height*.80 and max(abs(v[i].x) for i in face)<height*.055) or (min(abs(v[i].x) for i in face)>.445*(height/1.74) and min(v[i].z for i in face)>height*.48):faces.append(face);uvfaces.append([UV[i] for i in uv])
 skin,used=mesh('natural anatomy head neck and articulated hands',v,faces,'skin',SOURCE_WEIGHTS,uvfaces);bind(skin,rig)
 # Real acquired expression deltas preserve natural face topology.
 skin.shape_key_add(name='Basis')
 for key,names in [('Blink',['eye-left-closure','eye-right-closure']),('Smile',['mouth-corner-puller']),('Speak',['mouth-parling']),('BrowRaise',['eyebrows-left-up','eyebrows-right-up'])]:
  delta=defaultdict(lambda:Vector())
  for name in names:
   for line in (DETAIL/(name+'.target')).read_text().splitlines():
    s=line.split()
    if len(s)==4 and not s[0].startswith('#'):delta[int(s[0])]+=Vector(tuple(map(float,s[1:])))
  block=skin.shape_key_add(name=key)
  for new,old in enumerate(used):
   d=delta[old];block.data[new].co+=Vector((d.x*scale,-d.z*scale,d.y*scale))
 fit_eyes(raw,convert,rig)
 # Fitted scalp uses the real cranium surface, with only a 3mm hair offset.
 scalp=[f for f in BODY if min(v[i].z for i in f)>height-.075 or (min(v[i].z for i in f)>height-.17 and min(v[i].y for i in f)>-.018)]
 hairv=[Vector((p.x*1.018,p.y*1.018,(p.z-height)*1.018+height+.001)) for p in v]
 hair,_=mesh('fitted hairline and tied crown',hairv,scalp,'hair',{i:{'head':1} for i in range(len(v))});bind(hair,rig)
 edge_count=defaultdict(int)
 for face in hair.data.polygons:
  for e in face.edge_keys:edge_count[e]+=1
 boundary_indices=sorted({i for e,count in edge_count.items() if count==1 for i in e})
 if boundary_indices:
  fair=hair.vertex_groups.new(name='temporary boundary fairing');fair.add(boundary_indices,1,'REPLACE');mod=hair.modifiers.new('smooth fitted hairline boundary','SMOOTH');mod.factor=.6;mod.iterations=5;mod.vertex_group=fair.name;bpy.context.view_layer.objects.active=hair;bpy.ops.object.modifier_move_up(modifier=mod.name);bpy.ops.object.modifier_apply(modifier=mod.name);hair.vertex_groups.remove(fair)
 sphere('tied hair bun',(0,.025,height+.015),(.045,.047,.048) if not female else (.055,.05,.063),'hair',rig)
 for side in [-1,1]:
  tag='L' if side>0 else 'R';points=[v[i] for i in GROUPS['helper-l-eye' if side>0 else 'helper-r-eye']];c=sum(points,Vector())/len(points)
  brow=[]
  for dx,dz in [(-.019,.019),(0,.023),(.019,.019)]:
   x,z=c.x+dx,c.z+dz;front=[p for i,p in enumerate(v) if i in body_indices and p.y<0 and abs(p.z-z)<.014 and abs(p.x-x)<.010]
   y=min(p.y for p in front)-.0015 if front else c.y-.025;brow.append(Vector((x,y,z)))
  tube('natural eyebrow '+tag,brow,.0025,'hair',rig)
  foot=rig.data.bones['foot.'+tag].head_local;sphere('cloth shoe '+tag,(foot.x,foot.y-.04,.068*(height/1.74)),(.064,.145,.067),'leather',rig,'foot.'+tag)
 garment(v,rig,height,female)
 props=activity_props(height,rig);error=clips(rig,height,props)
 # Neutral rest pose is exported; animations are chosen explicitly at review.
 for track in rig.animation_data.nla_tracks:track.mute=True
 bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
 rig['source']='MakeHuman core OBJ/targets/skeleton/weights and eyes/expression deltas CC0; connected garment/IK authored for this project; no stylized head replacement'
 rig['anatomy']='Natural adult source proportions, no head/eye enlargement';rig['production_art_accepted']=False
 # Batch by actual shared material while retaining the face's four shape keys.
 # Activity ownership stays in the two prop bones; no independent mini-mesh
 # draw per bun, table leg or cuff in the exported study.
 for material in M.values():
  objs=[o for o in bpy.context.scene.objects if o.type=='MESH' and not o.data.shape_keys and len(o.data.materials)==1 and o.data.materials[0]==material]
  if len(objs)<2:continue
  bpy.ops.object.select_all(action='DESELECT')
  for obj in objs:obj.select_set(True);bpy.context.view_layer.objects.active=obj
  bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
  bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();bpy.context.object.name='shared '+material.name+' weighted batch'
 kind='female' if female else 'male';path=OUT/(kind+'.glb')
 # Unmute tracks for the export, while keeping each NLA strip a separate action.
 for track in rig.animation_data.nla_tracks:track.mute=False
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',export_yup=True,export_extras=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_skins=True,export_morph=True,export_force_sampling=True)
 bpy.ops.wm.save_as_mainfile(filepath=str(Path('/workspace/.environment/changan-dragon')/(kind+'-tailoring-study.blend')))
 records.append({'type':kind,'file':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size,'anatomical_body_height':height,'reduced_bones':len(KEEP)+2,'source_bones':len(RIG['bones']),'max_analytical_wrist_reach_error':error,'morphs':['Blink','Smile','Speak','BrowRaise'],'clips':['OfferTray','InspectFabric']})
manifest={'style_rejected_by_user':True,'production_basis_allowed':False,'stage':'natural_anatomy_connected_tailoring_rig_studies','generator':'tools/build_character_studies.py','generator_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'source_manifests':['assets/library/characters/makehuman-base/manifest.json','assets/library/characters/makehuman-details/manifest.json','assets/library/production-materials/manifest.json'],'units':'metres; glTF Y-up, face +Z','runtime_integrated':False,'final_art_accepted':False,'types':records,'limits':['Tailoring is authored connected shoulder/armhole topology and layered skirt, not historical garment pattern proof','Root-fixed skirts require dedicated leg/cloth bones for walking and sitting; no walking production acceptance','Gesture clips are real skeleton curves and analytic wrist targets; hand/object ownership, finger grip and shop state machine require scene validation','No phone GPU performance or final film-style skin/hair/material approval']}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print('NATURAL CHARACTER STUDIES',records)
