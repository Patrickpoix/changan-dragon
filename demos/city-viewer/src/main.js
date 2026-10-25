// Regenerated technical viewer for the incomplete 96-slot research dataset.
// Does not integrate into the production city or claim AAA visual acceptance.
import * as THREE from 'three';
import {SharedResourceRegistry} from '../../shared/resource-registry.mjs';

export function mountCityViewer({integrated=false}={}){
  const app=document.getElementById('app');
  const hud=document.getElementById('hud');
  if(!app||!hud)throw new Error('Missing viewer app/HUD mounts');
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  app.appendChild(renderer.domElement);

  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x9eb9d0);
  scene.fog=new THREE.Fog(0x9eb9d0,1000,4500);
  scene.add(new THREE.HemisphereLight(0xdfeaff,0x60513d,2.0));
  const sun=new THREE.DirectionalLight(0xffe5ba,2.1);
  sun.position.set(3500,5000,-1500);scene.add(sun);
  const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,1,8000);
  camera.position.set(4860,80,-4100);
  let yaw=0,pitch=-0.22;
  const keyState=new Set();
  addEventListener('keydown',e=>keyState.add(e.code));
  addEventListener('keyup',e=>keyState.delete(e.code));
  renderer.domElement.addEventListener('click',()=>renderer.domElement.requestPointerLock());
  addEventListener('mousemove',e=>{
    if(document.pointerLockElement!==renderer.domElement)return;
    yaw-=e.movementX*0.002;pitch=Math.max(-1.25,Math.min(1.15,pitch-e.movementY*0.002));
  });
  addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });

  // All streaming regions share the same GPU primitive/material references.
  // Only the final releasing region may dispose a shared resource.
  const registry=new SharedResourceRegistry();
  const acquireCommon=scope=>({
    wallGeo:scope.get('geometry/wall',()=>new THREE.BoxGeometry(10,3,0.7),x=>x.dispose()),
    buildingGeo:scope.get('geometry/building',()=>new THREE.BoxGeometry(10,7,10),x=>x.dispose()),
    treeGeo:scope.get('geometry/tree',()=>new THREE.ConeGeometry(2.4,8,6),x=>x.dispose()),
    floorGeo:scope.get('geometry/unit-plane',()=>new THREE.PlaneGeometry(1,1),x=>x.dispose()),
    wallMat:scope.get('material/wall',()=>new THREE.MeshStandardMaterial({color:0x9d8365}),x=>x.dispose()),
    buildingMat:scope.get('material/building',()=>new THREE.MeshStandardMaterial({color:0x9c604c,roughness:0.95}),x=>x.dispose()),
    treeMat:scope.get('material/tree',()=>new THREE.MeshStandardMaterial({color:0x477753,roughness:0.97}),x=>x.dispose()),
    wardMat:scope.get('material/ward',()=>new THREE.MeshStandardMaterial({color:0xc3ad7e,roughness:1}),x=>x.dispose())
  });
  const grid=new THREE.GridHelper(10000,100,0x817e71,0x817e71);
  grid.position.set(4860,-1,-4400);scene.add(grid);
  const street=new THREE.Mesh(new THREE.PlaneGeometry(150,5316),
    new THREE.MeshStandardMaterial({color:0xb7a184,side:THREE.DoubleSide}));
  street.rotation.x=-Math.PI/2;street.position.set(4860,-0.5,-2658);scene.add(street);

  const loaded=new Map(),pending=new Map();
  let manifest=null,failures=[],wanted=new Set(),nextReview=0;
  const dummy=new THREE.Object3D();
  function buildInstanced(records,geometry,material,type){
    if(!records.length)return null;
    const mesh=new THREE.InstancedMesh(geometry,material,records.length);
    records.forEach((item,i)=>{
      const p=item.pos;
      dummy.position.set(p[0],type==='tree'?4:type==='wall'?1.5:3.5,-p[2]);
      dummy.rotation.set(0,type==='wall'?(item.rotY||0)*Math.PI/180:0,0);
      const scale=type==='tree'?1:item.scale||1;
      dummy.scale.setScalar(scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate=true;
    return mesh;
  }
  function makeChunk(data){
    const group=new THREE.Group();
    const scope=registry.scope();
    try{
      const shared=acquireCommon(scope);
      for(const entry of data.entries){
        const [x1,z1,x2,z2]=entry.bbox;
        const floor=new THREE.Mesh(shared.floorGeo,shared.wardMat);
        floor.scale.set(x2-x1,z2-z1,1);
        floor.rotation.x=-Math.PI/2;floor.position.set((x1+x2)/2,-0.15,-(z1+z2)/2);
        group.add(floor);
        const walls=entry.objects.filter(o=>o.type==='wall');
        const buildings=entry.objects.filter(o=>o.type==='building');
        for(const obj of [
          buildInstanced(walls,shared.wallGeo,shared.wallMat,'wall'),
          buildInstanced(buildings,shared.buildingGeo,shared.buildingMat,'building'),
          buildInstanced(entry.trees,shared.treeGeo,shared.treeMat,'tree')
        ])if(obj)group.add(obj);
      }
      group.userData.releaseResources=()=>scope.release();
    }catch(error){
      group.traverse(o=>{if(o.isInstancedMesh)o.dispose()});
      scope.release();
      throw error;
    }
    return group;
  }
  function release(key){
    const group=loaded.get(key);if(!group)return;
    scene.remove(group);
    group.traverse(o=>{if(o.isInstancedMesh)o.dispose()});
    group.userData.releaseResources();
    loaded.delete(key);
  }
  function requestChunk(key){
    const controller=new AbortController();pending.set(key,controller);
    fetch('/chunks/'+key+'.json',{signal:controller.signal})
      .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status+' '+key);return r.json()})
      .then(data=>{
        if(!wanted.has(key))return;
        if(data.key!==key||!Array.isArray(data.entries))throw new Error('Invalid chunk '+key);
        const group=makeChunk(data);scene.add(group);loaded.set(key,group);
      })
      .catch(err=>{if(err.name!=='AbortError')failures.push(String(err))})
      .finally(()=>pending.delete(key));
  }
  function refresh(){
    if(!manifest)return;
    const cx=Math.floor(camera.position.x/1000),cz=Math.floor(-camera.position.z/1000);
    const next=new Set(manifest.chunks.filter(c=>{
      const [x,z]=c.key.split('_').map(Number);
      return Math.max(Math.abs(x-cx),Math.abs(z-cz))<=2;
    }).map(c=>c.key));
    wanted=next;
    for(const [key,controller] of pending)if(!next.has(key))controller.abort();
    for(const key of [...loaded.keys()])if(!next.has(key))release(key);
    const nearest=[...next].filter(key=>!loaded.has(key)&&!pending.has(key))
      .sort((a,b)=>{
        const [ax,az]=a.split('_').map(Number),[bx,bz]=b.split('_').map(Number);
        return Math.hypot(ax-cx,az-cz)-Math.hypot(bx-cx,bz-cz);
      });
    for(const key of nearest.slice(0,Math.max(0,3-pending.size)))requestChunk(key);
  }
  fetch('/chunks/manifest.json').then(r=>{
    if(!r.ok)throw new Error('Run npm run prep-chunks first (HTTP '+r.status+')');
    return r.json();
  }).then(m=>{
    if(m.status!=='RESEARCH_PROTOTYPE_ONLY'||m.sourceSlots!==96)throw new Error('Unexpected research dataset');
    manifest=m;refresh();
  }).catch(e=>failures.push(String(e)));

  const clock=new THREE.Clock();
  let elapsed=0;
  function animate(){
    requestAnimationFrame(animate);
    const dt=Math.min(clock.getDelta(),.05);
    const speed=(keyState.has('ShiftLeft')?300:90)*dt;
    const f=(keyState.has('KeyW')?1:0)-(keyState.has('KeyS')?1:0);
    const r=(keyState.has('KeyD')?1:0)-(keyState.has('KeyA')?1:0);
    camera.position.x+=(-Math.sin(yaw)*f+Math.cos(yaw)*r)*speed;
    camera.position.z+=(-Math.cos(yaw)*f-Math.sin(yaw)*r)*speed;
    if(keyState.has('Space'))camera.position.y+=speed;
    if(keyState.has('ControlLeft'))camera.position.y-=speed;
    camera.position.y=Math.max(3,Math.min(700,camera.position.y));
    camera.rotation.set(pitch,yaw,0,'YXZ');
    elapsed+=dt;
    if(elapsed>=.25){elapsed=0;refresh()}
    renderer.render(scene,camera);
    hud.textContent=(integrated?'整合技术预览 / ':'全城流加载技术预览 / ')+
      '历史位置未审 / 非正式游戏美术\nWASD移动 Shift加速 Space升高 Ctrl降低 点击锁定鼠标\n'+
      '布局96/目标108; 未研究12; 恢复生成93; 特殊区3\n'+
      '加载块 '+loaded.size+' / 请求中 '+pending.size+' / 可用块 '+(manifest?.chunks.length||0)+
      ' / DrawCalls '+renderer.info.render.calls+
      ' / 共享GPU资产 '+registry.stats().liveAssets+
      ' / 活跃引用 '+registry.stats().references+
      '\n'+(failures.length?'加载错误: '+failures.slice(-2).join('; '):'');
  }
  animate();
  // Test-only readback for movement/streaming assertions; never consumed by the formal game.
  const exposed={scene,camera,renderer,loaded,pending,registry};
  window.__RECOVERY_VIEWER__=exposed;
  return exposed;
}
if(document.body.dataset.demo==='city')mountCityViewer();
// Regenerated technical viewer for the incomplete 96-slot research dataset.
// Does not integrate into the production city or claim AAA visual acceptance.
import * as THREE from 'three';
import {SharedResourceRegistry} from '../../shared/resource-registry.mjs';

export function mountCityViewer({integrated=false}={}){
  const app=document.getElementById('app');
  const hud=document.getElementById('hud');
  if(!app||!hud)throw new Error('Missing viewer app/HUD mounts');
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  app.appendChild(renderer.domElement);

  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x9eb9d0);
  scene.fog=new THREE.Fog(0x9eb9d0,1000,4500);
  scene.add(new THREE.HemisphereLight(0xdfeaff,0x60513d,2.0));
  const sun=new THREE.DirectionalLight(0xffe5ba,2.1);
  sun.position.set(3500,5000,-1500);scene.add(sun);
  const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,1,8000);
  camera.position.set(4860,80,-4100);
  let yaw=0,pitch=-0.22;
  const keyState=new Set();
  addEventListener('keydown',e=>keyState.add(e.code));
  addEventListener('keyup',e=>keyState.delete(e.code));
  renderer.domElement.addEventListener('click',()=>renderer.domElement.requestPointerLock());
  addEventListener('mousemove',e=>{
    if(document.pointerLockElement!==renderer.domElement)return;
    yaw-=e.movementX*0.002;pitch=Math.max(-1.25,Math.min(1.15,pitch-e.movementY*0.002));
  });
  addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });

  // All streaming regions share the same GPU primitive/material references.
  // Only the final releasing region may dispose a shared resource.
  const registry=new SharedResourceRegistry();
  const acquireCommon=scope=>({
    wallGeo:scope.get('geometry/wall',()=>new THREE.BoxGeometry(10,3,0.7),x=>x.dispose()),
    buildingGeo:scope.get('geometry/building',()=>new THREE.BoxGeometry(10,7,10),x=>x.dispose()),
    treeGeo:scope.get('geometry/tree',()=>new THREE.ConeGeometry(2.4,8,6),x=>x.dispose()),
    floorGeo:scope.get('geometry/unit-plane',()=>new THREE.PlaneGeometry(1,1),x=>x.dispose()),
    wallMat:scope.get('material/wall',()=>new THREE.MeshStandardMaterial({color:0x9d8365}),x=>x.dispose()),
    buildingMat:scope.get('material/building',()=>new THREE.MeshStandardMaterial({color:0x9c604c,roughness:0.95}),x=>x.dispose()),
    treeMat:scope.get('material/tree',()=>new THREE.MeshStandardMaterial({color:0x477753,roughness:0.97}),x=>x.dispose()),
    wardMat:scope.get('material/ward',()=>new THREE.MeshStandardMaterial({color:0xc3ad7e,roughness:1}),x=>x.dispose())
  });
  const grid=new THREE.GridHelper(10000,100,0x817e71,0x817e71);
  grid.position.set(4860,-1,-4400);scene.add(grid);
  const street=new THREE.Mesh(new THREE.PlaneGeometry(150,5316),
    new THREE.MeshStandardMaterial({color:0xb7a184,side:THREE.DoubleSide}));
  street.rotation.x=-Math.PI/2;street.position.set(4860,-0.5,-2658);scene.add(street);

  const loaded=new Map(),pending=new Map();
  let manifest=null,failures=[],wanted=new Set(),nextReview=0;
  const dummy=new THREE.Object3D();
  function buildInstanced(records,geometry,material,type){
    if(!records.length)return null;
    const mesh=new THREE.InstancedMesh(geometry,material,records.length);
    records.forEach((item,i)=>{
      const p=item.pos;
      dummy.position.set(p[0],type==='tree'?4:type==='wall'?1.5:3.5,-p[2]);
      dummy.rotation.set(0,type==='wall'?(item.rotY||0)*Math.PI/180:0,0);
      const scale=type==='tree'?1:item.scale||1;
      dummy.scale.setScalar(scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate=true;
    return mesh;
  }
  function makeChunk(data){
    const group=new THREE.Group();
    const scope=registry.scope();
    try{
      const shared=acquireCommon(scope);
      for(const entry of data.entries){
        const [x1,z1,x2,z2]=entry.bbox;
        const floor=new THREE.Mesh(shared.floorGeo,shared.wardMat);
        floor.scale.set(x2-x1,z2-z1,1);
        floor.rotation.x=-Math.PI/2;floor.position.set((x1+x2)/2,-0.15,-(z1+z2)/2);
        group.add(floor);
        const walls=entry.objects.filter(o=>o.type==='wall');
        const buildings=entry.objects.filter(o=>o.type==='building');
        for(const obj of [
          buildInstanced(walls,shared.wallGeo,shared.wallMat,'wall'),
          buildInstanced(buildings,shared.buildingGeo,shared.buildingMat,'building'),
          buildInstanced(entry.trees,shared.treeGeo,shared.treeMat,'tree')
        ])if(obj)group.add(obj);
      }
      group.userData.releaseResources=()=>scope.release();
    }catch(error){
      group.traverse(o=>{if(o.isInstancedMesh)o.dispose()});
      scope.release();
      throw error;
    }
    return group;
  }
  function release(key){
    const group=loaded.get(key);if(!group)return;
    scene.remove(group);
    group.traverse(o=>{if(o.isInstancedMesh)o.dispose()});
    group.userData.releaseResources();
    loaded.delete(key);
  }
  function requestChunk(key){
    const controller=new AbortController();pending.set(key,controller);
    fetch('/chunks/'+key+'.json',{signal:controller.signal})
      .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status+' '+key);return r.json()})
      .then(data=>{
        if(!wanted.has(key))return;
        if(data.key!==key||!Array.isArray(data.entries))throw new Error('Invalid chunk '+key);
        const group=makeChunk(data);scene.add(group);loaded.set(key,group);
      })
      .catch(err=>{if(err.name!=='AbortError')failures.push(String(err))})
      .finally(()=>pending.delete(key));
  }
  function refresh(){
    if(!manifest)return;
    const cx=Math.floor(camera.position.x/1000),cz=Math.floor(-camera.position.z/1000);
    const next=new Set(manifest.chunks.filter(c=>{
      const [x,z]=c.key.split('_').map(Number);
      return Math.max(Math.abs(x-cx),Math.abs(z-cz))<=2;
    }).map(c=>c.key));
    wanted=next;
    for(const [key,controller] of pending)if(!next.has(key))controller.abort();
    for(const key of [...loaded.keys()])if(!next.has(key))release(key);
    const nearest=[...next].filter(key=>!loaded.has(key)&&!pending.has(key))
      .sort((a,b)=>{
        const [ax,az]=a.split('_').map(Number),[bx,bz]=b.split('_').map(Number);
        return Math.hypot(ax-cx,az-cz)-Math.hypot(bx-cx,bz-cz);
      });
    for(const key of nearest.slice(0,Math.max(0,3-pending.size)))requestChunk(key);
  }
  fetch('/chunks/manifest.json').then(r=>{
    if(!r.ok)throw new Error('Run npm run prep-chunks first (HTTP '+r.status+')');
    return r.json();
  }).then(m=>{
    if(m.status!=='RESEARCH_PROTOTYPE_ONLY'||m.sourceSlots!==96)throw new Error('Unexpected research dataset');
    manifest=m;refresh();
  }).catch(e=>failures.push(String(e)));

  const clock=new THREE.Clock();
  let elapsed=0;
  function animate(){
    requestAnimationFrame(animate);
    const dt=Math.min(clock.getDelta(),.05);
    const speed=(keyState.has('ShiftLeft')?300:90)*dt;
    const f=(keyState.has('KeyW')?1:0)-(keyState.has('KeyS')?1:0);
    const r=(keyState.has('KeyD')?1:0)-(keyState.has('KeyA')?1:0);
    camera.position.x+=(-Math.sin(yaw)*f+Math.cos(yaw)*r)*speed;
    camera.position.z+=(-Math.cos(yaw)*f-Math.sin(yaw)*r)*speed;
    if(keyState.has('Space'))camera.position.y+=speed;
    if(keyState.has('ControlLeft'))camera.position.y-=speed;
    camera.position.y=Math.max(3,Math.min(700,camera.position.y));
    camera.rotation.set(pitch,yaw,0,'YXZ');
    elapsed+=dt;
    if(elapsed>=.25){elapsed=0;refresh()}
    renderer.render(scene,camera);
    hud.textContent=(integrated?'整合技术预览 / ':'全城流加载技术预览 / ')+
      '历史位置未审 / 非正式游戏美术\nWASD移动 Shift加速 Space升高 Ctrl降低 点击锁定鼠标\n'+
      '布局96/目标108; 未研究12; 恢复生成93; 特殊区3\n'+
      '加载块 '+loaded.size+' / 请求中 '+pending.size+' / 可用块 '+(manifest?.chunks.length||0)+
      ' / DrawCalls '+renderer.info.render.calls+
      ' / 共享GPU资产 '+registry.stats().liveAssets+
      ' / 活跃引用 '+registry.stats().references+
      '\n'+(failures.length?'加载错误: '+failures.slice(-2).join('; '):'');
  }
  animate();
  // Test-only readback for movement/streaming assertions; never consumed by the formal game.
  const exposed={scene,camera,renderer,loaded,pending,registry};
  window.__RECOVERY_VIEWER__=exposed;
  return exposed;
}
if(document.body.dataset.demo==='city')mountCityViewer();
