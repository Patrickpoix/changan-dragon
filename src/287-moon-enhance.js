/* ============================================================
   月亮优化
   增强夜晚的月亮效果
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initMoonEnhance() {
    if (initialized) return;
    initialized = true;

    console.log('[MoonEnhance] 开始月亮优化...');

    try {
      if (typeof scene === 'undefined') return;
      
      // 添加月亮
      const moon = new THREE.Mesh(
        new THREE.SphereGeometry(15, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xfff8e0, fog: false })
      );
      moon.position.set(-200, 150, -300);
      scene.add(moon);
      
      // 月亮光晕
      const moonGlow = new THREE.Mesh(
        new THREE.SphereGeometry(25, 16, 16),
        new THREE.MeshBasicMaterial({ 
          color: 0xfff8e0, 
          transparent: true, 
          opacity: 0.2,
          fog: false
        })
      );
      moonGlow.position.copy(moon.position);
      scene.add(moonGlow);
      
      console.log('[MoonEnhance] 月亮及光晕已添加');

      console.log('[MoonEnhance] 月亮优化完成！');

    } catch(e) {
      console.warn('[MoonEnhance] 月亮优化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initMoonEnhance, 178000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
