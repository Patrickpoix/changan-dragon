/* ============================================================
   大明宫周边绿化
   在大明宫内添加更多树木和花园
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initDamingGreenery() {
    if (initialized) return;
    initialized = true;

    console.log('[DamingGreenery] 开始大明宫周边绿化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 大明宫范围：(150, -432)附近
      // 在宫城内添加树木
      for (let i = 0; i < 20; i++) {
        const x = 80 + Math.random() * 140;
        const z = -480 + Math.random() * 100;
        
        const tree = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 4, 6), MAT.wood);
        tree.position.set(x, 2, z);
        tree.castShadow = true;
        scene.add(tree);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(2, 6, 5), MAT.green || MAT.roofGlazed);
        crown.position.set(x, 5, z);
        crown.castShadow = true;
        scene.add(crown);
      }
      
      console.log('[DamingGreenery] 大明宫周边绿化已添加（20棵树）');

      console.log('[DamingGreenery] 大明宫周边绿化完成！');

    } catch(e) {
      console.warn('[DamingGreenery] 大明宫周边绿化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initDamingGreenery, 74000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
