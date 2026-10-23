/* ============================================================
   小青龙 / 木单车 / 长安众生 / 画舫
   ============================================================ */

const DRAGON = {
  body: 0x54b88b, bodyDark: 0x348667, belly: 0xffeccb, bellyShade: 0xf5d9ac,
  horn: 0xead9ac, hornLight: 0xffe9c4, mane: 0xe8b75b, maneDeep: 0xc88938,
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
function taperedDragonCurve(points, startRadius, endRadius, material, segments = 16) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, segments, 1, 10, false);
  const p = geometry.attributes.position;
  for (let ring = 0; ring <= segments; ring++) {
    const t = ring / segments, center = curve.getPointAt(t), radius = lerp(startRadius, endRadius, t);
    for (let k = 0; k <= 10; k++) {
      const i = ring * 11 + k;
      p.setXYZ(i, center.x + (p.getX(i)-center.x)*radius, center.y + (p.getY(i)-center.y)*radius, center.z + (p.getZ(i)-center.z)*radius);
    }
  }
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material); mesh.castShadow = true; return mesh;
}

function dragonCloudTuft(base, tip, width, material) {
  const length = base.distanceTo(tip), direction = tip.clone().sub(base).normalize();
  const profile = [[0,0],[.45,.05],[.9,.2],[1,.4],[.75,.64],[.4,.84],[0,1]].map(([r,t]) => new THREE.Vector2(r*width,t*length));
  const geometry = new THREE.LatheGeometry(profile,12);
  const p=geometry.attributes.position;
  for(let i=0;i<p.count;i++) p.setX(i,p.getX(i)+Math.pow(p.getY(i)/length,2)*width*.9);
  geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,material);mesh.position.copy(base);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);mesh.castShadow=true;
  return mesh;
}

function createDragon() {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshPhysicalMaterial({color:DRAGON.body,roughness:0.64,metalness:0,clearcoat:0.12,clearcoatRoughness:0.55,sheen:0.15,sheenColor:new THREE.Color(0xb1e6c4),sheenRoughness:0.8});
  const bodyLightMat = toon(0x86d6ae);
  const bellyMat = toon(DRAGON.belly);
  const hornMat = new THREE.MeshPhysicalMaterial({color:0xf6e7c6,roughness:.6,clearcoat:.12});
  const maneMat = toon(DRAGON.mane);
  const scarfMat = toon(DRAGON.scarf);
  const darkMat = toon(0x2b3732);
  const whiteMat = toon(0xfffcf2);
  const blushMat = toon(DRAGON.blush);
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd9aa4b, roughness: 0.35, metalness: 0.55 });

  const bodyRoot = new THREE.Group(); g.add(bodyRoot);

  // 身体
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 24), bodyMat);
  body.scale.set(0.94, 1.1, 0.88); body.position.set(0, 1.27, -0.12);
  body.castShadow = true; bodyRoot.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.62, 18, 14), bellyMat);
  belly.scale.set(0.88, 0.98, 0.54); belly.position.set(0, 1.22, 0.26);
  bodyRoot.add(belly);
  // 肚皮纹
  for (let i = 0; i < 3; i++) {
    const line = new THREE.Mesh(new THREE.TorusGeometry(0.26 - i * 0.03, 0.015, 4, 12, Math.PI), toon(0xd8c5a1));
    line.rotation.set(Math.PI / 2, 0, 0); line.position.set(0, 1.32 - i * 0.25, 0.67); bodyRoot.add(line);
  }

  // 头部
  const head = new THREE.Group(); head.position.set(0, 2.15, 0.16); head.scale.setScalar(1.26); bodyRoot.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 28), bodyMat);
  skull.scale.set(1.07, 0.98, 0.94); skull.castShadow = true; head.add(skull);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), bellyMat);
  snout.scale.set(1.1, 0.65, 0.72); snout.position.set(0, -0.17, 0.5); head.add(snout);
  const jaw=new THREE.Mesh(new THREE.SphereGeometry(.34,24,16),bellyMat);
  jaw.scale.set(1.05,.48,.78);jaw.position.set(0,-.34,.46);head.add(jaw);
  // 鼻孔
  for (const s of [-1, 1]) {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 5), darkMat);
    nostril.position.set(s * 0.14, -0.12, 0.789); nostril.scale.set(1, 0.7, 0.5); head.add(nostril);
  }
  // 微笑
  const smileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.22, -0.26, 0.755), new THREE.Vector3(-0.07, -0.32, 0.793),
    new THREE.Vector3(0.08, -0.32, 0.793), new THREE.Vector3(0.22, -0.26, 0.755),
  ]);
  const smile = new THREE.Mesh(new THREE.TubeGeometry(smileCurve, 10, 0.018, 4, false), darkMat);
  head.add(smile);
  const mouth=new THREE.Mesh(new THREE.SphereGeometry(.14,20,12),toon(0x693b30));
  mouth.scale.set(1,.47,.2);mouth.position.set(0,-.29,.791);head.add(mouth);
  const tongue=new THREE.Mesh(new THREE.SphereGeometry(.065,16,10),toon(0xe59283));
  tongue.scale.set(1,.32,.2);tongue.position.set(0,-.316,.819);head.add(tongue);
  // 眼睛
  const eyes = [];
  const irisMat = new THREE.MeshPhysicalMaterial({color:0x744b2c,roughness:0.22,clearcoat:0.9,clearcoatRoughness:0.16});
  const pupilMat = new THREE.MeshStandardMaterial({color:0x172e28,roughness:0.22});
  for (const s of [-1, 1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.21, 24, 18), whiteMat);
    white.scale.set(1, 1.12, 0.66); white.position.set(s * 0.27, 0.16, 0.47); head.add(white);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.145, 24, 18), irisMat);
    iris.position.set(s * 0.27, 0.15, 0.588); iris.scale.set(0.92, 1.0, 0.5); head.add(iris);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.1,20,16),pupilMat); pupil.position.set(s*.27,.15,.645); pupil.scale.set(1,1.1,.35); head.add(pupil);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), whiteMat);
    shine.position.set(s * 0.24, 0.2, 0.682); head.add(shine);
    head.add(taperedDragonCurve([new THREE.Vector3(s*.1,.34,.51),new THREE.Vector3(s*.25,.415,.48),new THREE.Vector3(s*.43,.35,.43)],.035,.025,bodyLightMat,12));
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), blushMat);
    blush.scale.set(1.1, 0.55, 0.4); blush.position.set(s * 0.43, -0.16, 0.56); head.add(blush);
    eyes.push({ white, iris, pupil, shine });
  }
  // 鹿角
  for (const s of [-1, 1]) {
    const a = new THREE.Vector3(s*.26,.48,0), b = new THREE.Vector3(s*.36,.72,-.08), c = new THREE.Vector3(s*.6,.98,-.18);
    head.add(taperedDragonCurve([a,b,new THREE.Vector3(s*.51,.91,-.1),c],.095,.022,hornMat));
    head.add(taperedDragonCurve([b,new THREE.Vector3(s*.48,.82,.08),new THREE.Vector3(s*.64,.87,.13)],.065,.018,hornMat));
    head.add(taperedDragonCurve([a.clone().lerp(b,.45),new THREE.Vector3(s*.39,.66,.17),new THREE.Vector3(s*.46,.73,.22)],.05,.014,hornMat,12));
    const tip = new THREE.Mesh(new THREE.SphereGeometry(.024,10,8),hornMat); tip.position.copy(c); head.add(tip);
  }
  // 耳朵
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), bodyLightMat);
    ear.scale.set(0.75, 0.45, 1.25); ear.position.set(s * 0.56, 0.25, 0.05); ear.rotation.z = s * 0.5; head.add(ear);
  }
  // 鬃毛
  for (let i=0;i<5;i++) head.add(dragonCloudTuft(new THREE.Vector3((i-2)*.15,.37,-.4),new THREE.Vector3((i-2)*.22,.64-Math.abs(i-2)*.06,-.71),.105,i%2?maneMat:bodyLightMat));
  for(const side of [-1,1]) for(let i=0;i<3;i++) head.add(dragonCloudTuft(new THREE.Vector3(side*.48,-.06-i*.07,.02),new THREE.Vector3(side*(.72-i*.015),.02-i*.16,-.19),.085,bodyLightMat));
  // 龙须
  const whiskers = [];
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.28, -0.16 + k * 0.1, 0.73),
      new THREE.Vector3(s * 0.62, -0.09 + k * 0.12, 0.82),
      new THREE.Vector3(s * 0.82, -0.22 + k * 0.18, 0.78),
      new THREE.Vector3(s * 0.99, -0.36 + k * 0.2, 0.66),
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
    const sp = dragonCloudTuft(new THREE.Vector3(0,1.88-i*.18,-.61),new THREE.Vector3(0,2.04-i*.18,-.89),.09,i%2?maneMat:bodyLightMat);
    bodyRoot.add(sp); spikes.push(sp);
  }

  // 尾巴
  const tailRoot = new THREE.Group(); tailRoot.position.set(0, 1.3, -0.66); bodyRoot.add(tailRoot);
  const tailSegs = [];
  const tailLength=1.5, tailSections=30, radial=12;
  const tailGeometry=new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(),new THREE.Vector3(0,0,-tailLength)),tailSections,1,radial,false);
  const tp=tailGeometry.attributes.position,skinIndices=[],skinWeights=[];
  for(let ring=0;ring<=tailSections;ring++) {
    const t=ring/tailSections,r=lerp(.19,.045,t),joint=Math.min(5,Math.floor(t*6)),blend=Math.min(1,t*6-joint);
    for(let k=0;k<=radial;k++) {
      const i=ring*(radial+1)+k;tp.setXYZ(i,tp.getX(i)*r,tp.getY(i)*r,tp.getZ(i));
      skinIndices.push(joint,joint+1,0,0);skinWeights.push(1-blend,blend,0,0);
    }
  }
  tailGeometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(skinIndices,4));
  tailGeometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(skinWeights,4));tailGeometry.computeVertexNormals();
  const tailSkin=new THREE.SkinnedMesh(tailGeometry,bodyMat);tailRoot.add(tailSkin);tailSkin.castShadow=true;
  let parent=tailSkin;
  for(let i=0;i<7;i++){const bone=new THREE.Bone();bone.position.z=i===0?0:-tailLength/6;parent.add(bone);tailSegs.push(bone);parent=bone;}
  tailSkin.bind(new THREE.Skeleton(tailSegs));
  parent.add(dragonCloudTuft(new THREE.Vector3(0,0,.04),new THREE.Vector3(0,.13,-.41),.16,maneMat));

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
  root.scale.setScalar(0.68);
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
    dragon.eyes.forEach((e, i) => {
      const blink = 1 - Math.pow(Math.max(0,Math.cos(t*1.47)),34)*0.96;
      e.white.scale.y = 1.12 * blink; e.iris.scale.y = blink; e.pupil.scale.y = 1.1 * blink; e.shine.scale.y = blink;
      e.iris.position.y = e.pupil.position.y = 0.15 + Math.sin(t * 0.9 + i) * 0.008;
    });
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
const ROBE_COLORS = [0x5c8285, 0xa66750, 0x708b6c, 0x8d728a, 0xb39a60, 0x5d738b, 0x99594f, 0x6c9188, 0xc7b08c, 0x8f6956];
const HAIR = 0x2b2521;

function mergeColored(parts) {
  const positions = [], normals = [], colors = [], uvs = [], gait = [], textiles=[];
  const color = new THREE.Color();
  for (const part of parts) {
    let geo = part.geo.index ? part.geo.toNonIndexed() : part.geo.clone();
    geo.applyMatrix4(part.matrix);
    const p = geo.attributes.position, n = geo.attributes.normal, u = geo.attributes.uv, authoredColours=part.preserveColours?geo.attributes.color:null;
    color.set(part.color);
    for (let i = 0; i < p.count; i++) {
      positions.push(p.getX(i), p.getY(i), p.getZ(i));
      normals.push(n.getX(i), n.getY(i), n.getZ(i));
      colors.push(authoredColours?authoredColours.getX(i):color.r,authoredColours?authoredColours.getY(i):color.g,authoredColours?authoredColours.getZ(i):color.b);
      uvs.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0);
      gait.push(...(part.gait || [0, 0, 0, 0]));
      textiles.push(part.cloth||part.geo.type==='LatheGeometry'?1:0);
    }
    geo.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setAttribute('citizenGait', new THREE.Float32BufferAttribute(gait, 4));
  g.setAttribute('citizenTextile',new THREE.Float32BufferAttribute(textiles,1));
  return g;
}

function matrixTRS(x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Matrix4();
  m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
  return m;
}

function robeGeometry(top, bottom, height) {
  const points = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, radius = lerp(bottom, top, Math.pow(t, 0.74));
    points.push(new THREE.Vector2(radius, (t - 0.5) * height));
  }
  const geometry = new THREE.LatheGeometry(points, 32);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), z = positions.getZ(i), t = (positions.getY(i) / height + 0.5);
    const angle = Math.atan2(x, z), fold = 1 + Math.cos(angle * 12) * 0.018 * (1 - t);
    positions.setX(i, x * fold); positions.setZ(i, z * fold);
  }
  geometry.computeVertexNormals();
  return geometry;
}

let merchantFaceGeometry=null;
function getMerchantFaceGeometry() {
  if(merchantFaceGeometry) return merchantFaceGeometry;
  const data=typeof CHARACTER_FACES!=='undefined'&&CHARACTER_FACES.merchant;
  if(!data) throw new Error('The locally licensed merchant portrait is missing');
  const decode=(value,Type)=>new Type(Uint8Array.from(atob(value),c=>c.charCodeAt(0)).buffer);
  const g=new THREE.BufferGeometry();
  for(const [name,key] of [['position','positions'],['normal','normals'],['color','colours']])g.setAttribute(name,new THREE.BufferAttribute(decode(data[key],Float32Array),3));
  g.setIndex(new THREE.BufferAttribute(decode(data.indices,Uint16Array),1));
  return merchantFaceGeometry=g;
}

function makePersonGeometry(opt = {}) {
  const { woman = false, monk = false, guard = false, child = false, moving = false, robe = pick(ROBE_COLORS) } = opt;
  const parts = [];
  const h = child ? 0.72 : 1;
  const authoredFace=!!opt.foreign&&!woman&&!monk&&!child;
  const skin=authoredFace?0xcead86:SKIN;
  // 袍身
  if (monk) {
    parts.push({ geo: robeGeometry(0.24, 0.4, 1.12), color: 0xb0663b, matrix: matrixTRS(0, 0.64 * h, 0, h, h, h) });
  } else if (guard) {
    parts.push({ geo: robeGeometry(0.27, 0.36, 1.1), color: 0x5d4a35, matrix: matrixTRS(0, 0.63 * h, 0, h, h, h) });
    parts.push({ geo: new THREE.BoxGeometry(0.62, 0.16, 0.3), color: 0x404a4b, matrix: matrixTRS(0, 1.08 * h, 0, h, h, h) });
  } else if (woman) {
    parts.push({ geo: new THREE.SphereGeometry(.24,16,12), color:0xe5d6bc,matrix:matrixTRS(0,1.03*h,0,h,.86*h,.75*h) });
    parts.push({ geo: robeGeometry(.21,.38,.86),color:robe,matrix:matrixTRS(0,.58*h,0,h,h,h) });
    parts.push({ geo:new THREE.CylinderGeometry(.223,.225,.075,16),color:0x725349,matrix:matrixTRS(0,1.015*h,0,h,h,h) });
    const shawlColour=new THREE.Color(robe).lerp(new THREE.Color(0xeee0c6),.45).getHex();
    for(const side of [-1,1]) {
      const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.2,1.16,0),new THREE.Vector3(side*.33,.96,.11),new THREE.Vector3(side*.3,.66,.15),new THREE.Vector3(side*.18,.43,.27)]);
      parts.push({geo:new THREE.TubeGeometry(curve,12,.034,6,false),color:shawlColour,matrix:matrixTRS(0,0,0,h,h,h)});
    }
  } else {
    parts.push({ geo: robeGeometry(0.235, 0.32, 1.08), color: robe, matrix: matrixTRS(0, 0.66 * h, 0, h, h, h) });
    parts.push({ geo: new THREE.CylinderGeometry(.275,.28,.085,16), color: 0x594b3b, matrix: matrixTRS(0, .9*h, 0, h,h,h) });
    parts.push({geo:new THREE.BoxGeometry(.065,.065,.018),color:0xb5995c,matrix:matrixTRS(.08*h,.9*h,.282*h,h,h,h)});
    parts.push({geo:new THREE.BoxGeometry(.045,.34,.022),color:0x76604a,matrix:matrixTRS(.18*h,.705*h,.285*h,h,h,h,0,0,-.12)});
  }
  if(!woman) {
    const cloth=monk?0xb0663b:guard?0x5d4a35:robe;
    parts.push({geo:new THREE.SphereGeometry(.26,20,12),color:cloth,cloth:true,matrix:matrixTRS(0,1.15*h,0,1.08*h,.46*h,.8*h)});
    parts.push({geo:new THREE.TorusGeometry(.104,.022,6,16),color:0xd6c5a7,matrix:matrixTRS(0,1.256*h,.015,h,h,h,Math.PI/2)});
  }
  // Overlapping collars and a long waist sash give the robe an actual layered cut.
  if (!guard && (woman || monk)) {
    for (const side of [-1, 1]) parts.push({ geo: new THREE.BoxGeometry(0.055 * h, 0.32 * h, 0.028 * h),
      color: woman ? 0xf4d8b6 : 0xe7dbbf, matrix: matrixTRS(side * 0.075 * h, 1.06 * h, 0.2 * h, 1, 1, 1, 0, 0, side * 0.45) });
    parts.push({ geo: new THREE.BoxGeometry(0.055 * h, 0.4 * h, 0.025), color: woman ? 0xbf644e : 0x92734a,
      matrix: matrixTRS(0.12 * h, 0.72 * h, 0.3 * h, 1, 1, 1, 0.06, 0, -0.12) });
  }
  // 头
  const headStart=parts.length,headY = 1.38 * h;
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
    parts.push({ geo: new THREE.SphereGeometry(0.024 * h, 8, 6), color: 0xe9e0ce, matrix: matrixTRS(s * .07*h, headY+.02*h, .19*h,1,.7,.5) });
    parts.push({ geo: new THREE.SphereGeometry(.012*h,8,6), color:0x3a302a,matrix:matrixTRS(s*.07*h,headY+.02*h,.204*h) });
    parts.push({geo:new THREE.SphereGeometry(.032*h,8,6),color:SKIN,matrix:matrixTRS(s*.205*h,headY-.015*h,0,.5,1,.7)});
    parts.push({geo:new THREE.BoxGeometry(.065*h,.012*h,.014*h),color:HAIR,matrix:matrixTRS(s*.07*h,headY+.065*h,.195*h,1,1,1,0,0,s*.1)});
  }
  parts.push({geo:new THREE.SphereGeometry(.025*h,8,6),color:0xe4bd98,matrix:matrixTRS(0,headY-.025*h,.205*h,.7,1,1.2)});
  parts.push({ geo: new THREE.BoxGeometry(0.06 * h, 0.012 * h, 0.02), color: 0x9e5e54, matrix: matrixTRS(0, headY - 0.08 * h, 0.2 * h) });
  if(authoredFace) {
    parts.splice(headStart,parts.length-headStart,{geo:getMerchantFaceGeometry(),preserveColours:true,color:0xffffff,matrix:matrixTRS(0,1.14*h,0,.46*h,.46*h,.46*h)});
    // A cloth head-wrap and long robe provide this Silk Road merchant's costume;
    // the artist's modern farmer clothing and straw hat are excluded.
    for(let i=0;i<2;i++)parts.push({geo:new THREE.TorusGeometry(.147*h,.045*h,8,18),color:i?0xb7a17d:0xc8b591,
      matrix:matrixTRS(0,(1.55+i*.055)*h,-.018*h,1.08,1,.9,Math.PI/2,0,i*.1)});
    const smile=new THREE.CatmullRomCurve3([new THREE.Vector3(-.035,1.337,.108),new THREE.Vector3(0,1.329,.116),new THREE.Vector3(.035,1.337,.108)]);
    parts.push({geo:new THREE.TubeGeometry(smile,6,.006,4,false),color:0x765249,matrix:matrixTRS(0,0,0,h,h,h)});
  }
  // Wide, tapered sleeves have a shoulder pivot; their hands travel with the
  // same pose in the colour, depth and shadow passes.
  const armColor = monk ? 0xb0663b : guard ? 0x5d4a35 : robe;
  for (const s of [-1, 1]) {
    const motion = [s, 1.12 * h, 0.02 * h, moving ? 1 : 0];
    parts.push({ geo: new THREE.CylinderGeometry(0.085 * h, 0.14 * h, 0.5 * h, 10, 3), color: armColor,
      gait: motion, cloth:true, matrix: matrixTRS(s * 0.32 * h, 0.88 * h, 0.02 * h, 1, 1, 0.86, 0, 0, s * 0.24) });
    parts.push({ geo: new THREE.CylinderGeometry(0.143 * h, 0.143 * h, 0.045 * h, 10), color: woman ? 0xe6c5a2 : 0xe1d4b7,
      gait: motion, matrix: matrixTRS(s * 0.38 * h, 0.64 * h, 0.02 * h, 1, 1, 0.86, 0, 0, s * 0.24) });
    parts.push({ geo: new THREE.SphereGeometry(0.065 * h, 8, 6), color: skin, gait: motion,
      matrix: matrixTRS(s * 0.38 * h, 0.59 * h, 0.04 * h, 0.8, 1.15, 0.8) });
  }
  // 脚
  for (const s of [-1, 1]) {
    const motion = [-s, 0.67 * h, 0, moving ? 2 : 0];
    parts.push({ geo: new THREE.CapsuleGeometry(0.065 * h, 0.27 * h, 3, 8), color: 0xafa48a, gait: motion,
      matrix: matrixTRS(s * 0.13 * h, 0.23 * h, 0, 1, 1, 1) });
    parts.push({ geo: new THREE.SphereGeometry(0.09 * h, 8, 6), color: 0x332a22, gait: motion,
      matrix: matrixTRS(s * 0.13 * h, 0.07 * h, 0.08 * h, 1, 0.55, 1.65) });
  }
  // 配饰
  if (woman) {
    parts.push({ geo: new THREE.TorusGeometry(0.24 * h, 0.025 * h, 4, 12), color: 0xd8b25e, matrix: matrixTRS(0, 1.0 * h, 0, 1, 1, 1, Math.PI / 2) });
    parts.push({geo:new THREE.CylinderGeometry(.009*h,.009*h,.38*h,6),color:0xc4a15f,matrix:matrixTRS(0,headY+.22*h,-.03*h,1,1,1,0,0,Math.PI/2-.18)});
    parts.push({geo:new THREE.SphereGeometry(.025*h,8,6),color:0xc4a15f,matrix:matrixTRS(-.18*h,headY+.25*h,-.03*h)});
  }
  if (guard) {
    parts.push({ geo: new THREE.ConeGeometry(0.09 * h, 0.24 * h, 6), color: 0x8a3d34, matrix: matrixTRS(0, 1.55 * h, 0) });
  }
  // A small travelling fold makes the hem follow the walk, leaving the upper
  // robe and its collar anchored to the torso rather than swaying as one cone.
  if (moving) for (const p of parts) if (p.geo.type === 'LatheGeometry') p.gait = [0, 0, h, 3];
  const geometry = mergeColored(parts);
  const seed = rr(0, TAU);
  geometry.setAttribute('citizenPhase', new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count).fill(seed), 1));
  return geometry;
}

const personMat = new THREE.MeshStandardMaterial({vertexColors:true,roughness:.88,
  normalMap:SurfaceLibrary.cloth(0xffffff).normalMap,normalScale:new THREE.Vector2(.12,.12)});
const citizenClock = { value: 0 };
const personDepthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
// Small analytic joint poses retain the shared/instanced crowd budget. This is
// vertex animation of real limbs, with the identical deformation in shadows.
function installCitizenGait(material) {
  material.onBeforeCompile = shader => {
    shader.uniforms.citizenClock = citizenClock;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>
      attribute vec4 citizenGait; attribute float citizenPhase; uniform float citizenClock;
      attribute float citizenTextile; varying float vCitizenTextile;
      float citizenStep() {
        float phase = citizenPhase;
        #ifdef USE_INSTANCING
          phase += instanceMatrix[3].x * 0.67 + instanceMatrix[3].z * 0.73;
        #endif
        return sin(citizenClock * 4.2 + phase);
      }
      mat3 citizenJoint(float angle) {
        float c = cos(angle), s = sin(angle);
        return mat3(1.,0.,0., 0.,c,s, 0.,-s,c);
      }
      float citizenAngle() {
        return citizenGait.x * citizenStep() * (citizenGait.w < 1.5 ? 0.32 : 0.25);
      }`);
    shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
      if (citizenGait.w > 0.5 && citizenGait.w < 2.5) objectNormal = citizenJoint(citizenAngle()) * objectNormal;`);
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vCitizenTextile=citizenTextile;
      if (citizenGait.w > 0.5 && citizenGait.w < 2.5) {
        vec3 pivot = vec3(0., citizenGait.y, citizenGait.z);
        transformed = citizenJoint(citizenAngle()) * (transformed - pivot) + pivot;
      } else if (citizenGait.w > 2.5) {
        float hem = 1.0 - smoothstep(0.1, 0.85, position.y / citizenGait.z);
        transformed.z += citizenStep() * hem * position.x * 0.22;
      }`);
    if(material.isMeshStandardMaterial) {
      shader.fragmentShader='varying float vCitizenTextile;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',
        'vec3 citizenBaseNormal=normal;\n#include <normal_fragment_maps>\nnormal=normalize(mix(citizenBaseNormal,normal,vCitizenTextile));');
    }
  };
  material.customProgramCacheKey = () => 'changan-citizen-gait-cloth-v2';
}
installCitizenGait(personMat); installCitizenGait(personDepthMat);

// Shared crowd meshes keep the city lived-in without one draw call per citizen.
const cityCrowd = { batches: [], count: 0, matrix: new THREE.Matrix4(), rotation: new THREE.Quaternion(), scale: new THREE.Vector3(), position: new THREE.Vector3() };
function buildCityCrowd() {
  const routes = [];
  const clear = (x, z) => canStandAt(x, z) && !colliders.some(c => x > c.minX - 0.35 && x < c.maxX + 0.35 && z > c.minZ - 0.35 && z < c.maxZ + 0.35);
  function route(x0, z0, x1, z1, count) {
    if (Array.from({ length: 19 }, (_, i) => i / 18).some(t => !clear(lerp(x0, x1, t), lerp(z0, z1, t)))) return;
    for (let i = 0; i < count; i++) routes.push({ x0, z0, x1, z1, phase: rr(0, TAU), speed: rr(0.012, 0.024), scale: rr(0.92, 1.1), yaw: 0 });
  }
  for (const x of [-7.8, 7.8]) for (let z = -190; z < 330; z += 48) route(x, z, x, z + 39, 4);
  for(const x of [-7.8,7.8]) route(x,333,x,363,6);
  for (const market of marketDefs) {
    for (const x of [-7.4, 7.4]) {
      route(market.x + x, market.z + 11, market.x + x, market.z + 35, 9);
      route(market.x + x, market.z - 35, market.x + x, market.z - 11, 9);
    }
    for (const z of [-8, 8]) route(market.x - 49, market.z + z, market.x - 13, market.z + z, 7);
    for (const z of [-8, 8]) route(market.x + 13, market.z + z, market.x + 49, market.z + z, 7);
  }
  const palette = [0x617d8c, 0xa55e4d, 0x8d885c, 0x6b8280, 0xb39469, 0x8f718b];
  for (let template = 0; template < palette.length; template++) {
    const geometry = makePersonGeometry({ woman: template % 2 === 1, moving: true, robe: palette[template] });
    const cells = new Map();
    routes.forEach((person, i) => {
      if (i % palette.length !== template) return;
      const key = Math.floor((person.x0 + person.x1) / 2 / 144) + ',' + Math.floor((person.z0 + person.z1) / 2 / 144);
      if (!cells.has(key)) cells.set(key, []);
      cells.get(key).push(person);
    });
    for (const citizens of cells.values()) {
      const mesh = new THREE.InstancedMesh(geometry, personMat, citizens.length);
      mesh.name = 'citizens-' + template;
      mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.customDepthMaterial = personDepthMat;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const bounds = new THREE.Box3();
      for (const p of citizens) {
        bounds.expandByPoint(new THREE.Vector3(p.x0 - 1, -0.1, p.z0 - 1));
        bounds.expandByPoint(new THREE.Vector3(p.x1 + 1, 2.5, p.z1 + 1));
      }
      mesh.boundingSphere = bounds.getBoundingSphere(new THREE.Sphere());
      // Bounds contain the complete checked walking routes, not just the first pose.
      mesh.userData.detailDistance = 235;
      mesh.userData.detailCenter = mesh.boundingSphere.center.clone();
      mesh.userData.detailRadius = mesh.boundingSphere.radius;
      scene.add(mesh); cityCrowd.batches.push({ mesh, citizens }); cityCrowd.count += citizens.length;
    }
  }
  updateCityCrowd(0, 0);
  window.__changanCrowd = { count: cityCrowd.count, batches: cityCrowd.batches.length };
}

function updateCityCrowd(dt, time) {
  const c = cityCrowd;
  for (const { mesh, citizens } of c.batches) {
    citizens.forEach((person, i) => {
      const phase = person.phase + time * person.speed, u = (Math.sin(phase) + 1) / 2;
      const yaw = Math.atan2(person.x1 - person.x0, person.z1 - person.z0) + (Math.cos(phase) < 0 ? Math.PI : 0);
      person.yaw = dt ? damp(person.yaw, yaw, 5, dt) : yaw;
      const x=lerp(person.x0,person.x1,u),z=lerp(person.z0,person.z1,u);
      c.position.set(x, groundHeightAt(x,z)+Math.abs(Math.sin(time*4.4+person.phase))*.025, z);
      c.rotation.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, person.yaw);
      c.scale.setScalar(person.scale);
      c.matrix.compose(c.position, c.rotation, c.scale); mesh.setMatrixAt(i, c.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }
}

function makeSpeechBubble(text) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 200;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 512, 200);
  ctx.fillStyle = 'rgba(255,249,232,.96)';
  ctx.strokeStyle = '#b8863e'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(10, 10, 492, 150, 26); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(232, 158); ctx.lineTo(256, 190); ctx.lineTo(280, 158); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#553c27'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '600 40px "Ma Shan Zheng","STKaiti","KaiTi","Kaiti SC",serif';
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
  '茶汤一碗，解解乏～', '桂花糕，三文钱一份！', '画舫游湖，半个时辰一趟！', '大雁塔往南走，拐个弯就到！',
  '上元灯会，今夜通宵不闭坊！', '小心马匹，慢些走～',
];

function addNPC(x, z, opt = {}) {
  const { woman = false, monk = false, guard = false, child = false, ry = rr(0, TAU), bubble = null, path = null, speed = rr(0.4, 0.8) } = opt;
  const clear = (px,pz) => canStandAt(px,pz) && !colliders.some(c => px > c.minX - 0.28 && px < c.maxX + 0.28 && pz > c.minZ - 0.28 && pz < c.maxZ + 0.28);
  if (!clear(x,z)) {
    let nearest = null;
    for (let radius=1;radius<=26 && !nearest;radius+=1) for(let i=0;i<24;i++) {
      const px=x+Math.sin(i*TAU/24)*radius,pz=z+Math.cos(i*TAU/24)*radius;
      if(clear(px,pz)) { nearest=[px,pz];break; }
    }
    if (!nearest) return null;
    [x,z]=nearest;
  }
  let safePath = path;
  if (safePath && safePath.some((a,i) => i < safePath.length-1 && (() => {
    const b=safePath[i+1],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.5);
    return Array.from({length:steps+1},(_,j)=>j/steps).some(t=>!clear(lerp(a[0],b[0],t),lerp(a[1],b[1],t)));
  })())) safePath=null;
  const geo = makePersonGeometry({ woman, monk, guard, child, foreign:opt.foreign, moving: !!safePath, robe: opt.robe });
  const mesh = new THREE.Mesh(geo, personMat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.customDepthMaterial = personDepthMat;
  const group = new THREE.Group(); group.add(mesh);
  group.position.set(x, groundHeightAt(x,z), z); group.rotation.y = ry;
  const scale = child ? 0.75 : rr(0.94, 1.05);
  group.scale.setScalar(scale);
  if (bubble) { const sp = makeSpeechBubble(bubble); group.add(sp); group.userData.bubble = sp; }
  scene.add(group);
  const npc = { group, mesh, baseY: 0, phase: rr(0, TAU), path: safePath, pathT: rr(0, 1), speed, dir: 1, bubbleTimer: rr(2, 8), opt };
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
const bargeTimberMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.83});
function makePaintedBarge(curtain = 0xd3a17c) {
  const group = new THREE.Group(), timber = [];
  const part = (geo, color, matrix) => timber.push({ geo, color, matrix });
  const box = (x, y, z, w, h, d, color = 0x925137) =>
    part(new THREE.BoxGeometry(1, 1, 1), color, matrixTRS(x, y, z, w, h, d));
  const positions = [], uv = [], indices = [], rings = 32;
  const section = [[-0.30,-0.22],[-0.48,0.42],[-0.5,0.85],[-0.46,1.02],[0.46,1.02],[0.5,0.85],[0.48,0.42],[0.3,-0.22]];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings, beam = 3.8 * Math.max(0.045, Math.sin(t * Math.PI) ** 0.46), lift = Math.abs(t - 0.5) ** 4 * 6;
    for (let j = 0; j < section.length; j++) {
      const [x,y] = section[j]; positions.push(x * beam, y + lift, (t - 0.5) * 13); uv.push(j / section.length, t * 6);
      if (i < rings) { const a = i * section.length + j, b = i * section.length + (j + 1) % section.length;
        indices.push(a, a + section.length, b, b, a + section.length, b + section.length); }
    }
  }
  const hullGeo = new THREE.BufferGeometry();
  hullGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
  hullGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); hullGeo.setIndex(indices); hullGeo.computeVertexNormals();
  const hull = new THREE.Mesh(hullGeo, new THREE.MeshStandardMaterial({ map:TEX.wood,color:0x875438,roughness:0.82,side:THREE.DoubleSide }));
  hull.name="painted-hull";hull.userData.navigationHull=true;
  hull.castShadow = hull.receiveShadow = true; group.add(hull);
  box(0,1.01,0,3.35,0.17,10.6,0xb68959);
  for(let z=-5;z<=5;z+=0.43) box(0,1.105,z,3.3,0.025,0.025,0x704a35);
  for(const side of [-1,1]) {
    box(side*1.58,1.12,0,0.13,0.17,9.8,0x6b4130);
    for(const z of [-2.85,0,2.85]) {
      part(new THREE.CylinderGeometry(0.09,0.12,2.8,10),0xa64837,matrixTRS(side*1.3,2.48,z));
      box(side*1.3,3.75,z,0.6,0.17,0.55,0xbd9762);
    }
    box(side*1.32,3.82,0,0.23,0.3,6.15,0x9a5038);
    // Low carved side panels and a fine lattice screen leave the cabin visually open.
    for(const z of [-1.45,1.45]) {
      box(side*1.32,1.43,z,0.12,0.6,2.5,0x7b4632);
      for(const y of [1.3,1.67,2.84]) box(side*1.39,y,z,0.06,0.07,2.5,0xb48a52);
      for(let j=-3;j<=3;j++) box(side*1.39,2.3,z+j*0.31,0.055,1.13,0.045,0xc29962);
      box(side*1.39,2.28,z,0.055,0.045,2.5,0xc29962);
    }
    // Fore and aft deck balustrades frame a clear central gangway.
    for(const end of [-1,1]) {
      for(const y of [1.35,1.85]) box(side*1.5,y,end*4.1,0.09,0.09,2.1,0x905638);
      for(const z of [3.1,4.15,5.15]) box(side*1.5,1.52,end*z,0.1,0.94,0.1,0x9b6944);
    }
  }
  for(const z of [-3,3]) box(0,3.8,z,2.9,0.25,0.2,0x9a5038);
  const roof = new THREE.Mesh(ROOF_UNIT, MAT.roof); roof.rotation.y=Math.PI/2;
  roof.position.y=3.95;roof.scale.set(8.25,1.9,4.5);roof.castShadow=true;roof.receiveShadow=true;group.add(roof);
  box(0,5.76,0,0.24,0.24,5.5,0x596e61);
  // Rolled silk curtains and lanterns sit below, rather than inside, the eaves.
  for(const side of [-1,1]) for(const end of [-1,1]) {
    const drape = new THREE.Mesh(SHOP_CLOTH_GEOMETRY,SurfaceLibrary.cloth(curtain));
    drape.position.set(side*1.34,3.45,end*2.8);drape.rotation.y=side*Math.PI/2;drape.scale.set(1.9,0.48,0.6);group.add(drape);
    part(new THREE.SphereGeometry(0.22,10,8),0xedc18a,matrixTRS(side*1.6,3.33,end*3.15,1,1.25,1));
    box(side*1.6,3.65,end*3.15,0.035,0.35,0.035,0x584232);
    box(side*1.6,3.04,end*3.15,0.11,0.06,0.11,0xa8844a);
  }
  // Broad prow and stern seats make the vessel read as a pleasure barge.
  for(const end of [-1,1]) box(0,1.39,end*4.75,2.5,0.16,0.52,0x885134);
  const detail = new THREE.Mesh(mergeColored(timber),bargeTimberMaterial);
  detail.castShadow=detail.receiveShadow=true;group.add(detail);
  return group;
}

let rowboatHullGeometry = null;
function getRowboatHullGeometry() {
  if(rowboatHullGeometry) return rowboatHullGeometry;
  const source=BOAT_HULLS.rowboat;
  const decode=(value,Type)=>new Type(Uint8Array.from(atob(value),c=>c.charCodeAt(0)).buffer);
  const geometry=new THREE.BufferGeometry();
  for(const [name,key] of [['position','positions'],['normal','normals'],['color','colours']])
    geometry.setAttribute(name,new THREE.BufferAttribute(decode(source[key],Float32Array),3));
  geometry.setIndex(new THREE.BufferAttribute(decode(source.indices,Uint16Array),1));
  geometry.computeBoundingBox();geometry.computeBoundingSphere();
  return rowboatHullGeometry=geometry;
}
const rowboatHullMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.88});
const boatPeopleGeometry=new Map();
function boatPerson(woman=false,rowing=false) {
  const key=woman?'passenger':rowing?'rower':'merchant';
  if(!boatPeopleGeometry.has(key)) {
    const geometry=makePersonGeometry({woman,foreign:!woman,robe:woman?0x8f747b:rowing?0x70858b:0xad8060,moving:rowing});
    // Standing scullers move both arms together. Legs and hem stay planted;
    // the same vertex pose is used by the crowd colour and shadow materials.
    if(rowing) {
      const gait=geometry.attributes.citizenGait;
      for(let i=0;i<gait.count;i++) {
        if(Math.abs(gait.getW(i)-1)<.1) gait.setX(i,1);
        else gait.setW(i,0);
      }
    }
    boatPeopleGeometry.set(key,geometry);
  }
  let geometry=boatPeopleGeometry.get(key);
  if(rowing) {
    const shared=geometry;geometry=new THREE.BufferGeometry();
    for(const [name,attribute] of Object.entries(shared.attributes))geometry.setAttribute(name,attribute);
    geometry.setIndex(shared.index);
    const phases=new Float32Array(shared.attributes.position.count).fill(shared.attributes.citizenPhase.getX(0)+boats.length*1.9);
    geometry.setAttribute('citizenPhase',new THREE.BufferAttribute(phases,1));
  }
  const mesh=new THREE.Mesh(geometry,personMat);
  mesh.customDepthMaterial=personDepthMat;mesh.castShadow=mesh.receiveShadow=true;
  mesh.name=key;return mesh;
}

const boatWakeMaterial=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,fog:true,
  uniforms:{...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),time:waterUniforms.time,wakeColor:waterUniforms.shallow},
  vertexShader:`#include <fog_pars_vertex>
    varying vec2 vWakeUV;
    void main(){vWakeUV=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader:`#include <fog_pars_fragment>
    uniform float time;uniform vec3 wakeColor;varying vec2 vWakeUV;
    void main(){
      float edge=sin(vWakeUV.x*3.14159265),tail=pow(1.-vWakeUV.y,1.4);
      float pulse=.6+.4*sin(vWakeUV.y*48.-time*4.);
      gl_FragColor=vec4(clamp(wakeColor*1.2+vec3(.02),0.,1.),edge*tail*(.12+.1*pulse));
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`,
});
const boatWakeGeometries={};
function makeBoatWake(painted) {
  const key=painted?'barge':'rowboat';
  if(!boatWakeGeometries[key]) {
    const positions=[],uv=[],indices=[],length=painted?6:2.6,stern=painted?5.8:1.9,beam=painted?1.05:.6;
    for(const side of [-1,1]) {
      const base=positions.length/3;
      for(let i=0;i<=16;i++)for(const edge of [-1,1]) {
        const t=i/16,width=.045+t*.16;
        positions.push(side*(beam+t*length*.24)+edge*width,0,-stern-t*length);uv.push((edge+1)/2,t);
      }
      for(let i=0;i<16;i++){const a=base+i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
    boatWakeGeometries[key]=geometry;
  }
  const wake=new THREE.Mesh(boatWakeGeometries[key],boatWakeMaterial);wake.name='boat-surface-wake';scene.add(wake);return wake;
}

function makeBoat(spec) {
  const g = new THREE.Group(), scale=spec.scale||1;
  g.name=spec.name;g.userData.people=[];g.userData.oars=[];
  if(spec.type==='painted') {
    g.add(makePaintedBarge(spec.curtain));
    if(!spec.moored) for(const side of [-1,1]) {
      const passenger=boatPerson(side>0);passenger.position.set(side*.6,1.1,side*.85);passenger.rotation.y=side*.8;
      passenger.scale.setScalar(.95);g.add(passenger);g.userData.people.push(passenger);
    }
  } else {
    // An authored, genuinely hollow shell replaces the old solid extrusion.
    // Its -0.20m keel is below the water while the 0.63m gunwale stays clear.
    const hull=new THREE.Mesh(getRowboatHullGeometry(),rowboatHullMaterial);
    hull.name='authored-hollow-hull';hull.userData.navigationHull=true;
    hull.userData.source='Quaternius / Ships Pack / Boat / CC0';
    hull.castShadow=hull.receiveShadow=true;g.add(hull);
    const parts=[];
    const timber=(x,y,z,w,h,d,color)=>parts.push({geo:UNIT_BOX,color,matrix:matrixTRS(x,y,z,w,h,d)});
    for(let x=-.46;x<=.47;x+=.155)timber(x,.17,0,.145,.055,2.45,0xa57c51);
    for(const z of [-.94,.94]) {
      timber(0,.52,z,1.45,.09,.32,0x9e6945);
      for(const side of [-1,1])timber(side*.55,.34,z,.085,.33,.21,0x704c36);
    }
    for(const side of [-1,1]) {
      // Timber thole pins and paired oars pivot in the actual gunwale.
      timber(side*.88,.67,-.32,.08,.15,.08,0x704936);
      const pivot=new THREE.Group();pivot.position.set(side*.88,.64,-.32);
      const oarWood=new THREE.MeshStandardMaterial({color:0xa87c4f,roughness:.84,map:TEX.wood});
      pivot.add(tubeBetween(new THREE.Vector3(-side*.54,.11,0),new THREE.Vector3(side*1.32,-.66,0),.028,oarWood,8));
      const blade=new THREE.Mesh(UNIT_SPHERE,oarWood);
      blade.position.set(side*1.3,-.66,0);blade.scale.set(.12,.023,.38);pivot.add(blade);
      pivot.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});
      g.add(pivot);g.userData.oars.push({pivot,side});
    }
    const interior=new THREE.Mesh(mergeColored(parts),bargeTimberMaterial);interior.castShadow=interior.receiveShadow=true;g.add(interior);
    const rower=boatPerson(false,true);rower.position.set(0,.19,-.3);rower.rotation.y=Math.PI;rower.scale.setScalar(.9);
    g.add(rower);g.userData.people.push(rower);
    g.userData.rowPhase=rower.geometry.attributes.citizenPhase.getX(0);
  }
  g.scale.setScalar(scale);scene.add(g);
  const curve=new THREE.CatmullRomCurve3(spec.path.map(([x,z])=>new THREE.Vector3(x,0,z)),true,'catmullrom',.3);
  const speed=spec.moored?0:spec.cruiseSpeed?spec.cruiseSpeed/curve.getLength():spec.speed;
  const wake=spec.moored?null:makeBoatWake(spec.type==='painted');
  boats.push({group:g,wake,curve,t:spec.type==='painted'?.72:rr(0,1),speed,phase:rr(0,TAU),spec});
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
  { x: 15.3, z: 350, line: '百千家似围棋局，十二街如种菜畦。', place: '明德门' },
  { x: -216, z: 322, line: '雁塔晨钟，声闻十里。', place: '小雁塔' },
  { x: 424, z: 360, line: '曲江流饮，杏园探花。', place: '芙蓉园' },
  { x: -90, z: 85, line: '春风得意马蹄疾，一日看尽长安花。', place: '平康坊' },
];

function makePoemScroll(x, z, line, place) {
  const g = new THREE.Group(); g.position.set(x, 1.2, z);g.scale.setScalar(.68);
  const paper = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.1, 10), new THREE.MeshStandardMaterial({ color: 0xf4e4bf, roughness: 0.8, emissive: 0x7a5a20, emissiveIntensity: 0.15 }));
  paper.rotation.z = Math.PI / 2; g.add(paper);
  for (const s of [-1, 1]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.12, 10), new THREE.MeshStandardMaterial({ color: 0xd7aa50, roughness: 0.35, metalness: 0.5 }));
    cap.rotation.z = Math.PI / 2; cap.position.x = s * 0.58; g.add(cap);
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture(), color: 0xffd889, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }));
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
      p[i * 3] += (Math.sin(t * 0.6 + i) * 0.72 + 0.08) * dt;
      p[i * 3 + 1] -= 0.18 * dt;
      p[i * 3 + 2] += Math.cos(t * 0.4 + i) * 0.44 * dt;
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
  citizenClock.value = t;
  updateCityCrowd(dt, t);
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
    n.group.position.y = groundHeightAt(n.group.position.x,n.group.position.z) + Math.abs(Math.sin(t * 4.2 + n.phase)) * 0.035;
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
    if (b.spec.moored) { b.group.position.set(b.spec.path[0][0],0.1+Math.sin(t*0.7)*0.012,b.spec.path[0][1]); b.group.rotation.y=0; continue; }
    b.t = (b.t + b.speed * dt) % 1;
    const p = b.curve.getPointAt(b.t);
    const tan = b.curve.getTangentAt(b.t);
    b.group.position.set(p.x, 0.1 + Math.sin(t * 1.4 + b.phase) * 0.035, p.z);
    b.group.rotation.y = Math.atan2(tan.x, tan.z);
    b.group.rotation.z = Math.sin(t * 1.1 + b.phase) * 0.01;
    if(b.wake) {
      b.wake.position.set(p.x,.049,p.z);b.wake.rotation.y=b.group.rotation.y;b.wake.scale.copy(b.group.scale);
      b.wake.visible=camera.position.distanceToSquared(b.group.position)<32400;
    }
    const stroke=Math.sin(t*4.2+(b.group.userData.rowPhase||0));
    for(const {pivot,side} of b.group.userData.oars) {
      pivot.rotation.y=side*.28*stroke;
      pivot.rotation.z=side*.06*Math.cos(t*4.2+b.group.userData.rowPhase);
    }
    const peopleVisible=camera.position.distanceToSquared(b.group.position)<10000;
    for(const person of b.group.userData.people)person.visible=peopleVisible;
  }
}

// ---------------------------------------------------------------- 场景人物布置
function spawnWorldLife() {
  // 西市
  addNPC(-292, -60, { foreign:true, bubble: '胡饼——刚出炉的胡饼！', ry: 0 });
  addNPC(-276, -36, { foreign:true, bubble: '西域葡萄，甜得很！', ry: 1.2 });
  addNPC(-314, -12, { woman: true, bubble: '客官，看看这匹蜀锦？', ry: -0.8 });
  addNPC(-244, -48, { foreign:true, bubble: '新到的香料，波斯来的！', ry: 2.4 });
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
  addNPC(347,260,{woman:true,path:[[337,260],[379,260]],speed:0.3});
  addNPC(389,259,{bubble:'临水茶汤，且坐看云。',ry:Math.PI});
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

  // Small conversational groups inhabit the opening street without blocking it.
  for (const [x,z,kind] of [[-5.5,337,0],[5.2,348,1],[-7,355,1],[6.8,321,0],[-6,296,0],[5.6,308,1]]) {
    addNPC(x,z,{woman:!!kind,path:[[x,z-7],[x+0.9,z+8]],speed:0.28});
  }
  addNPC(-18,354,{woman:true,bubble:'新蒸胡饼，趁热尝一尝！',ry:Math.PI/2});
  addNPC(18,341,{bubble:'茶汤初沸，歇脚看长安。',ry:-Math.PI/2});

  // 诗笺
  POEM_SPOTS.forEach(p => makePoemScroll(p.x, p.z, p.line, p.place));

  // 船只
  boatSpecs.forEach(makeBoat);

  addButterflies();
  addPetals();
  addFireflies();
  buildCityCrowd();
}
