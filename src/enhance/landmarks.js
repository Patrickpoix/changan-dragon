/* ============================================================
   Landmarks - 地标精修Owner（增强版）
   全部使用共享几何体UNIT_BOX/ROOF_UNIT和共享材质MAT
   ============================================================ */

(function() {
  'use strict';

  // 权威地标坐标
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

  const WALL_CORNERS = [
    { x: -450, z: -450 }, { x: 450, z: -450 },
    { x: -450, z: 450 },  { x: 450, z: 450 },
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

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Landmarks] 地标精修初始化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 大明宫 - 殿前5层台阶+大广场
      addSteps(LANDMARKS.daming.x, LANDMARKS.daming.z + 15, 30, 18, 0.4, 5);
      addSquare(LANDMARKS.daming.x, LANDMARKS.daming.z + 35, 60);

      // 太极宫 - 殿前4层台阶+广场
      addSteps(LANDMARKS.taiji.x, LANDMARKS.taiji.z + 12, 24, 14, 0.4, 4);
      addSquare(LANDMARKS.taiji.x, LANDMARKS.taiji.z + 28, 50);

      // 兴庆宫 - 殿前4层台阶+广场
      addSteps(LANDMARKS.xingqing.x, LANDMARKS.xingqing.z + 15, 22, 14, 0.35, 4);
      addSquare(LANDMARKS.xingqing.x, LANDMARKS.xingqing.z + 32, 45);

      // 大雁塔 - 5层台阶
      addSteps(LANDMARKS.dayanta.x, LANDMARKS.dayanta.z + 10, 16, 12, 0.3, 5);

      // 小雁塔 - 5层台阶
      addSteps(LANDMARKS.xiaoyanta.x, LANDMARKS.xiaoyanta.z + 10, 16, 12, 0.3, 5);

      // 青龙寺 - 4层台阶
      addSteps(LANDMARKS.qinglong.x, LANDMARKS.qinglong.z + 8, 12, 10, 0.25, 4);

      // 西明寺 - 4层台阶
      addSteps(LANDMARKS.ximing.x, LANDMARKS.ximing.z + 8, 12, 10, 0.25, 4);

      // 明德门 - 5层台阶+大广场
      addSteps(LANDMARKS.mingde.x, LANDMARKS.mingde.z - 10, 22, 14, 0.4, 5);
      addSquare(LANDMARKS.mingde.x, LANDMARKS.mingde.z - 28, 50);

      // 城墙四角角楼
      WALL_CORNERS.forEach(corner => addCornerTower(corner.x, corner.z));

      // 城墙垛口（南北城墙）
      addWallCrenellations(0, -450, 900, 'horizontal');
      addWallCrenellations(0, 450, 900, 'horizontal');
      // 城墙垛口（东西城墙）
      addWallCrenellations(-450, 0, 900, 'vertical');
      addWallCrenellations(450, 0, 900, 'vertical');

      // 东市牌坊
      addPaifang(LANDMARKS.east.x, LANDMARKS.east.z + 10, '东市');

      // 西市牌坊
      addPaifang(LANDMARKS.west.x, LANDMARKS.west.z + 10, '西市');

      console.log('[Landmarks] 地标精修完成 - 11大地标多级台阶+3大广场+4角楼+城墙垛口+2牌坊(带匾额)');

    } catch(e) {
      console.warn('[Landmarks] 初始化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(init, 8000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();