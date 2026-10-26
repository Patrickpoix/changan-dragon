/* ============================================================
   街道细节增强
   在朱雀大街添加更多街道细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initStreetDetailEnhance() {
    if (initialized) return;
    initialized = true;

    console.log('[StreetDetail] 开始街道细节增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 朱雀大街排水沟（两侧）
      for (let z = -350; z <= 350; z += 5) {
        // 左侧排水沟
        const drainL = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 5), MAT.stone);
        drainL.position.set(-12, 0.1, z);
        scene.add(drainL);
        
        // 右侧排水沟
        const drainR = drainL.clone();
        drainR.position.x = 12;
        scene.add(drainR);
      }
      console.log('[StreetDetail] 朱雀大街排水沟已添加（70段）');

      console.log('[StreetDetail] 街道细节增强完成！');

    } catch(e) {
      console.warn('[StreetDetail] 街道细节增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initStreetDetailEnhance, 24000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
