/* ============================================================
   曲江池周边绿化
   在曲江池周围添加更多柳树和花卉
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initQujiangGreenery() {
    if (initialized) return;
    initialized = true;

    console.log('[QujiangGreenery] 开始曲江池周边绿化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 曲江池中心：(354, 318)
      // 在池边添加柳树
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 45;
        const x = 354 + Math.cos(angle) * radius;
        const z = 318 + Math.sin(angle) * radius;
        
        // 柳树（细长树干+垂枝）
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 5, 6), MAT.wood);
        trunk.position.set(x, 2.5, z);
        trunk.castShadow = true;
        scene.add(trunk);
        
        // 柳枝（球形树冠偏下垂）
        const crown = new THREE.Mesh(new THREE.SphereGeometry(2.5, 6, 5), MAT.green || MAT.roofGlazed);
        crown.position.set(x, 5, z);
        crown.scale.y = 0.7;
        crown.castShadow = true;
        scene.add(crown);
      }
      
      console.log('[QujiangGreenery] 曲江池周边柳树已添加（12棵）');

      console.log('[QujiangGreenery] 曲江池周边绿化完成！');

    } catch(e) {
      console.warn('[QujiangGreenery] 曲江池周边绿化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initQujiangGreenery, 84000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
