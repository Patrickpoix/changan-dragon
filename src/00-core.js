/* ============================================================
   龙游长安 · 核心场景 / 工具 / 材质 / 城市数据
   一个完全自包含的 Three.js 卡通长安城
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
  antialias: !isTouch,
  alpha: false,
  powerPreference: 'high-performance',
  stencil: false,
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
// 国漫风需要保留高饱和色，ACES 会把朱红和青绿压成灰米色
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 1.04;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0xb9dfe6, 1);
const MAX_DPR = isTouch ? 1.55 : 1.8;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcde9df, 175, 760);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 1800);
camera.position.set(16, 7, -110);

// ---------------------------------------------------------------- lights
const hemi = new THREE.HemisphereLight(0xfff3d8, 0x4f8f78, 0.74);
scene.add(hemi);
const ambient = new THREE.AmbientLight(0xfff4e2, 0.22);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffe6bd, 1.72);
sun.position.set(120, 180, 80);
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
  ink: 0x1f3839,
  paper: 0xfff4d8,
  plaster: 0xfff2d8,
  plasterWarm: 0xffe5bd,
  wood: 0xa94b2d,
  woodDark: 0x6d3022,
  woodLight: 0xd77b3e,
  red: 0xe8422f,
  redDeep: 0xb82d27,
  vermilion: 0xff5c3e,
  gold: 0xf7b72d,
  goldLight: 0xffdd72,
  jade: 0x2a9e83,
  jadeLight: 0x64d4ad,
  roof: 0x2d8e83,
  roofDark: 0x236f70,
  roofBlue: 0x2f7893,
  stone: 0xd7d2bd,
  stoneDark: 0x959b8f,
  road: 0xe6d3a6,
  grass: 0x76c65b,
  water: 0x25aeb2,
  blossom: 0xff91a7,
  willow: 0x65bf4c,
  lantern: 0xff5638,
  night: 0x101d3d,
};

const matCache = new Map();
function toon(color, opts = {}) {
  const key = 't' + color + JSON.stringify(opts);
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({
    color, roughness: 0.78, metalness: 0,
    ...opts,
  });
  matCache.set(key, m);
  return m;
}
let _grad = null;
function gradientMap() {
  if (_grad) return _grad;
  const data = new Uint8Array([90, 90, 90, 255, 150, 150, 150, 255, 220, 220, 220, 255, 255, 255, 255, 255]);
  _grad = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
  _grad.minFilter = THREE.NearestFilter;
  _grad.magFilter = THREE.NearestFilter;
  _grad.generateMipmaps = false;
  _grad.needsUpdate = true;
  return _grad;
}

const MAT = {
  plaster: toon(0xffffff),
  plasterWarm: toon(0xffffff),
  wood: toon(0xffffff),
  red: toon(0xffffff),
  stone: toon(0xffffff),
  roof: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.02, vertexColors: false }),
  roofGlazed: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.15 }),
  gold: new THREE.MeshStandardMaterial({ color: C.gold, roughness: 0.32, metalness: 0.62 }),
  dark: toon(0xffffff),
  leaf: toon(0xffffff),
  trunk: toon(0xffffff),
  blossom: toon(0xffffff),
  water: null,
  lantern: new THREE.MeshStandardMaterial({ color: 0xff6a4e, emissive: 0xff4a2e, emissiveIntensity: 0.25, roughness: 0.55 }),
  lanternGlow: new THREE.MeshBasicMaterial({ color: 0xffb46b, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }),
  window: new THREE.MeshStandardMaterial({ color: 0x5b4634, roughness: 0.8, emissive: 0xffb35f, emissiveIntensity: 0 }),
};

// ---------------------------------------------------------------- canvas textures
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
function noiseFill(ctx, w, h, base, amount = 10, count = 2600) {
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * amount / 255;
    ctx.fillStyle = `rgba(${Math.random() < 0.5 ? 255 : 20},${Math.random() < 0.5 ? 245 : 30},${Math.random() < 0.5 ? 220 : 40},${a})`;
    const s = 1 + Math.random() * 3;
    ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
  }
}

const TEX = {};
TEX.stone = makeTexture(512, 512, (ctx, w, h) => {
  noiseFill(ctx, w, h, '#c8d1c0', 9, 900);
  const sw = 86, sh = 52;
  for (let y = 0; y < h + sh; y += sh) {
    const off = (Math.floor(y / sh) % 2) * sw / 2;
    for (let x = -sw; x < w + sw; x += sw) {
      ctx.strokeStyle = 'rgba(82,102,92,0.25)'; ctx.lineWidth = 2;
      ctx.strokeRect(x + off, y, sw, sh);
      ctx.fillStyle = `rgba(${208 + Math.random() * 20},${218 + Math.random() * 22},${198 + Math.random() * 20},0.18)`;
      ctx.fillRect(x + off + 2, y + 2, sw - 4, sh - 4);
    }
  }
  for (let i = 0; i < 30; i++) {
    ctx.strokeStyle = 'rgba(74,104,96,0.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.lineTo(Math.random() * w, Math.random() * h); ctx.stroke();
  }
}, { repeat: [1, 1] });

TEX.roof = makeTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#b8d1c9'; ctx.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 16) {
    const g = ctx.createLinearGradient(x, 0, x + 16, 0);
      g.addColorStop(0, 'rgba(34,91,85,.34)');
    g.addColorStop(0.35, 'rgba(255,255,255,.22)');
    g.addColorStop(0.7, 'rgba(255,255,255,.04)');
      g.addColorStop(1, 'rgba(22,75,73,.42)');
    ctx.fillStyle = g; ctx.fillRect(x, 0, 16, h);
  }
  for (let y = 0; y < h; y += 22) {
    ctx.fillStyle = 'rgba(25,66,63,.3)'; ctx.fillRect(0, y, w, 3);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(0, y + 3, w, 2);
  }
}, { repeat: [4, 3] });

TEX.wood = makeTexture(256, 256, (ctx, w, h) => {
  noiseFill(ctx, w, h, '#c06b39', 14, 1200);
  for (let i = 0; i < 28; i++) {
    ctx.strokeStyle = `rgba(92,38,20,${0.05 + Math.random() * 0.09})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    const y = Math.random() * h;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(w * 0.3, y + Math.random() * 10, w * 0.6, y - Math.random() * 10, w, y + Math.random() * 4);
    ctx.stroke();
  }
}, { repeat: [1, 2] });

TEX.grass = makeTexture(512, 512, (ctx, w, h) => {
  noiseFill(ctx, w, h, '#7ec65d', 22, 3800);
  for (let i = 0; i < 160; i++) {
    ctx.strokeStyle = `rgba(${48 + Math.random() * 30},${118 + Math.random() * 42},${48 + Math.random() * 28},.3)`;
    ctx.lineWidth = 1; ctx.beginPath();
    const x = Math.random() * w, y = Math.random() * h;
    ctx.moveTo(x, y); ctx.lineTo(x + rand(-3, 3), y - rand(3, 8)); ctx.stroke();
  }
}, { repeat: [18, 18] });

TEX.dirt = makeTexture(512, 512, (ctx, w, h) => {
  noiseFill(ctx, w, h, '#dcc794', 14, 3200);
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = `rgba(120,96,60,${0.025 + Math.random() * 0.05})`;
    ctx.beginPath(); ctx.ellipse(Math.random() * w, Math.random() * h, rand(2, 12), rand(1, 5), rand(0, TAU), 0, TAU); ctx.fill();
  }
}, { repeat: [12, 12] });

TEX.lattice = makeTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#4b3527'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#e9d8b6';
  for (let x = 0; x < w; x += 32) ctx.fillRect(x, 0, 6, h);
  for (let y = 0; y < h; y += 32) ctx.fillRect(0, y, w, 6);
  for (let x = 16; x < w; x += 32) for (let y = 16; y < h; y += 32) {
    ctx.fillStyle = 'rgba(255,240,205,.45)'; ctx.fillRect(x - 2, y - 2, 10, 10);
  }
}, { repeat: [1, 1] });

TEX.bark = makeTexture(128, 256, (ctx, w, h) => {
  noiseFill(ctx, w, h, '#7e5a3c', 10, 400);
  for (let x = 0; x < w; x += 16) {
    ctx.strokeStyle = 'rgba(55,35,22,.28)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + rand(-6, 6), h); ctx.stroke();
  }
}, { repeat: [1, 2] });

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
    depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSegments: 2,
    steps: 1, bevelSize: r, bevelThickness: r, curveSegments: 3,
  });
  geo.center();
  return geo;
}

const UNIT_BOX = roundedBoxGeo(1, 1, 1, 0.09);
const UNIT_CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 10, 1, false);
const UNIT_SPHERE = new THREE.SphereGeometry(0.5, 12, 9);
const UNIT_CONE = new THREE.ConeGeometry(0.5, 1, 10, 1);
const UNIT_PLANE = new THREE.PlaneGeometry(1, 1);

/** 中式曲面屋顶：中间起脊，檐口微翘，四角上扬 */
function roofGeometry(segX = 12, segZ = 8, ridgeRatio = 0.52, lift = 0.14) {
  const pos = [], uv = [], idx = [];
  const half = 0.5;
  for (let iz = 0; iz <= segZ; iz++) {
    const z = -half + iz / segZ;
    for (let ix = 0; ix <= segX; ix++) {
      const x = -half + ix / segX;
      const tx = Math.max(0, (Math.abs(x) - ridgeRatio * half) / ((1 - ridgeRatio) * half));
      const tz = Math.abs(z) / half;
      const t = Math.max(tx, tz);
      let y = Math.pow(1 - Math.min(1, t), 0.62);
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
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
const ROOF_UNIT = roofGeometry(12, 8, 0.55, 0.15);
const ROOF_SMALL = roofGeometry(8, 6, 0.42, 0.19);

// ---------------------------------------------------------------- instancing
class Batch {
  constructor(geometry, material, opts = {}) {
    this.geometry = geometry;
    this.material = material;
    this.items = [];
    this.cast = opts.cast !== false;
    this.receive = opts.receive !== false;
  }
  add(x, y, z, sx, sy, sz, ry = 0, color = null, rx = 0, rz = 0) {
    this.items.push({ x, y, z, sx, sy, sz, ry, rx, rz, color });
    return this;
  }
  build(parent = scene) {
    if (!this.items.length) return null;
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, this.items.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
    const col = new THREE.Color();
    this.items.forEach((it, i) => {
      p.set(it.x, it.y, it.z); s.set(it.sx, it.sy, it.sz); e.set(it.rx, it.ry, it.rz); q.setFromEuler(e);
      m.compose(p, q, s); mesh.setMatrixAt(i, m);
      if (it.color != null) mesh.setColorAt(i, col.set(it.color));
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = this.cast;
    mesh.receiveShadow = this.receive;
    mesh.frustumCulled = false;
    mesh.instanceMatrix.needsUpdate = true;
    parent.add(mesh);
    return mesh;
  }
}

function quadBatch(material) {
  const pos = [], uvs = [], idx = [];
  let count = 0;
  return {
    add(w, h, matrix, u0 = 0, v0 = 0, u1 = 1, v1 = 1) {
      const corners = [
        [-w / 2, -h / 2, 0], [w / 2, -h / 2, 0], [w / 2, h / 2, 0], [-w / 2, h / 2, 0],
      ];
      const v = new THREE.Vector3();
      corners.forEach((c, i) => {
        v.set(c[0], c[1], c[2]).applyMatrix4(matrix);
        pos.push(v.x, v.y, v.z);
        uvs.push(i === 0 ? u0 : i === 1 ? u1 : i === 2 ? u1 : u0, i < 2 ? v0 : v1);
      });
      const b = count * 4;
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
      count++;
      return this;
    },
    build() {
      if (!count) return null;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      g.setIndex(idx);
      g.computeVertexNormals();
      const mesh = new THREE.Mesh(g, material);
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    },
  };
}

// ---------------------------------------------------------------- city data
const CITY = { x0: -450, x1: 450, z0: -380, z1: 380 };
const WORLD = { x0: -780, x1: 780, z0: -660, z1: 660 };
const AVENUE = 26;
const WARD_W = 70, WARD_D = 54, STREET = 14, ROW_STREET = 12;
const COLS = [-384, -300, -216, -132, -48, 48, 132, 216, 300, 384];
const ROWS = [-179, -113, -47, 19, 85, 151, 217, 283, 349];

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

const wards = [];
const roads = [];
const landmarks = [];
const colliders = [];
const marketDefs = [];

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
  return isWestMarket(col, row) || isEastMarket(col, row) || isXingqing(col, row) || isQujiang(col, row) || isPagoda(col, row);
}

let li = 0, ri = 0;
for (let row = 0; row < 9; row++) for (let col = 0; col < 10; col++) {
  if (isSpecial(col, row)) continue;
  const name = col < 5 ? WARD_NAMES_LEFT[li++ % WARD_NAMES_LEFT.length] : WARD_NAMES_RIGHT[ri++ % WARD_NAMES_RIGHT.length];
  addWardRecord(col, row, name);
}

// 主要道路
roads.push({ x: 0, z: 0, w: AVENUE, d: 780, axis: 'z', type: 'avenue', name: '朱雀大街' });
roads.push({ x: 0, z: -150, w: 900, d: 18, axis: 'x', type: 'avenue', name: '春明门大街' });
roads.push({ x: 0, z: 55, w: 900, d: 16, axis: 'x', type: 'avenue', name: '金光门大街' });
roads.push({ x: 0, z: 232, w: 900, d: 16, axis: 'x', type: 'avenue', name: '延兴门大街' });
for (const x of [-342, -258, -174, -90, 90, 174, 258, 342]) roads.push({ x, z: 0, w: 14, d: 780, axis: 'z', type: 'street' });
for (const z of [-206, -140, -74, -8, 58, 124, 190, 256, 322]) roads.push({ x: 0, z, w: 900, d: 12, axis: 'x', type: 'street' });

// ---------------------------------------------------------------- sky
const skyUniforms = {
  topColor: { value: new THREE.Color(0x2eb7ed) },
  horizonColor: { value: new THREE.Color(0xffe1a3) },
  sunColor: { value: new THREE.Color(0xffc95e) },
  sunDir: { value: new THREE.Vector3(0.45, 0.55, 0.7).normalize() },
  night: { value: 0 },
};
const skyMat = new THREE.ShaderMaterial({
  uniforms: skyUniforms,
  side: THREE.BackSide,
  depthWrite: false,
  vertexShader: `
    varying vec3 vDir;
    void main() {
      vDir = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `
    uniform vec3 topColor; uniform vec3 horizonColor; uniform vec3 sunColor; uniform vec3 sunDir; uniform float night;
    varying vec3 vDir;
    void main() {
      float h = clamp(vDir.y, 0.0, 1.0);
      vec3 col = mix(horizonColor, topColor, pow(h, 0.52));
      float sd = max(dot(normalize(vDir), normalize(sunDir)), 0.0);
      col += sunColor * pow(sd, 900.0) * 1.6;
      col += sunColor * pow(sd, 14.0) * 0.22;
      float horizon = smoothstep(0.14, -0.02, vDir.y);
      col = mix(col, horizonColor * 1.02, horizon * 0.55);
      gl_FragColor = vec4(col, 1.0);
    }`,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 20), skyMat);
sky.frustumCulled = false;
scene.add(sky);

// 星星
const starGeo = new THREE.BufferGeometry();
{
  const p = [];
  for (let i = 0; i < 700; i++) {
    const a = Math.random() * TAU, e = Math.random() * Math.PI * 0.46 + 0.05;
    const r = 820;
    p.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
}
const starMat = new THREE.PointsMaterial({ color: 0xfff3cf, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const stars = new THREE.Points(starGeo, starMat);
stars.frustumCulled = false;
scene.add(stars);

// 云
const cloudBatch = new Batch(UNIT_SPHERE, new THREE.MeshBasicMaterial({ color: 0xfffaf0, transparent: true, opacity: 0.82, depthWrite: false }), { cast: false, receive: false });
for (let i = 0; i < 11; i++) {
  const a = rr(0, TAU), r = rr(380, 700), y = rr(95, 155);
  const cx = Math.cos(a) * r, cz = Math.sin(a) * r;
  const n = 4 + Math.floor(rr(0, 4));
  for (let j = 0; j < n; j++) {
    const s = rr(18, 42);
    cloudBatch.add(cx + rr(-45, 45), y + rr(-8, 8), cz + rr(-22, 22), s * 1.6, s * 0.62, s, 0, null);
  }
}
const cloudMesh = cloudBatch.build();

// 远山
const hillBatch = new Batch(new THREE.ConeGeometry(1, 1, 7, 1), toon(0x8fb7a6), { cast: false, receive: false });
for (let i = 0; i < 34; i++) {
  const a = (i / 34) * TAU + rr(-0.03, 0.03), r = rr(600, 760);
  hillBatch.add(Math.cos(a) * r, rr(4, 18), Math.sin(a) * r, rr(55, 130), rr(50, 120), rr(55, 130), rr(0, TAU), null);
}
hillBatch.build();

// ---------------------------------------------------------------- ground & roads
function buildGround() {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(1700, 1500, 1, 1), new THREE.MeshStandardMaterial({ map: TEX.grass, roughness: 1 }));
  g.rotation.x = -Math.PI / 2; g.position.y = -0.25; g.receiveShadow = true;
  scene.add(g);

  // 城外田畴
  const fieldBatch = new Batch(UNIT_BOX, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }), { cast: false });
  const fieldColors = [0xa8dc6a, 0xf0d45b, 0x79c74f, 0xffe58b, 0x93d565];
  for (let i = 0; i < 70; i++) {
    let x, z;
    do { x = rr(-740, 740); z = rr(-620, 620); } while (x > -500 && x < 500 && z > -540 && z < 430);
    fieldBatch.add(x, -0.18, z, rr(30, 80), 0.16, rr(20, 65), rr(-0.1, 0.1), pick(fieldColors));
  }
  fieldBatch.build();

  // 城内地面
  const cityGround = new THREE.Mesh(new THREE.PlaneGeometry(920, 790), new THREE.MeshStandardMaterial({ map: TEX.grass, roughness: 1, color: 0xc9e2a4 }));
  cityGround.rotation.x = -Math.PI / 2; cityGround.position.set(0, -0.05, 0); cityGround.receiveShadow = true;
  scene.add(cityGround);
}

function makeRoadMesh(road) {
  const isAvenue = road.type === 'avenue';
  const w = isAvenue ? road.w : road.w;
  const d = road.d;
  const sw = isAvenue ? 20 : 8, sd = Math.max(2, Math.floor(d / 12));
  const geo = new THREE.PlaneGeometry(w, d, sw, sd);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, 0.055 * (1 - Math.pow(x / (w / 2), 2)));
  }
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 13, uv.getY(i) * d / 13);
  const mat = new THREE.MeshStandardMaterial({
    map: isAvenue ? TEX.stone : TEX.dirt,
    color: isAvenue ? 0xf6efdb : 0xe9d9b4,
    roughness: 1, metalness: 0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.position.set(road.x, 0.015, road.z);
  scene.add(mesh);
  return mesh;
}

function buildRoads() {
  roads.forEach(makeRoadMesh);
  // 朱雀大街中央御道
  const central = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 780), new THREE.MeshStandardMaterial({ color: 0xffdd91, roughness: 0.86 }));
  central.rotation.x = -Math.PI / 2; central.position.set(0, 0.075, 0); central.receiveShadow = true;
  scene.add(central);
  // 御道金线，让中轴在远处也有清楚的视觉引导
  const lane = new Batch(UNIT_BOX, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.05 }), { cast: false });
  lane.add(-3.55, 0.09, 0, 0.18, 0.03, 780, 0, 0xeec151);
  lane.add(3.55, 0.09, 0, 0.18, 0.03, 780, 0, 0xeec151);
  lane.build();
  // 御道上的金色团花，让近景路面不再单调
  const motif = new Batch(new THREE.CircleGeometry(1.0, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.34, depthWrite: false }), { cast: false, receive: false });
  for (let z = -360; z <= 360; z += 19) motif.add(0, 0.092, z, 1.25, 1.25, 1.25, 0, 0xd99c36, -Math.PI / 2);
  motif.build();

  // 路缘石
  const curb = new Batch(UNIT_BOX, MAT.stone, { cast: false });
  for (const item of [
    [-14.2, 0, 0, 0.45, 0.22, 780], [14.2, 0, 0, 0.45, 0.22, 780],
  ]) curb.add(item[0], 0.06, item[2], item[3], item[4], item[5], 0, 0xd8cdb5);
  for (const z of [-150, 55, 232]) {
    curb.add(0, 0.06, z - 8.6, 900, 0.22, 0.45, 0, 0xd8cdb5);
    curb.add(0, 0.06, z + 8.6, 900, 0.22, 0.45, 0, 0xd8cdb5);
  }
  curb.build();
}

// ---------------------------------------------------------------- collision hash
const colliderGrid = new Map();
const CELL = 24;
function buildColliderHash() {
  colliderGrid.clear();
  for (const c of colliders) {
    const minCx = Math.floor(c.minX / CELL), maxCx = Math.floor(c.maxX / CELL);
    const minCz = Math.floor(c.minZ / CELL), maxCz = Math.floor(c.maxZ / CELL);
    for (let cx = minCx; cx <= maxCx; cx++) for (let cz = minCz; cz <= maxCz; cz++) {
      const k = cx + ',' + cz;
      let arr = colliderGrid.get(k);
      if (!arr) colliderGrid.set(k, arr = []);
      arr.push(c);
    }
  }
}
function resolveCollisions(pos, radius = 1.15) {
  const cx = Math.floor(pos.x / CELL), cz = Math.floor(pos.z / CELL);
  let hit = false;
  for (let ix = cx - 1; ix <= cx + 1; ix++) for (let iz = cz - 1; iz <= cz + 1; iz++) {
    const arr = colliderGrid.get(ix + ',' + iz);
    if (!arr) continue;
    for (const c of arr) {
      const nx = clamp(pos.x, c.minX, c.maxX), nz = clamp(pos.z, c.minZ, c.maxZ);
      let dx = pos.x - nx, dz = pos.z - nz;
      const d2 = dx * dx + dz * dz;
      if (d2 < radius * radius) {
        hit = true;
        if (d2 > 1e-6) {
          const d = Math.sqrt(d2), push = radius - d;
          pos.x += (dx / d) * push; pos.z += (dz / d) * push;
        } else {
          const l = pos.x - c.minX, r = c.maxX - pos.x, t = pos.z - c.minZ, b = c.maxZ - pos.z;
          const m = Math.min(l, r, t, b);
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

// 世界边界
addCollider(WORLD.x0 - 2, WORLD.x0, WORLD.z0, WORLD.z1, 'world');
addCollider(WORLD.x1, WORLD.x1 + 2, WORLD.z0, WORLD.z1, 'world');
addCollider(WORLD.x0, WORLD.x1, WORLD.z0 - 2, WORLD.z0, 'world');
addCollider(WORLD.x0, WORLD.x1, WORLD.z1, WORLD.z1 + 2, 'world');
