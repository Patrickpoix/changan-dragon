/* ============================================================
   NightLight - 夜景灯光Owner（增强版 v2）
   重要：原系统（10-world.js / 12-landmarks.js）已包含：
   - 朱雀大街灯柱灯笼（x=±12.1）与横街灯串
   - 东西市灯笼串、含元殿檐下灯笼、曲江商铺灯笼
   因此本模块 v2 只补充原系统缺少区域的灯笼与点光源：
   宫殿/塔寺/明德门周边补充（避免与已有灯柱重叠）。
   不创建独立RAF循环，通过包装主循环updateDayNight钩子联动。
   通过 __enhance.register 注册（优先级70）
   ============================================================ */

(function() {
  'use strict';

  let registered = false;
  let pointLights = [];
  let wrapped = false;

  function addLantern(x, z, height) {
    if (typeof MAT === 'undefined') return;
    const pole = new THREE.Mesh(UNIT_CYL, MAT.wood);
    pole.position.set(x, (height || 4) / 2, z);
    pole.scale.set(0.2, height || 4, 0.2);
    scene.add(pole);
    const lantern = new THREE.Mesh(UNIT_SPHERE, MAT.lanternGlow || MAT.lantern);
    lantern.position.set(x, (height || 4) + 0.5, z);
    lantern.scale.set(0.6, 0.8, 0.6);
    scene.add(lantern);
  }

  function init() {
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 大明宫宫殿周边灯光（12盏）
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 34 + Math.random() * 40;
        addLantern(150 + Math.cos(angle) * r, -432 + Math.sin(angle) * r, 4);
      }

      // 太极宫宫殿周边灯光（10盏）
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 30 + Math.random() * 35;
        addLantern(0 + Math.cos(angle) * r, -334 + Math.sin(angle) * r, 4);
      }

      // 兴庆宫灯火（8盏，龙池岸边）
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 34 + Math.random() * 30;
        addLantern(342 + Math.cos(angle) * r, -152 + Math.sin(angle) * r, 4);
      }

      // 大雁塔灯光（8盏环形，塔院外）
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        addLantern(216 + Math.cos(angle) * 16, 283 + Math.sin(angle) * 16, 4);
      }

      // 小雁塔灯光（8盏环形）
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        addLantern(-216 + Math.cos(angle) * 14, 349 + Math.sin(angle) * 14, 4);
      }

      // 曲江池夜游灯光（10盏环形，湖岸）
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        addLantern(354 + Math.cos(angle) * 46, 318 + Math.sin(angle) * 38, 3.5);
      }

      // 明德门灯光（8盏，门洞外御道两侧）
      for (let i = 0; i < 8; i++) {
        const x = -16 + i * 4.6;
        addLantern(x, 384, 4);
      }

      // 点光源（与昼夜系统联动，白天强度0，夜晚增强）
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

      // 注册到原系统更新循环：包装主循环updateDayNight钩子（不创建独立RAF）
      if (!wrapped && typeof window !== 'undefined') {
        wrapped = true;
        window.__nightLights = pointLights;
        const origUpdate = window.updateDayNight;
        if (typeof origUpdate === 'function') {
          window.updateDayNight = function(...args) {
            origUpdate.apply(this, args);
            const nightFactor = typeof GAME !== 'undefined' && GAME.nightT !== undefined ? GAME.nightT : 0;
            pointLights.forEach(light => {
              light.intensity = light.userData.baseIntensity * nightFactor;
            });
          };
        }
      }

      console.log('[NightLight] 夜景灯光增强完成 - 7组点光源(昼夜联动)+64盏补充灯笼(避开原系统灯柱/灯笼串)，已整合到原系统主更新流程');
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