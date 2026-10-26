/* ============================================================
   Landmarks - 地标精修Owner（增强版）
   注意：原系统已有完整地标建筑（太极宫/大明宫/兴庆宫/大雁塔/曲江池等）
   本模块仅做补充性精修：台阶+广场+角楼+牌坊+石碑，不重复创建建筑
   全部使用共享几何体UNIT_BOX/ROOF_UNIT和共享材质MAT
   权威坐标：CITY = { x0: -450, x1: 450, z0: -380, z1: 380 }
   ============================================================ */

(function() {
  'use strict';

  // 权威地标坐标（与原系统12-landmarks.js一致）
  const LANDMARKS = {
    daming:   { name: '大明宫',   x: 150, z: -432, gateX: 150, gateZ: -380 },
    taiji:    { name: '太极宫',   x: 0,   z: -334 },
    xingqing: { name: '兴庆宫',   x: 342, z: -152, longchiX: 342, longchiZ: -152 },
    qujiang:  { name: '曲江池',   x: 354, z: 318 },
    dayanta:  { name: '大雁塔',   x: 216, z: 283 },
    xiaoyanta:{ name: '小雁塔',   x: -216, z: 349 },
    mingde:   { name: '明德门',   x: 0,   z: 380 },
    east:     { name: '东市',     x: 174, z: -14 },
    west:     { name: '西市',     x: -258, z: -14 },
    qinglong: { name: '青龙寺',   x: 300, z: 100 },
    ximing:   { name: '西明寺',   x: -300, z: 150 },
  };

  // 城墙四角角楼坐标（与CITY边界一致：x=±450, z=±380）
  const WALL_CORNERS = [
    { x: -450, z: -380 }, { x: 450, z: -380 },
    { x: -450, z: 380 },  { x: 450, z: 380 },
  ];

  let initialized = false;

  function addSteps(x, z, width, depth, height, layers) {
    if (typeof MAT === 'undefined') return;
    const layers_count = layers || 4;
    for (let i = 0; i < layers_count; i++) {
      const step = new THREE.Mesh(UNIT_BOX, MAT.stone);
      step.position.set(x, height * (i + 0.5), z + depth / (layers_count * 2) + i * depth / layers_count);
      step.scale.set(width - i * 2, height, depth / layers_count);
      step.receiveShadow = true;
      step.castShadow = true;
      scene.add(step);
    }
  }

  function addSquare(x, z, size) {
    if (typeof MAT === 'undefined') return;
    const square = new THREE.Mesh(UNIT_BOX, MAT.stone);
    square.position.set(x, 0.05, z);
    square.scale.set(size, 0.1, size);
    square.receiveShadow = true;
    scene.add(square);
  }

  function addCornerTower(x, z) {
    if (typeof MAT === 'undefined') return;
    const base = new THREE.Mesh(UNIT_BOX, MAT.stone);
    base.position.set(x, 3, z);
    base.scale.set(12, 6, 12);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    const mid = new THREE.Mesh(UNIT_BOX, MAT.plaster || MAT.wood);
    mid.position.set(x, 6.5, z);
    mid.scale.set(9, 1, 9);
    mid.castShadow = true;
    scene.add(mid);
    const roof = new THREE.Mesh(ROOF_UNIT, MAT.roof || MAT.roofGlazed);
    roof.position.set(x, 8, z);
    roof.scale.set(16, 4, 16);
    roof.castShadow = true;
    scene.add(roof);
  }

  function addPaifang(x, z, name) {
    if (typeof MAT === 'undefined') return;
    // 牌坊柱子
    for (let i = -1; i <= 1; i += 2) {
      const pillar = new THREE.Mesh(UNIT_CYL, MAT.stone);
      pillar.position.set(x + i * 5, 3.5, z);
      pillar.scale.set(0.5, 7, 0.5);
      pillar.castShadow = true;
      scene.add(pillar);
    }
    // 牌坊横梁
    const beam = new THREE.Mesh(UNIT_BOX, MAT.wood);
    beam.position.set(x, 6, z);
    beam.scale.set(12, 0.6, 0.6);
    beam.castShadow = true;
    scene.add(beam);
    // 牌坊匾额
    const plaque = new THREE.Mesh(UNIT_BOX, MAT.red || MAT.wood);
    plaque.position.set(x, 6.8, z);
    plaque.scale.set(4, 1, 0.3);
    plaque.castShadow = true;
    scene.add(plaque);
    // 牌坊屋顶
    const roof = new THREE.Mesh(ROOF_SMALL, MAT.roof);
    roof.position.set(x, 8, z);
    roof.scale.set(14, 1.5, 2.5);
    roof.castShadow = true;
    scene.add(roof);
  }

  function addWallCrenellations(x, z, length, orientation) {
    if (typeof MAT === 'undefined') return;
    const count = Math.floor(length / 5);
    for (let i = 0; i < count; i++) {
      const crenel = new THREE.Mesh(UNIT_BOX, MAT.stone);
      if (orientation === 'horizontal') {
        crenel.position.set(x - length/2 + i * 5 + 2.5, 7, z);
        crenel.scale.set(2, 1, 1);
      } else {
        crenel.position.set(x, 7, z - length/2 + i * 5 + 2.5);
        crenel.scale.set(1, 1, 2);
      }
      crenel.castShadow = true;
      scene.add(crenel);
    }
  }

  function addStoneTablet(x, z, text) {
    if (typeof MAT === 'undefined') return;
    const base = new THREE.Mesh(UNIT_BOX, MAT.stone);
    base.position.set(x, 0.5, z);
    base.scale.set(2, 1, 1);
    base.castShadow = true;
    scene.add(base);
    const tablet = new THREE.Mesh(UNIT_BOX, MAT.stone);
    tablet.position.set(x, 2, z);
    tablet.scale.set(1.5, 3, 0.3);
    tablet.castShadow = true;
    scene.add(tablet);
  }

  function addRail(x, z, length, orientation) {
    if (typeof MAT === 'undefined') return;
    const rail = new THREE.Mesh(UNIT_BOX, MAT.wood);
    rail.position.set(x, 1, z);
    if (orientation === 'horizontal') {
      rail.scale.set(length, 0.1, 0.1);
    } else {
      rail.scale.set(0.1, 0.1, length);
    }
    rail.castShadow = true;
    scene.add(rail);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Landmarks] 地标精修初始化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 大明宫 - 殿前6层台阶+大广场（补充原系统）
      addSteps(LANDMARKS.daming.x, LANDMARKS.daming.z + 15, 36, 22, 0.4, 6);
      addSquare(LANDMARKS.daming.x, LANDMARKS.daming.z + 40, 70);

      // 太极宫 - 殿前5层台阶+广场（补充原系统）
      addSteps(LANDMARKS.taiji.x, LANDMARKS.taiji.z + 12, 30, 20, 0.4, 5);
      addSquare(LANDMARKS.taiji.x, LANDMARKS.taiji.z + 35, 60);

      // 兴庆宫 - 殿前5层台阶+广场（补充原系统）
      addSteps(LANDMARKS.xingqing.x, LANDMARKS.xingqing.z + 15, 28, 20, 0.35, 5);
      addSquare(LANDMARKS.xingqing.x, LANDMARKS.xingqing.z + 40, 55);

      // 大雁塔 - 6层台阶（补充原系统）
      addSteps(LANDMARKS.dayanta.x, LANDMARKS.dayanta.z + 10, 20, 16, 0.3, 6);

      // 小雁塔 - 6层台阶（补充原系统）
      addSteps(LANDMARKS.xiaoyanta.x, LANDMARKS.xiaoyanta.z + 10, 20, 16, 0.3, 6);

      // 青龙寺 - 5层台阶
      addSteps(LANDMARKS.qinglong.x, LANDMARKS.qinglong.z + 8, 16, 14, 0.25, 5);

      // 西明寺 - 5层台阶
      addSteps(LANDMARKS.ximing.x, LANDMARKS.ximing.z + 8, 16, 14, 0.25, 5);

      // 明德门 - 6层台阶+大广场（补充原系统）
      addSteps(LANDMARKS.mingde.x, LANDMARKS.mingde.z - 10, 28, 18, 0.4, 6);
      addSquare(LANDMARKS.mingde.x, LANDMARKS.mingde.z - 35, 60);

      // 城墙四角角楼（补充原系统，坐标与CITY边界一致：x=±450, z=±380）
      WALL_CORNERS.forEach(corner => addCornerTower(corner.x, corner.z));

      // 城墙垛口（南北城墙，z=±380，补充原系统）
      addWallCrenellations(0, -380, 900, 'horizontal');
      addWallCrenellations(0, 380, 900, 'horizontal');
      // 城墙垛口（东西城墙，x=±450，补充原系统）
      addWallCrenellations(-450, 0, 760, 'vertical');
      addWallCrenellations(450, 0, 760, 'vertical');

      // 东市牌坊（补充原系统）
      addPaifang(LANDMARKS.east.x, LANDMARKS.east.z + 10, '东市');

      // 西市牌坊（补充原系统）
      addPaifang(LANDMARKS.west.x, LANDMARKS.west.z + 10, '西市');

      // 大雁塔石碑（补充原系统）
      addStoneTablet(LANDMARKS.dayanta.x, LANDMARKS.dayanta.z + 15, '大雁塔');

      // 小雁塔石碑（补充原系统）
      addStoneTablet(LANDMARKS.xiaoyanta.x, LANDMARKS.xiaoyanta.z + 15, '小雁塔');

      // 大明宫广场栏杆（补充原系统）
      addRail(LANDMARKS.daming.x - 35, LANDMARKS.daming.z + 40, 70, 'horizontal');
      addRail(LANDMARKS.daming.x + 35, LANDMARKS.daming.z + 40, 70, 'horizontal');

      // 太极宫广场栏杆（补充原系统）
      addRail(LANDMARKS.taiji.x - 30, LANDMARKS.taiji.z + 35, 60, 'horizontal');
      addRail(LANDMARKS.taiji.x + 30, LANDMARKS.taiji.z + 35, 60, 'horizontal');

      console.log('[Landmarks] 地标精修完成 - 坐标已统一至CITY边界(x=±450, z=±380)，11大地标多级台阶+4大广场+4角楼+城墙垛口+2牌坊+2石碑+广场栏杆，不重复创建建筑');

    } catch(e) {
      console.warn('[Landmarks] 初始化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(init, 6000);
    } else {
      setTimeout(checkReady, 100);
    }
  }

  checkReady();

})();