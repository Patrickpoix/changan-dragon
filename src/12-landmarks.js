/* ============================================================
   长安城 · 宫苑 / 塔寺 / 曲江
   ============================================================ */

const waterZones = [];
const waterRects = [];
const bridgeZones = [];
const landZones = [];
const boatSpecs = [];
const pondMeshes = [];

function blobShape(cx, cz, rx, rz, seed = 1, wobble = 0.16, n = 40) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    const w = 1 + Math.sin(a * 3 + seed) * wobble * 0.5 + Math.cos(a * 5 - seed * 1.7) * wobble * 0.35;
    const x = Math.cos(a) * rx * w, y = Math.sin(a) * rz * w;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  shape.closePath();
  return { shape, cx, cz, rx, rz };
}

const waterUniforms = { time: { value: 0 }, deep: { value: new THREE.Color(0x1b9aa4) }, shallow: { value: new THREE.Color(0x70e5c8) }, sunColor: { value: new THREE.Color(0xffe6b0) }, sunDir: { value: new THREE.Vector3(0.4, 0.8, 0.3).normalize() } };
const waterMat = new THREE.ShaderMaterial({
  uniforms: waterUniforms,
  transparent: false,
  vertexShader: `
    varying vec3 vWorld; varying vec3 vNormalW;
    void main(){
      vec4 wp = modelMatrix * vec4(position,1.0);
      vWorld = wp.xyz; vNormalW = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`,
  fragmentShader: `
    uniform float time; uniform vec3 deep; uniform vec3 shallow; uniform vec3 sunColor; uniform vec3 sunDir;
    varying vec3 vWorld; varying vec3 vNormalW;
    void main(){
      vec2 p = vWorld.xz;
      float w1 = sin(p.x*0.42 + p.y*0.23 + time*1.2);
      float w2 = sin(p.x*0.18 - p.y*0.31 - time*0.8);
      float w3 = sin(length(p-vec2(350.0,320.0))*0.5 - time*1.6);
      float ripple = (w1 + w2 + w3) / 3.0;
      vec3 n = normalize(vNormalW + vec3(w1*0.035, 0.0, w2*0.035));
      vec3 viewDir = normalize(cameraPosition - vWorld);
      float fres = pow(1.0 - max(dot(viewDir,n),0.0), 2.5);
      vec3 col = mix(deep, shallow, 0.42 + ripple*0.12);
      col = mix(col, vec3(0.84,0.93,0.93), fres*0.55);
      vec3 refl = reflect(-sunDir, n);
      float spec = pow(max(dot(refl, viewDir), 0.0), 90.0);
      col += sunColor * spec * 0.8;
      float glint = smoothstep(0.72, 1.0, ripple) * 0.08;
      col += vec3(glint);
      gl_FragColor = vec4(col, 1.0);
    }`,
});

function addWater(cx, cz, rx, rz, seed, opts = {}) {
  const { wobble = 0.16, y = 0.04, name = '' } = opts;
  const b = blobShape(cx, cz, rx, rz, seed, wobble);
  const shore = new THREE.Mesh(new THREE.ShapeGeometry(b.shape, 32), new THREE.MeshStandardMaterial({ color: 0xb8d98c, roughness: 1 }));
  shore.rotation.x = -Math.PI / 2; shore.position.set(cx, 0.012, cz); shore.receiveShadow = true; shore.scale.set(1.06, 1.06, 1.06);
  scene.add(shore);
  const water = new THREE.Mesh(new THREE.ShapeGeometry(b.shape, 32), waterMat);
  water.rotation.x = -Math.PI / 2; water.position.set(cx, y, cz);
  scene.add(water);
  waterZones.push({ cx, cz, rx: rx * 1.02, rz: rz * 1.02 });
  pondMeshes.push(water);
  // 荷叶
  const lotus = new Batch(new THREE.CircleGeometry(0.5, 10), toon(0x5c9a62), { cast: false });
  const flower = new Batch(new THREE.ConeGeometry(0.5, 1, 6, 1), toon(0xf2a7b6), { cast: false });
  for (let i = 0; i < 26; i++) {
    const a = rr(0, TAU), r = rr(0.76, 0.93);
    const x = cx + Math.cos(a) * rx * r, z = cz + Math.sin(a) * rz * r;
    lotus.add(x, y + 0.025, z, rr(0.9, 1.8), 1, rr(0.9, 1.8), rr(0, TAU), pick([0x5d9a63, 0x74aa6d, 0x4e8c5b]));
    if (i % 5 === 0) flower.add(x, y + 0.25, z, 0.28, 0.55, 0.28, rr(0, TAU), 0xf3b3c0);
  }
  lotus.build(); flower.build();
  return b;
}

// ---------------------------------------------------------------- 皇城 / 太极宫
function buildImperialCity() {
  const wallH = 6.4;
  const wm = new THREE.MeshStandardMaterial({ map: TEX.dirt, color: 0xf1d1a4, roughness: 1 });
  // 皇城
  const addWall = (x, z, w, d, h = wallH, mat = wm) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, h / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    addCollider(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 'imperialwall');
  };
  addWall(-105, -220, 210, 3); addWall(105, -220, 210, 3); // 朱雀门两侧
  addWall(-210, -252.5, 3, 65); addWall(210, -252.5, 3, 65);
  addWall(-105, -285, 210, 3); addWall(105, -285, 210, 3); // 承天门两侧
  addGateHouse(0, -220, 36, 15, 8, 3, '朱雀门', false, false);
  addGateHouse(0, -285, 40, 16, 9, 3, '承天门', true, false);
  addSignMesh('皇城', 0, 10.4, -282, 0, 10, 3, { font: 72 });

  // 官署院落
  for (let i = 0; i < 5; i++) {
    const side = i < 2 ? -1 : 1;
    const x = side * (55 + (i % 3) * 57);
    const z = -253 + Math.floor(i / 3) * 20;
    if (Math.abs(x) > 185) continue;
    addCompound(x, z, 38, 28, 0, false);
  }
  // 鼓楼 / 钟楼意象
  addPavilion(-175, -245, 4.2, { h: 4.5, roofH: 3.2, roofKind: 'gold', collider: true });
  addPavilion(175, -245, 4.2, { h: 4.5, roofH: 3.2, roofKind: 'gold', collider: true });

  // 太极宫城墙
  addWall(-130, -332.5, 3, 95); addWall(130, -332.5, 3, 95);
  addWall(-65, -380, 130, 3); addWall(65, -380, 130, 3);
  addGateHouse(0, -380, 32, 15, 8, 3, '玄武门', false, false);
  // 太极殿
  addHall(0, -334, 44, 24, { h: 9, roofH: 6.2, roofKind: 'gold', columns: true, doors: true, windows: true, collider: true, platform: 1.6 });
  addCorridor(-22, -322, -50, -306, { w: 4 });
  addCorridor(22, -322, 50, -306, { w: 4 });
  addHall(0, -360, 30, 17, { h: 7.2, roofH: 4.6, roofKind: 'gold', collider: true, platform: 1.1 });
  addPavilion(-68, -318, 4, { h: 3.6, roofH: 2.6 });
  addPavilion(68, -318, 4, { h: 3.6, roofH: 2.6 });
  // 宫内树
  for (let i = 0; i < 18; i++) addTree(rr(-115, 115), rr(-372, -292), i % 3 ? 'pine' : 'peach', rr(0.7, 1.0));
  landmarks.push({ id: 'taiji', name: '太极宫', x: 0, z: -340, radius: 32, poem: '九天阊阖开宫殿，万国衣冠拜冕旒', desc: '大唐正宫，太极殿巍然中轴，朱墙金脊，气象肃穆。' });
}

// ---------------------------------------------------------------- 大明宫
function buildDamingPalace() {
  const wallH = 7.5;
  const wm = new THREE.MeshStandardMaterial({ map: TEX.dirt, color: 0xf2d3a8, roughness: 1 });
  const addWall = (x, z, w, d) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, d), wm);
    m.position.set(x, wallH / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    addCollider(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 'daming');
  };
  // 宫墙，南墙中开丹凤门
  addWall(-95, -520, 230, 4); addWall(195, -520, 170, 4);
  addWall(20, -450, 4, 140); addWall(280, -450, 4, 140);
  addWall(55, -380, 70, 4); addWall(245, -380, 70, 4);
  addGateHouse(150, -380, 54, 20, 11, 5, '丹凤门', true, false);
  // 含元殿：高台 + 双檐
  B.stone.add(150, 3.4, -430, 66, 6.8, 42, 0, 0xd8c9ad);
  B.stone.add(150, 6.9, -430, 58, 0.6, 34, 0, 0xe2d4b9);
  addHall(150, -432, 38, 19, { h: 9.2, roofH: 5.2, roofKind: 'gold', platform: 7.2, collider: false, columns: true, windows: true });
  addCollider(117, 183, -451, -409, 'hanyuan-platform');
  // 重檐
  B.roofGold.add(150, 22.2, -432, 30, 4.4, 15, 0, 0x5c7475);
  B.dark.add(150, 26.8, -432, 20, 0.5, 0.9, 0, 0xd1a94e);
  // 翔鸾阁 / 栖凤阁
  for (const side of [-1, 1]) {
    const tx = 150 + side * 41, tz = -430;
    B.stone.add(tx, 3, tz, 16, 6, 16, 0, 0xd4c3a4);
    addPavilion(tx, tz, 5.2, { h: 6.4, roofH: 4, platform: 6.1, roofKind: 'gold' });
    addCorridor(150 + side * 22, -423, tx - side * 5, -427, { w: 4 });
  }
  // 宣政殿 / 紫宸殿
  addHall(150, -463, 40, 20, { h: 8.4, roofH: 4.8, roofKind: 'gold', platform: 1.2, collider: true, windows: true });
  addHall(150, -491, 34, 17, { h: 7.4, roofH: 4.2, roofKind: 'gold', platform: 1.0, collider: true });
  // 太液池
  addWater(232, -492, 32, 17, 3.1, { wobble: 0.2 });
  addPavilion(203, -493, 3.5, { h: 3.4, roofH: 2.6 });
  addCorridor(150, -478, 195, -493, { w: 3.4 });
  // 宫内树
  for (let i = 0; i < 35; i++) addTree(rr(35, 270), rr(-512, -390), i % 3 ? 'pine' : 'peach', rr(0.7, 1.1));
  addSignMesh('大明宫', 150, 17.5, -387, 0, 13, 3.2, { font: 80 });
  landmarks.push({ id: 'daming', name: '大明宫', x: 150, z: -430, radius: 46, poem: '金阙晓钟开万户，玉阶仙仗拥千官', desc: '千宫之宫。丹凤门五门洞开，含元殿高踞龙首原，双檐如翼。' });
}

// ---------------------------------------------------------------- 兴庆宫
function buildXingqing() {
  const x0 = 265, x1 = 419, z0 = -206, z1 = -86;
  const h = 5.4;
  const wm = new THREE.MeshStandardMaterial({ map: TEX.dirt, color: 0xe0cbaa, roughness: 1 });
  const addWall = (x, z, w, d) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wm);
    m.position.set(x, h / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    addCollider(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 'xingqing');
  };
  addWall((x0 + x1) / 2, z0, x1 - x0, 3.5);
  addWall((x0 + x1) / 2, z1, x1 - x0, 3.5);
  addWall(x0, (z0 + z1) / 2, 3.5, z1 - z0);
  addWall(x1, (z0 + z1) / 2, 3.5, z1 - z0);
  addGateHouse(342, z1, 30, 14, 8, 3, '兴庆门', false, false);
  addWater(342, -152, 44, 30, 7.3, { wobble: 0.2 });
  // 沉香亭
  addPavilion(342, -196, 5.6, { h: 4.4, roofH: 3.6, platform: 1.0, roofKind: 'gold', collider: true });
  addCorridor(310, -190, 322, -168, { w: 3.8 });
  // 花萼相辉楼（三层）
  B.stone.add(398, 0.8, -104, 27, 1.6, 20, 0, 0xd2c1a3);
  addHall(398, -108, 24, 14, { h: 6.2, roofH: 3.4, platform: 1.5, collider: false, windows: true });
  addHall(398, -112, 18, 9, { h: 5.0, roofH: 2.6, platform: 8.0, collider: false, windows: true });
  addHall(398, -114, 12, 6, { h: 3.6, roofH: 2.2, platform: 14.0, collider: false });
  // 勤政务本楼
  addHall(300, -98, 22, 13, { h: 7, roofH: 3.8, platform: 1.0, collider: true, windows: true });
  addSignMesh('花萼相辉楼', 398, 17.2, -116, 0, 11, 2.8, { font: 58 });
  addSignMesh('沉香亭', 342, 8.8, -188, 0, 8, 2.4, { font: 58 });
  // 岸边柳桃
  for (let i = 0; i < 26; i++) {
    const a = rr(0, TAU), r = rr(1.15, 1.5);
    const tx = 342 + Math.cos(a) * 44 * r, tz = -152 + Math.sin(a) * 30 * r;
    if (tx < 273 || tx > 411 || tz < -200 || tz > -94) continue;
    addTree(tx, tz, i % 2 ? 'willow' : 'peach', rr(0.7, 1.05));
  }
  for (let i = 0; i < 3; i++) addPavilion(285 + i * 5, -100 - i * 4, 2.6, { h: 4.5, roofH: 2.2 });
  landmarks.push({ id: 'xingqing', name: '兴庆宫', x: 342, z: -150, radius: 48, poem: '云想衣裳花想容，春风拂槛露华浓', desc: '龙池碧波，沉香亭畔牡丹盛放，花萼相辉楼飞檐三层。' });
}

// ---------------------------------------------------------------- 塔寺
function addPagoda(x, z, levels, baseW, totalH, name) {
  const stoneMat = new THREE.MeshStandardMaterial({ map: TEX.stone, color: 0xf2dbb8, roughness: 1 });
  B.stone.add(x, 1.2, z, baseW + 12, 2.4, baseW + 12, 0, 0xd2c3a6);
  let y = 2.4;
  const tierH = totalH / levels;
  for (let i = 0; i < levels; i++) {
    const t = i / (levels - 1);
    const w = lerp(baseW, baseW * 0.5, t);
    const hh = tierH * (i === 0 ? 1.18 : 0.94);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, w), stoneMat);
    m.position.set(x, y + hh / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    // 每层屋檐
    const eave = new THREE.Mesh(new THREE.BoxGeometry(w + 2.2, 0.55, w + 2.2), new THREE.MeshStandardMaterial({ color: 0x2e7e73, roughness: 0.8 }));
    eave.position.set(x, y + hh + 0.1, z); eave.castShadow = true; scene.add(eave);
    // 四面壁龛
    for (const [dx, dz, ry] of [[0, w / 2 + 0.02, 0], [0, -w / 2 - 0.02, Math.PI], [w / 2 + 0.02, 0, Math.PI / 2], [-w / 2 - 0.02, 0, -Math.PI / 2]]) {
      const niche = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.3, hh * 0.56), new THREE.MeshStandardMaterial({ color: 0x55402f, roughness: 0.9 }));
      niche.position.set(x + dx, y + hh * 0.5, z + dz); niche.rotation.y = ry; scene.add(niche);
    }
    y += hh + 0.5;
  }
  // 塔刹
  B.gold = B.gold || new Batch(UNIT_SPHERE, MAT.gold);
  for (let i = 0; i < 4; i++) B.lanternCap.add(x, y + 0.8 + i * 0.6, z, 0.5 - i * 0.08, 0.35, 0.5 - i * 0.08, 0, 0xd9b04d);
  B.lanternCap.add(x, y + 3.4, z, 0.2, 1.6, 0.2, 0, 0xd9b04d);
  addCollider(x - baseW / 2 - 2, x + baseW / 2 + 2, z - baseW / 2 - 2, z + baseW / 2 + 2, 'pagoda');
  addSignMesh(name, x, 3.5, z + baseW / 2 + 6.2, 0, 8, 2.2, { font: 62 });
}

function buildPagodas() {
  // 大慈恩寺 · 大雁塔
  const x = 216, z = 283;
  const wm = new THREE.MeshStandardMaterial({ map: TEX.dirt, color: 0xf6dfbc, roughness: 1 });
  for (let i = 0; i < 4; i++) {
    const horiz = i < 2;
    const off = (i % 2 ? 1 : -1) * 31;
    const m = new THREE.Mesh(new THREE.BoxGeometry(horiz ? 62 : 2.4, 3.2, horiz ? 2.4 : 62), wm);
    m.position.set(x + (horiz ? 0 : off), 1.6, z + (horiz ? off : 0)); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  }
  addGateHouse(216, 315, 22, 10, 4, 1, '大慈恩寺', false, false);
  addPagoda(x, z, 7, 12, 49, '大雁塔');
  addHall(x - 26, z - 18, 18, 11, { h: 6, roofH: 3.2, collider: true, windows: true });
  addHall(x + 26, z - 18, 18, 11, { h: 6, roofH: 3.2, collider: true });
  for (let i = 0; i < 10; i++) addTree(x + rr(-28, 28), z + rr(-24, 28), i % 2 ? 'pine' : 'peach', rr(0.6, 0.85));
  landmarks.push({ id: 'dayanta', name: '大雁塔', x, z, radius: 28, poem: '塔势如涌出，孤高耸天宫', desc: '大慈恩寺内七层砖塔，玄奘法师译经之所。塔影入云，铃铎随风。' });

  // 荐福寺 · 小雁塔
  const sx = -216, sz = 349;
  addPagoda(sx, sz, 13, 8.5, 41, '小雁塔');
  addHall(sx + 22, sz - 8, 16, 10, { h: 5.4, roofH: 3, collider: true });
  for (let i = 0; i < 8; i++) addTree(sx + rr(-22, 22), sz + rr(-21, 26), i % 2 ? 'willow' : 'pine', rr(0.55, 0.8));
}

// ---------------------------------------------------------------- 曲江池
function buildQujiang() {
  addWater(354, 318, 66, 54, 2.4, { wobble: 0.18 });
  landZones.push({ cx: 354, cz: 318, rx: 10.5, rz: 7.5 });
  // 湖心岛
  B.stone.add(354, 0.18, 318, 17, 0.36, 12, 0, 0xd9c7a5);
  addPavilion(354, 318, 3.6, { h: 3.6, roofH: 2.8, platform: 0.45, roofKind: 'gold' });
  addTree(347, 314, 'peach', 0.6);
  // 紫云楼（三层，北岸）
  B.stone.add(300, 1.0, 262, 30, 2, 21, 0, 0xd4c3a4);
  addHall(300, 266, 26, 15, { h: 6.4, roofH: 3.6, platform: 1.6, collider: false, windows: true });
  addHall(300, 262, 19, 9, { h: 4.8, roofH: 2.8, platform: 8.2, collider: false });
  addSignMesh('紫云楼', 300, 15.5, 257, 0, 10, 2.7, { font: 60 });
  // 曲江亭与连廊
  addPavilion(405, 278, 4.8, { h: 4.2, roofH: 3.2, platform: 0.7, roofKind: 'gold', collider: true });
  addCorridor(322, 280, 388, 280, { w: 3.8 });
  addPavilion(300, 354, 3.8, { h: 3.8, roofH: 2.8 });
  // 曲桥：西岸通往湖心岛
  const bridgeMat = new THREE.MeshStandardMaterial({ map: TEX.wood, color: 0xb98b5f, roughness: 0.9 });
  const bridgePts = [
    new THREE.Vector3(281, 0.34, 344), new THREE.Vector3(299, 0.34, 339),
    new THREE.Vector3(319, 0.34, 333), new THREE.Vector3(338, 0.34, 326),
    new THREE.Vector3(350, 0.34, 322),
  ];
  const bridgeCurve = new THREE.CatmullRomCurve3(bridgePts);
  for (let i = 0; i < 12; i++) {
    const t = (i + 0.5) / 12;
    const p = bridgeCurve.getPointAt(t), tan = bridgeCurve.getTangentAt(t);
    const ang = Math.atan2(tan.x, tan.z);
    B.wood.add(p.x, 0.31, p.z, 3.8, 0.16, 2.15, ang, i % 2 ? 0xa9784e : 0xb98b5f);
    if (i % 2 === 0) {
      const nx = Math.cos(ang) * 1.75, nz = -Math.sin(ang) * 1.75;
      for (const s of [-1, 1]) B.wood.add(p.x + nx * s, 0.85, p.z + nz * s, 0.12, 1.15, 0.12, ang, 0x6e452e);
    }
  }
  bridgeZones.push({ points: bridgePts.map(p => [p.x, p.z]), halfWidth: 1.9, y: 0.36 });
  // 岸边亭台、杨柳、桃花
  for (let i = 0; i < 7; i++) {
    const a = rr(0.5, 2.9), r = rr(1.2, 1.45);
    const tx = 354 + Math.cos(a) * 66 * r, tz = 318 + Math.sin(a) * 54 * r;
    if (tx < 275 || tx > 432 || tz < 248 || tz > 377) continue;
    addPavilion(tx, tz, rr(2.6, 3.8), { h: rr(3, 4), roofH: rr(2.2, 2.8) });
  }
  for (let i = 0; i < 50; i++) {
    const a = rr(0, TAU), r = rr(1.08, 1.38);
    const tx = 354 + Math.cos(a) * 66 * r, tz = 318 + Math.sin(a) * 54 * r;
    if (tx < 270 || tx > 435 || tz < 245 || tz > 378) continue;
    addTree(tx, tz, i % 3 === 0 ? 'peach' : 'willow', rr(0.75, 1.15));
  }
  // 芙蓉园牌坊
  addSignMesh('曲江池', 300, 9.2, 240, 0, 12, 3, { font: 78 });
  landmarks.push({ id: 'qujiang', name: '曲江池', x: 354, z: 318, radius: 42, poem: '穿花蛱蝶深深见，点水蜻蜓款款飞', desc: '芙蓉园内曲江潋滟，画舫徐行，柳丝拂水，长安春色尽在此间。' });

  // 画舫与游船路径
  boatSpecs.push({
    type: 'painted',
    path: [[300, 330], [320, 300], [355, 285], [392, 300], [405, 330], [380, 355], [340, 352], [312, 342]],
    speed: 0.035, scale: 1.25, name: '曲江画舫',
  });
  boatSpecs.push({
    type: 'boat',
    path: [[330, 342], [350, 355], [378, 342], [390, 320], [365, 300], [335, 306]],
    speed: 0.06, scale: 0.8, name: '小游船',
  });
  boatSpecs.push({
    type: 'boat',
    path: [[320, 295], [345, 288], [372, 300], [360, 330], [330, 330]],
    speed: 0.048, scale: 0.75, name: '小游船',
  });
  // 兴庆宫龙池游船
  boatSpecs.push({ type: 'boat', path: [[318, -160], [335, -172], [365, -160], [370, -140], [345, -130], [320, -140]], speed: 0.02, scale: 0.65, name: '龙池小舟' });
}

// ---------------------------------------------------------------- 城外田园 / 曲江入口
function buildOutskirts() {
  // 明德门外御道
  const m = new THREE.Mesh(new THREE.PlaneGeometry(30, 240), new THREE.MeshStandardMaterial({ map: TEX.stone, color: 0xffefd0, roughness: 1 }));
  m.rotation.x = -Math.PI / 2; m.position.set(0, 0.02, 500); m.receiveShadow = true; scene.add(m);
  // 城外柳树
  for (let i = 0; i < 28; i++) addTree(rr(-360, 360), rr(430, 610), i % 2 ? 'willow' : 'peach', rr(0.7, 1.1));
  // 小村庄
  for (let i = 0; i < 6; i++) {
    const x = -280 + i * 38, z = 500 + (i % 2) * 30;
    addHall(x, z, 12, 9, { h: 4, roofH: 2.6, platform: 0.3, collider: true });
    addTree(x + 10, z + 8, 'willow', 0.8);
  }
  // 城外小河
  const river = new THREE.Mesh(new THREE.PlaneGeometry(300, 13), waterMat);
  river.rotation.x = -Math.PI / 2; river.position.set(-300, 0.01, 470); scene.add(river);
  waterRects.push({ minX: -450, maxX: -150, minZ: 463.5, maxZ: 476.5 });
  // 牌坊：长安
  addSignMesh('长安', 0, 11, 405, 0, 9, 3, { font: 92 });
  B.wood.add(-11, 5.5, 405, 0.6, 11, 0.6, 0, 0x7a452f);
  B.wood.add(11, 5.5, 405, 0.6, 11, 0.6, 0, 0x7a452f);
  B.red.add(0, 10.2, 405, 24, 0.6, 0.8, 0, 0xa94237);
  B.roofSmall.add(0, 10.5, 405, 26, 1.8, 4, 0, 0x6b7f76);
}
