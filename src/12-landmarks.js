/* ============================================================
   长安城 · 宫苑 / 塔寺 / 曲江
   v5: 精修核心地标建模细节
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
      float w3 = sin(length(p-vec2(480.0,420.0))*0.5 - time*1.6);
      float ripple = (w1 + w2 + w3) / 3.0;
      float fine1=sin(p.x*2.2+p.y*1.7+time*1.8),fine2=sin(p.x*1.4-p.y*2.6-time*1.3);
      vec3 n = normalize(vNormalW + vec3(w1*0.04+fine1*0.017, 0.0, w2*0.04+fine2*0.017));
      vec3 viewDir = normalize(cameraPosition - vWorld);
      float fres = pow(1.0 - max(dot(viewDir,n),0.0), 2.5);
      vec3 col = mix(deep, shallow, 0.42 + ripple*0.12);
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

// ============================================================
// v5: 精细唐式建筑组件（精修版）
// ============================================================

// 斗拱组件 — 五层斗拱层（精修）
function addDougongRow(x, y, z, width, count, scale) {
  scale = scale || 1;
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const dx = (t - 0.5) * width;
    
    // 第一层：坐斗
    B.trim.add(x + dx, y, z, 1.2 * scale, 0.3 * scale, 0.8 * scale, 0, 0xd4a574);
    // 第二层：瓜拱
    B.trim.add(x + dx, y + 0.35 * scale, z, 0.8 * scale, 0.25 * scale, 1.5 * scale, 0, 0x8b4513);
    // 第三层：万拱
    B.trim.add(x + dx, y + 0.6 * scale, z, 1.0 * scale, 0.2 * scale, 0.6 * scale, 0, 0xd4a574);
    // 第四层：翘
    B.trim.add(x + dx, y + 0.85 * scale, z, 0.6 * scale, 0.15 * scale, 1.2 * scale, 0, 0x8b4513);
    // 第五层：昂
    B.trim.add(x + dx, y + 1.05 * scale, z, 0.4 * scale, 0.12 * scale, 1.8 * scale, 0, 0xd4a574);
  }
}

// 格扇门窗 — 精细格纹（精修）
function addLatticeWindow(x, y, z, w, h, rotY) {
  rotY = rotY || 0;
  // 外框
  B.trim.add(x, y, z, w + 0.2, h + 0.2, 0.15, rotY, 0x6b3410);
  // 窗纸
  B.dark.add(x, y, z + 0.02, w, h, 0.08, rotY, 0xfff8dc);
  
  // 竖向格条
  const vBars = Math.floor(w / 0.6);
  for (let i = 1; i < vBars; i++) {
    const t = i / vBars;
    const dx = (t - 0.5) * w;
    B.trim.add(x + dx, y, z + 0.05, 0.05, h, 0.05, rotY, 0x6b3410);
  }
  
  // 横向格条
  const hBars = Math.floor(h / 0.6);
  for (let i = 1; i < hBars; i++) {
    const t = i / hBars;
    const dy = (t - 0.5) * h;
    B.trim.add(x, y + dy, z + 0.05, w, 0.05, 0.05, rotY, 0x6b3410);
  }
  
  // 上半部分菱形格纹
  for (let i = 0; i < Math.floor(w / 1.2); i++) {
    const dx = (i / Math.floor(w / 1.2) - 0.5) * w;
    B.trim.add(x + dx, y + h * 0.25, z + 0.06, 0.08, 0.08, 0.03, rotY, 0x8b4513);
  }
}

// 彩画装饰 — 梁枋彩绘（精修和玺彩画）
function addCaifeng(x, y, z, width, rotY) {
  rotY = rotY || 0;
  // 主底色：青绿
  B.trim.add(x, y, z, width, 0.4, 0.1, rotY, 0x2d5a3d);
  // 上金线
  B.trim.add(x, y + 0.22, z, width, 0.05, 0.12, rotY, 0xd4af37);
  // 下金线
  B.trim.add(x, y - 0.22, z, width, 0.05, 0.12, rotY, 0xd4af37);
  
  // 彩画图案：龙凤
  for (let i = 0; i < Math.floor(width / 2); i++) {
    const dx = (i / Math.floor(width / 2) - 0.5) * width;
    // 红色装饰
    B.trim.add(x + dx, y, z + 0.01, 0.3, 0.15, 0.05, rotY, 0x8b0000);
    // 金色点缀
    B.trim.add(x + dx, y + 0.05, z + 0.02, 0.15, 0.08, 0.03, rotY, 0xd4af37);
  }
}

// v5: 瓦垄纹理 — 屋顶瓦片细节（精修）
function addTileRoofDetail(x, y, z, width, depth, rotY) {
  rotY = rotY || 0;
  const tileCount = Math.floor(width / 0.8);
  for (let i = 0; i < tileCount; i++) {
    const t = i / (tileCount - 1);
    const dx = (t - 0.5) * width;
    // 瓦垄
    B.roofGable.add(x + dx, y, z, 0.22, 0.1, depth, rotY, 0x4a6670);
    // 瓦当（瓦头）
    B.trim.add(x + dx, y + 0.05, z + depth / 2, 0.2, 0.08, 0.05, rotY, 0xd4af37);
  }
}

// v5: 鸱吻 — 屋脊两端装饰（精修）
function addChiwen(x, y, z, scale) {
  scale = scale || 1;
  // 主体
  B.roofGable.add(x, y, z, 0.6 * scale, 1.2 * scale, 0.4 * scale, 0, 0x4a6670);
  // 金色装饰
  B.trim.add(x, y + 0.6 * scale, z, 0.8 * scale, 0.3 * scale, 0.3 * scale, 0, 0xd4af37);
  // 尾部翘起
  B.trim.add(x + 0.3 * scale, y + 1.0 * scale, z, 0.2 * scale, 0.6 * scale, 0.2 * scale, 0, 0xd4af37);
}

// v5: 栏杆 — 汉白玉栏杆
function addBalustrade(x, y, z, width, rotY) {
  rotY = rotY || 0;
  // 望柱
  const postCount = Math.floor(width / 2.5);
  for (let i = 0; i <= postCount; i++) {
    const t = i / postCount;
    const dx = (t - 0.5) * width;
    B.stone.add(x + dx, y + 0.4, z, 0.25, 0.8, 0.25, rotY, 0xe8e0d0);
    B.stone.add(x + dx, y + 0.9, z, 0.15, 0.2, 0.15, rotY, 0xd0c8b8);
  }
  // 栏板
  B.stone.add(x, y + 0.6, z, width, 0.15, 0.1, rotY, 0xe8e0d0);
}

// v5: 台阶 — 汉白玉台阶
function addStairs(x, y, z, width, height, steps) {
  const stepH = height / steps;
  const stepD = 0.8;
  for (let i = 0; i < steps; i++) {
    const stepY = y + stepH * i + stepH / 2;
    const stepZ = z + stepD * i;
    B.stone.add(x, stepY, stepZ, width, stepH, stepD, 0, 0xe0d8c8);
  }
}

// v5: 塔门窗 — 精细塔门塔窗
function addPagodaWindow(x, y, z, w, h, rotY) {
  rotY = rotY || 0;
  // 门框
  B.stone.add(x, y, z, w + 0.4, h + 0.4, 0.15, rotY, 0xc8b89a);
  // 门洞
  B.dark.add(x, y, z + 0.02, w, h, 0.1, rotY, 0x2a2520);
  // 门楣装饰
  B.trim.add(x, y + h / 2 + 0.2, z + 0.05, w + 0.2, 0.15, 0.08, rotY, 0xd4af37);
  // 门框装饰线
  B.trim.add(x - w / 2 - 0.1, y, z + 0.05, 0.08, h, 0.05, rotY, 0xd4af37);
  B.trim.add(x + w / 2 + 0.1, y, z + 0.05, 0.08, h, 0.05, rotY, 0xd4af37);
}

// ============================================================
// 皇城 / 太极宫
// ============================================================
function buildImperialCity() {
  const wallH = 6.4;
  const wm = new THREE.MeshStandardMaterial({ map: TEX.dirt, color: 0xf1d1a4, roughness: 1 });
  const addWall = (x, z, w, d, h = wallH, mat = wm) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, h / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    addCollider(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 'imperialwall');
    recordFlightObstacle(x, z, w, d, h);
  };
  
  addWall(-150, -320, 240, 3); addWall(150, -320, 240, 3);
  addWall(-270, -360, 3, 80); addWall(270, -360, 3, 80);
  addWall(-150, -400, 240, 3); addWall(150, -400, 240, 3);
  addGateHouse(0, -320, 44, 18, 9, 4, '朱雀门', false, false);
  addGateHouse(0, -400, 50, 20, 10, 4, '承天门', true, false);
  addSignMesh('皇城', 0, 12.4, -397, 0, 12, 3.6, { font: 84 });

  for (let i = 0; i < 6; i++) {
    const side = i < 3 ? -1 : 1;
    const x = side * (70 + (i % 3) * 75);
    const z = -360 + Math.floor(i / 3) * 25;
    if (Math.abs(x) > 230) continue;
    addCompound(x, z, 48, 35, 0, false);
  }
  
  addPavilion(-220, -350, 5.2, { h: 5.6, roofH: 4, roofKind: 'gold', collider: true });
  addPavilion(220, -350, 5.2, { h: 5.6, roofH: 4, roofKind: 'gold', collider: true });

  addWall(-165, -445, 3, 110); addWall(150, -445, 3, 110);

  // 太极殿 — v5 精修
  addHall(0, -450, 56, 30, { h: 11, roofH: 7.5, roofKind: 'gold', columns: true, doors: true, windows: true, collider: true, platform: 2.0 });
  
  addDougongRow(0, 13.5, -435, 50, 12, 1.0);
  addCaifeng(0, 12.8, -434.5, 52, 0);
  addLatticeWindow(-15, 8, -434.8, 4, 5, 0);
  addLatticeWindow(0, 8, -434.8, 5, 5, 0);
  addLatticeWindow(15, 8, -434.8, 4, 5, 0);
  
  // v5: 瓦垄和鸱吻
  addTileRoofDetail(0, 18.5, -440, 55, 25, 0);
  addChiwen(-28, 20, -440, 1.2);
  addChiwen(28, 20, -440, 1.2);
  
  // v5: 栏杆和台阶
  addBalustrade(0, 2.2, -434, 56, 0);
  addStairs(0, 0, -430, 12, 2.0, 8);
  
  addCorridor(-28, -435, -65, -415, { w: 5 });
  addCorridor(28, -435, 65, -415, { w: 5 });
  addHall(0, -480, 38, 21, { h: 9, roofH: 5.6, roofKind: 'gold', collider: true, platform: 1.5 });
  addPavilion(-85, -430, 5, { h: 4.5, roofH: 3.4 });
  addPavilion(85, -430, 5, { h: 4.5, roofH: 3.4 });
  
  for (let i = 0; i < 25; i++) addTree(rr(-145, 145), rr(-495, -405), i % 3 ? 'pine' : 'peach', rr(0.8, 1.2));
  landmarks.push({ id: 'taiji', name: '太极宫', x: 0, z: -455, radius: 40, poem: '九天阊阖开宫殿，万国衣冠拜冕旒', desc: '大唐正宫，太极殿巍然中轴，朱墙青瓦，气象肃穆。' });
}

// ============================================================
// 大明宫
// ============================================================
function buildDamingPalace() {
  const wallH = 9.0;
  const wm = new THREE.MeshStandardMaterial({ map: TEX.dirt, color: 0xf2d3a8, roughness: 1 });
  const addWall = (x, z, w, d) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, d), wm);
    m.position.set(x, wallH / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    addCollider(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 'daming');
    recordFlightObstacle(x, z, w, d, wallH);
  };
  
  const DX = 320, DZ = -460;
  addWall(DX, DZ - 90, 340, 5);
  addWall(DX - 167, DZ - 20, 5, 150); addWall(DX + 167, DZ - 20, 5, 150);
  addWall(DX - 80, DZ + 55, 155, 5); addWall(DX + 80, DZ + 55, 155, 5);
  addGateHouse(DX, DZ + 55, 68, 25, 14, 6, '丹凤门', true, false);
  
  // 含元殿：高台 + 双檐
  B.stone.add(DX, 4.5, DZ - 20, 85, 9, 55, 0, 0xd8c9ad);
  B.stone.add(DX, 9.2, DZ - 20, 75, 0.8, 45, 0, 0xe2d4b9);
  addHall(DX, DZ - 22, 68, 34, { h: 14, roofH: 4.8, roofKind: 'gold', roofShape: 'hip', platform: 9.5, collider: false, columns: true, windows: true, redWall: true });
  groundPatches.push({ x0: DX - 48, x1: DX + 48, z0: DZ - 45, z1: DZ + 1, height: 9.0 });
  groundPatches.push({ x0: DX - 45, x1: DX + 45, z0: DZ - 42, z1: DZ - 2, height: 9.5 });
  addCollider(DX - 38, DX + 38, DZ - 35.5, DZ - 8.5, 'hanyuan-hall');
  
  addDougongRow(DX, 24, DZ - 5, 60, 15, 1.2);
  addCaifeng(DX, 23.3, DZ - 4.8, 62, 0);
  
  const upperBase = 26.8, upperH = 5.0, upperEave = upperBase + upperH - 0.05;
  B.red.add(DX, upperBase + upperH / 2, DZ - 22, 42, upperH, 17, 0, 0x9c4938);
  B.roofGable.add(DX, upperEave, DZ - 22, 46.5, 6, 21.5, 0, 0x5c7475);
  addHallCraft(DX, DZ - 22, 42, 17, upperH, upperBase, 6, 0, { hipGable: true, columns: true, simple: false, porch: 0 });
  
  // v5: 上层瓦垄和鸱吻
  addTileRoofDetail(DX, upperEave + 1, DZ - 22, 42, 18, 0);
  addChiwen(DX - 20, upperEave + 4, DZ - 22, 1.5);
  addChiwen(DX + 20, upperEave + 4, DZ - 22, 1.5);
  
  for (let i = -3; i <= 3; i++) {
    addLatticeWindow(DX + i * 6, 29, DZ - 13.2, 4, 3.5, 0);
  }
  
  for (const side of [-1, 1]) {
    for (let i = -5; i <= 5; i++) {
      const x = DX + i * 4.8, z = DZ - 22 + side * 8.6;
      B.columns.add(x, 29.3, z, 0.5, 5.0, 0.5, 0, 0xb54d37);
      if (i === 5) continue;
      B.dark.add(x + 2.4, 29.2, z, 4.0, 2.8, 0.15, 0, 0x363c30);
      for (let j = -4; j <= 4; j++) B.trim.add(x + 2.4 + j * 0.5, 29.2, z + side * 0.12, 0.11, 2.85, 0.11, 0, 0xc18d56);
      for (const y of [27.8, 30.0, 30.8]) B.trim.add(x + 2.4, y, z + side * 0.12, 4.2, 0.12, 0.12, 0, 0xb78d5d);
    }
    for (let j = -3; j <= 3; j++) B.trim.add(DX + side * 21.5, 29.3, DZ - 22 + j * 3.4, 0.18, 5.0, 0.25, 0, 0xc17f4e);
    for (const y of [27.8, 30.6]) B.trim.add(DX + side * 21.5, y, DZ - 22, 0.2, 0.2, 17, 0, 0xc17f4e);
  }
  
  B.dark.add(DX, upperEave + 6.0, DZ - 22, 31, 0.5, 0.8, 0, 0x667a6b);
  addSignMesh('含元殿', DX, 21.5, DZ - 5.5, 0, 9.5, 2.8, { font: 96 });
  
  for (let i = -6; i <= 6; i++) {
    B.trim.add(DX + i * 5.5, 21.3, DZ - 7.2, 4.5, 0.8, 0.3, 0, 0x315c5b);
    B.trim.add(DX + i * 5.5, 21.3, DZ - 7.0, 3.5, 0.4, 0.1, 0, 0xb39a60);
    addLantern(DX + i * 5.5, 18.6, DZ - 7.1, 1.4);
  }
  
  // v5: 殿前栏杆和台阶
  addBalustrade(DX, 9.7, DZ - 45, 80, 0);
  addStairs(DX, 0, DZ - 40, 15, 9.5, 12);
  
  for (const side of [-1, 1]) {
    const tx = DX + side * 52, tz = DZ - 18;
    B.stone.add(tx, 4, tz, 20, 8, 20, 0, 0xd4c3a4);
    addPavilion(tx, tz, 6.5, { h: 8, roofH: 5, platform: 8.1, roofKind: 'gold' });
    addCorridor(DX + side * 28, DZ - 12, tx - side * 6, DZ - 16, { w: 5, floor: 8.1 });
  }
  
  addHall(DX, DZ - 60, 50, 25, { h: 10.5, roofH: 6.0, roofKind: 'gold', platform: 1.5, collider: true, windows: true });
  addHall(DX, DZ - 95, 42, 21, { h: 9.2, roofH: 5.2, roofKind: 'gold', platform: 1.2, collider: true });
  
  addWater(DX + 95, DZ - 85, 40, 22, 3.1, { wobble: 0.2 });
  addPavilion(DX + 58, DZ - 88, 4.5, { h: 4.5, roofH: 3.5 });
  addCorridor(DX, DZ - 75, DX + 70, DZ - 88, { w: 4.2 });
  
  for (let i = 0; i < 50; i++) addTree(rr(DX - 155, DX + 155), rr(DZ - 110, DZ + 40), i % 3 ? 'pine' : 'peach', rr(0.8, 1.3));
  addSignMesh('大明宫', DX, 22, DZ + 62, 0, 16, 4, { font: 100 });
  landmarks.push({ id: 'daming', name: '大明宫', x: DX, z: DZ - 25, radius: 60, poem: '金阙晓钟开万户，玉阶仙仗拥千官', desc: '千宫之宫。丹凤门五门洞开，含元殿高踞龙首原，双檐如翼。' });
}

// ============================================================
// 兴庆宫
// ============================================================
function buildXingqing() {
  const X0 = 520, X1 = 720, Z0 = -270, Z1 = -120;
  const h = 6.5;
  const wm = new THREE.MeshStandardMaterial({ map: TEX.dirt, color: 0xe0cbaa, roughness: 1 });
  const addWall = (x, z, w, d) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wm);
    m.position.set(x, h / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    addCollider(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 'xingqing');
    recordFlightObstacle(x, z, w, d, h);
  };
  
  addWall((X0 + X1) / 2, Z0, X1 - X0, 4.2);
  addWall((X0 + 600) / 2, Z1, 600 - X0, 4.2);
  addWall((650 + X1) / 2, Z1, X1 - 650, 4.2);
  addWall(X0, (Z0 + Z1) / 2, 4.2, Z1 - Z0);
  addWall(X1, (Z0 + Z1) / 2, 4.2, Z1 - Z0);
  addGateHouse(585, Z1, 36, 17, 10, 4, '兴庆门', false, false);
  addWater(610, -195, 55, 38, 7.3, { wobble: 0.2 });
  
  addPavilion(610, -245, 7, { h: 5.5, roofH: 4.5, platform: 1.2, roofKind: 'gold', collider: true });
  addCorridor(565, -240, 582, -210, { w: 4.5 });
  
  // 花萼相辉楼（三层）— v5 精修
  B.stone.add(675, 1.0, -140, 34, 2.0, 25, 0, 0xd2c1a3);
  addHall(675, -145, 30, 18, { h: 7.5, roofH: 4.2, platform: 1.8, collider: false, windows: true });
  
  addDougongRow(675, 10, -135, 26, 8, 0.9);
  addCaifeng(675, 9.3, -134.8, 28, 0);
  
  // v5: 瓦垄和鸱吻
  addTileRoofDetail(675, 12, -140, 28, 16, 0);
  addChiwen(662, 13.5, -140, 1.0);
  addChiwen(688, 13.5, -140, 1.0);
  
  // v5: 栏杆
  addBalustrade(675, 2.0, -135, 30, 0);
  
  addHall(675, -150, 23, 11, { h: 6.2, roofH: 3.2, platform: 10.0, upperStorey: true, collider: false, windows: true });
  addHall(675, -152, 15, 8, { h: 4.5, roofH: 2.6, platform: 17.5, upperStorey: true, collider: false });
  addHall(545, -130, 28, 17, { h: 8.5, roofH: 4.5, platform: 1.2, collider: true, windows: true });
  
  addSignMesh('花萼相辉楼', 675, 21.5, -155, 0, 14, 3.5, { font: 72 });
  addSignMesh('沉香亭', 610, 11, -235, 0, 10, 3, { font: 72 });
  
  for (let i = 0; i < 35; i++) {
    const a = rr(0, TAU), r = rr(1.15, 1.5);
    const tx = 610 + Math.cos(a) * 55 * r, tz = -195 + Math.sin(a) * 38 * r;
    if (tx < 530 || tx > 700 || tz < -260 || tz > -130) continue;
    addTree(tx, tz, i % 2 ? 'willow' : 'peach', rr(0.8, 1.2));
  }
  for (let i = 0; i < 4; i++) addPavilion(545 + i * 6, -135 - i * 5, 3.2, { h: 5.5, roofH: 2.8 });
  landmarks.push({ id: 'xingqing', name: '兴庆宫', x: 610, z: -195, radius: 60, poem: '云想衣裳花想容，春风拂槛露华浓', desc: '龙池碧波，沉香亭畔牡丹盛放，花萼相辉楼飞檐三层。' });
}

// ============================================================
// 塔寺
// ============================================================
function addPagoda(x, z, levels, baseW, totalH, name) {
  const stoneMat = new THREE.MeshStandardMaterial({ map: TEX.stone, color: 0xe4cfad, roughness: 1 });
  B.stone.add(x, 1.5, z, baseW + 15, 3.0, baseW + 15, 0, 0xd2c3a6);
  let y = 3.0;
  const tierH = totalH / levels;
  
  for (let i = 0; i < levels; i++) {
    const t = i / (levels - 1), w = lerp(baseW, baseW * 0.5, t), hh = tierH * (i === 0 ? 1.18 : 0.94);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, w), stoneMat);
    m.position.set(x, y + hh / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    recordFlightObstacle(x, z, w + 2.5, w + 2.5, y + hh + 0.45);
    B.stone.add(x, y + hh - 0.12, z, w + 1.5, 0.38, w + 1.5, 0, 0xc8b89a);
    B.dark.add(x, y + hh + 0.2, z, w + 2.8, 0.42, w + 2.8, 0, 0x606e64);
    
    for (const ry of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      const c = Math.cos(ry), s = Math.sin(ry), nw = w * 0.28, nh = hh * 0.56;
      const put = (batch, lx, wy, lz, sx, sy, sz, color) => batch.add(x + lx * c + lz * s, wy, z - lx * s + lz * c, sx, sy, sz, ry, color);
      
      // v5: 精细塔门窗
      put(B.dark, 0, y + hh * 0.5, w / 2 + 0.03, nw, nh, 0.09, 0x514536);
      
      // v5: 门窗装饰
      put(B.stone, 0, y + hh * 0.5 + nh / 2 + 0.1, w / 2 + 0.12, nw + 0.4, 0.15, 0.15, 0xdac9ac);
      
      for (const side of [-1, 1]) put(B.stone, side * (nw / 2 + 0.15), y + hh * 0.5, w / 2 + 0.12, 0.25, nh + 0.3, 0.25, 0xd6c2a0);
      for (const side of [-1, 1]) put(B.stone, 0, y + hh * 0.5 + side * (nh / 2 + 0.1), w / 2 + 0.15, nw + 0.6, 0.22, 0.35, 0xdac9ac);
      for (const side of [-1, 1]) put(B.stone, side * w * 0.4, y + hh / 2, w / 2 + 0.05, 0.25, hh - 0.3, 0.18, 0xd5c19f);
      
      // v5: 砖纹装饰（每层上下都有）
      put(B.trim, 0, y + hh * 0.2, w / 2 + 0.05, w * 0.8, 0.08, 0.1, 0xc8b89a);
      put(B.trim, 0, y + hh * 0.8, w / 2 + 0.05, w * 0.8, 0.08, 0.1, 0xc8b89a);
    }
    y += hh + 0.6;
  }
  
  // v5: 塔刹装饰
  for (let i = 0; i < 5; i++) B.lanternCap.add(x, y + 1.0 + i * 0.75, z, 0.6 - i * 0.1, 0.42, 0.6 - i * 0.1, 0, 0xb69b60);
  B.lanternCap.add(x, y + 4.2, z, 0.25, 2.0, 0.25, 0, 0xb69b60);
  
  // v5: 塔刹顶部宝珠
  B.trim.add(x, y + 5.5, z, 0.3, 0.3, 0.3, 0, 0xd4af37);
  
  recordFlightObstacle(x, z, 1.5, 1.5, y + 5.8);
  addCollider(x - baseW / 2 - 2.5, x + baseW / 2 + 2.5, z - baseW / 2 - 2.5, z + baseW / 2 + 2.5, 'pagoda');
  addSignMesh(name, x, 4.2, z + baseW / 2 + 8, 0, 10, 2.8, { font: 74 });
}

function buildPagodas() {
  const x = 300, z = 420;
  const wm = new THREE.MeshStandardMaterial({ map: TEX.dirt, color: 0xf6dfbc, roughness: 1 });
  const templeWall = (wx, wz, ww, wd) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(ww, 4.0, wd), wm);
    m.position.set(wx, 2.0, wz); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    addCollider(wx - ww / 2, wx + ww / 2, wz - wd / 2, wz + wd / 2, 'templewall');
    recordFlightObstacle(wx, wz, ww, wd, 4.0);
    B.dark.add(wx, 4.05, wz, ww + 0.3, 0.28, wd + 0.3, 0, 0x5b6860);
  };
  
  templeWall(x, z - 40, 80, 3.0);
  templeWall(x - 40, z, 3.0, 80); templeWall(x + 40, z, 3.0, 80);
  templeWall(x - 27, 410, 26, 3.0); templeWall(x + 27, 410, 26, 3.0);
  addGateHouse(300, 410, 28, 13, 5, 1.5, '大慈恩寺', false, false);
  addPagoda(x, z, 7, 15, 60, '大雁塔');
  addHall(x - 35, z - 23, 23, 14, { h: 7.2, roofH: 4.0, collider: true, windows: true });
  addHall(x + 35, z - 23, 23, 14, { h: 7.2, roofH: 4.0, collider: true });
  
  for (let i = 0; i < 14; i++) addTree(x + rr(-35, 35), z + rr(-30, 35), i % 2 ? 'pine' : 'peach', rr(0.75, 1.05));
  landmarks.push({ id: 'dayanta', name: '大雁塔', x, z, radius: 35, poem: '塔势如涌出，孤高耸天宫', desc: '大慈恩寺内七层砖塔，玄奘法师译经之所。塔影入云，铃铎随风。' });

  const sx = -300, sz = 480;
  addPagoda(sx, sz, 13, 10.5, 50, '小雁塔');
  addHall(sx + 28, sz - 10, 20, 13, { h: 6.5, roofH: 3.6, collider: true });
  for (let i = 0; i < 12; i++) addTree(sx + rr(-28, 28), sz + rr(-26, 32), i % 2 ? 'willow' : 'pine', rr(0.7, 1.0));
  landmarks.push({ id: 'xiaoyanta', name: '小雁塔', x: sx, z: sz, radius: 28, poem: '晨钟暮鼓传巷陌，塔铃清越送斜阳', desc: '荐福寺内十三层密檐砖塔，晨钟暮鼓，是长安城南的清幽一景。' });
}

// ============================================================
// 曲江池
// ============================================================
function buildQujiang() {
  const QX = 520, QZ = 470;
  const qujiang=addWater(QX, QZ, 85, 70, 2.4, { wobble: 0.18 });
  landZones.push({cx:QX,cz:QZ,x0:QX-11,x1:QX+11,z0:QZ-8,z1:QZ+8});
  buildLakeGarden(qujiang);
  
  B.stone.add(QX, 0.23, QZ, 22, 0.45, 16, 0, 0xd9c7a5);
  addPavilion(QX, QZ, 4.5, { h: 4.5, roofH: 3.5, platform: 0.55, roofKind: 'gold' });
  addTree(QX - 9, QZ - 5, 'peach', 0.75);
  
  // 紫云楼（三层，北岸）— v5 精修
  B.stone.add(QX - 70, 1.3, QZ - 65, 38, 2.5, 26, 0, 0xd4c3a4);
  addHall(QX - 70, QZ - 60, 32, 19, { h: 8.0, roofH: 4.5, platform: 2.0, collider: false, windows: true });
  addHall(QX - 70, QZ - 65, 24, 12, { h: 6.0, roofH: 3.5, platform: 10.5, upperStorey: true, collider: false });
  
  addDougongRow(QX - 70, 11, QZ - 50, 28, 8, 0.9);
  addCaifeng(QX - 70, 10.3, QZ - 49.8, 30, 0);
  
  // v5: 瓦垄和鸱吻
  addTileRoofDetail(QX - 70, 13.5, QZ - 55, 28, 15, 0);
  addChiwen(QX - 83, 15, QZ - 55, 1.0);
  addChiwen(QX - 57, 15, QZ - 55, 1.0);
  
  // v5: 栏杆
  addBalustrade(QX - 70, 2.5, QZ - 55, 32, 0);
  
  addSignMesh('紫云楼', QX - 70, 19.5, QZ - 72, 0, 12.5, 3.4, { font: 72 });
  
  addPavilion(QX + 65, QZ - 40, 6, { h: 5.2, roofH: 4.0, platform: 0.9, roofKind: 'gold', collider: true });
  addCorridor(QX - 40, QZ - 35, QX + 45, QZ - 35, { w: 4.8 });
  addCorridor(QX - 40, QZ - 35, QX - 40, QZ - 55, { w: 4.8 });
  addCorridor(QX + 45, QZ - 35, QX + 45, QZ - 55, { w: 4.8 });
  
  B.stone.add(QX, 0.12, QZ - 58, 125, 0.22, 10, 0, 0xd8ccb3);
  bridgeZones.push({ points: [[QX-55,QZ-58],[QX+55,QZ-58]], halfWidth:5.2, y:0.22, squareEnds:true });
  
  addShop(QX - 14, QZ - 72, 20, 15, 0, '茶坊', { awning:0xb39969 });
  addShop(QX + 15, QZ - 72, 22, 15, 0, '绸缎庄', { awning:0x729086 });
  addShop(QX + 44, QZ - 72, 20, 15, 0, '酒家', { twoStory:false, awning:0xb07259 });
  
  for (const x of [QX - 50, QX - 28, QX + 2, QX + 32, QX + 55]) {
    addLantern(x,4.1,QZ-55,0.9);
    B.wood.add(x,2.0,QZ-55,0.16,4.0,0.16,0,0x795238);
  }
  
  addPavilion(QX - 70, QZ + 50, 4.8, { h: 4.8, roofH: 3.5 });
  
  // 曲桥
  const bridgePts = [
    new THREE.Vector3(QX - 85, 0.25, QZ + 35), new THREE.Vector3(QX - 60, 0.8, QZ + 28),
    new THREE.Vector3(QX - 35, 1.15, QZ + 20), new THREE.Vector3(QX - 10, 0.8, QZ + 10),
    new THREE.Vector3(QX - 2, 0.45, QZ + 3),
  ];
  const bridgeCurve = new THREE.CatmullRomCurve3(bridgePts);
  const bridgeCount = Math.ceil(bridgeCurve.getLength() / 1.4);
  const samples = Array.from({ length: bridgeCount + 1 }, (_, i) => bridgeCurve.getPointAt(i / bridgeCount));
  const deckVertices = [], deckUVs = [], deckIndices = [];
  samples.forEach((p, i) => {
    const tangent = bridgeCurve.getTangentAt(i / bridgeCount);
    const n = new THREE.Vector2(tangent.z, -tangent.x).normalize();
    for (const dy of [0, -0.22]) for (const side of [-1, 1]) {
      deckVertices.push(p.x + n.x * side * 2.3, p.y + dy, p.z + n.y * side * 2.3);
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
    B.trim.add(a.x, a.y + 0.008, a.z, 4.6, 0.018, 0.03, ang, 0x75563c);
    for (const side of [-1, 1]) {
      const nx = Math.cos(ang) * 2.15 * side, nz = -Math.sin(ang) * 2.15 * side;
      B.trim.add((a.x + b.x) / 2 + nx, (a.y + b.y) / 2 + 1.0, (a.z + b.z) / 2 + nz, 0.15, 0.15, run + 0.12, ang, 0x774d34);
      if (i % 3 === 0 || i === bridgeCount - 1) {
        B.wood.add(a.x + nx, a.y + 0.55, a.z + nz, 0.18, 1.3, 0.18, ang, 0x83573a);
        B.stone.add(a.x + nx, a.y + 1.25, a.z + nz, 0.25, 0.18, 0.25, ang, 0xc6b38c);
        B.wood.add(a.x + nx, a.y / 2 - 0.18, a.z + nz, 0.3, a.y + 0.85, 0.3, ang, 0x79533c);
      }
    }
  }
  bridgeZones.push({ points: samples.map(p => [p.x, p.z]), heights: samples.map(p => p.y), halfWidth: 2.3, y: 0.45 });
  
  for (let i = 0; i < 9; i++) {
    const a = rr(0.5, 2.9), r = rr(1.2, 1.45);
    const tx = QX + Math.cos(a) * 85 * r, tz = QZ + Math.sin(a) * 70 * r;
    if (tx < QX - 100 || tx > QX + 100 || tz < QZ - 85 || tz > QZ + 85) continue;
    addPavilion(tx, tz, rr(3.2, 4.8), { h: rr(3.5, 5), roofH: rr(2.8, 3.5) });
  }
  for (let i = 0; i < 70; i++) {
    const a = rr(0, TAU), r = rr(1.08, 1.38);
    const tx = QX + Math.cos(a) * 85 * r, tz = QZ + Math.sin(a) * 70 * r;
    if (tx < QX - 105 || tx > QX + 105 || tz < QZ - 90 || tz > QZ + 90) continue;
    addTree(tx, tz, i % 3 === 0 ? 'peach' : 'willow', rr(0.9, 1.35));
  }
  
  addSignMesh('曲江池', QX - 70, 11, QZ - 90, 0, 15, 3.8, { font: 92 });
  landmarks.push({ id: 'qujiang', name: '曲江池', x: QX, z: QZ, radius: 55, poem: '穿花蛱蝶深深见，点水蜻蜓款款飞', desc: '芙蓉园内曲江潋滟，画舫徐行，柳丝拂水，长安春色尽在此间。' });

  boatSpecs.push({
    type: 'painted',
    path: [[QX + 15, QZ - 35], [QX + 45, QZ - 20], [QX + 65, QZ + 5], [QX + 50, QZ + 28], [QX + 20, QZ + 32], [QX + 28, QZ + 5]],
    speed: 0.0045, scale: 1, name: '曲江画舫',
  });
  boatSpecs.push({type:'painted',path:[[QX-50,QZ-15],[QX-30,QZ-25],[QX-10,QZ-22],[QX-12,QZ-10],[QX-32,QZ-2],[QX-50,QZ-7]],
    cruiseSpeed:.58,scale:.72,curtain:0x84aaa2,name:'碧帘画舫'});
  
  B.wood.add(QX - 78,0.28,QZ - 8,18,0.55,4.3,0,0xaa8058);
  bridgeZones.push({points:[[QX-87,QZ-8],[QX-69,QZ-8]],halfWidth:2.3,y:0.55,squareEnds:true});
  bridgeZones.push({points:[[QX-68,QZ-15.5],[QX-68,QZ+0.5]],halfWidth:2.1,y:1.35,squareEnds:true});
  for(const x of [QX-84,QX-78,QX-72]) for(const side of [-1,1]) {
    B.wood.add(x,0.3,QZ-8+side*1.8,0.3,1.1,0.3,0,0x795139);
    B.stone.add(x,0.9,QZ-8+side*1.8,0.38,0.15,0.38,0,0xd3c1a0);
  }
  boatSpecs.push({type:'painted',path:[[QX-68,QZ-8],[QX-68,QZ-8]],moored:true,scale:1,name:'临水画舫'});
  boatSpecs.push({
    type: 'boat',
    path: [[QX-50,QZ+35],[QX-42,QZ+30],[QX-32,QZ+35],[QX-36,QZ+43],[QX-45,QZ+44],[QX-52,QZ+38]],
    cruiseSpeed: .58, scale: 0.8, name: '采风小舟',
  });
  boatSpecs.push({
    type: 'boat',
    path: [[QX+75,QZ-5],[QX+78,QZ+0],[QX+78,QZ+18],[QX+75,QZ+23],[QX+75,QZ+14],[QX+75,QZ+4]],
    cruiseSpeed: .5, scale: 0.75, name: '柳岸小舟',
  });
  boatSpecs.push({ type: 'boat', path: [[580, -205], [600, -220], [640, -205], [648, -180], [615, -168], [585, -180]], cruiseSpeed: .6, scale: 0.65, name: '龙池小舟' });
}

// ============================================================
// 城外田园 / 曲江入口
// ============================================================
function buildOutskirts() {
  const approach=new THREE.PlaneGeometry(38,320),uv=approach.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*12.7,uv.getY(i)*107);
  const m = new THREE.Mesh(approach, SurfaceLibrary.paving(0xd7d0bd));
  m.rotation.x = -Math.PI / 2; m.position.set(0, 0.02, 680); m.receiveShadow = true; scene.add(m);
  
  for (let i = 0; i < 40; i++) addTree(rr(-500, 500), rr(580, 780), i % 2 ? 'willow' : 'peach', rr(0.8, 1.3));
  
  for (let i = 0; i < 8; i++) {
    const x = -400 + i * 55, z = 680 + (i % 2) * 40;
    addHall(x, z, 15, 11, { h: 5, roofH: 3.2, platform: 0.4, collider: true });
    addTree(x + 13, z + 10, 'willow', 1.0);
  }
  
  const river = new THREE.Mesh(new THREE.PlaneGeometry(400, 17), waterMat);
  river.rotation.x = -Math.PI / 2; river.position.set(-400, 0.01, 640); scene.add(river);
  waterRects.push({ minX: -600, maxX: -200, minZ: 631.5, maxZ: 648.5 });
  
  addSignMesh('长安', 0, 14, 540, 0, 11, 3.8, { font: 110 });
  B.wood.add(-14, 7, 540, 0.8, 14, 0.8, 0, 0x7a452f);
  B.wood.add(14, 7, 540, 0.8, 14, 0.8, 0, 0x7a452f);
  B.red.add(0, 13, 540, 30, 0.75, 1.0, 0, 0xa94237);
  B.roofSmall.add(0, 13.4, 540, 32, 2.2, 5, 0, 0x6b7f76);
}
