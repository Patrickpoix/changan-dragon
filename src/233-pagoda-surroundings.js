/* ============================================================
   大雁塔周边增强
   在大雁塔周围添加寺院细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initPagodaSurroundings() {
    if (initialized) return;
    initialized = true;

    console.log('[PagodaSurroundings] 开始大雁塔周边增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 大雁塔坐标：(216, 283)
      const pagodaX = 216, pagodaZ = 283;
      
      // 寺院围墙（方形）
      const wallSize = 40;
      const wallH = 3;
      // 北墙
      const wallN = new THREE.Mesh(new THREE.BoxGeometry(wallSize, wallH, 0.5), MAT.stone);
      wallN.position.set(pagodaX, wallH/2, pagodaZ - wallSize/2);
      wallN.castShadow = true;
      scene.add(wallN);
      // 南墙
      const wallS = wallN.clone();
      wallS.position.z = pagodaZ + wallSize/2;
      scene.add(wallS);
      // 东墙
      const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.5, wallH, wallSize), MAT.stone);
      wallE.position.set(pagodaX + wallSize/2, wallH/2, pagodaZ);
      wallE.castShadow = true;
      scene.add(wallE);
      // 西墙
      const wallW = wallE.clone();
      wallW.position.x = pagodaX - wallSize/2;
      scene.add(wallW);
      
      console.log('[PagodaSurroundings] 大雁塔寺院围墙已添加');

      console.log('[PagodaSurroundings] 大雁塔周边增强完成！');

    } catch(e) {
      console.warn('[PagodaSurroundings] 大雁塔周边增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initPagodaSurroundings, 28000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
