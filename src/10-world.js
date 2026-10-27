/* ============================================================
   长安城 · 坊市 / 城墙 / 街景
   ============================================================ */

MAT.roof.map = TEX.roof;
MAT.roof.side = THREE.DoubleSide;
MAT.roof.needsUpdate = true;
MAT.roofGlazed.map = TEX.roof;
MAT.roofGlazed.side = THREE.DoubleSide;
MAT.roofGlazed.needsUpdate = true;
MAT.roofGlazed.roughness = 0.78;
MAT.roofGlazed.metalness = 0.035;

function tangHipGableGeometry() {
  const vertices = [], uvs = [], indices = [];
  function quad(a, b, c, d) {
    const i = vertices.length / 3;
    for (const p of [a, b, c, d]) { vertices.push(...p); uvs.push(p[0] + 0.5, p[2] + 0.5); }
    indices.push(i, i + 2, i + 1, i + 1, i + 2, i + 3);
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const a = i / 5, b = (i + 1) / 5;
      const ring = t => ({ x: 0.31 + t * 0.19, z: 0.25 + t * 0.25, y: 0.42 * (1 - t) ** 1.18 + 0.055 * t ** 4 });
      const ra = ring(a), rb = ring(b);
      quad([-ra.x, ra.y, side * ra.z], [ra.x, ra.y, side * ra.z], [-rb.x, rb.y, side * rb.z], [rb.x, rb.y, side * rb.z]);
      quad([side * ra.x, ra.y, -ra.z], [side * ra.x, ra.y, ra.z], [side * rb.x, rb.y, -rb.z], [side * rb.x, rb.y, rb.z]);
    }
    for (let i = 0; i < 5; i++) {
      const za = i / 5 * 0.265, zb = (i + 1) / 5 * 0.265;
      const y = z => 1 - 0.58 * (z / 0.265) ** 0.92;
      quad([-0.335, y(za), side * za], [0.335, y(za), side * za], [-0.335, y(zb), side * zb], [0.335, y(zb), side * zb]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices); g.computeVertexNormals(); return g;
}

function roofCoverTilesGeometry(gable = false) {
  const positions = [], indices = [], uv = [], rows = 64, steps = 32, arc = 4;
  const heightAt = (x, z) => {
    const tx = Math.max(0, (Math.abs(x) - 0.31) / 0.19);
    if (gable) {
      if (Math.abs(x) <= 0.335 && Math.abs(z) <= 0.265) return 1 - 0.58 * (Math.abs(z) / 0.265) ** 0.92;
      const t = Math.min(1, Math.max(tx, (Math.abs(z) - 0.25) / 0.25));
      return 0.42 * (1 - t) ** 1.18 + 0.055 * t ** 4;
    }
    const t = Math.min(1, Math.max(tx, Math.abs(z) * 2));
    return (1 - t) ** 1.12 + 0.055 * t ** 4 + 0.055 * 1.7 * tx ** 3 * (Math.abs(z) * 2) ** 4;
  };
  for (let row = 0; row <= rows; row++) {
    const x = -0.493 + row / rows * 0.986, base = positions.length / 3;
    for (let j = 0; j <= steps; j++) {
      const z = -0.5 + j / steps;
      for (let k = 0; k <= arc; k++) {
        const a = k / arc * Math.PI, xx = x + Math.cos(a) * 0.0022;
        positions.push(xx, heightAt(x, z) + 0.004 + Math.sin(a) * 0.012, z);
        uv.push(row / rows, j / steps);
        if (j < steps && k < arc) {
          const i = base + j * (arc + 1) + k;
          indices.push(i, i + arc + 1, i + 1, i + 1, i + arc + 1, i + arc + 2);
        }
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(indices); g.computeVertexNormals(); return g;
}
const gablePanelGeometry = new THREE.BufferGeometry();
gablePanelGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
  0, 0, -0.5, 0, 0, 0.5, 0, 1, 0,
  0.06, 0, -0.5, 0.06, 1, 0, 0.06, 0, 0.5,
  0, 0, -0.5, 0, 1, 0, 0.06, 0, -0.5, 0, 1, 0, 0.06, 1, 0, 0.06, 0, -0.5,
  0, 0, 0.5, 0.06, 0, 0.5, 0, 1, 0, 0, 1, 0, 0.06, 0, 0.5, 0.06, 1, 0,
], 3));
gablePanelGeometry.computeVertexNormals();
const finialGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.16, 0.22, 0),
  new THREE.Vector3(0.26, 0.48, 0), new THREE.Vector3(0.12, 0.72, 0), new THREE.Vector3(-0.12, 0.8, 0),
]), 8, 0.12, 5, false);

const B = {
  ...CityBotany.batches,
  gold: new Batch(UNIT_SPHERE, MAT.gold, {maxDistance:130,cast:false}),
  plaster: new Batch(UNIT_BOX, MAT.plaster),
  plasterWarm: new Batch(UNIT_BOX, MAT.plasterWarm),
  wood: new Batch(UNIT_BOX, MAT.wood, { maxDistance: 230, cast: false }),
  red: new Batch(UNIT_BOX, MAT.red),
  stone: new Batch(UNIT_BOX, MAT.stone),
  dark: new Batch(UNIT_BOX, MAT.dark, { maxDistance: 280, cast: false }),
  columns: new Batch(UNIT_CYL, MAT.red),
  roof: new Batch(ROOF_UNIT, MAT.roof),
  roofSmall: new Batch(ROOF_SMALL, MAT.roof),
  roofGold: new Batch(ROOF_UNIT, MAT.roofGlazed),
  roofGable: new Batch(tangHipGableGeometry(), MAT.roofGlazed),
  roofCoverHip: new Batch(roofCoverTilesGeometry(), MAT.roof, { maxDistance: 85, cast: false }),
  roofCoverGable: new Batch(roofCoverTilesGeometry(true), MAT.roofGlazed, { maxDistance: 100, cast: false }),
  gablePanel: new Batch(gablePanelGeometry, MAT.wood),
  finial: new Batch(finialGeometry, MAT.dark),
  trunk: new Batch(UNIT_CYL, MAT.trunk),
  leaf: new Batch(new THREE.IcosahedronGeometry(0.5, 1), MAT.leaf, { farGeometry: new THREE.IcosahedronGeometry(0.5, 0), nearDistance: 155 }),
  blossom: new Batch(new THREE.IcosahedronGeometry(0.5, 1), MAT.blossom, { farGeometry: new THREE.IcosahedronGeometry(0.5, 0), nearDistance: 155 }),
  lantern: new Batch(new THREE.SphereGeometry(0.5, 10, 8), MAT.lantern),
  lanternCap: new Batch(UNIT_CYL, MAT.gold),
  vines: new Batch(UNIT_CYL, MAT.leaf, { maxDistance: 170, cast: false }),
  window: new Batch(UNIT_PLANE, MAT.window, { cast: false }),
  trim: new Batch(new THREE.BoxGeometry(1, 1, 1), MAT.wood, { maxDistance: 200, cast: false }),
  doorStuds: new Batch(new THREE.IcosahedronGeometry(.5,0), MAT.gold, {maxDistance:45,cast:false}),
  pottery: new Batch(new THREE.LatheGeometry([new THREE.Vector2(.24,0),new THREE.Vector2(.38,.12),new THREE.Vector2(.46,.52),new THREE.Vector2(.3,.8),new THREE.Vector2(.24,.85),new THREE.Vector2(.26,.94),new THREE.Vector2(.2,.94),new THREE.Vector2(.19,.78)],24),MAT.plasterWarm,{maxDistance:140,cast:false}),
  produce: new Batch(new THREE.IcosahedronGeometry(0.5, 0), MAT.plasterWarm, { maxDistance: 140, cast: false }),
  basket: new Batch(new THREE.CylinderGeometry(.5,.42,1,24),MAT.wood,{maxDistance:140,cast:false}),
  cartWheel: new Batch(new THREE.TorusGeometry(0.5, 0.065, 5, 12), MAT.dark),
};

const NOISE_COLORS = {
  plaster: [0xf0dfc0, 0xe6d2ad, 0xf5e8cd, 0xdcc4a0],
  wood: [0x9e3823, 0xb84428, 0x863020, 0xc4542e],
  red: [0xb04836, 0x9e3d2e, 0xbd563c, 0x90362a],
  stone: [0xd4c6ac, 0xc4b89e, 0xe2d4b8, 0xb8ad94],
  roof: [0x455a58, 0x506864, 0x3c5050, 0x5e7068, 0x425654],
  roofGold: [0x4e6860, 0x5e7668, 0x405a58],
  leaf: [0x6e944e, 0x5e8244, 0x84a45c, 0x4c703e],
  blossom: [0xe49ca6, 0xd68292, 0xeec0c6, 0xd08494],
};

function pickColor(kind) { return pick(NOISE_COLORS[kind] || NOISE_COLORS.plaster); }

function addHall(x, z, w, d, opt = {}) {
  const { h = 6.2, roofH = 4.1, ry = 0, platform = 0.55, colorKind = 'plaster',
    roofKind = 'roof', columns = true, doors = true, windows = false, redWall = false,
    collider = false, glow = false, simple = false, openFront = false } = opt;
  const cos = Math.cos(ry), sin = Math.sin(ry);
  const px = (lx, lz) => x + lx * cos + lz * sin;
  const pz = (lx, lz) => z - lx * sin + lz * cos;
  if (opt.upperStorey) B.wood.add(x, platform - 0.1, z, w + .4, .2, d + .4, ry, 0x885637);
  else B.stone.add(x, platform / 2, z, w + 2.4, platform, d + 2.4, ry, pickColor('stone'));
  const wallY = platform + h / 2;
  const wallTint = redWall ? 0xb94e41 : pickColor(colorKind);
  if (openFront) {
    const wall = (lx, lz, sw, sd) => {
      const wx = px(lx, lz), wz = pz(lx, lz);
      B.plaster.add(wx, wallY, wz, sw, h, sd, ry, wallTint);
    };
    wall(0, -d / 2 + 0.18, w, 0.36);
    for (const side of [-1, 1]) wall(side * (w / 2 - 0.18), 0, 0.36, d);
    B.wood.add(x, platform + 0.025, z, w - 0.6, 0.05, d - 0.6, ry, 0xc19a6d);
    if (h > 6) {
      B.wood.add(x, platform + 3.6, z, w - 0.4, 0.2, d - 0.4, ry, 0x8f6545);
      const upperFront = d / 2 - .18 - (opt.galleryDepth || 0);
      B.plaster.add(px(0, upperFront), platform + (h + 3.75) / 2, pz(0, upperFront), w, h - 3.75, 0.36, ry, wallTint);
    }
  } else B.plaster.add(x, wallY, z, w, h, d, ry, wallTint);
  if (columns) {
    let n = Math.max(3, Math.round(w / 4.4));
    for (let i = 0; i <= n; i++) {
      const lx = -w / 2 + (w / n) * i;
      const cx = px(lx, d / 2 + 0.28), cz = pz(lx, d / 2 + 0.28);
      B.columns.add(cx, platform + h / 2, cz, 0.42, h, 0.42, ry, 0xbe4b3e);
      const bx = px(lx, -d / 2 - 0.28), bz = pz(lx, -d / 2 - 0.28);
      B.columns.add(bx, platform + h / 2, bz, 0.38, h, 0.38, ry, 0xb7473b);
    }
    const beamY = platform + h - 0.45;
    B.red.add(px(0, d / 2 + 0.32), beamY, pz(0, d / 2 + 0.32), w + 0.8, 0.55, 0.5, ry, 0xa94237);
  }
  if (doors) {
    const doorW = Math.min(w * 0.62, 7), doorH = Math.min(h * 0.68, 4.4);
    B.dark.add(px(0, d/2 + 0.38), platform + doorH / 2, pz(0, d/2 + 0.38), doorW, doorH, 0.18, ry, 0x4b3022);
  }
  const eave = platform + h - 0.05;
  const batch = roofKind === 'gold' ? B.roofGold : B.roof;
  const roofColor = roofKind === 'gold' ? pickColor('roofGold') : pickColor('roof');
  batch.add(x, eave, z, w + 3.4, roofH, d + 3.4, ry, roofColor);
  B.dark.add(px(0, 0), eave + roofH * 0.93, pz(0, 0), w * 0.72, 0.4, 0.55, ry, 0x35423f);
  for (const side of [-1, 1]) {
    B.dark.add(px(side * w * 0.36, 0), eave + roofH * 0.99, pz(side * w * 0.36, 0), 0.45, 0.9, 0.45, ry, 0x35423f);
  }
  if (collider) addCollider(x - w/2, x + w/2, z - d/2, z + d/2, 'hall');
  return { x, z, w, d, h, eave, ry };
}

function addPavilion(x, z, r = 5, opt = {}) {
  const { h = 3.2, roofH = 3.2, ry = 0, platform = 0.4, roofKind = 'roof' } = opt;
  const c = Math.cos(ry), s = Math.sin(ry), sideLength = r * 2 + 1.2;
  const pos = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  const put = (batch, lx, y, lz, sw, sh, sd, tint) => {
    const [wx, wz] = pos(lx, lz); batch.add(wx, y, wz, sw, sh, sd, ry, tint);
  };
  put(B.stone, 0, platform / 2, 0, sideLength, platform, sideLength, 0xd7cbb4);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const lx = sx * r * 0.82, lz = sz * r * 0.82;
    put(B.stone, lx, platform + 0.1, lz, 0.6, 0.2, 0.6, 0xdacdb7);
    put(B.columns, lx, platform + h / 2, lz, 0.36, h, 0.36, 0x9c4236);
    put(B.trim, lx, platform + h - 0.44, lz, 0.8, 0.2, 0.7, 0xa26b43);
  }
  const batch = roofKind === 'gold' ? B.roofGold : B.roof;
  batch.add(x, platform + h, z, r * 2.25, roofH, r * 2.25, ry, roofKind === 'gold' ? pickColor('roofGold') : pickColor('roof'));
  put(B.dark, 0, platform + h + roofH * 0.95, 0, r * 1.2, 0.22, 0.26, 0x4d5c54);
}

function addCorridor(x1, z1, x2, z2, opt = {}) {
  const { w = 4.2, h = 3.6, floor = 0.24 } = opt;
  const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz), ang = Math.atan2(dx, dz);
  if (len < 0.1) return;
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
  B.stone.add(cx, floor / 2, cz, w, floor, len, ang, 0xd2c7ae);
  B.roofSmall.add(cx, floor + h, cz, len + 1.0, 1.7, w + 2.2, ang + Math.PI / 2, pickColor('roof'));
  const n = Math.max(2, Math.ceil(len / 5.2));
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = lerp(x1, x2, t), z = lerp(z1, z2, t);
    for (const side of [-1, 1]) {
      B.columns.add(x, floor + h / 2, z, 0.3, h, 0.3, ang, 0xa54838);
    }
  }
}

function addTree(x, z, kind = 'willow', s = 1) {
  if (TREE_CLEAR_AREAS.some(a => x > a.x0 && x < a.x1 && z > a.z0 && z < a.z1)) return;
  const botanical = B['botany' + kind];
  if (botanical) {
    const y = groundHeightAt(x, z), yaw = rr(0, TAU);
    botanical.add(x, y, z, s, s, s, yaw);
    addCollider(x - .2 * s, x + .2 * s, z - .2 * s, z + .2 * s, 'tree-trunk');
  }
}

function addLantern(x, y, z, s = 1) {
  B.lantern.add(x, y, z, 0.55 * s, 0.75 * s, 0.55 * s, 0, 0xdf5a43);
  B.lanternCap.add(x, y + 0.4 * s, z, 0.24 * s, 0.1 * s, 0.24 * s, 0, 0xd9aa4b);
  B.lanternCap.add(x, y - 0.4 * s, z, 0.2 * s, 0.08 * s, 0.2 * s, 0, 0xd9aa4b);
  lanternPositions.push(new THREE.Vector3(x, y, z));
}
const lanternPositions = [];

function buildWards() {
  for (const w of wards) {
    addWardWalls(w);
    addCompound(w.x, w.z, w.w * 0.7, w.d * 0.7, 0, false);
  }
}

function addWardWalls(w) {
  const { x, z, w: ww, d, name } = w;
  const halfW = ww / 2, halfD = d / 2, h = 2.2, t = 0.5, gate = 11;
  const wallColor = pickColor('plaster');
  const wall = (cx, cz, sx, sz) => {
    B.plaster.add(cx, h / 2, cz, sx, h, sz, 0, wallColor);
    B.red.add(cx, h - 0.18, cz, sx + 0.06, 0.2, sz + 0.06, 0, 0xb5543e);
    B.dark.add(cx, h + 0.12, cz, sx + 0.3, 0.22, sz + 0.3, 0, 0x4e615c);
  };
  for (const side of [-1, 1]) {
    const len = (ww - gate) / 2;
    wall(x - (gate + len) / 2, z + side * halfD, len, t);
    wall(x + (gate + len) / 2, z + side * halfD, len, t);
    B.roofSmall.add(x, 4.35, z + side * halfD, gate + 3, 1.9, 4.6, 0, 0x526560);
  }
  for (const side of [-1, 1]) {
    const len = (d - gate) / 2;
    wall(x + side * halfW, z - (gate + len) / 2, t, len);
    wall(x + side * halfW, z + (gate + len) / 2, t, len);
    B.roofSmall.add(x + side * halfW, 4.35, z, 4.6, 1.9, gate + 3, 0, 0x526560);
  }
}

function addCompound(x, z, w, d, ry = 0, simple = false) {
  const hw = w / 2, hd = d / 2;
  const wallH = 1.8, t = 0.42;
  for (const side of [-1, 1]) {
    B.plaster.add(x, wallH / 2, z + side * hd, w, wallH, t, ry, pickColor('plaster'));
    B.plaster.add(x + side * hw, wallH / 2, z, t, wallH, d, ry, pickColor('plaster'));
    B.dark.add(x, wallH + 0.1, z + side * hd, w + 0.2, 0.2, t + 0.2, ry, 0x4d5a54);
  }
  addHall(x, z - d * 0.18, w * 0.62, d * 0.38, { h: 4.6, roofH: 3.2, ry, simple, collider: false, doors: true, columns: !simple });
  if (!simple) {
    addHall(x - w * 0.31, z + d * 0.12, w * 0.26, d * 0.42, { h: 3.6, roofH: 2.5, ry, simple: true, doors: false, columns: false });
    addHall(x + w * 0.31, z + d * 0.12, w * 0.26, d * 0.42, { h: 3.6, roofH: 2.5, ry, simple: true, doors: false, columns: false });
  }
  B.roofSmall.add(x, 3.3, z + hd + 0.28, 4.2 + 2, 1.4, 3, ry, 0x6c8077);
  addTree(x + hw * 0.66, z + hd * 0.5, 'peach', 0.75);
}

function buildMarket(cx, cz, w, d, name, east = false) {
  const halfW = w / 2, halfD = d / 2, wallH = 3.0;
  const gate = 18;
  for (const side of [-1, 1]) {
    const len = (w - gate) / 2;
    B.plaster.add(cx - (gate + len) / 2, wallH / 2, cz + side * halfD, len, wallH, 0.7, 0, 0xeadcc2);
    B.plaster.add(cx + (gate + len) / 2, wallH / 2, cz + side * halfD, len, wallH, 0.7, 0, 0xf2e4c9);
    B.dark.add(cx, wallH + 0.12, cz + side * halfD, w, 0.25, 1.0, 0, 0x4c5a55);
  }
  for (const side of [-1, 1]) {
    const len = (d - gate) / 2;
    B.plaster.add(cx + side * halfW, wallH / 2, cz - (gate + len) / 2, 0.7, wallH, len, 0, 0xe8d8bd);
    B.plaster.add(cx + side * halfW, wallH / 2, cz + (gate + len) / 2, 0.7, wallH, len, 0, 0xf4e6cb);
  }
  for (const side of [-1, 1]) {
    B.roofSmall.add(cx, 4.7, cz + side * halfD, gate + 4, 2.4, 5.5, 0, 0x6b7f76);
  }
  const names = east ? ['珠玉行', '绫锦行', '乐器行', '书肆', '茶坊', '金银行'] : ['胡姬酒肆', '波斯邸', '香药铺', '胡饼铺', '骆驼店', '酒家'];
  const shopW = 17, shopD = 13;
  const offsets = [-0.32, -0.1, 0.13, 0.35];
  for (let i = 0; i < 4; i++) {
    addHall(cx + offsets[i] * w, cz - halfD + 10, shopW, shopD, { h: 5, roofH: 3, ry: 0, collider: true });
    addHall(cx + offsets[i] * w, cz + halfD - 10, shopW, shopD, { h: 5, roofH: 3, ry: Math.PI, collider: true });
  }
  addPavilion(cx, cz, 5.6, { h: 4.0, roofH: 3.4, roofKind: 'gold' });
  B.wood.add(cx, 1.5, cz, 7.5, 3, 7.5, 0, 0x7b4b31);
  landmarks.push({ id: east ? 'east-market' : 'west-market', name, x: cx, z: cz, radius: Math.max(w, d) * 0.5,
    poem: east ? '东市买骏马，西市买鞍鞯' : '胡姬貌如花，当垆笑春风',
    desc: east ? '四方珍奇，皆所积集。' : '波斯邸、胡姬酒肆，西域风物汇于一处。' });
}

function addCityWalls() {
  const h = 10.5, t = 6.5;
  const wallMat = SurfaceLibrary.rammedEarth();
  const wall = (x, z, w, d) => {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geometry, wallMat);
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = mesh.receiveShadow = true;
    scene.add(mesh);
    addCollider(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 'citywall');
    flightObstacles.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, top: h + 1.4 });
  };
  const gateS = 62;
  wall(-CITY.x1 / 2 - gateS / 4, CITY.z1, CITY.x1 - gateS / 2, t);
  wall(CITY.x1 / 2 + gateS / 4, CITY.z1, CITY.x1 - gateS / 2, t);
  wall(-233.5, CITY.z0, 433, t);
  wall(70, CITY.z0, 106, t);
  wall(313.5, CITY.z0, 273, t);
  wall(CITY.x1, -171, t, 418);
  wall(CITY.x1, 226, t, 308);
  wall(CITY.x0, -171, t, 418);
  wall(CITY.x0, 226, t, 308);
  for (let x = -444; x <= 444; x += 6) {
    for (const z of [CITY.z0, CITY.z1]) {
      if (z === CITY.z1 && Math.abs(x) < 32) continue;
      if (z === CITY.z0 && (Math.abs(x) < 18 || Math.abs(x - 150) < 28)) continue;
      B.stone.add(x, h + 0.7, z, 2.2, 1.4, 1.0, 0, 0xbfae8e);
    }
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * CITY.x1, z = sz * CITY.z1;
    B.stone.add(x, 6, z, 18, 12, 18, 0, 0xe2cda9);
    addPavilion(x, z, 6.5, { h: 5.5, roofH: 4.0, platform: 12.1, roofKind: 'gold' });
  }
  addGateHouse(0, CITY.z1, 62, 20, 12, 5, '明德门', true);
  landmarks.push({ id: 'mingde', name: '明德门', x: 0, z: CITY.z1 - 12, radius: 38,
    poem: '百千家似围棋局，十二街如种菜畦',
    desc: '长安外郭城正南门，五门洞并列，是朱雀大街的起点。' });
  addGateHouse(0, CITY.z0, 34, 16, 10, 3, '玄武门', false);
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
  }
  const passageH = Math.min(8.4, h * .72);
  B.stone.add(x, (passageH + h) / 2, z, w, h - passageH, d, 0, 0xe7d1ad);
  B.stone.add(x, h + 0.2, z, w, 0.5, d, ry, 0xd8c4a3);
  B.red.add(x, h + 3.2, z, w + 4, 5.4, d + 3, ry, 0xa94538);
  B.roofGable.add(x, h + 5.9, z, w + 7, grand ? 5.6 : 4.2, d + 7, ry, pickColor('roof'));
  B.dark.add(x, h + (grand ? 11.1 : 9.8), z, w * 0.72, 0.5, 0.65, ry, 0x35423f);
  addSignMesh(name, x, h + 2.6, z + (side ? 0 : d / 2 + 1.7), side && x < 0 ? -Math.PI / 2 : ry, 7.5, 2.3, { font: 68 });
  for (const off of [-0.36, 0.36]) {
    if (side) addLantern(x + Math.sign(x) * (d / 2 + 1), h + 1.6, z + off * w, 1.25);
    else addLantern(x + off * w, h + 1.6, z + (z > 0 ? d / 2 + 1 : -d / 2 - 1), 1.25);
  }
}

function buildStreetLife() {
  for (let z = -195; z <= 360; z += 24) {
    for (const x of [-20.5, 20.5]) {
      if (Math.abs(z) < 20 || Math.abs(z - 55) < 12 || Math.abs(z - 232) < 12) continue;
      if (z < 245) addTree(x, z, 'willow', rr(0.85, 1.1));
    }
  }
  for (let z = -190; z <= 360; z += 36) {
    for (const x of [-12.1, 12.1]) {
      B.wood.add(x, 2.1, z, 0.3, 4.2, 0.3, 0, 0x6d452e);
      addLantern(x, 3.7, z, 0.9);
    }
  }
  for (const [z, label] of [[286, '天街'], [170, '朱雀'], [54, '长安'], [-70, '春风']]) {
    for (const side of [-1, 1]) {
      const x = side * 12.35;
      B.stone.add(x, 0.45, z, 1.5, 0.9, 1.5, 0, 0xe6cfaa);
      B.wood.add(x, 4.7, z, 0.7, 8.5, 0.7, 0, 0xa83226);
    }
    B.red.add(0, 8.45, z, 28, 0.62, 0.78, 0, 0xb7503a);
    B.roofSmall.add(0, 8.98, z, 31, 2.1, 4.2, 0, 0x4d625e);
    addSignMesh(label, 0, 6.95, z + 0.43, 0, 6.4, 1.9, { bg: '#a92e25', fg: '#ffe7a6', font: 72 });
    addLantern(0, 6.75, z + 0.5, 1.15);
  }
  addHall(-90, 196, 30, 22, { h: 7, roofH: 4, collider: true, columns: true, colorKind: 'plaster' });
  addHall(90, 196, 30, 22, { h: 7, roofH: 4, collider: true, columns: true, colorKind: 'plaster' });
  addSignMesh('长安县署', -90, 8.2, 208, 0, 9, 2.3, { font: 62 });
  addSignMesh('万年县署', 90, 8.2, 208, 0, 9, 2.3, { font: 62 });
}
