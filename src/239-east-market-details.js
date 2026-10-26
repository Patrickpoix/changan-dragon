/* ============================================================
   东市细节增强
   在东市添加更多摊位细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initEastMarketDetails() {
    if (initialized) return;
    initialized = true;

    console.log('[EastMarketDetails] 开始东市细节增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 东市中心约(174, -14)
      // 添加更多摊位
      for (let i = 0; i < 8; i++) {
        const x = 160 + Math.random() * 30;
        const z = -30 + Math.random() * 30;
        
        // 摊位桌
        const table = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 1.8), MAT.wood);
        table.position.set(x, 0.4, z);
        table.castShadow = true;
        scene.add(table);
        
        // 布篷
        const awning = new THREE.Mesh(new THREE.BoxGeometry(3, 0.08, 2.2), MAT.roofGlazed || MAT.blue);
        awning.position.set(x, 2.2, z);
        awning.castShadow = true;
        scene.add(awning);
      }
      console.log('[EastMarketDetails] 东市额外摊位已添加（8个）');

      console.log('[EastMarketDetails] 东市细节增强完成！');

    } catch(e) {
      console.warn('[EastMarketDetails] 东市细节增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initEastMarketDetails, 40000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
