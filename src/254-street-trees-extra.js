/* ============================================================
   街道行道树补充
   在主要街道两侧补充行道树
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initStreetTreesExtra() {
    if (initialized) return;
    initialized = true;

    console.log('[StreetTreesExtra] 开始街道行道树补充...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 朱雀大街两侧补充行道树
      for (let z = -350; z <= 350; z += 20) {
        // 左侧树
        const treeL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 4, 6), MAT.wood);
        treeL.position.set(-15, 2, z);
        treeL.castShadow = true;
        scene.add(treeL);
        const crownL = new THREE.Mesh(new THREE.SphereGeometry(2, 6, 5), MAT.green || MAT.roofGlazed);
        crownL.position.set(-15, 5, z);
        crownL.castShadow = true;
        scene.add(crownL);
        
        // 右侧树
        const treeR = treeL.clone();
        treeR.position.x = 15;
        scene.add(treeR);
        const crownR = crownL.clone();
        crownR.position.x = 15;
        scene.add(crownR);
      }
      
      console.log('[StreetTreesExtra] 朱雀大街行道树已补充');

      console.log('[StreetTreesExtra] 街道行道树补充完成！');

    } catch(e) {
      console.warn('[StreetTreesExtra] 街道行道树补充失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initStreetTreesExtra, 70000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
