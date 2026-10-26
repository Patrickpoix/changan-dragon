/* ============================================================
   曲江池桥增强
   在曲江池添加小桥细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initQujiangBridge() {
    if (initialized) return;
    initialized = true;

    console.log('[QujiangBridge] 开始曲江池桥增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 曲江池中心：(354, 318)
      // 添加一座石板桥
      const bridgeX = 354;
      const bridgeZ = 318;
      
      // 桥面板
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 20), MAT.stone);
      bridge.position.set(bridgeX, 0.5, bridgeZ);
      bridge.receiveShadow = true;
      scene.add(bridge);
      
      // 桥栏杆（两侧）
      for (let i = -10; i <= 10; i += 2) {
        // 左侧栏杆柱
        const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1, 6), MAT.stone);
        postL.position.set(bridgeX - 1.2, 1, bridgeZ + i);
        postL.castShadow = true;
        scene.add(postL);
        // 右侧栏杆柱
        const postR = postL.clone();
        postR.position.x = bridgeX + 1.2;
        scene.add(postR);
      }
      
      console.log('[QujiangBridge] 曲江池石板桥已添加');

      console.log('[QujiangBridge] 曲江池桥增强完成！');

    } catch(e) {
      console.warn('[QujiangBridge] 曲江池桥增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initQujiangBridge, 46000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
