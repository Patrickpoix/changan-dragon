/* ============================================================
   Vegetation - 植被系统Owner
   负责：所有树木/花卉/绿化的统一种植和管理
   ============================================================ */

(function() {
  'use strict';

  // 植被配置 - 集中管理，不硬编码散落各处
  const TREE_CONFIG = {
    street: { count: 40, type: 'oak', roadWidth: 20 },
    daming: { count: 20, type: 'pine', centerX: 150, centerZ: -432, radius: 80 },
    taiji:  { count: 15, type: 'pine', centerX: 0, centerZ: -334, radius: 60 },
    xingqing:{ count: 12, type: 'peach', centerX: 342, centerZ: -152, radius: 50 },
    dayanta:{ count: 10, type: 'pine', centerX: 216, centerZ: 283, radius: 40 },
    qujiang:{ count: 12, type: 'willow', centerX: 354, centerZ: 318, radius: 50 },
    longchi:{ count: 8, type: 'willow', centerX: 342, centerZ: -152, radius: 35 },
  };

  const FLOWER_CONFIG = {
    mudan: { count: 20, centerX: 342, centerZ: -152, radius: 40, color: 0xd44a6a }, // 兴庆宫牡丹
    hehua: { count: 30, centerX: 354, centerZ: 318, radius: 35, color: 0xf8f8f8 }, // 曲江池荷花
  };

  let initialized = false;

  function createTree(x, z, type) {
    if (typeof MAT === 'undefined') return;
    const trunkH = 3 + Math.random() * 2;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, trunkH, 6), MAT.wood);
    trunk.position.set(x, trunkH / 2, z);
    trunk.castShadow = true;
    scene.add(trunk);

    let leafColor = 0x4a7a3a;
    if (type === 'pine') leafColor = 0x3a5a3a;
    else if (type === 'willow') leafColor = 0x6a9a5a;
    else if (type === 'peach') leafColor = 0xe8aab0;

    const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.5 + Math.random(), 6, 5),
      new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.9 }));
    leaves.position.set(x, trunkH + 1, z);
    leaves.castShadow = true;
    scene.add(leaves);
  }

  function createFlower(x, z, color) {
    if (typeof MAT === 'undefined') return;
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.2 + Math.random() * 0.1, 4, 4),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 })
    );
    flower.position.set(x, 0.3, z);
    scene.add(flower);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Vegetation] 初始化植被系统...');
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

      console.log('[Vegetation] 植被系统初始化完成');
    } catch(e) { console.warn('[Vegetation] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 10000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();
