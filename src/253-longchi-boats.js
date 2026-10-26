/* ============================================================
   兴庆宫龙池游船增强
   在龙池添加游船细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initLongchiBoats() {
    if (initialized) return;
    initialized = true;

    console.log('[LongchiBoats] 开始龙池游船增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 龙池中心：(342, -152)
      // 添加2艘游船
      const boatPositions = [
        { x: 335, z: -160, rot: 0.8 },
        { x: 350, z: -145, rot: -0.5 },
      ];
      
      boatPositions.forEach(boat => {
        // 船身
        const hull = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 1.2), MAT.wood);
        hull.position.set(boat.x, 0.2, boat.z);
        hull.rotation.y = boat.rot;
        hull.castShadow = true;
        scene.add(hull);
      });
      
      console.log('[LongchiBoats] 龙池游船已添加（2艘）');

      console.log('[LongchiBoats] 龙池游船增强完成！');

    } catch(e) {
      console.warn('[LongchiBoats] 龙池游船增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initLongchiBoats, 68000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
