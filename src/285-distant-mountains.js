/* ============================================================
   天空远山优化
   在长安城远处添加山峦轮廓
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initDistantMountains() {
    if (initialized) return;
    initialized = true;

    console.log('[DistantMountains] 开始天空远山优化...');

    try {
      if (typeof scene === 'undefined') return;
      
      // 远处北山（秦岭）
      const mountainMat = new THREE.MeshStandardMaterial({ 
        color: 0x6a7a8a, 
        roughness: 1, 
        metalness: 0,
        fog: true
      });
      
      for (let i = 0; i < 8; i++) {
        const x = -500 + i * 150;
        const z = -600 - Math.random() * 100;
        const height = 50 + Math.random() * 80;
        
        const mountain = new THREE.Mesh(
          new THREE.ConeGeometry(100 + Math.random() * 50, height, 5),
          mountainMat
        );
        mountain.position.set(x, height/2, z);
        scene.add(mountain);
      }
      
      console.log('[DistantMountains] 远处山峦已添加（8座）');

      console.log('[DistantMountains] 天空远山优化完成！');

    } catch(e) {
      console.warn('[DistantMountains] 天空远山优化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initDistantMountains, 174000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
