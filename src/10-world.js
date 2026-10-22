/* ============================================================
   长安城 · 坊市 / 城墙 / 街景
   ============================================================ */

MAT.roof.map = TEX.roof;
MAT.roof.side = THREE.DoubleSide;
MAT.roof.needsUpdate = true;
MAT.roofGlazed.map = TEX.roof;
MAT.roofGlazed.side = THREE.DoubleSide;
MAT.roofGlazed.needsUpdate = true;

const B = {
  plaster: new Batch(UNIT_BOX, MAT.plaster),
  plasterWarm: new Batch(UNIT_BOX, MAT.plasterWarm),
  wood: new Batch(UNIT_BOX, MAT.wood),
  red: new Batch(UNIT_BOX, MAT.red),
  stone: new Batch(UNIT_BOX, MAT.stone),
  dark: new Batch(UNIT_BOX, MAT.dark),
  columns: new Batch(UNIT_CYL, MAT.red),
  roof: new Batch(ROOF_UNIT, MAT.roof),
  roofSmall: new Batch(ROOF_SMALL, MAT.roof),
  roofGold: new Batch(ROOF_UNIT, MAT.roofGlazed),
  trunk: new Batch(UNIT_CYL, MAT.trunk),
  leaf: new Batch(new THREE.IcosahedronGeometry(0.5, 1), MAT.leaf),
  blossom: new Batch(new THREE.IcosahedronGeometry(0.5, 1), MAT.blossom),
  lantern: new Batch(new THREE.SphereGeometry(0.5, 10, 8), MAT.lantern),
  lanternCap: new Batch(UNIT_CYL, MAT.gold),
  vines: new Batch(UNIT_CYL, MAT.leaf),
  window: new Batch(UNIT_PLANE, MAT.window, { cast: false }),
};

const NOISE_COLORS = {
  plaster: [0xfff4dc, 0xffe8c6, 0xfff9e8, 0xffdfb7],
  wood: [0xa43f2a, 0xba4b2e, 0x8b3524, 0xc05b32],
  red: [0xe74331, 0xd6372b, 0xf15b3a, 0xc92d28],
  stone: [0xd8d8c7, 0xc6cbbd, 0xe5e2d0, 0xb9c2b4],
  roof: [0x2b8d85, 0x339d91, 0x247b7b, 0x43a89a, 0x1e716f],
  roofGold: [0xe3a025, 0xf2b832, 0xd88b1d],
  leaf: [0x5fbb40, 0x4aa632, 0x79ca50, 0x3c912d],
  blossom: [0xff8fa6, 0xff7092, 0xffb1be, 0xef6685],
};

function pickColor(kind) { return pick(NOISE_COLORS[kind] || NOISE_COLORS.plaster); }

// ---------------------------------------------------------------- 文字招牌
function makeSignAtlas(names, cols = 8, rows = 12) {
  const W = 1024, H = 1024;
  const cw = W / cols, ch = H / rows;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  const uv = {};
  names.forEach((name, i) => {
    const cx = i % cols, cy = Math.floor(i / cols);
    const x = cx * cw, y = cy * ch;
    const pad = 5;
    ctx.save();
    const g = ctx.createLinearGradient(x, y, x, y + ch);
    g.addColorStop(0, '#7b4b2f'); g.addColorStop(1, '#5a3322');
    ctx.fillStyle = g;
    ctx.beginPath();
    const r = 10;
    ctx.roundRect(x + pad, y + pad, cw - pad * 2, ch - pad * 2, r);
    ctx.fill();
    ctx.strokeStyle = '#d9b567'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(x + pad + 5, y + pad + 5, cw - pad * 2 - 10, ch - pad * 2 - 10, 7); ctx.stroke();
    ctx.fillStyle = '#f9ecc6';
    ctx.font = `700 ${Math.min(42, cw / (name.length + 0.7))}px "STKaiti","KaiTi","Kaiti SC","Songti SC",serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(name, x + cw / 2, y + ch / 2 + 2);
    ctx.restore();
    uv[name] = { u0: (x + pad + 2) / W, v0: 1 - (y + ch - pad - 2) / H, u1: (x + cw - pad - 2) / W, v1: 1 - (y + pad + 2) / H };
  });
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return { tex, uv, cellW: cw / W, cellH: ch / H };
}

const wardAtlas = makeSignAtlas([...WARD_NAMES_LEFT, ...WARD_NAMES_RIGHT], 8, 12);
const wardSignMat = new THREE.MeshBasicMaterial({ map: wardAtlas.tex, transparent: true, alphaTest: 0.05 });
const wardSigns = quadBatch(wardSignMat);

const SHOP_NAMES = ['胡姬酒肆','波斯邸','香药铺','绸缎庄','茶坊','胡饼铺','金银行','珠玉行','绫锦行','乐器行','书肆','马行','骆驼店','酒家','面馆','胡旋舞坊'];
const shopAtlas = makeSignAtlas(SHOP_NAMES, 4, 4);
const shopSignMat = new THREE.MeshBasicMaterial({ map: shopAtlas.tex, transparent: true, alphaTest: 0.05 });
const shopSigns = quadBatch(shopSignMat);

function addSignQuad(batch, atlas, name, x, y, z, ry, w, h) {
  const uv = atlas.uv[name];
  if (!uv) return;
  const m = new THREE.Matrix4();
  m.makeRotationY(ry);
  m.setPosition(x, y, z);
  batch.add(w, h, m, uv.u0, uv.v0, uv.u1, uv.v1);
}

function textSignTexture(text, opts = {}) {
  const { w = 512, h = 160, bg = '#633d28', fg = '#f7e6bb', border = '#d8b06a', font = 76, vertical = false } = opts;
  return makeTexture(w, h, (ctx) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, bg); g.addColorStop(1, '#3f2418');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(3, 3, w - 6, h - 6, 12); ctx.fill();
    ctx.strokeStyle = border; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(10, 10, w - 20, h - 20, 8); ctx.stroke();
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (vertical) {
      ctx.font = `700 ${font}px "STKaiti","KaiTi","Kaiti SC",serif`;
      [...text].forEach((ch, i, arr) => ctx.fillText(ch, w / 2, h / 2 + (i - (arr.length - 1) / 2) * font * 1.08));
    } else {
      ctx.font = `700 ${font}px "STKaiti","KaiTi","Kaiti SC",serif`;
      ctx.fillText(text, w / 2, h / 2 + 3);
    }
  });
}

function addSignMesh(text, x, y, z, ry, w = 7, h = 2.2, opts = {}) {
  const tex = textSignTexture(text, opts);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y, z); mesh.rotation.y = ry;
  scene.add(mesh);
  return mesh;
}

// ---------------------------------------------------------------- 通用建筑
const roofColors = NOISE_COLORS.roof;
const hallDetails = [];
function addHall(x, z, w, d, opt = {}) {
  const {
    h = 6.2, roofH = 4.1, ry = 0, platform = 0.55, colorKind = 'plaster',
    roofKind = 'roof', columns = true, doors = true, windows = false, redWall = false,
    collider = false, gateSide = 1, glow = false,
  } = opt;
  if (w >= 10) hallDetails.push({ x, z, w, d, h, platform, ry });
  const cos = Math.cos(ry), sin = Math.sin(ry);
  const px = (lx, lz) => x + lx * cos + lz * sin;
  const pz = (lx, lz) => z - lx * sin + lz * cos;
  // 台基
  B.stone.add(x, platform / 2, z, w + 2.4, platform, d + 2.4, ry, pickColor('stone'));
  // 台阶（正面 +z）
  for (let i = 0; i < 3; i++) {
    const sx = px(0, d / 2 + 1.8 + i * 0.45), sz = pz(0, d / 2 + 1.8 + i * 0.45);
    B.stone.add(sx, (platform * (3 - i)) / 8, sz, w * 0.36 - i * 0.4, platform * (3 - i) / 4, 1.4, ry, 0xd6cbb3);
  }
  // 墙身
  const wallY = platform + h / 2;
  B.plaster.add(x, wallY, z, w, h, d, ry, redWall ? 0xb94e41 : pickColor(colorKind));
  // 前后墙面木框
  if (columns) {
    const n = Math.max(3, Math.round(w / 4.4));
    for (let i = 0; i <= n; i++) {
      const lx = -w / 2 + (w / n) * i;
      const cx = px(lx, d / 2 + 0.28), cz = pz(lx, d / 2 + 0.28);
      B.columns.add(cx, platform + h / 2, cz, 0.42, h, 0.42, ry, 0xbe4b3e);
      if (i % 2 === 0) {
        const bx = px(lx, -d / 2 - 0.28), bz = pz(lx, -d / 2 - 0.28);
        B.columns.add(bx, platform + h / 2, bz, 0.38, h, 0.38, ry, 0xb7473b);
      }
    }
    // 额枋
    const beamY = platform + h - 0.45;
    B.red.add(px(0, d / 2 + 0.32), beamY, pz(0, d / 2 + 0.32), w + 0.8, 0.55, 0.5, ry, 0xa94237);
  }
  if (doors) {
    const doorW = Math.min(w * 0.62, 7), doorH = Math.min(h * 0.68, 4.4);
    B.dark.add(px(0, d / 2 + 0.38), platform + doorH / 2, pz(0, d / 2 + 0.38), doorW, doorH, 0.18, ry, 0x4b3022);
    for (let i = -1; i <= 1; i += 2) {
      B.gold = B.gold || new Batch(UNIT_SPHERE, MAT.gold);
      B.gold.add(px(i * 0.6, d / 2 + 0.49), platform + doorH * 0.52, pz(i * 0.6, d / 2 + 0.49), 0.16, 0.16, 0.16, ry, 0xd9b04d);
    }
  }
  if (windows) {
    for (let i = -1; i <= 1; i++) {
      const wx = px(i * w * 0.28, d / 2 + 0.39), wz = pz(i * w * 0.28, d / 2 + 0.39);
      B.window.add(wx, platform + h * 0.55, wz, w * 0.16, h * 0.3, 1, ry, null);
    }
  }
  // 屋顶
  const eave = platform + h - 0.05;
  const batch = roofKind === 'gold' ? B.roofGold : B.roof;
  const roofColor = roofKind === 'gold' ? pickColor('roofGold') : pickColor('roof');
  batch.add(x, eave, z, w + 3.4, roofH, d + 3.4, ry, roofColor);
  // 正脊与鸱吻
  B.dark.add(px(0, 0), eave + roofH * 0.93, pz(0, 0), w * 0.72, 0.4, 0.55, ry, 0x35423f);
  for (const side of [-1, 1]) {
    B.dark.add(px(side * w * 0.36, 0), eave + roofH * 0.99, pz(side * w * 0.36, 0), 0.45, 0.9, 0.45, ry, 0x35423f);
  }
  if (collider) {
    const halfW = Math.abs(w / 2 * cos) + Math.abs(d / 2 * sin);
    const halfD = Math.abs(w / 2 * sin) + Math.abs(d / 2 * cos);
    addCollider(x - halfW, x + halfW, z - halfD, z + halfD, 'hall');
  }
  return { x, z, w, d, h, eave, ry };
}

function addPavilion(x, z, r = 5, opt = {}) {
  const { h = 3.2, roofH = 3.2, ry = 0, platform = 0.4, roofKind = 'roof', railing = true, collider = false } = opt;
  B.stone.add(x, platform / 2, z, r * 2 + 1.2, platform, r * 2 + 1.2, ry, pickColor('stone'));
  const pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (const [sx, sz] of pts) {
    const lx = sx * r * 0.82, lz = sz * r * 0.82;
    B.columns.add(x + lx, platform + h / 2, z + lz, 0.36, h, 0.36, ry, 0xa94338);
  }
  B.red.add(x, platform + h - 0.2, z, r * 1.9, 0.35, 0.35, ry, 0xa94338);
  const batch = roofKind === 'gold' ? B.roofGold : B.roof;
  batch.add(x, platform + h, z, r * 2.25, roofH, r * 2.25, ry, roofKind === 'gold' ? pickColor('roofGold') : pickColor('roof'));
  B.dark.add(x, platform + h + roofH * 0.95, z, 0.32, 0.5, 0.32, ry, 0x35423f);
  if (railing) {
    for (const side of [-1, 1]) {
      B.wood.add(x, platform + 0.6, z + side * r * 0.92, r * 1.8, 0.12, 0.12, ry, 0x7a4530);
      B.wood.add(x + side * r * 0.92, platform + 0.6, z, 0.12, 0.12, r * 1.8, ry, 0x7a4530);
    }
  }
  if (collider) addCollider(x - r, x + r, z - r, z + r, 'pavilion');
}

function addCorridor(x1, z1, x2, z2, opt = {}) {
  const { w = 4.2, h = 3.6 } = opt;
  const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz), ang = Math.atan2(dx, dz);
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
  B.stone.add(cx, 0.12, cz, w, 0.24, len, ang, 0xd2c7ae);
  B.red.add(cx, h - 0.15, cz, w + 0.4, 0.35, len, ang, 0xa94338);
  B.roofSmall.add(cx, h, cz, w + 2.2, 1.7, len, ang, pickColor('roof'));
  const n = Math.max(2, Math.floor(len / 5));
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = lerp(x1, x2, t), z = lerp(z1, z2, t);
    B.columns.add(x, h / 2, z, 0.28, h, 0.28, 0, 0xa94338);
  }
}

function addTree(x, z, kind = 'willow', s = 1) {
  const trunkH = (kind === 'pine' ? 5.5 : 4.2) * s;
  B.trunk.add(x, trunkH / 2, z, 0.44 * s, trunkH, 0.44 * s, rr(0, TAU), 0x7c5639);
  if (kind === 'willow') {
    for (let i = 0; i < 5; i++) {
      const a = rr(0, TAU), r = rr(0, 1.9) * s;
      B.leaf.add(x + Math.cos(a) * r, trunkH + rr(-0.3, 0.8) * s, z + Math.sin(a) * r, rr(3.2, 4.8) * s, rr(2.2, 3.2) * s, rr(3.2, 4.8) * s, rr(0, TAU), pickColor('leaf'));
    }
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU + rr(-0.2, 0.2), r = rr(1.5, 3.2) * s;
      B.vines.add(x + Math.cos(a) * r, trunkH * 0.72 + rr(-0.4, 0.6), z + Math.sin(a) * r, 0.07 * s, rr(2.6, 4.3) * s, 0.07 * s, 0, 0x82b767);
    }
  } else if (kind === 'pine') {
    for (let i = 0; i < 3; i++) {
      B.leaf.add(x, trunkH * 0.55 + i * 1.55 * s, z, (3.6 - i * 0.6) * s, (2.4 - i * 0.25) * s, (3.6 - i * 0.6) * s, rr(0, TAU), 0x5f8e5d);
    }
  } else if (kind === 'peach') {
    for (let i = 0; i < 5; i++) {
      const a = rr(0, TAU), r = rr(0, 1.8) * s;
      B.blossom.add(x + Math.cos(a) * r, trunkH + rr(-0.2, 1.0) * s, z + Math.sin(a) * r, rr(2.8, 4) * s, rr(2, 3) * s, rr(2.8, 4) * s, rr(0, TAU), pickColor('blossom'));
    }
  } else {
    for (let i = 0; i < 4; i++) {
      const a = rr(0, TAU), r = rr(0, 1.6) * s;
      B.leaf.add(x + Math.cos(a) * r, trunkH + rr(0.1, 1.1) * s, z + Math.sin(a) * r, rr(3, 4.4) * s, rr(2.4, 3.2) * s, rr(3, 4.4) * s, rr(0, TAU), pickColor('leaf'));
    }
  }
}

function addLanternString(x1, z1, x2, z2, y = 4.5, n = 6) {
  const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
  const ang = Math.atan2(dx, dz);
  // 绳子
  B.dark.add((x1 + x2) / 2, y, (z1 + z2) / 2, 0.05, 0.05, len, ang, 0x3a2a20);
  for (let i = 1; i < n; i++) {
    const t = i / n, x = lerp(x1, x2, t), z = lerp(z1, z2, t);
    addLantern(x, y - 0.55, z, 1);
  }
}
function addLantern(x, y, z, s = 1) {
  B.lantern.add(x, y, z, 0.55 * s, 0.75 * s, 0.55 * s, 0, 0xdf5a43);
  B.lanternCap.add(x, y + 0.4 * s, z, 0.24 * s, 0.1 * s, 0.24 * s, 0, 0xd9aa4b);
  B.lanternCap.add(x, y - 0.4 * s, z, 0.2 * s, 0.08 * s, 0.2 * s, 0, 0xd9aa4b);
  B.dark.add(x, y + 0.56 * s, z, 0.03, 0.3 * s, 0.03, 0, 0x3a2a20);
  lanternPositions.push(new THREE.Vector3(x, y, z));
}
const lanternPositions = [];

const stallAwningMats = new Map();
function getStallAwningMat(color) {
  if (stallAwningMats.has(color)) return stallAwningMats.get(color);
  const hex = '#' + color.toString(16).padStart(6, '0');
  const tex = makeTexture(128, 96, (ctx, w, h) => {
    ctx.fillStyle = '#fff1c9'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = hex;
    for (let i = 0; i < 4; i++) ctx.fillRect(i * 32, 0, 16, h);
    ctx.fillStyle = 'rgba(86, 36, 24, .18)'; ctx.fillRect(0, h - 6, w, 6);
  }, { repeat: [1, 1] });
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide });
  stallAwningMats.set(color, mat);
  return mat;
}

function addMarketStall(x, z, ry = 0, color = 0xc84f3c) {
  B.wood.add(x, 0.65, z, 3.2, 1.3, 1.8, ry, 0x8d5a3a);
  for (const [dx, dz] of [[-1.5, -0.8], [1.5, -0.8], [-1.5, 0.8], [1.5, 0.8]]) {
    B.wood.add(x + dx, 1.65, z + dz, 0.12, 2.2, 0.12, ry, 0x6e452e);
  }
  // 布篷：横向的条纹顶棚，而不是竖着的色块
  const awning = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.13, 2.9), getStallAwningMat(color));
  awning.position.set(x, 2.82, z); awning.rotation.set(0.07, ry, 0); awning.castShadow = true; awning.receiveShadow = true;
  scene.add(awning);
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.17, 0.18), new THREE.MeshStandardMaterial({ color: 0xf3c44e, roughness: 0.55 }));
  ridge.position.set(x, 2.92, z); ridge.rotation.y = ry; scene.add(ridge);
  // 货物
  for (let i = 0; i < 5; i++) {
    B.leaf.add(x + rr(-1.1, 1.1), 1.42, z + rr(-0.5, 0.5), 0.4, 0.35, 0.4, rr(0, TAU), pick([0xe3a14b, 0xc95545, 0xd7c46a, 0x9d6f45]));
  }
  B.lantern.add(x + 1.4, 2.35, z + 0.9, 0.26, 0.36, 0.26, 0, 0xdf5a43);
  addCollider(x - 1.7, x + 1.7, z - 1.15, z + 1.15, 'stall');
}

function addBanner(text, x, z, ry, color = '#b64438') {
  const tex = makeTexture(160, 420, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color; ctx.fillRect(12, 0, w - 24, h);
    ctx.fillStyle = 'rgba(255,240,200,.16)'; ctx.fillRect(12, 0, 10, h);
    ctx.strokeStyle = '#e5bf76'; ctx.lineWidth = 3; ctx.strokeRect(18, 8, w - 36, h - 16);
    ctx.fillStyle = '#f8e8bc'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 62px "STKaiti","KaiTi",serif';
    [...text].forEach((ch, i, arr) => ctx.fillText(ch, w / 2, h / 2 + (i - (arr.length - 1) / 2) * 78));
  });
  const mat = new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, transparent: true, alphaTest: 0.1 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 5.6), mat);
  mesh.position.set(x, 4.6, z); mesh.rotation.y = ry; mesh.castShadow = true;
  scene.add(mesh);
  B.wood.add(x, 3.9, z - Math.cos(ry) * 0.12, 0.14, 7.8, 0.14, ry, 0x6e452e);
}

// ---------------------------------------------------------------- 坊
function addWardWalls(w) {
  const { x, z, w: ww, d, name } = w;
  const halfW = ww / 2, halfD = d / 2, h = 2.2, t = 0.5, gate = 11;
  const wallColor = pickColor('plaster');
  const wall = (cx, cz, sx, sz) => {
    B.plaster.add(cx, h / 2, cz, sx, h, sz, 0, wallColor);
    B.red.add(cx, h - 0.18, cz, sx + 0.06, 0.2, sz + 0.06, 0, 0xe64631);
    B.dark.add(cx, h + 0.12, cz, sx + 0.3, 0.22, sz + 0.3, 0, 0x2f8079);
    addCollider(cx - sx / 2, cx + sx / 2, cz - sz / 2, cz + sz / 2, 'wardwall');
  };
  // 南北墙，中间开门
  for (const side of [-1, 1]) {
    const len = (ww - gate) / 2;
    wall(x - (gate + len) / 2, z + side * halfD, len, t);
    wall(x + (gate + len) / 2, z + side * halfD, len, t);
    // 门楼
    B.wood.add(x - gate / 2 - 0.3, 2.0, z + side * halfD, 0.45, 4, 0.45, 0, 0x74452f);
    B.wood.add(x + gate / 2 + 0.3, 2.0, z + side * halfD, 0.45, 4, 0.45, 0, 0x74452f);
    B.red.add(x, 4.15, z + side * halfD, gate + 1.2, 0.5, 0.6, 0, 0xa94237);
    B.roofSmall.add(x, 4.35, z + side * halfD, gate + 3, 1.9, 4.6, 0, 0x2e9088);
  }
  // 东西墙，中间开门
  for (const side of [-1, 1]) {
    const len = (d - gate) / 2;
    wall(x + side * halfW, z - (gate + len) / 2, t, len);
    wall(x + side * halfW, z + (gate + len) / 2, t, len);
    B.wood.add(x + side * halfW, 2.0, z - gate / 2 - 0.3, 0.45, 4, 0.45, 0, 0x74452f);
    B.wood.add(x + side * halfW, 2.0, z + gate / 2 + 0.3, 0.45, 4, 0.45, 0, 0x74452f);
    B.red.add(x + side * halfW, 4.15, z, 0.6, 0.5, gate + 1.2, 0, 0xa94237);
    B.roofSmall.add(x + side * halfW, 4.35, z, 4.6, 1.9, gate + 3, 0, 0x2e9088);
  }
  addSignQuad(wardSigns, wardAtlas, name, x, 3.2, z + halfD + 0.34, 0, 3.8, 1.9);
}

function addCompound(x, z, w, d, ry = 0, simple = false) {
  const hw = w / 2, hd = d / 2;
  addCollider(x - hw, x + hw, z - hd, z + hd, 'compound');
  // 院墙
  const wallH = 1.8, t = 0.42;
  for (const side of [-1, 1]) {
    B.plaster.add(x, wallH / 2, z + side * hd, w, wallH, t, ry, pickColor('plaster'));
    B.plaster.add(x + side * hw, wallH / 2, z, t, wallH, d, ry, pickColor('plaster'));
    B.dark.add(x, wallH + 0.1, z + side * hd, w + 0.2, 0.2, t + 0.2, ry, 0x4d5a54);
  }
  // 正房
  addHall(x, z - d * 0.18, w * 0.62, d * 0.38, { h: 4.6, roofH: 3.2, ry, simple, collider: false, doors: true, columns: !simple });
  if (!simple) {
    addHall(x - w * 0.31, z + d * 0.12, w * 0.26, d * 0.42, { h: 3.6, roofH: 2.5, ry, simple: true, doors: false, columns: false });
    addHall(x + w * 0.31, z + d * 0.12, w * 0.26, d * 0.42, { h: 3.6, roofH: 2.5, ry, simple: true, doors: false, columns: false });
  }
  // 院门
  const gateW = 4.2;
  B.wood.add(x - gateW / 2 - 0.3, 1.6, z + hd + 0.28, 0.36, 3.2, 0.36, ry, 0x74452f);
  B.wood.add(x + gateW / 2 + 0.3, 1.6, z + hd + 0.28, 0.36, 3.2, 0.36, ry, 0x74452f);
  B.roofSmall.add(x, 3.3, z + hd + 0.28, gateW + 2, 1.4, 3, ry, 0x6c8077);
  // 院内石板
  B.stone.add(x, 0.06, z + d * 0.12, w * 0.55, 0.12, d * 0.55, ry, 0xcfc4ac);
  addTree(x + hw * 0.66, z + hd * 0.5, 'peach', 0.75);
  if (simple) addTree(x - hw * 0.62, z + hd * 0.25, 'willow', 0.7);
}

function buildWards() {
  for (const w of wards) {
    addWardWalls(w);
    const idx = (w.col * 7 + w.row * 13) % 5;
    if (idx === 0 && w.w === WARD_W) {
      // 小型佛寺
      addCompound(w.x, w.z + 2, w.w * 0.6, w.d * 0.58, 0, false);
      addPavilion(w.x - w.w * 0.27, w.z - w.d * 0.28, 2.7, { h: 2.4, roofH: 2.2 });
      addTree(w.x + w.w * 0.28, w.z - w.d * 0.3, 'pine', 0.9);
    } else if (idx === 3) {
      addCompound(w.x - w.w * 0.17, w.z, w.w * 0.52, w.d * 0.64, 0, false);
      addCompound(w.x + w.w * 0.28, w.z - w.d * 0.16, w.w * 0.34, w.d * 0.32, 0, true);
      addTree(w.x + w.w * 0.3, w.z + w.d * 0.28, 'willow', 0.8);
    } else {
      addCompound(w.x, w.z, w.w * 0.7, w.d * 0.7, 0, idx === 4);
      addTree(w.x - w.w * 0.33, w.z + w.d * 0.3, idx % 2 ? 'peach' : 'willow', 0.8);
      addTree(w.x + w.w * 0.36, w.z + w.d * 0.08, 'pine', 0.65);
    }
    // 坊内散树
    for (let i = 0; i < 3; i++) {
      const tx = w.x + rr(-w.w * 0.38, w.w * 0.38), tz = w.z + rr(-w.d * 0.38, w.d * 0.38);
      if (Math.abs(tx - w.x) < w.w * 0.26 && Math.abs(tz - w.z) < w.d * 0.24) continue;
      addTree(tx, tz, pick(['willow', 'peach', 'leaf']), rr(0.55, 0.9));
    }
  }
}

// ---------------------------------------------------------------- 市场
function addShop(x, z, w, d, ry, name, opt = {}) {
  const { twoStory = true, awning = 0xc94e3c, goods = true } = opt;
  addHall(x, z, w, d, { h: twoStory ? 7.2 : 4.6, roofH: 3.4, ry, doors: true, columns: true, windows: true, collider: true });
  if (twoStory) {
    // 二层挑台
    B.wood.add(x, 4.7, z + Math.cos(ry) * (d / 2 + 0.7), w + 1.2, 0.32, 1.4, ry, 0x7b4830);
    for (let i = -2; i <= 2; i++) B.wood.add(x + i * w * 0.2 * Math.cos(ry), 5.1, z + Math.cos(ry) * (d / 2 + 1.3) - i * w * 0.2 * Math.sin(ry), 0.1, 0.8, 0.1, ry, 0x6e402b);
  }
  addSignQuad(shopSigns, shopAtlas, name, x + Math.sin(ry) * (d / 2 + 0.5), 3.8, z + Math.cos(ry) * (d / 2 + 0.5), ry, 3.4, 1.35);
  // 布幔
  const aw = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, 2.2), new THREE.MeshStandardMaterial({ color: awning, roughness: 0.9, side: THREE.DoubleSide }));
  aw.position.set(x, 2.8, z + Math.cos(ry) * (d / 2 + 0.9)); aw.rotation.set(-0.22, ry, 0);
  scene.add(aw);
  if (goods) {
    for (let i = 0; i < 6; i++) {
      const gx = x + Math.cos(ry) * rr(-w * 0.35, w * 0.35) - Math.sin(ry) * (d / 2 + 1.3);
      const gz = z + Math.sin(ry) * rr(-w * 0.35, w * 0.35) + Math.cos(ry) * (d / 2 + 1.3);
      B.leaf.add(gx, 1.3, gz, 0.35, 0.3, 0.35, rr(0, TAU), pick([0xd6a14a, 0xc74b3e, 0x7c9b62, 0xe3d0a0, 0x9d6e44]));
    }
    B.wood.add(x, 0.75, z + Math.cos(ry) * (d / 2 + 1.6), w * 0.7, 1.2, 1.1, ry, 0x8f5a38);
  }
  addLantern(x - Math.cos(ry) * w * 0.38, 4.4, z - Math.sin(ry) * w * 0.38 + Math.cos(ry) * (d / 2 + 0.5), 0.85);
}

function buildMarket(cx, cz, w, d, name, east = false) {
  const halfW = w / 2, halfD = d / 2, wallH = 3.0;
  // 市场墙，四面开口
  const gate = 18;
  for (const side of [-1, 1]) {
    const len = (w - gate) / 2;
    B.plaster.add(cx - (gate + len) / 2, wallH / 2, cz + side * halfD, len, wallH, 0.7, 0, 0xeadcc2);
    B.plaster.add(cx + (gate + len) / 2, wallH / 2, cz + side * halfD, len, wallH, 0.7, 0, 0xf2e4c9);
    B.dark.add(cx, wallH + 0.12, cz + side * halfD, w, 0.25, 1.0, 0, 0x4c5a55);
    addCollider(cx - w / 2, cx - gate / 2, cz + side * halfD - 0.5, cz + side * halfD + 0.5, 'marketwall');
    addCollider(cx + gate / 2, cx + w / 2, cz + side * halfD - 0.5, cz + side * halfD + 0.5, 'marketwall');
  }
  for (const side of [-1, 1]) {
    const len = (d - gate) / 2;
    B.plaster.add(cx + side * halfW, wallH / 2, cz - (gate + len) / 2, 0.7, wallH, len, 0, 0xe8d8bd);
    B.plaster.add(cx + side * halfW, wallH / 2, cz + (gate + len) / 2, 0.7, wallH, len, 0, 0xf4e6cb);
    addCollider(cx + side * halfW - 0.5, cx + side * halfW + 0.5, cz - d / 2, cz - gate / 2, 'marketwall');
    addCollider(cx + side * halfW - 0.5, cx + side * halfW + 0.5, cz + gate / 2, cz + d / 2, 'marketwall');
  }
  // 市门
  for (const side of [-1, 1]) {
    B.roofSmall.add(cx, 4.7, cz + side * halfD, gate + 4, 2.4, 5.5, 0, 0x6b7f76);
    B.wood.add(cx, 3.5, cz + side * halfD, gate + 1.5, 0.5, 0.6, 0, 0x74452f);
  }
  addSignMesh(name, cx, 6.1, cz + halfD + 0.5, 0, 7.5, 2.4, { font: 70 });
  // 十字街
  const roadMat = new THREE.MeshStandardMaterial({ map: TEX.stone, color: 0xf7f2de, roughness: 1 });
  const r1 = new THREE.Mesh(new THREE.PlaneGeometry(w - 8, 12), roadMat);
  r1.rotation.x = -Math.PI / 2; r1.position.set(cx, 0.02, cz); r1.receiveShadow = true; scene.add(r1);
  const r2 = new THREE.Mesh(new THREE.PlaneGeometry(12, d - 8), roadMat);
  r2.rotation.x = -Math.PI / 2; r2.position.set(cx, 0.025, cz); r2.receiveShadow = true; scene.add(r2);

  // 周围店铺
  const names = east ? ['珠玉行', '绫锦行', '乐器行', '书肆', '茶坊', '金银行'] : ['胡姬酒肆', '波斯邸', '香药铺', '胡饼铺', '骆驼店', '酒家'];
  const shopW = 17, shopD = 13;
  const offsets = [-0.32, -0.1, 0.13, 0.35];
  for (let i = 0; i < 4; i++) {
    addShop(cx + offsets[i] * w, cz - halfD + 10, shopW, shopD, 0, names[i % names.length], { awning: east ? 0x4e7d8b : 0xc94e3c });
    addShop(cx + offsets[i] * w, cz + halfD - 10, shopW, shopD, Math.PI, names[(i + 2) % names.length], { awning: east ? 0x7a5a8c : 0xd1a043 });
  }
  for (let i = 0; i < 3; i++) {
    addShop(cx - halfW + 10, cz + offsets[i] * d * 0.9, shopD, shopW, Math.PI / 2, names[(i + 1) % names.length], { awning: 0x4b7d74 });
    addShop(cx + halfW - 10, cz + offsets[i] * d * 0.9, shopD, shopW, -Math.PI / 2, names[(i + 3) % names.length], { awning: 0xb95a4a });
  }
  // 中央市楼
  addPavilion(cx, cz, 5.6, { h: 4.0, roofH: 3.4, roofKind: 'gold', railing: true, collider: true });
  B.wood.add(cx, 1.5, cz, 7.5, 3, 7.5, 0, 0x7b4b31);
  // 摊位
  const stallColors = [0xc74f3c, 0x4c7f8c, 0xd1a043, 0x7b5b8f, 0x5d8b66];
  for (let i = 0; i < 18; i++) {
    const angle = rr(0, TAU), rad = rr(10, Math.min(w, d) * 0.38);
    const sx = cx + Math.cos(angle) * rad * (w / Math.min(w, d)), sz = cz + Math.sin(angle) * rad * (d / Math.min(w, d));
    if (Math.abs(sx - cx) < 13 || Math.abs(sz - cz) < 9) continue;
    addMarketStall(sx, sz, rr(0, TAU), pick(stallColors));
  }
  // 旗幡
  for (let i = 0; i < 6; i++) {
    addBanner(pick(['酒', '茶', '香', '绸', '饼', '药']), cx + rr(-w * 0.4, w * 0.4), cz + rr(-d * 0.4, d * 0.4), rr(0, TAU), pick(['#b64438', '#3f6d72', '#7a4b70', '#a66a2f']));
  }
  // 灯笼串
  for (let i = 0; i < 4; i++) {
    addLanternString(cx - w * 0.3 + i * w * 0.2, cz - d * 0.42, cx - w * 0.3 + i * w * 0.2, cz + d * 0.42, 5.5, 5);
  }
  marketDefs.push({ x: cx, z: cz, w, d, name });
  landmarks.push({
    id: east ? 'east-market' : 'west-market', name,
    x: cx, z: cz, radius: Math.max(w, d) * 0.5,
    poem: east ? '东市买骏马，西市买鞍鞯' : '胡姬貌如花，当垆笑春风',
    desc: east ? '四方珍奇，皆所积集。绫锦珠玉，香气盈街。' : '波斯邸、胡姬酒肆、骆驼商队，西域风物汇于一处。',
  });
}

// ---------------------------------------------------------------- 城墙与城门
function addCityWalls() {
  const h = 10.5, t = 6.5;
  const wallMat = new THREE.MeshStandardMaterial({ map: TEX.dirt, color: 0xf0d2a4, roughness: 1 });
  const wall = (x, z, w, d) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    mesh.position.set(x, h / 2, z); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
    addCollider(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 'citywall');
  };
  // 南墙：明德门
  const gateS = 30;
  wall(-CITY.x1 / 2 - gateS / 4, CITY.z1, CITY.x1 - gateS / 2, t);
  wall(CITY.x1 / 2 + gateS / 4, CITY.z1, CITY.x1 - gateS / 2, t);
  // 北墙：玄武门 + 丹凤门
  wall(-230, CITY.z0, 440, t);
  wall(75, CITY.z0, 130, t);
  wall(370, CITY.z0, 160, t);
  // 东墙 / 西墙（春明门/金光门）
  wall(CITY.x1, -162, t, 436);
  wall(CITY.x1, 218, t, 324);
  wall(CITY.x0, -162, t, 436);
  wall(CITY.x0, 218, t, 324);
  // 垛口
  for (let x = -444; x <= 444; x += 6) {
    for (const z of [CITY.z0, CITY.z1]) {
      if (z === CITY.z1 && Math.abs(x) < 18) continue;
      if (z === CITY.z0 && (Math.abs(x) < 12 || Math.abs(x - 150) < 20)) continue;
      B.stone.add(x, h + 0.7, z + (z === CITY.z0 ? -2.4 : 2.4), 2.2, 1.4, 1.0, 0, 0xbfae8e);
    }
  }
  for (let z = -374; z <= 374; z += 6) {
    for (const x of [CITY.x0, CITY.x1]) {
      if (Math.abs(z - 55) < 15) continue;
      B.stone.add(x + (x === CITY.x0 ? -2.4 : 2.4), h + 0.7, z, 1.0, 1.4, 2.2, 0, 0xbfae8e);
    }
  }
  // 角楼
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * CITY.x1, z = sz * CITY.z1;
    B.stone.add(x, 6, z, 18, 12, 18, 0, 0xe2cda9);
    addPavilion(x, z, 6.5, { h: 5.5, roofH: 4.0, platform: 12.1, roofKind: 'gold' });
    addCollider(x - 9, x + 9, z - 9, z + 9, 'tower');
  }
  // 明德门
  addGateHouse(0, CITY.z1, 62, 20, 12, 5, '明德门', true);
  landmarks.push({ id: 'mingde', name: '明德门', x: 0, z: CITY.z1 - 12, radius: 38, poem: '百千家似围棋局，十二街如种菜畦', desc: '长安外郭城正南门，五门洞并列，是朱雀大街的起点。' });
  // 玄武门
  addGateHouse(0, CITY.z0, 34, 16, 10, 3, '玄武门', false);
  // 春明门 / 金光门
  addGateHouse(CITY.x1, 55, 34, 16, 10, 1, '春明门', false, true);
  addGateHouse(CITY.x0, 55, 34, 16, 10, 1, '金光门', false, true);
}

function addGateHouse(x, z, w, d, h, passages, name, grand = false, side = false) {
  const ry = side ? Math.PI / 2 : 0;
  const pw = w / (passages * 2 + 1);
  for (let i = 0; i <= passages; i++) {
    const px = x + (i - passages / 2) * pw * 2;
    if (side) B.stone.add(x, h / 2, z + (i - passages / 2) * pw * 2, d, h, pw, 0, 0xe7d1ad);
    else B.stone.add(px, h / 2, z, pw, h, d, 0, 0xe7d1ad);
    if (!side) addCollider(px - pw / 2, px + pw / 2, z - d / 2, z + d / 2, 'gate');
    else addCollider(x - d / 2, x + d / 2, z + (i - passages / 2) * pw * 2 - pw / 2, z + (i - passages / 2) * pw * 2 + pw / 2, 'gate');
  }
  // 门楼
  B.red.add(x, h + 3.2, z, side ? d + 3 : w + 4, 5.4, side ? w + 4 : d + 3, ry, 0xa94538);
  B.roof.add(x, h + 5.9, z, side ? d + 6 : w + 7, grand ? 5.6 : 4.2, side ? w + 6 : d + 7, ry, pickColor('roof'));
  B.dark.add(x, h + (grand ? 11.1 : 9.8), z, side ? 4 : w * 0.72, 0.5, side ? w * 0.72 : 4, ry, 0x35423f);
  addSignMesh(name, x, h + 2.6, z + (side ? 0 : d / 2 + 0.7), ry, 7.5, 2.3, { font: 68 });
  // 灯笼
  for (const off of [-0.36, 0.36]) {
    if (side) addLantern(x + Math.sign(x) * (d / 2 + 1), h + 1.6, z + off * w, 1.25);
    else addLantern(x + off * w, h + 1.6, z + (z > 0 ? d / 2 + 1 : -d / 2 - 1), 1.25);
  }
}

// ---------------------------------------------------------------- 街景
function buildStreetLife() {
  // 朱雀大街两侧柳树
  for (let z = -195; z <= 360; z += 24) {
    for (const x of [-20.5, 20.5]) {
      if (Math.abs(z) < 20 || Math.abs(z - 55) < 12 || Math.abs(z - 232) < 12) continue;
      addTree(x, z, 'willow', rr(0.85, 1.1));
    }
  }
  // 大街灯柱
  for (let z = -190; z <= 360; z += 36) {
    for (const x of [-12.1, 12.1]) {
      B.wood.add(x, 2.1, z, 0.3, 4.2, 0.3, 0, 0x6d452e);
      B.wood.add(x, 4.15, z, 1.2, 0.16, 0.16, 0, 0x6d452e);
      addLantern(x, 3.7, z, 0.9);
    }
  }
  // 横街灯串
  for (const z of [-140, -74, -8, 58, 124, 190, 256, 322]) {
    addLanternString(-11.8, z, 11.8, z, 4.9, 5);
  }
  // 朱雀大街上的彩绘牌楼，形成一路向北的节奏
  for (const [z, label] of [[286, '天街'], [170, '朱雀'], [54, '长安'], [-70, '春风']]) {
    for (const side of [-1, 1]) {
      const x = side * 12.35;
      B.stone.add(x, 0.45, z, 1.5, 0.9, 1.5, 0, 0xe6cfaa);
      B.wood.add(x, 4.7, z, 0.7, 8.5, 0.7, 0, 0xa83226);
    }
    B.red.add(0, 8.45, z, 28, 0.62, 0.78, 0, 0xeb4c36);
    B.roofSmall.add(0, 8.98, z, 31, 2.1, 4.2, 0, 0x2d948a);
    B.gold = B.gold || new Batch(UNIT_SPHERE, MAT.gold);
    B.gold.add(-11.2, 8.88, z, 0.5, 0.5, 0.5, 0, 0xf2bc3a);
    B.gold.add(11.2, 8.88, z, 0.5, 0.5, 0.5, 0, 0xf2bc3a);
    addSignMesh(label, 0, 6.95, z + 0.43, 0, 6.4, 1.9, { bg: '#a92e25', fg: '#ffe7a6', font: 72 });
    addLantern(0, 6.75, z + 0.5, 1.15);
  }
  // 城门内最先映入眼帘的几处摊肆，让起点就有烟火气
  for (const [x, z, ry, color] of [[-9.9, 326, 0.2, 0xd34a39], [9.9, 318, -0.25, 0x318d89], [-9.9, 296, 0.4, 0xe1a32e], [9.9, 282, -0.5, 0xb34a72]]) {
    addMarketStall(x, z, ry, color);
  }
  // 天街花圃：给长街添一层明快的颜色
  const planterFlowers = [0xff7f9d, 0xffb23e, 0xff5a43, 0xf3e06a, 0xf37bb4];
  for (let z = -180; z <= 364; z += 17) {
    if (Math.abs(z - 55) < 12 || Math.abs(z - 232) < 12 || Math.abs(z) < 16) continue;
    for (const side of [-1, 1]) {
      const x = side * 11.85;
      B.stone.add(x, 0.32, z, 3.1, 0.52, 1.45, 0, 0xe3c9a0);
      B.leaf.add(x, 0.74, z, 2.6, 0.62, 1.15, 0, 0x4f9f37);
      for (let k = 0; k < 3; k++) {
        B.blossom.add(x + (k - 1) * 0.78, 1.02 + (k % 2) * 0.08, z + (k % 2 ? 0.2 : -0.15), 0.42, 0.34, 0.42, rr(0, TAU), pick(planterFlowers));
      }
    }
  }
  // 沿街旗幡与彩旗下摆
  const flagColors = [0xe64331, 0x2b9489, 0xef9e27, 0x3d6db1];
  for (let z = -174; z <= 354; z += 38) {
    for (const side of [-1, 1]) {
      const x = side * 12.25, c = pick(flagColors);
      B.wood.add(x, 3.2, z, 0.24, 6.4, 0.24, 0, 0x7f3b26);
      B.red.add(x + side * 0.15, 4.9, z, 0.12, 2.6, 1.25, 0, c);
      B.dark.add(x, 6.5, z, 0.35, 0.35, 0.35, 0, 0xf2bd40);
      B.red.add(x + side * 0.15, 3.52, z, 0.42, 0.14, 1.5, 0, 0xf3d27a);
    }
  }
  // 街边小摊 / 车马
  for (let i = 0; i < 22; i++) {
    const z = rr(-185, 350), side = i % 2 ? 1 : -1;
    const x = side * rr(8.9, 10.7);
    if (Math.abs(z - 55) < 14 || Math.abs(z - 232) < 14) continue;
    addMarketStall(x, z, rr(0, TAU), pick([0xc74f3c, 0x4c7f8c, 0xd1a043, 0x5d8b66]));
  }
  // 坊墙外的桃树
  for (let i = 0; i < 40; i++) {
    const z = rr(-200, 365), x = (i % 2 ? 1 : -1) * rr(31, 39);
    addTree(x, z, i % 3 ? 'peach' : 'pine', rr(0.55, 0.8));
  }
  // 长安县署 / 万年县署 (示意)
  addHall(-90, 196, 30, 22, { h: 7, roofH: 4, collider: true, columns: true, colorKind: 'plaster' });
  addHall(90, 196, 30, 22, { h: 7, roofH: 4, collider: true, columns: true, colorKind: 'plaster' });
  addSignMesh('长安县署', -90, 8.2, 208, 0, 9, 2.3, { font: 62 });
  addSignMesh('万年县署', 90, 8.2, 208, 0, 9, 2.3, { font: 62 });
}
