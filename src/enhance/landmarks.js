/* ============================================================
   Landmarks - 地标精修Owner（增强版 v2）
   重要：原系统（12-landmarks.js / 10-world.js）已包含：
   - 城墙四角角楼（addPavilion gold）+ 批量垛口（B.stone）
   - addHall 自带三级台阶 / addPavilion 自带台阶
   - 朱雀大街四座彩绘牌楼（天街/朱雀/长安/春风）
   - 明德门/丹凤门/玄武门/春明门/金光门 门楼
   因此本模块 v2 只补充原系统缺失的：东西市牌坊 + 两塔石碑，
   不再重复创建角楼/垛口/台阶/广场/栏杆。
   新增实体注册原系统碰撞网格addCollider和飞行障碍recordFlightObstacle
   权威坐标：CITY = { x0: -450, x1: 450, z0: -380, z1: 380 }
   通过 __enhance.register 注册（优先级40）
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

  // 权威地标坐标（与原系统一致）
  const LANDMARKS = {
    dayanta:  { name: '大雁塔',   x: 216, z: 283 },
    xiaoyanta:{ name: '小雁塔',   x: -216, z: 349 },
    east:     { name: '东市',     x: 174, z: -14 },
    west:     { name: '西市',     x: -258, z: -14 },
  };

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

  // 东西市牌坊（市场内中轴线装饰，原系统无，两柱间可通行）
  function addPaifang(x, z, name) {
    if (typeof MAT === 'undefined') return;
    for (let i = -1; i <= 1; i += 2) {
      const pillar = new THREE.Mesh(UNIT_CYL, MAT.stone);
      pillar.position.set(x + i * 5, 3.5, z);
      pillar.scale.set(0.5, 7, 0.5);
      pillar.castShadow = true;
      scene.add(pillar);
      registerCollider(x + i * 5, z, 1.2, 1.2, 'paifang-pillar');
    }
    const beam = new THREE.Mesh(UNIT_BOX, MAT.wood);
    beam.position.set(x, 6, z);
    beam.scale.set(12, 0.6, 0.6);
    beam.castShadow = true;
    scene.add(beam);
    const plaque = new THREE.Mesh(UNIT_BOX, MAT.red || MAT.wood);
    plaque.position.set(x, 6.8, z);
    plaque.scale.set(4, 1, 0.3);
    plaque.castShadow = true;
    scene.add(plaque);
    const roof = new THREE.Mesh(ROOF_SMALL, MAT.roof);
    roof.position.set(x, 8, z);
    roof.scale.set(14, 1.5, 2.5);
    roof.castShadow = true;
    scene.add(roof);
    registerFlight(x, z, 14, 3, 9);
  }

  // 塔前石碑（原系统无，新物理物体）
  function addStoneTablet(x, z, text) {
    if (typeof MAT === 'undefined') return;
    const base = new THREE.Mesh(UNIT_BOX, MAT.stone);
    base.position.set(x, 0.5, z);
    base.scale.set(2, 1, 1);
    base.castShadow = true;
    scene.add(base);
    const tablet = new THREE.Mesh(UNIT_BOX, MAT.stone);
    tablet.position.set(x, 2, z);
    tablet.scale.set(1.5, 3, 0.3);
    tablet.castShadow = true;
    scene.add(tablet);
    registerCollider(x, z, 2.2, 1.4, 'stone-tablet');
  }

  function init() {
    console.log('[Landmarks] 地标精修初始化...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 东市 / 西市牌坊（市场内中轴线）
      addPaifang(LANDMARKS.east.x, LANDMARKS.east.z + 10, '东市');
      addPaifang(LANDMARKS.west.x, LANDMARKS.west.z + 10, '西市');

      // 大雁塔 / 小雁塔 塔前石碑
      addStoneTablet(LANDMARKS.dayanta.x, LANDMARKS.dayanta.z + 15, '大雁塔');
      addStoneTablet(LANDMARKS.xiaoyanta.x, LANDMARKS.xiaoyanta.z + 15, '小雁塔');

      console.log('[Landmarks] 地标精修完成 - 2东西市牌坊+2塔前石碑（已注册碰撞与飞行障碍）；不重复创建角楼/垛口/台阶/广场（原系统已有）');
    } catch(e) {
      console.warn('[Landmarks] 初始化失败:', e);
    }
  }

  function register() {
    if (registered) return;
    registered = true;
    if (window.__enhance) {
      window.__enhance.register('landmarks', init, 40);
    } else {
      (window.__enhancePending = window.__enhancePending || []).push({ owner: 'landmarks', fn: init, priority: 40 });
    }
  }

  if (typeof GAME !== 'undefined' && GAME.ready) register();
  else {
    let tries = 0;
    (function check() {
      if (typeof GAME !== 'undefined' && GAME.ready) register();
      else if (tries++ < 400) setTimeout(check, 100);
      else { if (window.__enhance) window.__enhance.register('landmarks', init, 40); }
    })();
  }
})();