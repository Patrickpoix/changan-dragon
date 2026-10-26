/* ============================================================
   天空云朵优化
   在天空中添加云朵
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initSkyClouds() {
    if (initialized) return;
    initialized = true;

    console.log('[SkyClouds] 开始天空云朵优化...');

    try {
      if (typeof scene === 'undefined') return;
      
      const cloudMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 1, 
        metalness: 0,
        transparent: true,
        opacity: 0.8,
        fog: false
      });
      
      for (let i = 0; i < 10; i++) {
        const cloud = new THREE.Mesh(
          new THREE.SphereGeometry(10 + Math.random() * 15, 6, 5),
          cloudMat
        );
        cloud.position.set(
          -400 + Math.random() * 800,
          80 + Math.random() * 40,
          -400 + Math.random() * 800
        );
        cloud.scale.y = 0.3;
        scene.add(cloud);
      }
      
      console.log('[SkyClouds] 天空云朵已添加（10朵）');

      console.log('[SkyClouds] 天空云朵优化完成！');

    } catch(e) {
      console.warn('[SkyClouds] 天空云朵优化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initSkyClouds, 176000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
