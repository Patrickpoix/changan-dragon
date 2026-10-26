/* ============================================================
   街道灯笼补充
   在朱雀大街两侧补充更多灯笼
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initStreetLanternsExtra() {
    if (initialized) return;
    initialized = true;

    console.log('[StreetLanternsExtra] 开始街道灯笼补充...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 朱雀大街两侧灯笼
      for (let z = -300; z <= 300; z += 30) {
        // 左侧灯笼柱
        const poleL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 4, 6), MAT.wood);
        poleL.position.set(-12, 2, z);
        poleL.castShadow = true;
        scene.add(poleL);
        
        // 灯笼
        const lanternL = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), MAT.lantern || MAT.red);
        lanternL.position.set(-12, 4.2, z);
        lanternL.castShadow = true;
        scene.add(lanternL);
        
        // 右侧灯笼柱
        const poleR = poleL.clone();
        poleR.position.x = 12;
        scene.add(poleR);
        
        const lanternR = lanternL.clone();
        lanternR.position.x = 12;
        scene.add(lanternR);
      }
      
      console.log('[StreetLanternsExtra] 朱雀大街灯笼已补充');

      console.log('[StreetLanternsExtra] 街道灯笼补充完成！');

    } catch(e) {
      console.warn('[StreetLanternsExtra] 街道灯笼补充失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initStreetLanternsExtra, 147000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
