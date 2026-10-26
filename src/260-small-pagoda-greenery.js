/* ============================================================
   小雁塔周边绿化
   在小雁塔周围添加更多树木
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initSmallPagodaGreenery() {
    if (initialized) return;
    initialized = true;

    console.log('[SmallPagodaGreenery] 开始小雁塔周边绿化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 小雁塔坐标：(-216, 349)
      // 在塔周围添加树木
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 15 + Math.random() * 8;
        const x = -216 + Math.cos(angle) * radius;
        const z = 349 + Math.sin(angle) * radius;
        
        const tree = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 3, 6), MAT.wood);
        tree.position.set(x, 1.5, z);
        tree.castShadow = true;
        scene.add(tree);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(1.5, 6, 5), MAT.green || MAT.roofGlazed);
        crown.position.set(x, 3.5, z);
        crown.castShadow = true;
        scene.add(crown);
      }
      
      console.log('[SmallPagodaGreenery] 小雁塔周边树木已添加（8棵）');

      console.log('[SmallPagodaGreenery] 小雁塔周边绿化完成！');

    } catch(e) {
      console.warn('[SmallPagodaGreenery] 小雁塔周边绿化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initSmallPagodaGreenery, 82000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
