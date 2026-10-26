/* ============================================================
   城外驿站
   在长安城南门外添加一个驿站
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initOutsidePostStation() {
    if (initialized) return;
    initialized = true;

    console.log('[OutsidePostStation] 开始城外驿站...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 南门外驿站
      const stationX = 100;
      const stationZ = 450;
      
      // 驿站主建筑
      const main = new THREE.Mesh(
        new THREE.BoxGeometry(12, 5, 8),
        MAT.wall || new THREE.MeshStandardMaterial({ color: 0xd4c4a4, roughness: 0.9 })
      );
      main.position.set(stationX, 2.5, stationZ);
      main.castShadow = true;
      main.receiveShadow = true;
      scene.add(main);
      
      // 驿站屋顶
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(9, 3, 4),
        MAT.roof || new THREE.MeshStandardMaterial({ color: 0x8a4a3a, roughness: 0.8 })
      );
      roof.position.set(stationX, 6.5, stationZ);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      scene.add(roof);
      
      console.log('[OutsidePostStation] 城外驿站已添加');

      console.log('[OutsidePostStation] 城外驿站完成！');

    } catch(e) {
      console.warn('[OutsidePostStation] 城外驿站失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initOutsidePostStation, 204000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
