/* ============================================================
   小青龙 / 木单车 / 长安众生 / 画舫
   ============================================================ */

const DRAGON = {
  body: 0x46c97f, bodyDark: 0x2fa666, belly: 0xffeccb, bellyShade: 0xf5d9ac,
  horn: 0xff8d57, hornLight: 0xffb574, mane: 0xffb52e, maneDeep: 0xf28c24,
  scarf: 0xf14535, scarfDeep: 0xc42e2b, eye: 0x203630, blush: 0xff8491,
};

function tubeBetween(a, b, radius, material, radial = 8) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(radius, radius, 1, radial, 1, false);
  const m = new THREE.Mesh(geo, material);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.scale.set(1, len, 1);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function capsuleBetween(a, b, radius, material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CapsuleGeometry(radius, Math.max(0.01, len - radius * 2), 4, 8);
  const m = new THREE.Mesh(geo, material);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function updateLimb(mesh, a, b) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = Math.max(0.001, dir.length());
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.scale.set(1, len, 1);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
}

function outlineMesh(mesh, amount = 1.035, color = 0x27332f) {
  const clone = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color, side: THREE.BackSide }));
  clone.scale.setScalar(amount);
  clone.position.copy(mesh.position);
  clone.rotation.copy(mesh.rotation);
  clone.scale.multiply(mesh.scale);
  clone.renderOrder = -1;
  return clone;
}

// ---------------------------------------------------------------- 木单车
function createBike() {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ map: TEX.wood, color: 0xd17a3e, roughness: 0.82, metalness: 0.02 });
  const woodDark = new THREE.MeshStandardMaterial({ map: TEX.wood, color: 0x8e3f27, roughness: 0.9 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x4e4a40, roughness: 0.55, metalness: 0.55 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xf2bd40, roughness: 0.32, metalness: 0.72 });
  const leather = new THREE.MeshStandardMaterial({ color: 0xc23a2e, roughness: 0.7 });

  const wheelRadius = 0.62;
  function makeWheel(z) {
    const w = new THREE.Group(); w.position.set(0, wheelRadius, z);
    const spin = new THREE.Group(); spin.rotation.y = Math.PI / 2; w.add(spin);
    const tire = new THREE.Mesh(new THREE.TorusGeometry(wheelRadius, 0.075, 8, 30), iron);
    tire.castShadow = true; spin.add(tire);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(wheelRadius - 0.09, 0.045, 6, 26), wood);
    rim.castShadow = true; spin.add(rim);
    for (let i = 0; i < 10; i++) {
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, (wheelRadius - 0.12) * 2, 4), woodDark);
      spoke.rotation.z = (i / 10) * Math.PI;
      spin.add(spoke);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.16, 10), brass);
    hub.rotation.x = Math.PI / 2; spin.add(hub);
    w.userData.spin = spin;
    return w;
  }
  const rearWheel = makeWheel(-0.84);
  const frontPivot = new THREE.Group();
  frontPivot.position.set(0, 0, 0.82);
  const frontWheel = makeWheel(0);
  frontPivot.add(frontWheel);
  group.add(rearWheel, frontPivot);

  // 车架节点
  const P = {
    rear: new THREE.Vector3(0, 0.62, -0.84),
    crank: new THREE.Vector3(0, 0.52, 0),
    seat: new THREE.Vector3(0, 1.12, -0.3),
    headTop: new THREE.Vector3(0, 1.25, 0.7),
    headLow: new THREE.Vector3(0, 0.78, 0.76),
    front: new THREE.Vector3(0, 0.62, 0.82),
  };
  const frameParts = [
    [P.rear, P.seat], [P.seat, P.crank], [P.crank, P.rear],
    [P.seat, P.headTop], [P.crank, P.headLow], [P.headTop, P.headLow],
    [P.headLow, P.front], [P.headTop, P.front],
  ];
  for (const [a, b] of frameParts) group.add(tubeBetween(a, b, 0.055, wood));
  for (const p of Object.values(P)) {
    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), brass);
    joint.position.copy(p); group.add(joint);
  }
  // 前叉
  group.add(tubeBetween(new THREE.Vector3(-0.1, 0.86, 0.78), new THREE.Vector3(-0.1, 0.62, 0.82), 0.035, woodDark));
  group.add(tubeBetween(new THREE.Vector3(0.1, 0.86, 0.78), new THREE.Vector3(0.1, 0.62, 0.82), 0.035, woodDark));

  // 车座
  const seat = new THREE.Mesh(roundedBoxGeo(0.46, 0.16, 0.72, 0.07), leather);
  seat.position.set(0, 1.2, -0.33); seat.castShadow = true; group.add(seat);
  const seatSpring = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 6), iron);
  seatSpring.position.set(0, 1.1, -0.3); group.add(seatSpring);

  // 车把
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.24, 0.72), new THREE.Vector3(0, 1.43, 0.78),
    new THREE.Vector3(0, 1.5, 0.9), new THREE.Vector3(0, 1.47, 1.0),
  ]);
  const handleTube = new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 14, 0.045, 6, false), woodDark);
  handleTube.castShadow = true; group.add(handleTube);
  for (const side of [-1, 1]) {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.42, 8), leather);
    grip.rotation.z = Math.PI / 2; grip.position.set(side * 0.34, 1.47, 0.98); group.add(grip);
    const end = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), brass);
    end.position.set(side * 0.56, 1.47, 0.98); group.add(end);
  }
  // 车铃
  const bell = new THREE.Group(); bell.position.set(0.22, 1.53, 0.86);
  const bellDome = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8, 0, TAU, 0, Math.PI * 0.7), brass);
  bellDome.rotation.x = Math.PI; bell.add(bellDome);
  const bellLever = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 5), iron);
  bellLever.position.set(0.1, 0.02, 0.03); bellLever.rotation.z = -0.7; bell.add(bellLever);
  group.add(bell);

  // 前车筐
  const basket = new THREE.Group(); basket.position.set(0, 1.18, 1.02);
  const basketBox = new THREE.Mesh(roundedBoxGeo(0.72, 0.34, 0.5, 0.06), new THREE.MeshStandardMaterial({ map: TEX.wood, color: 0xb57d4b, roughness: 0.9 }));
  basket.add(basketBox);
  for (let i = 0; i < 8; i++) {
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), new THREE.MeshStandardMaterial({ color: pick([0xf6b3bf, 0xffd08a, 0xf4e0b0]), roughness: 0.8 }));
    flower.position.set(rr(-0.26, 0.26), rr(-0.04, 0.16), rr(-0.16, 0.16)); basket.add(flower);
  }
  group.add(basket);

  // 链条 / 牙盘 / 曲柄
  const chainring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.045, 6, 22), brass);
  chainring.position.copy(P.crank); chainring.rotation.y = Math.PI / 2; chainring.castShadow = true; group.add(chainring);
  const chainTop = tubeBetween(new THREE.Vector3(0, 0.78, 0.0), new THREE.Vector3(0, 0.68, -0.84), 0.022, iron, 4);
  const chainBot = tubeBetween(new THREE.Vector3(0, 0.3, 0.0), new THREE.Vector3(0, 0.56, -0.84), 0.022, iron, 4);
  group.add(chainTop, chainBot);
  const crank = new THREE.Group(); crank.position.copy(P.crank); group.add(crank);
  const crankArmA = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 6), iron);
  crankArmA.position.set(0.16, -0.17, 0); crank.add(crankArmA);
  const crankArmB = crankArmA.clone(); crankArmB.position.set(-0.16, 0.17, 0); crankArmB.rotation.z = Math.PI; crank.add(crankArmB);
  const pedalA = new THREE.Mesh(roundedBoxGeo(0.22, 0.07, 0.12, 0.02), leather); pedalA.position.set(0.32, -0.34, 0); crank.add(pedalA);
  const pedalB = new THREE.Mesh(roundedBoxGeo(0.22, 0.07, 0.12, 0.02), leather); pedalB.position.set(-0.32, 0.34, 0); crank.add(pedalB);

  // 挡泥板
  const fenderMat = new THREE.MeshStandardMaterial({ map: TEX.wood, color: 0xc58a55, roughness: 0.85 });
  for (const [z, pivot] of [[-0.84, false], [0.82, true]]) {
    const fender = new THREE.Mesh(new THREE.TorusGeometry(0.69, 0.055, 5, 24, Math.PI * 0.92), fenderMat);
    fender.rotation.y = Math.PI / 2;
    fender.rotation.z = Math.PI * 0.04;
    fender.position.set(0, 0.7, pivot ? 0 : z);
    if (pivot) frontPivot.add(fender); else group.add(fender);
  }

  group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { group, rearWheel, frontWheel, frontPivot, crank, pedalA, pedalB, bell, wheelRadius, wood, woodDark, brass, iron };
}

// ---------------------------------------------------------------- 小青龙
function createDragon() {
  const g = new THREE.Group();
  const bodyMat = toon(DRAGON.body);
  const bodyLightMat = toon(0x75e19e);
  const bellyMat = toon(DRAGON.belly);
  const hornMat = toon(DRAGON.horn);
  const maneMat = toon(DRAGON.mane);
  const scarfMat = toon(DRAGON.scarf);
  const darkMat = toon(0x2b3732);
  const whiteMat = toon(0xfffcf2);
  const blushMat = toon(DRAGON.blush);
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd9aa4b, roughness: 0.35, metalness: 0.55 });

  const bodyRoot = new THREE.Group(); g.add(bodyRoot);

  // 身体
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.72, 20, 16), bodyMat);
  body.scale.set(1.15, 1.35, 1.0); body.position.set(0, 1.35, -0.12);
  body.castShadow = true; bodyRoot.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.62, 18, 14), bellyMat);
  belly.scale.set(1.02, 1.13, 0.62); belly.position.set(0, 1.24, 0.26);
  bodyRoot.add(belly);
  // 肚皮纹
  for (let i = 0; i < 3; i++) {
    const line = new THREE.Mesh(new THREE.TorusGeometry(0.26 - i * 0.03, 0.015, 4, 12, Math.PI), toon(0xd8c5a1));
    line.rotation.set(Math.PI / 2, 0, 0); line.position.set(0, 1.32 - i * 0.25, 0.67); bodyRoot.add(line);
  }

  // 头部
  const head = new THREE.Group(); head.position.set(0, 2.15, 0.16); bodyRoot.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.62, 22, 18), bodyMat);
  skull.scale.set(1.02, 0.95, 1.0); skull.castShadow = true; head.add(skull);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 14), bodyLightMat);
  snout.scale.set(1.0, 0.62, 0.95); snout.position.set(0, -0.14, 0.52); head.add(snout);
  // 鼻孔
  for (const s of [-1, 1]) {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 5), darkMat);
    nostril.position.set(s * 0.15, -0.1, 0.92); nostril.scale.set(1, 0.7, 0.5); head.add(nostril);
  }
  // 微笑
  const smileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, -0.27, 0.86), new THREE.Vector3(-0.07, -0.32, 0.9),
    new THREE.Vector3(0.08, -0.32, 0.9), new THREE.Vector3(0.2, -0.27, 0.86),
  ]);
  const smile = new THREE.Mesh(new THREE.TubeGeometry(smileCurve, 10, 0.018, 4, false), darkMat);
  head.add(smile);
  // 眼睛
  const eyes = [];
  for (const s of [-1, 1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12), whiteMat);
    white.scale.set(0.92, 1.12, 0.72); white.position.set(s * 0.25, 0.16, 0.48); head.add(white);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 10), darkMat);
    iris.position.set(s * 0.26, 0.15, 0.61); iris.scale.set(0.9, 1.0, 0.55); head.add(iris);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), whiteMat);
    shine.position.set(s * 0.23, 0.19, 0.665); head.add(shine);
    const brow = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.022, 4, 8, Math.PI * 0.8), darkMat);
    brow.rotation.z = s * 0.15; brow.position.set(s * 0.25, 0.37, 0.52); head.add(brow);
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), blushMat);
    blush.scale.set(1.1, 0.55, 0.4); blush.position.set(s * 0.43, -0.14, 0.5); head.add(blush);
    eyes.push({ iris, shine });
  }
  // 鹿角
  for (const s of [-1, 1]) {
    const a = new THREE.Vector3(s * 0.22, 0.52, 0.02), b = new THREE.Vector3(s * 0.33, 0.9, -0.04), c = new THREE.Vector3(s * 0.48, 1.1, -0.12);
    head.add(tubeBetween(a, b, 0.055, hornMat, 6));
    head.add(tubeBetween(b, c, 0.045, hornMat, 6));
    head.add(tubeBetween(b, new THREE.Vector3(s * 0.52, 1.02, 0.08), 0.035, hornMat, 6));
    head.add(tubeBetween(new THREE.Vector3(s * 0.38, 0.78, -0.03), new THREE.Vector3(s * 0.55, 0.87, 0.02), 0.03, hornMat, 6));
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), toon(0xf6c48f)); tip.position.copy(c); head.add(tip);
  }
  // 耳朵
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), bodyLightMat);
    ear.scale.set(0.75, 0.45, 1.25); ear.position.set(s * 0.56, 0.25, 0.05); ear.rotation.z = s * 0.5; head.add(ear);
  }
  // 鬃毛
  for (let i = 0; i < 6; i++) {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.16 - i * 0.012, 0.36, 6), i % 2 ? maneMat : toon(DRAGON.maneDeep));
    tuft.position.set(0, 0.45 - i * 0.02, -0.48 - i * 0.045);
    tuft.rotation.x = -0.9; tuft.castShadow = true; head.add(tuft);
  }
  // 龙须
  const whiskers = [];
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.28, -0.12 + k * 0.1, 0.82),
      new THREE.Vector3(s * 0.62, -0.05 + k * 0.12, 0.95),
      new THREE.Vector3(s * 0.95, -0.18 + k * 0.18, 0.9),
      new THREE.Vector3(s * 1.2, -0.32 + k * 0.2, 0.78),
    ]);
    const w = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.012, 4, false), goldMat);
    head.add(w); whiskers.push(w);
  }

  // 围巾
  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.1, 7, 18), scarfMat);
  scarf.rotation.x = Math.PI / 2; scarf.position.set(0, 1.78, 0.08); scarf.scale.set(1.08, 1.0, 0.75); bodyRoot.add(scarf);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), scarfMat); knot.position.set(0.38, 1.72, 0.18); bodyRoot.add(knot);
  const scarfTails = [];
  for (let i = 0; i < 2; i++) {
    const tail = new THREE.Group(); tail.position.set(0.36, 1.68, 0.06);
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); shape.lineTo(0.16, -0.06); shape.lineTo(0.22, -0.55); shape.lineTo(0.05, -0.66); shape.lineTo(-0.03, -0.18);
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color: i ? 0xd8624d : 0xbf473c, roughness: 0.85, side: THREE.DoubleSide }));
    mesh.rotation.y = i ? -0.2 : 0.1; tail.add(mesh); scarfTails.push(tail); bodyRoot.add(tail);
  }

  // 翅膀
  const wings = [];
  for (const s of [-1, 1]) {
    const wing = new THREE.Group(); wing.position.set(s * 0.55, 1.85, -0.35);
    const w1 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), bodyLightMat);
    w1.scale.set(0.7, 0.25, 1.1); w1.position.set(s * 0.18, 0.02, 0.05); wing.add(w1);
    const w2 = new THREE.Mesh(new THREE.SphereGeometry(0.23, 10, 8), toon(0xf2c27d));
    w2.scale.set(0.55, 0.18, 1.0); w2.position.set(s * 0.34, -0.04, 0.18); wing.add(w2);
    wing.rotation.z = s * -0.25; wings.push(wing); bodyRoot.add(wing);
  }

  // 背鳍
  const spikes = [];
  for (let i = 0; i < 5; i++) {
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 6), i % 2 ? maneMat : toon(0xe9a45c));
    sp.position.set(0, 1.88 - i * 0.18, -0.62 - i * 0.02); sp.rotation.x = -0.2; bodyRoot.add(sp); spikes.push(sp);
  }

  // 尾巴
  const tailRoot = new THREE.Group(); tailRoot.position.set(0, 1.3, -0.66); bodyRoot.add(tailRoot);
  const tailSegs = [];
  let parent = tailRoot;
  for (let i = 0; i < 6; i++) {
    const seg = new THREE.Group(); seg.position.set(0, 0, -0.22);
    const r = 0.18 - i * 0.02;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), i > 3 ? toon(0xf0b06a) : bodyMat);
    mesh.position.z = -0.11; mesh.scale.set(1, 0.9, 1.25); seg.add(mesh);
    parent.add(seg); tailSegs.push(seg); parent = seg;
  }
  const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.48, 7), maneMat);
  tailTip.rotation.x = -Math.PI / 2; tailTip.position.z = -0.35; parent.add(tailTip);

  // 手臂（静态，握把）
  const armL = capsuleBetween(new THREE.Vector3(-0.48, 1.72, 0.12), new THREE.Vector3(-0.42, 1.42, 0.9), 0.11, bodyMat);
  const armR = capsuleBetween(new THREE.Vector3(0.48, 1.72, 0.12), new THREE.Vector3(0.42, 1.42, 0.9), 0.11, bodyMat);
  bodyRoot.add(armL, armR);
  const hands = [];
  for (const s of [-1, 1]) {
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), bodyLightMat);
    hand.position.set(s * 0.43, 1.4, 0.94); bodyRoot.add(hand); hands.push(hand);
  }

  // 腿（动态 IK）
  const legGeo = new THREE.CylinderGeometry(0.085, 0.11, 1, 8);
  const legs = [];
  for (const s of [-1, 1]) {
    const thigh = new THREE.Mesh(legGeo, bodyMat); thigh.castShadow = true;
    const shin = new THREE.Mesh(legGeo, bodyLightMat); shin.castShadow = true;
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), toon(0xe7a76b));
    foot.scale.set(1.25, 0.6, 1.5); foot.castShadow = true;
    g.add(thigh, shin, foot);
    legs.push({ s, thigh, shin, foot });
  }

  return { group: g, bodyRoot, head, eyes, scarfTails, wings, tailSegs, tailRoot, legs, body, belly, scarf, armL, armR, hands };
}

// ---------------------------------------------------------------- 龙 + 车
function createDragonBike() {
  const root = new THREE.Group();
  const bike = createBike();
  root.add(bike.group);
  const dragon = createDragon();
  dragon.group.position.set(0, 0, 0);
  root.add(dragon.group);
  // 整车影子
  const shadowTex = makeTexture(128, 64, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 3, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(25,30,25,.42)'); g.addColorStop(0.7, 'rgba(25,30,25,.16)'); g.addColorStop(1, 'rgba(25,30,25,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }, { repeat: [1, 1] });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 6.2), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.03; shadow.position.z = 0.05; root.add(shadow);

  const state = { pedal: 0, ringT: 0, wheelSpin: 0, steer: 0, speed: 0 };
  const hipL = new THREE.Vector3(-0.34, 1.28, 0.02), hipR = new THREE.Vector3(0.34, 1.28, 0.02);
  const kneeFwd = new THREE.Vector3(0, 0.1, 1);

  function pedalPos(side, phase) {
    const crank = 0.3;
    return new THREE.Vector3(side * 0.3, 0.58 + Math.cos(phase) * crank, Math.sin(phase) * crank);
  }
  function solveLeg(leg, hip, target) {
    const L1 = 0.58, L2 = 0.6;
    const toTarget = new THREE.Vector3().subVectors(target, hip);
    let d = clamp(toTarget.length(), 0.3, L1 + L2 - 0.01);
    const dir = toTarget.clone().normalize();
    const cosA = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1);
    const bend = kneeFwd.clone().sub(dir.clone().multiplyScalar(kneeFwd.dot(dir))).normalize();
    const knee = hip.clone().add(dir.clone().multiplyScalar(L1 * cosA)).add(bend.multiplyScalar(L1 * Math.sqrt(1 - cosA * cosA)));
    updateLimb(leg.thigh, hip, knee);
    updateLimb(leg.shin, knee, target);
    leg.foot.position.copy(target);
    leg.foot.position.z += 0.04;
    leg.foot.rotation.x = Math.sin(phaseVal) * 0.15;
  }
  let phaseVal = 0;
  function update(dt, speed, steer, boost, mode = 'bike') {
    state.speed = speed; state.steer = steer;
    state.pedal += speed * dt * 2.2;
    phaseVal = state.pedal;
    bike.rearWheel.userData.spin.rotation.x -= speed * dt / bike.wheelRadius;
    bike.frontWheel.userData.spin.rotation.x -= speed * dt / bike.wheelRadius;
    bike.crank.rotation.x = -state.pedal;
    bike.frontPivot.rotation.y = steer * 0.16;
    const t = performance.now() * 0.001;
    const bob = Math.sin(state.pedal * 2) * 0.025 * (0.4 + Math.min(speed, 10) / 10);
    dragon.bodyRoot.position.y = bob;
    dragon.bodyRoot.rotation.z = -steer * 0.12;
    dragon.bodyRoot.rotation.x = Math.sin(state.pedal) * 0.015 + (boost ? 0.05 : 0);
    dragon.head.rotation.z = steer * 0.12 + Math.sin(t * 1.3) * 0.02;
    dragon.head.rotation.x = Math.sin(t * 1.7) * 0.025 + (boost ? -0.08 : 0);
    dragon.tailRoot.rotation.y = Math.sin(t * 1.8) * 0.16;
    dragon.tailRoot.rotation.x = Math.sin(t * 1.2) * 0.08 - 0.08;
    dragon.tailSegs.forEach((seg, i) => { seg.rotation.y = Math.sin(t * 2.1 - i * 0.5) * 0.12; seg.rotation.x = Math.sin(t * 1.4 - i * 0.4) * 0.05; });
    dragon.wings[0].rotation.z = -0.2 - Math.sin(t * 5) * 0.18;
    dragon.wings[1].rotation.z = 0.2 + Math.sin(t * 5) * 0.18;
    dragon.eyes.forEach((e, i) => { e.iris.position.y = 0.15 + Math.sin(t * 0.9 + i) * 0.008; });
    dragon.scarfTails.forEach((tail, i) => {
      tail.rotation.x = -0.5 - Math.min(0.6, speed * 0.035) + Math.sin(t * 4 + i) * 0.12;
      tail.rotation.y = (i ? -0.2 : 0.1) + Math.sin(t * 3 + i) * 0.08;
    });
    solveLeg(dragon.legs[0], hipL.clone(), pedalPos(-1, state.pedal));
    solveLeg(dragon.legs[1], hipR.clone(), pedalPos(1, state.pedal + Math.PI));
    // 共用骨架：步行脚掌落地，飞行收腿并展开双翼。
    const flying = mode === 'fly', walking = mode === 'walk';
    if (walking || flying) {
      dragon.bodyRoot.position.y = flying ? Math.sin(t * 2.4) * 0.08 : Math.abs(Math.sin(state.pedal)) * 0.065;
      dragon.bodyRoot.rotation.x = flying ? 0.18 : 0;
      for (let i = 0; i < dragon.legs.length; i++) {
        const leg = dragon.legs[i], phase = state.pedal * 0.6 + i * Math.PI;
        const stride = Math.min(1, Math.abs(speed) / 3);
        solveLeg(leg, i ? hipR.clone() : hipL.clone(), new THREE.Vector3(leg.s * 0.34, flying ? 0.55 : 0.12 + Math.max(0, Math.sin(phase)) * 0.25 * stride, flying ? -0.3 : Math.cos(phase) * 0.42 * stride));
      }
      dragon.wings.forEach((wing, i) => { wing.rotation.z = (i ? 1 : -1) * (flying ? 1 + Math.sin(t * 6) * 0.55 : 0.16); wing.scale.setScalar(flying ? 2.1 : 1); });
    } else dragon.wings.forEach(wing => wing.scale.setScalar(1));
    [dragon.armL, dragon.armR].forEach((arm, i) => {
      const side = i ? 1 : -1;
      const shoulder = new THREE.Vector3(side * 0.48, 1.72, 0.12);
      const hand = mode === 'bike' ? new THREE.Vector3(side * 0.43, 1.4, 0.94) : new THREE.Vector3(side * (flying ? 0.86 : 0.59), flying ? 1.6 : 1.1, flying ? 0.36 : Math.sin(state.pedal * 0.6 + i * Math.PI) * 0.16);
      arm.position.copy(shoulder).add(hand).multiplyScalar(0.5);
      const dir = hand.clone().sub(shoulder);
      arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      arm.scale.y = dir.length() / 0.83;
      dragon.hands[i].position.copy(hand);
    });
    if (state.ringT > 0) {
      state.ringT = Math.max(0, state.ringT - dt);
      bike.bell.rotation.z = Math.sin(state.ringT * 60) * 0.18 * (state.ringT / 0.6);
    }
  }
  function ring() { state.ringT = 0.6; }
  return { group: root, bike, dragon, update, ring };
}

// ---------------------------------------------------------------- 人物（合并几何体）
const SKIN = 0xf2d1ad;
const ROBE_COLORS = [0x2d7f9a, 0xd6553e, 0x4d9a58, 0x8b5ca6, 0xe39b30, 0x3d65ad, 0xc94050, 0x2b9b91, 0xdbb547, 0x8f573c];
const HAIR = 0x2b2521;

function mergeColored(parts) {
  const positions = [], normals = [], colors = [], uvs = [];
  const color = new THREE.Color();
  for (const part of parts) {
    let geo = part.geo.index ? part.geo.toNonIndexed() : part.geo.clone();
    geo.applyMatrix4(part.matrix);
    const p = geo.attributes.position, n = geo.attributes.normal, u = geo.attributes.uv;
    color.set(part.color);
    for (let i = 0; i < p.count; i++) {
      positions.push(p.getX(i), p.getY(i), p.getZ(i));
      normals.push(n.getX(i), n.getY(i), n.getZ(i));
      colors.push(color.r, color.g, color.b);
      uvs.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0);
    }
    geo.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  return g;
}

function matrixTRS(x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Matrix4();
  m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
  return m;
}

function makePersonGeometry(opt = {}) {
  const { woman = false, monk = false, guard = false, child = false, robe = pick(ROBE_COLORS) } = opt;
  const parts = [];
  const h = child ? 0.72 : 1;
  // 袍身
  if (monk) {
    parts.push({ geo: new THREE.CylinderGeometry(0.24, 0.4, 1.12, 10), color: 0xb0663b, matrix: matrixTRS(0, 0.64 * h, 0, h, h, h) });
  } else if (guard) {
    parts.push({ geo: new THREE.CylinderGeometry(0.27, 0.36, 1.1, 10), color: 0x5d4a35, matrix: matrixTRS(0, 0.63 * h, 0, h, h, h) });
    parts.push({ geo: new THREE.BoxGeometry(0.62, 0.16, 0.3), color: 0x404a4b, matrix: matrixTRS(0, 1.08 * h, 0, h, h, h) });
  } else {
    parts.push({ geo: new THREE.CylinderGeometry(0.22, 0.43, 1.08, 10), color: robe, matrix: matrixTRS(0, 0.61 * h, 0, h, h, h) });
    parts.push({ geo: new THREE.BoxGeometry(0.46, 0.09, 0.3), color: 0x4e3b2c, matrix: matrixTRS(0, 0.92 * h, 0.03, h, h, h) });
  }
  // 头
  const headY = 1.38 * h;
  parts.push({ geo: new THREE.SphereGeometry(0.21 * h, 12, 10), color: monk ? 0xe0b98f : SKIN, matrix: matrixTRS(0, headY, 0) });
  // 发
  if (!monk) {
    parts.push({ geo: new THREE.SphereGeometry(0.215 * h, 12, 8, 0, TAU, 0, Math.PI * 0.62), color: HAIR, matrix: matrixTRS(0, headY + 0.035 * h, -0.01, 1, 0.9, 1) });
  }
  // 幞头 / 发髻
  if (woman) {
    parts.push({ geo: new THREE.SphereGeometry(0.16 * h, 10, 8), color: HAIR, matrix: matrixTRS(0, headY + 0.19 * h, -0.02, 1.25, 0.9, 1) });
    parts.push({ geo: new THREE.SphereGeometry(0.09 * h, 8, 6), color: HAIR, matrix: matrixTRS(0, headY + 0.33 * h, -0.03, 1, 1.1, 1) });
  } else if (!monk) {
    parts.push({ geo: new THREE.BoxGeometry(0.3 * h, 0.16 * h, 0.3 * h), color: 0x26221f, matrix: matrixTRS(0, headY + 0.18 * h, -0.02, 1, 1, 1) });
    parts.push({ geo: new THREE.BoxGeometry(0.08 * h, 0.1 * h, 0.26 * h), color: 0x26221f, matrix: matrixTRS(0, headY + 0.14 * h, -0.24 * h, 1, 1, 1) });
  }
  // 五官
  for (const s of [-1, 1]) {
    parts.push({ geo: new THREE.SphereGeometry(0.018 * h, 5, 4), color: 0x231f1c, matrix: matrixTRS(s * 0.07 * h, headY + 0.02 * h, 0.19 * h) });
  }
  parts.push({ geo: new THREE.BoxGeometry(0.06 * h, 0.012 * h, 0.02), color: 0x9e5e54, matrix: matrixTRS(0, headY - 0.08 * h, 0.2 * h) });
  // 手臂
  const armColor = monk ? 0xb0663b : guard ? 0x5d4a35 : robe;
  for (const s of [-1, 1]) {
    parts.push({ geo: new THREE.CapsuleGeometry(0.055 * h, 0.46 * h, 3, 6), color: armColor, matrix: matrixTRS(s * 0.27 * h, 0.92 * h, 0.02, 1, 1, 1, 0, 0, s * 0.22) });
    parts.push({ geo: new THREE.SphereGeometry(0.055 * h, 6, 5), color: SKIN, matrix: matrixTRS(s * 0.36 * h, 0.64 * h, 0.04) });
  }
  // 脚
  for (const s of [-1, 1]) {
    parts.push({ geo: new THREE.SphereGeometry(0.08 * h, 6, 5), color: 0x332a22, matrix: matrixTRS(s * 0.12 * h, 0.07 * h, 0.08 * h, 1, 0.55, 1.4) });
  }
  // 配饰
  if (woman) {
    parts.push({ geo: new THREE.TorusGeometry(0.24 * h, 0.025 * h, 4, 12), color: 0xd8b25e, matrix: matrixTRS(0, 1.0 * h, 0, 1, 1, 1, Math.PI / 2) });
  }
  if (guard) {
    parts.push({ geo: new THREE.ConeGeometry(0.09 * h, 0.24 * h, 6), color: 0x8a3d34, matrix: matrixTRS(0, 1.55 * h, 0) });
  }
  return mergeColored(parts);
}

const personMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: gradientMap() });

function makeSpeechBubble(text) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 200;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 512, 200);
  ctx.fillStyle = 'rgba(255,249,232,.96)';
  ctx.strokeStyle = '#b8863e'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(10, 10, 492, 150, 26); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(232, 158); ctx.lineTo(256, 190); ctx.lineTo(280, 158); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#553c27'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '600 40px "STKaiti","KaiTi","Kaiti SC",serif';
  const lines = [];
  let line = '';
  for (const ch of text) { line += ch; if (line.length >= 13) { lines.push(line); line = ''; } }
  if (line) lines.push(line);
  lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, 256, 72 + i * 48));
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(3.6, 1.4, 1); sp.position.y = 2.6; sp.visible = false;
  return sp;
}

const npcs = [];
const speechLines = [
  '胡饼——刚出炉的胡饼！', '西域葡萄，甜得很！', '客官，看看这匹蜀锦？', '新到的香料，波斯来的！',
  '茶汤一碗，解解乏～', '糖葫芦，三文钱一串！', '画舫游湖，半个时辰一趟！', '大雁塔往南走，拐个弯就到！',
  '上元灯会，今夜通宵不闭坊！', '小心马匹，慢些走～',
];

function addNPC(x, z, opt = {}) {
  const { woman = false, monk = false, guard = false, child = false, ry = rr(0, TAU), bubble = null, path = null, speed = rr(0.4, 0.8) } = opt;
  const geo = makePersonGeometry({ woman, monk, guard, child, robe: opt.robe });
  const mesh = new THREE.Mesh(geo, personMat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  const group = new THREE.Group(); group.add(mesh);
  group.position.set(x, 0, z); group.rotation.y = ry;
  const scale = child ? 0.75 : rr(0.94, 1.05);
  group.scale.setScalar(scale);
  if (bubble) { const sp = makeSpeechBubble(bubble); group.add(sp); group.userData.bubble = sp; }
  scene.add(group);
  const npc = { group, mesh, baseY: 0, phase: rr(0, TAU), path, pathT: rr(0, 1), speed, dir: 1, bubbleTimer: rr(2, 8), opt };
  npcs.push(npc);
  return npc;
}

// ---------------------------------------------------------------- 骆驼
function addCamel(x, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  const fur = toon(0xc79a63), furLight = toon(0xdbb27b), dark = toon(0x5b4632);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 10), fur); body.scale.set(1.0, 0.9, 1.7); body.position.y = 1.35; g.add(body);
  for (const dz of [-0.38, 0.5]) {
    const hump = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), furLight); hump.scale.set(1, 0.9, 0.8); hump.position.set(0, 1.85, dz); g.add(hump);
  }
  const neckCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.45, 1.0), new THREE.Vector3(0, 2.2, 1.35), new THREE.Vector3(0, 2.6, 1.65)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 10, 0.22, 8), fur));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 8), furLight); head.scale.set(0.8, 0.75, 1.25); head.position.set(0, 2.65, 1.72); g.add(head);
  const earGeo = new THREE.ConeGeometry(0.08, 0.18, 5);
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(earGeo, fur); ear.position.set(s * 0.15, 2.82, 1.62); g.add(ear); }
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 5, 4), dark); eye.position.set(s * 0.13, 2.7, 1.9); g.add(eye);
  }
  // 鞍毯
  const blanket = new THREE.Mesh(roundedBoxGeo(0.9, 0.08, 1.0, 0.04), new THREE.MeshStandardMaterial({ color: 0xb84a3c, roughness: 0.8 }));
  blanket.position.set(0, 1.92, 0.06); g.add(blanket);
  for (const s of [-1, 1]) for (const dz of [-0.55, 0.55]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 1.25, 6), fur);
    leg.position.set(s * 0.38, 0.62, dz); g.add(leg);
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(g);
  npcs.push({ group: g, mesh: g, baseY: 0, phase: rr(0, TAU), path: null, speed: 0, camel: true, bubbleTimer: 99 });
  return g;
}

// ---------------------------------------------------------------- 画舫 / 游船
const boats = [];
function makeBoat(spec) {
  const g = new THREE.Group();
  const scale = spec.scale || 1;
  const wood = new THREE.MeshStandardMaterial({ map: TEX.wood, color: 0xb55e32, roughness: 0.8 });
  const red = new THREE.MeshStandardMaterial({ color: 0xdf4334, roughness: 0.8 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xf0bb43, roughness: 0.4, metalness: 0.4 });
  // 船体
  const shape = new THREE.Shape();
  shape.moveTo(0, 2.2); shape.bezierCurveTo(1.1, 1.6, 1.15, -1.3, 0, -2.1); shape.bezierCurveTo(-1.15, -1.3, -1.1, 1.6, 0, 2.2);
  const hullGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.55, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2 });
  const hull = new THREE.Mesh(hullGeo, wood); hull.rotation.x = -Math.PI / 2; hull.position.y = 0.45; hull.castShadow = true; g.add(hull);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.16, 3.2), wood); deck.position.y = 0.75; g.add(deck);
  // 船头
  const prow = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), wood); prow.scale.set(0.85, 0.4, 1.2); prow.position.set(0, 0.7, 1.8); g.add(prow);
  if (spec.type === 'painted') {
    // 画舫亭
    const pav = new THREE.Group(); pav.position.set(0, 0.8, -0.1);
    for (const [sx, sz] of [[-0.72, -1.0], [0.72, -1.0], [-0.72, 1.0], [0.72, 1.0]]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.55, 8), red); col.position.set(sx, 0.78, sz); pav.add(col);
    }
    const roof = new THREE.Mesh(ROOF_SMALL, new THREE.MeshStandardMaterial({ map: TEX.roof, color: 0x6f8379, roughness: 0.8, side: THREE.DoubleSide }));
    roof.scale.set(2.8, 1.5, 3.4); roof.position.y = 1.58; pav.add(roof);
    for (const s of [-1, 1]) {
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), MAT.lantern); lantern.position.set(s * 0.86, 1.45, 0.9); pav.add(lantern);
    }
    // 窗帘
    const curtain = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.1), new THREE.MeshStandardMaterial({ color: 0xcf7a5c, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
    curtain.position.set(0, 1.3, 1.02); pav.add(curtain);
    g.add(pav);
    // 船尾小亭
    const smallRoof = new THREE.Mesh(ROOF_SMALL, new THREE.MeshStandardMaterial({ map: TEX.roof, color: 0x6f8379, side: THREE.DoubleSide }));
    smallRoof.scale.set(1.9, 0.9, 2.2); smallRoof.position.set(0, 1.65, -1.65); g.add(smallRoof);
  } else {
    // 小舟
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.4), red); seat.position.set(0, 0.9, -0.5); g.add(seat);
    const oar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 6), wood); oar.position.set(0.65, 1.0, -0.4); oar.rotation.z = 0.5; oar.rotation.x = 0.3; g.add(oar);
  }
  g.scale.setScalar(scale);
  scene.add(g);
  const curve = new THREE.CatmullRomCurve3(spec.path.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'catmullrom', 0.3);
  boats.push({ group: g, curve, t: rr(0, 1), speed: spec.speed, phase: rr(0, TAU), spec });
  return g;
}

// ---------------------------------------------------------------- 诗笺
const poems = [];
const POEM_SPOTS = [
  { x: 0, z: -16, line: '天街小雨润如酥，草色遥看近却无。', place: '朱雀大街' },
  { x: -258, z: -20, line: '胡姬貌如花，当垆笑春风。', place: '西市' },
  { x: 174, z: -20, line: '东市买骏马，西市买鞍鞯。', place: '东市' },
  { x: 216, z: 244, line: '塔势如涌出，孤高耸天宫。', place: '大雁塔' },
  { x: 354, z: 248, line: '穿花蛱蝶深深见，点水蜻蜓款款飞。', place: '曲江池' },
  { x: 342, z: -78, line: '云想衣裳花想容，春风拂槛露华浓。', place: '兴庆宫' },
  { x: 150, z: -390, line: '九天阊阖开宫殿，万国衣冠拜冕旒。', place: '大明宫' },
  { x: 0, z: -300, line: '金阙晓钟开万户，玉阶仙仗拥千官。', place: '太极宫' },
  { x: 0, z: 344, line: '百千家似围棋局，十二街如种菜畦。', place: '明德门' },
  { x: -216, z: 322, line: '雁塔晨钟，声闻十里。', place: '小雁塔' },
  { x: 424, z: 360, line: '曲江流饮，杏园探花。', place: '芙蓉园' },
  { x: -90, z: 85, line: '春风得意马蹄疾，一日看尽长安花。', place: '平康坊' },
];

function makePoemScroll(x, z, line, place) {
  const g = new THREE.Group(); g.position.set(x, 1.2, z);
  const paper = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.1, 10), new THREE.MeshStandardMaterial({ color: 0xf4e4bf, roughness: 0.8, emissive: 0x7a5a20, emissiveIntensity: 0.15 }));
  paper.rotation.z = Math.PI / 2; g.add(paper);
  for (const s of [-1, 1]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.12, 10), new THREE.MeshStandardMaterial({ color: 0xd7aa50, roughness: 0.35, metalness: 0.5 }));
    cap.rotation.z = Math.PI / 2; cap.position.x = s * 0.58; g.add(cap);
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture(), color: 0xffd889, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.set(2.6, 2.6, 1); g.add(glow);
  scene.add(g);
  poems.push({ group: g, x, z, line, place, taken: false, phase: rr(0, TAU) });
}

function makeGlowTexture() {
  if (makeGlowTexture._tex) return makeGlowTexture._tex;
  makeGlowTexture._tex = makeTexture(128, 128, (ctx, w, h) => {
    const gr = ctx.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,240,190,.75)');
    gr.addColorStop(0.6, 'rgba(255,200,110,.18)'); gr.addColorStop(1, 'rgba(255,190,90,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
  }, { repeat: [1, 1] });
  return makeGlowTexture._tex;
}

// ---------------------------------------------------------------- 花草 / 蝴蝶 / 粒子
const butterflies = [];
function addButterflies() {
  for (let i = 0; i < 14; i++) {
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: pick([0xf5c35c, 0xf09aa8, 0xe7e1c8, 0xf5a45c]), side: THREE.DoubleSide });
    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.CircleGeometry(0.12, 6), mat);
      wing.scale.set(1, 0.7, 1); wing.position.x = s * 0.08; wing.rotation.y = s * 0.5; g.add(wing);
    }
    g.position.set(rr(275, 425), rr(1.2, 3), rr(255, 370));
    g.userData = { phase: rr(0, TAU), base: g.position.clone(), rx: rr(2, 6), rz: rr(2, 6) };
    scene.add(g); butterflies.push(g);
  }
}

function addPetals() {
  const count = isTouch ? 260 : 420;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  const colors = [new THREE.Color(0xf7c0c8), new THREE.Color(0xffe0a8), new THREE.Color(0xf4e6cc), new THREE.Color(0xe9b4c0)];
  for (let i = 0; i < count; i++) {
    pos[i * 3] = rr(-450, 450); pos[i * 3 + 1] = rr(1, 30); pos[i * 3 + 2] = rr(-380, 380);
    const c = pick(colors); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 0.45, map: makeGlowTexture(), vertexColors: true, transparent: true, depthWrite: false, opacity: 0.8, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat); scene.add(pts);
  petals = { pts, pos, count };
}
let petals = null;

function addFireflies() {
  const count = isTouch ? 70 : 120;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = rr(250, 440); pos[i * 3 + 1] = rr(1, 8); pos[i * 3 + 2] = rr(240, 380);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.7, map: makeGlowTexture(), color: 0xffe38a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat); scene.add(pts);
  fireflies = { pts, pos, count, base: pos.slice() };
}
let fireflies = null;

function updateNature(dt, t) {
  if (petals) {
    const p = petals.pos;
    for (let i = 0; i < petals.count; i++) {
      p[i * 3] += Math.sin(t * 0.6 + i) * 0.05 + 0.08 * dt;
      p[i * 3 + 1] -= 0.18 * dt;
      p[i * 3 + 2] += Math.cos(t * 0.4 + i) * 0.03;
      if (p[i * 3 + 1] < 0.2) { p[i * 3 + 1] = rr(12, 30); p[i * 3] = camera.position.x + rr(-80, 80); p[i * 3 + 2] = camera.position.z + rr(-80, 80); }
    }
    petals.pts.geometry.attributes.position.needsUpdate = true;
  }
  if (fireflies) {
    const p = fireflies.pos;
    for (let i = 0; i < fireflies.count; i++) {
      p[i * 3 + 1] = fireflies.base[i * 3 + 1] + Math.sin(t * 1.2 + i) * 0.35;
    }
    fireflies.pts.geometry.attributes.position.needsUpdate = true;
  }
  for (const b of butterflies) {
    const u = b.userData;
    b.position.x = u.base.x + Math.sin(t * 0.7 + u.phase) * u.rx;
    b.position.z = u.base.z + Math.cos(t * 0.55 + u.phase) * u.rz;
    b.position.y = u.base.y + Math.sin(t * 1.6 + u.phase) * 0.4;
    b.rotation.y = Math.sin(t * 0.7 + u.phase) * 0.8;
    b.children.forEach((w, i) => { w.rotation.y = (i ? 1 : -1) * (0.3 + Math.abs(Math.sin(t * 10 + u.phase)) * 0.8); });
  }
}

// ---------------------------------------------------------------- 众生更新
function updateNPCs(dt, t, playerPos) {
  for (const n of npcs) {
    if (n.camel) { n.group.position.y = Math.sin(t * 1.1 + n.phase) * 0.015; continue; }
    if (n.path && n.path.length > 1) {
      n.pathT += (n.speed * dt * n.dir) / 18;
      if (n.pathT > 1) { n.pathT = 1; n.dir = -1; }
      if (n.pathT < 0) { n.pathT = 0; n.dir = 1; }
      const p = n.path;
      const f = n.pathT * (p.length - 1);
      const i = Math.min(p.length - 2, Math.floor(f));
      const a = p[i], b = p[i + 1], k = f - i;
      n.group.position.x = lerp(a[0], b[0], k);
      n.group.position.z = lerp(a[1], b[1], k);
      const ang = Math.atan2(b[0] - a[0], b[1] - a[1]) + (n.dir < 0 ? Math.PI : 0);
      n.group.rotation.y = damp(n.group.rotation.y, ang, 4, dt);
    }
    n.group.position.y = Math.abs(Math.sin(t * 4.2 + n.phase)) * 0.035;
    n.mesh.rotation.z = Math.sin(t * 2.1 + n.phase) * 0.015;
    // 气泡
    if (n.group.userData.bubble) {
      const dist = Math.hypot(playerPos.x - n.group.position.x, playerPos.z - n.group.position.z);
      n.bubbleTimer -= dt;
      if (n.bubbleTimer < 0) n.bubbleTimer = rr(6, 12);
      n.group.userData.bubble.visible = dist < 22 && n.bubbleTimer < 3.2;
    }
  }
}

function updateBoats(dt, t) {
  for (const b of boats) {
    b.t = (b.t + b.speed * dt) % 1;
    const p = b.curve.getPointAt(b.t);
    const tan = b.curve.getTangentAt(b.t);
    b.group.position.set(p.x, 0.1 + Math.sin(t * 1.4 + b.phase) * 0.035, p.z);
    b.group.rotation.y = Math.atan2(tan.x, tan.z);
    b.group.rotation.z = Math.sin(t * 1.1 + b.phase) * 0.01;
  }
}

// ---------------------------------------------------------------- 场景人物布置
function spawnWorldLife() {
  // 西市
  addNPC(-292, -60, { bubble: '胡饼——刚出炉的胡饼！', ry: 0 });
  addNPC(-276, -36, { bubble: '西域葡萄，甜得很！', ry: 1.2 });
  addNPC(-314, -12, { woman: true, bubble: '客官，看看这匹蜀锦？', ry: -0.8 });
  addNPC(-244, -48, { bubble: '新到的香料，波斯来的！', ry: 2.4 });
  addNPC(-326, -58, { path: [[-330, -60], [-258, -52], [-252, -20], [-320, -24]], speed: 0.5 });
  addNPC(-270, 18, { path: [[-280, 24], [-230, 20], [-224, -20], [-286, -16]], speed: 0.55 });
  addNPC(-230, 30, { woman: true, path: [[-236, 34], [-280, 38], [-286, 10], [-240, 8]], speed: 0.42 });
  addNPC(-310, 36, { child: true, path: [[-312, 38], [-290, 40], [-288, 22], [-310, 20]], speed: 0.7 });
  addCamel(-332, -34, 0.35); addCamel(-344, -22, 0.15);
  // 东市
  addNPC(140, -56, { bubble: '上好的珠玉，看一看～', ry: 0.6 });
  addNPC(188, -30, { woman: true, bubble: '绫锦行今日新到蜀锦！', ry: -1.1 });
  addNPC(220, -64, { bubble: '茶汤一碗，解解乏～', ry: 1.7 });
  addNPC(160, 26, { path: [[152, 30], [214, 26], [220, -4], [158, 0]], speed: 0.5 });
  addNPC(204, 38, { path: [[196, 40], [240, 36], [244, 4], [200, 8]], speed: 0.48 });
  addNPC(118, 18, { woman: true, path: [[112, 20], [152, 24], [156, -6], [116, -2]], speed: 0.4 });
  // 朱雀大街行人
  addNPC(-21, -110, { path: [[-21, -120], [-21, 10]], speed: 0.52 });
  addNPC(21, 20, { path: [[21, 30], [21, -80]], speed: 0.6 });
  addNPC(-20, 120, { woman: true, path: [[-20, 110], [-20, 260]], speed: 0.45 });
  addNPC(20, 220, { path: [[20, 230], [20, 60]], speed: 0.56 });
  addNPC(-22, 290, { child: true, path: [[-22, 300], [-22, 180]], speed: 0.65 });
  addNPC(24, 80, { guard: true, path: [[24, 90], [24, 10]], speed: 0.35 });
  addNPC(-24, -60, { guard: true, path: [[-24, -70], [-24, 20]], speed: 0.35 });
  // 曲江
  addNPC(300, 245, { woman: true, bubble: '画舫游湖，半个时辰一趟！', ry: 0.4 });
  addNPC(320, 286, { path: [[310, 286], [392, 286]], speed: 0.38 });
  addNPC(394, 332, { woman: true, path: [[398, 338], [360, 352], [330, 340]], speed: 0.36 });
  addNPC(280, 328, { child: true, bubble: '看，湖里有锦鲤！', ry: 1.6 });
  addNPC(418, 300, { guard: true, path: [[418, 300], [418, 350]], speed: 0.25 });
  // 大雁塔
  addNPC(202, 310, { monk: true, bubble: '阿弥陀佛，施主慢行。', ry: 0 });
  addNPC(230, 310, { monk: true, ry: 2.4 });
  addNPC(196, 250, { path: [[192, 252], [238, 252]], speed: 0.3 });
  // 宫门守卫
  for (const [x, z] of [[-36, 368], [36, 368], [-36, -292], [36, -292], [136, -374], [164, -374]]) addNPC(x, z, { guard: true, ry: z > 0 ? 0.2 : Math.PI });
  // 酒肆二层 / 街边
  addNPC(-254, 0, { bubble: '好酒！再来一碗！', ry: -0.6 });
  addNPC(-50, 72, { woman: true, bubble: '今日平康坊有胡旋舞～', ry: 0.3 });
  // 兴庆宫
  addNPC(330, -92, { woman: true, path: [[324, -94], [360, -92]], speed: 0.3 });
  addNPC(380, -186, { monk: true, ry: 1.2 });
  // 城门外
  addNPC(10, 420, { path: [[10, 410], [10, 470]], speed: 0.4 });
  addNPC(-14, 500, { woman: true, path: [[-14, 490], [-14, 540]], speed: 0.35 });

  // 诗笺
  POEM_SPOTS.forEach(p => makePoemScroll(p.x, p.z, p.line, p.place));

  // 船只
  boatSpecs.forEach(makeBoat);

  addButterflies();
  addPetals();
  addFireflies();
}
