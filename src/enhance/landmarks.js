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

  function addSteps(x, z, width, depth, height) {
    if (typeof MAT === 'undefined') return;
    for (let i = 0; i < 3; i++) {
      const step = new THREE.Mesh(UNIT_BOX, MAT.stone);
      step.position.set(x, height * (i + 0.5), z + depth / 6 + i * depth / 3);
      step.scale.set(width - i * 2, height, depth / 3);
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
    base.position.set(x, 2.5, z);
    base.scale.set(10, 5, 10);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    const roof = new THREE.Mesh(ROOF_UNIT, MAT.roof || MAT.roofGlazed);
    roof.position.set(x, 5, z);
    roof.scale.set(14, 4, 14);
    roof.castShadow = true;
    scene.add(roof);
  }

  function addPaifang(x, z, name) {
    if (typeof MAT === 'undefined') return;
    // 牌坊柱子
    for (let i = -1; i <= 1; i += 2) {
      const pillar = new THREE.Mesh(UNIT_CYL, MAT.stone);
      pillar.position.set(x + i * 4, 3, z);
      pillar.scale.set(0.4, 6, 0.4);
      pillar.castShadow = true;
      scene.add(pillar);
    }
    // 牌坊横梁
    const beam = new THREE.Mesh(UNIT_BOX, MAT.wood);
    beam.position.set(x, 5.5, z);
    beam.scale.set(10, 0.5, 0.5);
    beam.castShadow = true;
    scene.add(beam);
    // 牌坊屋顶
    const roof = new THREE.Mesh(ROOF_SMALL, MAT.roof);
    roof.position.set(x, 6.5, z);
    roof.scale.set(12, 1.5, 2);
    roof.castShadow = true;
    scene.add(roof);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Landmarks] 地标精修初始化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 大明宫 - 殿前台阶+广场
      addSteps(LANDMARKS.daming.x, LANDMARKS.daming.z + 15, 22, 12, 0.3);
      addSquare(LANDMARKS.daming.x, LANDMARKS.daming.z + 28, 45);

      // 太极宫 - 殿前台阶+广场
      addSteps(LANDMARKS.taiji.x, LANDMARKS.taiji.z + 12, 18, 10, 0.3);
      addSquare(LANDMARKS.taiji.x, LANDMARKS.taiji.z + 22, 40);

      // 兴庆宫 - 殿前台阶+广场
      addSteps(LANDMARKS.xingqing.x, LANDMARKS.xingqing.z + 15, 16, 10, 0.3);
      addSquare(LANDMARKS.xingqing.x, LANDMARKS.xingqing.z + 28, 35);

      // 大雁塔 - 台阶
      addSteps(LANDMARKS.dayanta.x, LANDMARKS.dayanta.z + 10, 10, 8, 0.2);

      // 小雁塔 - 台阶
      addSteps(LANDMARKS.xiaoyanta.x, LANDMARKS.xiaoyanta.z + 10, 10, 8, 0.2);

      // 青龙寺 - 台阶
      addSteps(LANDMARKS.qinglong.x, LANDMARKS.qinglong.z + 8, 8, 6, 0.2);

      // 西明寺 - 台阶
      addSteps(LANDMARKS.ximing.x, LANDMARKS.ximing.z + 8, 8, 6, 0.2);

      // 明德门 - 台阶+广场
      addSteps(LANDMARKS.mingde.x, LANDMARKS.mingde.z - 10, 14, 10, 0.3);
      addSquare(LANDMARKS.mingde.x, LANDMARKS.mingde.z - 22, 35);

      // 城墙四角角楼
      WALL_CORNERS.forEach(corner => addCornerTower(corner.x, corner.z));

      // 东市牌坊
      addPaifang(LANDMARKS.east.x, LANDMARKS.east.z + 10, '东市');

      // 西市牌坊
      addPaifang(LANDMARKS.west.x, LANDMARKS.west.z + 10, '西市');

      console.log('[Landmarks] 地标精修完成');

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
