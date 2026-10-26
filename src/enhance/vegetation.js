/* ============================================================
   Vegetation - 植被系统Owner（v3）
   原系统已含：树木系统（柳/松/桃，Batch+LOD）、曲江池荷叶荷花、
   龙池岸柳桃、朱雀大街花圃。本模块只补充：
   - 沉香亭花圃（牡丹/桃花，避开龙池水面）
   - 大雁塔院蓝花、太极宫前菊花、曲江岸草丛（isWaterPoint过滤）
   - 大雁塔院竹林（院内半径15-28，不越围墙）
   花卉/竹林使用局部Batch（每类型1个InstancedMesh，同类共享材质实例）
   通过 __enhance.register 注册（优先级50）
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

  const FLOWER_CONFIG = [
    { key: 'mudan', count: 20, centerX: 342, centerZ: -190, radius: 16, color: 0xd44a6a },
    { key: 'taohua', count: 16, centerX: 342, centerZ: -190, radius: 18, color: 0xff91a7 },
    { key: 'lanyao', count: 14, centerX: 216, centerZ: 283, radius: 30, color: 0x6a5acd },
    { key: 'juhua', count: 12, centerX: 0, centerZ: -310, radius: 28, color: 0xffa500 },
    { key: 'caocong', count: 16, centerX: 354, centerZ: 318, radius: 55, color: 0x8aa05a },
  ];

  function init() {
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 花卉：每色1个局部Batch + 1个共享材质实例（原78独立mesh → 5个InstancedMesh）
      if (typeof Batch !== 'undefined') {
        FLOWER_CONFIG.forEach(cfg => {
          const mat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.8 });
          const batch = new Batch(UNIT_SPHERE, mat, { cast: false });
          for (let i = 0; i < cfg.count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = cfg.radius * Math.random();
            const x = cfg.centerX + Math.cos(angle) * r;
            const z = cfg.centerZ + Math.sin(angle) * r;
            if (typeof isWaterPoint === 'function' && isWaterPoint(x, z)) continue;
            batch.add(x, 0.3, z, 0.4, 0.4, 0.4);
          }
          batch.build();
        });

        // 大雁塔院竹林（院内半径15-28；杆/叶各1个局部Batch）
        const bambooMat = new THREE.MeshStandardMaterial({ color: 0x5c7a44, roughness: 0.85 });
        const trunks = new Batch(UNIT_CYL, bambooMat, { cast: true });
        const leaves = new Batch(UNIT_SPHERE, MAT.leaf, { cast: true });
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = 15 + Math.random() * 13;
          const x = 216 + Math.cos(angle) * r;
          const z = 283 + Math.sin(angle) * r;
          if (typeof isWaterPoint === 'function' && isWaterPoint(x, z)) continue;
          trunks.add(x, 2, z, 0.15, 4, 0.15);
          leaves.add(x, 4.5, z, 1.5, 1, 1.5);
        }
        trunks.build();
        leaves.build();
      }

      console.log('[Vegetation] 植被系统增强完成 - 花圃/蓝花/菊花/岸草(每色1局部Batch共享材质)+竹林(院内2局部Batch)，不重复创建已有树木/荷花');
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