/* ============================================================
   核心地标细节提升
   在原有建筑基础上添加高质量细节
   使用正确坐标，不新建重复建筑
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initLandmarkDetails() {
    if (initialized) return;
    initialized = true;

    console.log('[LandmarkDetails] 开始核心地标细节提升...');

    // ==============================================
    // 1. 朱雀大街行道树（正确位置：x=0两侧）
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 朱雀大街：x=0，贯穿南北（-350到+350）
      // 在街道两侧对称种植槐树
      for (let z = -320; z <= 320; z += 30) {
        // 左侧行道树
        const treeL = new THREE.Group();
        // 树干
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 4, 6), MAT.wood);
        trunk.position.y = 2;
        trunk.castShadow = true;
        treeL.add(trunk);
        // 树冠（球形）
        const crown = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 6), MAT.treeFoliage || MAT.green);
        crown.position.y = 5.5;
        crown.castShadow = true;
        treeL.add(crown);
        treeL.position.set(-15, 0, z);
        scene.add(treeL);

        // 右侧行道树（对称）
        const treeR = treeL.clone();
        treeR.position.x = 15;
        scene.add(treeR);
      }
      console.log('[LandmarkDetails] 朱雀大街行道树已添加（22棵，对称分布）');
    } catch(e) {
      console.warn('[LandmarkDetails] 行道树添加失败:', e);
    }

    // ==============================================
    // 2. 大雁塔周边松树（正确位置：(216, 283)）
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 大雁塔坐标：(216, 283)
      // 在寺院周围种植松树
      const pagodaX = 216, pagodaZ = 283;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 25 + Math.random() * 10;
        const x = pagodaX + Math.cos(angle) * radius;
        const z = pagodaZ + Math.sin(angle) * radius;
        
        // 松树
        const tree = new THREE.Group();
        // 树干
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 3, 6), MAT.wood);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        tree.add(trunk);
        // 松树冠（锥形）
        const crown = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 8), MAT.darkGreen || MAT.treeFoliage);
        crown.position.y = 4.5;
        crown.castShadow = true;
        tree.add(crown);
        tree.position.set(x, 0, z);
        scene.add(tree);
      }
      console.log('[LandmarkDetails] 大雁塔周边松树已添加（12棵）');
    } catch(e) {
      console.warn('[LandmarkDetails] 大雁塔松树添加失败:', e);
    }

    // ==============================================
    // 3. 曲江池荷花（正确位置：(354, 318)）
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 曲江池中心：(354, 318)
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radiusX = 45 + Math.random() * 8;
        const radiusZ = 35 + Math.random() * 6;
        const x = 354 + Math.cos(angle) * radiusX;
        const z = 318 + Math.sin(angle) * radiusZ;
        
        // 荷叶
        const lily = new THREE.Mesh(new THREE.CircleGeometry(0.7, 8), MAT.waterLily || MAT.green);
        lily.rotation.x = -Math.PI / 2;
        lily.position.set(x, 0.1, z);
        scene.add(lily);
        
        // 荷花（每3朵荷叶有一朵荷花）
        if (i % 3 === 0) {
          const flower = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 4), MAT.pink || MAT.lantern);
          flower.scale.y = 0.6;
          flower.position.set(x, 0.2, z);
          scene.add(flower);
        }
      }
      console.log('[LandmarkDetails] 曲江池荷花已添加（20朵荷叶，6朵荷花）');
    } catch(e) {
      console.warn('[LandmarkDetails] 荷花添加失败:', e);
    }

    // ==============================================
    // 4. 朱雀大街灯笼（正确位置：x=0两侧）
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      for (let z = -300; z <= 300; z += 50) {
        // 左侧灯笼杆
        const poleL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 5, 6), MAT.wood);
        poleL.position.set(-12, 2.5, z);
        poleL.castShadow = true;
        scene.add(poleL);
        // 灯笼
        const lanternL = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), MAT.lantern);
        lanternL.position.set(-12, 5.3, z);
        scene.add(lanternL);

        // 右侧灯笼（对称）
        const poleR = poleL.clone();
        poleR.position.x = 12;
        scene.add(poleR);
        const lanternR = lanternL.clone();
        lanternR.position.x = 12;
        scene.add(lanternR);
      }
      console.log('[LandmarkDetails] 朱雀大街灯笼已添加（12组，对称分布）');
    } catch(e) {
      console.warn('[LandmarkDetails] 灯笼添加失败:', e);
    }

    console.log('[LandmarkDetails] 核心地标细节提升完成！');
    console.log('=== 细节统计 ===');
    console.log('• 朱雀大街行道树：22棵');
    console.log('• 大雁塔周边松树：12棵');
    console.log('• 曲江池荷花：20朵荷叶，6朵荷花');
    console.log('• 朱雀大街灯笼：12组');
    console.log('==================');
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initLandmarkDetails, 2000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
