/* ============================================================
   NightLight - 夜景灯光Owner（增强版）
   全部使用共享几何体UNIT_CYL/UNIT_SPHERE和共享材质MAT
   与原系统昼夜系统联动：夜晚点亮，白天熄灭
   注意：不创建独立RAF循环，通过包装主循环updateDayNight钩子联动
   通过 __enhance.register 注册（优先级70，夜景最后加载）
   ============================================================ */

(function() {
  'use strict';

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

      // 朱雀大街灯笼（两侧各14组，数量适中）
      for (let i = 0; i < 14; i++) {
        const z = -280 + i * 38;
        addLantern(-10, z, 5);
        addLantern(10, z, 5);
      }

      // 大明宫宫殿灯光（12盏）
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 30 + Math.random() * 40;
        addLantern(150 + Math.cos(angle) * r, -432 + Math.sin(angle) * r, 4);
      }

      // 太极宫宫殿灯光（10盏）
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 25 + Math.random() * 35;
        addLantern(0 + Math.cos(angle) * r, -334 + Math.sin(angle) * r, 4);
      }

      // 东市夜市灯光（10盏）
      for (let i = 0; i < 10; i++) {
        const x = 150 + Math.random() * 50;
        const z = -30 + Math.random() * 30;
        addLantern(x, z, 3);
      }

      // 西市夜市灯光（10盏）
      for (let i = 0; i < 10; i++) {
        const x = -280 + Math.random() * 50;
        const z = -30 + Math.random() * 30;
        addLantern(x, z, 3);
      }

      // 大雁塔灯光（8盏环形）
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        addLantern(216 + Math.cos(angle) * 12, 283 + Math.sin(angle) * 12, 4);
      }

      // 小雁塔灯光（8盏环形）
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        addLantern(-216 + Math.cos(angle) * 12, 349 + Math.sin(angle) * 12, 4);
      }

      // 兴庆宫灯火（8盏）
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 30 + Math.random() * 40;
        addLantern(342 + Math.cos(angle) * r, -152 + Math.sin(angle) * r, 4);
      }

      // 曲江池夜游灯光（10盏环形）
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        addLantern(354 + Math.cos(angle) * 40, 318 + Math.sin(angle) * 40, 3.5);
      }

      // 明德门灯光（8盏）
      for (let i = 0; i < 8; i++) {
        const x = -18 + i * 5.2;
        addLantern(x, 380, 4);
      }

      // 添加点光源（与昼夜系统联动，白天强度0，夜晚增强）
      const lanternPositions = [
        { x: 0, z: 0, intensity: 0.6, distance: 80 },
        { x: 150, z: -432, intensity: 0.8, distance: 100 },
        { x: 0, z: -334, intensity: 0.7, distance: 90 },
        { x: 342, z: -152, intensity: 0.6, distance: 80 },
        { x: 354, z: 318, intensity: 0.5, distance: 70 },
        { x: 216, z: 283, intensity: 0.4, distance: 60 },
        { x: -216, z: 349, intensity: 0.4, distance: 60 },
        { x: 174, z: -14, intensity: 0.5, distance: 50 },
        { x: -258, z: -14, intensity: 0.5, distance: 50 },
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

      console.log('[NightLight] 夜景灯光增强完成 - 10组点光源(昼夜联动)+104盏灯笼(共享材质)，已整合到原系统主更新流程');
    } catch(e) { console.warn('[NightLight] 初始化失败:', e); }
  }

  function register() {
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