/* ============================================================
   曲江池亭子增强
   在曲江池边添加亭子
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initQujiangPavilion() {
    if (initialized) return;
    initialized = true;

    console.log('[QujiangPavilion] 开始曲江池亭子增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 曲江池中心：(354, 318)
      // 在池边添加一个四角攒尖亭
      const pavilionX = 354 + 40;
      const pavilionZ = 318 - 30;
      
      // 亭子台基
      const base = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.5, 0.5, 8), MAT.stone);
      base.position.set(pavilionX, 0.25, pavilionZ);
      base.receiveShadow = true;
      scene.add(base);
      
      // 四根立柱
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const x = pavilionX + Math.cos(angle) * 2.5;
        const z = pavilionZ + Math.sin(angle) * 2.5;
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 3, 8), MAT.wood);
        col.position.set(x, 2, z);
        col.castShadow = true;
        scene.add(col);
      }
      
      // 亭子屋顶（四角攒尖）
      const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 2, 4), MAT.roof);
      roof.position.set(pavilionX, 4.5, pavilionZ);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      scene.add(roof);
      
      console.log('[QujiangPavilion] 曲江池亭子已添加');

      console.log('[QujiangPavilion] 曲江池亭子增强完成！');

    } catch(e) {
      console.warn('[QujiangPavilion] 曲江池亭子增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initQujiangPavilion, 30000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
