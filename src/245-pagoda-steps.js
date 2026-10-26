/* ============================================================
   大雁塔台阶增强
   在大雁塔前添加台阶细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initPagodaSteps() {
    if (initialized) return;
    initialized = true;

    console.log('[PagodaSteps] 开始大雁塔台阶增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 大雁塔坐标：(216, 283)
      // 塔前添加台阶
      for (let step = 0; step < 3; step++) {
        const stepH = 0.6;
        const stepY = step * stepH;
        const stepZ = 290 + step * 0.8;
        const stepMesh = new THREE.Mesh(
          new THREE.BoxGeometry(8, stepH, 0.8),
          MAT.stone
        );
        stepMesh.position.set(216, stepY, stepZ);
        stepMesh.receiveShadow = true;
        scene.add(stepMesh);
      }
      console.log('[PagodaSteps] 大雁塔前台阶已添加（3级）');

      console.log('[PagodaSteps] 大雁塔台阶增强完成！');

    } catch(e) {
      console.warn('[PagodaSteps] 大雁塔台阶增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initPagodaSteps, 52000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
