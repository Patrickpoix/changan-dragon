// 龙游长安 · M2 整合 Demo
// 1km × 1km 唐长安片区：朱雀大街 + 平康坊(东) + 延寿坊(西) + 明德门 + 大雁塔
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const AREA = { xMin: -500, xMax: 500, zMin: 0, zMax: 1000 };
const ROAD_HALF_W = 75;
const NPC_COUNT = 200;
const DAY_LENGTH = 20 * 60;

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87a8c8);
scene.fog = new THREE.Fog(0xcfd8e0, 200, 1400);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.5, 3000);

const sun = new THREE.DirectionalLight(0xfff2d9, 2.5);
sun.position.set(200, 400, 100);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -400; sun.shadow.camera.right = 400;
sun.shadow.camera.top = 600; sun.shadow.camera.bottom = -600;
sun.shadow.camera.near = 50; sun.shadow.camera.far = 1500;
sun.shadow.bias = -0.0005;
scene.add(sun);
const hemi = new THREE.HemisphereLight(0xbfd4e6, 0x4a3f2f, 0.7);
scene.add(hemi);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshStandardMaterial({ color: 0x9a8a5a, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 500);
ground.receiveShadow = true; scene.add(ground);

const texLoader = new THREE.TextureLoader();
function pbrTex(url, rx, ry, srgb = false) {
  const t = texLoader.load(url);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const roadMat = new THREE.MeshStandardMaterial({
  map: pbrTex('/textures/road_diff.jpg', 8, 60, true),
  normalMap: pbrTex('/textures/road_nor.jpg', 8, 60),
  roughnessMap: pbrTex('/textures/road_rough.jpg', 8, 60),
  roughness: 0.95, metalness: 0,
});
const road = new THREE.Mesh(new THREE.PlaneGeometry(150, 1000), roadMat);
road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 500);
road.receiveShadow = true; scene.add(road);

const dirtMat = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 1 });
for (const side of [-1, 1]) {
  const dirt = new THREE.Mesh(new THREE.PlaneGeometry(325, 1000), dirtMat);
  dirt.rotation.x = -Math.PI / 2; dirt.position.set(side * 312.5, -0.01, 500);
  dirt.receiveShadow = true; scene.add(dirt);
}

const wallMat = new THREE.MeshStandardMaterial({
  map: pbrTex('/textures/wall_diff.jpg', 40, 1, true),
  normalMap: pbrTex('/textures/wall_nor.jpg', 40, 1),
  roughness: 0.95,
});
for (const side of [-1, 1]) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 1000), wallMat);
  wall.position.set(side * 80, 2, 500);
  wall.castShadow = true; wall.receiveShadow = true; scene.add(wall);
}

const gltfLoader = new GLTFLoader();
const MODEL_TARGET = {
  'bridges/fang_wall/Tang_FangWall.glb': 10,
  'bridges/fang_gate/Tang_FangGate.glb': 14,
  'bridges/big_fang_gate/Tang_BigFangGate.glb': 22,
  'chinese_tang_direct/hall_9bay/Tang_Hall_9bay.glb': 30,
  'chinese_tang_direct/side_hall/Tang_SideHall.glb': 16,
  'chinese_tang_direct/small_temple/Tang_SmallTemple.glb': 12,
  'chinese_tang_direct/pagoda5/Tang_Pagoda5.glb': 45,
  'chinese_tang_direct/gate_tower/Tang_GateTower.glb': 40,
  'chinese_tang_direct/wumen/Tang_Wumen.glb': 60,
  'chinese_tang_direct/pavilion/Tang_Pavilion.glb': 10,
  'japanese_castles_gates/bell_tower/Tang_BellTower.glb': 18,
  'japanese_castles_gates/drum_tower/Tang_DrumTower.glb': 18,
  'machiya_houses/house2_procedural/Tang_House2.glb': 11,
  'machiya_houses/shop_front/Tang_ShopFront.glb': 11,
  'machiya_houses/warehouse/Tang_Warehouse.glb': 13,
  'machiya_houses/wine_shop/Tang_WineShop.glb': 12,
  'memorial_stone_lions/stone_lion/Tang_StoneLion.glb': 3.5,
  'memorial_stone_lions/jingchuang/Tang_Jingchuang.glb': 5,
};
const modelCache = new Map();

async function loadModelInstanced(relPath) {
  if (modelCache.has(relPath)) return modelCache.get(relPath);
  const url = '/models/' + relPath;
  const gltf = await gltfLoader.loadAsync(url);
  gltf.scene.updateMatrixWorld(true);
  const buckets = new Map(); const mats = [];
  gltf.scene.traverse(obj => {
    if (!obj.isMesh) return;
    const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
    let g = obj.geometry.clone();
    g.applyMatrix4(obj.matrixWorld);
    if (g.index) g = g.toNonIndexed();
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) {
      const count = g.attributes.position.count;
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
    }
    const keep = ['position', 'normal', 'uv'];
    for (const key of Object.keys(g.attributes)) if (!keep.includes(key)) g.deleteAttribute(key);
    for (const key of keep) {
      const attr = g.getAttribute(key);
      if (attr.array.constructor !== Float32Array)
        g.setAttribute(key, new THREE.BufferAttribute(new Float32Array(attr.array), attr.itemSize));
    }
    if (!buckets.has(mat)) { buckets.set(mat, []); mats.push(mat); }
    buckets.get(mat).push(g);
  });
  const parts = [];
  for (const mat of mats) {
    const arr = buckets.get(mat); if (!arr || !arr.length) continue;
    try { parts.push(arr.length === 1 ? arr[0] : mergeGeometries(arr, false)); }
    catch (e) { console.warn('[merge]', relPath, e.message); parts.push(arr[0]); }
  }
  if (!parts.length) throw new Error('no geometry');
  let geo = null;
  try { geo = mergeGeometries(parts, true); }
  catch (e) { console.warn('[merge] final', relPath, e.message); }
  if (!geo) { const rec = { rawScene: gltf.scene }; modelCache.set(relPath, rec); return rec; }
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
  geo.translate(-cx, -bb.min.y, -cz);
  const size = new THREE.Vector3(); bb.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const target = MODEL_TARGET[relPath] || 12;
  const s = target / maxDim; geo.scale(s, s, s);
  geo.computeBoundingBox();
  const rec = { geometry: geo, materials: mats };
  modelCache.set(relPath, rec); return rec;
}

const WARDS = [
  { file: '/ward_pingkang.json', origCx: 6141.5, origCz: 4964.05, tgtCx: 287.5, tgtCz: 500, scale: 0.58 },
  { file: '/ward_yanshou.json', origCx: 2787.9, origCz: 4964.05, tgtCx: -287.5, tgtCz: 500, scale: 0.58 },
];

async function buildWards() {
  const placements = new Map();
  for (const w of WARDS) {
    const data = await fetch(w.file).then(r => r.json());
    for (const o of data.objects) {
      const rel = o.model;
      const lx = (o.pos[0] - w.origCx) * w.scale;
      const lz = (o.pos[2] - w.origCz) * w.scale;
      const x = w.tgtCx + lx, z = w.tgtCz + lz;
      if (!placements.has(rel)) placements.set(rel, []);
      placements.get(rel).push({ x, z, rotY: (o.rotY || 0) * Math.PI / 180, s: o.scale || 1 });
    }
  }
  const dummy = new THREE.Object3D();
  for (const [rel, list] of placements) {
    let rec;
    try { rec = await loadModelInstanced(rel); }
    catch (e) { console.warn('skip', rel, e); continue; }
    if (rec.rawScene) {
      rec.rawScene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      const bb = new THREE.Box3().setFromObject(rec.rawScene);
      const sz = new THREE.Vector3(); bb.getSize(sz);
      const target = MODEL_TARGET[rel] || 12;
      const normS = target / Math.max(sz.x, sz.y, sz.z);
      const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
      for (const p of list) {
        const c = rec.rawScene.clone(true);
        c.position.set(p.x - cx * normS, 0, p.z - cz * normS);
        c.rotation.y = p.rotY; c.scale.setScalar(normS * p.s);
        scene.add(c);
      }
      console.log(`[CLONE] ${rel} × ${list.length}`); continue;
    }
    const im = new THREE.InstancedMesh(rec.geometry, rec.materials, list.length);
    im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
    list.forEach((p, i) => {
      dummy.position.set(p.x, 0, p.z); dummy.rotation.set(0, p.rotY, 0);
      dummy.scale.setScalar(p.s); dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    });
    im.instanceMatrix.needsUpdate = true; scene.add(im);
    console.log(`[INST] ${rel} × ${list.length}`);
  }
}

async function buildGateAndPagoda() {
  try {
    const wumen = await loadModelInstanced('chinese_tang_direct/wumen/Tang_Wumen.glb');
    const gate = new THREE.Mesh(wumen.geometry, wumen.materials);
    gate.position.set(0, 0, -10); gate.rotation.y = Math.PI;
    gate.castShadow = true; gate.receiveShadow = true; scene.add(gate);
  } catch (e) { console.warn('wumen failed', e); }
  try {
    const pag = await loadModelInstanced('chinese_tang_direct/pagoda5/Tang_Pagoda5.glb');
    const pagoda = new THREE.Mesh(pag.geometry, pag.materials);
    pagoda.position.set(350, 0, 850); pagoda.castShadow = true; scene.add(pagoda);
  } catch (e) { console.warn('pagoda failed', e); }
  try {
    const pf = await loadModelInstanced('memorial_stone_lions/paifang/Tang_Paifang.glb');
    const paifang = new THREE.Mesh(pf.geometry, pf.materials);
    paifang.position.set(0, 0, 500); paifang.castShadow = true; scene.add(paifang);
  } catch (e) { console.warn('paifang failed', e); }
  try {
    const lion = await loadModelInstanced('memorial_stone_lions/stone_lion/Tang_StoneLion.glb');
    for (const side of [-1, 1]) {
      const l = new THREE.Mesh(lion.geometry, lion.materials);
      l.position.set(side * 25, 0, 10);
      l.rotation.y = side > 0 ? -Math.PI / 4 : Math.PI / 4;
      l.castShadow = true; scene.add(l);
    }
  } catch (e) { console.warn('lion failed', e); }
}

function buildTrees() {
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 5, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ map: texLoader.load('/textures/bark_diff.jpg'), roughness: 0.9 });
  const crownGeo = new THREE.SphereGeometry(3.5, 8, 6);
  const crownMat = new THREE.MeshStandardMaterial({ color: 0x4a6b3a, roughness: 0.9 });
  const positions = [];
  for (let z = 30; z < 1000; z += 30) for (const side of [-1, 1]) positions.push([side * 95, z]);
  const trunkIM = new THREE.InstancedMesh(trunkGeo, trunkMat, positions.length);
  const crownIM = new THREE.InstancedMesh(crownGeo, crownMat, positions.length);
  trunkIM.castShadow = true; crownIM.castShadow = true;
  const d = new THREE.Object3D();
  positions.forEach(([x, z], i) => {
    d.position.set(x, 2.5, z); d.updateMatrix(); trunkIM.setMatrixAt(i, d.matrix);
    d.position.set(x, 6.5, z); d.updateMatrix(); crownIM.setMatrixAt(i, d.matrix);
  });
  scene.add(trunkIM, crownIM);
}

let lanternMat;
function buildLanterns() {
  const geo = new THREE.SphereGeometry(0.6, 8, 6);
  lanternMat = new THREE.MeshStandardMaterial({ color: 0xff6633, emissive: 0xff4400, emissiveIntensity: 0.0, roughness: 0.5 });
  const positions = [];
  for (let z = 50; z < 1000; z += 50) for (const side of [-1, 1]) positions.push([side * 70, z]);
  const im = new THREE.InstancedMesh(geo, lanternMat, positions.length);
  const d = new THREE.Object3D();
  positions.forEach(([x, z], i) => { d.position.set(x, 4, z); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
  scene.add(im);
}

const CLASS_COLORS = {
  merchant: [0x6b4226, 0x8b5a2b, 0x5a3a1a, 0x7a4a2a],
  scholar: [0xeeeeee, 0xd0d8e0, 0xb8c8d0, 0xf0e8d8],
};
const npcs = [];
const NPC_WEST = 120, NPC_EAST = 80;

function buildNPCs() {
  for (let i = 0; i < NPC_COUNT; i++) {
    const isWest = i < NPC_WEST;
    const palette = isWest ? CLASS_COLORS.merchant : CLASS_COLORS.scholar;
    npcs.push({
      pos: new THREE.Vector3((isWest ? -1 : 1) * (10 + Math.random() * 55), 0, Math.random() * 1000),
      dir: new THREE.Vector3(0, 0, Math.random() < 0.5 ? 1 : -1),
      speed: 0.8 + Math.random() * 0.6,
      state: 'walk', stateTimer: Math.random() * 5,
      scale: 0.9 + Math.random() * 0.2,
      color: new THREE.Color(palette[Math.floor(Math.random() * palette.length)]),
    });
  }
  const bodyGeo = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const inst = new THREE.InstancedMesh(bodyGeo, bodyMat, NPC_COUNT);
  inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  inst.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NPC_COUNT * 3), 3);
  scene.add(inst); return inst;
}

function updateNPC(dt) {
  for (let i = 0; i < npcs.length; i++) {
    const n = npcs[i];
    n.stateTimer -= dt;
    if (n.stateTimer <= 0) {
      const r = Math.random();
      if (r < 0.8) { n.state = 'walk'; n.stateTimer = 3 + Math.random() * 8; }
      else if (r < 0.95) { n.state = 'idle'; n.stateTimer = 1 + Math.random() * 3; }
      else { n.state = 'talk'; n.stateTimer = 2 + Math.random() * 4; }
    }
    if (n.state === 'walk') {
      n.pos.z += n.dir.z * n.speed * dt;
      n.pos.x += n.dir.x * n.speed * 0.3 * dt;
      if (Math.random() < 0.003) {
        n.dir.z = Math.random() < 0.5 ? 1 : -1;
        n.dir.x = (Math.random() - 0.5) * 0.6;
      }
    }
    if (n.pos.z > 980) n.pos.z = 20;
    if (n.pos.z < 20) n.pos.z = 980;
    if (n.pos.x > 70) { n.pos.x = 70; n.dir.x = -Math.abs(n.dir.x); }
    if (n.pos.x < -70) { n.pos.x = -70; n.dir.x = Math.abs(n.dir.x); }
    for (let j = Math.max(0, i - 20); j < i; j++) {
      const o = npcs[j];
      const dx = n.pos.x - o.pos.x, dz = n.pos.z - o.pos.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < 4 && d2 > 0.001) {
        const d = Math.sqrt(d2);
        const push = (2 - d) / d * 0.5;
        n.pos.x += dx * push * dt; n.pos.z += dz * push * dt;
        o.pos.x -= dx * push * dt; o.pos.z -= dz * push * dt;
      }
    }
  }
}

const _m = new THREE.Matrix4(); const _q = new THREE.Quaternion();
const _s = new THREE.Vector3(); const _up = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3();
function updateInstances(inst) {
  const t = performance.now() * 0.005;
  for (let i = 0; i < npcs.length; i++) {
    const n = npcs[i];
    const bob = n.state === 'walk' ? Math.sin(t * n.speed + i) * 0.05 : 0;
    _v.set(n.pos.x, bob + 0.9, n.pos.z);
    _q.setFromAxisAngle(_up, Math.atan2(n.dir.x, n.dir.z));
    _s.setScalar(n.scale); _m.compose(_v, _q, _s);
    inst.setMatrixAt(i, _m); inst.setColorAt(i, n.color);
  }
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
}

const RAIN_COUNT = 2000;
let rainGeo, rainMat, rain;
function buildRain() {
  rainGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(RAIN_COUNT * 3);
  for (let i = 0; i < RAIN_COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 200;
    pos[i * 3 + 1] = Math.random() * 100; pos[i * 3 + 2] = Math.random() * 1000;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  rainMat = new THREE.PointsMaterial({ color: 0xaaccff, size: 0.25, transparent: true, opacity: 0.5 });
  rain = new THREE.Points(rainGeo, rainMat); rain.visible = false; scene.add(rain);
}
function updateRain(dt) {
  if (!rain.visible) return;
  const pos = rainGeo.attributes.position.array;
  for (let i = 0; i < RAIN_COUNT; i++) {
    pos[i * 3 + 1] -= 40 * dt; pos[i * 3] -= 5 * dt;
    if (pos[i * 3 + 1] < 0) { pos[i * 3 + 1] = 100; pos[i * 3] = (Math.random() - 0.5) * 200; }
  }
  rainGeo.attributes.position.needsUpdate = true;
}

const player = new THREE.Group();
player.position.set(0, 0, 200); scene.add(player);
const playerBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1.4, 4, 8), new THREE.MeshStandardMaterial({ color: 0x884433 }));
playerBody.position.y = 1; playerBody.castShadow = true; player.add(playerBody);

const keys = {};
let yaw = 0, pitch = 0;
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyN') nightLock = !nightLock;
  if (e.code === 'KeyR') rain.visible = !rain.visible;
});
addEventListener('keyup', e => keys[e.code] = false);
addEventListener('mousemove', e => {
  if (document.pointerLockElement) {
    yaw -= e.movementX * 0.0025; pitch -= e.movementY * 0.0025;
    pitch = Math.max(-0.4, Math.min(0.6, pitch));
  }
});
renderer.domElement.addEventListener('click', () => renderer.domElement.requestPointerLock());

let dayTime = 0.45; let nightLock = false;
function updateDayNight(dt) {
  if (!nightLock) dayTime = (dayTime + dt / DAY_LENGTH) % 1;
  else dayTime = 0.0;
  const sunAngle = (dayTime - 0.25) * Math.PI * 2;
  const sunHeight = Math.sin(sunAngle);
  sun.position.set(Math.cos(sunAngle) * 400, Math.max(sunHeight, -0.1) * 500, 150);
  sun.intensity = Math.max(0.05, sunHeight) * 2.5;
  const dayFactor = Math.max(0, sunHeight);
  sun.color.setHSL(0.08, 0.5 * dayFactor + 0.1, 0.3 + dayFactor * 0.4);
  renderer.toneMappingExposure = dayFactor > 0.1 ? 1.0 : 0.8;
  const isNight = sunHeight < -0.05;
  const dusk = sunHeight > -0.1 && sunHeight < 0.2;
  if (isNight) {
    scene.fog.color.setHex(0x1a2040); scene.background.setHex(0x1a2040);
    lanternMat.emissiveIntensity = 4.0; hemi.intensity = 0.45; sun.intensity = 0.25;
  } else if (dusk) {
    scene.fog.color.setHex(0xe8a07a); scene.background.setHex(0xe8a07a);
    lanternMat.emissiveIntensity = 1.5; hemi.intensity = 0.6;
  } else {
    scene.fog.color.setHex(0xcfd8e0); scene.background.setHex(0x87a8c8);
    lanternMat.emissiveIntensity = 0.0; hemi.intensity = 0.7;
  }
  return { sunHeight, isNight, dusk };
}

const clock = new THREE.Clock();
const hud = document.getElementById('hud');
let npcInst = null;
let fps = 0, fpsAcc = 0, fpsCnt = 0, lastFps = performance.now();

async function init() {
  try { await buildWards(); await buildGateAndPagoda(); }
  catch (e) { console.error('[init]', e); }
  buildTrees(); buildLanterns(); buildRain();
  npcInst = buildNPCs();
  document.getElementById('loading').remove();
  window.__ready = true; animate();
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const dn = updateDayNight(dt);
  const speed = (keys['ShiftLeft'] ? 12 : 5) * dt;
  let mx = 0, mz = 0;
  if (keys['KeyW']) mz -= 1; if (keys['KeyS']) mz += 1;
  if (keys['KeyA']) mx -= 1; if (keys['KeyD']) mx += 1;
  const len = Math.hypot(mx, mz);
  if (len > 0) {
    mx /= len; mz /= len;
    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    player.position.x += (mx * cos - mz * sin) * speed;
    player.position.z += (mx * sin + mz * cos) * speed;
    player.position.x = Math.max(AREA.xMin + 10, Math.min(AREA.xMax - 10, player.position.x));
    player.position.z = Math.max(AREA.zMin + 10, Math.min(AREA.zMax - 10, player.position.z));
    player.rotation.y = yaw;
  }
  if (!window.__screenshotMode) {
    const camDist = 6;
    camera.position.set(
      player.position.x - Math.sin(yaw) * camDist,
      player.position.y + 3 + pitch * 6,
      player.position.z - Math.cos(yaw) * camDist
    );
    camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z);
  }
  updateNPC(dt);
  if (npcInst) updateInstances(npcInst);
  updateRain(dt);
  renderer.render(scene, camera);
  fpsAcc += dt; fpsCnt++;
  const now = performance.now();
  if (now - lastFps > 500) { fps = fpsCnt / fpsAcc; fpsAcc = 0; fpsCnt = 0; lastFps = now; }
  const hour = Math.floor(dayTime * 24);
  const info = renderer.info.render;
  hudContent =
    `龙游长安 M2 · 1km²  fps=${fps.toFixed(1)}\n` +
    `pos=(${player.position.x.toFixed(0)}, ${player.position.z.toFixed(0)})  ` +
    `time=${hour}:${String(Math.floor((dayTime*24%1)*60)).padStart(2,'0')} ${dn.isNight?'夜':dn.dusk?'昏':'日'}\n` +
    `DrawCall=${info.calls}  Tri=${(info.triangles/1000).toFixed(1)}k  NPC=${NPC_COUNT}\n` +
    `rain=${rain.visible?'开':'关'}`;
  hud.textContent = hudContent;
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

window.__setTime = (mode) => {
  if (mode === 'day') { nightLock = false; dayTime = 0.5; }
  else if (mode === 'dusk') { nightLock = false; dayTime = 0.27; }
  else if (mode === 'night') { nightLock = true; dayTime = 0.0; }
};
window.__setPlayer = (x, z) => player.position.set(x, 0, z);
window.__setYaw = (y) => { yaw = y; };
window.__setCameraView = (cx, cy, cz, tx, ty, tz) => {
  camera.position.set(cx, cy, cz); camera.lookAt(tx, ty, tz);
};
window.__getStats = () => { const info = renderer.info.render; return { calls: info.calls, triangles: info.triangles }; };
window.__ready = false;
init();
