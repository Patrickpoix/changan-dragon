/* 唐长安市街的可环视实物资产试片。版权/历史/美术状态见README。
 * Keep existing source materials, proportions and PBR. Do not silently replace failed GLB with boxes.
 */
'use strict';
(async()=>{
const T=window.THREE, A=window.ChanganRenderingAddons, canvas=document.getElementById('view');
const progress=document.getElementById('progress'),fatal=document.getElementById('fatal'),metrics=document.getElementById('metrics');
window.__tangStreet={ready:false,loaded:[],errors:[],modelBounds:[]};
if(!T||!A?.GLTFLoader){fatal.hidden=false;fatal.textContent='Three.js或GLTFLoader缺失';throw Error(fatal.textContent)}
const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color(0x9aabb5);scene.fog=new T.Fog(0x9aabb5,75,150);
const camera=new T.PerspectiveCamera(55,innerWidth/innerHeight,.1,240);
scene.add(new T.HemisphereLight(0xfff7e8,0x625645,.85));
const sun=new T.DirectionalLight(0xffe8c5,2.7);sun.position.set(-19,37,28);
sun.intensity=2.2;sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-45,right:45,top:45,bottom:-45,near:1,far:110});
sun.shadow.bias=-.00013;sun.shadow.normalBias=.017;scene.add(sun);
const pmrem=new T.PMREMGenerator(renderer);
const envSource=new A.RoomEnvironment();
const env=pmrem.fromScene(envSource,.035);
scene.environment=env.texture;pmrem.dispose();envSource.dispose();
const paths={
 shop:'/assets/library/architecture/timber-shop/runtime.glb',
 tree:'/assets/library/polyhaven/tree_small_02/runtime.glb',
 stool:'/assets/library/polyhaven/chinese_stool/runtime.glb',
 basket:'/assets/library/polyhaven/wicker_basket_01/runtime.glb',
 paving:'/assets/library/production-materials/grey_stone_path/source/basecolor_1k.jpg',
 pavingNormal:'/assets/library/production-materials/grey_stone_path/source/normal_1k.jpg',
 pavingRough:'/assets/library/production-materials/grey_stone_path/source/roughness_1k.jpg',
 earth:'/assets/library/production-materials/brown_mud_02/source/basecolor_1k.jpg',
 earthNormal:'/assets/library/production-materials/brown_mud_02/source/normal_1k.jpg',
 earthRough:'/assets/library/production-materials/brown_mud_02/source/roughness_1k.jpg'
};
const loader=new A.GLTFLoader(),texLoader=new T.TextureLoader();
const records=[];
function mark(model,name){model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});records.push(name);return model}
function addCopy(original,name,x,z,rotation,scale=1){
 const copy=original.clone(true);copy.name=name;copy.position.set(x,0,z);copy.rotation.y=rotation;copy.scale.setScalar(scale);scene.add(copy);
 const bounds=new T.Box3().setFromObject(copy);
 if(bounds.isEmpty()||![...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite))throw Error('Invalid model bounds: '+name);
 window.__tangStreet.modelBounds.push({name,min:bounds.min.toArray(),max:bounds.max.toArray()});
 return copy;
}
const groundMat=new T.MeshStandardMaterial({color:0xa69a80,roughness:1});
const floor=new T.Mesh(new T.PlaneGeometry(140,140),groundMat);
floor.rotation.x=-Math.PI/2;floor.position.y=-.035;floor.receiveShadow=true;scene.add(floor);
const root=new T.Group();root.name='Independent research study: West Market inner lane';scene.add(root);
const stoneBase=new T.MeshStandardMaterial({color:0xc8bba6,roughness:1});
const earthBase=new T.MeshStandardMaterial({color:0xd3c4af,roughness:1});
const paving=new T.Mesh(new T.PlaneGeometry(12.8,65),earthBase);
paving.rotation.x=-Math.PI/2;paving.position.set(0,-.01,-4);paving.receiveShadow=true;root.add(paving);
for(const side of [-1,1]){
 const stoneEdge=new T.Mesh(new T.PlaneGeometry(1.5,65),stoneBase);
 stoneEdge.rotation.x=-Math.PI/2;stoneEdge.position.set(side*5.7,.005,-4);
 stoneEdge.receiveShadow=true;root.add(stoneEdge);
}
// Structural alley context only (curb/channel): the building itself is exclusively preserved GLB.
const curbMat=new T.MeshStandardMaterial({color:0x91826d,roughness:.98});
for(const side of [-1,1]){
 const curb=new T.Mesh(new T.BoxGeometry(.32,.19,64),curbMat);
 curb.position.set(side*6.54,.07,-4);curb.castShadow=true;curb.receiveShadow=true;root.add(curb);
 const channel=new T.Mesh(new T.BoxGeometry(.78,.06,64),new T.MeshStandardMaterial({color:0x575d59,roughness:.92}));
 channel.position.set(side*7.13,-.025,-4);root.add(channel);
}
const loaderError=e=>{const s=String(e?.message||e);window.__tangStreet.errors.push(s);progress.textContent='资源加载失败，请检查仓库实际文件';fatal.hidden=false;fatal.textContent=s};
try{
 const [shop,tree,stool,basket,base,normal,rough,earth,earthNormal,earthRough]=await Promise.all([
 loader.loadAsync(paths.shop),loader.loadAsync(paths.tree),loader.loadAsync(paths.stool),loader.loadAsync(paths.basket),
 texLoader.loadAsync(paths.paving),texLoader.loadAsync(paths.pavingNormal),texLoader.loadAsync(paths.pavingRough),
 texLoader.loadAsync(paths.earth),texLoader.loadAsync(paths.earthNormal),texLoader.loadAsync(paths.earthRough)
 ]);
 mark(shop.scene,'timber-shop (research geometry, MIT bracket)');
 mark(tree.scene,'tree_small_02 CC0 runtime derivative');
 mark(stool.scene,'chinese_stool CC0');
 mark(basket.scene,'wicker_basket_01 CC0');
 for(const tex of [base,normal,rough]){tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(3,12);tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);}
 base.colorSpace=T.SRGBColorSpace;
 stoneBase.map=base;stoneBase.normalMap=normal;stoneBase.roughnessMap=rough;stoneBase.normalScale=new T.Vector2(.45,.45);stoneBase.needsUpdate=true;
 for(const tex of [earth,earthNormal,earthRough]){tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(4,14);tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8)}
 earth.colorSpace=T.SRGBColorSpace;earthBase.map=earth;earthBase.normalMap=earthNormal;earthBase.roughnessMap=earthRough;earthBase.normalScale=new T.Vector2(.55,.55);earthBase.needsUpdate=true;
 const shops=[
 ['南侧铺面A',-11,8,Math.PI/2],['北侧铺面B',11,-6,-Math.PI/2],
 ['街口铺面C',-11,-23,Math.PI/2]
 ];
 shops.forEach(([name,x,z,r])=>addCopy(shop.scene,name,x,z,r));
 [[-7.9,18,2.1], [7.9,-18,2.0], [17,22,1.7]].forEach(([x,z,s],i)=>addCopy(tree.scene,'乔木 '+(i+1),x,z,i*1.37,s));
 [[-4.9,9.7],[-4.0,6.9],[5.2,-7.2]].forEach(([x,z],i)=>addCopy(stool.scene,'木凳 '+(i+1),x,z,i*.7));
 [[-4.3,9.4],[4.2,-7.9]].forEach(([x,z],i)=>addCopy(basket.scene,'篮篓 '+(i+1),x,z,i*.5));
 window.__tangStreet.loaded=[...records,'grey_stone_path CC0 PBR','brown_mud_02 CC0 PBR'];window.__tangStreet.ready=true;
 progress.textContent='已载入 '+records.length+'种GLB母体及石材PBR纹理 · 11处实物模型';
}catch(e){loaderError(e);return;}
const views={
 street:{pos:[0,3.1,28],at:[0,3,-12]},
 quarter:{pos:[27,17,25],at:[0,4,-5]},
 roof:{pos:[3,37,17],at:[0,0,-5]},
 detail:{pos:[-3,4.3,12],at:[-11,5,8]}
};
let yaw=0,pitch=0,auto=false,dusk=false,t=0;
const keys=new Set();
function placeView(which){
 const p=views[which];camera.position.fromArray(p.pos);
 const target=new T.Vector3(...p.at),delta=target.clone().sub(camera.position).normalize();
 yaw=Math.atan2(-delta.x,-delta.z);pitch=Math.asin(delta.y);
 camera.rotation.set(pitch,yaw,0,'YXZ');
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===which)));
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{auto=false;placeView(b.dataset.view)}));
document.getElementById('lighting').addEventListener('click',e=>{
 dusk=!dusk;e.currentTarget.setAttribute('aria-pressed',String(dusk));e.currentTarget.textContent=dusk?'正午光线':'傍晚光线';
 sun.color.setHex(dusk?0xffb777:0xffe8c5);sun.intensity=dusk?1.7:2.2;
 scene.background.setHex(dusk?0x6f8196:0x9aabb5);scene.fog.color.copy(scene.background);
 renderer.toneMappingExposure=dusk?.87:1.02;
});
document.getElementById('orbit').addEventListener('click',e=>{auto=!auto;e.currentTarget.setAttribute('aria-pressed',String(auto))});
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}
addEventListener('resize',resize);
canvas.addEventListener('click',()=>canvas.requestPointerLock?.());
addEventListener('mousemove',e=>{
 if(document.pointerLockElement!==canvas)return;
 yaw-=e.movementX*.002;pitch=Math.max(-1.25,Math.min(1.1,pitch-e.movementY*.002));
});
addEventListener('keydown',e=>keys.add(e.code));addEventListener('keyup',e=>keys.delete(e.code));
placeView('quarter');resize();
const clock=new T.Clock();
function frame(){
 requestAnimationFrame(frame);
 const dt=Math.min(.25,clock.getDelta()),step=(keys.has('ShiftLeft')?14:5)*dt;
 const f=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),s=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));
 camera.position.x+=(-Math.sin(yaw)*f+Math.cos(yaw)*s)*step;
 camera.position.z+=(-Math.cos(yaw)*f-Math.sin(yaw)*s)*step;
 if(keys.has('Space'))camera.position.y+=step;
 if(keys.has('ControlLeft'))camera.position.y-=step;
 camera.position.y=T.MathUtils.clamp(camera.position.y,1.6,60);
 if(auto){t+=dt*.25;camera.position.set(Math.cos(t)*32,17+Math.sin(t*.5)*4,Math.sin(t)*32-3);
 const dir=new T.Vector3(0,4,-5).sub(camera.position).normalize();yaw=Math.atan2(-dir.x,-dir.z);pitch=Math.asin(dir.y);}
 camera.rotation.set(pitch,yaw,0,'YXZ');
 renderer.render(scene,camera);
 metrics.textContent='实际绘制调用 '+renderer.info.render.calls+' · 三角形 '+renderer.info.render.triangles.toLocaleString()+' · 已装载母体 '+records.length+' · 浏览器实测非GPU性能结论';
}
window.__tangStreet={...window.__tangStreet,scene,camera,renderer,placeView,paths};
frame();
})();
