/* ============================================================
   东西市周边绿化
   在东西市周围添加树木
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initMarketGreenery() {
    if (initialized) return;
    initialized = true;

    console.log('[MarketGreenery] 开始东西市周边绿化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 东市中心：(174, -14)
      // 东市周围添加树木
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 35;
        const x = 174 + Math.cos(angle) * radius;
        const z = -14 + Math.sin(angle) * radius;
        
        const tree = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 3.5, 6), MAT.wood);
        tree.position.set(x, 1.75, z);
        tree.castShadow = true;
        scene.add(tree);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8, 6, 5), MAT.green || MAT.roofGlazed);
        crown.position.set(x, 4, z);
        crown.castShadow = true;
        scene.add(crown);
      }
      
      // 西市中心：(-258, -14)
      // 西市周围添加树木
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 35;
        const x = -258 + Math.cos(angle) * radius;
        const z = -14 + Math.sin(angle) * radius;
        
        const tree = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 3.5, 6), MAT.wood);
        tree.position.set(x, 1.75, z);
        tree.castShadow = true;
        scene.add(tree);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8, 6, 5), MAT.green || MAT.roofGlazed);
        crown.position.set(x, 4, z);
        crown.castShadow = true;
        scene.add(crown);
      }
      
      console.log('[MarketGreenery] 东西市周边树木已添加（16棵）');

      console.log('[MarketGreenery] 东西市周边绿化完成！');

    } catch(e) {
      console.warn('[MarketGreenery] 东西市周边绿化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initMarketGreenery, 94000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
