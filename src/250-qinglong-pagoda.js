/* ============================================================
   青龙寺塔增强
   在长安城东添加青龙寺塔细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initQinglongPagoda() {
    if (initialized) return;
    initialized = true;

    console.log('[QinglongPagoda] 开始青龙寺塔增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 青龙寺塔位置（城东南）
      const pagodaX = 300;
      const pagodaZ = 100;
      
      // 塔基
      const base = new THREE.Mesh(new THREE.CylinderGeometry(6, 7, 2, 8), MAT.stone);
      base.position.set(pagodaX, 1, pagodaZ);
      base.castShadow = true;
      base.receiveShadow = true;
      scene.add(base);
      
      // 五层塔
      for (let i = 0; i < 5; i++) {
        const layerSize = 5 - i * 0.6;
        const layerH = 3;
        const y = 2 + i * (layerH + 0.5);
        
        // 塔身
        const body = new THREE.Mesh(new THREE.BoxGeometry(layerSize, layerH, layerSize), MAT.stone);
        body.position.set(pagodaX, y, pagodaZ);
        body.castShadow = true;
        scene.add(body);
        
        // 塔檐
        const roof = new THREE.Mesh(new THREE.ConeGeometry(layerSize + 1, 1, 4), MAT.roof);
        roof.position.set(pagodaX, y + layerH/2 + 0.5, pagodaZ);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        scene.add(roof);
      }
      
      console.log('[QinglongPagoda] 青龙寺塔已添加（5层）');

      console.log('[QinglongPagoda] 青龙寺塔增强完成！');

    } catch(e) {
      console.warn('[QinglongPagoda] 青龙寺塔增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initQinglongPagoda, 62000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
