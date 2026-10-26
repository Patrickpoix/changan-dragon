/* ============================================================
   NightLight - 夜景灯光Owner（v3）
   原系统已有朱雀大街灯柱/横街灯串/市场灯笼串/含元殿檐下灯笼。
   本模块只补充原系统缺少区域的灯笼与点光源（宫殿/塔寺/明德门周边），
   灯笼使用局部Batch（杆/球各1个InstancedMesh，64盏→2 drawcall），
   点光源包装主循环window.updateDayNight钩子昼夜联动（不创建独立RAF）。
   通过 __enhance.register 注册（优先级70）
   ============================================================ */

(function() {
  'use strict';

  let registered = false;
  let pointLights = [];
  let wrapped = false;

  function init() {
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined' || typeof Batch === 'undefined') return;

      const positions = [];

      // 大明宫周边（12）
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2, r = 34 + Math.random() * 40;
        positions.push([150 + Math.cos(angle) * r, -432 + Math.sin(angle) * r, 4]);
      }
      // 太极宫周边（10）
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2, r = 30 + Math.random() * 35;
        positions.push([0 + Math.cos(angle) * r, -334 + Math.sin(angle) * r, 4]);
      }
      // 兴庆宫（8）
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2, r = 34 + Math.random() * 30;
        positions.push([342 + Math.cos(angle) * r, -152 + Math.sin(angle) * r, 4]);
      }
      // 大雁塔（8环形）
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        positions.push([216 + Math.cos(angle) * 16, 283 + Math.sin(angle) * 16, 4]);
      }
      // 小雁塔（8环形）
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        positions.push([-216 + Math.cos(angle) * 14, 349 + Math.sin(angle) * 14, 4]);
      }
      // 曲江池（10环形湖岸）
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        positions.push([354 + Math.cos(angle) * 46, 318 + Math.sin(angle) * 38, 3.5]);
      }
      // 明德门（8，御道两侧）
      for (let i = 0; i < 8; i++) positions.push([-16 + i * 4.6, 384, 4]);

      // 灯笼局部Batch：杆 + 灯球（64盏 → 2个InstancedMesh）
      const poles = new Batch(UNIT_CYL, MAT.wood, { cast: true });
      const lanterns = new Batch(UNIT_SPHERE, MAT.lanternGlow || MAT.lantern, { cast: false });
      positions.forEach(p => {
        const h = p[2];
        poles.add(p[0], h / 2, p[1], 0.2, h, 0.2);
        lanterns.add(p[0], h + 0.5, p[1], 0.6, 0.8, 0.6);
      });
      poles.build();
      lanterns.build();

      // 点光源（昼夜联动：白天0，夜晚增强）
      const lanternPositions = [
        { x: 150, z: -432, intensity: 0.8, distance: 100 },
        { x: 0, z: -334, intensity: 0.7, distance: 90 },
        { x: 342, z: -152, intensity: 0.6, distance: 80 },
        { x: 354, z: 318, intensity: 0.5, distance: 70 },
        { x: 216, z: 283, intensity: 0.4, distance: 60 },
        { x: -216, z: 349, intensity: 0.4, distance: 60 },
        { x: 0, z: 380, intensity: 0.6, distance: 60 },
      ];
      lanternPositions.forEach(pos => {
        const light = new THREE.PointLight(0xffc97a, 0, pos.distance, 2);
        light.position.set(pos.x, 8, pos.z);
        light.userData.baseIntensity = pos.intensity;
        pointLights.push(light);
        scene.add(light);
      });

      // 包装主循环updateDayNight钩子（全局function声明挂window，主循环调用即生效）
      if (!wrapped && typeof window !== 'undefined') {
        wrapped = true;
        window.__nightLights = pointLights;
        const origUpdate = window.updateDayNight;
        if (typeof origUpdate === 'function') {
          window.updateDayNight = function(...args) {
            origUpdate.apply(this, args);
            const nightFactor = typeof GAME !== 'undefined' && GAME.nightT !== undefined ? GAME.nightT : 0;
            pointLights.forEach(light => { light.intensity = light.userData.baseIntensity * nightFactor; });
          };
        }
      }

      console.log('[NightLight] 夜景灯光增强完成 - 64盏灯笼(局部Batch 2 drawcall)+7组点光源(昼夜联动)，已整合到原系统主更新流程');
    } catch(e) { console.warn('[NightLight] 初始化失败:', e); }
  }

  function register() {
    if (registered) return;
    registered = true;
    if (window.__enhance) {
      window.__enhance.register('night-light', init, 70);
    } else {
      (window.__enhancePending = window.__enhancePending || []).push({ owner: 'night-light', fn: init, priority: 70 });
    }
  }

  if (typeof GAME !== 'undefined' && GAME.ready) register();
  else {
    let tries = 0;
    (function check() {
      if (typeof GAME !== 'undefined' && GAME.ready) register();
      else if (tries++ < 400) setTimeout(check, 100);
      else { if (window.__enhance) window.__enhance.register('night-light', init, 70); }
    })();
  }
})();