/* ============================================================
   明德门桥
   在明德门前护城河上添加桥
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initMingdeBridge() {
    if (initialized) return;
    initialized = true;

    console.log('[MingdeBridge] 开始明德门桥...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 明德门坐标：(0, 380)
      // 护城河在z=400
      // 在护城河上建桥
      const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.5, 20),
        MAT.stone
      );
      bridge.position.set(0, 0.3, 400);
      bridge.receiveShadow = true;
      bridge.castShadow = true;
      scene.add(bridge);
      
      console.log('[MingdeBridge] 明德门护城河桥已添加');

      console.log('[MingdeBridge] 明德门桥完成！');

    } catch(e) {
      console.warn('[MingdeBridge] 明德门桥失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initMingdeBridge, 158000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
