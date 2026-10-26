/* ============================================================
   Vegetation - 植被系统Owner（增强版）
   原系统已有完整树木系统，本模块仅补充花卉+灌木+竹林。
   同类花卉共享材质实例（减少DrawCall）。
   通过 __enhance.register 注册（优先级50）
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

  const FLOWER_CONFIG = [
    { key: 'mudan', count: 24, centerX: 342, centerZ: -152, radius: 48, color: 0xd44a6a },
    { key: 'hehua', count: 26, centerX: 354, centerZ: 318, radius: 42, color: 0xf8f8f8 },
    { key: 'taohua', count: 20, centerX: 342, centerZ: -152, radius: 52, color: 0xff91a7 },
    { key: 'lanyao', count: 16, centerX: 216, centerZ: 283, radius: 32, color: 0x6a5acd },
    { key: 'juhua', count: 14, centerX: 0, centerZ: -334, radius: 36, color: 0xffa500 },
  ];

  function init() {
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      FLOWER_CONFIG.forEach(cfg => {
        const mat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.8 });
        for (let i = 0; i < cfg.count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = cfg.radius * Math.random();
          const flower = new THREE.Mesh(UNIT_SPHERE, mat);
          flower.position.set(cfg.centerX + Math.cos(angle) * r, 0.3, cfg.centerZ + Math.sin(angle) * r);
          flower.scale.set(0.4, 0.4, 0.4);
          scene.add(flower);
        }
      });

      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 62 + Math.random() * 18;
        const bush = new THREE.Mesh(UNIT_SPHERE, MAT.leaf);
        bush.position.set(342 + Math.cos(angle) * r, 0.5, -152 + Math.sin(angle) * r);
        bush.scale.set(1 + Math.random(), 0.8 + Math.random() * 0.5, 1 + Math.random());
        bush.castShadow = true;
        scene.add(bush);
      }

      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 62 + Math.random() * 18;
        const bush = new THREE.Mesh(UNIT_SPHERE, MAT.leaf);
        bush.position.set(354 + Math.cos(angle) * r, 0.5, 318 + Math.sin(angle) * r);
        bush.scale.set(1 + Math.random(), 0.8 + Math.random() * 0.5, 1 + Math.random());
        bush.castShadow = true;
        scene.add(bush);
      }

      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 36 + Math.random() * 14;
        const x = 216 + Math.cos(angle) * r;
        const z = 283 + Math.sin(angle) * r;
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

      console.log('[Vegetation] 植被系统增强完成 - 5种花卉(共享材质,100朵)+灌木(38)+竹林(10)，不重复创建已有树木');
    } catch(e) { console.warn('[Vegetation] 初始化失败:', e); }
  }

  function register() {
    if (registered) return;
    registered = true;
    if (window.__enhance) {
      window.__enhance.register('vegetation', init, 50);
    } else {
      (window.__enhancePending = window.__enhancePending || []).push({ owner: 'vegetation', fn: init, priority: 50 });
    }
  }

  if (typeof GAME !== 'undefined' && GAME.ready) register();
  else {
    let tries = 0;
    (function check() {
      if (typeof GAME !== 'undefined' && GAME.ready) register();
      else if (tries++ < 400) setTimeout(check, 100);
      else { if (window.__enhance) window.__enhance.register('vegetation', init, 50); }
    })();
  }
})();