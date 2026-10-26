/* ============================================================
   夜景灯光增强
   增强夜晚的灯笼和建筑灯光效果
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initNightLightEnhance() {
    if (initialized) return;
    initialized = true;

    console.log('[NightLightEnhance] 开始夜景灯光增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 添加点光源到朱雀大街灯笼
      for (let z = -300; z <= 300; z += 60) {
        const light = new THREE.PointLight(0xffaa44, 0.5, 20);
        light.position.set(0, 5, z);
        scene.add(light);
      }
      
      console.log('[NightLightEnhance] 夜景灯光已增强');

      console.log('[NightLightEnhance] 夜景灯光增强完成！');

    } catch(e) {
      console.warn('[NightLightEnhance] 夜景灯光增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initNightLightEnhance, 164000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
