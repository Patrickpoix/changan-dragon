/* ============================================================
   兴庆宫龙池桥增强
   在龙池添加小桥细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initLongchiBridge() {
    if (initialized) return;
    initialized = true;

    console.log('[LongchiBridge] 开始龙池桥增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 龙池中心：(342, -152)
      // 添加一座小木桥
      const bridgeX = 342;
      const bridgeZ = -152;
      
      // 桥面板
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 12), MAT.wood);
      bridge.position.set(bridgeX, 0.3, bridgeZ);
      bridge.receiveShadow = true;
      scene.add(bridge);
      
      console.log('[LongchiBridge] 兴庆宫龙池小木桥已添加');

      console.log('[LongchiBridge] 龙池桥增强完成！');

    } catch(e) {
      console.warn('[LongchiBridge] 龙池桥增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initLongchiBridge, 48000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
