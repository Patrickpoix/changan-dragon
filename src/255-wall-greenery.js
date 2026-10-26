/* ============================================================
   城墙周边绿化
   在城墙内外添加树木和灌木
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initWallGreenery() {
    if (initialized) return;
    initialized = true;

    console.log('[WallGreenery] 开始城墙周边绿化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 南城墙外添加树木
      for (let x = -400; x <= 400; x += 40) {
        if (Math.abs(x) < 20) continue; // 明德门位置跳过
        
        // 城墙外树木
        const tree = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3.5, 6), MAT.wood);
        tree.position.set(x, 1.75, 410);
        tree.castShadow = true;
        scene.add(tree);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8, 6, 5), MAT.green || MAT.roofGlazed);
        crown.position.set(x, 4, 410);
        crown.castShadow = true;
        scene.add(crown);
      }
      
      // 北城墙外添加树木
      for (let x = -400; x <= 400; x += 40) {
        if (Math.abs(x) < 20) continue;
        
        const tree = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3.5, 6), MAT.wood);
        tree.position.set(x, 1.75, -410);
        tree.castShadow = true;
        scene.add(tree);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8, 6, 5), MAT.green || MAT.roofGlazed);
        crown.position.set(x, 4, -410);
        crown.castShadow = true;
        scene.add(crown);
      }
      
      console.log('[WallGreenery] 城墙周边绿化已添加');

      console.log('[WallGreenery] 城墙周边绿化完成！');

    } catch(e) {
      console.warn('[WallGreenery] 城墙周边绿化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initWallGreenery, 72000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
