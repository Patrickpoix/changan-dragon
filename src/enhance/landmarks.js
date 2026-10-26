/* ============================================================
   Landmarks - 地标精修Owner
   负责：所有核心地标建筑的细节精修
   数据来源：src/12-landmarks.js 权威坐标
   ============================================================ */

(function() {
  'use strict';

  // 权威地标坐标（从src/12-landmarks.js同步，集中管理不硬编码散落）
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

  // 城墙四角坐标
  const WALL_CORNERS = [
    { x: -450, z: -450 }, { x: 450, z: -450 },
    { x: -450, z: 450 },  { x: 450, z: 450 },
  ];

  let initialized = false;

  function addSteps(x, z, width, depth, height) {
    if (typeof MAT === 'undefined') return;
    for (let i = 0; i < 3; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(width - i * 2, height, depth / 3),
        MAT.stone
      );
      step.position.set(x, height * (i + 0.5), z + depth / 6 + i * depth / 3);
      step.receiveShadow = true;
      step.castShadow = true;
      scene.add(step);
    }
  }

  function addSquare(x, z, size) {
    if (typeof MAT === 'undefined') return;
    const square = new THREE.Mesh(
      new THREE.BoxGeometry(size, 0.1, size),
      MAT.stone
    );
    square.position.set(x, 0.05, z);
    square.receiveShadow = true;
    scene.add(square);
  }

  function addCornerTower(x, z) {
    if (typeof MAT === 'undefined') return;
    // 角楼基座
    const base = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), MAT.stone);
    base.position.set(x, 2.5, z);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    // 角楼屋顶
    const roof = new THREE.Mesh(new THREE.ConeGeometry(7, 4, 4), MAT.roof || MAT.roofGlazed);
    roof.position.set(x, 7, z);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Landmarks] 初始化地标精修系统...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 大明宫 - 殿前台阶+广场
      addSteps(LANDMARKS.daming.x, LANDMARKS.daming.z + 15, 20, 10, 0.3);
      addSquare(LANDMARKS.daming.x, LANDMARKS.daming.z + 25, 40);

      // 太极宫 - 殿前台阶+广场
      addSteps(LANDMARKS.taiji.x, LANDMARKS.taiji.z + 12, 16, 8, 0.3);
      addSquare(LANDMARKS.taiji.x, LANDMARKS.taiji.z + 20, 35);

      // 大雁塔 - 台阶
      addSteps(LANDMARKS.dayanta.x, LANDMARKS.dayanta.z + 10, 8, 6, 0.2);

      // 小雁塔 - 台阶
      addSteps(LANDMARKS.xiaoyanta.x, LANDMARKS.xiaoyanta.z + 10, 8, 6, 0.2);

      // 明德门 - 台阶+广场
      addSteps(LANDMARKS.mingde.x, LANDMARKS.mingde.z - 10, 12, 8, 0.3);
      addSquare(LANDMARKS.mingde.x, LANDMARKS.mingde.z - 20, 30);

      // 城墙四角角楼
      WALL_CORNERS.forEach(corner => addCornerTower(corner.x, corner.z));

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
