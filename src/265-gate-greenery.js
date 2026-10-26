/* ============================================================
   城门周边绿化
   在各城门口添加树木和装饰
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initGateGreenery() {
    if (initialized) return;
    initialized = true;

    console.log('[GateGreenery] 开始城门周边绿化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 明德门（南城墙中央，z=380，x=0）
      // 门前两侧添加树木
      for (let i = 0; i < 4; i++) {
        const x = -15 + i * 10;
        if (Math.abs(x) < 5) continue;
        
        const tree = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 4, 6), MAT.wood);
        tree.position.set(x, 2, 395);
        tree.castShadow = true;
        scene.add(tree);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(2, 6, 5), MAT.green || MAT.roofGlazed);
        crown.position.set(x, 5, 395);
        crown.castShadow = true;
        scene.add(crown);
      }
      
      console.log('[GateGreenery] 明德门前树木已添加');

      console.log('[GateGreenery] 城门周边绿化完成！');

    } catch(e) {
      console.warn('[GateGreenery] 城门周边绿化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initGateGreenery, 92000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
