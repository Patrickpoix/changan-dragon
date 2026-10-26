/* ============================================================
   Outside - 城外环境Owner（增强版）
   原系统已有完整城外田园（明德门外御道+小村庄+城外小河+柳树）
   本模块仅做补充性城外建筑：驿站+水井+里程碑+城外树林
   新增实体注册原系统碰撞网格addCollider和飞行障碍recordFlightObstacle
   权威坐标：WORLD = { x0: -780, x1: 780, z0: -660, z1: 660 }
   通过 __enhance.register 注册（优先级80，城外最后加载）
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

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
    main.position.set(x, 3, z);
    main.scale.set(18, 6, 12);
    main.castShadow = true;
    main.receiveShadow = true;
    scene.add(main);
    const roof = new THREE.Mesh(ROOF_UNIT, MAT.roof);
    roof.position.set(x, 7, z);
    roof.scale.set(21, 3.5, 15);
    roof.castShadow = true;
    scene.add(roof);
    const wall = new THREE.Mesh(UNIT_BOX, MAT.stone);
    wall.position.set(x, 1.5, z + 10);
    wall.scale.set(30, 3, 0.5);
    wall.castShadow = true;
    scene.add(wall);
    registerCollider(x, z, 18, 12, 'station');
    registerCollider(x, z + 10, 30, 0.5, 'station-wall');
    registerFlight(x, z, 21, 15, 9.5);
  }

  function addWell(x, z) {
    if (typeof MAT === 'undefined') return;
    const base = new THREE.Mesh(UNIT_CYL, MAT.stone);
    base.position.set(x, 0.5, z);
    base.scale.set(1.5, 1, 1.5);
    base.castShadow = true;
    scene.add(base);
    const roof = new THREE.Mesh(ROOF_SMALL, MAT.roof);
    roof.position.set(x, 2.5, z);
    roof.scale.set(3, 1.5, 3);
    roof.castShadow = true;
    scene.add(roof);
    registerCollider(x, z, 3, 3, 'well');
  }

  function addMilestone(x, z) {
    if (typeof MAT === 'undefined') return;
    const milestone = new THREE.Mesh(UNIT_BOX, MAT.stone);
    milestone.position.set(x, 1.5, z);
    milestone.scale.set(0.8, 3, 0.3);
    milestone.castShadow = true;
    scene.add(milestone);
    registerCollider(x, z, 1.2, 0.8, 'milestone');
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

      for (let i = 0; i < 8; i++) {
        addMilestone(-8, 400 + i * 15);
        addMilestone(8, 400 + i * 15);
      }

      // 城外树林（原系统addTree，批处理兼容）
      if (typeof addTree !== 'undefined') {
        for (let i = 0; i < 30; i++) addTree(500 + Math.random() * 200, 300 + Math.random() * 200, i % 2 ? 'willow' : 'pine', 0.8 + Math.random() * 0.3);
        for (let i = 0; i < 25; i++) addTree(-600 + Math.random() * 200, 300 + Math.random() * 200, i % 2 ? 'willow' : 'pine', 0.8 + Math.random() * 0.3);
        for (let i = 0; i < 25; i++) addTree(500 + Math.random() * 200, -400 + Math.random() * 200, i % 2 ? 'willow' : 'pine', 0.8 + Math.random() * 0.3);
        for (let i = 0; i < 20; i++) addTree(-600 + Math.random() * 200, -400 + Math.random() * 200, i % 2 ? 'willow' : 'pine', 0.8 + Math.random() * 0.3);
      }

      console.log('[Outside] 城外环境增强完成 - 4驿站+2水井+16里程碑+100城外树(原系统addTree)，已注册碰撞与飞行障碍');
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