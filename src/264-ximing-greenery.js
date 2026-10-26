/* ============================================================
   西明寺周边绿化
   在西明寺周围添加树木
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initXimingGreenery() {
    if (initialized) return;
    initialized = true;

    console.log('[XimingGreenery] 开始西明寺周边绿化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 西明寺塔坐标：(-300, 150)
      // 在塔周围添加树木
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 12;
        const x = -300 + Math.cos(angle) * radius;
        const z = 150 + Math.sin(angle) * radius;
        
        const tree = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 3, 6), MAT.wood);
        tree.position.set(x, 1.5, z);
        tree.castShadow = true;
        scene.add(tree);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(1.5, 6, 5), MAT.green || MAT.roofGlazed);
        crown.position.set(x, 3.5, z);
        crown.castShadow = true;
        scene.add(crown);
      }
      
      console.log('[XimingGreenery] 西明寺周边树木已添加（6棵）');

      console.log('[XimingGreenery] 西明寺周边绿化完成！');

    } catch(e) {
      console.warn('[XimingGreenery] 西明寺周边绿化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initXimingGreenery, 90000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
