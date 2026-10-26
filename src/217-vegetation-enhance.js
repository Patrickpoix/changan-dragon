/* ============================================================
   植被系统增强
   在正确位置添加更多自然植被
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initVegetationEnhance() {
    if (initialized) return;
    initialized = true;

    console.log('[VegetationEnhance] 开始植被系统增强...');

    // ==============================================
    // 1. 曲江池周边柳树（正确坐标：(354, 318)）
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 曲江池周边种柳树
      for (let i = 0; i < 15; i++) {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 65 + Math.random() * 10;
        const x = 354 + Math.cos(angle) * radius;
        const z = 318 + Math.sin(angle) * radius * 0.8;
        
        const tree = new THREE.Group();
        // 树干（柳树更细长）
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 5, 6), MAT.wood);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        tree.add(trunk);
        // 柳树冠（下垂感，用椭圆球）
        const crown = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 6), MAT.willow || MAT.treeFoliage);
        crown.scale.y = 1.3;
        crown.position.y = 6;
        crown.castShadow = true;
        tree.add(crown);
        tree.position.set(x, 0, z);
        scene.add(tree);
      }
      console.log('[VegetationEnhance] 曲江池周边柳树已添加（15棵）');
    } catch(e) {
      console.warn('[VegetationEnhance] 柳树添加失败:', e);
    }

    // ==============================================
    // 2. 城墙下灌木丛
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 北城墙下（z=-370）
      for (let x = -400; x <= 400; x += 15) {
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.8, 6, 4), MAT.bush || MAT.green);
        bush.scale.y = 0.6;
        bush.position.set(x, 0.4, -370);
        bush.castShadow = true;
        scene.add(bush);
      }
      console.log('[VegetationEnhance] 城墙下灌木丛已添加（53丛）');
    } catch(e) {
      console.warn('[VegetationEnhance] 灌木丛添加失败:', e);
    }

    // ==============================================
    // 3. 兴庆宫花园花卉
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 兴庆宫区域（342, -152附近）
      for (let i = 0; i < 20; i++) {
        const x = 320 + Math.random() * 50;
        const z = -180 + Math.random() * 50;
        
        // 小花
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.15, 4, 4), MAT.flower || MAT.pink);
        flower.position.set(x, 0.3, z);
        scene.add(flower);
      }
      console.log('[VegetationEnhance] 兴庆宫花卉已添加（20朵）');
    } catch(e) {
      console.warn('[VegetationEnhance] 花卉添加失败:', e);
    }

    console.log('[VegetationEnhance] 植被系统增强完成！');
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initVegetationEnhance, 7000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
