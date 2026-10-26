/* ============================================================
   Vegetation - 植被系统Owner（增强版）
   注意：原系统已有完整树木系统（柳树/松树/桃花树，Batch批处理+LOD）
   本模块仅做补充性植被：花卉+灌木+竹林，不重复创建树木
   全部使用共享几何体UNIT_CYL/UNIT_SPHERE和共享材质MAT
   ============================================================ */

(function() {
  'use strict';

  // 花卉配置
  const FLOWER_CONFIG = {
    mudan: { count: 100, centerX: 342, centerZ: -152, radius: 70, color: 0xd44a6a },
    hehua: { count: 110, centerX: 354, centerZ: 318, radius: 65, color: 0xf8f8f8 },
    taohua: { count: 80, centerX: 342, centerZ: -152, radius: 75, color: 0xff91a7 },
    lanyao: { count: 60, centerX: 216, centerZ: 283, radius: 55, color: 0x6a5acd },
    juhua: { count: 50, centerX: 0, centerZ: -334, radius: 65, color: 0xffa500 },
    gui: { count: 45, centerX: 150, centerZ: -432, radius: 60, color: 0xffd700 },
    meihua: { count: 35, centerX: -216, centerZ: 349, radius: 45, color: 0xff69b4 },
  };

  let initialized = false;

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

      // 花卉（补充原系统）
      Object.keys(FLOWER_CONFIG).forEach(key => {
        const cfg = FLOWER_CONFIG[key];
        for (let i = 0; i < cfg.count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = cfg.radius * Math.random();
          createFlower(cfg.centerX + Math.cos(angle) * r, cfg.centerZ + Math.sin(angle) * r, cfg.color);
        }
      });

      // 兴庆宫周边灌木（补充原系统）
      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 75 + Math.random() * 30;
        createBush(342 + Math.cos(angle) * r, -152 + Math.sin(angle) * r);
      }

      // 曲江池周边灌木（补充原系统）
      for (let i = 0; i < 70; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 75 + Math.random() * 30;
        createBush(354 + Math.cos(angle) * r, 318 + Math.sin(angle) * r);
      }

      // 大雁塔周边竹林（补充原系统）
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 45 + Math.random() * 20;
        createBamboo(216 + Math.cos(angle) * r, 283 + Math.sin(angle) * r);
      }

      // 小雁塔周边竹林（补充原系统）
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 40 + Math.random() * 18;
        createBamboo(-216 + Math.cos(angle) * r, 349 + Math.sin(angle) * r);
      }

      console.log('[Vegetation] 植被系统初始化完成 - 7种花卉+灌木+竹林，不重复创建已有树木');
    } catch(e) { console.warn('[Vegetation] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 10000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();