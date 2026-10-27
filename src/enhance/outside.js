/* ============================================================
   Outside - 城外环境Owner（v4.1）
   修复：里程碑移到护城河外（z>415）；城外树改 mulberry32 种子随机
        （布局可复现，不每次刷新变）；驿站坐标核对避开田畴。
   v4.1：补全 mulberry32 函数定义（此前直接调用但未定义，会 ReferenceError）
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

  // 固定种子：布局可复现（每次刷新位置一致），但仍自然分布
  function mulberry32(seed) {
    return function() {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const R = mulberry32(20261027);

  function registerCollider(x, z, w, d, tag) {
    if (typeof addCollider === 'function') {
      try { addCollider(x - w / 2, x + w / 2, z - d / 2, z + d / 2, tag); } catch(_) {}
    }
  }
  function registerFlight(x, z, w, d, top) {
    if (typeof recordFlightObstacle === 'function') {
      try { recordFlightObstacle(x, z, w, d, top); } catch(_) {}
    }
  }

  function addPostStation(x, z) {
    if (typeof MAT === 'undefined') return;
    const main = new THREE.Mesh(UNIT_BOX, MAT.plaster || MAT.wood);
    main.position.set(x, 3, z); main.scale.set(18, 6, 12); main.castShadow = true; main.receiveShadow = true;
    scene.add(main);
    const roof = new THREE.Mesh(ROOF_UNIT, MAT.roof);
    roof.position.set(x, 7, z); roof.scale.set(21, 3.5, 15); roof.castShadow = true;
    scene.add(roof);
    const wall = new THREE.Mesh(UNIT_BOX, MAT.stone);
    wall.position.set(x, 1.5, z + 10); wall.scale.set(30, 3, 0.5); wall.castShadow = true; wall.receiveShadow = true;
    scene.add(wall);
    registerCollider(x, z, 18, 12, 'station');
    registerCollider(x, z + 10, 30, 0.5, 'station-wall');
    registerFlight(x, z, 21, 15, 9.5);
  }

  function addWell(x, z) {
    if (typeof MAT === 'undefined') return;
    const base = new THREE.Mesh(UNIT_CYL, MAT.stone);
    base.position.set(x, 0.5, z); base.scale.set(1.5, 1, 1.5); base.castShadow = true; base.receiveShadow = true;
    scene.add(base);
    const roof = new THREE.Mesh(ROOF_SMALL, MAT.roof);
    roof.position.set(x, 2.5, z); roof.scale.set(3, 1.5, 3); roof.castShadow = true; roof.receiveShadow = true;
    scene.add(roof);
    registerCollider(x, z, 3, 3, 'well');
  }

  function init() {
    console.log('[Outside] 城外环境初始化...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      addPostStation(500, -500);
      addPostStation(-550, 500);
      addPostStation(550, 500);
      addPostStation(-500, -500);
      addWell(580, 480);
      addWell(-520, 550);

      // 里程碑：御道两侧路缘 x=±12.5，z 从 415 开始（避开护城河 z=390-410）
      if (typeof Batch !== 'undefined') {
        const milestones = new Batch(UNIT_BOX, MAT.stone, { cast: true });
        for (let i = 0; i < 8; i++) {
          milestones.add(-12.5, 1.5, 415 + i * 15, 0.8, 3, 0.3);
          milestones.add(12.5, 1.5, 415 + i * 15, 0.8, 3, 0.3);
        }
        milestones.build();
        for (let i = 0; i < 8; i++) {
          registerCollider(-12.5, 415 + i * 15, 1.2, 0.8, 'milestone');
          registerCollider(12.5, 415 + i * 15, 1.2, 0.8, 'milestone');
        }
      }

      // 城外树林——种子随机，布局可复现
      if (typeof addTree !== 'undefined') {
        for (let i = 0; i < 30; i++) addTree(500 + R() * 200, 300 + R() * 200, i % 2 ? 'willow' : 'pine', 0.8 + R() * 0.3);
        for (let i = 0; i < 25; i++) addTree(-600 + R() * 200, 300 + R() * 200, i % 2 ? 'willow' : 'pine', 0.8 + R() * 0.3);
        for (let i = 0; i < 25; i++) addTree(500 + R() * 200, -400 + R() * 200, i % 2 ? 'willow' : 'pine', 0.8 + R() * 0.3);
        for (let i = 0; i < 20; i++) addTree(-600 + R() * 200, -400 + R() * 200, i % 2 ? 'willow' : 'pine', 0.8 + R() * 0.3);
      }

      console.log('[Outside] v4.1: 4 stations + 2 wells + 16 milestones (z>415) + 100 seeded trees (mulberry32 defined)');
    } catch(e) { console.warn('[Outside] 初始化失败:', e); }
  }

  function register() {
    if (registered) return;
    registered = true;
    if (window.__enhance) {
      window.__enhance.register('outside', init, 80);
    } else {
      (window.__enhancePending = window.__enhancePending || []).push({ owner: 'outside', fn: init, priority: 80 });
    }
  }

  if (typeof GAME !== 'undefined' && GAME.ready) register();
  else {
    let tries = 0;
    (function check() {
      if (typeof GAME !== 'undefined' && GAME.ready) register();
      else if (tries++ < 400) setTimeout(check, 100);
      else { if (window.__enhance) window.__enhance.register('outside', init, 80); }
    })();
  }
})();
