/* ============================================================
   NightLight - 夜景灯光Owner
   负责：夜晚灯笼/点光源/夜景氛围
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[NightLight] 初始化夜景灯光系统...');
    try {
      if (typeof scene === 'undefined') return;

      // 朱雀大街灯笼点光源
      for (let z = -300; z <= 300; z += 60) {
        const light = new THREE.PointLight(0xffaa44, 0.5, 20);
        light.position.set(0, 5, z);
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
