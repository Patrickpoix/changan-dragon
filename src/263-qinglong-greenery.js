/* ============================================================
   青龙寺周边绿化
   在青龙寺周围添加树木
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initQinglongGreenery() {
    if (initialized) return;
    initialized = true;

    console.log('[QinglongGreenery] 开始青龙寺周边绿化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 青龙寺塔坐标：(300, 100)
      // 在塔周围添加松树
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 15;
        const x = 300 + Math.cos(angle) * radius;
        const z = 100 + Math.sin(angle) * radius;
        
        // 松树
        const pine = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4, 6), MAT.green || MAT.roofGlazed);
        pine.position.set(x, 2, z);
        pine.castShadow = true;
        scene.add(pine);
      }
      
      console.log('[QinglongGreenery] 青龙寺周边松树已添加（8棵）');

      console.log('[QinglongGreenery] 青龙寺周边绿化完成！');

    } catch(e) {
      console.warn('[QinglongGreenery] 青龙寺周边绿化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initQinglongGreenery, 88000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
