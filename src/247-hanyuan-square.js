/* ============================================================
   含元殿前广场增强
   在大明宫内添加殿前广场细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initHanyuanSquare() {
    if (initialized) return;
    initialized = true;

    console.log('[HanyuanSquare] 开始含元殿前广场增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 含元殿坐标：(150, -432)
      // 殿前广场铺设石板
      const squareSize = 60;
      const square = new THREE.Mesh(
        new THREE.PlaneGeometry(squareSize, squareSize),
        MAT.stone
      );
      square.rotation.x = -Math.PI / 2;
      square.position.set(150, 0.01, -400);
      square.receiveShadow = true;
      scene.add(square);
      
      console.log('[HanyuanSquare] 含元殿前石板广场已添加');

      console.log('[HanyuanSquare] 含元殿前广场增强完成！');

    } catch(e) {
      console.warn('[HanyuanSquare] 含元殿前广场增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initHanyuanSquare, 56000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
