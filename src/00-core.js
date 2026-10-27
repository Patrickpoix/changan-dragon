/* ============================================================
   龙游长安 · 核心场景 / 工具 / 材质 / 城市数据
   v5: 纹理改为白色底+细节模式 — instance color提供颜色，纹理提供表面细节
   ============================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const R = mulberry32(20261021);
const rr = (a = 0, b = 1) => a + R() * (b - a);
const pick = (arr) => arr[Math.floor(R() * arr.length)];

const isTouch = matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const params = new URLSearchParams(location.search);
const DEBUG = params.has('debug');

// ---------------------------------------------------------------- renderer
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
  stencil: false,
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 1.04;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0xa9cbd7, 1);
const MAX_DPR = isTouch ? 1.25 : 1.65;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xc9d7d5, 145, 690);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 1800);
camera.position.set(16, 7, -110);

// ---------------------------------------------------------------- lights
const hemi = new THREE.HemisphereLight(0xfff3d8, 0x4f8f78, 0.74);
scene.add(hemi);
const ambient = new THREE.AmbientLight(0xfff4e2, 0.22);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffe6bd, 1.72);
sun.position.set(125, 105, 75);
sun.castShadow = true;
sun.shadow.mapSize.set(isTouch ? 1024 : 2048, isTouch ? 1024 : 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 420;
sun.shadow.camera.left = -95;
sun.shadow.camera.right = 95;
sun.shadow.camera.top = 95;
sun.shadow.camera.bottom = -95;
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.035;
scene.add(sun);
scene.add(sun.target);
const rim = new THREE.DirectionalLight(0xffb98f, 0.27);
rim.position.set(-100, 60, -130);
scene.add(rim);

// ---------------------------------------------------------------- palette
const C = {
  ink: 0x1f3839, paper: 0xfff4d8, plaster: 0xfff2d8, plasterWarm: 0xffe5bd,
  wood: 0xa94b2d, woodDark: 0x6d3022, woodLight: 0xd77b3e,
  red: 0xe8422f, redDeep: 0xb82d27, vermilion: 0xff5c3e,
  gold: 0xf7b72d, goldLight: 0xffdd72, jade: 0x2a9e83, jadeLight: 0x64d4ad,
  roof: 0x2d8e83, roofDark: 0x236f70, roofBlue: 0x2f7893,
  stone: 0xd7d2bd, stoneDark: 0x959b8f, road: 0xe6d3a6,
  grass: 0x76c65b, water: 0x25aeb2, blossom: 0xff91a7, willow: 0x65bf4c,
  lantern: 0xff5638, night: 0x101d3d,
};

const matCache = new Map();
function toon(color, opts = {}) {
  const key = 't' + color + JSON.stringify(opts);
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0, ...opts });
  matCache.set(key, m);
  return m;
}

// ---------------------------------------------------------------- canvas textures
// v5: 所有纹理都是白色底(0xffffff) + 中性细节，instance color提供真实颜色
function makeTexture(w, h, draw, { repeat = [1, 1], colorSpace = THREE.SRGBColorSpace } = {}) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.colorSpace = colorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

const TEX = {};

// v5: 墙面灰泥 — 白色底+细微斑驳和裂纹
TEX.plaster = makeTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  // 细微噪点
  for (let i = 0; i < 600; i++) {
    const a = Math.random() * 0.06;
    ctx.fillStyle = `rgba(180,170,150,${a})`;
    const s = 1 + Math.random() * 2;
    ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
  }
  // 斑驳痕迹
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = `rgba(160,150,130,${0.03 + Math.random() * 0.04})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, rand(5, 20), rand(3, 12), rand(0, TAU), 0, TAU);
    ctx.fill();
  }
  // 细微裂纹
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(140,130,110,${0.04 + Math.random() * 0.03})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    let x = Math.random() * w, y = Math.random() * h;
    ctx.moveTo(x, y);
    for (let j = 0; j < 4; j++) { x += rand(-12, 12); y += rand(-8, 8); ctx.lineTo(x, y); }
    ctx.stroke();
  }
}, { repeat: [2, 2] });

// v5: 木材 — 白色底+木纹线条（instance color提供棕色）
TEX.wood = makeTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  // 木纹线条 — 用灰色，不影响最终颜色
  for (let i = 0; i < 30; i++) {
    ctx.strokeStyle = `rgba(100,80,60,${0.04 + Math.random() * 0.06})`;
    ctx.lineWidth = 0.8 + Math.random() * 1.2;
    ctx.beginPath();
    const y = Math.random() * h;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(w * 0.25, y + rand(-6, 6), w * 0.5, y + rand(-10, 10), w, y + rand(-3, 3));
    ctx.stroke();
  }
  // 细微噪点
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = `rgba(120,100,80,${Math.random() * 0.04})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
}, { repeat: [1, 2] });

// v5: 石材 — 白色底+石板缝隙（instance color提供灰色/米色）
TEX.stone = makeTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  const sw = 64, sh = 48;
  for (let y = 0; y < h + sh; y += sh) {
    const off = (Math.floor(y / sh) % 2) * sw / 2;
    for (let x = -sw; x < w + sw; x += sw) {
      // 石板缝隙
      ctx.strokeStyle = 'rgba(100,100,100,0.25)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + off, y, sw, sh);
      // 石板内细微变化
      ctx.fillStyle = `rgba(200,200,200,${0.03 + Math.random() * 0.04})`;
      ctx.fillRect(x + off + 2, y + 2, sw - 4, sh - 4);
    }
  }
  // 磨损痕迹
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = `rgba(180,180,180,${0.03 + Math.random() * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, rand(8, 30), rand(4, 15), rand(0, TAU), 0, TAU);
    ctx.fill();
  }
}, { repeat: [1, 1] });

// v5: 屋顶瓦面 — 白色底+瓦垄线条（instance color提供青色/灰色）
TEX.roof = makeTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  // 瓦垄 — 竖向条纹
  for (let x = 0; x < w; x += 12) {
    const g = ctx.createLinearGradient(x, 0, x + 12, 0);
    g.addColorStop(0, 'rgba(100,100,100,0.2)');
    g.addColorStop(0.3, 'rgba(255,255,255,0.15)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.05)');
    g.addColorStop(1, 'rgba(80,80,80,0.25)');
    ctx.fillStyle = g; ctx.fillRect(x, 0, 12, h);
  }
  // 瓦当 — 横向接缝
  for (let y = 0; y < h; y += 20) {
    ctx.fillStyle = 'rgba(80,80,80,0.2)'; ctx.fillRect(0, y, w, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(0, y + 2, w, 1);
  }
}, { repeat: [4, 3] });

// v5: 树皮 — 白色底+树皮纹理
TEX.bark = makeTexture(128, 256, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 10) {
    ctx.strokeStyle = `rgba(100,80,60,${0.15 + Math.random() * 0.1})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + rand(-5, 5), h);
    ctx.stroke();
  }
}, { repeat: [1, 2] });

// v5: 窗格 — 白色底+窗格线条
TEX.lattice = makeTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#4b3527'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#e9d8b6';
  for (let x = 0; x < w; x += 32) ctx.fillRect(x, 0, 6, h);
  for (let y = 0; y < h; y += 32) ctx.fillRect(0, y, w, 6);
  for (let x = 16; x < w; x += 32) for (let y = 16; y < h; y += 32) {
    ctx.fillStyle = 'rgba(255,240,205,.45)';
    ctx.fillRect(x - 2, y - 2, 10, 10);
  }
}, { repeat: [1, 1] });

TEX.grass = makeTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = `rgba(100,140,80,${Math.random() * 0.08})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
  for (let i = 0; i < 150; i++) {
    ctx.strokeStyle = `rgba(80,120,60,.12)`;
    ctx.lineWidth = 1; ctx.beginPath();
    const x = Math.random() * w, y = Math.random() * h;
    ctx.moveTo(x, y); ctx.lineTo(x + rand(-3, 3), y - rand(3, 6)); ctx.stroke();
  }
}, { repeat: [18, 18] });

TEX.dirt = makeTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = `rgba(160,140,100,${Math.random() * 0.06})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(140,120,80,${0.02 + Math.random() * 0.03})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, rand(3, 10), rand(1, 4), rand(0, TAU), 0, TAU);
    ctx.fill();
  }
}, { repeat: [12, 12] });

// ---------------------------------------------------------------- MAT materials (v5: 白色纹理底，instance color提供颜色)
const MAT = {
  plaster: new THREE.MeshStandardMaterial({ map: TEX.plaster, color: 0xffffff, roughness: 0.82, metalness: 0.02 }),
  plasterWarm: new THREE.MeshStandardMaterial({ map: TEX.plaster, color: 0xfff5e0, roughness: 0.8, metalness: 0.02 }),
  wood: new THREE.MeshStandardMaterial({ map: TEX.wood, color: 0xffffff, roughness: 0.65, metalness: 0.05 }),
  red: new THREE.MeshStandardMaterial({ map: TEX.wood, color: 0xffffff, roughness: 0.55, metalness: 0.1 }),
  stone: new THREE.MeshStandardMaterial({ map: TEX.stone, color: 0xffffff, roughness: 0.88, metalness: 0.02 }),
  roof: new THREE.MeshStandardMaterial({ map: TEX.roof, color: 0xffffff, roughness: 0.85, metalness: 0.03 }),
  roofGlazed: new THREE.MeshStandardMaterial({ map: TEX.roof, color: 0xe8f0ff, roughness: 0.4, metalness: 0.25 }),
  gold: new THREE.MeshStandardMaterial({ color: C.gold, roughness: 0.32, metalness: 0.62 }),
  dark: new THREE.MeshStandardMaterial({ map: TEX.wood, color: 0x999999, roughness: 0.9, metalness: 0.01 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0 }),
  trunk: new THREE.MeshStandardMaterial({ map: TEX.bark, color: 0xffffff, roughness: 0.92, metalness: 0 }),
  blossom: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75, metalness: 0 }),
  water: null,
  lantern: new THREE.MeshStandardMaterial({ color: 0xff6a4e, emissive: 0xff4a2e, emissiveIntensity: 0.25, roughness: 0.55 }),
  lanternGlow: new THREE.MeshBasicMaterial({ color: 0xffb46b, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }),
  window: new THREE.MeshStandardMaterial({ map: TEX.lattice, color: 0xffffff, roughness: 0.8, emissive: 0xffb35f, emissiveIntensity: 0 }),
};

// ---------------------------------------------------------------- geometry helpers
function roundedBoxGeo(w, h, d, r = 0.08) {
  const shape = new THREE.Shape();
  const x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  shape.moveTo(x, -h / 2);
  shape.lineTo(x + ww, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSegments: 1,
    steps: 1, bevelSize: r, bevelThickness: r, curveSegments: 2,
  });
  geo.center();
  geo.computeBoundingBox();
  const size = geo.boundingBox.getSize(new THREE.Vector3());
  geo.scale(w / size.x, h / size.y, d / size.z);
  return geo;
}

const UNIT_BOX = roundedBoxGeo(1, 1, 1, 0.012);
const UNIT_CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 10, 1, false);
const UNIT_SPHERE = new THREE.SphereGeometry(0.5, 12, 9);
const UNIT_CONE = new THREE.ConeGeometry(0.5, 1, 10, 1);
const UNIT_PLANE = new THREE.PlaneGeometry(1, 1);

function roofGeometry(segX = 12, segZ = 8, ridgeRatio = 0.62, lift = 0.055) {
  const pos = [], uv = [], idx = [];
  const half = 0.5;
  for (let iz = 0; iz <= segZ; iz++) {
    const z = -half + iz / segZ;
    for (let ix = 0; ix <= segX; ix++) {
      const x = -half + ix / segX;
      const tx = Math.max(0, (Math.abs(x) - ridgeRatio * half) / ((1 - ridgeRatio) * half));
      const tz = Math.abs(z) / half;
      const t = Math.max(tx, tz);
      let y = Math.pow(1 - Math.min(1, t), 1.12);
      y += lift * Math.pow(t, 4);
      y += lift * 1.7 * Math.pow(tx, 3) * Math.pow(tz, 4);
      pos.push(x, y, z);
      uv.push(ix / segX, iz / segZ);
    }
  }
  for (let iz = 0; iz < segZ; iz++) for (let ix = 0; ix < segX; ix++) {
    const a = iz * (segX + 1) + ix, b = a + 1, c = a + segX + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
const ROOF_UNIT = roofGeometry(12, 8, 0.62, 0.055);
const ROOF_SMALL = roofGeometry(8, 6, 0.5, 0.065);

const BATCH_LOD_GEOMETRY = new WeakMap([
  [UNIT_BOX, new THREE.BoxGeometry(1, 1, 1)],
  [UNIT_CYL, new THREE.CylinderGeometry(0.5, 0.5, 1, 6)],
  [UNIT_SPHERE, new THREE.SphereGeometry(0.5, 6, 4)],
]);

class Batch {
  constructor(geometry, material, opts = {}) {
    this.geometry = geometry; this.material = material; this.items = [];
    this.cast = opts.cast !== false; this.receive = opts.receive !== false;
    this.maxDistance = opts.maxDistance || 0;
    this.farGeometry = opts.farGeometry || BATCH_LOD_GEOMETRY.get(geometry) || null;
    this.nearDistance = opts.nearDistance || 95;
    this.cellSize = opts.cellSize || 176;
    this._group = null;
  }
  add(x, y, z, sx, sy, sz, ry = 0, color = null, rx = 0, rz = 0) {
    this.items.push({ x, y, z, sx, sy, sz, ry, rx, rz, color });
    return this;
  }
  build(parent = scene) {
    if (!this.items.length) return null;
    if (this._group) { this._group.removeFromParent(); this._group = null; }
    const cells = new Map();
    for (const item of this.items) {
      const key = Math.floor(item.x / this.cellSize) + ',' + Math.floor(item.z / this.cellSize);
      if (!cells.has(key)) cells.set(key, []);
      cells.get(key).push(item);
    }
    const group = new THREE.Group(); group.name = 'spatial-instances';
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const p = new THREE.Vector3(), s = new THREE.Vector3();
    const col = new THREE.Color();
    for (const items of cells.values()) {
      const mesh = new THREE.InstancedMesh(this.geometry, this.material, items.length);
      const hasColors = items.some(item => item.color != null);
      items.forEach((it, i) => {
        p.set(it.x, it.y, it.z); s.set(it.sx, it.sy, it.sz); e.set(it.rx, it.ry, it.rz); q.setFromEuler(e);
        m.compose(p, q, s); mesh.setMatrixAt(i, m);
        if (hasColors) mesh.setColorAt(i, col.set(it.color ?? 0xffffff));
      });
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.castShadow = this.cast; mesh.receiveShadow = this.receive;
      mesh.frustumCulled = true; mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      if (this.maxDistance) { mesh.userData.detailDistance = this.maxDistance; mesh.userData.detailCenter = mesh.boundingSphere.center.clone(); mesh.userData.detailRadius = mesh.boundingSphere.radius; }
      if (this.farGeometry) {
        mesh.userData.highGeometry = this.geometry; mesh.userData.lowGeometry = this.farGeometry;
        mesh.userData.nearDistance = this.nearDistance;
        mesh.userData.lodBounds = new THREE.Box3().setFromObject(mesh);
      }
      mesh.matrixAutoUpdate = false; group.add(mesh);
    }
    parent.add(group); this._group = group;
    return group;
  }
}

function quadBatch(material) {
  const pos = [], uvs = [], idx = []; let count = 0;
  return {
    add(w, h, matrix, u0 = 0, v0 = 0, u1 = 1, v1 = 1) {
      const corners = [[-w/2,-h/2,0],[w/2,-h/2,0],[w/2,h/2,0],[-w/2,h/2,0]];
      const v = new THREE.Vector3();
      corners.forEach((c, i) => {
        v.set(c[0], c[1], c[2]).applyMatrix4(matrix);
        pos.push(v.x, v.y, v.z);
        uvs.push(i === 0 ? u0 : i === 1 ? u1 : i === 2 ? u1 : u0, i < 2 ? v0 : v1);
      });
      const b = count * 4; idx.push(b, b+1, b+2, b, b+2, b+3); count++;
      return this;
    },
    build() {
      if (!count) return null;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      g.setIndex(idx); g.computeVertexNormals();
      const mesh = new THREE.Mesh(g, material); mesh.receiveShadow = true;
      scene.add(mesh); return mesh;
    },
  };
}

// ---------------------------------------------------------------- city data
const CITY = { x0: -450, x1: 450, z0: -380, z1: 380 };
const WORLD = { x0: -780, x1: 780, z0: -660, z1: 660 };
const AVENUE = 26;
const AVENUE_SHOP_Z=Object.freeze([266,288,338,360]);
const TREE_CLEAR_AREAS=Object.freeze([
  {x0:137,x1:163,z0:-520,z1:-378},{x0:-14,x1:14,z0:-380,z1:-220},
  {x0:198,x1:234,z0:265,z1:301},{x0:-230,x1:-202,z0:308,z1:336},
]);
const FILM_SHOTS = [
  { eye: [7,3.8,327], target: [0,4,277], drift: 2.5 },
  { eye: [-258,3.4,16], target: [-284,4.3,-40], drift: 3 },
  { eye: [174,3.4,16], target: [200,4.3,-40], drift: 3 },
  { eye: [110,16,-389], target: [150,17,-432], drift: 5 },
  { eye: [320,4,-90], target: [350,6,-158], drift: 4 },
  { eye: [235,5.5,325], target: [216,24,283], drift: 3 },
  { eye: [306,3.5,350], target: [354,4,318], drift: 3 },
  { eye: [34,4.5,429], target: [0,12,380], drift: 4 },
];
const WARD_W = 70, WARD_D = 54, STREET = 14, ROW_STREET = 12;
const COLS = [-384,-300,-216,-132,-48,48,132,216,300,384];
const ROWS = [-179,-113,-47,19,85,151,217,283,349];

const WARD_NAMES_LEFT = [
  '延平坊','延寿坊','光德坊','通义坊','兴化坊','崇德坊','怀远坊','宣化坊','丰邑坊','待贤坊',
  '长寿坊','嘉会坊','永平坊','通轨坊','归义坊','昭行坊','修真坊','普宁坊','义宁坊','安定坊',
  '休祥坊','金城坊','醴泉坊','布政坊','颁政坊','辅兴坊','延祚坊','崇仁坊','平康坊','宣阳坊',
];
const WARD_NAMES_RIGHT = [
  '亲仁坊','永宁坊','永崇坊','昭国坊','晋昌坊','通善坊','曲池坊','芙蓉坊','敦化坊','丰乐坊',
  '安业坊','光福坊','兴道坊','务本坊','长乐坊','大宁坊','兴宁坊','道政坊','常乐坊','靖恭坊',
  '新昌坊','升平坊','升道坊','修行坊','修政坊','青龙坊','安德坊','翊善坊','来庭坊','永兴坊',
];

const wards = []; const roads = []; const landmarks = [];
const colliders = []; const groundPatches = []; const marketDefs = [];

function addCollider(minX, maxX, minZ, maxZ, tag = '') {
  if (maxX - minX < 0.05 || maxZ - minZ < 0.05) return;
  colliders.push({ minX, maxX, minZ, maxZ, tag });
}
function addWardRecord(col, row, name, type = 'ward') {
  wards.push({ col, row, x: COLS[col], z: ROWS[row], w: WARD_W, d: WARD_D, name, type });
}

function isWestMarket(col, row) { return col >= 1 && col <= 2 && row >= 2 && row <= 3; }
function isEastMarket(col, row) { return col >= 6 && col <= 7 && row >= 2 && row <= 3; }
function isXingqing(col, row) { return col >= 8 && col <= 9 && row >= 0 && row <= 1; }
function isQujiang(col, row) { return col >= 8 && row >= 7; }
function isPagoda(col, row) { return (col === 7 && row === 7) || (col === 2 && row === 8); }
function isSpecial(col, row) {
  return isWestMarket(col,row)||isEastMarket(col,row)||isXingqing(col,row)||isQujiang(col,row)||isPagoda(col,row);
}

let li = 0, ri = 0;
for (let row = 0; row < 9; row++) for (let col = 0; col < 10; col++) {
  if (isSpecial(col, row)) continue;
  const name = col < 5 ? WARD_NAMES_LEFT[li++ % WARD_NAMES_LEFT.length] : WARD_NAMES_RIGHT[ri++ % WARD_NAMES_RIGHT.length];
  addWardRecord(col, row, name);
}

roads.push({ x: 0, z: 0, w: AVENUE, d: 780, axis: 'z', type: 'avenue', name: '朱雀大街' });
roads.push({ x: 0, z: -150, w: 900, d: 18, axis: 'x', type: 'avenue', name: '春明门大街' });
roads.push({ x: 0, z: 55, w: 900, d: 16, axis: 'x', type: 'avenue', name: '金光门大街' });
roads.push({ x: 0, z: 232, w: 900, d: 16, axis: 'x', type: 'avenue', name: '延兴门大街' });
for (const x of [-342,-258,-174,-90,90,174,258,342]) roads.push({ x, z: 0, w: 14, d: 780, axis: 'z', type: 'street' });
for (const z of [-206,-140,-74,-8,58,124,190,256,322]) roads.push({ x: 0, z, w: 900, d: 12, axis: 'x', type: 'street' });

// ---------------------------------------------------------------- sky
const cloudNoiseBytes = new Uint8Array(256 * 256 * 4);
for (let i = 0; i < 256 * 256; i++) {
  let hash = Math.imul(i ^ 16023, 1597334677);
  hash = Math.imul(hash ^ (hash >>> 16), 2246822519);
  const noise = (hash ^ (hash >>> 13)) & 255;
  cloudNoiseBytes.set([noise, noise, noise, 255], i * 4);
}
const cloudNoise = new THREE.DataTexture(cloudNoiseBytes, 256, 256, THREE.RGBAFormat);
cloudNoise.wrapS = cloudNoise.wrapT = THREE.RepeatWrapping;
cloudNoise.minFilter = cloudNoise.magFilter = THREE.LinearFilter;
cloudNoise.needsUpdate = true;

const skyUniforms = {
  topColor: { value: new THREE.Color(0x85b6ce) },
  horizonColor: { value: new THREE.Color(0xf8e3c8) },
  sunColor: { value: new THREE.Color(0xffc95e) },
  sunDir: { value: new THREE.Vector3(125, 105, 75).normalize() },
  night: { value: 0 }, time: { value: 0 },
  cloudNoise: { value: cloudNoise },
};
const skyMat = new THREE.ShaderMaterial({
  uniforms: skyUniforms, side: THREE.BackSide, depthWrite: false,
  vertexShader: `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform vec3 topColor; uniform vec3 horizonColor; uniform vec3 sunColor; uniform vec3 sunDir; uniform float night;
    uniform float time; uniform sampler2D cloudNoise; varying vec3 vDir;
    float cloudField(vec2 p) {
      return texture2D(cloudNoise, p/256.0).r*0.57 + texture2D(cloudNoise, p*2.03/256.0).r*0.27
        + texture2D(cloudNoise, p*4.11/256.0).r*0.11 + texture2D(cloudNoise, p*8.17/256.0).r*0.05;
    }
    void main() {
      vec3 ray = normalize(vDir); float h = clamp(ray.y, 0.0, 1.0);
      vec3 col = mix(horizonColor, topColor, smoothstep(0.0, 0.24, h));
      float sd = max(dot(ray, normalize(sunDir)), 0.0);
      col += sunColor * pow(sd, 900.0) * 1.6;
      col += sunColor * pow(sd, 14.0) * 0.22;
      vec2 cloudUV = ray.xz / max(h + 0.14, 0.14) * 3.8 + vec2(time * 0.0015, 14.7);
      float field = cloudField(cloudUV);
      float thin = cloudField(cloudUV * 1.7 + vec2(31.4, time * 0.0006));
      float cover = smoothstep(0.51, 0.69, field + (thin - 0.5) * 0.12);
      cover *= smoothstep(0.015, 0.16, h) * 0.92;
      float edge = cloudField(cloudUV + normalize(sunDir.xz) * 0.18) - field;
      vec3 cloudShade = mix(vec3(0.66,0.74,0.79), vec3(1.18,1.13,1.01), clamp(0.62 + edge*3.5 + h*0.2, 0.0, 1.0));
      cloudShade = mix(cloudShade, vec3(0.045,0.068,0.12), night);
      col = mix(col, cloudShade, cover);
      float horizon = 1.0 - smoothstep(-0.02, 0.14, ray.y);
      col = mix(col, horizonColor * 1.02, horizon * 0.55);
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 20), skyMat);
sky.frustumCulled = false; scene.add(sky);

const starGeo = new THREE.BufferGeometry();
{
  const p = [];
  for (let i = 0; i < 700; i++) {
    const a = Math.random() * TAU, e = Math.random() * Math.PI * 0.46 + 0.05, r = 820;
    p.push(Math.cos(a)*Math.cos(e)*r, Math.sin(e)*r, Math.sin(a)*Math.cos(e)*r);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
}
const starMat = new THREE.PointsMaterial({ color: 0xfff3cf, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const stars = new THREE.Points(starGeo, starMat); stars.frustumCulled = false; scene.add(stars);

for (let layer = 0; layer < 2; layer++) {
  const vertices = [], indices = [], segments = 192, radius = 1180 + layer * 280;
  for (let i = 0; i <= segments; i++) {
    const a = i / segments * TAU;
    const h = 78 + layer * 36 + Math.sin(a*5+0.8)*29 + Math.sin(a*11-0.4)*16 + Math.sin(a*3)*22;
    for (const y of [-10, h]) vertices.push(Math.cos(a)*radius, y, Math.sin(a)*radius);
    if (i < segments) { const n = i*2; indices.push(n, n+1, n+2, n+1, n+3, n+2); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices); geo.computeVertexNormals();
  scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: layer ? 0xb6c9cd : 0xa7bfc3, side: THREE.DoubleSide })));
}

// ---------------------------------------------------------------- ground & roads
function buildGround() {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(1700, 1500, 1, 1), new THREE.MeshStandardMaterial({ map: TEX.grass, roughness: 1 }));
  g.rotation.x = -Math.PI / 2; g.position.y = -0.25; g.receiveShadow = true; scene.add(g);
  const fieldBatch = new Batch(UNIT_BOX, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }), { cast: false });
  const fieldColors = [0x9cab63, 0xc6b775, 0x7d9358, 0xc5bd7d, 0xa1ae6b];
  for (let i = 0; i < 70; i++) {
    let x, z; do { x = rr(-740,740); z = rr(-620,620); } while (x > -500 && x < 500 && z > -540 && z < 430);
    fieldBatch.add(x, -0.18, z, rr(30,80), 0.16, rr(20,65), rr(-0.1,0.1), pick(fieldColors));
  }
  fieldBatch.build();
  const cityGround = new THREE.Mesh(new THREE.PlaneGeometry(920, 790), new THREE.MeshStandardMaterial({ map: TEX.dirt, roughness: 1, color: 0xd9ccb2 }));
  cityGround.rotation.x = -Math.PI/2; cityGround.position.set(0, -0.05, 0); cityGround.receiveShadow = true; scene.add(cityGround);
  const gardenMaterial = new THREE.MeshStandardMaterial({ map: TEX.grass, roughness: 1, color: 0xc6cfac });
  for (const [x,z,rx,rz] of [[354,318,96,83],[342,-152,72,54],[232,-492,43,23]]) {
    const lawn = new THREE.Mesh(new THREE.CircleGeometry(1,64), gardenMaterial);
    lawn.rotation.x = -Math.PI/2; lawn.position.set(x,-.035,z); lawn.scale.set(rx,rz,1); lawn.receiveShadow = true; scene.add(lawn);
  }
}

const roadMeshes = [];
function makeRoadMesh(road) {
  const isAvenue = road.type === 'avenue';
  const w = road.w, d = road.d;
  const sw = Math.max(2, Math.ceil(w/5)), sd = Math.max(2, Math.ceil(d/5));
  const geo = new THREE.PlaneGeometry(w, d, sw, sd);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); pos.setZ(i, 0.055*(1-Math.pow(x/(w/2),2))); }
  geo.rotateX(-Math.PI/2); geo.computeVertexNormals();
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i)*w/3, uv.getY(i)*d/3);
  const mat = new THREE.MeshStandardMaterial({
    map: isAvenue ? TEX.stone : TEX.dirt,
    bumpMap: isAvenue ? TEX.stone : null, bumpScale: 0.045,
    color: isAvenue ? 0xf2e1c5 : 0xe1cdae,
    roughness: 0.94, metalness: 0,
  });
  if (isAvenue) SurfaceLibrary.softenStone(mat);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true; mesh.position.set(road.x, 0.015, road.z);
  scene.add(mesh); roadMeshes.push(mesh); return mesh;
}

function clipRoadsForWater() {
  for (const mesh of roadMeshes) {
    const geometry = mesh.geometry, positions = geometry.attributes.position, index = geometry.index;
    const keep = [];
    for (let i = 0; i < index.count; i += 3) {
      const ids = [index.getX(i), index.getX(i+1), index.getX(i+2)];
      const x = ids.reduce((sum,id)=>sum+positions.getX(id),0)/3 + mesh.position.x;
      const z = ids.reduce((sum,id)=>sum+positions.getZ(id),0)/3 + mesh.position.z;
      if (!isWaterPoint(x,z) || isLand(x,z)) keep.push(...ids);
    }
    geometry.setIndex(keep);
  }
}

function buildRoads() {
  roads.forEach(makeRoadMesh);
  const centralGeo = new THREE.PlaneGeometry(7.6, 780);
  const centralUV = centralGeo.attributes.uv;
  for (let i = 0; i < centralUV.count; i++) centralUV.setXY(i, centralUV.getX(i)*2.53, centralUV.getY(i)*260);
  const central = new THREE.Mesh(centralGeo, SurfaceLibrary.paving(0xe6dfcc));
  central.rotation.x = -Math.PI/2; central.position.set(0, 0.075, 0); central.receiveShadow = true; scene.add(central);
  const lane = new Batch(UNIT_BOX, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.05 }), { cast: false });
  lane.add(-3.55, 0.09, 0, 0.12, 0.03, 780, 0, 0xbbab87);
  lane.add(3.55, 0.09, 0, 0.12, 0.03, 780, 0, 0xbbab87);
  lane.build();
  const motif = new Batch(new THREE.CircleGeometry(1.0,16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.34, depthWrite: false }), { cast: false, receive: false });
  for (let z = -360; z <= 360; z += 38) motif.add(0, 0.092, z, 0.75, 0.75, 0.75, 0, 0xa99473, -Math.PI/2);
  motif.build();
  const curb = new Batch(UNIT_BOX, MAT.stone, { cast: false });
  for (const item of [[-14.2,0,0,0.45,0.22,780],[14.2,0,0,0.45,0.22,780]]) curb.add(item[0],0.06,item[2],item[3],item[4],item[5],0,0xd8cdb5);
  for (const z of [-150,55,232]) {
    curb.add(0, 0.06, z-8.6, 900, 0.22, 0.45, 0, 0xd8cdb5);
    curb.add(0, 0.06, z+8.6, 900, 0.22, 0.45, 0, 0xd8cdb5);
  }
  curb.build();
}

// ---------------------------------------------------------------- collision hash
const colliderGrid = new Map();
const groundPatchGrid = new Map();
const CELL = 24;
function buildColliderHash() {
  colliderGrid.clear(); groundPatchGrid.clear();
  for (const patch of groundPatches) {
    for (let x = Math.floor(patch.x0/CELL); x <= Math.floor(patch.x1/CELL); x++)
      for (let z = Math.floor(patch.z0/CELL); z <= Math.floor(patch.z1/CELL); z++) {
        const key = x+','+z;
        if (!groundPatchGrid.has(key)) groundPatchGrid.set(key, []);
        groundPatchGrid.get(key).push(patch);
      }
  }
  for (const c of colliders) {
    const minCx = Math.floor(c.minX/CELL), maxCx = Math.floor(c.maxX/CELL);
    const minCz = Math.floor(c.minZ/CELL), maxCz = Math.floor(c.maxZ/CELL);
    for (let cx = minCx; cx <= maxCx; cx++) for (let cz = minCz; cz <= maxCz; cz++) {
      const k = cx+','+cz; let arr = colliderGrid.get(k);
      if (!arr) colliderGrid.set(k, arr = []);
      arr.push(c);
    }
  }
}
function resolveCollisions(pos, radius = 1.15) {
  const cx = Math.floor(pos.x/CELL), cz = Math.floor(pos.z/CELL);
  let hit = false;
  for (let ix = cx-1; ix <= cx+1; ix++) for (let iz = cz-1; iz <= cz+1; iz++) {
    const arr = colliderGrid.get(ix+','+iz); if (!arr) continue;
    for (const c of arr) {
      const nx = clamp(pos.x, c.minX, c.maxX), nz = clamp(pos.z, c.minZ, c.maxZ);
      let dx = pos.x - nx, dz = pos.z - nz;
      const d2 = dx*dx + dz*dz;
      if (d2 < radius*radius) {
        hit = true;
        if (d2 > 1e-6) {
          const d = Math.sqrt(d2), push = radius - d;
          pos.x += (dx/d)*push; pos.z += (dz/d)*push;
        } else {
          const l = pos.x-c.minX, r = c.maxX-pos.x, t = pos.z-c.minZ, b = c.maxZ-pos.z;
          const m = Math.min(l,r,t,b);
          if (m === l) pos.x = c.minX - radius;
          else if (m === r) pos.x = c.maxX + radius;
          else if (m === t) pos.z = c.minZ - radius;
          else pos.z = c.maxZ + radius;
        }
      }
    }
  }
  return hit;
}

addCollider(WORLD.x0-2, WORLD.x0, WORLD.z0, WORLD.z1, 'world');
addCollider(WORLD.x1, WORLD.x1+2, WORLD.z0, WORLD.z1, 'world');
addCollider(WORLD.x0, WORLD.x1, WORLD.z0-2, WORLD.z0, 'world');
addCollider(WORLD.x0, WORLD.x1, WORLD.z1, WORLD.z1+2, 'world');