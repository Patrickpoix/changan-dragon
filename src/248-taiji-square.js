/* ============================================================
   太极殿前广场增强
   在太极殿前添加石板广场细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initTaijiSquare() {
    if (initialized) return;
    initialized = true;

    console.log('[TaijiSquare] 开始太极殿前广场增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 太极殿坐标：(0, -334)
      // 殿前广场铺设石板
      const squareSize = 40;
      const square = new THREE.Mesh(
        new THREE.PlaneGeometry(squareSize, squareSize),
        MAT.stone
      );
      square.rotation.x = -Math.PI / 2;
      square.position.set(0, 0.01, -310);
      square.receiveShadow = true;
      scene.add(square);
      
      console.log('[TaijiSquare] 太极殿前石板广场已添加');

      console.log('[TaijiSquare] 太极殿前广场增强完成！');

    } catch(e) {
      console.warn('[TaijiSquare] 太极殿前广场增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initTaijiSquare, 58000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
