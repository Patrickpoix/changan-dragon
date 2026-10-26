/* ============================================================
   宫殿台阶增强
   在大明宫殿前添加御道台阶
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initPalaceStepsEnhance() {
    if (initialized) return;
    initialized = true;

    console.log('[PalaceSteps] 开始宫殿台阶增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 大明宫含元殿前御道台阶
      // 含元殿坐标：(150, -432)，台基高约6.8
      // 从殿前(-418)到台基(-425)共7级台阶
      for (let step = 0; step < 7; step++) {
        const stepH = 1;
        const stepY = step * stepH;
        const stepZ = -418 - step * 1;
        const stepMesh = new THREE.Mesh(
          new THREE.BoxGeometry(15, stepH, 1),
          MAT.stone
        );
        stepMesh.position.set(150, stepY, stepZ);
        stepMesh.receiveShadow = true;
        scene.add(stepMesh);
      }
      console.log('[PalaceSteps] 大明宫殿前台阶已添加（7级）');

      console.log('[PalaceSteps] 宫殿台阶增强完成！');

    } catch(e) {
      console.warn('[PalaceSteps] 宫殿台阶增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initPalaceStepsEnhance, 26000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
