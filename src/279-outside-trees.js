/* ============================================================
   城外树林
   在长安城外围添加树林细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initOutsideTrees() {
    if (initialized) return;
    initialized = true;

    console.log('[OutsideTrees] 开始城外树林...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 城外东南方向树林
      for (let i = 0; i < 30; i++) {
        const x = 450 + Math.random() * 100;
        const z = 350 + Math.random() * 100;
        
        // 树干
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.3, 3, 5),
          MAT.wood
        );
        trunk.position.set(x, 1.5, z);
        trunk.castShadow = true;
        scene.add(trunk);
        
        // 树冠
        const leaves = new THREE.Mesh(
          new THREE.SphereGeometry(2, 6, 5),
          new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.9 })
        );
        leaves.position.set(x, 4, z);
        leaves.castShadow = true;
        scene.add(leaves);
      }
      
      console.log('[OutsideTrees] 城外树林已添加（30棵）');

      console.log('[OutsideTrees] 城外树林完成！');

    } catch(e) {
      console.warn('[OutsideTrees] 城外树林失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initOutsideTrees, 162000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
