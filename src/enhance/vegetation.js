/* ============================================================
   Vegetation - 植被系统Owner（v4）
   修复：花卉/竹林改 mulberry32 种子随机（布局可复现）；
        花卉改用小圆柱+不同色（不是 UNIT_SPHERE 球体冒充）；
        竹林移到塔院东侧空地（不长塔基上）。
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

  const R = mulberry32(20261028);

  const FLOWER_CONFIG = [
    { key: 'mudan', count: 20, centerX: 342, centerZ: -190, radius: 16, color: 0xd44a6a },
    { key: 'taohua', count: 16, centerX: 342, centerZ: -190, radius: 18, color: 0xff91a7 },
    { key: 'lanyao', count: 14, centerX: 216, centerZ: 265, radius: 12, color: 0x6a5acd },
    { key: 'juhua', count: 12, centerX: 0, centerZ: -310, radius: 28, color: 0xffa500 },
    { key: 'caocong', count: 16, centerX: 354, centerZ: 318, radius: 55, color: 0x8aa05a },
  ];

  function init() {
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      if (typeof Batch !== 'undefined') {
        FLOWER_CONFIG.forEach(cfg => {
          const mat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.8 });
          const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.9 });
          const stems = new Batch(UNIT_CYL, stemMat, { cast: false });
          const blooms = new Batch(UNIT_SPHERE, mat, { cast: false });
          for (let i = 0; i < cfg.count; i++) {
            const angle = R() * Math.PI * 2;
            const r = cfg.radius * R();
            const x = cfg.centerX + Math.cos(angle) * r;
            const z = cfg.centerZ + Math.sin(angle) * r;
            if (typeof isWaterPoint === 'function' && isWaterPoint(x, z)) continue;
            stems.add(x, 0.15, z, 0.04, 0.3, 0.04);
            blooms.add(x, 0.35, z, 0.18, 0.14, 0.18);
          }
          stems.build();
          blooms.build();
        });

        // 大雁塔院竹林：移到塔院东侧空地（x=235 附近），不长塔基上
        const bambooMat = new THREE.MeshStandardMaterial({ color: 0x5c7a44, roughness: 0.85 });
        const trunks = new Batch(UNIT_CYL, bambooMat, { cast: true });
        const leaves = new Batch(UNIT_SPHERE, MAT.leaf, { cast: true });
        for (let i = 0; i < 10; i++) {
          const angle = R() * Math.PI * 2;
          const r = 3 + R() * 8;
          const x = 235 + Math.cos(angle) * r;
          const z = 283 + Math.sin(angle) * r;
          if (typeof isWaterPoint === 'function' && isWaterPoint(x, z)) continue;
          trunks.add(x, 2, z, 0.12, 4, 0.12);
          leaves.add(x, 4.5, z, 1.2, 0.8, 1.2);
        }
        trunks.build();
        leaves.build();
      }

      console.log('[Vegetation] v4: flowers (stem+bloom separated) + bamboo (east of pagoda), seeded');
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
