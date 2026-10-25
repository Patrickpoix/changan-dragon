#!/usr/bin/env python3
"""Generate two distinct 3D *research* building archetypes, not Tang reconstructions.

Requires Python 3.10+, numpy and trimesh 4+/5+. Author-owned geometry only.
Run: python tools/build_ward_architecture_studies.py
GLB uses embedded colored PBR materials; source + immutable metadata are authority.
Do not automatically deploy to the main game or label as cinematic-approved.
"""
from __future__ import annotations
import hashlib
import json
import math
from collections import defaultdict
from pathlib import Path

import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/library/architecture/ward-archetypes"
OUT.mkdir(parents=True, exist_ok=True)
COLORS = {
    "stone": (157, 150, 132, 255),
    "stone_dark": (103, 101, 93, 255),
    "timber": (88, 59, 42, 255),
    "timber_lit": (131, 88, 56, 255),
    "beam_end": (171, 117, 71, 255),
    "post": (119, 62, 48, 255),
    "panel": (206, 181, 143, 255),
    "plaster": (214, 196, 164, 255),
    "screens": (99, 73, 50, 255),
    "shutter": (97, 69, 52, 255),
    "roof": (82, 99, 100, 255),
    "roof_alt": (101, 116, 114, 255),
    "tile_joint": (48, 69, 72, 255),
    "bracket": (114, 70, 44, 255),
    "ceramic": (151, 126, 93, 255),
    "fabric": (116, 77, 64, 255)
}
roughness = {"roof": .87, "roof_alt": .87, "tile_joint": .91, "plaster": .96,
             "stone": .95, "stone_dark": .92, "fabric": .91, "ceramic": .62}

class Model:
    def __init__(self, name):
        self.name=name
        self.verts=defaultdict(list)
        self.faces=defaultdict(list)
        self.part_count=defaultdict(int)
    def poly(self, group, verts, faces):
        start=len(self.verts[group])
        self.verts[group].extend([tuple(float(v) for v in p) for p in verts])
        self.faces[group].extend([tuple(start+i for i in f) for f in faces])
        self.part_count[group]+=1
    def box(self, group, x, y, z, w, h, d):
        if min(w,h,d)<=0: raise ValueError((group,w,h,d))
        a=x-w/2; b=x+w/2; c=y-h/2; e=y+h/2; f=z-d/2;g=z+d/2
        v=[(a,c,f),(b,c,f),(b,e,f),(a,e,f),(a,c,g),(b,c,g),(b,e,g),(a,e,g)]
        q=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)]
        self.poly(group,v,[f for a,b,c,d in q for f in ((a,b,c),(a,c,d))])
    def beam(self,group,a,b,r=.065,sides=8):
        a=np.asarray(a,dtype=float);b=np.asarray(b,dtype=float);axis=b-a
        if np.linalg.norm(axis)<1e-5:raise ValueError("zero beam")
        axis/=np.linalg.norm(axis)
        ux=np.cross(axis,[1.,0.,0.])
        if np.linalg.norm(ux)<.001:ux=np.cross(axis,[0.,0.,1.])
        ux/=np.linalg.norm(ux);uz=np.cross(axis,ux)
        vv=[]
        for end in (a,b):
            for k in range(sides):
                ang=2*math.pi*k/sides
                vv.append(end+r*(ux*math.cos(ang)+uz*math.sin(ang)))
        ff=[]
        ff.extend((0,k+1,k) for k in range(1,sides-1))
        ff.extend((sides,sides+k,sides+k+1) for k in range(1,sides-1))
        for k in range(sides):
            k1=(k+1)%sides
            ff.extend(((k,k1,sides+k1),(k,sides+k1,sides+k)))
        self.poly(group,vv,ff)
    def column(self,x,z,h=3.1,y0=.35,r=.155):
        self.beam("post",(x,y0,z),(x,h,z),r,16)
        self.box("stone",x,y0-.035,z,.43,.28,.43)
        self.box("beam_end",x,h-.11,z,.33,.26,.33)
    def slab(self,group,quad,t=.10):
        vv=list(quad)+[(x,y-t,z) for x,y,z in quad]
        q=[(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]
        ff=[face for a,b,c,d in q for face in ((a,b,c),(a,c,d))]
        self.poly(group,vv,ff)
    def lattice(self, x, z, w, y0, height, nx=8):
        self.box("screens",x,y0,z,w,.08,.10)
        self.box("screens",x,y0+height,z,w,.10,.10)
        self.box("screens",x-w/2,y0+height/2,z,.075,height,.10)
        self.box("screens",x+w/2,y0+height/2,z,.075,height,.10)
        for i in range(1,nx):
            xx=x-w/2+i*w/nx
            self.box("screens",xx,y0+height/2,z,.024,height,.065)
        for j in range(1,4):
            self.box("screens",x,y0+j*height/4,z,w,.026,.065)
    def roof(self, kind, width, depth, eave, rise, x0=0, z0=0, tag="roof"):
        if kind not in ("gable","hip"):raise ValueError(kind)
        nx=30;nt=16
        ridgehalf=max(.08,(width-depth)/2) if kind=="hip" else width/2
        def surface(side,u,t,hip_end=False):
            y=eave+rise*(max(0,1-t)**1.36)+.14*(t**10)
            if hip_end:
                x=x0+side*(ridgehalf+t*depth/2)
                z=z0+(u-.5)*t*depth
                return (x,y,z)
            half=ridgehalf+t*depth/2 if kind=="hip" else width/2
            return (x0+(u-.5)*2*half,y,z0+side*t*depth/2)
        for side in (-1,1):
            for j in range(nt):
                t0=j/nt;t1=(j+1)/nt
                for i in range(nx):
                    a=i/nx;b=(i+1)/nx
                    quad=[surface(side,a,t0),surface(side,b,t0),surface(side,b,t1),surface(side,a,t1)]
                    group="roof_alt" if (i//3+j//4+int(side>0))%5==0 else "roof"
                    self.slab(group,quad,.085)
            for i in range(nx+1):
                u=i/nx
                for j in range(nt):
                    a=surface(side,u,j/nt);b=surface(side,u,(j+1)/nt)
                    self.beam("tile_joint",(a[0],a[1]+.025,a[2]),(b[0],b[1]+.025,b[2]),.035,6)
        if kind=="hip":
            for side in (-1,1):
                for j in range(nt):
                    t0=j/nt;t1=(j+1)/nt
                    for i in range(nx):
                        a=i/nx;b=(i+1)/nx
                        self.slab("roof" if i%6 else "roof_alt",
                                  [surface(side,a,t0,True),surface(side,b,t0,True),
                                   surface(side,b,t1,True),surface(side,a,t1,True)],.085)
        self.beam("tile_joint",(x0-ridgehalf,eave+rise+.08,z0),
                  (x0+ridgehalf,eave+rise+.08,z0),.105,12)
        for xx in (-width/2,width/2):
            for zz in (-depth/2,depth/2):
                self.beam("timber_lit",(x0+xx*.94,eave-.19,z0+zz*.94),
                          (x0+xx*.96,eave+.06,z0+zz*.96),.035,8)
    def bracket(self,x,y,z,scale=1):
        # Authored cantilever seat study; deliberately NOT a copy of miniLibs.
        for k,(w,d,h,yy) in enumerate([(0.38,.42,.17,0),(0.64,.38,.13,.19),
                                        (.86,.33,.12,.35),(1.1,.31,.11,.49)]):
            self.box("bracket",x,y+yy*scale,z,w*scale,h*scale,d*scale)
        for sign in (-1,1):
            self.beam("beam_end",(x+sign*.1*scale,y+.04*scale,z),
                      (x+sign*.48*scale,y+.49*scale,z),.046*scale,8)
    def glb(self, filename, kind, note):
        scene=trimesh.Scene()
        for material,verts in sorted(self.verts.items()):
            vertices=np.array(verts,dtype=np.float32)
            triangles=np.array(self.faces[material],dtype=np.int64)
            if not len(vertices) or not len(triangles):continue
            geo=trimesh.Trimesh(vertices=vertices,faces=triangles,process=False,validate=False)
            # Explicit opaque metallic-roughness material, embedded in GLB.
            mat=PBRMaterial(name=material,baseColorFactor=COLORS[material],
                            metallicFactor=0.0,roughnessFactor=roughness.get(material,.83),
                            doubleSided=True)
            geo.visual=TextureVisuals(uv=np.zeros((len(vertices),2)),material=mat)
            scene.add_geometry(geo,node_name=material,geom_name=material)
        blob=scene.export(file_type="glb")
        (OUT/filename).write_bytes(blob)
        tri=sum(len(f) for f in self.faces.values())
        bb=scene.bounds
        return {"id":kind,"filename":filename,"kind":"independent_3d_study",
            "technicalReady":False,"historicalVerified":False,"cinematicApproved":False,
            "dimensions_m":np.round(bb[1]-bb[0],3).tolist(),
            "triangles":tri,"materialGroups":len(self.faces),
            "authoredGeometryParts":sum(self.part_count.values()),
            "sizeBytes":len(blob),"sha256":hashlib.sha256(blob).hexdigest(),
            "license":"Original geometry authored for this repository; no third-party mesh copied",
            "historicalNote":note}

def market_stall():
    m=Model("Single-storey market pavilion with long gabled ceramic roof")
    w=9.6;d=5.0
    m.box("stone",0,.22,0,w+.75,.44,d+.75)
    m.box("stone_dark",0,.43,0,w+.36,.06,d+.4)
    for x in (-4.55,-1.5,1.5,4.55):
        for z in (-2.18,2.18):
            m.column(x,z,3.52,.48,.148)
            m.bracket(x,3.15,z,.8)
    for z in (-2.22,2.22):
        m.box("timber",0,3.26,z,w+.23,.26,.24)
        m.box("timber_lit",0,2.93,z,w+.1,.12,.13)
    for x in (-4.5,-1.5,1.5,4.5):
        m.box("timber",x,3.25,0,.19,.23,d+.4)
    # Three distinct open business bays, with actual walk-in passage in center.
    for i,cx in enumerate((-3,0,3)):
        if i!=1:
            m.box("timber_lit",cx,1.17,-1.35,2.42,1.42,.62)
            m.box("beam_end",cx,1.91,-1.35,2.55,.085,.74)
            for xx in (cx-1,cx+1):
                m.box("timber",xx,.82,-1.3,.10,.95,.5)
            for j in range(7):
                zz=-1.78+j*.16
                m.box("timber_lit",cx,1.97,zz,2.4,.035,.08)
        m.box("plaster",cx,2.62,2.38,2.78,1.13,.11)
        m.lattice(cx,2.28,2.44,1.9,.61,9)
    for x in (-4.71,4.71):
        m.box("plaster",x,1.66,.27,.12,2.3,3.6)
        for z in (-1.6,0,1.6):
            m.box("timber_lit",x,1.8,z,.14,2.5,.14)
    # Counter overhang separated from rear room; fabric stripes hanging from real beam.
    for cx in (-3,3):
        m.box("fabric",cx,2.91,-2.33,2.15,.53,.023)
        for i in range(14):
            m.box("fabric",cx-1.04+i*.16,2.60,-2.34,.04,.10,.025)
    m.roof("gable",10.65,6.8,3.64,2.02,tag="merchant-gable")
    return m

def courtyard_gate():
    m=Model("Walled courtyard gatehouse with fully open central threshold")
    W=13.8;D=4.2
    m.box("stone",0,.20,0,W+.3,.40,D+.25)
    for x in (-6.35,-3.2,3.2,6.35):
        for z in (-1.72,1.72):
            m.column(x,z,4.0,.4,.15)
            m.bracket(x,3.67,z,.72)
    # Genuine gate aperture, separate side panel architecture with thick parapet.
    for s in (-1,1):
        x=s*4.76
        m.box("plaster",x,1.95,0,3.0,2.65,3.18)
        for xx in (x-1.43,x+1.43):
            m.box("timber",xx,2.03,1.65,.12,2.8,.15)
        for yy in (.83,3.27):
            m.box("timber_lit",x,yy,1.65,3.02,.15,.15)
        m.lattice(x,1.78,2.51,2.54,.53,12)
        # Narrow wall cap to imply enclosed courtyard continuing off fixture.
        m.box("plaster",s*7.73,2.06,-1.55,2.6,3.1,.36)
        m.box("stone",s*7.73,3.65,-1.55,2.83,.18,.56)
    for z in (-1.70,1.70):
        m.box("timber",0,3.58,z,13.6,.28,.26)
        m.box("timber_lit",0,3.23,z,13.5,.16,.16)
    # Double hinged gate panels shown partly open, leave clearance to walk through.
    for s in (-1,1):
        xx=s*1.53
        m.column(xx,1.73,3.45,.40,.13)
        # slender door in its fully open configuration, parallel to passage
        m.box("shutter",xx-s*.17,1.76,1.13,.13,2.6,1.07)
        for k in range(8):
            m.box("screens",xx-s*.16,.73+k*.31,1.13,.07,.055,1.11)
        m.box("beam_end",xx-s*.17,1.94,1.71,.11,.16,.16)
    m.box("stone_dark",0,.43,1.75,3.18,.065,.57)
    # Decorative lintel is part of geometry; no downloaded inscription image.
    m.box("timber",0,3.23,1.87,3.6,.45,.13)
    for x in (-.84,-.48,-.12,.24,.60,.96):
        m.box("beam_end",x,3.25,1.94,.045,.24,.03)
    m.roof("hip",14.8,5.9,4.12,2.42,tag="hip-gate")
    return m

def main():
    outputs=[
        market_stall().glb("market-pavilion.glb","market_pavilion",
           "Artist-authored market-space study; no claim of a precise Kaiyuan-Tianbao reconstruction."),
        courtyard_gate().glb("courtyard-gate.glb","courtyard_gate",
           "Ward-gate and compound-lane concept, derived from general ward boundary typology, not a specific excavated residence."),
    ]
    index={
        "version":1,"authoritativeSource":"tools/build_ward_architecture_studies.py",
        "generatedWith":{"trimesh":trimesh.__version__,"numpy":np.__version__},
        "provenance":"Geometries exclusively authored for this project; historical literature informed typology only, no third-party meshes or illustrations reproduced.",
        "workflow":"study only / browser validation required / cinematic approval denied until user visual signoff",
        "models":outputs,
    }
    (OUT/"manifest.json").write_text(json.dumps(index,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps(index,indent=2,ensure_ascii=False))
if __name__=="__main__":main()
