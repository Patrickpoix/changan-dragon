/* ============================================================
   城外农田
   在长安城外围添加农田细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initFarmlands() {
    if (initialized) return;
    initialized = true;

    console.log('[Farmlands] 开始城外农田...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 南门外农田
      for (let i = 0; i < 10; i++) {
        const x = -200 + i * 40;
        const z = 450 + Math.random() * 30;
        
        const field = new THREE.Mesh(
          new THREE.PlaneGeometry(30, 20),
          new THREE.MeshStandardMaterial({ color: 0x6a8a4a, roughness: 0.9 })
        );
        field.rotation.x = -Math.PI / 2;
        field.position.set(x, 0.05, z);
        field.receiveShadow = true;
        scene.add(field);
      }
      
      console.log('[Farmlands] 城外农田已添加');

      console.log('[Farmlands] 城外农田完成！');

    } catch(e) {
      console.warn('[Farmlands] 城外农田失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initFarmlands, 160000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
