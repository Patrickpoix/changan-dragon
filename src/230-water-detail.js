/* ============================================================
   水面细节增强
   在原有水面基础上添加细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initWaterDetailEnhance() {
    if (initialized) return;
    initialized = true;

    console.log('[WaterDetail] 开始水面细节增强...');

    try {
      // 曲江池周边石头
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 曲江池中心：(354, 318)
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radiusX = 55 + Math.random() * 5;
        const radiusZ = 42 + Math.random() * 5;
        const x = 354 + Math.cos(angle) * radiusX;
        const z = 318 + Math.sin(angle) * radiusZ;
        
        // 岸边石头
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5), MAT.stone);
        rock.position.set(x, 0.2, z);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        rock.castShadow = true;
        scene.add(rock);
      }
      console.log('[WaterDetail] 曲江池岸边石头已添加（20块）');

      // 兴庆宫龙池周边石头
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 22 + Math.random() * 5;
        const x = 342 + Math.cos(angle) * radius;
        const z = -152 + Math.sin(angle) * radius * 0.7;
        
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.3), MAT.stone);
        rock.position.set(x, 0.15, z);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        rock.castShadow = true;
        scene.add(rock);
      }
      console.log('[WaterDetail] 兴庆宫龙池石头已添加（10块）');

      console.log('[WaterDetail] 水面细节增强完成！');

    } catch(e) {
      console.warn('[WaterDetail] 水面细节增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initWaterDetailEnhance, 22000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
