/* ============================================================
   大雁塔周边绿化
   在大雁塔周围添加更多树木
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initPagodaGreenery() {
    if (initialized) return;
    initialized = true;

    console.log('[PagodaGreenery] 开始大雁塔周边绿化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 大雁塔坐标：(216, 283)
      // 在塔周围添加松树
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const radius = 20 + Math.random() * 10;
        const x = 216 + Math.cos(angle) * radius;
        const z = 283 + Math.sin(angle) * radius;
        
        // 松树（锥形）
        const pine = new THREE.Mesh(new THREE.ConeGeometry(1.5, 5, 6), MAT.green || MAT.roofGlazed);
        pine.position.set(x, 2.5, z);
        pine.castShadow = true;
        scene.add(pine);
        
        // 树干
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6), MAT.wood);
        trunk.position.set(x, 0.75, z);
        trunk.castShadow = true;
        scene.add(trunk);
      }
      
      console.log('[PagodaGreenery] 大雁塔周边松树已添加（10棵）');

      console.log('[PagodaGreenery] 大雁塔周边绿化完成！');

    } catch(e) {
      console.warn('[PagodaGreenery] 大雁塔周边绿化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initPagodaGreenery, 80000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
