/* ============================================================
   兴庆宫细节增强
   在兴庆宫添加更多细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initXingqingDetails() {
    if (initialized) return;
    initialized = true;

    console.log('[XingqingDetails] 开始兴庆宫细节增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 兴庆宫花萼相辉楼附近添加牡丹花丛
      // 花萼相辉楼坐标：(398, -108)
      for (let i = 0; i < 15; i++) {
        const x = 380 + Math.random() * 40;
        const z = -120 + Math.random() * 30;
        
        // 牡丹花丛
        for (let j = 0; j < 3; j++) {
          const flower = new THREE.Mesh(new THREE.SphereGeometry(0.15, 4, 4), MAT.pink || MAT.lantern);
          flower.position.set(x + (Math.random() - 0.5) * 1, 0.3, z + (Math.random() - 0.5) * 1);
          scene.add(flower);
        }
      }
      console.log('[XingqingDetails] 兴庆宫牡丹花丛已添加');

      console.log('[XingqingDetails] 兴庆宫细节增强完成！');

    } catch(e) {
      console.warn('[XingqingDetails] 兴庆宫细节增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initXingqingDetails, 32000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
