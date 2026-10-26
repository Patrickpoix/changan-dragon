/* ============================================================
   曲江池岸线石头
   在曲江池岸边添加石头细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initQujiangRocks() {
    if (initialized) return;
    initialized = true;

    console.log('[QujiangRocks] 开始曲江池岸线石头...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 曲江池中心：(354, 318)
      // 池边添加石头
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const radius = 42 + Math.random() * 5;
        const x = 354 + Math.cos(angle) * radius;
        const z = 318 + Math.sin(angle) * radius;
        const scale = 0.3 + Math.random() * 0.5;
        
        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(scale, 0),
          MAT.stone
        );
        rock.position.set(x, scale * 0.5, z);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
      }
      
      console.log('[QujiangRocks] 曲江池岸线石头已添加（30块）');

      console.log('[QujiangRocks] 曲江池岸线石头完成！');

    } catch(e) {
      console.warn('[QujiangRocks] 曲江池岸线石头失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initQujiangRocks, 152000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
