/* ============================================================
   街道排水沟
   在朱雀大街两侧添加排水沟细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initStreetDrains() {
    if (initialized) return;
    initialized = true;

    console.log('[StreetDrains] 开始街道排水沟...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 朱雀大街两侧排水沟
      for (let z = -350; z <= 350; z += 5) {
        // 左侧排水沟
        const drainL = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.1, 5),
          MAT.stone
        );
        drainL.position.set(-8, 0.05, z);
        drainL.receiveShadow = true;
        scene.add(drainL);
        
        // 右侧排水沟
        const drainR = drainL.clone();
        drainR.position.x = 8;
        scene.add(drainR);
      }
      
      console.log('[StreetDrains] 朱雀大街排水沟已添加');

      console.log('[StreetDrains] 街道排水沟完成！');

    } catch(e) {
      console.warn('[StreetDrains] 街道排水沟失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initStreetDrains, 145000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
