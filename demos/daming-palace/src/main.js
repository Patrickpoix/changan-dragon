// 龙游长安 · 大明宫精模3D场景 (Three.js r169 + Vite)
// 坐标: x东-西(cityX-7500), z南-北(cityZ-7800), y上
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfd8e6, 800, 3200);
const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.5, 8000);
camera.position.set(0,12,-120); camera.lookAt(0,10,600);

function makeStoneTexture(base=[168,164,152], grout=[120,116,108], cells=8){
  const c=document.createElement('canvas'); c.width=c.height=512;
  const g=c.getContext('2d');
  g.fillStyle=`rgb(${grout})`; g.fillRect(0,0,512,512);
  const s=512/cells;
  for(let i=0;i<cells;i++)for(let j=0;j<cells;j++){
    const v=(Math.random()-.5)*28;
    g.fillStyle=`rgb(${base[0]+v|0},${base[1]+v|0},${base[2]+v|0})`;
    g.fillRect(i*s+2,j*s+2,s-4,s-4);
  }
  const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=8;
  t.colorSpace=THREE.SRGBColorSpace; return t;
}
const groundTex=makeStoneTexture([150,148,140],[105,103,98],10);
groundTex.repeat.set(60,40);
const platformTex=makeStoneTexture([176,172,162],[130,126,118],6);

const ground=new THREE.Mesh(new THREE.PlaneGeometry(5200,3200),new THREE.MeshStandardMaterial({map:groundTex,roughness:.92}));
ground.rotation.x=-Math.PI/2; ground.position.set(0,0,1400); ground.receiveShadow=true; scene.add(ground);

function makePlatform(w,d,h,x,z){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({map:platformTex,roughness:.85}));
  m.position.set(x,h/2,z); m.castShadow=m.receiveShadow=true; scene.add(m);
  return m;
}
makePlatform(150,110,10,0,600);
makePlatform(80,60,4,0,1050);
makePlatform(70,52,3,0,1450);
makePlatform(130,100,5,-1000,1800);
makePlatform(40,24,2,0,20);
makePlatform(40,24,2,0,2780);

const wallMat=new THREE.MeshStandardMaterial({color:0x9a8f7a,roughness:.9});
function makeWall(x,z,w,d){const m=new THREE.Mesh(new THREE.BoxGeometry(w,6,d),wallMat);m.position.set(x,3,z);m.castShadow=m.receiveShadow=true;scene.add(m);}
makeWall(0,20,4560,4); makeWall(0,2780,4560,4);
makeWall(-2280,1400,4,2760); makeWall(2280,1400,4,2760);

const skyUniforms={uSunDir:{value:new THREE.Vector3(.5,.6,.4).normalize()},uSunElev:{value:.6},uTime:{value:0},uCloudCover:{value:.25}};
const skyMat=new THREE.ShaderMaterial({uniforms:skyUniforms,vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'void main(){gl_FragColor=vec4(.6,.75,1.,1.);}',side:THREE.BackSide,depthWrite:false});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(3800,32,16),skyMat));

const sun=new THREE.DirectionalLight(0xfff2d0,2.6);
sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-900; sun.shadow.camera.right=900;
sun.shadow.camera.top=900; sun.shadow.camera.bottom=-900;
sun.shadow.bias=-0.0004; scene.add(sun,sun.target);
scene.add(new THREE.HemisphereLight(0xbcd4f0,0x8a7a60,.55));

let hour=12;
function applyTime(h){
  hour=h; const ang=(h-6)/12*Math.PI; const elev=Math.sin(ang);
  sun.position.set(Math.cos(ang)*-1200,elev*1400+50,600);
  sun.target.position.set(0,0,1400);
  sun.intensity=.4+Math.max(0,elev)*2.6;
  sun.color.setHSL(.09,.5,.55+Math.max(0,elev)*.35);
  skyUniforms.uSunElev.value=elev*.9;
}
applyTime(12);

const gltfLoader=new GLTFLoader(); const modelCache={};
async function loadModel(rel){if(modelCache[rel])return modelCache[rel];const g=await gltfLoader.loadAsync('/models_textured/'+rel);modelCache[rel]=g.scene;return g.scene;}
function prep(m){m.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;if(o.material)o.material.envMapIntensity=.5;}});}

const placements=[
  ['chinese_tang_direct/wumen/Tang_Wumen.glb',0,2,20,0,1.4],
  ['chinese_tang_direct/side_hall/Tang_SideHall.glb',-350,0,50,0,1],
  ['chinese_tang_direct/side_hall/Tang_SideHall.glb',350,0,50,0,1],
  ['chinese_tang_direct/hall_9bay/Tang_Hall_9bay.glb',0,10,600,0,1.6],
  ['chinese_tang_direct/pavilion/Tang_Pavilion.glb',-300,10,580,0,1.2],
  ['chinese_tang_direct/pavilion/Tang_Pavilion.glb',300,10,580,0,1.2],
  ['bridges/stone_bridge/Tang_StoneBridge.glb',0,5,390,0,1],
  ['chinese_tang_direct/hall_9bay/Tang_Hall_9bay.glb',0,4,1050,0,1.2],
  ['chinese_tang_direct/gate_tower/Tang_GateTower.glb',-300,0,1050,0,.8],
  ['chinese_tang_direct/gate_tower/Tang_GateTower.glb',300,0,1050,0,.8],
  ['chinese_tang_direct/hall_9bay/Tang_Hall_9bay.glb',0,3,1450,0,1.2],
  ['chinese_tang_direct/hall_9bay/Tang_Hall_9bay.glb',-1000,5,1800,0,1.8],
  ['chinese_tang_direct/pavilion/Tang_Pavilion.glb',-1350,0,1800,0,1],
  ['chinese_tang_direct/pavilion/Tang_Pavilion.glb',-650,0,1800,0,1],
  ['chinese_tang_direct/wumen/Tang_Wumen.glb',0,2,2780,Math.PI,1.2],
];
const palaceGroup=new THREE.Group(); scene.add(palaceGroup);
for(const[rel,x,y,z,ry,s]of placements){
  const src=await loadModel(rel);
  const inst=src.clone(true);
  inst.position.set(x,y,z); inst.rotation.y=ry; inst.scale.setScalar(s);
  prep(inst); palaceGroup.add(inst);
}

const water=new THREE.Mesh(new THREE.CircleGeometry(100,48),new THREE.MeshStandardMaterial({color:0x1f5f8a,transparent:true,opacity:.72,roughness:.18,metalness:.25}));
water.rotation.x=-Math.PI/2; water.position.set(0,.15,2200); scene.add(water);

function flat(g){return g.index?g.toNonIndexed():g;}
// 回廊实例化
{
  const wall=new THREE.BoxGeometry(14,4,4); wall.translate(0,2,0);
  const roof=new THREE.CylinderGeometry(0,4.2,3,4,1); roof.scale(1.75,1,1.4); roof.rotateY(Math.PI/4); roof.translate(0,5.5,0);
  const geo=mergeGeometries([flat(wall),flat(roof)]);
  const mat=new THREE.MeshStandardMaterial({color:0xb84a3a,roughness:.8});
  const spots=[];
  for(let z=300;z<=2600;z+=28){if(z>900&&z<1600)continue;spots.push([-250,z],[250,z]);}
  const inst=new THREE.InstancedMesh(geo,mat,spots.length);
  const m4=new THREE.Matrix4();
  spots.forEach(([x,z],i)=>{m4.makeTranslation(x,0,z);inst.setMatrixAt(i,m4);});
  inst.castShadow=inst.receiveShadow=true; scene.add(inst);
}
// 树木实例化
{
  const trunk=new THREE.CylinderGeometry(.5,.8,5,6); trunk.translate(0,2.5,0);
  const canopy=new THREE.IcosahedronGeometry(4.5,1); canopy.translate(0,8,0);
  const geo=mergeGeometries([flat(trunk),flat(canopy)]);
  const mat=new THREE.MeshStandardMaterial({color:0x4a6b3a,roughness:1});
  const N=160; const inst=new THREE.InstancedMesh(geo,mat,N);
  const m4=new THREE.Matrix4(); const q=new THREE.Quaternion(); const sc=new THREE.Vector3();
  let i=0;
  for(;i<N;i++){
    const x=(Math.random()-.5)*4200, z=100+Math.random()*2600;
    if(Math.abs(x)<140&&z>0&&z<2800)continue;
    const s=.8+Math.random()*.9; sc.set(s,s*(.9+Math.random()*.4),s);
    m4.compose(new THREE.Vector3(x,0,z),q,sc); inst.setMatrixAt(i,m4);
  }
  inst.count=i; inst.castShadow=true; scene.add(inst);
}

const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.35,.7,.82);
composer.addPass(bloom); composer.addPass(new OutputPass());

const keys={}; addEventListener('keydown',e=>keys[e.code]=true); addEventListener('keyup',e=>keys[e.code]=false);
let yaw=0,pitch=-.05,flying=false;
function applyCamRot(){camera.quaternion.setFromEuler(new THREE.Euler(pitch,yaw,0,'YXZ'));}
applyCamRot();
let locked=false;
renderer.domElement.addEventListener('click',()=>renderer.domElement.requestPointerLock());
document.addEventListener('pointerlockchange',()=>locked=document.pointerLockElement===renderer.domElement);
document.addEventListener('mousemove',e=>{if(!locked)return;yaw-=e.movementX*.0022;pitch=Math.max(-Math.PI/2+.01,Math.min(Math.PI/2-.01,pitch-e.movementY*.0022));applyCamRot();});

const VIEWS=[
  {pos:[0,14,-160],yaw:Math.PI,pitch:-.03,hour:10},
  {pos:[0,16,470],yaw:Math.PI,pitch:.26,hour:10},
  {pos:[-1500,22,1800],yaw:-Math.PI/2,pitch:0,hour:14},
  {pos:[0,230,2340],yaw:0,pitch:-1.15,hour:13},
  {pos:[0,16,3000],yaw:0,pitch:-.03,hour:11},
  {pos:[0,280,1500],yaw:Math.PI,pitch:-.38,hour:18.2},
];
function gotoView(i){const v=VIEWS[i];camera.position.set(...v.pos);yaw=v.yaw;pitch=v.pitch;applyCamRot();applyTime(v.hour);}
addEventListener('keydown',e=>{
  if(e.code==='KeyF')flying=!flying;
  if(e.code==='KeyT')applyTime(hour>16?10:18.2);
  const m={Digit1:0,Digit2:1,Digit3:2,Digit4:3,Digit5:4};
  if(m[e.code]!==undefined)gotoView(m[e.code]);
});

const clock=new THREE.Clock();
function tick(){
  const dt=Math.min(clock.getDelta(),.05);
  const spd=(flying?120:40)*dt;
  const fwd=new THREE.Vector3(); camera.getWorldDirection(fwd);
  const right=new THREE.Vector3().crossVectors(fwd,camera.up).normalize();
  if(keys['KeyW'])camera.position.addScaledVector(fwd,spd);
  if(keys['KeyS'])camera.position.addScaledVector(fwd,-spd);
  if(keys['KeyD'])camera.position.addScaledVector(right,spd);
  if(keys['KeyA'])camera.position.addScaledVector(right,-spd);
  if(flying){if(keys['Space'])camera.position.y+=spd;if(keys['KeyC'])camera.position.y-=spd;}
  camera.position.y=Math.max(2,camera.position.y);
  skyUniforms.uTime.value+=dt;
  composer.render(); requestAnimationFrame(tick);
}
tick();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});

window.__APP__={renderer,scene,camera,setView:gotoView,setTime:applyTime,renderOnce(){composer.render();}};
console.log('[大明宫] 场景就绪');
