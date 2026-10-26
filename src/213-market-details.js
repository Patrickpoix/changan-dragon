/* ============================================================
   东西市市场氛围提升
   正确坐标：西市(-258,-14)，东市(174,-14)
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initMarketDetails() {
    if (initialized) return;
    initialized = true;

    console.log('[MarketDetails] 开始东西市市场氛围提升...');

    // ==============================================
    // 1. 西市摊位（正确坐标：约(-258, -14)）
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 西市中心约(-258, -14)
      for (let i = 0; i < 12; i++) {
        const x = -280 + Math.random() * 50;
        const z = -40 + Math.random() * 50;
        
        // 摊位桌
        const table = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 2), MAT.wood);
        table.position.set(x, 0.5, z);
        table.castShadow = true;
        scene.add(table);
        
        // 布篷（红色）
        const awning = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 2.5), MAT.red);
        awning.position.set(x, 2.5, z);
        awning.castShadow = true;
        scene.add(awning);
        
        // 布篷支撑杆
        const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 6), MAT.wood);
        pole1.position.set(x - 1.5, 1.25, z - 1);
        scene.add(pole1);
        const pole2 = pole1.clone();
        pole2.position.x = x + 1.5;
        scene.add(pole2);
      }
      console.log('[MarketDetails] 西市摊位已添加（12个）');
    } catch(e) {
      console.warn('[MarketDetails] 西市摊位添加失败:', e);
    }

    // ==============================================
    // 2. 东市摊位（正确坐标：约(174, -14)）
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 东市中心约(174, -14)
      for (let i = 0; i < 12; i++) {
        const x = 150 + Math.random() * 50;
        const z = -40 + Math.random() * 50;
        
        const table = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 2), MAT.wood);
        table.position.set(x, 0.5, z);
        table.castShadow = true;
        scene.add(table);
        
        const awning = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 2.5), MAT.blue || MAT.roofGlazed);
        awning.position.set(x, 2.5, z);
        awning.castShadow = true;
        scene.add(awning);
        
        const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 6), MAT.wood);
        pole1.position.set(x - 1.5, 1.25, z - 1);
        scene.add(pole1);
        const pole2 = pole1.clone();
        pole2.position.x = x + 1.5;
        scene.add(pole2);
      }
      console.log('[MarketDetails] 东市摊位已添加（12个）');
    } catch(e) {
      console.warn('[MarketDetails] 东市摊位添加失败:', e);
    }

    // ==============================================
    // 3. 小雁塔周边树木（正确坐标：(-216, 349)）
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 小雁塔坐标：(-216, 349)
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 20 + Math.random() * 8;
        const x = -216 + Math.cos(angle) * radius;
        const z = 349 + Math.sin(angle) * radius;
        
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 3, 6), MAT.wood);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        tree.add(trunk);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 6), MAT.treeFoliage || MAT.green);
        crown.position.y = 4;
        crown.castShadow = true;
        tree.add(crown);
        tree.position.set(x, 0, z);
        scene.add(tree);
      }
      console.log('[MarketDetails] 小雁塔周边树木已添加（8棵）');
    } catch(e) {
      console.warn('[MarketDetails] 小雁塔树木添加失败:', e);
    }

    console.log('[MarketDetails] 东西市市场氛围提升完成！');
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initMarketDetails, 3000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
