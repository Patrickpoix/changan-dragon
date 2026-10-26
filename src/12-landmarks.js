/* ============================================================
   长安城 · 宫苑 / 塔寺 / 曲江
   ============================================================ */

// Explicit envelopes for non-batched masonry; consumed by flight and camera clearance.
const flightObstacles = [];
function recordFlightObstacle(x, z, w, d, top) {
  flightObstacles.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, top });
}
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

const waterUniforms = { time: { value: 0 }, deep: { value: new THREE.Color(0x397f83) }, shallow: { value: new THREE.Color(0x87b6a4) }, sunColor: { value: new THREE.Color(0xffe6b0) }, sunDir: { value: new THREE.Vector3(0.4, 0.8, 0.3).normalize() } };
const waterMat = new THREE.ShaderMaterial({
  uniforms: {...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),...waterUniforms},
  transparent: false,
  fog: true,
  vertexShader: `
    #include <fog_pars_vertex>
    varying vec3 vWorld; varying vec3 vNormalW;
    void main(){
      vec4 wp = modelMatrix * vec4(position,1.0);
      vWorld = wp.xyz; vNormalW = normalize(mat3(modelMatrix) * normal);
      vec4 mvPosition = viewMatrix * wp;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: `
    #include <fog_pars_fragment>
    uniform float time; uniform vec3 deep; uniform vec3 shallow; uniform vec3 sunColor; uniform vec3 sunDir;
    varying vec3 vWorld; varying vec3 vNormalW;
    void main(){
      vec2 p = vWorld.xz;
      float w1 = sin(p.x*0.42 + p.y*0.23 + time*1.2);
      float w2 = sin(p.x*0.18 - p.y*0.31 - time*0.8);
      float w3 = sin(length(p-vec2(350.0,320.0))*0.5 - time*1.6);
      float ripple = (w1 + w2 + w3) / 3.0;
      float fine1=sin(p.x*2.2+p.y*1.7+time*1.8),fine2=sin(p.x*1.4-p.y*2.6-time*1.3);
      vec3 n = normalize(vNormalW + vec3(w1*0.04+fine1*0.017, 0.0, w2*0.04+fine2*0.017));
      vec3 viewDir = normalize(cameraPosition - vWorld);
      float fres = pow(1.0 - max(dot(viewDir,n),0.0), 2.5);
      vec3 col = mix(deep, shallow, 0.42 + ripple*0.12);
      // Keep the cheaper mobile surface jade-coloured at grazing angles.
      // Linear white reflection previously washed the whole lake into grey.
      vec3 reflectedSky=mix(shallow,vec3(0.34,0.52,0.55),.4);
      col = mix(col,reflectedSky,fres*.34);
      vec3 refl = reflect(-sunDir, n);
      float spec = pow(max(dot(refl, viewDir), 0.0), 90.0);
      col += sunColor * spec * 0.8;
      float glint = smoothstep(0.72, 1.0, ripple) * 0.08;
      col += vec3(glint);
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`,
});

function addWater(cx, cz, rx, rz, seed, opts = {}) {
  const { wobble = 0.16, y = 0.04, name = '' } = opts;
  const b = blobShape(cx, cz, rx, rz, seed, wobble);
  const shore = new THREE.Mesh(new THREE.ShapeGeometry(b.shape, 32), new THREE.MeshStandardMaterial({ color: 0x89996a, roughness: 1 }));
  shore.rotation.x = -Math.PI / 2; shore.position.set(cx, 0.012, cz); shore.receiveShadow = true; shore.scale.set(1.06, 1.06, 1.06);
  scene.add(shore);
  const water = WaterSurface.create(new THREE.ShapeGeometry(b.shape, 32), waterMat, rx);
  water.rotation.x = -Math.PI / 2; water.position.set(cx, y, cz);
  scene.add(water);
  const points=b.shape.getPoints().map(p=>[cx+p.x,cz-p.y]);
  waterZones.push({cx,cz,rx,rz,points,x0:Math.min(...points.map(p=>p[0])),x1:Math.max(...points.map(p=>p[0])),z0:Math.min(...points.map(p=>p[1])),z1:Math.max(...points.map(p=>p[1]))});
  pondMeshes.push(water);
  // 荷叶
  const lotus = new Batch(new THREE.CircleGeometry(0.5, 10), toon(0x5c9a62), { cast: false });
  const flower = new Batch(UNIT_SPHERE, toon(0xf2a7b6), { cast: false });
  for (let i = 0; i < 26; i++) {
    const a = rr(0, TAU), r = rr(0.76, 0.93);
    const x = cx + Math.cos(a) * rx * r, z = cz + Math.sin(a) * rz * r;
    lotus.add(x, y + 0.025, z, rr(0.9, 1.8), 1, rr(0.9, 1.8), rr(0, TAU), pick([0x5d9a63, 0x74aa6d, 0x4e8c5b]), -Math.PI / 2);
    if (i % 5 === 0) {
      for(let p=0;p<7;p++) {
        const a=p*TAU/7;
        flower.add(x+Math.cos(a)*.11,y+.11,z+Math.sin(a)*.11,.25,.09,.14,-a,0xf3b3c0,0,-.3);
      }
      flower.add(x,y+.15,z,.14,.11,.14,0,0xf1ce78);
    }
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
    recordFlightObstacle(x, z, w, d, h);
  };
  addWall(-114, -220, 192, 3); addWall(114, -220, 192, 3); // 朱雀门两侧
  addWall(-210, -252.5, 3, 65); addWall(210, -252.5, 3, 65);
  addWall(-115, -285, 190, 3); addWall(115, -285, 190, 3); // 承天门两侧
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
  addWall(-130, -332.5, 3, 95); addWall(115, -332.5, 3, 95);
  // Shared north boundary and Xuanwu gate are built once by addCityWalls().

  // 太极殿
  addHall(0, -334, 44, 24, { h: 9, roofH: 6.2, roofKind: 'gold', columns: true, doors: true, windows: true, collider: true, platform: 1.6 });
  addCorridor(-22, -322, -50, -306, { w: 4 });
  addCorridor(22, -322, 50, -306, { w: 4 });
  addHall(0, -360, 30, 17, { h: 7.2, roofH: 4.6, roofKind: 'gold', collider: true, platform: 1.1 });
  addPavilion(-68, -318, 4, { h: 3.6, roofH: 2.6 });
  addPavilion(68, -318, 4, { h: 3.6, roofH: 2.6 });
  // 宫内树
  for (let i = 0; i < 18; i++) addTree(rr(-115, 115), rr(-372, -292), i % 3 ? 'pine' : 'peach', rr(0.7, 1.0));
  landmarks.push({ id: 'taiji', name: '太极宫', x: 0, z: -340, radius: 32, poem: '九天阊阖开宫殿，万国衣冠拜冕旒', desc: '大唐正宫，太极殿巍然中轴，朱墙青瓦，气象肃穆。' });
}

// ---------------------------------------------------------------- 大明宫
function buildDamingPalace() {
  const wallH = 7.5;
  const wm = new THREE.MeshStandardMaterial({ map: TEX.dirt, color: 0xf2d3a8, roughness: 1 });
  const addWall = (x, z, w, d) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, d), wm);
    m.position.set(x, wallH / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    addCollider(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 'daming');
    recordFlightObstacle(x, z, w, d, wallH);
  };
  // 宫墙，南墙中开丹凤门
  addWall(150, -520, 260, 4);
  addWall(20, -450, 4, 140); addWall(280, -450, 4, 140);
  addWall(71.5, -380, 103, 4); addWall(228.5, -380, 103, 4);
  addGateHouse(150, -380, 54, 20, 11, 5, '丹凤门', true, false);
  // 含元殿：高台 + 双檐
  B.stone.add(150, 3.4, -430, 66, 6.8, 42, 0, 0xd8c9ad);
  B.stone.add(150, 6.9, -430, 58, 0.6, 34, 0, 0xe2d4b9);
  addHall(150, -432, 52, 26, { h: 11.5, roofH: 3.6, roofKind: 'gold', roofShape: 'hip', platform: 7.2, collider: false, columns: true, windows: true, redWall: true });
  // Terrace is walkable via its actual stairs; only the enclosed hall blocks movement.
  groundPatches.push({ x0: 117, x1: 183, z0: -451, z1: -409, height: 6.8 });
  groundPatches.push({ x0: 121, x1: 179, z0: -447, z1: -413, height: 7.2 });
  addCollider(124, 176, -442.8, -421.2, 'hanyuan-hall');
  // Upper timber storey meets the lower hipped skirt. Its windows, columns and
  // bracket cornice replace the unsupported, blank red slab between two roofs.
  const upperBase = 20.45, upperH = 3.8, upperEave = upperBase + upperH - 0.05;
  B.red.add(150, upperBase + upperH / 2, -432, 32, upperH, 13, 0, 0x9c4938);
  B.roofGable.add(150, upperEave, -432, 35.4, 5, 16.4, 0, 0x5c7475);
  addHallCraft(150, -432, 32, 13, upperH, upperBase, 5, 0, { hipGable: true, columns: true, simple: false, porch: 0 });
  for (const side of [-1, 1]) {
    for (let i = -4; i <= 4; i++) {
      const x = 150 + i * 3.7, z = -432 + side * 6.62;
      B.columns.add(x, 22.35, z, 0.42, 3.8, 0.42, 0, 0xb54d37);
      if (i === 4) continue;
      B.dark.add(x + 1.85, 22.25, z, 3.08, 2.2, 0.12, 0, 0x363c30);
      for (let j = -3; j <= 3; j++) B.trim.add(x + 1.85 + j * 0.4, 22.25, z + side * 0.09, 0.085, 2.24, 0.09, 0, 0xc18d56);
      for (const y of [21.12, 22.8, 23.38]) B.trim.add(x + 1.85, y, z + side * 0.09, 3.2, 0.1, 0.1, 0, 0xb78d5d);
    }
    for (let j = -2; j <= 2; j++) B.trim.add(150 + side * 16.08, 22.35, -432 + j * 2.6, 0.15, 3.8, 0.2, 0, 0xc17f4e);
    for (const y of [21.15, 23.3]) B.trim.add(150 + side * 16.08, y, -432, 0.16, 0.16, 13, 0, 0xc17f4e);
  }
  B.dark.add(150, upperEave + 4.8, -432, 24, 0.4, 0.65, 0, 0x667a6b);
  addSignMesh('含元殿', 150, 17.1, -416.4, 0, 7.2, 2.1, { font: 74 });
  // Painted beam panels and lintels are geometric components under the deep portico.
  for (let i = -5; i <= 5; i++) {
    B.trim.add(150 + i * 4.3, 17.0, -418.5, 3.5, 0.65, 0.24, 0, 0x315c5b);
    B.trim.add(150 + i * 4.3, 17.0, -418.34, 2.7, 0.3, 0.08, 0, 0xb39a60);
    addLantern(150 + i * 4.3, 14.9, -418.4, 1.1);
  }
  // 翔鸾阁 / 栖凤阁
  for (const side of [-1, 1]) {
    const tx = 150 + side * 41, tz = -430;
    B.stone.add(tx, 3, tz, 16, 6, 16, 0, 0xd4c3a4);
    addPavilion(tx, tz, 5.2, { h: 6.4, roofH: 4, platform: 6.1, roofKind: 'gold' });
    addCorridor(150 + side * 22, -423, tx - side * 5, -427, { w: 4, floor: 6.1 });
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
    recordFlightObstacle(x, z, w, d, h);
  };
  addWall((x0 + x1) / 2, z0, x1 - x0, 3.5);
  addWall((x0 + 327) / 2, z1, 327 - x0, 3.5);
  addWall((357 + x1) / 2, z1, x1 - 357, 3.5);
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
  addHall(398, -112, 18, 9, { h: 5.0, roofH: 2.6, platform: 8.0, upperStorey: true, collider: false, windows: true });
  addHall(398, -114, 12, 6, { h: 3.6, roofH: 2.2, platform: 14.0, upperStorey: true, collider: false });
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
  const stoneMat = new THREE.MeshStandardMaterial({ map: TEX.stone, color: 0xe4cfad, roughness: 1 });
  B.stone.add(x, 1.2, z, baseW + 12, 2.4, baseW + 12, 0, 0xd2c3a6);
  let y = 2.4;
  const tierH = totalH / levels;
  for (let i = 0; i < levels; i++) {
    const t = i / (levels - 1), w = lerp(baseW, baseW * 0.5, t), hh = tierH * (i === 0 ? 1.18 : 0.94);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, w), stoneMat);
    m.position.set(x, y + hh / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    recordFlightObstacle(x, z, w + 2.2, w + 2.2, y + hh + 0.38);
    B.stone.add(x, y + hh - 0.1, z, w + 1.2, 0.3, w + 1.2, 0, 0xc8b89a);
    B.dark.add(x, y + hh + 0.16, z, w + 2.2, 0.35, w + 2.2, 0, 0x606e64);
    for (const ry of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      const c = Math.cos(ry), s = Math.sin(ry), nw = w * 0.28, nh = hh * 0.56;
      const put = (batch, lx, wy, lz, sx, sy, sz, color) => batch.add(x + lx * c + lz * s, wy, z - lx * s + lz * c, sx, sy, sz, ry, color);
      put(B.dark, 0, y + hh * 0.5, w / 2 + 0.025, nw, nh, 0.07, 0x514536);
      for (const side of [-1, 1]) put(B.stone, side * (nw / 2 + 0.12), y + hh * 0.5, w / 2 + 0.1, 0.2, nh + 0.24, 0.2, 0xd6c2a0);
      for (const side of [-1, 1]) put(B.stone, 0, y + hh * 0.5 + side * (nh / 2 + 0.08), w / 2 + 0.12, nw + 0.48, 0.18, 0.3, 0xdac9ac);
      // A pair of fine masonry pilasters gives each tier readable volume.
      for (const side of [-1, 1]) put(B.stone, side * w * 0.4, y + hh / 2, w / 2 + 0.04, 0.2, hh - 0.25, 0.15, 0xd5c19f);
    }
    y += hh + 0.5;
  }
  for (let i = 0; i < 4; i++) B.lanternCap.add(x, y + 0.8 + i * 0.6, z, 0.5 - i * 0.08, 0.35, 0.5 - i * 0.08, 0, 0xb69b60);
  B.lanternCap.add(x, y + 3.4, z, 0.2, 1.6, 0.2, 0, 0xb69b60);
  recordFlightObstacle(x, z, 1.2, 1.2, y + 4.2);
  addCollider(x - baseW / 2 - 2, x + baseW / 2 + 2, z - baseW / 2 - 2, z + baseW / 2 + 2, 'pagoda');
  addSignMesh(name, x, 3.5, z + baseW / 2 + 6.2, 0, 8, 2.2, { font: 62 });
}

function buildPagodas() {
  // 大慈恩寺 · 大雁塔
  const x = 216, z = 283;
  const wm = new THREE.MeshStandardMaterial({ map: TEX.dirt, color: 0xf6dfbc, roughness: 1 });
  const templeWall = (wx, wz, ww, wd) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(ww, 3.2, wd), wm);
    m.position.set(wx, 1.6, wz); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    addCollider(wx - ww / 2, wx + ww / 2, wz - wd / 2, wz + wd / 2, 'templewall');
    recordFlightObstacle(wx, wz, ww, wd, 3.2);
    B.dark.add(wx, 3.22, wz, ww + 0.25, 0.22, wd + 0.25, 0, 0x5b6860);
  };
  templeWall(x, z - 31, 62, 2.4);
  templeWall(x - 31, z, 2.4, 62); templeWall(x + 31, z, 2.4, 62);
  templeWall(x - 21, 315, 20, 2.4); templeWall(x + 21, 315, 20, 2.4);
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
  landmarks.push({ id: 'xiaoyanta', name: '小雁塔', x: sx, z: sz, radius: 22, poem: '晨钟暮鼓传巷陌，塔铃清越送斜阳', desc: '荐福寺内十三层密檐砖塔，晨钟暮鼓，是长安城南的清幽一景。' });
}

// ---------------------------------------------------------------- 曲江池
function buildQujiang() {
  const qujiang=addWater(354, 318, 66, 54, 2.4, { wobble: 0.18 });
  landZones.push({cx:354,cz:318,x0:345.5,x1:362.5,z0:312,z1:324});
  buildLakeGarden(qujiang);
  // 湖心岛
  B.stone.add(354, 0.18, 318, 17, 0.36, 12, 0, 0xd9c7a5);
  addPavilion(354, 318, 3.6, { h: 3.6, roofH: 2.8, platform: 0.45, roofKind: 'gold' });
  addTree(347, 314, 'peach', 0.6);
  // 紫云楼（三层，北岸）
  B.stone.add(300, 1.0, 262, 30, 2, 21, 0, 0xd4c3a4);
  addHall(300, 266, 26, 15, { h: 6.4, roofH: 3.6, platform: 1.6, collider: false, windows: true });
  addHall(300, 262, 19, 9, { h: 4.8, roofH: 2.8, platform: 8.2, upperStorey: true, collider: false });
  addSignMesh('紫云楼', 300, 15.5, 257, 0, 10, 2.7, { font: 60 });
  // 曲江亭与连廊
  addPavilion(405, 278, 4.8, { h: 4.2, roofH: 3.2, platform: 0.7, roofKind: 'gold', collider: true });
  addCorridor(322, 280, 388, 280, { w: 3.8 });
  addCorridor(322, 280, 322, 261, { w: 3.8 });
  addCorridor(388, 280, 388, 261, { w: 3.8 });
  // The northern promenade connects the gallery to occupied waterfront shops.
  B.stone.add(354, 0.09, 260, 96, 0.18, 8.0, 0, 0xd8ccb3);
  bridgeZones.push({ points: [[306,260],[402,260]], halfWidth:4.1, y:0.18, squareEnds:true });
  addShop(343, 247, 16, 12, 0, '茶坊', { awning:0xb39969 });
  addShop(366, 247, 17, 12, 0, '绸缎庄', { awning:0x729086 });
  addShop(389, 247, 16, 12, 0, '酒家', { twoStory:false, awning:0xb07259 });
  for (const x of [318, 334, 357, 380, 399]) {
    addLantern(x,3.3,263,0.75);
    B.wood.add(x,1.6,263,0.13,3.2,0.13,0,0x795238);
  }
  addPavilion(300, 354, 3.8, { h: 3.8, roofH: 2.8 });
  // 曲桥：西岸通往湖心岛
  const bridgePts = [
    new THREE.Vector3(281, 0.2, 344), new THREE.Vector3(299, 0.64, 339),
    new THREE.Vector3(319, 0.92, 333), new THREE.Vector3(338, 0.64, 326),
    new THREE.Vector3(350, 0.36, 322),
  ];
  const bridgeCurve = new THREE.CatmullRomCurve3(bridgePts);
  const bridgeCount = Math.ceil(bridgeCurve.getLength() / 1.15);
  const samples = Array.from({ length: bridgeCount + 1 }, (_, i) => bridgeCurve.getPointAt(i / bridgeCount));
  const deckVertices = [], deckUVs = [], deckIndices = [];
  samples.forEach((p, i) => {
    const tangent = bridgeCurve.getTangentAt(i / bridgeCount);
    const n = new THREE.Vector2(tangent.z, -tangent.x).normalize();
    for (const dy of [0, -0.18]) for (const side of [-1, 1]) {
      deckVertices.push(p.x + n.x * side * 1.9, p.y + dy, p.z + n.y * side * 1.9);
      deckUVs.push((side + 1) / 2, i * 0.32);
    }
    if (i < bridgeCount) {
      const a = i * 4, b = a + 4;
      deckIndices.push(a, b, a + 1, a + 1, b, b + 1);
      deckIndices.push(a + 2, a + 3, b + 2, a + 3, b + 3, b + 2);
      deckIndices.push(a, a + 2, b, a + 2, b + 2, b);
      deckIndices.push(a + 1, b + 1, a + 3, a + 3, b + 1, b + 3);
    }
  });
  const last = bridgeCount * 4;
  deckIndices.push(0, 1, 2, 1, 3, 2, last, last + 2, last + 1, last + 1, last + 2, last + 3);
  const deckGeo = new THREE.BufferGeometry();
  deckGeo.setAttribute('position', new THREE.Float32BufferAttribute(deckVertices, 3));
  deckGeo.setAttribute('uv', new THREE.Float32BufferAttribute(deckUVs, 2));
  deckGeo.setIndex(deckIndices); deckGeo.computeVertexNormals();
  const deck = new THREE.Mesh(deckGeo, new THREE.MeshStandardMaterial({ map: TEX.wood, color: 0xad825b, roughness: 0.93, side: THREE.DoubleSide }));
  deck.castShadow = true; deck.receiveShadow = true; scene.add(deck);
  for (let i = 0; i < bridgeCount; i++) {
    const a = samples[i], b = samples[i + 1], dx = b.x - a.x, dz = b.z - a.z;
    const run = Math.hypot(dx, dz), ang = Math.atan2(dx, dz), slope = Math.atan2(b.y - a.y, run);
    // Narrow transverse seams show individual deck boards on the continuous surface.
    B.trim.add(a.x, a.y + 0.006, a.z, 3.8, 0.015, 0.025, ang, 0x75563c);
    for (const side of [-1, 1]) {
      const nx = Math.cos(ang) * 1.78 * side, nz = -Math.sin(ang) * 1.78 * side;
      B.trim.add((a.x + b.x) / 2 + nx, (a.y + b.y) / 2 + 0.84, (a.z + b.z) / 2 + nz, 0.12, 0.12, run + 0.1, ang, 0x774d34);
      if (i % 3 === 0 || i === bridgeCount - 1) {
        B.wood.add(a.x + nx, a.y + 0.46, a.z + nz, 0.15, 1.1, 0.15, ang, 0x83573a);
        B.stone.add(a.x + nx, a.y + 1.03, a.z + nz, 0.2, 0.16, 0.2, ang, 0xc6b38c);
        B.wood.add(a.x + nx, a.y / 2 - 0.15, a.z + nz, 0.24, a.y + 0.7, 0.24, ang, 0x79533c);
      }
    }
  }
  bridgeZones.push({ points: samples.map(p => [p.x, p.z]), heights: samples.map(p => p.y), halfWidth: 1.9, y: 0.36 });
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
    path: [[365, 292], [388, 302], [402, 322], [390, 340], [368, 343], [374, 320]],
    speed: 0.0045, scale: 1, name: '曲江画舫',
  });
  // Quiet northwestern and eastern courses are disjoint from the low bridge,
  // island and each other. Physical footprints are checked in boat_test.py.
  boatSpecs.push({type:'painted',path:[[316,297],[330,290],[344,292],[343,301],[328,308],[316,305]],
    cruiseSpeed:.58,scale:.72,curtain:0x84aaa2,name:'碧帘画舫'});
  // A moored pleasure barge can be boarded from the western landing.
  B.wood.add(290.5,0.23,311,15,0.46,3.6,0,0xaa8058);
  bridgeZones.push({points:[[283,311],[298,311]],halfWidth:1.9,y:0.46,squareEnds:true});
  bridgeZones.push({points:[[299,305.7],[299,316.3]],halfWidth:1.75,y:1.11,squareEnds:true});
  for(const x of [284,289,294]) for(const side of [-1,1]) {
    B.wood.add(x,0.26,311+side*1.5,0.25,0.9,0.25,0,0x795139);
    B.stone.add(x,0.74,311+side*1.5,0.32,0.12,0.32,0,0xd3c1a0);
  }
  boatSpecs.push({type:'painted',path:[[299,311],[299,311]],moored:true,scale:1,name:'临水画舫'});
  boatSpecs.push({
    type: 'boat',
    path: [[313,347],[319,344],[326,348],[323,354],[316,355],[311,351]],
    cruiseSpeed: .58, scale: 0.8, name: '采风小舟',
  });
  boatSpecs.push({
    type: 'boat',
    path: [[411,311],[414,315],[414,328],[411,332],[411,325],[411,317]],
    cruiseSpeed: .5, scale: 0.75, name: '柳岸小舟',
  });
  // 兴庆宫龙池游船
  boatSpecs.push({ type: 'boat', path: [[318, -160], [335, -172], [365, -160], [370, -140], [345, -130], [320, -140]], cruiseSpeed: .6, scale: 0.65, name: '龙池小舟' });
}

// ---------------------------------------------------------------- 城外田园 / 曲江入口
function buildOutskirts() {
  // 明德门外御道
  const approach=new THREE.PlaneGeometry(30,240),uv=approach.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*10,uv.getY(i)*80);
  const m = new THREE.Mesh(approach, SurfaceLibrary.paving(0xd7d0bd));
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
