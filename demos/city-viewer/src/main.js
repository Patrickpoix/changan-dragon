// 唐长安城 · 全城 84km² 流加载 Viewer
// 500m chunk × 20×18 = 360 slots, 三档LOD流加载
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const CHUNK = 500;
const TIER = { NEAR: 1, MID: 2, FAR: 3 }; // chunk radius tiers

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(innerWidth, innerHeight);
const headless = new URLSearchParams(location.search).has('headless');
renderer.setPixelRatio(headless ? 1 : Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = !headless;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8c0d8);
scene.fog = new THREE.Fog(0xcfd8e0, 250, 1400);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.5, 4000);

const sun = new THREE.DirectionalLight(0xfff2d9, 2.2);
sun.position.set(800, 1200, 600);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -400; sun.shadow.camera.right = 400;
sun.shadow.camera.top = 400; sun.shadow.camera.bottom = -400;
sun.shadow.bias = -0.0008;
scene.add(sun, sun.target);
scene.add(new THREE.HemisphereLight(0xbfd4e6, 0x6a5a3a, 0.85));

const ground = new THREE.Mesh(new THREE.PlaneGeometry(10000, 9000), new THREE.MeshStandardMaterial({ color: 0xa89468, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.position.set(4860, -0.05, -4326);
ground.receiveShadow = true; scene.add(ground);

const road = new THREE.Mesh(new THREE.PlaneGeometry(150, 5316), new THREE.MeshStandardMaterial({ color: 0xb8a878, roughness: 1 }));
road.rotation.x = -Math.PI / 2; road.position.set(4860, 0, -2658);
road.receiveShadow = true; scene.add(road);

const gltfLoader = new GLTFLoader();
const MODEL_TARGET = {
  'bridges/fang_wall/Tang_FangWall.glb': 10,
  'bridges/fang_gate/Tang_FangGate.glb': 14,
  'bridges/big_fang_gate/Tang_BigFangGate.glb': 22,
  'chinese_tang_direct/hall_9bay/Tang_Hall_9bay.glb': 30,
  'chinese_tang_direct/side_hall/Tang_SideHall.glb': 16,
  'chinese_tang_direct/pagoda5/Tang_Pagoda5.glb': 45,
  'chinese_tang_direct/wumen/Tang_Wumen.glb': 60,
  'machiya_houses/house2_procedural/Tang_House2.glb': 11,
  'machiya_houses/shop_front/Tang_ShopFront.glb': 11,
  'machiya_houses/wine_shop/Tang_WineShop.glb': 12,
  'memorial_stone_lions/stone_lion/Tang_StoneLion.glb': 3.5,
  'memorial_stone_lions/paifang/Tang_Paifang.glb': 12,
};

const modelLib = new Map();
function loadModel(rel) {
  if (modelLib.has(rel)) return modelLib.get(rel);
  const p = (async () => {
    const gltf = await gltfLoader.loadAsync('/models/' + rel);
    gltf.scene.updateMatrixWorld(true);
    const buckets = new Map(); const mats = [];
    gltf.scene.traverse(obj => {
      if (!obj.isMesh) return;
      const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
      let g = obj.geometry.clone();
      g.applyMatrix4(obj.matrixWorld);
      if (g.index) g = g.toNonIndexed();
      if (!g.attributes.normal) g.computeVertexNormals();
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      const keep = ['position', 'normal', 'uv'];
      for (const k of Object.keys(g.attributes)) if (!keep.includes(k)) g.deleteAttribute(k);
      if (!buckets.has(mat)) { buckets.set(mat, []); mats.push(mat); }
      buckets.get(mat).push(g);
    });
    const parts = [];
    for (const m of mats) {
      const arr = buckets.get(m); if (!arr || !arr.length) continue;
      try { parts.push(arr.length === 1 ? arr[0] : mergeGeometries(arr, false)); }
      catch { parts.push(arr[0]); }
    }
    let geo = parts[0];
    try { const g = mergeGeometries(parts.filter(Boolean), false); if (g) geo = g; } catch {}
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
    geo.translate(-cx, -bb.min.y, -cz);
    const size = new THREE.Vector3(); bb.getSize(size);
    const target = MODEL_TARGET[rel] || 12;
    const s = target / Math.max(size.x, size.y, size.z);
    geo.scale(s, s, s); geo.computeBoundingBox();
    return { geometry: geo, materials: mats, height: bb.max.y - bb.min.y };
  })();
  modelLib.set(rel, p); return p;
}

const index = await fetch('/chunks/index.json').then(r => r.json());
console.log('[viewer] city index', index);

const MODEL_CAPACITY = {
  'bridges/fang_wall/Tang_FangWall.glb': 30000,
  'machiya_houses/house2_procedural/Tang_House2.glb': 3000,
  'bridges/big_fang_gate/Tang_BigFangGate.glb': 500,
  'machiya_houses/shop_front/Tang_ShopFront.glb': 500,
  'chinese_tang_direct/hall_9bay/Tang_Hall_9bay.glb': 50,
  'chinese_tang_direct/pagoda5/Tang_Pagoda5.glb': 50,
  'chinese_tang_direct/wumen/Tang_Wumen.glb': 50,
};

const fullMeshes = new Map();
const ZERO_MAT = new THREE.Matrix4().makeScale(0, 0, 0);
const dummy = new THREE.Object3D();

function getFullMesh(rel) {
  if (fullMeshes.has(rel)) return fullMeshes.get(rel);
  const holder = { mesh: null, rel, nextSlot: 0, ranges: new Map() };
  fullMeshes.set(rel, holder);
  const cap = MODEL_CAPACITY[rel] || 512;
  loadModel(rel).then(({ geometry, materials }) => {
    const mat = Array.isArray(materials) ? materials[0] : materials;
    const im = new THREE.InstancedMesh(geometry, mat, cap);
    im.frustumCulled = false;
    for (let i = 0; i < cap; i++) im.setMatrixAt(i, ZERO_MAT);
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(im); holder.mesh = im;
  }).catch(e => console.warn('[model] fail', rel, e));
  return holder;
}

const billGeo = new THREE.BoxGeometry(1, 1, 1);
const billMat = new THREE.MeshStandardMaterial({ color: 0x9a8866, roughness: 1 });
let billMesh = new THREE.InstancedMesh(billGeo, billMat, 4096);
billMesh.frustumCulled = false;
for (let i = 0; i < 4096; i++) billMesh.setMatrixAt(i, ZERO_MAT);
billMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(billMesh);
let billUsed = 0;

const chunkMap = new Map();
const chunkQueue = [];
let loadingCount = 0;

function chunkKey(cx, cz) { return cx + '_' + cz; }

async function loadChunk(cx, cz, tier) {
  const key = chunkKey(cx, cz);
  if (chunkMap.has(key)) return chunkMap.get(key);
  const data = await fetch(`/chunks/chunk_${cx}_${cz}.json`).then(r => r.json());
  const rec = { data, tier, loaded: false };
  chunkMap.set(key, rec);
  applyChunk(rec, tier);
  return rec;
}

function applyChunk(chunk, tier) {
  if (chunk.tier === tier && chunk.loaded) return;
  chunk.tier = tier;
  // NEAR: 完整模型实例化; MID: 去墙; FAR: billboard盒体
  for (const obj of chunk.data.objects || []) {
    if (tier === 'NEAR') {
      const fh = getFullMesh(obj.model);
      // 分配slot并写入矩阵
    } else if (tier === 'FAR') {
      // billboard盒体
    }
  }
  chunk.loaded = true;
}

// 玩家控制
const player = new THREE.Vector3(4860, 0, 2658);
const keys = {};
addEventListener('keydown', e => keys[e.code] = true);
addEventListener('keyup', e => keys[e.code] = false);
let yaw = 0;
addEventListener('mousemove', e => {
  if (document.pointerLockElement) yaw -= e.movementX * 0.0025;
});
renderer.domElement.addEventListener('click', () => renderer.domElement.requestPointerLock());

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const speed = (keys['ShiftLeft'] ? 60 : 20) * dt;
  let mx = 0, mz = 0;
  if (keys['KeyW']) mz -= 1; if (keys['KeyS']) mz += 1;
  if (keys['KeyA']) mx -= 1; if (keys['KeyD']) mx += 1;
  const len = Math.hypot(mx, mz);
  if (len > 0) {
    mx /= len; mz /= len;
    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    player.x += (mx * cos - mz * sin) * speed;
    player.z += (mx * sin + mz * cos) * speed;
  }
  camera.position.set(player.x - Math.sin(yaw) * 8, player.y + 6, player.z - Math.cos(yaw) * 8);
  camera.lookAt(player.x, player.y + 2, player.z);
  
  // 根据相机位置决定加载哪些chunk
  const ccx = Math.floor(player.x / CHUNK);
  const ccz = Math.floor(-player.z / CHUNK);
  for (let dx = -TIER.NEAR; dx <= TIER.NEAR; dx++)
    for (let dz = -TIER.NEAR; dz <= TIER.NEAR; dz++)
      loadChunk(ccx + dx, ccz + dz, 'NEAR');
  
  renderer.render(scene, camera);
}
animate();

window.__ready = true;
