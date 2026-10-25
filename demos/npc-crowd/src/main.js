// 龙游长安 - NPC 群集原型 (Three.js r169)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const ROAD_LENGTH = 1000;
const ROAD_HALF_W = 75;
const MAX_NPC = 500;
const HIGH_FESTIVAL = 1000;
const NEAR_DIST = 50;
const MID_DIST  = 150;
const NEAR_POOL = 30;

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = false;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 200, 800);

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 2000);
camera.position.set(0, 40, 120);
camera.lookAt(0, 0, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xfff2cc, 1.2);
sun.position.set(100, 200, 50);
scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_LENGTH*2, ROAD_HALF_W*4), new THREE.MeshStandardMaterial({color:0xc2b280}));
ground.rotation.x = -Math.PI/2;
ground.position.y = -0.01;
scene.add(ground);

const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_LENGTH*2, ROAD_HALF_W*2), new THREE.MeshStandardMaterial({color:0x9a8a6a}));
road.rotation.x = -Math.PI/2;
scene.add(road);

const gateGeo = new THREE.BoxGeometry(4, 8, 10);
const gateMat = new THREE.MeshStandardMaterial({color:0x8b4513});
for (let x=-ROAD_LENGTH; x<=ROAD_LENGTH; x+=100){
  for (const z of [-ROAD_HALF_W-5, ROAD_HALF_W+5]){
    const g = new THREE.Mesh(gateGeo, gateMat);
    g.position.set(x, 4, z);
    scene.add(g);
  }
}

const CLASS_COLORS = [0x800080, 0x800000, 0x0060a0, 0xeeeeee, 0x8b4513, 0x2e8b57];
const npcs = [];
for (let i=0;i<HIGH_FESTIVAL;i++){
  npcs.push({
    pos: new THREE.Vector3((Math.random()-0.5)*ROAD_LENGTH*2, 0, (Math.random()-0.5)*ROAD_HALF_W*1.6),
    dir: new THREE.Vector3(Math.random()<0.5?1:-1, 0, 0),
    speed: 0.8 + Math.random()*0.4,
    state: 'walk', stateTimer: Math.random()*5,
    scale: 0.9 + Math.random()*0.2,
    color: new THREE.Color(CLASS_COLORS[i % CLASS_COLORS.length]),
  });
}

const bodyGeo = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
const bodyMat = new THREE.MeshStandardMaterial({color:0xffffff});
const inst = new THREE.InstancedMesh(bodyGeo, bodyMat, HIGH_FESTIVAL);
inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
inst.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(HIGH_FESTIVAL*3), 3);
scene.add(inst);

const loader = new GLTFLoader();
const nearPool = [];
loader.load('/models/Xbot.glb', (gltf)=>{
  for (let i=0;i<NEAR_POOL;i++){
    const m = gltf.scene.clone(true);
    m.visible = false;
    const mixer = new THREE.AnimationMixer(m);
    const walkClip = gltf.animations.find(c=>c.name==='walk') || gltf.animations[0];
    mixer.clipAction(walkClip).play();
    scene.add(m);
    nearPool.push({mesh:m, mixer, assigned:-1});
  }
});

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _up = new THREE.Vector3(0,1,0);
const _v = new THREE.Vector3();

function updateNPC(dt, activeCount){
  for (let i=0;i<activeCount;i++){
    const n = npcs[i];
    n.stateTimer -= dt;
    if (n.stateTimer <= 0){
      const r = Math.random();
      if (r < 0.8) { n.state='walk'; n.stateTimer = 3+Math.random()*8; }
      else if (r < 0.95) { n.state='idle'; n.stateTimer = 1+Math.random()*3; }
      else { n.state='talk'; n.stateTimer = 2+Math.random()*4; }
    }
    if (n.state==='walk'){
      n.pos.x += n.dir.x * n.speed * dt;
      if (Math.random() < 0.002){ n.dir.z = (Math.random()-0.5)*2; n.dir.x = Math.random()<0.5?1:-1; }
      n.pos.z += n.dir.z * n.speed * 0.3 * dt;
    }
    if (n.pos.x > ROAD_LENGTH) n.pos.x = -ROAD_LENGTH;
    if (n.pos.x < -ROAD_LENGTH) n.pos.x = ROAD_LENGTH;
    if (Math.abs(n.pos.z) > ROAD_HALF_W*1.2) n.dir.z *= -1;
    for (let j=Math.max(0,i-20); j<i; j++){
      const o = npcs[j];
      const dx = n.pos.x-o.pos.x, dz = n.pos.z-o.pos.z;
      const d2 = dx*dx+dz*dz;
      if (d2 < 4 && d2 > 0.001){
        const d = Math.sqrt(d2);
        const push = (2-d)/d * 0.5;
        n.pos.z += dz*push*dt;
        o.pos.z -= dz*push*dt;
      }
    }
  }
}

function updateInstances(activeCount){
  for (let i=0;i<HIGH_FESTIVAL;i++){
    if (i>=activeCount){ _m.makeScale(0,0,0); inst.setMatrixAt(i, _m); continue; }
    const n = npcs[i];
    const bob = n.state==='walk' ? Math.sin(performance.now()*0.005*n.speed + i)*0.05 : 0;
    _v.set(n.pos.x, bob, n.pos.z);
    _q.setFromAxisAngle(_up, Math.atan2(n.dir.x, n.dir.z));
    _s.set(n.scale, n.scale, n.scale);
    _m.compose(_v, _q, _s);
    inst.setMatrixAt(i, _m);
    inst.setColorAt(i, n.color);
  }
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
}

let gameHour = 12, currentActive = MAX_NPC, festival = false;
function updateDensity(){
  let target;
  if (festival) target = HIGH_FESTIVAL;
  else if (gameHour>=6 && gameHour<18) target = MAX_NPC;
  else target = 50;
  currentActive = target;
  const night = gameHour<6 || gameHour>=18;
  scene.background.set(night ? 0x0a0a2a : 0x87ceeb);
  scene.fog.color.copy(scene.background);
}

const hud = document.getElementById('hud');
const clock = new THREE.Clock();
let fpsAcc=0, fpsFrames=0, fps=0;

function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  updateDensity();
  updateNPC(dt, currentActive);
  updateInstances(currentActive);
  camera.position.x = Math.sin(t*0.05)*100;
  camera.position.z = 120 + Math.cos(t*0.05)*30;
  camera.lookAt(0,0,0);
  renderer.render(scene, camera);
  fpsAcc += dt; fpsFrames++;
  if (fpsAcc >= 0.5){ fps = Math.round(fpsFrames/fpsAcc); fpsAcc=0; fpsFrames=0; }
  hud.textContent = `FPS: ${fps}\nDrawCalls: ${renderer.info.render.calls}\nActive NPC: ${currentActive}`;
}
animate();
