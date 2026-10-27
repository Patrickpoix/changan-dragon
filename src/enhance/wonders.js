/* ============================================================
   奇观建筑 · 仙侠魔幻盛唐气象
   悬浮宫殿 / 云中飞阁 / 仙侠高塔 / 彩虹天桥
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildWonderLandmarks();
  }

  function buildFairyPagoda(x, z, baseY = 0, scale = 1) {
    B.stone.add(x, 2 * scale, z, 24 * scale, 4 * scale, 24 * scale, 0, 0xe8dcc0);
    B.stone.add(x, 4.5 * scale, z, 20 * scale, 1 * scale, 20 * scale, 0, 0xd8ccb0);
    let y = 5 * scale;
    for (let i = 0; i < 7; i++) {
      const w = (16 - i * 1.8) * scale;
      const h = (5.5 - i * 0.3) * scale;
      B.plaster.add(x, y + h / 2, z, w, h, w, 0, 0xf0e0c0);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        B.columns.add(x + sx * w * 0.42, y + h / 2, z + sz * w * 0.42, 0.5 * scale, h, 0.5 * scale, 0, 0xc04030);
      }
      B.roofGold.add(x, y + h, z, w + 4 * scale, 2.5 * scale, w + 4 * scale, 0, 0xd4a840);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        B.gold.add(x + sx * (w + 2 * scale) * 0.5, y + h + 2 * scale, z + sz * (w + 2 * scale) * 0.5, 0.3 * scale, 0.5 * scale, 0.3 * scale, 0, 0xf0c050);
      }
      y += h + 2.5 * scale;
    }
    B.gold.add(x, y + 3 * scale, z, 1 * scale, 6 * scale, 1 * scale, 0, 0xf8d060);
    B.gold.add(x, y + 6.5 * scale, z, 2.5 * scale, 0.8 * scale, 2.5 * scale, 0, 0xf0c050);
    addCollider(x - 12 * scale, x + 12 * scale, z - 12 * scale, z + 12 * scale, 'fairy-pagoda');
    flightObstacles.push({ x0: x - 12 * scale, x1: x + 12 * scale, z0: z - 12 * scale, z1: z + 12 * scale, top: y + 10 * scale });
    landmarks.push({ id: 'fairy-pagoda-' + x + '-' + z, name: '华严宝塔', x: x, z: z, radius: 40 * scale, poem: '塔势如涌出，孤高耸天宫', desc: '七宝庄严的仙塔，高耸入云，檐角金铃随风作响。' });
  }

  function buildSkyPalace(x, z, height = 80) {
    B.roofGold.add(x, height + 6, z, 80, 12, 50, 0, 0xd4a840);
    B.plaster.add(x, height, z, 60, 10, 36, 0, 0xf8e8c8);
    B.red.add(x, height + 2, z - 19, 60, 6, 1, 0, 0xc04030);
    B.red.add(x, height + 2, z + 19, 60, 6, 1, 0, 0xc04030);
    for (let i = -4; i <= 4; i++) {
      B.columns.add(x + i * 6, height + 5, z - 20, 0.6, 10, 0.6, 0, 0xd04838);
      B.columns.add(x + i * 6, height + 5, z + 20, 0.6, 10, 0.6, 0, 0xd04838);
    }
    for (const sx of [-1, 1]) {
      B.roofGold.add(x + sx * 45, height + 4, z, 30, 8, 24, 0, 0xc89838);
      B.plaster.add(x + sx * 45, height - 1, z, 24, 8, 18, 0, 0xf0dcb8);
    }
    for (let i = 0; i < 20; i++) {
      const stepY = height - i * 3.5;
      const stepZ = z + 30 + i * 2;
      B.stone.add(x, stepY, stepZ, 12, 0.5, 2, 0, 0xe0d4b8);
    }
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const cx = x + Math.cos(angle) * 35;
      const cz = z + Math.sin(angle) * 25;
      const cy = height - 5 + Math.sin(angle * 2) * 5;
      const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false });
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(8 + Math.random() * 4, 8, 6), cloudMat);
      cloud.position.set(cx, cy, cz);
      scene.add(cloud);
    }
    landmarks.push({ id: 'sky-palace', name: '凌霄宝殿', x: x, z: z, radius: 100, poem: '天上宫阙，今夕是何年', desc: '悬浮于云端的天宫，金瓦朱墙，云雾缭绕，宛若仙境。' });
  }

  function buildRainbowBridge(x1, z1, x2, z2, height = 40) {
    const dx = x2 - x1, dz = z2 - z1;
    const ang = Math.atan2(dx, dz);
    const bridgeMat = new THREE.MeshBasicMaterial({ color: 0xff6080, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const bridgeGeo = new THREE.PlaneGeometry(6, Math.hypot(dx, dz));
    bridgeGeo.rotateX(-Math.PI / 2);
    bridgeGeo.rotateY(ang);
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set((x1 + x2) / 2, height, (z1 + z2) / 2);
    scene.add(bridge);
    for (const side of [-1, 1]) {
      const nx = Math.cos(ang), nz = -Math.sin(ang);
      B.gold.add((x1 + x2) / 2 + nx * side * 3, height + 1, (z1 + z2) / 2 + nz * side * 3, 0.3, 1.5, Math.hypot(dx, dz), ang, 0xf0c050);
    }
    bridgeZones.push({ points: [[x1, z1], [x2, z2]], halfWidth: 3, y: height, squareEnds: true });
  }

  function buildGuardianStatue(x, z, rotation = 0) {
    B.stone.add(x, 4, z, 30, 8, 30, 0, 0xd8ccb0);
    B.stone.add(x, 9, z, 24, 2, 24, 0, 0xe8dcc0);
    B.stone.add(x, 16, z, 8, 14, 12, rotation, 0xc8b898);
    B.stone.add(x, 25, z - 8, 6, 6, 8, rotation, 0xd8c8a8);
    B.gold.add(x - 2, 30, z - 8, 0.5, 4, 0.5, rotation, 0xf0c050);
    B.gold.add(x + 2, 30, z - 8, 0.5, 4, 0.5, rotation, 0xf0c050);
    addCollider(x - 15, x + 15, z - 15, z + 15, 'guardian');
    flightObstacles.push({ x0: x - 15, x1: x + 15, z0: z - 15, z1: z + 15, top: 32 });
    landmarks.push({ id: 'guardian-' + x + '-' + z, name: '青龙守护神', x: x, z: z, radius: 60, poem: '龙盘虎踞，镇守长安', desc: '巨型石质神兽雕像，守护着长安城的四方平安。' });
  }

  function buildFloatingMountain(x, z, height = 60) {
    const mountainMat = new THREE.MeshStandardMaterial({ color: 0x8a9a8a, roughness: 0.9, metalness: 0.1 });
    const mountainGeo = new THREE.ConeGeometry(25, 40, 8);
    const mountain = new THREE.Mesh(mountainGeo, mountainMat);
    mountain.position.set(x, height, z);
    mountain.castShadow = true;
    scene.add(mountain);
    B.roof.add(x, height + 22, z, 10, 4, 10, 0, 0x506060);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const tx = x + Math.cos(angle) * 15;
      const tz = z + Math.sin(angle) * 15;
      const ty = height + 5 + Math.random() * 5;
      B.leaf.add(tx, ty, tz, 3, 4, 3, angle, 0x5a8a4a);
      B.trunk.add(tx, ty - 3, tz, 0.3, 2, 0.3, angle, 0x6a4a3a);
    }
    const waterfallMat = new THREE.MeshBasicMaterial({ color: 0x80c0e0, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const waterfallGeo = new THREE.PlaneGeometry(4, 30);
    const waterfall = new THREE.Mesh(waterfallGeo, waterfallMat);
    waterfall.position.set(x, height - 15, z + 24);
    scene.add(waterfall);
    landmarks.push({ id: 'floating-mountain-' + x + '-' + z, name: '蓬莱仙山', x: x, z: z, radius: 50, poem: '忽闻海上有仙山，在水一方', desc: '悬浮于云端的仙山，山顶有亭，瀑布飞流直下。' });
  }

  function buildWonderLandmarks() {
    console.log('[Wonders] 开始构建仙侠奇观建筑...');
    buildFairyPagoda(280, 280, 0, 1.2);
    buildSkyPalace(0, -320, 80);
    buildRainbowBridge(280, 280, -280, 280, 45);
    buildFairyPagoda(-280, 280, 0, 1.2);
    buildGuardianStatue(-480, 0, 0);
    buildGuardianStatue(480, 0, Math.PI);
    buildGuardianStatue(0, -480, Math.PI / 2);
    buildGuardianStatue(0, 480, -Math.PI / 2);
    buildFloatingMountain(350, 350, 70);
    buildFloatingMountain(-350, 350, 65);
    console.log('[Wonders] 仙侠奇观建筑构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
