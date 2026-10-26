/* ============================================================
   明德门细节增强
   在明德门添加更多细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initMingdeDetails() {
    if (initialized) return;
    initialized = true;

    console.log('[MingdeDetails] 开始明德门细节增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 明德门位于南城墙中央（z=+380，x=0）
      // 门前添加台阶
      for (let step = 0; step < 4; step++) {
        const stepH = 0.8;
        const stepY = step * stepH;
        const stepZ = 375 + step * 1;
        const stepMesh = new THREE.Mesh(
          new THREE.BoxGeometry(10, stepH, 1),
          MAT.stone
        );
        stepMesh.position.set(0, stepY, stepZ);
        stepMesh.receiveShadow = true;
        scene.add(stepMesh);
      }
      console.log('[MingdeDetails] 明德门前台阶已添加（4级）');

      console.log('[MingdeDetails] 明德门细节增强完成！');

    } catch(e) {
      console.warn('[MingdeDetails] 明德门细节增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initMingdeDetails, 36000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
