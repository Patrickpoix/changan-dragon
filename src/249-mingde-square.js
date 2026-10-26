/* ============================================================
   明德门前广场增强
   在明德门前添加石板广场细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initMingdeSquare() {
    if (initialized) return;
    initialized = true;

    console.log('[MingdeSquare] 开始明德门前广场增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 明德门坐标：(0, 380)
      // 门前广场铺设石板
      const squareSize = 50;
      const square = new THREE.Mesh(
        new THREE.PlaneGeometry(squareSize, squareSize),
        MAT.stone
      );
      square.rotation.x = -Math.PI / 2;
      square.position.set(0, 0.01, 400);
      square.receiveShadow = true;
      scene.add(square);
      
      console.log('[MingdeSquare] 明德门前石板广场已添加');

      console.log('[MingdeSquare] 明德门前广场增强完成！');

    } catch(e) {
      console.warn('[MingdeSquare] 明德门前广场增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initMingdeSquare, 60000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
