/* ============================================================
   兴庆宫周边绿化
   在兴庆宫内添加更多树木
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initXingqingGreenery() {
    if (initialized) return;
    initialized = true;

    console.log('[XingqingGreenery] 开始兴庆宫周边绿化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 兴庆宫范围：(342, -152)附近
      // 在宫内添加树木
      for (let i = 0; i < 12; i++) {
        const x = 300 + Math.random() * 100;
        const z = -180 + Math.random() * 60;
        
        const tree = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3.5, 6), MAT.wood);
        tree.position.set(x, 1.75, z);
        tree.castShadow = true;
        scene.add(tree);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8, 6, 5), MAT.green || MAT.roofGlazed);
        crown.position.set(x, 4, z);
        crown.castShadow = true;
        scene.add(crown);
      }
      
      console.log('[XingqingGreenery] 兴庆宫周边绿化已添加（12棵树）');

      console.log('[XingqingGreenery] 兴庆宫周边绿化完成！');

    } catch(e) {
      console.warn('[XingqingGreenery] 兴庆宫周边绿化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initXingqingGreenery, 78000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
