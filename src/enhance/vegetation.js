/* ============================================================
   Vegetation - 植被系统Owner（增强版）
   全部使用共享几何体UNIT_CYL/UNIT_SPHERE和共享材质MAT
   ============================================================ */

(function() {
  'use strict';

  // 植被配置 - 集中管理
  const TREE_CONFIG = {
    street: { count: 60, type: 'oak', roadWidth: 20 },
    daming: { count: 40, type: 'pine', centerX: 150, centerZ: -432, radius: 110 },
    taiji:  { count: 30, type: 'pine', centerX: 0, centerZ: -334, radius: 90 },
    xingqing:{ count: 25, type: 'peach', centerX: 342, centerZ: -152, radius: 70 },
    dayanta:{ count: 18, type: 'pine', centerX: 216, centerZ: 283, radius: 55 },
    qujiang:{ count: 30, type: 'willow', centerX: 354, centerZ: 318, radius: 70 },
    longchi:{ count: 18, type: 'willow', centerX: 342, centerZ: -152, radius: 45 },
    xiaoyanta:{ count: 15, type: 'pine', centerX: -216, centerZ: 349, radius: 45 },
    qinglong:{ count: 12, type: 'pine', centerX: 300, centerZ: 100, radius: 40 },
    ximing: { count: 12, type: 'pine', centerX: -300, centerZ: 150, radius: 40 },
  };

  const FLOWER_CONFIG = {
    mudan: { count: 60, centerX: 342, centerZ: -152, radius: 50, color: 0xd44a6a },
    hehua: { count: 70, centerX: 354, centerZ: 318, radius: 45, color: 0xf8f8f8 },
    taohua: { count: 45, centerX: 342, centerZ: -152, radius: 55, color: 0xff91a7 },
    lanyao: { count: 30, centerX: 216, centerZ: 283, radius: 35, color: 0x6a5acd },
  };

  let initialized = false;

  function createTree(x, z, type) {
    if (typeof MAT === 'undefined') return;
    const trunkH = 3 + Math.random() * 2;
    const trunk = new THREE.Mesh(UNIT_CYL, MAT.trunk || MAT.wood);
    trunk.position.set(x, trunkH / 2, z);
    trunk.scale.set(0.3, trunkH, 0.3);
    trunk.castShadow = true;
    scene.add(trunk);

    const leaves = new THREE.Mesh(UNIT_SPHERE, MAT.leaf || MAT.blossom);
    leaves.position.set(x, trunkH + 1, z);
    leaves.scale.set(3 + Math.random(), 3 + Math.random(), 3 + Math.random());
    leaves.castShadow = true;
    scene.add(leaves);
  }

  function createFlower(x, z, color) {
    if (typeof MAT === 'undefined') return;
    const flower = new THREE.Mesh(UNIT_SPHERE,
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 }));
    flower.position.set(x, 0.3, z);
    flower.scale.set(0.4, 0.4, 0.4);
    scene.add(flower);
  }

  function createBush(x, z) {
    if (typeof MAT === 'undefined') return;
    const bush = new THREE.Mesh(UNIT_SPHERE, MAT.leaf);
    bush.position.set(x, 0.5, z);
    bush.scale.set(1 + Math.random(), 0.8 + Math.random() * 0.5, 1 + Math.random());
    bush.castShadow = true;
    scene.add(bush);
  }

  function createBamboo(x, z) {
    if (typeof MAT === 'undefined') return;
    const bamboo = new THREE.Mesh(UNIT_CYL, MAT.trunk || MAT.wood);
    bamboo.position.set(x, 2, z);
    bamboo.scale.set(0.15, 4, 0.15);
    bamboo.castShadow = true;
    scene.add(bamboo);
    const leaves = new THREE.Mesh(UNIT_SPHERE, MAT.leaf);
    leaves.position.set(x, 4.5, z);
    leaves.scale.set(1.5, 1, 1.5);
    leaves.castShadow = true;
    scene.add(leaves);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Vegetation] 植被系统初始化...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 朱雀大街行道树
      for (let i = 0; i < TREE_CONFIG.street.count; i++) {
        const z = -350 + i * (700 / TREE_CONFIG.street.count);
        createTree(-12, z, 'oak');
        createTree(12, z, 'oak');
      }

      // 各大建筑周边树木
      Object.keys(TREE_CONFIG).forEach(key => {
        if (key === 'street') return;
        const cfg = TREE_CONFIG[key];
        for (let i = 0; i < cfg.count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = cfg.radius * (0.5 + Math.random() * 0.5);
          createTree(cfg.centerX + Math.cos(angle) * r, cfg.centerZ + Math.sin(angle) * r, cfg.type);
        }
      });

      // 花卉
      Object.keys(FLOWER_CONFIG).forEach(key => {
        const cfg = FLOWER_CONFIG[key];
        for (let i = 0; i < cfg.count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = cfg.radius * Math.random();
          createFlower(cfg.centerX + Math.cos(angle) * r, cfg.centerZ + Math.sin(angle) * r, cfg.color);
        }
      });

      // 兴庆宫周边灌木
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 55 + Math.random() * 15;
        createBush(342 + Math.cos(angle) * r, -152 + Math.sin(angle) * r);
      }

      // 曲江池周边灌木
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 55 + Math.random() * 15;
        createBush(354 + Math.cos(angle) * r, 318 + Math.sin(angle) * r);
      }

      // 大雁塔周边竹林
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 30 + Math.random() * 15;
        createBamboo(216 + Math.cos(angle) * r, 283 + Math.sin(angle) * r);
      }

      console.log('[Vegetation] 植被系统初始化完成 - 10种树配置(密度提升)+4种花卉+灌木+竹林+共享材质');
    } catch(e) { console.warn('[Vegetation] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 10000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();