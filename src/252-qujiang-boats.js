/* ============================================================
   曲江池游船增强
   在曲江池添加游船细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initQujiangBoats() {
    if (initialized) return;
    initialized = true;

    console.log('[QujiangBoats] 开始曲江池游船增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 曲江池中心：(354, 318)
      // 添加3艘游船
      const boatPositions = [
        { x: 340, z: 300, rot: 0.5 },
        { x: 370, z: 320, rot: -0.3 },
        { x: 350, z: 340, rot: 1.2 },
      ];
      
      boatPositions.forEach(boat => {
        // 船身
        const hull = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 1.5), MAT.wood);
        hull.position.set(boat.x, 0.2, boat.z);
        hull.rotation.y = boat.rot;
        hull.castShadow = true;
        scene.add(hull);
        
        // 船篷
        const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 1.3), MAT.roof);
        canopy.position.set(boat.x, 0.9, boat.z);
        canopy.rotation.y = boat.rot;
        canopy.castShadow = true;
        scene.add(canopy);
      });
      
      console.log('[QujiangBoats] 曲江池游船已添加（3艘）');

      console.log('[QujiangBoats] 曲江池游船增强完成！');

    } catch(e) {
      console.warn('[QujiangBoats] 曲江池游船增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initQujiangBoats, 66000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
