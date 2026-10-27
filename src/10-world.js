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
      const earX = (length - 10) / 2, earZ = (width - 10) / 2;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const ear = new THREE.BoxGeometry(earX, height * 0.4, earZ);
        append(ear, x + sx * (5 + earX / 2), y + height * 0.8, z + sz * (5 + earZ / 2)); ear.dispose();
      }
    }
  }
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
  tou(32, 32, 20, 0, 0, 0, true);
  kung(31, 12, 0);
  kung(36, 29, Math.PI / 2);
  for (const side of [-1, 1]) {
    tou(14, 16, 10, side * 25, 33, 0);
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