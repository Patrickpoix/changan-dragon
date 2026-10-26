/* ============================================================
   太极宫细节增强
   在太极宫添加更多细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initTaijiDetails() {
    if (initialized) return;
    initialized = true;

    console.log('[TaijiDetails] 开始太极宫细节增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 太极殿前台阶
      // 太极殿坐标：(0, -334)，台基高约5
      for (let step = 0; step < 5; step++) {
        const stepH = 1;
        const stepY = step * stepH;
        const stepZ = -322 - step * 1;
        const stepMesh = new THREE.Mesh(
          new THREE.BoxGeometry(12, stepH, 1),
          MAT.stone
        );
        stepMesh.position.set(0, stepY, stepZ);
        stepMesh.receiveShadow = true;
        scene.add(stepMesh);
      }
      console.log('[TaijiDetails] 太极殿前台阶已添加（5级）');

      console.log('[TaijiDetails] 太极宫细节增强完成！');

    } catch(e) {
      console.warn('[TaijiDetails] 太极宫细节增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initTaijiDetails, 34000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
