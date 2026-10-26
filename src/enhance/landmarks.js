/* ============================================================
   Landmarks - 地标精修Owner（v3.1）
   原系统已包含：城墙四角角楼+批量垛口（addCityWalls）、addHall自带台阶、
   朱雀大街四座彩绘牌楼、明德门/丹凤门等门楼、东西市门匾额、塔前字牌。
   本模块只补充原系统缺失的：东西市牌坊（文化题额）+两塔石碑（刻名）。
   装饰物使用局部Batch（不调用共享B.build避免重复instance），
   匾额用原系统addSignMesh文字系统（独立纹理，GAME.ready后安全）。
   通过 __enhance.register 注册（优先级40）
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

  // 东西市牌坊（市场内中轴线装饰，两柱间可通行，文化题额汉字）
  function addPaifang(x, z, title) {
    if (typeof MAT === 'undefined' || typeof Batch === 'undefined') return;
    const pillars = new Batch(UNIT_CYL, MAT.stone, { cast: true });
    pillars.add(x - 5, 3.5, z, 0.5, 7, 0.5);
    pillars.add(x + 5, 3.5, z, 0.5, 7, 0.5);
    pillars.build();
    const beams = new Batch(UNIT_BOX, MAT.wood, { cast: true });
    beams.add(x, 6, z, 12, 0.6, 0.6);          // 主梁
    beams.add(x, 6.8, z, 4, 1, 0.3);            // 匾额底
    beams.build();
    const roofs = new Batch(ROOF_SMALL, MAT.roof, { cast: true });
    roofs.add(x, 8, z, 14, 1.5, 2.5);
    roofs.build();
    // 真实汉字题额（朝向街道；避免与市门匾额同名重复）
    if (typeof addSignMesh === 'function') {
      addSignMesh(title, x, 6.9, z, 0, 4.4, 1.1, { font: 52 });
    }
    registerCollider(x - 5, z, 1.2, 1.2, 'paifang-pillar');
    registerCollider(x + 5, z, 1.2, 1.2, 'paifang-pillar');
    registerFlight(x, z, 14, 3, 9);
  }

  // 塔前石碑（原系统无，新物理物体，碑面刻名）
  function addStoneTablet(x, z, text) {
    if (typeof MAT === 'undefined' || typeof Batch === 'undefined') return;
    const tablets = new Batch(UNIT_BOX, MAT.stone, { cast: true });
    tablets.add(x, 0.5, z, 2, 1, 1);             // 基座
    tablets.add(x, 2, z, 1.5, 3, 0.3);           // 碑身
    tablets.build();
    if (typeof addSignMesh === 'function') {
      addSignMesh(text, x, 2, z + 0.35, 0, 1.5, 0.42, { font: 42 });
    }
    registerCollider(x, z, 2.2, 1.4, 'stone-tablet');
  }

  function init() {
    console.log('[Landmarks] 地标精修初始化...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 东市 / 西市牌坊（市场内中轴线，文化题额）
      addPaifang(174, -4, '四方珍奇');
      addPaifang(-258, -4, '西域风物');

      // 大雁塔 / 小雁塔 塔前石碑（刻名）
      addStoneTablet(216, 298, '大雁塔');
      addStoneTablet(-216, 364, '小雁塔');

      console.log('[Landmarks] 地标精修完成 - 2东西市牌坊(题额汉字)+2塔前石碑(刻名)，局部Batch+addSignMesh，碰撞/飞行障碍已注册；不重复创建角楼/垛口/台阶');
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