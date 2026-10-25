// 天气粒子系统：雨/雪/落叶/花瓣
import * as THREE from 'three';

export class RainSystem {
  constructor(scene, count = 3000) {
    this.count = count; this.area = 120; this.height = 60; this.speed = 15; this.wind = 2.0;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    this.vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i*3] = (Math.random()-.5)*this.area; pos[i*3+1] = Math.random()*this.height; pos[i*3+2] = (Math.random()-.5)*this.area;
      this.vel[i] = 0.8 + Math.random()*0.5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const c = document.createElement('canvas'); c.width=16; c.height=64;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0,0,0,64);
    g.addColorStop(0,'rgba(170,200,240,0)'); g.addColorStop(.5,'rgba(170,200,240,.9)'); g.addColorStop(1,'rgba(170,200,240,0)');
    ctx.fillStyle=g; ctx.fillRect(6,0,4,64);
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({size:.6,map:new THREE.CanvasTexture(c),transparent:true,opacity:.7,depthWrite:false,color:0xbbddff}));
    this.points.frustumCulled = false; scene.add(this.points);
  }
  update(dt, camPos) {
    const pos = this.points.geometry.attributes.position.array;
    for (let i=0;i<this.count;i++) {
      pos[i*3+1] -= this.speed*this.vel[i]*dt; pos[i*3] += this.wind*dt;
      if (pos[i*3+1]<0) { pos[i*3+1]=this.height+Math.random()*10; pos[i*3]=camPos.x+(Math.random()-.5)*this.area; pos[i*3+2]=camPos.z+(Math.random()-.5)*this.area; }
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
  setVisible(v){this.points.visible=v;}
}

export class SnowSystem {
  constructor(scene, count=2000) {
    this.count=count; this.area=100; this.height=50; this.speed=1.8;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count*3); this.phase=new Float32Array(count); this.amp=new Float32Array(count);
    for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*this.area;pos[i*3+1]=Math.random()*this.height;pos[i*3+2]=(Math.random()-.5)*this.area;this.phase[i]=Math.random()*Math.PI*2;this.amp[i]=.5+Math.random()*.8;}
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    const c=document.createElement('canvas');c.width=32;c.height=32;const ctx=c.getContext('2d');
    const g=ctx.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.4,'rgba(255,255,255,.8)');g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(16,16,16,0,Math.PI*2);ctx.fill();
    this.points=new THREE.Points(geo,new THREE.PointsMaterial({size:.5,map:new THREE.CanvasTexture(c),transparent:true,opacity:.9,depthWrite:false,color:0xffffff}));
    this.points.frustumCulled=false;scene.add(this.points);
  }
  update(dt,camPos,time){
    const pos=this.points.geometry.attributes.position.array;
    for(let i=0;i<this.count;i++){
      pos[i*3+1]-=this.speed*dt;pos[i*3]+=Math.sin(time*1.5+this.phase[i])*this.amp[i]*dt;pos[i*3+2]+=Math.cos(time*1.2+this.phase[i])*this.amp[i]*.6*dt;
      if(pos[i*3+1]<0){pos[i*3+1]=this.height+Math.random()*10;pos[i*3]=camPos.x+(Math.random()-.5)*this.area;pos[i*3+2]=camPos.z+(Math.random()-.5)*this.area;}
    }
    this.points.geometry.attributes.position.needsUpdate=true;
  }
  setVisible(v){this.points.visible=v;}
}

export class LeafSystem {
  constructor(scene,count=1000){
    this.count=count;this.area=80;this.height=25;
    const geo=new THREE.PlaneGeometry(.25,.35);
    const mat=new THREE.MeshStandardMaterial({color:0xe89030,emissive:0x8a4010,emissiveIntensity:.15,side:THREE.DoubleSide,roughness:.9});
    this.mesh=new THREE.InstancedMesh(geo,mat,count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.mesh.frustumCulled=false;
    this.dummy=new THREE.Object3D();this.data=[];
    for(let i=0;i<count;i++)this.data.push({x:(Math.random()-.5)*this.area,y:Math.random()*this.height,z:(Math.random()-.5)*this.area,rot:Math.random()*Math.PI*2,rotSpeed:(Math.random()-.5)*4,fallSpeed:.8+Math.random()*.8,phase:Math.random()*Math.PI*2,swing:.3+Math.random()*.5});
    scene.add(this.mesh);
  }
  update(dt,camPos,time){
    for(let i=0;i<this.count;i++){
      const d=this.data[i];d.y-=d.fallSpeed*dt;d.rot+=d.rotSpeed*dt;d.x+=Math.sin(time*2+d.phase)*d.swing*dt;d.z+=Math.cos(time*1.5+d.phase)*d.swing*.5*dt;
      if(d.y<0){d.y=this.height+Math.random()*5;d.x=camPos.x+(Math.random()-.5)*this.area;d.z=camPos.z+(Math.random()-.5)*this.area;}
      this.dummy.position.set(d.x,d.y,d.z);this.dummy.rotation.set(d.rot,d.rot*.7,d.rot*1.3);this.dummy.updateMatrix();this.mesh.setMatrixAt(i,this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate=true;
  }
  setVisible(v){this.mesh.visible=v;}
}

export class PetalSystem {
  constructor(scene,count=500){
    this.count=count;this.area=60;this.height=18;
    const geo=new THREE.PlaneGeometry(.2,.18);
    const mat=new THREE.MeshStandardMaterial({color:0xf8b8d0,emissive:0xd87090,emissiveIntensity:.25,side:THREE.DoubleSide,roughness:.8});
    this.mesh=new THREE.InstancedMesh(geo,mat,count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.mesh.frustumCulled=false;
    this.dummy=new THREE.Object3D();this.data=[];
    for(let i=0;i<count;i++)this.data.push({x:(Math.random()-.5)*this.area,y:Math.random()*this.height,z:(Math.random()-.5)*this.area,rot:Math.random()*Math.PI*2,rotSpeed:(Math.random()-.5)*2,fallSpeed:.5+Math.random()*.4,phase:Math.random()*Math.PI*2,sway:.4+Math.random()*.4});
    scene.add(this.mesh);
  }
  update(dt,camPos,time){
    for(let i=0;i<this.count;i++){
      const d=this.data[i];d.y-=d.fallSpeed*dt;d.rot+=d.rotSpeed*dt;d.x+=Math.sin(time*1.2+d.phase)*d.sway*dt;d.z+=Math.cos(time*.9+d.phase)*d.sway*.6*dt;
      if(d.y<0){d.y=this.height+Math.random()*4;d.x=camPos.x+(Math.random()-.5)*this.area;d.z=camPos.z+(Math.random()-.5)*this.area;}
      this.dummy.position.set(d.x,d.y,d.z);this.dummy.rotation.set(d.rot*.5,d.rot,d.rot*.3);this.dummy.updateMatrix();this.mesh.setMatrixAt(i,this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate=true;
  }
  setVisible(v){this.mesh.visible=v;}
}
