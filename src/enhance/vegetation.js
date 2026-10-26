/* ============================================================
   Vegetation - 植被系统Owner（增强版 v2）
   重要：原系统已包含：
   - 完整树木系统（柳/松/桃，Batch+LOD）与曲江池自带荷叶荷花
   - 兴庆宫龙池岸边柳桃、朱雀大街花圃（planterFlowers）
   因此本模块 v2 仅补充原系统缺少的：
   - 沉香亭花圃（牡丹/桃花，避开龙池水面）
   - 大雁塔院蓝花、太极宫前菊花、曲江岸草丛（不落水中）
   同类花卉共享材质实例（减少DrawCall）。
   通过 __enhance.register 注册（优先级50）
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

  // 花卉配置（避免落在水中/建筑台上；同类共享材质）
  const FLOWER_CONFIG = [
    { key: 'mudan', count: 20, centerX: 342, centerZ: -190, radius: 16, color: 0xd44a6a },   // 沉香亭花圃
    { key: 'taohua', count: 16, centerX: 342, centerZ: -190, radius: 18, color: 0xff91a7 },  // 沉香亭花圃
    { key: 'lanyao', count: 14, centerX: 216, centerZ: 283, radius: 30, color: 0x6a5acd },   // 大雁塔院
    { key: 'juhua', count: 12, centerX: 0, centerZ: -310, radius: 28, color: 0xffa500 },     // 太极宫前
    { key: 'caocong', count: 16, centerX: 354, centerZ: 318, radius: 55, color: 0x8aa05a },  // 曲江岸（草色，避开水面的landZones）
  ];

  function init() {
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 花卉：每种花只创建一个共享材质实例
      FLOWER_CONFIG.forEach(cfg => {
        const mat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.8 });
        for (let i = 0; i < cfg.count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = cfg.radius * Math.random();
          const x = cfg.centerX + Math.cos(angle) * r;
          const z = cfg.centerZ + Math.sin(angle) * r;
          // 跳过水面区域（曲江池/龙池等）
          if (typeof isWaterPoint === 'function' && isWaterPoint(x, z)) continue;
          const flower = new THREE.Mesh(UNIT_SPHERE, mat);
          flower.position.set(x, 0.3, z);
          flower.scale.set(0.4, 0.4, 0.4);
          scene.add(flower);
        }
      });

      // 大雁塔院竹林（院内半径15-28，不越出塔院围墙；共享MAT.trunk与MAT.leaf）
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 15 + Math.random() * 13;
        const x = 216 + Math.cos(angle) * r;
        const z = 283 + Math.sin(angle) * r;
        if (typeof isWaterPoint === 'function' && isWaterPoint(x, z)) continue;
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

      console.log('[Vegetation] 植被系统增强完成 - 沉香亭花圃(牡丹/桃花)+大雁塔蓝花+太极宫菊花+曲江岸草(共享材质,78株)，不重复创建已有树木/荷花');
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