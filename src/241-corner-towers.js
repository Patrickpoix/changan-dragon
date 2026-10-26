/* ============================================================
   城墙角楼增强
   在城墙四角添加角楼细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initCornerTowers() {
    if (initialized) return;
    initialized = true;

    console.log('[CornerTowers] 开始城墙角楼增强...');

    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 城墙四角坐标
      const corners = [
        { x: -450, z: -380, name: '西北角' },
        { x: 450, z: -380, name: '东北角' },
        { x: -450, z: 380, name: '西南角' },
        { x: 450, z: 380, name: '东南角' },
      ];
      
      corners.forEach(corner => {
        // 角楼台基
        const base = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 8), MAT.stone);
        base.position.set(corner.x, 7.4, corner.z);
        base.castShadow = true;
        scene.add(base);
        
        // 角楼屋顶（四角攒尖）
        const roof = new THREE.Mesh(new THREE.ConeGeometry(6, 3, 4), MAT.roof);
        roof.position.set(corner.x, 10, corner.z);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        scene.add(roof);
      });
      
      console.log('[CornerTowers] 城墙四角角楼已添加（4座）');

      console.log('[CornerTowers] 城墙角楼增强完成！');

    } catch(e) {
      console.warn('[CornerTowers] 城墙角楼增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initCornerTowers, 44000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
