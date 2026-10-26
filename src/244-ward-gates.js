/* ============================================================
   坊门细节增强
   在主要坊区入口添加坊门细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initWardGates() {
    if (initialized) return;
    initialized = true;

    console.log('[WardGates] 开始坊门细节增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 在朱雀大街两侧主要坊区入口添加坊门
      // 朱雀大街：x=0，贯穿南北
      // 在几个主要位置添加坊门
      const gatePositions = [
        { z: -200, name: '务本坊' },
        { z: -100, name: '崇义坊' },
        { z: 0, name: '永乐坊' },
        { z: 100, name: '隆庆坊' },
        { z: 200, name: '升道坊' },
      ];
      
      gatePositions.forEach(gate => {
        // 左侧坊门柱
        const pillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 6, 8), MAT.wood);
        pillarL.position.set(-30, 3, gate.z);
        pillarL.castShadow = true;
        scene.add(pillarL);
        
        // 右侧坊门柱
        const pillarR = pillarL.clone();
        pillarR.position.x = 30;
        scene.add(pillarR);
        
        // 坊门横梁
        const beam = new THREE.Mesh(new THREE.BoxGeometry(60, 0.5, 0.5), MAT.wood);
        beam.position.set(0, 5.5, gate.z);
        beam.castShadow = true;
        scene.add(beam);
      });
      
      console.log('[WardGates] 主要坊门已添加（5处）');

      console.log('[WardGates] 坊门细节增强完成！');

    } catch(e) {
      console.warn('[WardGates] 坊门细节增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initWardGates, 50000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
