/* ============================================================
   护城河细节
   在城墙外添加护城河细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initMoatDetail() {
    if (initialized) return;
    initialized = true;

    console.log('[MoatDetail] 开始护城河细节...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 南护城河（城墙外，z=400）
      const moatSouth = new THREE.Mesh(
        new THREE.PlaneGeometry(900, 20),
        new THREE.MeshStandardMaterial({ color: 0x2a4a5a, roughness: 0.3, metalness: 0.1 })
      );
      moatSouth.rotation.x = -Math.PI / 2;
      moatSouth.position.set(0, 0.1, 400);
      moatSouth.receiveShadow = true;
      scene.add(moatSouth);
      
      // 北护城河（城墙外，z=-400）
      const moatNorth = moatSouth.clone();
      moatNorth.position.z = -400;
      scene.add(moatNorth);
      
      console.log('[MoatDetail] 护城河已添加');

      console.log('[MoatDetail] 护城河细节完成！');

    } catch(e) {
      console.warn('[MoatDetail] 护城河细节失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initMoatDetail, 156000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
