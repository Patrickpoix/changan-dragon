/* ============================================================
   龙池岸线石头
   在龙池岸边添加石头细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initLongchiRocks() {
    if (initialized) return;
    initialized = true;

    console.log('[LongchiRocks] 开始龙池岸线石头...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 龙池中心：(342, -152)
      // 池边添加石头
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 28 + Math.random() * 3;
        const x = 342 + Math.cos(angle) * radius;
        const z = -152 + Math.sin(angle) * radius;
        const scale = 0.2 + Math.random() * 0.4;
        
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
      
      console.log('[LongchiRocks] 龙池岸线石头已添加（20块）');

      console.log('[LongchiRocks] 龙池岸线石头完成！');

    } catch(e) {
      console.warn('[LongchiRocks] 龙池岸线石头失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initLongchiRocks, 154000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
