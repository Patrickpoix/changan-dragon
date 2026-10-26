/* ============================================================
   朱雀大街路面细节
   在朱雀大街添加石板路面细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initZhuqueRoadDetail() {
    if (initialized) return;
    initialized = true;

    console.log('[ZhuqueRoadDetail] 开始朱雀大街路面细节...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 朱雀大街主路面（石板）
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 700),
        MAT.stone
      );
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0.02, 0);
      road.receiveShadow = true;
      scene.add(road);
      
      console.log('[ZhuqueRoadDetail] 朱雀大街石板路面已添加');

      console.log('[ZhuqueRoadDetail] 朱雀大街路面细节完成！');

    } catch(e) {
      console.warn('[ZhuqueRoadDetail] 朱雀大街路面细节失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initZhuqueRoadDetail, 150000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
