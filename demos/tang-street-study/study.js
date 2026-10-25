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
 pavilion:'/assets/library/architecture/ward-archetypes/market-pavilion.glb',
 gate:'/assets/library/architecture/ward-archetypes/courtyard-gate.glb',
 tree:'/assets/library/polyhaven/tree_small_02/runtime.glb',
 stool:'/assets/library/polyhaven/chinese_stool/runtime.glb',
 basket:'/assets/library/polyhaven/wicker_basket_01/runtime.glb',
 paving:'/assets/library/production-materials/grey_stone_path/source/basecolor_1k.jpg',
 pavingNormal:'/assets/library/production-materials/grey_stone_path/source/normal_1k.jpg',
 pavingRough:'/assets/library/production-materials/grey_stone_path/source/roughness_1k.jpg',
 earth:'/assets/library/production-materials/brown_mud_02/source/basecolor_1k.jpg',
 earthNormal:'/assets/library/production-materials/brown_mud_02/source/normal_1k.jpg',
 earthRough:'/assets/library/production-materials/brown_mud_02/source/roughness_1k.jpg',
 woodBase:'/assets/library/production-materials/fine_grained_wood/source/basecolor_1k.jpg',
 woodNormal:'/assets/library/production-materials/fine_grained_wood/source/normal_1k.jpg',
 woodRough:'/assets/library/production-materials/fine_grained_wood/source/roughness_1k.jpg',
 roofNormal:'/assets/library/architecture/pbr/clay_roof_tiles_02/normal.jpg',
 roofRough:'/assets/library/architecture/pbr/clay_roof_tiles_02/roughness.jpg',
 plasterNormal:'/assets/library/architecture/pbr/clay_plaster/normal.jpg',
 plasterRough:'/assets/library/architecture/pbr/clay_plaster/roughness.jpg'
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
 const [shop,pavilion,gate,tree,stool,basket,base,normal,rough,earth,earthNormal,earthRough,
   woodBase,woodNormal,woodRough,roofNormal,roofRough,plasterNormal,plasterRough]=await Promise.all([
 loader.loadAsync(paths.shop),loader.loadAsync(paths.pavilion),loader.loadAsync(paths.gate),
 loader.loadAsync(paths.tree),loader.loadAsync(paths.stool),loader.loadAsync(paths.basket),
 texLoader.loadAsync(paths.paving),texLoader.loadAsync(paths.pavingNormal),texLoader.loadAsync(paths.pavingRough),
 texLoader.loadAsync(paths.earth),texLoader.loadAsync(paths.earthNormal),texLoader.loadAsync(paths.earthRough),
 texLoader.loadAsync(paths.woodBase),texLoader.loadAsync(paths.woodNormal),texLoader.loadAsync(paths.woodRough),
 texLoader.loadAsync(paths.roofNormal),texLoader.loadAsync(paths.roofRough),
 texLoader.loadAsync(paths.plasterNormal),texLoader.loadAsync(paths.plasterRough)
 ]);
 // Reuse one CC0 texture set across both original GLBs. Source geometry is never
 // rewritten and desktop visual quality need not be capped by a mobile bundle.
 const palette={
  timber:[255,238,221], timber_lit:[255,244,223], beam_end:[255,230,193],
  post:[255,213,184], bracket:[255,230,205], screens:[235,220,204],
  shutter:[238,207,184],stone:[240,229,211],stone_dark:[196,187,176]
 };
 const family=(name)=>{
  if(['timber','timber_lit','beam_end','post','bracket','screens','shutter'].includes(name))return 'wood';
  if(['stone','stone_dark'].includes(name))return 'stone';
  if(['roof','roof_alt','tile_joint'].includes(name))return 'roof';
  if(['plaster','panel'].includes(name))return 'plaster';
  return null;
 };
 const c=document.createElement('canvas');c.width=woodBase.image.width;c.height=woodBase.image.height;
 const ctx=c.getContext('2d');if(!ctx)throw Error('Canvas 2D required for wood tone study');
 ctx.filter='brightness(1.55)';ctx.drawImage(woodBase.image,0,0);
 const brighterWood=new T.CanvasTexture(c);brighterWood.colorSpace=T.SRGBColorSpace;
 const maps={
  wood:{base:brighterWood,normal:woodNormal,rough:woodRough,scale:.85},
  stone:{base:null,normal:null,rough:null,scale:1.3},
  roof:{base:null,normal:roofNormal,rough:roofRough,scale:.68},
  plaster:{base:null,normal:plasterNormal,rough:plasterRough,scale:1.5}
 };
 // Stone uses one shared source, not a duplicate GPU upload.
 maps.stone.base=base;maps.stone.normal=normal;maps.stone.rough=rough;
 for(const entries of Object.values(maps))
  for(const texture of [entries.base,entries.normal,entries.rough])if(texture){
   texture.wrapS=texture.wrapT=T.RepeatWrapping;
   texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
  }
 base.colorSpace=T.SRGBColorSpace;
 const pbrMaterials=new Map();let pbrMeshes=0;
 function applyModelPbr(model){
  model.traverse(o=>{
   if(!o.isMesh||Array.isArray(o.material))return;
   const key=o.material.name,kind=family(key);if(!kind)return;
   const g=o.geometry,p=g.getAttribute('position');
   // The earlier authored GLBs contain complete faces but omit NORMAL in some
   // primitives. Three can deterministically derive it; never fake UVs.
   if(!g.getAttribute('normal'))g.computeVertexNormals();
   const n=g.getAttribute('normal');
   if(!p||!n||p.count!==n.count)throw Error('Invalid mesh for PBR UVs: '+key);
   const uv=new Float32Array(p.count*2),unit=maps[kind].scale;
   for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const a=Math.abs(n.getX(i)),b=Math.abs(n.getY(i)),d=Math.abs(n.getZ(i));
    const pair=a>=b&&a>=d?[z,y]:b>=d?[x,z]:[x,y];
    uv[i*2]=pair[0]/unit;uv[i*2+1]=pair[1]/unit;
   }
   g.setAttribute('uv',new T.BufferAttribute(uv,2));
   if(!pbrMaterials.has(key)){
    const map=maps[kind],rgb=palette[key];
    const opts={
     color:rgb?new T.Color().setRGB(...rgb.map(v=>v/255),T.SRGBColorSpace):o.material.color.clone(),
     map:map.base,normalMap:map.normal,roughnessMap:map.rough,
     roughness:1,metalness:0,side:T.DoubleSide
    };
    const material=new T.MeshStandardMaterial(opts);
    material.normalScale.set(kind==='roof'?.45:.28,kind==='roof'?.45:.28);
    pbrMaterials.set(key,material);
   }
   o.material=pbrMaterials.get(key);pbrMeshes++;
  });
 }
 applyModelPbr(pavilion.scene);applyModelPbr(gate.scene);
 window.__tangStreet.pbrMeshes=pbrMeshes;
 mark(shop.scene,'timber-shop (research geometry, MIT bracket)');
 mark(pavilion.scene,'independent market pavilion study (original 3D geometry)');
 mark(gate.scene,'independent courtyard gate study (original 3D geometry)');
 mark(tree.scene,'tree_small_02 CC0 runtime derivative');
 mark(stool.scene,'chinese_stool CC0');
 mark(basket.scene,'wicker_basket_01 CC0');
 for(const tex of [base,normal,rough]){tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(3,12);tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);}
 base.colorSpace=T.SRGBColorSpace;
 stoneBase.map=base;stoneBase.normalMap=normal;stoneBase.roughnessMap=rough;stoneBase.normalScale=new T.Vector2(.45,.45);stoneBase.needsUpdate=true;
 for(const tex of [earth,earthNormal,earthRough]){tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(4,14);tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8)}
 earth.colorSpace=T.SRGBColorSpace;earthBase.map=earth;earthBase.normalMap=earthNormal;earthBase.roughnessMap=earthRough;earthBase.normalScale=new T.Vector2(.55,.55);earthBase.needsUpdate=true;
 // Distinct geometry fingerprints: two-storey hip timber shop vs. single-storey
 // open gabled market pavilion vs. courtyard gate with walled entrance.
 addCopy(shop.scene,'双层木构铺面研究',-11,8,Math.PI/2);
 addCopy(pavilion.scene,'单层开敞市场铺棚研究',11,-6,-Math.PI/2);
 addCopy(gate.scene,'院门侧墙研究',-11,-23,Math.PI/2);
 [[-7.9,18,2.1], [7.9,-18,2.0], [17,22,1.7]].forEach(([x,z,s],i)=>addCopy(tree.scene,'乔木 '+(i+1),x,z,i*1.37,s));
 [[-4.9,9.7],[-4.0,6.9],[5.2,-7.2]].forEach(([x,z],i)=>addCopy(stool.scene,'木凳 '+(i+1),x,z,i*.7));
 [[-4.3,9.4],[4.2,-7.9]].forEach(([x,z],i)=>addCopy(basket.scene,'篮篓 '+(i+1),x,z,i*.5));
 // Audit *reference identity*, not filenames or inferred file sizes.
 // Static GLB copies must reuse the very same BufferGeometry and Material.
 // Unique authored buildings share the same CC0 material profiles where applicable.
 const meshList=group=>{
  const meshes=[];group.traverse(o=>{if(o.isMesh)meshes.push(o)});
  return meshes;
 };
 const copiedFamilies={};
 for(const [key,label,count] of [['trees','乔木',3],['stools','木凳',3],['baskets','篮篓',2]]){
  const objects=Array.from({length:count},(_,i)=>scene.getObjectByName(label+' '+(i+1)));
  if(objects.some(o=>!o))throw Error('Missing reusable asset instances: '+key);
  const groups=objects.map(meshList);
  const shared=groups.every(g=>g.length===groups[0].length&&g.every((m,i)=>
    m.geometry===groups[0][i].geometry&&m.material===groups[0][i].material));
  if(!shared)throw Error('GPU resource sharing was lost: '+key);
  copiedFamilies[key]={instances:count,meshesPerInstance:groups[0].length,sharedGeometryAndMaterial:shared};
 }
 const buildingMaterials=name=>new Set(meshList(scene.getObjectByName(name)).map(m=>m.material));
 const pavilionMaterials=buildingMaterials('单层开敞市场铺棚研究');
 const gateMaterials=buildingMaterials('院门侧墙研究');
 const sharedBuildingMaterials=[...pavilionMaterials].filter(m=>gateMaterials.has(m)).length;
 if(sharedBuildingMaterials<5)throw Error('Authoring GLBs lost their shared CC0 PBR profile');
 const allMeshes=meshList(scene),geometries=new Set(),materials=new Set(),textures=new Set();
 for(const m of allMeshes){
  geometries.add(m.geometry);
  const mats=Array.isArray(m.material)?m.material:[m.material];
  for(const mat of mats){
   materials.add(mat);
   for(const field of ['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap']){
    if(mat?.[field])textures.add(mat[field]);
   }
  }
 }
 const assetReuse={
  sourceGLBFamilies:6,sceneGLBInstances:window.__tangStreet.modelBounds.length,
  sceneMeshInstances:allMeshes.length,uniqueGeometries:geometries.size,
  uniqueMaterials:materials.size,uniqueAssignedTextures:textures.size,
  sharedArchitecturalPbrMaterials:sharedBuildingMaterials,copiedFamilies
 };
 if(assetReuse.sceneGLBInstances!==11||allMeshes.length<=geometries.size)
  throw Error('Incorrect scene instance/resource accounting');
 window.__tangStreet.assetReuse=assetReuse;
 window.__tangStreet.loaded=[...records,'grey_stone_path CC0 PBR','brown_mud_02 CC0 PBR',
  'shared wood/stone/roof/plaster CC0 PBR, UV projected at runtime'];window.__tangStreet.ready=true;
 progress.textContent='已载入 '+records.length+'种GLB母体、真实泥土/石材PBR · 11处实物模型';
}catch(e){loaderError(e);return;}
const views={
 street:{pos:[0,3.1,28],at:[0,3,-12]},
 quarter:{pos:[27,17,25],at:[0,4,-5]},
 roof:{pos:[3,37,17],at:[0,0,-5]},
 detail:{pos:[-3,4.3,12],at:[-11,5,8]},
 pavilion:{pos:[-2.2,4.2,-5],at:[11,2.7,-6]},
 gate:{pos:[2.2,4.8,-24],at:[-11,3.2,-23]}
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
