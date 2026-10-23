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

// A true hip-and-gable roof for the major halls: a low hipped skirt and a
// separate upper pitched roof leave the timber gable faces visible from either end.
function tangHipGableGeometry() {
  const vertices = [], uvs = [], indices = [];
  function quad(a, b, c, d) {
    const i = vertices.length / 3;
    for (const p of [a, b, c, d]) { vertices.push(...p); uvs.push(p[0] + 0.5, p[2] + 0.5); }
    indices.push(i, i + 2, i + 1, i + 1, i + 2, i + 3);
  }
  for (const side of [-1, 1]) {
    // The skirt is segmented into curved strips; outer tile edge has only a slight lift.
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

// Half-round cover tiles follow the roof curve rather than a flat normal map.
// A shared normalized mesh supplies the near-view silhouette of important roofs.
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

function shopClothGeometry() {
  const p = [], uv = [], ix = [], across = 12, out = 4;
  for (let j = 0; j <= out; j++) for (let i = 0; i <= across; i++) {
    const u = i / across, v = j / out;
    p.push(u - 0.5, 0.35 - v * 0.5 - Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * 0.18, v - 0.5);
    uv.push(u, v * 0.8);
    if (i < across && j < out) {
      const a = j * (across + 1) + i, b = a + across + 1;
      ix.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  // Scalloped hanging cloth valance gives the canopy a visible fabric edge.
  for (let i = 0; i <= across; i++) {
    const u = i / across, a = p.length / 3;
    p.push(u - 0.5, -0.15, 0.5, u - 0.5, -0.55 - (i % 2) * 0.16, 0.5);
    uv.push(u, 0.8, u, 1);
    if (i < across) ix.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(ix); g.computeVertexNormals(); return g;
}
const SHOP_CLOTH_GEOMETRY = shopClothGeometry();

// Shared solid timber lattice: openings, mullions and frame all have depth.
// This is an artistic geometric screen, not a claimed Tang excavation replica.
function shopLatticeGeometry() {
  const p = [], n = [], uv = [];
  const bar = (x, y, w, h, depth = .075) => {
    const g = new THREE.BoxGeometry(w, h, depth).translate(x, y, 0);
    const flat = g.toNonIndexed();
    p.push(...flat.attributes.position.array); n.push(...flat.attributes.normal.array);
    uv.push(...flat.attributes.uv.array); g.dispose(); flat.dispose();
  };
  for (const side of [-1, 1]) { bar(side * .475, 0, .05, 1); bar(0, side * .475, .9, .05); }
  for (let i = -3; i <= 3; i++) bar(i * .115, 0, .023, .9, .052);
  for (const y of [-.27, 0, .27]) bar(0, y, .9, .023, .065);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return g;
}

function stallClothGeometry() {
  const p=[],uv=[],ix=[],across=12,out=8;
  for(let j=0;j<=out;j++) for(let i=0;i<=across;i++) {
    const u=i/across,v=j/out;
    p.push(u-.5,.42*(1-Math.abs(v-.5)*2)-Math.sin(u*Math.PI)*.07,v-.5);uv.push(u,v*.8);
    if(i<across&&j<out){const a=j*(across+1)+i,b=a+across+1;ix.push(a,b,a+1,a+1,b,b+1);}
  }
  for(const side of [-1,1]) for(let i=0;i<=across;i++) {
    const u=i/across,a=p.length/3;
    p.push(u-.5,-Math.sin(u*Math.PI)*.07,side*.5,u-.5,-.22-(i%2)*.055,side*.5);
    uv.push(u,.8,u,1);if(i<across)ix.push(a,a+1,a+2,a+1,a+3,a+2);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
const STALL_CLOTH_GEOMETRY=stallClothGeometry();

// Adapted from miniLibs TouShape.CreateOriginSolid, NiTaoKungData and
// Utils.CreateCutSolid: Copyright (c) 2023 EMPTY, MIT; see vendor/miniLibs-LICENSE.txt.
// The source's Song module proportions inform this artistic Tang/Song-inspired
// bracket asset; this is not an archaeological reconstruction or the Rhino runtime.
function miniLibsBracketGeometry() {
  const positions = [], normals = [], uv = [], unit = 0.019;
  function append(geo, x = 0, y = 0, z = 0, ry = 0) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.rotateY(ry); g.translate(x, y, z); g.computeVertexNormals();
    const p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      positions.push(p.getX(i) * unit, p.getY(i) * unit, p.getZ(i) * unit);
      normals.push(n.getX(i), n.getY(i), n.getZ(i));
      uv.push(p.getX(i) * 0.04, p.getY(i) * 0.04);
    }
    g.dispose();
  }
  // miniLibs' rectangular loft: Lower=.4H, Middle=.2H, Upper=.4H,
  // InnerOffset=.05H, with .4H shaved from each lower rectangle dimension.
  function tou(length, width, height, x, y, z, notched = false) {
    const rings = [
      [0, length - 0.4 * height, width - 0.4 * height],
      [0.2 * height, length - 0.3 * height, width - 0.3 * height],
      [0.4 * height, length, width], [0.6 * height, length, width],
    ];
    if (!notched) rings.push([height, length, width]);
    const v = [], ind = [];
    rings.forEach(([h, l, w]) => v.push(-l / 2, h, -w / 2, l / 2, h, -w / 2, l / 2, h, w / 2, -l / 2, h, w / 2));
    for (let i = 0; i < rings.length - 1; i++) for (let side = 0; side < 4; side++) {
      const a = i * 4 + side, b = i * 4 + (side + 1) % 4, c = a + 4, d = b + 4;
      ind.push(a, c, b, b, c, d);
    }
    const top = (rings.length - 1) * 4;
    ind.push(0, 1, 2, 0, 2, 3, top, top + 2, top + 1, top, top + 3, top + 2);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(ind); append(g, x, y, z); g.dispose();
    if (notched) {
      // The top is a cross seat: four ears remain around two width-10-fen channels.
      const earX = (length - 10) / 2, earZ = (width - 10) / 2;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const ear = new THREE.BoxGeometry(earX, height * 0.4, earZ);
        append(ear, x + sx * (5 + earX / 2), y + height * 0.8, z + sz * (5 + earZ / 2)); ear.dispose();
      }
    }
  }
  // miniLibs forms the juansha cutter from the Boolean union of four triangles.
  // Evaluating that union's upper envelope gives the same sculpted beam underside
  // without bundling a CAD Boolean engine in the game.
  function cutHeight(distance, fullLength = 14, height = 9, cuts = 4) {
    let y = 0;
    for (let i = 1; i <= cuts; i++) {
      const reach = fullLength * i / cuts;
      if (distance <= reach) y = Math.max(y, (cuts + 1 - i) * height / cuts * (1 - distance / reach));
    }
    return y;
  }
  function kung(halfLength, baseY, ry) {
    const shape = new THREE.Shape();
    shape.moveTo(-halfLength, 21); shape.lineTo(-4, 21);
    shape.lineTo(-4, 5); shape.lineTo(4, 5); shape.lineTo(4, 21); shape.lineTo(halfLength, 21);
    const breaks = [0, 14];
    for (let i = 1; i <= 4; i++) for (let j = i + 1; j <= 4; j++) {
      const hi = (5 - i) * 9 / 4, hj = (5 - j) * 9 / 4, ri = 14 * i / 4, rj = 14 * j / 4;
      const distance = (hi - hj) / (hi / ri - hj / rj);
      if (distance >= 0 && distance <= Math.min(ri, rj) && Math.abs(cutHeight(distance) - hi * (1 - distance / ri)) < 0.0001) breaks.push(distance);
    }
    breaks.sort((a, b) => a - b);
    const lowerXs = [...breaks.map(d => halfLength - d), 0, ...breaks.slice().reverse().map(d => -halfLength + d)];
    for (const x of lowerXs) shape.lineTo(x, cutHeight(halfLength - Math.abs(x)));
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 10, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.55, bevelThickness: 0.55, curveSegments: 1, steps: 1 });
    g.translate(0, 0, -5); append(g, 0, baseY, 0, ry); g.dispose();
  }
  tou(32, 32, 20, 0, 0, 0, true); // LuTouData 32:32:20
  kung(31, 12, 0);               // NiTaoKungData half span31, width10, enough-size21
  kung(36, 29, Math.PI / 2);     // 30-fen projection + half the12-fen end seat
  for (const side of [-1, 1]) {
    tou(14, 16, 10, side * 25, 33, 0); // ShanTouData 14:16:10
    tou(14, 16, 10, 0, 50, side * 30);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeBoundingBox(); g.computeBoundingSphere(); return g;
}

const POTTERY_PROFILE=[
  new THREE.Vector2(.24,0),new THREE.Vector2(.38,.12),new THREE.Vector2(.46,.52),new THREE.Vector2(.3,.8),
  new THREE.Vector2(.24,.85),new THREE.Vector2(.26,.94),new THREE.Vector2(.2,.94),new THREE.Vector2(.19,.78),
];
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
  dougong: new Batch(miniLibsBracketGeometry(), MAT.wood, { maxDistance: 220, cast: false }),
  trunk: new Batch(UNIT_CYL, MAT.trunk),
  leaf: new Batch(new THREE.IcosahedronGeometry(0.5, 1), MAT.leaf, { farGeometry: new THREE.IcosahedronGeometry(0.5, 0), nearDistance: 155 }),
  blossom: new Batch(new THREE.IcosahedronGeometry(0.5, 1), MAT.blossom, { farGeometry: new THREE.IcosahedronGeometry(0.5, 0), nearDistance: 155 }),
  lantern: new Batch(new THREE.SphereGeometry(0.5, 10, 8), MAT.lantern),
  lanternCap: new Batch(UNIT_CYL, MAT.gold),
  vines: new Batch(UNIT_CYL, MAT.leaf, { maxDistance: 170, cast: false }),
  window: new Batch(UNIT_PLANE, MAT.window, { cast: false }),
  // Street-scale repeated details use simple geometry, shared materials and spatial batches.
  trim: new Batch(new THREE.BoxGeometry(1, 1, 1), MAT.wood, { maxDistance: 200, cast: false }),
  galleryScreens: new Batch(shopLatticeGeometry(), MAT.wood, { maxDistance: 85, cellSize: 48, cast: false }),
  galleryDeck: new Batch(UNIT_BOX, MAT.wood, { maxDistance: 85, cellSize: 48, cast: false }),
  galleryBrackets: new Batch(miniLibsBracketGeometry(), MAT.wood, { maxDistance: 100, cellSize: 48, cast: false }),
  tileEnds: new Batch(new THREE.CylinderGeometry(0.5, 0.5, 1, 8).rotateX(Math.PI / 2), MAT.dark, { maxDistance: 80, cast: false }),
  doorStuds: new Batch(new THREE.IcosahedronGeometry(.5,0), MAT.gold, {maxDistance:45,cast:false}),
  pottery: new Batch(new THREE.LatheGeometry(POTTERY_PROFILE,24),MAT.plasterWarm,{maxDistance:140,cast:false,
    farGeometry:new THREE.LatheGeometry(POTTERY_PROFILE,10),nearDistance:45,cellSize:64}),
  produce: new Batch(new THREE.IcosahedronGeometry(0.5, 0), MAT.plasterWarm, { maxDistance: 140, cast: false }),
  basket: new Batch(new THREE.CylinderGeometry(.5,.42,1,24),MAT.wood,{maxDistance:140,cast:false,
    farGeometry:new THREE.CylinderGeometry(.5,.42,1,10),nearDistance:40,cellSize:64}),
  fabricRoll:new Batch(new THREE.CylinderGeometry(.5,.5,1,24),SurfaceLibrary.cloth(0xffffff),{maxDistance:110,cast:false,
    farGeometry:new THREE.CylinderGeometry(.5,.5,1,10),nearDistance:40,cellSize:64}),
  cartWheel: new Batch(new THREE.TorusGeometry(0.5, 0.065, 5, 12), MAT.dark),
};

const NOISE_COLORS = {
  plaster: [0xf2e3c9, 0xe9d7b8, 0xf5ead5, 0xdfc9aa],
  wood: [0xa43f2a, 0xba4b2e, 0x8b3524, 0xc05b32],
  red: [0xb9513d, 0xa94434, 0xc26143, 0x983b30],
  stone: [0xd9ccb4, 0xcbbfa7, 0xe7dac1, 0xbeb49e],
  roof: [0x495b5b, 0x536765, 0x405255, 0x61716a, 0x465a58],
  roofGold: [0x526b66, 0x61786d, 0x455e5c],
  leaf: [0x789b54, 0x65894b, 0x8da963, 0x527843],
  blossom: [0xe8a5ae, 0xdb8a9a, 0xf2bcc2, 0xd58c9b],
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
    ctx.font = `700 ${Math.min(42, cw / (name.length + 0.7))}px "Ma Shan Zheng","STKaiti","KaiTi","Kaiti SC","Songti SC",serif`;
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
      ctx.font = `700 ${font}px "Ma Shan Zheng","STKaiti","KaiTi","Kaiti SC",serif`;
      [...text].forEach((ch, i, arr) => ctx.fillText(ch, w / 2, h / 2 + (i - (arr.length - 1) / 2) * font * 1.08));
    } else {
      ctx.font = `700 ${font}px "Ma Shan Zheng","STKaiti","KaiTi","Kaiti SC",serif`;
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
const innerMarketShops = [];
function addHall(x, z, w, d, opt = {}) {
  const {
    h = 6.2, roofH = 4.1, ry = 0, platform = 0.55, colorKind = 'plaster',
    roofKind = 'roof', columns = true, doors = true, windows = false, redWall = false,
    collider = false, gateSide = 1, glow = false, simple = false, openFront = false,
  } = opt;
  if (w >= 10) hallDetails.push({ x, z, w, d, h, platform, ry });
  const cos = Math.cos(ry), sin = Math.sin(ry);
  const px = (lx, lz) => x + lx * cos + lz * sin;
  const pz = (lx, lz) => z - lx * sin + lz * cos;
  const porch = roofKind === 'gold' && w >= 30 ? 2.2 : 0;
  const wallFront = d / 2 - porch;
  const groundPatch = (lx, lz, sw, sd, height) => {
    const cx = px(lx, lz), cz = pz(lx, lz);
    const hw = (Math.abs(sw * cos) + Math.abs(sd * sin)) / 2;
    const hd = (Math.abs(sd * cos) + Math.abs(sw * sin)) / 2;
    groundPatches.push({ x0: cx - hw, x1: cx + hw, z0: cz - hd, z1: cz + hd, height });
  };
  // 台基
  if (opt.upperStorey) B.wood.add(x, platform - 0.1, z, w + .4, .2, d + .4, ry, 0x885637);
  else B.stone.add(x, platform / 2, z, w + 2.4, platform, d + 2.4, ry, pickColor('stone'));
  if (!opt.upperStorey && platform <= 2.2) groundPatch(0, 0, w + 2.4, d + 2.4, platform);
  // 台阶（正面 +z）
  for (let i = 0; i < (opt.upperStorey ? 0 : 3); i++) {
    const sx = px(0, d / 2 + 1.8 + i * 0.45), sz = pz(0, d / 2 + 1.8 + i * 0.45);
    B.stone.add(sx, (platform * (3 - i)) / 8, sz, w * 0.36 - i * 0.4, platform * (3 - i) / 4, 1.4, ry, 0xd6cbb3);
    if (platform <= 2.2) groundPatch(0, d / 2 + 1.8 + i * 0.45, w * 0.36 - i * 0.4, 1.4, platform * (3 - i) / 4);
  }
  // 墙身
  const wallY = platform + h / 2;
  const wallTint = redWall ? 0xb94e41 : pickColor(colorKind);
  if (openFront) {
    // Ground-floor shops have genuine depth and an accessible open frontage.
    // Three thin walls replace the solid building-sized box.
    const wall = (lx, lz, sw, sd) => {
      const wx = px(lx, lz), wz = pz(lx, lz);
      B.plaster.add(wx, wallY, wz, sw, h, sd, ry, wallTint);
      if (collider) {
        const hw = (Math.abs(sw * cos) + Math.abs(sd * sin)) / 2;
        const hd = (Math.abs(sd * cos) + Math.abs(sw * sin)) / 2;
        addCollider(wx - hw, wx + hw, wz - hd, wz + hd, 'shop-wall');
      }
    };
    wall(0, -d / 2 + 0.18, w, 0.36);
    for (const side of [-1, 1]) wall(side * (w / 2 - 0.18), 0, 0.36, d);
    B.wood.add(x, platform + 0.025, z, w - 0.6, 0.05, d - 0.6, ry, 0xc19a6d);
    // A visible ceiling and upper front wall enclose the second floor.
    if (h > 6) {
      B.wood.add(x, platform + 3.6, z, w - 0.4, 0.2, d - 0.4, ry, 0x8f6545);
      const upperFront = d / 2 - .18 - (opt.galleryDepth || 0);
      B.plaster.add(px(0, upperFront), platform + (h + 3.75) / 2, pz(0, upperFront), w, h - 3.75, 0.36, ry, wallTint);
    }
  } else B.plaster.add(x, wallY, z, w, h, d - porch * 2, ry, wallTint);
  // 前后墙面木框
  if (columns) {
    let n = Math.max(3, Math.round(w / (porch ? 4.8 : 4.4)));
    if (porch && n % 2 === 0) n++;
    for (let i = 0; i <= n; i++) {
      const lx = -w / 2 + (w / n) * i;
      const cx = px(lx, d / 2 + 0.28), cz = pz(lx, d / 2 + 0.28);
      const diameter = porch ? 0.86 : 0.42;
      B.columns.add(cx, platform + h / 2, cz, diameter, h, diameter, ry, 0xbe4b3e);
      if (porch) addCollider(cx - diameter / 2, cx + diameter / 2, cz - diameter / 2, cz + diameter / 2, 'portico-column');
      if (i % 2 === 0) {
        const bx = px(lx, -d / 2 - 0.28), bz = pz(lx, -d / 2 - 0.28);
        B.columns.add(bx, platform + h / 2, bz, diameter * 0.92, h, diameter * 0.92, ry, 0xb7473b);
      }
    }
    // 额枋
    const beamY = platform + h - 0.45;
    B.red.add(px(0, d / 2 + 0.32), beamY, pz(0, d / 2 + 0.32), w + 0.8, 0.55, 0.5, ry, 0xa94237);
  }
  if (doors && !porch) {
    const doorW = Math.min(w * 0.62, 7), doorH = Math.min(h * 0.68, 4.4);
    B.dark.add(px(0, wallFront + 0.38), platform + doorH / 2, pz(0, wallFront + 0.38), doorW, doorH, 0.18, ry, 0x4b3022);
    for (let i = -1; i <= 1; i += 2) {
      B.gold = B.gold || new Batch(UNIT_SPHERE, MAT.gold);
      B.gold.add(px(i * 0.6, wallFront + 0.49), platform + doorH * 0.52, pz(i * 0.6, wallFront + 0.49), 0.16, 0.16, 0.16, ry, 0xd9b04d);
    }
  }
  if (windows && !porch) {
    for (const i of [-1, 1]) {
      const wx = px(i * w * 0.28, wallFront + 0.39), wz = pz(i * w * 0.28, wallFront + 0.39);
      B.window.add(wx, platform + h * 0.55, wz, w * 0.16, h * 0.3, 1, ry, null);
    }
  }
  // 屋顶
  const eave = platform + h - 0.05;
  const hipGable = roofKind === 'gold' && w >= 24 && opt.roofShape !== 'hip';
  const batch = hipGable ? B.roofGable : roofKind === 'gold' ? B.roofGold : B.roof;
  const roofColor = roofKind === 'gold' ? pickColor('roofGold') : pickColor('roof');
  batch.add(x, eave, z, w + 3.4, roofH, d + 3.4, ry, roofColor);
  addHallCraft(x, z, w, d, h, platform, roofH, ry, { simple, doors, windows, columns, hipGable, porch, royal: roofKind === 'gold' });
  // 正脊与鸱吻
  B.dark.add(px(0, 0), eave + roofH * 0.93, pz(0, 0), w * 0.72, 0.4, 0.55, ry, 0x35423f);
  for (const side of [-1, 1]) {
    B.dark.add(px(side * w * 0.36, 0), eave + roofH * 0.99, pz(side * w * 0.36, 0), 0.45, 0.9, 0.45, ry, 0x35423f);
  }
  if (collider && !openFront) {
    const halfW = Math.abs(w / 2 * cos) + Math.abs((d / 2 - porch) * sin);
    const halfD = Math.abs(w / 2 * sin) + Math.abs((d / 2 - porch) * cos);
    addCollider(x - halfW, x + halfW, z - halfD, z + halfD, 'hall');
  }
  return { x, z, w, d, h, eave, ry };
}

// Tang-inspired timber framing, tile ends and recessed door panels are actual geometry.
function addHallCraft(x, z, w, d, h, platform, roofH, ry, opt) {
  const c = Math.cos(ry), s = Math.sin(ry), eave = platform + h - 0.05;
  const put = (batch, lx, y, lz, sx, sy, sz, color, rx = 0) =>
    batch.add(x + lx * c + lz * s, y, z - lx * s + lz * c, sx, sy, sz, ry, color, rx);
  const roofW = w + 3.4, roofD = d + 3.4;
  const wallFront = d / 2 - (opt.porch || 0);
  const richBracket = opt.royal || opt.hipGable || (Math.abs(x) < 40 && z > 245 && z < 377 && h >= 6);
  if (richBracket || (w >= 24 && platform >= 6)) {
    (opt.hipGable ? B.roofCoverGable : B.roofCoverHip).add(x, eave, z, roofW, roofH, roofD, ry, opt.hipGable ? 0x697d70 : 0x61736a);
  }
  const fasciaN = Math.max(4, Math.ceil(roofW / 3));
  for (const side of [-1, 1]) {
    // Segmented fascia follows the gently lifted hip corners.
    for (let i = 0; i < fasciaN; i++) {
      const lx = -roofW / 2 + roofW * (i + 0.5) / fasciaN;
      const tx = Math.max(0, (Math.abs(lx) / roofW - 0.31) / 0.19);
      const y = eave + roofH * (0.055 + (opt.hipGable ? 0 : 0.0935 * tx ** 3));
      put(B.trim, lx, y - 0.13, side * roofD / 2, roofW / fasciaN + 0.04, 0.25, 0.2, 0x6e4c35);
    }
    const tiles = Math.max(10, Math.ceil(roofW / 0.72));
    for (let i = 0; i <= tiles; i++) {
      const lx = -roofW / 2 + roofW * i / tiles;
      const tx = Math.max(0, (Math.abs(lx) / roofW - 0.31) / 0.19);
      put(B.tileEnds, lx, eave + roofH * (0.055 + (opt.hipGable ? 0 : 0.0935 * tx ** 3)), side * (roofD / 2 + 0.035), 0.21, 0.23, 0.21, 0x758079);
    }
    put(B.trim, 0, eave - 0.12, side * (d / 2 + 0.45), w + 1.4, 0.24, 0.42, 0x87452f);
    if (opt.columns) {
      let n = Math.max(3, Math.round(w / (opt.porch ? 4.8 : 4.4)));
      if (opt.porch && n % 2 === 0) n++;
      for (let i = 0; i <= n; i++) {
        const lx = -w / 2 + w * i / n;
        const baseWidth = opt.porch ? 1.15 : 0.65;
        put(B.stone, lx, platform + 0.12, side * (d / 2 + 0.28), baseWidth, 0.24, baseWidth, 0xd7c9af);
        if (richBracket) {
          const scale = opt.hipGable ? 1.25 : 1;
          put(B.dougong, lx, eave - 1.14 * scale, side * (d / 2 + 0.42), scale * 1.15, scale, scale * 1.15, 0xa45e3b);
        } else {
        put(B.trim, lx, eave - 0.65, side * (d / 2 + 0.35), 0.72, 0.2, 0.65, 0x823f2e);
        put(B.trim, lx, eave - 0.39, side * (d / 2 + 0.5), opt.simple ? 1.05 : 1.55, 0.2, 0.9, 0xb06a44);
        if (!opt.simple && w >= 15) put(B.trim, lx, eave - 0.18, side * (d / 2 + 0.6), 1.9, 0.16, 1.25, 0x9d5839);
        }
      }
    }
  }
  if (opt.hipGable) {
    for (const side of [-1, 1]) {
      // Upper triangular panels sit just inside the overhanging roof sheets.
      put(B.gablePanel, side * roofW * 0.312, eave + roofH * 0.425, 0, 1, roofH * 0.555, roofD * 0.49, 0x914932);
      put(B.trim, side * roofW * 0.315, eave + roofH * 0.445, 0, 0.2, 0.18, roofD * 0.51, 0xb07c4e);
      for (let i = -3; i <= 3; i++) {
        const lz = i * roofD * 0.06, rise = roofH * 0.49 * (1 - Math.abs(i) / 4);
        put(B.trim, side * roofW * 0.32, eave + roofH * 0.445 + rise / 2, lz, 0.12, rise, 0.09, 0xc1935b);
      }
      B.finial.add(x + side * roofW * 0.31 * c, eave + roofH * 0.98, z - side * roofW * 0.31 * s, side * 1.1, 1.55, 0.8, ry, 0x596c63);
    }
  }
  if (opt.hipGable || (h >= 7 && d <= 20)) {
    const rafterN = Math.min(18, Math.ceil(w / 1.15));
    for (const side of [-1, 1]) for (let i = 0; i <= rafterN; i++) {
      const lx = -w / 2 + w * i / rafterN;
      put(B.trim, lx, eave + roofH * 0.045 - 0.12, side * (d / 2 + 0.6), 0.13, 0.18, 2.3, 0xa47145);
    }
  }
  if (opt.porch) {
    // Tall bay-by-bay wooden screens replace the empty warehouse-like frontage.
    let bays=Math.max(3,Math.round(w/4.8)); if(bays%2===0) bays++;
    const bay=w/bays, front=wallFront+0.18, panelH=h*.77, panelBottom=platform+.22;
    for(let i=0;i<bays;i++) {
      const lx=-w/2+bay*(i+.5), sw=bay-.42, center=Math.abs(lx)<bay*.4;
      put(B.dark,lx,panelBottom+panelH/2,front,sw,panelH,.18,0x45382b);
      for(const side of [-1,1]) put(B.trim,lx+side*sw/2,panelBottom+panelH/2,front+.13,.14,panelH+.15,.14,0xad7949);
      for(const y of [panelBottom,panelBottom+panelH*.4,panelBottom+panelH]) put(B.trim,lx,y,front+.14,sw+.12,.15,.16,0xb08250);
      if(center) {
        for(let row=0;row<5;row++) for(let col=-2;col<=2;col++)
          put(B.gold,lx+col*sw/6,panelBottom+.65+row*.72,front+.26,.12,.12,.12,0xc2a05c);
      } else {
        for(let col=-4;col<=4;col++) put(B.trim,lx+col*sw/10,panelBottom+panelH*.71,front+.16,.07,panelH*.52,.09,0xb08a5a);
        for(const fraction of [.48,.65,.82]) put(B.trim,lx,panelBottom+panelH*fraction,front+.17,sw,.075,.09,0xb08a5a);
      }
      for(const side of [-1,1]) {
        put(B.trim,lx+side*sw*.25,panelBottom+panelH*.19,front+.13,sw*.38,panelH*.27,.1,0x94653f);
        put(B.dark,lx+side*sw*.25,panelBottom+panelH*.19,front+.2,sw*.30,panelH*.21,.04,0x6d4b32);
      }
    }
    for(const side of [-1,1]) {
      for(const yy of [.08,.42,.92]) put(B.trim,side*(w/2+.07),platform+h*yy,0,.18,.2,d-1.0,0xa46741);
      const bays=Math.max(3,Math.round((d-4)/4.3)), run=d-4, gap=run/bays;
      for(let i=0;i<=bays;i++) put(B.trim,side*(w/2+.09),platform+h*.47,-run/2+gap*i,.2,h*.88,.19,0xa36840);
      for(let i=0;i<bays;i++) {
        const lz=-run/2+gap*(i+.5), wy=platform+h*.61, wh=h*.31, ww=gap*.65;
        put(B.dark,side*(w/2+.12),wy,lz,.12,wh,ww,0x44392c);
        for(let j=-3;j<=3;j++) put(B.trim,side*(w/2+.21),wy,lz+j*ww/8,.1,wh,.07,0xae8959);
        for(const y of [-wh/2,0,wh/2]) put(B.trim,side*(w/2+.22),wy+y,lz,.1,.1,ww+.12,0xae8959);
      }
    }
  }
  if (opt.doors && !opt.porch) {
    const dw = Math.min(w * 0.62, 7), dh = Math.min(h * 0.68, 4.4), front = wallFront + 0.5;
    for (const side of [-1, 1]) {
      put(B.trim, side * (dw / 2 + 0.1), platform + dh / 2, front, 0.18, dh + 0.2, 0.18, 0x9e4b34);
      for (const height of [0.27, 0.7]) {
        put(B.trim, side * dw / 4, platform + dh * height, front, dw * 0.39, dh * 0.3, 0.07, 0x734631);
        put(B.trim, side * dw / 4, platform + dh * height, front + 0.05, dw * 0.32, dh * 0.23, 0.05, 0x845237);
      }
    }
    put(B.trim, 0, platform + dh + 0.06, front, dw + 0.45, 0.2, 0.23, 0xa15a3b);
    put(B.trim, 0, platform + dh / 2, front + 0.02, 0.09, dh, 0.12, 0xaa6540);
  }
  if (opt.windows && !opt.porch) {
    for (const side of [-1, 1]) {
      const lx = side * w * 0.28, wy = platform + h * 0.55, ww = w * 0.16, wh = h * 0.3;
      for (let i = -2; i <= 2; i++) put(B.trim, lx + i * ww / 5, wy, wallFront + 0.48, 0.07, wh + 0.16, 0.09, 0x9b6342);
      for (const t of [-0.5, 0, 0.5]) put(B.trim, lx, wy + t * wh, wallFront + 0.49, ww + 0.15, 0.075, 0.09, 0xa6744e);
    }
  }
}

function addPavilion(x, z, r = 5, opt = {}) {
  const { h = 3.2, roofH = 3.2, ry = 0, platform = 0.4, roofKind = 'roof', railing = true, collider = false } = opt;
  const c = Math.cos(ry), s = Math.sin(ry), sideLength = r * 2 + 1.2;
  const pos = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  const put = (batch, lx, y, lz, sw, sh, sd, tint) => {
    const [wx, wz] = pos(lx, lz); batch.add(wx, y, wz, sw, sh, sd, ry, tint);
  };
  put(B.stone, 0, platform / 2, 0, sideLength, platform, sideLength, 0xd7cbb4);
  // A rectangular walkable deck, including over-water pavilions. The end caps
  // are square: a circular collision capsule would create invisible floor outside it.
  const a = pos(0, -sideLength / 2), b = pos(0, sideLength / 2);
  bridgeZones.push({ points: [a, b], halfWidth: sideLength / 2 + 0.1, y: platform, squareEnds: true });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const lx = sx * r * 0.82, lz = sz * r * 0.82, [wx, wz] = pos(lx, lz);
    put(B.stone, lx, platform + 0.1, lz, 0.6, 0.2, 0.6, 0xdacdb7);
    put(B.columns, lx, platform + h / 2, lz, 0.36, h, 0.36, 0x9c4236);
    put(B.trim, lx, platform + h - 0.44, lz, 0.8, 0.2, 0.7, 0xa26b43);
    put(B.trim, lx, platform + h - 0.22, lz, 1.25, 0.18, 1.0, 0xa26b43);
    if (collider) addCollider(wx - 0.19, wx + 0.19, wz - 0.19, wz + 0.19, 'pavilion-column');
  }
  for (const side of [-1, 1]) {
    put(B.red, 0, platform + h - 0.12, side * r * 0.82, r * 1.9, 0.3, 0.3, 0x934231);
    put(B.red, side * r * 0.82, platform + h - 0.12, 0, 0.3, 0.3, r * 1.9, 0x934231);
  }
  const batch = roofKind === 'gold' ? B.roofGold : B.roof;
  batch.add(x, platform + h, z, r * 2.25, roofH, r * 2.25, ry, roofKind === 'gold' ? pickColor('roofGold') : pickColor('roof'));
  put(B.dark, 0, platform + h + roofH * 0.95, 0, r * 1.2, 0.22, 0.26, 0x4d5c54);
  if (railing) {
    // Leave a real central opening on all four sides, so every pavilion can be entered.
    for (const side of [-1, 1]) for (const part of [-1, 1]) {
      const run = Math.max(0.4, r * 0.92 - 1.2), offset = part * (1.2 + run / 2);
      for (const y of [0.42, 0.85]) {
        put(B.wood, offset, platform + y, side * r * 0.92, run, 0.1, 0.1, 0x84583c);
        put(B.wood, side * r * 0.92, platform + y, offset, 0.1, 0.1, run, 0x84583c);
      }
      put(B.trim, part * 1.2, platform + 0.47, side * r * 0.92, 0.12, 0.94, 0.12, 0x84583c);
      put(B.trim, side * r * 0.92, platform + 0.47, part * 1.2, 0.12, 0.94, 0.12, 0x84583c);
    }
  }
  if (platform > 0.6 && platform < 2) for (const side of [-1, 1]) {
    for (let i = 1; i <= 2; i++) {
      const lz = side * (sideLength / 2 + i * 0.42), y = platform * (3 - i) / 3;
      put(B.stone, 0, y / 2, lz, 2.35, y, 0.9, 0xd7cbb4);
      const [sx, sz] = pos(0, lz), hw = 1.175 * Math.abs(c) + 0.45 * Math.abs(s), hd = 0.45 * Math.abs(c) + 1.175 * Math.abs(s);
      groundPatches.push({ x0: sx - hw, x1: sx + hw, z0: sz - hd, z1: sz + hd, height: y });
    }
  }
}

function addCorridor(x1, z1, x2, z2, opt = {}) {
  const { w = 4.2, h = 3.6, floor = 0.24 } = opt;
  const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz), ang = Math.atan2(dx, dz);
  if (len < 0.1) return;
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2, nx = Math.cos(ang), nz = -Math.sin(ang);
  B.stone.add(cx, floor / 2, cz, w, floor, len, ang, 0xd2c7ae);
  // Align the ridge along the passage rather than across it.
  B.roofSmall.add(cx, floor + h, cz, len + 1.0, 1.7, w + 2.2, ang + Math.PI / 2, pickColor('roof'));
  for (const side of [-1, 1]) {
    B.red.add(cx + nx * side * (w / 2 - 0.24), floor + h - 0.12, cz + nz * side * (w / 2 - 0.24), 0.32, 0.34, len + 0.3, ang, 0x994735);
  }
  const n = Math.max(2, Math.ceil(len / 5.2));
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = lerp(x1, x2, t), z = lerp(z1, z2, t);
    for (const side of [-1, 1]) {
      const px = x + nx * side * (w / 2 - 0.24), pz = z + nz * side * (w / 2 - 0.24);
      B.stone.add(px, floor + 0.08, pz, 0.48, 0.16, 0.48, ang, 0xd3c5ad);
      B.columns.add(px, floor + h / 2, pz, 0.3, h, 0.3, ang, 0xa54838);
      B.trim.add(px, floor + h - 0.42, pz, 0.8, 0.18, 0.68, ang, 0xb37a4c);
      B.trim.add(px, floor + h - 0.2, pz, 1.12, 0.17, 0.9, ang, 0x98603b);
      addCollider(px - 0.15, px + 0.15, pz - 0.15, pz + 0.15, 'corridor-column');
    }
    B.wood.add(x, floor + h - 0.18, z, w, 0.22, 0.26, ang, 0x975538);
  }
  bridgeZones.push({ points: [[x1, z1], [x2, z2]], halfWidth: w / 2 + 0.1, y: floor, squareEnds: true });
}

function addTree(x, z, kind = 'willow', s = 1) {
  if(nearShorePath(x,z))return;
  if (MATURE_TREE_SPOTS.some(([tx,tz])=>Math.hypot(tx-x,tz-z)<5.0)) return;
  if(TREE_CLEAR_AREAS.some(a=>x>a.x0&&x<a.x1&&z>a.z0&&z<a.z1))return;
  if(Math.abs(Math.abs(x)-26)<8&&AVENUE_SHOP_Z.some(sz=>Math.abs(z-sz)<10)) return;
  if (FILM_SHOTS.some(shot => shot.eye[1] < 8 && Math.hypot(shot.eye[0]-x, shot.eye[2]-z) < 5.5 + shot.drift * 0.5)) return;
  const botanical = B['botany' + (kind === 'leaf' ? 'willow' : kind)];
  if (botanical) {
    const y=groundHeightAt(x,z),yaw=rr(0,TAU);
    botanical.add(x, y, z, s, s, s, yaw);
    addCollider(x-.2*s,x+.2*s,z-.2*s,z+.2*s,'tree-trunk');
    if(!botanical.geometry.boundingBox)botanical.geometry.computeBoundingBox();
    const bounds=botanical.geometry.boundingBox,c=Math.abs(Math.cos(yaw)),sn=Math.abs(Math.sin(yaw));
    const hw=Math.max(Math.abs(bounds.min.x),Math.abs(bounds.max.x))*s,hd=Math.max(Math.abs(bounds.min.z),Math.abs(bounds.max.z))*s;
    recordFlightObstacle(x,z,2*(hw*c+hd*sn),2*(hw*sn+hd*c),y+bounds.max.y*s);
    return;
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
const foodDisplays=[];
function getStallAwningMat(color) {
  if (stallAwningMats.has(color)) return stallAwningMats.get(color);
  const mat = SurfaceLibrary.awning(color);
  stallAwningMats.set(color, mat);
  return mat;
}

function addMarketStall(x, z, ry = 0, color = 0xc84f3c) {
  const c = Math.cos(ry), s = Math.sin(ry);
  const put = (batch, lx, y, lz, sx, sy, sz, tint, rx = 0, rz = 0) =>
    batch.add(x + lx * c + lz * s, y, z - lx * s + lz * c, sx, sy, sz, ry, tint, rx, rz);
  put(B.wood, 0, 0.65, 0, 3.2, 1.3, 1.8, 0x8d5a3a);
  for (const dx of [-1.5, 1.5]) for (const dz of [-0.8, 0.8])
    put(B.trim, dx, 1.6, dz, 0.12, 2.4, 0.12, 0x6e452e);
  const awningKey = 'stallAwning' + color;
  if (!B[awningKey]) B[awningKey] = new Batch(STALL_CLOTH_GEOMETRY, getStallAwningMat(color));
  put(B[awningKey], 0, 2.76, 0, 4.5, 1, 2.9, null);
  put(B.trim, 0, 3.12, 0, 4.6, 0.12, 0.12, 0xa57b4c);
  for(const side of [-1,1])put(B.trim,0,2.68,side*1.4,4.5,.12,.08,0xa57b4c);
  // Framed counter slats, shallow baskets, produce and ceramic jars.
  for (let i = -3; i <= 3; i++) put(B.trim, i * 0.44, 0.69, 0.94, 0.05, 1.1, 0.08, 0xb88b5d);
  for (let i = -1; i <= 1; i++) {
    const tray=i===1?.43:.57;
    put(B.basket, i * 0.9, 1.37, 0.2, tray, 0.16, tray, 0xb38b57);
    for(let j=0;j<5;j++) {
      const spacing=i===-1?.25:i===0?.19:.12;
      const lx=i*.9+(j===4?0:(j%2-.5)*spacing),lz=.2+(j===4?0:(Math.floor(j/2)-.5)*spacing);
      foodDisplays.push({id:['food_pomegranate_01','food_pears_asian_01','food_lychee_01'][i+1],
        x:x+lx*c+lz*s,z:z-lx*s+lz*c,y:1.42,height:i===1?.075:.17,yaw:ry+j*.72});
    }
  }
  for (const lx of [-1.15, -0.6, 0.05]) put(B.pottery, lx, 1.3, -0.5, 0.4, 0.55, 0.4, lx < -1 ? 0x5e7e73 : 0xc7996c);
  put(B.lantern, 1.4, 2.35, 0.9, 0.26, 0.36, 0.26, 0xdf5a43);
  const hw = 1.7 * Math.abs(c) + 1.05 * Math.abs(s), hd = 1.7 * Math.abs(s) + 1.05 * Math.abs(c);
  addCollider(x - hw, x + hw, z - hd, z + hd, 'stall');
  flightObstacles.push({ x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd, top: 3.05 });
}

function addHandcart(x, z, ry = 0) {
  const c = Math.cos(ry), s = Math.sin(ry);
  const put = (batch, lx, y, lz, sx, sy, sz, tint, extraYaw = 0) =>
    batch.add(x + lx * c + lz * s, y, z - lx * s + lz * c, sx, sy, sz, ry + extraYaw, tint);
  put(B.wood, 0, 0.85, 0, 1.7, 0.2, 2.5, 0x83553a);
  for (const side of [-1, 1]) {
    put(B.trim, side * 0.83, 1.16, 0, 0.12, 0.62, 2.5, 0x996a44);
    put(B.trim, side * 0.58, 0.65, 2, 0.12, 0.12, 2.7, 0x83553a);
    put(B.cartWheel, side * 1.04, 0.65, -0.25, 1.25, 1.25, 1.25, 0x4f3b2c, Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 4;
      B.trim.add(x + side * 1.04 * c - 0.25 * s, 0.65, z - side * 1.04 * s - 0.25 * c, 0.08, 1.08, 0.08, ry + Math.PI / 2, 0xa47b52, 0, a);
    }
  }
  put(B.trim, 0, 0.65, -0.25, 2.35, 0.14, 0.14, 0x67432e);
  for (let i = -1; i <= 1; i++) put(B.basket, i * 0.48, 1.1, -0.15, 0.52, 0.48, 0.65, 0xc7a06b);
  const hw = 1.1 * Math.abs(c) + 1.3 * Math.abs(s), hd = 1.1 * Math.abs(s) + 1.3 * Math.abs(c);
  addCollider(x - hw, x + hw, z - hd, z + hd, 'cart');
}

function addBanner(text, x, z, ry, color = '#b64438') {
  const tex = makeTexture(160, 420, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color; ctx.fillRect(12, 0, w - 24, h);
    ctx.fillStyle = 'rgba(255,240,200,.16)'; ctx.fillRect(12, 0, 10, h);
    ctx.strokeStyle = '#e5bf76'; ctx.lineWidth = 3; ctx.strokeRect(18, 8, w - 36, h - 16);
    ctx.fillStyle = '#f8e8bc'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 62px "Ma Shan Zheng","STKaiti","KaiTi",serif';
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
  const commercial = Math.abs(x) === 48 && z >= 283;
  const wallColor = pickColor('plaster');
  const wall = (cx, cz, sx, sz) => {
    B.plaster.add(cx, h / 2, cz, sx, h, sz, 0, wallColor);
    B.red.add(cx, h - 0.18, cz, sx + 0.06, 0.2, sz + 0.06, 0, 0xb5543e);
    B.dark.add(cx, h + 0.12, cz, sx + 0.3, 0.22, sz + 0.3, 0, 0x4e615c);
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
    B.roofSmall.add(x, 4.35, z + side * halfD, gate + 3, 1.9, 4.6, 0, 0x526560);
  }
  // 东西墙，中间开门
  for (const side of [-1, 1]) {
    if (commercial && side === (x < 0 ? 1 : -1)) continue;
    const len = (d - gate) / 2;
    wall(x + side * halfW, z - (gate + len) / 2, t, len);
    wall(x + side * halfW, z + (gate + len) / 2, t, len);
    B.wood.add(x + side * halfW, 2.0, z - gate / 2 - 0.3, 0.45, 4, 0.45, 0, 0x74452f);
    B.wood.add(x + side * halfW, 2.0, z + gate / 2 + 0.3, 0.45, 4, 0.45, 0, 0x74452f);
    B.red.add(x + side * halfW, 4.15, z, 0.6, 0.5, gate + 1.2, 0, 0xa94237);
    B.roofSmall.add(x + side * halfW, 4.35, z, 4.6, 1.9, gate + 3, 0, 0x526560);
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
    const compoundX = w.x + (Math.abs(w.x) === 48 && w.z >= 283 ? Math.sign(w.x) * 8 : 0);
    const idx = (w.col * 7 + w.row * 13) % 5;
    if (idx === 0 && w.w === WARD_W) {
      // 小型佛寺
      addCompound(compoundX, w.z + 2, w.w * 0.6, w.d * 0.58, 0, false);
      addPavilion(compoundX - w.w * 0.27, w.z - w.d * 0.28, 2.7, { h: 2.4, roofH: 2.2 });
      addTree(compoundX + w.w * 0.28, w.z - w.d * 0.3, 'pine', 0.9);
    } else if (idx === 3) {
      addCompound(compoundX - w.w * 0.17, w.z, w.w * 0.52, w.d * 0.64, 0, false);
      addCompound(compoundX + w.w * 0.28, w.z - w.d * 0.16, w.w * 0.34, w.d * 0.32, 0, true);
      addTree(compoundX + w.w * 0.3, w.z + w.d * 0.28, 'willow', 0.8);
    } else {
      addCompound(compoundX, w.z, w.w * 0.7, w.d * 0.7, 0, idx === 4);
      addTree(compoundX - w.w * 0.33, w.z + w.d * 0.3, idx % 2 ? 'peach' : 'willow', 0.8);
      addTree(compoundX + w.w * 0.36, w.z + w.d * 0.08, 'pine', 0.65);
    }
    // 坊内散树
    for (let i = 0; i < 3; i++) {
      const tx = compoundX + rr(-w.w * 0.38, w.w * 0.38), tz = w.z + rr(-w.d * 0.38, w.d * 0.38);
      if (Math.abs(tx - compoundX) < w.w * 0.26 && Math.abs(tz - w.z) < w.d * 0.24) continue;
      addTree(tx, tz, pick(['willow', 'peach', 'leaf']), rr(0.55, 0.9));
    }
  }
}

// ---------------------------------------------------------------- 市场
function addShop(x, z, w, d, ry, name, opt = {}) {
  const { twoStory = true, awning = 0xc94e3c, goods = true } = opt;
  const c = Math.cos(ry), s = Math.sin(ry);
  const pos = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  const put = (batch, lx, y, lz, sx, sy, sz, tint, rx = 0) => {
    const [wx, wz] = pos(lx, lz); batch.add(wx, y, wz, sx, sy, sz, ry, tint, rx);
  };
  addHall(x, z, w, d, { h: twoStory ? 7.2 : 4.6, roofH: 3.4, ry, doors: false, columns: true, windows: false, collider: true, openFront: true, galleryDepth: twoStory ? 1.15 : 0 });
  const front = d / 2;
  for (const side of [-1, 1]) {
    const edge = side * (w / 2 + 0.05), height = twoStory ? 7.2 : 4.6;
    for (const lz of [-d / 2, 0, d / 2]) put(B.trim, edge, height / 2 + 0.55, lz, 0.18, height, 0.2, 0x9b4c34);
    for (const y of [0.85, 3.8, height + 0.35]) put(B.trim, edge, y, 0, 0.18, 0.2, d + 0.25, 0xa65b3b);
    if (twoStory) for (const lz of [-d * 0.27, d * 0.27]) {
      put(B.dark, edge + side * 0.04, 5.6, lz, 0.12, 1.3, d * 0.24, 0x4a3b2c);
      for (let i = -2; i <= 2; i++) put(B.trim, edge + side * 0.12, 5.6, lz + i * d * 0.045, 0.1, 1.4, 0.07, 0xc29463);
      for (const y of [4.92, 6.28]) put(B.trim, edge + side * 0.12, y, lz, 0.1, 0.1, d * 0.25, 0xc29463);
    }
  }
  if (twoStory) {
    // The 3.6m ground-floor ceiling and gallery now share the same floor.
    // Recessed upper rooms leave a real 2.55m-deep open timber gallery, rather
    // than gluing a floating railing and dark rectangles onto a flat wall.
    const floor = 4.25, rear = front - 1.15, edge = front + 1.4, depth = edge - rear;
    put(B.wood, 0, floor - .10, (rear + edge) / 2, w + .8, .2, depth + .25, 0x795137);
    const planks = Math.ceil(w / .28);
    for (let i = 0; i < planks; i++) put(B.galleryDeck, -w / 2 + (i + .5) * w / planks, floor + .022, (rear + edge) / 2,
      w / planks - .012, .044, depth + .22, [0xa8784d, 0x96704c, 0xad8055][i % 3]);
    for (const y of [floor + .13, floor + .57, floor + .95]) put(B.trim, 0, y, edge, w + .8, .10, .13, 0xa56d43);
    const n = Math.ceil(w / 1.5);
    for (let i = 0; i <= n; i++) {
      const lx = -w / 2 + w * i / n;
      put(B.trim, lx, floor + .52, edge, .12, 1.07, .12, 0xb48151);
      if (i < n) put(B.galleryScreens, lx + w / n / 2, floor + .37, edge, w / n - .20, .41, 1, 0xa87849);
    }
    for (const side of [-1, 1]) {
      put(B.trim, side * (w / 2 + .22), floor + .95, (rear + edge) / 2, .12, .12, depth, 0x9a603d);
      put(B.trim, side * (w / 2 + .22), floor + .48, edge - .65, .12, .95, .12, 0xac774c);
    }
    const bays = Math.max(3, Math.round(w / 4.4));
    for (let i = 0; i < bays; i++) {
      const lx = -w / 2 + w * (i + .5) / bays, panelW = w / bays * .66;
      put(B.dark, lx, 6.04, rear + .03, panelW + .18, 1.72, .10, 0x493a2d);
      put(B.galleryScreens, lx, 6.04, rear + .12, panelW, 1.6, 1, 0xc1935e);
      // Paired solid shutters project at their hinges, giving a readable
      // silhouette in side views as well as through the open gallery.
      for (const side of [-1, 1]) {
        const [sx, sz] = pos(lx + side * (panelW / 2 + .17), rear + .24);
        B.galleryDeck.add(sx, 6.04, sz, .31, 1.7, .07, ry + side * .65, 0x93613d);
      }
    }
    for (let i = 0; i <= bays; i++) {
      const lx = -w / 2 + w * i / bays;
      put(B.galleryBrackets, lx, floor - .72, front + .6, .68, .62, .84, 0xa87948);
      put(B.trim, lx, floor - .23, front + .5, .19, .24, 2.05, 0x98603c);
    }
    // Patrons use the same shared 3D clothing/portrait system as the city.
    // These are stationary observers, so the default depth shader matches.
    if (!B.galleryPatrons) B.galleryPatrons = new Batch(makePersonGeometry({woman:true,robe:0x9b757b}), personMat, {maxDistance:90,cellSize:48});
    const [gx, gz] = pos(w * .26, front + .65);
    B.galleryPatrons.add(gx, floor + .045, gz, .94, .94, .94, ry - .15);
    if (opt.galleryPlant) put(B.pottery, -w * .34, floor + .045, front + .55, .5, .32, .5, 0xa67c59);
  }
  for (const side of [-1, 1]) {
    const shelfX = side * w * 0.30;
    for (const shelfY of [1.3, 2.2, 3.1]) {
      put(B.wood, shelfX, shelfY, -d * 0.34, w * 0.25, 0.12, 0.85, 0x795035);
      for (let i = -1; i <= 1; i++) {
        const lx = shelfX + i * w * 0.07;
        put(B.pottery, lx, shelfY + 0.29, -d * 0.34, 0.42, 0.48, 0.42, [0x99ad91, 0xcba882, 0x9d7660][(i + 1) % 3]);
      }
    }
    for (const edge of [-1, 1]) put(B.trim, shelfX + edge * w * 0.13, 1.85, -d * 0.34, 0.12, 2.9, 0.12, 0x81593e);
  }
  const [signX, signZ] = pos(0, front + 0.63);
  addSignQuad(shopSigns, shopAtlas, name, signX, 3.8, signZ, ry, Math.min(w * 0.55, 4.8), 1.35);
  // A real projecting cloth canopy with timber arms, correctly rotated on all four market sides.
  const canopyKey = 'shopCanopy' + awning;
  if (!B[canopyKey]) B[canopyKey] = new Batch(SHOP_CLOTH_GEOMETRY, getStallAwningMat(awning));
  put(B[canopyKey], 0, 3.02, front + 1.35, w * 0.9, 0.55, 2.5, null);
  put(B.trim, 0, 2.92, front + 2.58, w * 0.93, 0.14, 0.14, 0x895638);
  for (const side of [-1, 1]) {
    put(B.trim, side * w * 0.43, 2.9, front + 1.35, 0.1, 0.12, 2.5, 0x895638);
    put(B.trim, side * w * 0.43, 1.43, front + 2.45, 0.13, 2.86, 0.13, 0x865436);
    put(B.stone, side * w * 0.43, 0.12, front + 2.45, 0.35, 0.24, 0.35, 0xd4c4a7);
    const [postX, postZ] = pos(side * w * 0.43, front + 2.45);
    addCollider(postX - 0.12, postX + 0.12, postZ - 0.12, postZ + 0.12, 'canopy-post');
  }
  if (goods) {
    put(B.wood, 0, 0.72, front + 1.5, w * 0.5, 1.3, 1.2, 0x8f5a38);
    for (let i = -3; i <= 3; i++) put(B.trim, i * w * 0.075, 0.72, front + 2.12, 0.05, 1.15, 0.07, 0xb78553);
    if (/绫|绸|波斯/.test(name)) {
      for (let i = 0; i < 5; i++) put(B.fabricRoll, (i - 2) * w * 0.095, 1.58, front + 1.45, 0.6, 1.0, 0.6, [0x9c5051, 0xbfa270, 0x688b80, 0x627c91, 0xb48c7e][i], Math.PI / 2);
    } else if (/茶|香|药|酒|珠|金/.test(name)) {
      for (let i = 0; i < 7; i++) put(B.pottery, (i - 3) * w * 0.075, 1.37, front + 1.45 + (i % 2) * 0.24, 0.55, 0.65 + (i % 2) * 0.22, 0.55, [0xc59a6b, 0x6f8b7b, 0xa8714d][i % 3]);
    } else if (/书/.test(name)) {
      for (let i = -2; i <= 2; i++) {
        put(B.trim, i * w * 0.105, 1.42, front + 1.4, w * 0.1, 0.12, 0.7, 0xcaba8e);
        put(B.trim, i * w * 0.105, 1.56, front + 1.45, w * 0.085, 0.12, 0.65, 0x6c7d74);
      }
    } else {
      for (let i = -2; i <= 2; i++) {
        put(B.basket, i * w * 0.105, 1.4, front + 1.45, w * 0.115, 0.18, 0.8, 0xb39461);
        for (let j = 0; j < 3; j++) put(B.produce, i * w * 0.105 + (j - 1) * 0.22, 1.6, front + 1.4, 0.4, /饼/.test(name) ? 0.15 : 0.32, 0.4, /饼/.test(name) ? 0xd7b274 : 0xb28e59);
      }
    }
    // Display tables have collision records as well as visible depth.
    const [tx, tz] = pos(0, front + 1.5), hw = w * 0.25 * Math.abs(c) + 0.6 * Math.abs(s), hd = w * 0.25 * Math.abs(s) + 0.6 * Math.abs(c);
    addCollider(tx - hw, tx + hw, tz - hd, tz + hd, 'shop-counter');
  }
  const [lanternX, lanternZ] = pos(-w * 0.38, front + 0.75);
  addLantern(lanternX, 4.1, lanternZ, 0.85);
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
  const roadMat = SurfaceLibrary.paving(0xe2dccb);
  const pavingGeo = new THREE.PlaneGeometry(w - 1.5, d - 1.5);
  const pavingUV = pavingGeo.attributes.uv;
  for (let i = 0; i < pavingUV.count; i++) pavingUV.setXY(i, pavingUV.getX(i) * w / 3, pavingUV.getY(i) * d / 3);
  const paving = new THREE.Mesh(pavingGeo, roadMat);
  paving.rotation.x = -Math.PI / 2; paving.position.set(cx, 0.075, cz); paving.receiveShadow = true;
  scene.add(paving);
  const strip = (sw, sd) => {
    const g = new THREE.PlaneGeometry(sw, sd), uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * sw / 3, uv.getY(i) * sd / 3);
    return g;
  };
  const r1 = new THREE.Mesh(strip(w - 8, 12), roadMat);
  r1.rotation.x = -Math.PI / 2; r1.position.set(cx, 0.08, cz); r1.receiveShadow = true; scene.add(r1);
  const r2 = new THREE.Mesh(strip(12, d - 8), roadMat);
  r2.rotation.x = -Math.PI / 2; r2.position.set(cx, 0.085, cz); r2.receiveShadow = true; scene.add(r2);

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
  // Four inhabited inner blocks form two shopping streets and a clear cross
  // street. The central walking lanes x=+/-7.4 and z=+/-8 remain open; roof
  // overhangs are above them, while every counter/post has real collision.
  for (const side of [-1, 1]) for (const row of [-1, 1]) {
    const index = (side > 0 ? 2 : 0) + (row > 0 ? 1 : 0);
    const spec = {x:cx + side * 18.5,z:cz + row * 23,w:19,d:10,
      ry:side < 0 ? Math.PI / 2 : -Math.PI / 2,
      name:names[(index + (east ? 0 : 2)) % names.length],market:name};
    addShop(spec.x, spec.z, spec.w, spec.d, spec.ry, spec.name,
      {galleryPlant:true,awning:(east ? [0x6f8588,0xad9161,0x7f7189,0x678578] : [0xab745a,0x768678,0x84718b,0xaa925e])[index]});
    innerMarketShops.push(spec);
  }
  // 中央市楼
  addPavilion(cx, cz, 5.6, { h: 4.0, roofH: 3.4, roofKind: 'gold', railing: true, collider: true });
  B.wood.add(cx, 1.5, cz, 7.5, 3, 7.5, 0, 0x7b4b31);
  addCollider(cx - 3.75, cx + 3.75, cz - 3.75, cz + 3.75, 'market-tower-base');
  // 摊位
  const stallColors = [0xc74f3c, 0x4c7f8c, 0xd1a043, 0x7b5b8f, 0x5d8b66];
  // Purposeful outer lanes replace random stands that would intersect the new
  // shop blocks. Keep the back lane, the shop entrances and the central axes
  // clear rather than accumulating stalls in every empty square metre.
  for (const side of [-1, 1]) for (const row of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      addMarketStall(cx + side * (36 + i * 9), cz + row * 23, row > 0 ? Math.PI : 0, stallColors[(i + (east ? 2 : 0)) % stallColors.length]);
    }
  }
  // 旗幡
  for (const side of [-1, 1]) for (const row of [-1, 1]) {
    addBanner(east ? (row > 0 ? '绸' : '茶') : (row > 0 ? '酒' : '香'),
      cx + side * 11.8, cz + row * 11.1, side < 0 ? Math.PI / 2 : -Math.PI / 2,
      east ? '#3f6d72' : '#a66a2f');
  }
  // 灯笼串
  for (const row of [-1, 1])
    addLanternString(cx - 13.2, cz + row * 23, cx + 13.2, cz + row * 23, 6.9, 7);
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
  const wallMat = SurfaceLibrary.rammedEarth();
  const wall = (x,z,w,d) => {
    const geometry=new THREE.BoxGeometry(w,h,d),positions=geometry.attributes.position,normals=geometry.attributes.normal,uv=geometry.attributes.uv;
    const alongX=w>d;
    for(let i=0;i<positions.count;i++) {
      // A broad earth footing narrows toward its parapet. Keep the old maximum
      // footprint for collision, gate openings and the flight safety envelope.
      const height=positions.getY(i)/h+.5,taper=1-height*.22;
      if(alongX)positions.setZ(i,positions.getZ(i)*taper);else positions.setX(i,positions.getX(i)*taper);
      const u=Math.abs(normals.getX(i))>.5?positions.getZ(i):positions.getX(i);
      const v=Math.abs(normals.getY(i))>.5?positions.getZ(i):positions.getY(i);
      // Source clay microdetail represents a 2m surface, including end caps.
      uv.setXY(i,u/2,v/2);
    }
    geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,wallMat);mesh.name='tapered-citywall';
    mesh.position.set(x,h/2,z);mesh.castShadow=mesh.receiveShadow=true;scene.add(mesh);
    B.stone.add(x,.42,z,w+.04,.84,d+.04,0,0xb5aa93);
    B.stone.add(x,h+.01,z,alongX?w+.04:w*.78+.1,.22,alongX?d*.78+.1:d+.04,0,0xb7ac95);
    addCollider(x-w/2,x+w/2,z-d/2,z+d/2,'citywall');
    flightObstacles.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,top:h+1.4});
  };
  // 南墙：明德门
  const gateS = 62;
  wall(-CITY.x1 / 2 - gateS / 4, CITY.z1, CITY.x1 - gateS / 2, t);
  wall(CITY.x1 / 2 + gateS / 4, CITY.z1, CITY.x1 - gateS / 2, t);
  // 北墙：玄武门 + 丹凤门
  wall(-233.5, CITY.z0, 433, t);
  wall(70, CITY.z0, 106, t);
  wall(313.5, CITY.z0, 273, t);
  // 东墙 / 西墙（春明门/金光门）
  wall(CITY.x1, -171, t, 418);
  wall(CITY.x1, 226, t, 308);
  wall(CITY.x0, -171, t, 418);
  wall(CITY.x0, 226, t, 308);
  // 垛口
  for (let x = -444; x <= 444; x += 6) {
    for (const z of [CITY.z0, CITY.z1]) {
      if (z === CITY.z1 && Math.abs(x) < 32) continue;
      if (z === CITY.z0 && (Math.abs(x) < 18 || Math.abs(x - 150) < 28)) continue;
      B.stone.add(x, h + 0.7, z + (z === CITY.z0 ? -2.4 : 2.4), 2.2, 1.4, 1.0, 0, 0xbfae8e);
    }
  }
  for (let z = -374; z <= 374; z += 6) {
    for (const x of [CITY.x0, CITY.x1]) {
      if (Math.abs(z - 55) < 18) continue;
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
  const c=Math.cos(ry),s=Math.sin(ry);
  const put=(batch,lx,y,lz,sw,sh,sd,tint,turn=0)=>batch.add(x+lx*c+lz*s,y,z-lx*s+lz*c,sw,sh,sd,ry+turn,tint);
  const pw = w / (passages * 2 + 1);
  for (let i = 0; i <= passages; i++) {
    const px = x + (i - passages / 2) * pw * 2;
    if (side) B.stone.add(x, h / 2, z + (i - passages / 2) * pw * 2, d, h, pw, 0, 0xe7d1ad);
    else B.stone.add(px, h / 2, z, pw, h, d, 0, 0xe7d1ad);
    if (!side) addCollider(px - pw / 2, px + pw / 2, z - d / 2, z + d / 2, 'gate');
    else addCollider(x - d / 2, x + d / 2, z + (i - passages / 2) * pw * 2 - pw / 2, z + (i - passages / 2) * pw * 2 + pw / 2, 'gate');
  }
  const passageH=Math.min(8.4,h*.72);
  put(B.stone,0,(passageH+h)/2,0,w,h-passageH,d,0xe7d1ad);
  for(let i=0;i<passages;i++) {
    const center=(i-(passages-1)/2)*pw*2,leafW=pw*.47;
    for(const end of [-1,1]) {
      put(B.trim,center,passageH,end*(d/2+.08),pw+.38,.34,.25,0x684c32);
      for(const edge of [-1,1])put(B.trim,center+edge*(pw/2-.04),passageH/2,end*(d/2+.08),.22,passageH,.26,0x795335);
    }
    // Open timber leaves lie against the passage sides. They leave the original
    // tested doorway clear; hinge rails and brass studs remain actual geometry.
    for(const edge of [-1,1]) {
      const hinge=center+edge*(pw/2-.04),front=d/2-.05;
      put(B.dark,hinge,passageH*.48,front-leafW/2,leafW,passageH*.94,.17,0x5d3c2b,-edge*Math.PI/2);
      for(const fraction of [.18,.5,.82])put(B.trim,hinge-edge*.105,passageH*fraction,front-leafW/2,.12,.15,leafW,0x9f7748);
      for(let row=0;row<7;row++)for(let col=0;col<4;col++)put(B.doorStuds,hinge-edge*.14,passageH*(.13+row*.115),front-(col+.5)*leafW/4,.105,.105,.105,0xc9a15d);
    }
  }
  // 门楼
  B.stone.add(x, h + 0.2, z, w, 0.5, d, ry, 0xd8c4a3);
  B.red.add(x, h + 3.2, z, w + 4, 5.4, d + 3, ry, 0xa94538);
  B.roofGable.add(x, h + 5.9, z, w + 7, grand ? 5.6 : 4.2, d + 7, ry, pickColor('roof'));
  B.dark.add(x, h + (grand ? 11.1 : 9.8), z, w * 0.72, 0.5, 0.65, ry, 0x35423f);
  addHallCraft(x, z, w + 3.6, d + 3.6, 5.4, h + 0.55, grand ? 5.6 : 4.2, ry, { simple: false, doors: false, windows: true, columns: true, hipGable: true });
  const framingW=w+3.6,bays=Math.max(3,Math.round(framingW/4.4)),bay=framingW/bays,wallFront=(d+3)/2;
  for(const face of [-1,1]) {
    put(B.wood,0,h+.58,face*(wallFront+.48),w+4.5,.22,1.45,0x936744);
    for(let i=0;i<=bays;i++)put(B.columns,-framingW/2+bay*i,h+3.2,face*(wallFront+.62),.52,5.3,.52,0xa64d36);
    for(let i=0;i<bays;i++) {
      const lx=-framingW/2+bay*(i+.5),ww=bay*.68,wh=3.1,wy=h+3;
      put(B.dark,lx,wy,face*(wallFront+.09),ww,wh,.14,0x403b2c);
      for(let j=-3;j<=3;j++)put(B.trim,lx+j*ww/8,wy,face*(wallFront+.2),.09,wh+.1,.1,0xb78750);
      for(const fraction of [-.5,0,.5])put(B.trim,lx,wy+fraction*wh,face*(wallFront+.21),ww+.18,.12,.12,0xb78750);
      put(B.trim,lx,h+5.03,face*(wallFront+.22),bay-.24,.36,.14,0x416c60);
      put(B.trim,lx,h+5.03,face*(wallFront+.3),bay*.62,.09,.05,0xc2a569);
    }
    for(const y of [h+1.05,h+1.6])put(B.trim,0,y,face*(wallFront+1.06),w+4.2,.1,.12,0x936c42);
    for(let i=0;i<=bays*3;i++)put(B.trim,-(w+4)/2+(w+4)*i/(bays*3),h+1.25,face*(wallFront+1.06),.08,.68,.1,0x936c42);
  }
  addSignMesh(name, x + (side ? Math.sign(x) * (d / 2 + 1.7) : 0), h + 2.6, z + (side ? 0 : d / 2 + 1.7), side && x < 0 ? -Math.PI / 2 : ry, 7.5, 2.3, { font: 68 });
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
      if (z < 245) addTree(x, z, 'willow', rr(0.85, 1.1));
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
    B.red.add(0, 8.45, z, 28, 0.62, 0.78, 0, 0xb7503a);
    B.roofSmall.add(0, 8.98, z, 31, 2.1, 4.2, 0, 0x4d625e);
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
      B.dark.add(x, 0.59, z, 2.72, 0.08, 1.08, 0, 0x65513b);
      for (const side of [-1, 1]) B.stone.add(x, 0.61, z + side * 0.65, 3.12, 0.15, 0.14, 0, 0xdcc6a5);
      for (let k = 0; k < 3; k++) {
        const fx = x + (k - 1) * 0.78, fz = z + (k % 2 ? 0.2 : -0.15), fy = 1.08 + (k % 2) * 0.13, color = pick(planterFlowers);
        B.trunk.add(fx, (fy + 0.6) / 2, fz, 0.045, fy - 0.6, 0.045, 0, 0x587449);
        for (const side of [-1, 1]) B.leaf.add(fx + side * 0.12, fy - 0.2, fz, 0.18, 0.32, 0.12, 0, 0x6c8950, 0, -side * 0.65);
        for (let petal = 0; petal < 5; petal++) {
          const a = petal * TAU / 5;
          B.blossom.add(fx + Math.cos(a) * 0.13, fy, fz + Math.sin(a) * 0.13, 0.21, 0.12, 0.21, a, color);
        }
        B.produce.add(fx, fy + 0.035, fz, 0.13, 0.12, 0.13, 0, 0xcaa557);
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
  for (const [x, z, ry] of [[-17, 310, 0.3], [17, 270, -0.15], [-17, 146, 0.2], [17, -106, -0.3]]) addHandcart(x, z, ry);
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
