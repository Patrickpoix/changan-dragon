/* ============================================================
   小雁塔周边增强
   在小雁塔周围添加寺院细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initSmallPagodaSurroundings() {
    if (initialized) return;
    initialized = true;

    console.log('[SmallPagodaSurroundings] 开始小雁塔周边增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 小雁塔坐标：(-216, 349)
      const pagodaX = -216, pagodaZ = 349;
      
      // 寺院围墙（方形）
      const wallSize = 30;
      const wallH = 2.5;
      // 北墙
      const wallN = new THREE.Mesh(new THREE.BoxGeometry(wallSize, wallH, 0.4), MAT.stone);
      wallN.position.set(pagodaX, wallH/2, pagodaZ - wallSize/2);
      wallN.castShadow = true;
      scene.add(wallN);
      // 南墙
      const wallS = wallN.clone();
      wallS.position.z = pagodaZ + wallSize/2;
      scene.add(wallS);
      // 东墙
      const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.4, wallH, wallSize), MAT.stone);
      wallE.position.set(pagodaX + wallSize/2, wallH/2, pagodaZ);
      wallE.castShadow = true;
      scene.add(wallE);
      // 西墙
      const wallW = wallE.clone();
      wallW.position.x = pagodaX - wallSize/2;
      scene.add(wallW);
      
      console.log('[SmallPagodaSurroundings] 小雁塔寺院围墙已添加');

      console.log('[SmallPagodaSurroundings] 小雁塔周边增强完成！');

    } catch(e) {
      console.warn('[SmallPagodaSurroundings] 小雁塔周边增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initSmallPagodaSurroundings, 38000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
