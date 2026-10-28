/* ============================================================
   龙游长安 · 核心场景 / 工具 / 材质 / 城市数据
   v10: 真正的PBR材质升级 — 粗糙度贴图、更精细纹理、环境光遮蔽
   v9: 精修PBR材质和纹理质量 — 增加更精细的法线和粗糙度贴图
   v8: 真实长安城比例 — 地图扩大到约12×11公里，匹配唐长安84平方公里规模
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
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0xa9cbd7, 1);
const MAX_DPR = isTouch ? 1.75 : 2.0;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));

// v8: 扩大场景范围 — 匹配真实长安城比例
const scene = new THREE.Scene();
// v8: 雾效从145-690扩大到200-1200，适配更大地图
scene.fog = new THREE.Fog(0xc9d7d5, 200, 1200);
// v8: 相机远裁剪面从1800扩大到3000
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 3000);
camera.position.set(16, 7, -110);

// ---------------------------------------------------------------- lights
// v10: 优化光照系统 — 更自然的光照层次
const hemi = new THREE.HemisphereLight(0xfff3d8, 0x4f8f78, 0.7);
scene.add(hemi);
const ambient = new THREE.AmbientLight(0xfff4e2, 0.18);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffe6bd, 2.0);
sun.position.set(180, 150, 110);
sun.castShadow = true;
const SHADOW_SIZE = isTouch ? 2048 : 2048;
sun.shadow.mapSize.set(SHADOW_SIZE, SHADOW_SIZE);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 600;
// v8: 阴影相机范围从±95扩大到±200，适配更大地图
sun.shadow.camera.left = -200;
sun.shadow.camera.right = 200;
sun.shadow.camera.top = 200;
sun.shadow.camera.bottom = -200;
sun.shadow.bias = -0.0008;
sun.shadow.normalBias = 0.06;
scene.add(sun);
scene.add(sun.target);
const rim = new THREE.DirectionalLight(0xffb98f, 0.35);
rim.position.set(-150, 90, -190);
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

// v9: 生成法线贴图的辅助函数
function makeNormalMap(w, h, heightFn) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const hL = heightFn((x - 1 + w) % w, y);
      const hR = heightFn((x + 1) % w, y);
      const hD = heightFn(x, (y - 1 + h) % h);
      const hU = heightFn(x, (y + 1) % h);
      const dx = (hR - hL) * 2;
      const dy = (hU - hD) * 2;
      const len = Math.sqrt(dx * dx + dy * dy + 1);
      const nx = -dx / len;
      const ny = -dy / len;
      const nz = 1 / len;
      const i = (y * w + x) * 4;
      img.data[i] = (nx * 0.5 + 0.5) * 255;
      img.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      img.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

// v10: 生成粗糙度贴图的辅助函数
function makeRoughnessMap(w, h, roughnessFn) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const r = clamp(roughnessFn(x, y), 0, 1);
      const v = r * 255;
      const i = (y * w + x) * 4;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

const TEX = {};

// v10: 提升灰泥纹理精细度
TEX.plaster = makeTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  // 更细腻的颗粒
  for (let i = 0; i < 2000; i++) {
    const a = Math.random() * 0.06;
    ctx.fillStyle = `rgba(180,170,150,${a})`;
    const s = 0.5 + Math.random() * 1.5;
    ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
  }
  // 更自然的水渍和斑驳
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(160,150,130,${0.03 + Math.random() * 0.04})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, rand(8, 30), rand(4, 15), rand(0, TAU), 0, TAU);
    ctx.fill();
  }
  // 更真实的裂纹
  for (let i = 0; i < 12; i++) {
    ctx.strokeStyle = `rgba(140,130,110,${0.04 + Math.random() * 0.03})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    let x = Math.random() * w, y = Math.random() * h;
    ctx.moveTo(x, y);
    for (let j = 0; j < 6; j++) { x += rand(-15, 15); y += rand(-10, 10); ctx.lineTo(x, y); }
    ctx.stroke();
  }
  // 水平方向的粉刷痕迹
  for (let i = 0; i < 20; i++) {
    ctx.strokeStyle = `rgba(200,195,180,${0.02 + Math.random() * 0.02})`;
    ctx.lineWidth = 2 + Math.random() * 3;
    ctx.beginPath();
    const y = Math.random() * h;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + rand(-5, 5));
    ctx.stroke();
  }
}, { repeat: [2, 2] });

// v9: 灰泥法线贴图
TEX.plasterNormal = makeNormalMap(256, 256, (x, y) => {
  return Math.sin(x * 0.08) * 0.08 + Math.sin(y * 0.1) * 0.08 + Math.random() * 0.04;
});

// v10: 灰泥粗糙度贴图 — 边缘更粗糙，中间更光滑
TEX.plasterRoughness = makeRoughnessMap(256, 256, (x, y) => {
  const edge = Math.min(x, 512-x, y, 512-y);
  const edgeFactor = edge < 20 ? (20-edge)/20 * 0.2 : 0;
  return 0.75 + Math.random() * 0.1 + edgeFactor;
});

// v10: 提升木头纹理精细度
TEX.wood = makeTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  // 更自然的木纹曲线
  for (let i = 0; i < 60; i++) {
    ctx.strokeStyle = `rgba(100,80,60,${0.04 + Math.random() * 0.06})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.2;
    ctx.beginPath();
    const y = Math.random() * h;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(w*0.25, y+rand(-8,8), w*0.5, y+rand(-12,12), w, y+rand(-5,5));
    ctx.stroke();
  }
  // 木节
  for (let i = 0; i < 8; i++) {
    const cx = Math.random() * w, cy = Math.random() * h;
    const r = 5 + Math.random() * 10;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(80,60,40,0.15)');
    grad.addColorStop(0.5, 'rgba(100,80,60,0.08)');
    grad.addColorStop(1, 'rgba(100,80,60,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
  }
  // 更细腻的颗粒
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = `rgba(120,100,80,${Math.random() * 0.04})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
  }
}, { repeat: [1, 2] });

// v9: 木头法线贴图
TEX.woodNormal = makeNormalMap(256, 256, (x, y) => {
  return Math.sin(y * 0.12) * 0.15 + Math.random() * 0.02;
});

// v10: 木头粗糙度贴图 — 不同位置粗糙度不同
TEX.woodRoughness = makeRoughnessMap(256, 256, (x, y) => {
  return 0.5 + Math.sin(y * 0.1) * 0.1 + Math.random() * 0.1;
});

// v10: 提升石头纹理精细度
TEX.stone = makeTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  const sw = 64, sh = 48;
  // 更自然的砖块排列
  for (let y = 0; y < h + sh; y += sh) {
    const off = (Math.floor(y / sh) % 2) * sw / 2;
    for (let x = -sw; x < w + sw; x += sw) {
      // 砖块主体
      ctx.fillStyle = `rgba(220,215,200,${0.05 + Math.random() * 0.05})`;
      ctx.fillRect(x + off + 2, y + 2, sw - 4, sh - 4);
      // 砖块接缝
      ctx.strokeStyle = 'rgba(100,100,100,0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + off, y, sw, sh);
      // 砖块表面的自然变化
      ctx.fillStyle = `rgba(180,175,160,${Math.random() * 0.04})`;
      ctx.fillRect(x + off + 4, y + 4, sw - 8, sh - 8);
    }
  }
  // 更自然的风化痕迹
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = `rgba(160,155,140,${0.03 + Math.random() * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, rand(10, 35), rand(5, 18), rand(0, TAU), 0, TAU);
    ctx.fill();
  }
  // 细小的裂纹
  for (let i = 0; i < 10; i++) {
    ctx.strokeStyle = `rgba(120,115,100,${0.04 + Math.random() * 0.03})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    let x = Math.random() * w, y = Math.random() * h;
    ctx.moveTo(x, y);
    for (let j = 0; j < 3; j++) { x += rand(-8, 8); y += rand(-6, 6); ctx.lineTo(x, y); }
    ctx.stroke();
  }
}, { repeat: [1, 1] });

// v9: 石头法线贴图
TEX.stoneNormal = makeNormalMap(256, 256, (x, y) => {
  const sw = 64, sh = 48;
  const gx = Math.floor(x / sw), gy = Math.floor(y / sh);
  const off = (gy % 2) * sw / 2;
  const lx = (x - off) % sw;
  const ly = y % sh;
  const edge = Math.min(lx, sw - lx, ly, sh - ly);
  return edge < 2 ? -0.4 : 0.08 + Math.random() * 0.08;
});

// v10: 石头粗糙度贴图 — 接缝处更粗糙
TEX.stoneRoughness = makeRoughnessMap(256, 256, (x, y) => {
  const sw = 64, sh = 48;
  const gx = Math.floor(x / sw), gy = Math.floor(y / sh);
  const off = (gy % 2) * sw / 2;
  const lx = (x - off) % sw;
  const ly = y % sh;
  const edge = Math.min(lx, sw - lx, ly, sh - ly);
  const edgeFactor = edge < 3 ? (3-edge)/3 * 0.15 : 0;
  return 0.8 + Math.random() * 0.08 + edgeFactor;
});

// v10: 提升屋顶纹理精细度
TEX.roof = makeTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  // 更精细的瓦垄
  for (let x = 0; x < w; x += 16) {
    const g = ctx.createLinearGradient(x, 0, x + 16, 0);
    g.addColorStop(0, 'rgba(100,100,100,0.3)');
    g.addColorStop(0.3, 'rgba(255,255,255,0.25)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.1)');
    g.addColorStop(1, 'rgba(80,80,80,0.35)');
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, 16, h);
  }
  // 更自然的瓦当接缝
  for (let y = 0; y < h; y += 32) {
    ctx.fillStyle = 'rgba(60,60,60,0.3)';
    ctx.fillRect(0, y, w, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(0, y + 2, w, 1);
  }
  // 屋顶表面的自然变化
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(120,120,120,${Math.random() * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, rand(10, 30), rand(5, 15), rand(0, TAU), 0, TAU);
    ctx.fill();
  }
}, { repeat: [4, 3] });

// v9: 屋顶法线贴图
TEX.roofNormal = makeNormalMap(256, 256, (x, y) => {
  const tx = (x % 16) - 8;
  const ty = (y % 32) - 16;
  return Math.cos(tx * 0.4) * 0.25 + Math.cos(ty * 0.2) * 0.08;
});

// v10: 屋顶粗糙度贴图 — 光滑的瓦面，接缝处更粗糙
TEX.roofRoughness = makeRoughnessMap(256, 256, (x, y) => {
  const tx = (x % 16) - 8;
  const ty = (y % 32) - 16;
  const edgeX = Math.abs(tx) > 7 ? 0.1 : 0;
  const edgeY = Math.abs(ty) > 14 ? 0.1 : 0;
  return 0.65 + Math.random() * 0.1 + edgeX + edgeY;
});

TEX.bark = makeTexture(128, 256, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 10) {
    ctx.strokeStyle = `rgba(100,80,60,${0.18 + Math.random() * 0.12})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + rand(-5, 5), h);
    ctx.stroke();
  }
}, { repeat: [1, 2] });

TEX.lattice = makeTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#4b3527'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#e9d8b6';
  for (let x = 0; x < w; x += 32) ctx.fillRect(x, 0, 6, h);
  for (let y = 0; y < h; y += 32) ctx.fillRect(0, y, w, 6);
  for (let x = 16; x < w; x += 32) for (let y = 16; y < h; y += 32) {
    ctx.fillStyle = 'rgba(255,240,205,.5)';
    ctx.fillRect(x - 2, y - 2, 10, 10);
  }
}, { repeat: [1, 1] });

TEX.grass = makeTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 2500; i++) {
    ctx.fillStyle = `rgba(100,140,80,${Math.random() * 0.1})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
  for (let i = 0; i < 200; i++) {
    ctx.strokeStyle = `rgba(80,120,60,.15)`;
    ctx.lineWidth = 1; ctx.beginPath();
    const x = Math.random() * w, y = Math.random() * h;
    ctx.moveTo(x, y); ctx.lineTo(x + rand(-3, 3), y - rand(3, 6)); ctx.stroke();
  }
}, { repeat: [30, 30] });

TEX.dirt = makeTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 2500; i++) {
    ctx.fillStyle = `rgba(160,140,100,${Math.random() * 0.08})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = `rgba(140,120,80,${0.03 + Math.random() * 0.04})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, rand(3, 10), rand(1, 4), rand(0, TAU), 0, TAU);
    ctx.fill();
  }
}, { repeat: [20, 20] });

// ---------------------------------------------------------------- MAT materials
// v10: 真正的PBR材质升级 — 粗糙度贴图、更精细法线、环境光遮蔽
const MAT = {
  plaster: new THREE.MeshStandardMaterial({ 
    map: TEX.plaster, 
    normalMap: TEX.plasterNormal, 
    normalScale: new THREE.Vector2(0.25, 0.25),
    roughnessMap: TEX.plasterRoughness,
    color: 0xffffff, 
    roughness: 1.0, 
    metalness: 0.02 
  }),
  plasterWarm: new THREE.MeshStandardMaterial({ 
    map: TEX.plaster, 
    normalMap: TEX.plasterNormal, 
    normalScale: new THREE.Vector2(0.25, 0.25),
    roughnessMap: TEX.plasterRoughness,
    color: 0xfff5e0, 
    roughness: 1.0, 
    metalness: 0.02 
  }),
  wood: new THREE.MeshStandardMaterial({ 
    map: TEX.wood, 
    normalMap: TEX.woodNormal, 
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughnessMap: TEX.woodRoughness,
    color: 0xffffff, 
    roughness: 1.0, 
    metalness: 0.08 
  }),
  red: new THREE.MeshStandardMaterial({ 
    map: TEX.wood, 
    normalMap: TEX.woodNormal, 
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughnessMap: TEX.woodRoughness,
    color: 0xffffff, 
    roughness: 0.9, 
    metalness: 0.12 
  }),
  stone: new THREE.MeshStandardMaterial({ 
    map: TEX.stone, 
    normalMap: TEX.stoneNormal, 
    normalScale: new THREE.Vector2(0.45, 0.45),
    roughnessMap: TEX.stoneRoughness,
    color: 0xffffff, 
    roughness: 1.0, 
    metalness: 0.03 
  }),
  roof: new THREE.MeshStandardMaterial({ 
    map: TEX.roof, 
    normalMap: TEX.roofNormal, 
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughnessMap: TEX.roofRoughness,
    color: 0xffffff, 
    roughness: 1.0, 
    metalness: 0.06 
  }),
  roofGlazed: new THREE.MeshStandardMaterial({ 
    map: TEX.roof, 
    normalMap: TEX.roofNormal, 
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughnessMap: TEX.roofRoughness,
    color: 0xe8f0ff, 
    roughness: 0.4, 
    metalness: 0.3 
  }),
  gold: new THREE.MeshStandardMaterial({ color: C.gold, roughness: 0.28, metalness: 0.8 }),
  dark: new THREE.MeshStandardMaterial({ 
    map: TEX.wood, 
    normalMap: TEX.woodNormal, 
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughnessMap: TEX.woodRoughness,
    color: 0x999999, 
    roughness: 1.0, 
    metalness: 0.02 
  }),
  leaf: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0 }),
  trunk: new THREE.MeshStandardMaterial({ map: TEX.bark, color: 0xffffff, roughness: 0.9, metalness: 0 }),
  blossom: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0 }),
  water: null,
  lantern: new THREE.MeshStandardMaterial({ color: 0xff6a4e, emissive: 0xff4a2e, emissiveIntensity: 0.4, roughness: 0.5 }),
  lanternGlow: new THREE.MeshBasicMaterial({ color: 0xffb46b, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }),
  window: new THREE.MeshStandardMaterial({ map: TEX.lattice, color: 0xffffff, roughness: 0.75, emissive: 0xffb35f, emissiveIntensity: 0 }),
};

// ---------------------------------------------------------------- geometry helpers
function roundedBoxGeo(w, h, d, r = 0.08) {
  const shape = new THREE.Shape();
  const x = -w/2+r, y = -h/2+r, ww = w-2*r, hh = h-2*r;
  shape.moveTo(x, -h/2);
  shape.lineTo(x+ww, -h/2);
  shape.quadraticCurveTo(w/2, -h/2, w/2, -h/2+r);
  shape.lineTo(w/2, h/2-r);
  shape.quadraticCurveTo(w/2, h/2, w/2-r, h/2);
  shape.lineTo(-w/2+r, h/2);
  shape.quadraticCurveTo(-w/2, h/2, -w/2, h/2-r);
  shape.lineTo(-w/2, -h/2+r);
  shape.quadraticCurveTo(-w/2, -h/2, -w/2+r, -h/2);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, d-2*r), bevelEnabled: true, bevelSegments: 1,
    steps: 1, bevelSize: r, bevelThickness: r, curveSegments: 2,
  });
  geo.center();
  geo.computeBoundingBox();
  const size = geo.boundingBox.getSize(new THREE.Vector3());
  geo.scale(w/size.x, h/size.y, d/size.z);
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
    const z = -half + iz/segZ;
    for (let ix = 0; ix <= segX; ix++) {
      const x = -half + ix/segX;
      const tx = Math.max(0, (Math.abs(x)-ridgeRatio*half)/((1-ridgeRatio)*half));
      const tz = Math.abs(z)/half;
      const t = Math.max(tx, tz);
      let y = Math.pow(1-Math.min(1,t), 1.12);
      y += lift * Math.pow(t, 4);
      y += lift * 1.7 * Math.pow(tx, 3) * Math.pow(tz, 4);
      pos.push(x, y, z);
      uv.push(ix/segX, iz/segZ);
    }
  }
  for (let iz = 0; iz < segZ; iz++) for (let ix = 0; ix < segX; ix++) {
    const a = iz*(segX+1)+ix, b = a+1, c = a+segX+1, d = c+1;
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
      const key = Math.floor(item.x/this.cellSize) + ',' + Math.floor(item.z/this.cellSize);
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
// v8: 真实长安城比例 — 约12.4×11公里，匹配唐长安84平方公里规模
// 1单位 ≈ 10米，东西1240单位，南北1100单位
const CITY = { x0: -620, x1: 620, z0: -550, z1: 550 };
const WORLD = { x0: -900, x1: 900, z0: -800, z1: 800 };
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
// v8: 扩大坊里尺寸，匹配更大地图
const WARD_W = 100, WARD_D = 80, STREET = 18, ROW_STREET = 14;
// v8: 扩大坊列行坐标，从10列9行扩展到14列12行
const COLS = [-540,-460,-380,-300,-220,-140,-60,60,140,220,300,380,460,540];
const ROWS = [-440,-360,-280,-200,-120,-40,40,120,200,280,360,440];

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

function isWestMarket(col, row) { return col >= 4 && col <= 5 && row >= 5 && row <= 6; }
function isEastMarket(col, row) { return col >= 8 && col <= 9 && row >= 5 && row <= 6; }
function isXingqing(col, row) { return col >= 10 && col <= 11 && row >= 1 && row <= 2; }
function isQujiang(col, row) { return col >= 11 && row >= 9; }
function isPagoda(col, row) { return (col === 9 && row === 9) || (col === 4 && row === 10); }
function isSpecial(col, row) {
  return isWestMarket(col,row)||isEastMarket(col,row)||isXingqing(col,row)||isQujiang(col,row)||isPagoda(col,row);
}

let li = 0, ri = 0;
for (let row = 0; row < 12; row++) for (let col = 0; col < 14; col++) {
  if (isSpecial(col, row)) continue;
  const name = col < 7 ? WARD_NAMES_LEFT[li++ % WARD_NAMES_LEFT.length] : WARD_NAMES_RIGHT[ri++ % WARD_NAMES_RIGHT.length];
  addWardRecord(col, row, name);
}

// v8: 扩大道路范围，匹配更大地图
roads.push({ x: 0, z: 0, w: AVENUE, d: 1100, axis: 'z', type: 'avenue', name: '朱雀大街' });
roads.push({ x: 0, z: -220, w: 1240, d: 24, axis: 'x', type: 'avenue', name: '春明门大街' });
roads.push({ x: 0, z: 80, w: 1240, d: 20, axis: 'x', type: 'avenue', name: '金光门大街' });
roads.push({ x: 0, z: 340, w: 1240, d: 20, axis: 'x', type: 'avenue', name: '延兴门大街' });
for (const x of [-480,-400,-320,-240,-160,-80,80,160,240,320,400,480]) roads.push({ x, z: 0, w: 18, d: 1100, axis: 'z', type: 'street' });
for (const z of [-400,-320,-240,-160,-80,0,80,160,240,320,400]) roads.push({ x: 0, z, w: 1240, d: 14, axis: 'x', type: 'street' });

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
  sunDir: { value: new THREE.Vector3(180, 150, 110).normalize() },
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
// v8: 天空球从900扩大到1500，适配更大地图
const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 20), skyMat);
sky.frustumCulled = false; scene.add(sky);

const starGeo = new THREE.BufferGeometry();
{
  const p = [];
  for (let i = 0; i < 700; i++) {
    const a = Math.random() * TAU, e = Math.random() * Math.PI * 0.46 + 0.05, r = 1300;
    p.push(Math.cos(a)*Math.cos(e)*r, Math.sin(e)*r, Math.sin(a)*Math.cos(e)*r);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
}
const starMat = new THREE.PointsMaterial({ color: 0xfff3cf, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const stars = new THREE.Points(starGeo, starMat); stars.frustumCulled = false; scene.add(stars);

// v8: 远景山从1180扩大到1600
for (let layer = 0; layer < 2; layer++) {
  const vertices = [], indices = [], segments = 192, radius = 1600 + layer * 380;
  for (let i = 0; i <= segments; i++) {
    const a = i / segments * TAU;
    const h = 120 + layer * 50 + Math.sin(a*5+0.8)*45 + Math.sin(a*11-0.4)*25 + Math.sin(a*3)*35;
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
  // v8: 地面从1700×1500扩大到2600×2300
  const g = new THREE.Mesh(new THREE.PlaneGeometry(2600, 2300, 1, 1), new THREE.MeshStandardMaterial({ map: TEX.grass, roughness: 1 }));
  g.rotation.x = -Math.PI/2; g.position.y = -0.25; g.receiveShadow = true; scene.add(g);
  const fieldBatch = new Batch(UNIT_BOX, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }), { cast: false });
  const fieldColors = [0x9cab63, 0xc6b775, 0x7d9358, 0xc5bd7d, 0xa1ae6b];
  for (let i = 0; i < 120; i++) {
    let x, z; do { x = rr(-850,850); z = rr(-750,750); } while (x > -650 && x < 650 && z > -600 && z < 600);
    fieldBatch.add(x, -0.18, z, rr(40,100), 0.16, rr(30,80), rr(-0.1,0.1), pick(fieldColors));
  }
  fieldBatch.build();
  // v8: 城市地面从920×790扩大到1240×1100
  const cityGround = new THREE.Mesh(new THREE.PlaneGeometry(1240, 1100), new THREE.MeshStandardMaterial({ map: TEX.dirt, roughness: 1, color: 0xd9ccb2 }));
  cityGround.rotation.x = -Math.PI/2; cityGround.position.set(0, -0.05, 0); cityGround.receiveShadow = true; scene.add(cityGround);
  const gardenMaterial = new THREE.MeshStandardMaterial({ map: TEX.grass, roughness: 1, color: 0xc6cfac });
  for (const [x,z,rx,rz] of [[480,440,130,110],[460,-200,100,75],[310,-660,60,35]]) {
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
  // v8: 朱雀大街从7.6×780扩大到10×1100
  const centralGeo = new THREE.PlaneGeometry(10, 1100);
  const centralUV = centralGeo.attributes.uv;
  for (let i = 0; i < centralUV.count; i++) centralUV.setXY(i, centralUV.getX(i)*3.3, centralUV.getY(i)*367);
  const central = new THREE.Mesh(centralGeo, SurfaceLibrary.paving(0xe6dfcc));
  central.rotation.x = -Math.PI/2; central.position.set(0, 0.075, 0); central.receiveShadow = true; scene.add(central);
  const lane = new Batch(UNIT_BOX, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.05 }), { cast: false });
  lane.add(-4.55, 0.09, 0, 0.15, 0.03, 1100, 0, 0xbbab87);
  lane.add(4.55, 0.09, 0, 0.15, 0.03, 1100, 0, 0xbbab87);
  lane.build();
  const motif = new Batch(new THREE.CircleGeometry(1.0,16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.34, depthWrite: false }), { cast: false, receive: false });
  for (let z = -520; z <= 520; z += 50) motif.add(0, 0.092, z, 1.0, 1.0, 1.0, 0, 0xa99473, -Math.PI/2);
  motif.build();
  const curb = new Batch(UNIT_BOX, MAT.stone, { cast: false });
  for (const item of [[-17.2,0,0,0.55,0.28,1100],[17.2,0,0,0.55,0.28,1100]]) curb.add(item[0],0.06,item[2],item[3],item[4],item[5],0,0xd8cdb5);
  for (const z of [-220,80,340]) {
    curb.add(0, 0.06, z-11.6, 1240, 0.28, 0.55, 0, 0xd8cdb5);
    curb.add(0, 0.06, z+11.6, 1240, 0.28, 0.55, 0, 0xd8cdb5);
  }
  curb.build();
}

// ---------------------------------------------------------------- collision hash
const colliderGrid = new Map();
const groundPatchGrid = new Map();
const CELL = 30;
function buildColliderHash() {
  colliderGrid.clear(); groundPatchGrid.clear();
  for (const patch of groundPatches) {
    for (let x = Math.floor(patch.x/CELL); x <= Math.floor(patch.x1/CELL); x++)
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
