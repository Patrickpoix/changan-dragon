/* ============================================================
   小雁塔台阶增强
   在小雁塔前添加台阶细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initSmallPagodaSteps() {
    if (initialized) return;
    initialized = true;

    console.log('[SmallPagodaSteps] 开始小雁塔台阶增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 小雁塔坐标：(-216, 349)
      // 塔前添加台阶
      for (let step = 0; step < 3; step++) {
        const stepH = 0.5;
        const stepY = step * stepH;
        const stepZ = 355 + step * 0.7;
        const stepMesh = new THREE.Mesh(
          new THREE.BoxGeometry(6, stepH, 0.7),
          MAT.stone
        );
        stepMesh.position.set(-216, stepY, stepZ);
        stepMesh.receiveShadow = true;
        scene.add(stepMesh);
      }
      console.log('[SmallPagodaSteps] 小雁塔前台阶已添加（3级）');

      console.log('[SmallPagodaSteps] 小雁塔台阶增强完成！');

    } catch(e) {
      console.warn('[SmallPagodaSteps] 小雁塔台阶增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initSmallPagodaSteps, 54000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
