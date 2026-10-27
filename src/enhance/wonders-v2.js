/* ============================================================
   仙侠奇观建筑系统 — 超现实主义盛唐气象
   v2: 更多奇观、更精致、更仙侠
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log('[Wonders v2] 开始构建仙侠奇观...');
    
    buildLingxiaoPalace();    // 凌霄宝殿 — 天宫
    buildPenglaiMountain();    // 蓬莱仙山 — 悬浮仙岛
    buildGoldenDragon();       // 金龙盘旋 — 东方巨龙
    buildPhoenix();            // 凤凰展翅 — 百鸟之王
    buildHuayanPagoda();       // 华严宝塔 — 百丈浮屠
    buildRainbowBridge();      // 彩虹天桥 — 虹桥跨空
    buildFourGuardians();      // 四方守护神 — 四大天王
    buildMoonPalace();         // 广寒宫 — 月宫仙境
    
    console.log('[Wonders v2] ✓ 仙侠奇观构建完成');
  }
  
  // 凌霄宝殿 — 天宫般的宏伟宫殿
  function buildLingxiaoPalace() {
    const gx = 0, gz = -600; // 城市正北上空
    
    // 悬浮平台
    const platformGeo = new THREE.CylinderGeometry(80, 100, 10, 8);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0xd4c4a0,
      roughness: 0.7,
      metalness: 0.1
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(gx, 80, gz);
    platform.castShadow = true;
    platform.receiveShadow = true;
    scene.add(platform);
    
    // 主殿
    const hallGeo = new THREE.BoxGeometry(60, 25, 40);
    const hallMat = new THREE.MeshStandardMaterial({
      color: 0xc0392b,
      roughness: 0.6,
      metalness: 0.2,
      emissive: 0x8b2500,
      emissiveIntensity: 0.2
    });
    const hall = new THREE.Mesh(hallGeo, hallMat);
    hall.position.set(gx, 105, gz);
    hall.castShadow = true;
    scene.add(hall);
    
    // 金色屋顶
    const roofGeo = new THREE.ConeGeometry(45, 20, 4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0xffaa00,
      emissiveIntensity: 0.3
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(gx, 147, gz);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
    
    // 殿宇群 — 左右配殿
    for (const side of [-1, 1]) {
      const subHallGeo = new THREE.BoxGeometry(25, 15, 20);
      const subHallMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 });
      const subHall = new THREE.Mesh(subHallGeo, subHallMat);
      subHall.position.set(gx + side * 50, 95, gz + side * 10);
      subHall.castShadow = true;
      scene.add(subHall);
      
      const subRoofGeo = new THREE.ConeGeometry(20, 12, 4);
      const subRoofMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7, roughness: 0.4 });
      const subRoof = new THREE.Mesh(subRoofGeo, subRoofMat);
      subRoof.position.set(gx + side * 50, 118, gz + side * 10);
      subRoof.rotation.y = Math.PI / 4;
      subRoof.castShadow = true;
      scene.add(subRoof);
    }
    
    // 光柱 — 从地面直通天宫
    const beamGeo = new THREE.CylinderGeometry(3, 5, 80, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.3
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(gx, 40, gz);
    scene.add(beam);
    
    // 天宫灯光
    const light = new THREE.PointLight(0xffd700, 2, 200);
    light.position.set(gx, 120, gz);
    scene.add(light);
  }
  
  // 蓬莱仙山 — 悬浮仙岛
  function buildPenglaiMountain() {
    const px = -400, pz = -200;
    
    // 悬浮山体
    const mountainGeo = new THREE.ConeGeometry(60, 80, 8);
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x5a8a5a,
      roughness: 0.9
    });
    const mountain = new THREE.Mesh(mountainGeo, mountainMat);
    mountain.position.set(px, 60, pz);
    mountain.scale.set(1.5, 1, 1.2);
    mountain.castShadow = true;
    scene.add(mountain);
    
    // 山顶凉亭
    const pavilionGeo = new THREE.BoxGeometry(10, 8, 10);
    const pavilionMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 });
    const pavilion = new THREE.Mesh(pavilionGeo, pavilionMat);
    pavilion.position.set(px, 105, pz);
    pavilion.castShadow = true;
    scene.add(pavilion);
    
    const pavilionRoofGeo = new THREE.ConeGeometry(8, 6, 4);
    const pavilionRoofMat = new THREE.MeshStandardMaterial({ color: 0x5a6a6a, roughness: 0.6 });
    const pavilionRoof = new THREE.Mesh(pavilionRoofGeo, pavilionRoofMat);
    pavilionRoof.position.set(px, 112, pz);
    pavilionRoof.rotation.y = Math.PI / 4;
    scene.add(pavilionRoof);
    
    // 瀑布 — 从仙山流下
    const waterfallGeo = new THREE.PlaneGeometry(8, 60);
    const waterfallMat = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const waterfall = new THREE.Mesh(waterfallGeo, waterfallMat);
    waterfall.position.set(px + 30, 50, pz);
    scene.add(waterfall);
    
    // 仙鹤 — 围绕仙山飞翔
    for (let i = 0; i < 5; i++) {
      const craneGeo = new THREE.ConeGeometry(1, 3, 4);
      const craneMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
      const crane = new THREE.Mesh(craneGeo, craneMat);
      crane.position.set(px + Math.random() * 40 - 20, 70 + Math.random() * 30, pz + Math.random() * 40 - 20);
      crane.userData.isCrane = true;
      crane.userData.centerX = px;
      crane.userData.centerZ = pz;
      crane.userData.angle = Math.random() * Math.PI * 2;
      crane.userData.radius = 30 + Math.random() * 20;
      crane.userData.speed = 0.5 + Math.random() * 0.5;
      scene.add(crane);
    }
  }
  
  // 金龙盘旋 — 东方巨龙
  function buildGoldenDragon() {
    const dx = 500, dz = -300;
    
    // 龙身 — 用多个球体串联
    const dragonSegments = 12;
    const dragonGroup = new THREE.Group();
    
    for (let i = 0; i < dragonSegments; i++) {
      const t = i / dragonSegments;
      const angle = t * Math.PI * 4;
      const radius = 50 - t * 20;
      
      const segmentGeo = new THREE.SphereGeometry(8 - t * 4, 8, 6);
      const segmentMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.3,
        emissive: 0xffaa00,
        emissiveIntensity: 0.2
      });
      const segment = new THREE.Mesh(segmentGeo, segmentMat);
      segment.position.set(
        dx + Math.cos(angle) * radius,
        50 + t * 80,
        dz + Math.sin(angle) * radius
      );
      segment.castShadow = true;
      dragonGroup.add(segment);
    }
    
    // 龙头
    const headGeo = new THREE.SphereGeometry(12, 8, 6);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xffcc00,
      emissiveIntensity: 0.4
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(dx, 140, dz);
    head.castShadow = true;
    dragonGroup.add(head);
    
    // 龙角
    for (const side of [-1, 1]) {
      const hornGeo = new THREE.ConeGeometry(2, 10, 4);
      const hornMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const horn = new THREE.Mesh(hornGeo, hornMat);
      horn.position.set(dx + side * 6, 148, dz);
      dragonGroup.add(horn);
    }
    
    dragonGroup.userData.isDragon = true;
    dragonGroup.userData.centerX = dx;
    dragonGroup.userData.centerZ = dz;
    scene.add(dragonGroup);
    
    // 龙珠
    const pearlGeo = new THREE.SphereGeometry(5, 8, 6);
    const pearlMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.8
    });
    const pearl = new THREE.Mesh(pearlGeo, pearlMat);
    pearl.position.set(dx, 120, dz + 30);
    scene.add(pearl);
    
    const pearlLight = new THREE.PointLight(0xff6600, 3, 50);
    pearlLight.position.copy(pearl.position);
    scene.add(pearlLight);
  }
  
  // 凤凰展翅 — 百鸟之王
  function buildPhoenix() {
    const fx = -300, fz = 300;
    
    // 凤凰身体
    const bodyGeo = new THREE.SphereGeometry(8, 8, 6);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      metalness: 0.6,
      roughness: 0.4,
      emissive: 0xff4400,
      emissiveIntensity: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(fx, 100, fz);
    body.castShadow = true;
    scene.add(body);
    
    // 翅膀
    for (const side of [-1, 1]) {
      const wingGeo = new THREE.PlaneGeometry(30, 15);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0xff8800,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        emissive: 0xff6600,
        emissiveIntensity: 0.2
      });
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.set(fx + side * 18, 100, fz);
      wing.rotation.z = side * 0.3;
      wing.castShadow = true;
      scene.add(wing);
    }
    
    // 尾羽
    for (let i = 0; i < 5; i++) {
      const tailGeo = new THREE.ConeGeometry(2, 20, 4);
      const tailMat = new THREE.MeshStandardMaterial({
        color: 0xff4400,
        emissive: 0xff2200,
        emissiveIntensity: 0.3
      });
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.set(fx, 95, fz + 15 + i * 3);
      tail.rotation.x = Math.PI / 2;
      scene.add(tail);
    }
  }
  
  // 华严宝塔 — 百丈浮屠
  function buildHuayanPagoda() {
    const hx = 0, hz = 0; // 城市中心
    
    // 宝塔基座
    const baseGeo = new THREE.CylinderGeometry(30, 35, 5, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xc8b896, roughness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(hx, 2.5, hz);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    
    // 宝塔层 — 13层
    for (let i = 0; i < 13; i++) {
      const t = i / 12;
      const layerH = 8 - t * 2;
      const layerW = 25 - t * 15;
      
      const layerGeo = new THREE.BoxGeometry(layerW, layerH, layerW);
      const layerMat = new THREE.MeshStandardMaterial({
        color: 0xd4a574,
        roughness: 0.7
      });
      const layer = new THREE.Mesh(layerGeo, layerMat);
      layer.position.set(hx, 5 + i * 8 + layerH / 2, hz);
      layer.castShadow = true;
      layer.receiveShadow = true;
      scene.add(layer);
      
      // 每层屋檐
      const eaveGeo = new THREE.BoxGeometry(layerW + 4, 1, layerW + 4);
      const eaveMat = new THREE.MeshStandardMaterial({ color: 0x5a6a6a, roughness: 0.6 });
      const eave = new THREE.Mesh(eaveGeo, eaveMat);
      eave.position.set(hx, 5 + i * 8 + layerH, hz);
      eave.castShadow = true;
      scene.add(eave);
      
      // 每层灯笼
      for (const side of [-1, 1]) {
        const lanternGeo = new THREE.SphereGeometry(0.8, 6, 4);
        const lanternMat = new THREE.MeshStandardMaterial({
          color: 0xff6644,
          emissive: 0xff4422,
          emissiveIntensity: 0.6
        });
        const lantern = new THREE.Mesh(lanternGeo, lanternMat);
        lantern.position.set(hx + side * layerW / 2, 5 + i * 8 + layerH / 2, hz);
        scene.add(lantern);
      }
    }
    
    // 塔刹
    const spireGeo = new THREE.ConeGeometry(5, 20, 8);
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xffaa00,
      emissiveIntensity: 0.3
    });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.set(hx, 5 + 13 * 8 + 10, hz);
    spire.castShadow = true;
    scene.add(spire);
    
    // 塔灯光
    const light = new THREE.PointLight(0xffd700, 1, 100);
    light.position.set(hx, 100, hz);
    scene.add(light);
  }
  
  // 彩虹天桥 — 虹桥跨空
  function buildRainbowBridge() {
    const bx = 0, bz = -200;
    
    // 彩虹桥 — 拱形
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-100, 10, bz),
      new THREE.Vector3(-50, 30, bz),
      new THREE.Vector3(0, 40, bz),
      new THREE.Vector3(50, 30, bz),
      new THREE.Vector3(100, 10, bz)
    ]);
    
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 3, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0xff66cc,
      transparent: true,
      opacity: 0.5
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tube);
    
    // 七彩光带
    const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
    colors.forEach((color, i) => {
      const offset = (i - 3) * 0.8;
      const offsetCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-100, 10 + offset, bz + offset),
        new THREE.Vector3(-50, 30 + offset, bz + offset),
        new THREE.Vector3(0, 40 + offset, bz + offset),
        new THREE.Vector3(50, 30 + offset, bz + offset),
        new THREE.Vector3(100, 10 + offset, bz + offset)
      ]);
      
      const offsetTubeGeo = new THREE.TubeGeometry(offsetCurve, 32, 0.5, 8, false);
      const offsetTubeMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6
      });
      const offsetTube = new THREE.Mesh(offsetTubeGeo, offsetTubeMat);
      scene.add(offsetTube);
    });
  }
  
  // 四方守护神 — 四大天王
  function buildFourGuardians() {
    const positions = [
      { x: -300, z: -300, color: 0x4488ff, name: '东方持国天王' },
      { x: 300, z: -300, color: 0x44ff88, name: '南方增长天王' },
      { x: -300, z: 300, color: 0xff8844, name: '西方广目天王' },
      { x: 300, z: 300, color: 0xff4488, name: '北方多闻天王' }
    ];
    
    positions.forEach(pos => {
      // 基座
      const baseGeo = new THREE.BoxGeometry(20, 5, 20);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xc8b896, roughness: 0.8 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.set(pos.x, 2.5, pos.z);
      base.castShadow = true;
      base.receiveShadow = true;
      scene.add(base);
      
      // 天王雕像
      const statueGeo = new THREE.CapsuleGeometry(4, 10, 8, 8);
      const statueMat = new THREE.MeshStandardMaterial({
        color: pos.color,
        roughness: 0.6,
        metalness: 0.3,
        emissive: pos.color,
        emissiveIntensity: 0.1
      });
      const statue = new THREE.Mesh(statueGeo, statueMat);
      statue.position.set(pos.x, 12, pos.z);
      statue.castShadow = true;
      scene.add(statue);
      
      // 光环
      const haloGeo = new THREE.TorusGeometry(8, 0.5, 8, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: pos.color,
        transparent: true,
        opacity: 0.5
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(pos.x, 18, pos.z);
      scene.add(halo);
    });
  }
  
  // 广寒宫 — 月宫仙境
  function buildMoonPalace() {
    const mx = 0, mz = -700;
    
    // 月亮
    const moonGeo = new THREE.SphereGeometry(50, 16, 12);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xffffcc,
      transparent: true,
      opacity: 0.9
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(mx, 200, mz);
    scene.add(moon);
    
    // 广寒宫 — 月亮上的宫殿
    const palaceGeo = new THREE.BoxGeometry(20, 15, 15);
    const palaceMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4e8,
      roughness: 0.5,
      metalness: 0.3,
      transparent: true,
      opacity: 0.8
    });
    const palace = new THREE.Mesh(palaceGeo, palaceMat);
    palace.position.set(mx, 200, mz);
    palace.castShadow = true;
    scene.add(palace);
    
    // 桂花树
    const treeGeo = new THREE.CylinderGeometry(2, 3, 10, 8);
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.8 });
    const tree = new THREE.Mesh(treeGeo, treeMat);
    tree.position.set(mx - 20, 205, mz);
    scene.add(tree);
    
    // 桂花树冠
    const crownGeo = new THREE.SphereGeometry(8, 8, 6);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.3
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.set(mx - 20, 215, mz);
    scene.add(crown);
  }
  
  init();
})();
