/* ============================================================
   城外村落
   在长安城东南城外添加一个小村庄
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initOutsideVillage() {
    if (initialized) return;
    initialized = true;

    console.log('[OutsideVillage] 开始城外村落...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 城东南外村落
      const villageX = 500;
      const villageZ = 450;
      
      // 添加几间农舍
      for (let i = 0; i < 5; i++) {
        const x = villageX + (Math.random() - 0.5) * 60;
        const z = villageZ + (Math.random() - 0.5) * 60;
        
        // 房屋主体
        const house = new THREE.Mesh(
          new THREE.BoxGeometry(6, 3, 5),
          MAT.wall || new THREE.MeshStandardMaterial({ color: 0xd4c4a4, roughness: 0.9 })
        );
        house.position.set(x, 1.5, z);
        house.castShadow = true;
        house.receiveShadow = true;
        scene.add(house);
        
        // 屋顶
        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(4.5, 2, 4),
          MAT.roof || new THREE.MeshStandardMaterial({ color: 0x8a4a3a, roughness: 0.8 })
        );
        roof.position.set(x, 4, z);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        scene.add(roof);
      }
      
      console.log('[OutsideVillage] 城外村落已添加（5间农舍）');

      console.log('[OutsideVillage] 城外村落完成！');

    } catch(e) {
      console.warn('[OutsideVillage] 城外村落失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initOutsideVillage, 202000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
