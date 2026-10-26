/* ============================================================
   龙池周边绿化
   在龙池周围添加柳树和花卉
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initLongchiGreenery() {
    if (initialized) return;
    initialized = true;

    console.log('[LongchiGreenery] 开始龙池周边绿化...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 龙池中心：(342, -152)
      // 在池边添加柳树
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 30;
        const x = 342 + Math.cos(angle) * radius;
        const z = -152 + Math.sin(angle) * radius;
        
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 4, 6), MAT.wood);
        trunk.position.set(x, 2, z);
        trunk.castShadow = true;
        scene.add(trunk);
        
        const crown = new THREE.Mesh(new THREE.SphereGeometry(2, 6, 5), MAT.green || MAT.roofGlazed);
        crown.position.set(x, 4.5, z);
        crown.scale.y = 0.7;
        crown.castShadow = true;
        scene.add(crown);
      }
      
      console.log('[LongchiGreenery] 龙池周边柳树已添加（8棵）');

      console.log('[LongchiGreenery] 龙池周边绿化完成！');

    } catch(e) {
      console.warn('[LongchiGreenery] 龙池周边绿化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initLongchiGreenery, 86000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
