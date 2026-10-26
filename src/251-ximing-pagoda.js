/* ============================================================
   西明寺塔增强
   在长安城西添加西明寺塔细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initXimingPagoda() {
    if (initialized) return;
    initialized = true;

    console.log('[XimingPagoda] 开始西明寺塔增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 西明寺塔位置（城西南）
      const pagodaX = -300;
      const pagodaZ = 150;
      
      // 塔基
      const base = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 6.5, 2, 8), MAT.stone);
      base.position.set(pagodaX, 1, pagodaZ);
      base.castShadow = true;
      base.receiveShadow = true;
      scene.add(base);
      
      // 四层塔
      for (let i = 0; i < 4; i++) {
        const layerSize = 4.5 - i * 0.6;
        const layerH = 2.8;
        const y = 2 + i * (layerH + 0.5);
        
        // 塔身
        const body = new THREE.Mesh(new THREE.BoxGeometry(layerSize, layerH, layerSize), MAT.stone);
        body.position.set(pagodaX, y, pagodaZ);
        body.castShadow = true;
        scene.add(body);
        
        // 塔檐
        const roof = new THREE.Mesh(new THREE.ConeGeometry(layerSize + 0.9, 0.9, 4), MAT.roof);
        roof.position.set(pagodaX, y + layerH/2 + 0.45, pagodaZ);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        scene.add(roof);
      }
      
      console.log('[XimingPagoda] 西明寺塔已添加（4层）');

      console.log('[XimingPagoda] 西明寺塔增强完成！');

    } catch(e) {
      console.warn('[XimingPagoda] 西明寺塔增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initXimingPagoda, 64000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
