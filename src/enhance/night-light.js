/* ============================================================
   NightLight - 夜景灯光Owner
   负责：夜晚灯笼/点光源/夜景氛围
   ============================================================ */

(function() {
  'use strict';

  // 灯光配置 - 集中管理
  const LIGHT_CONFIG = {
    mainStreet: { count: 11, zStart: -300, zEnd: 300, intensity: 0.5, distance: 20 },
    daming: { count: 4, x: 150, z: -432, intensity: 0.8, distance: 30 },
    eastMarket: { count: 3, x: 174, z: -14, intensity: 0.6, distance: 25 },
    westMarket: { count: 3, x: -258, z: -14, intensity: 0.6, distance: 25 },
    qujiang: { count: 2, x: 354, z: 318, intensity: 0.4, distance: 20 },
  };

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[NightLight] 初始化夜景灯光系统...');
    try {
      if (typeof scene === 'undefined') return;

      // 朱雀大街灯笼点光源
      const mainCfg = LIGHT_CONFIG.mainStreet;
      const step = (mainCfg.zEnd - mainCfg.zStart) / (mainCfg.count - 1);
      for (let i = 0; i < mainCfg.count; i++) {
        const light = new THREE.PointLight(0xffaa44, mainCfg.intensity, mainCfg.distance);
        light.position.set(0, 5, mainCfg.zStart + i * step);
        scene.add(light);
      }

      // 大明宫灯光
      for (let i = 0; i < LIGHT_CONFIG.daming.count; i++) {
        const angle = (i / LIGHT_CONFIG.daming.count) * Math.PI * 2;
        const light = new THREE.PointLight(0xffcc66, LIGHT_CONFIG.daming.intensity, LIGHT_CONFIG.daming.distance);
        light.position.set(
          LIGHT_CONFIG.daming.x + Math.cos(angle) * 20,
          8,
          LIGHT_CONFIG.daming.z + Math.sin(angle) * 20
        );
        scene.add(light);
      }

      // 东市灯光
      for (let i = 0; i < LIGHT_CONFIG.eastMarket.count; i++) {
        const light = new THREE.PointLight(0xffaa44, LIGHT_CONFIG.eastMarket.intensity, LIGHT_CONFIG.eastMarket.distance);
        light.position.set(
          LIGHT_CONFIG.eastMarket.x + (i - 1) * 15,
          4,
          LIGHT_CONFIG.eastMarket.z
        );
        scene.add(light);
      }

      // 西市灯光
      for (let i = 0; i < LIGHT_CONFIG.westMarket.count; i++) {
        const light = new THREE.PointLight(0xffaa44, LIGHT_CONFIG.westMarket.intensity, LIGHT_CONFIG.westMarket.distance);
        light.position.set(
          LIGHT_CONFIG.westMarket.x + (i - 1) * 15,
          4,
          LIGHT_CONFIG.westMarket.z
        );
        scene.add(light);
      }

      console.log('[NightLight] 夜景灯光系统初始化完成');
    } catch(e) { console.warn('[NightLight] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 18000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();
