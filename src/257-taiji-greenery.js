/* ============================================================
   太极宫周边绿化
   在太极宫内添加更多树木
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initTaijiGreenery() {
    if (initialized) return;
    initialized = true;

    console.log('[TaijiGreenery] 开始太极宫周边绿化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 太极宫范围：(0, -334)附近
      // 在宫城内添加树木
      for (let i = 0; i < 15; i++) {
        const x = -50 + Math.random() * 100;
        const z = -380 + Math.random() * 80;
        
        const tree = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3.5, 6), MAT.wood);
        tree.position.set(x, 1.75, z);
        tree.castShadow = true;
        scene.add(tree);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8, 6, 5), MAT.green || MAT.roofGlazed);
        crown.position.set(x, 4, z);
        crown.castShadow = true;
        scene.add(crown);
      }
      
      console.log('[TaijiGreenery] 太极宫周边绿化已添加（15棵树）');

      console.log('[TaijiGreenery] 太极宫周边绿化完成！');

    } catch(e) {
      console.warn('[TaijiGreenery] 太极宫周边绿化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initTaijiGreenery, 76000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
