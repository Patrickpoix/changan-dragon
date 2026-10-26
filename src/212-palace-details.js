/* ============================================================
   宫殿区域细节提升
   大明宫/太极宫/兴庆宫 正确坐标细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initPalaceDetails() {
    if (initialized) return;
    initialized = true;

    console.log('[PalaceDetails] 开始宫殿区域细节提升...');

    // ==============================================
    // 1. 大明宫含元殿前方立柱（正确坐标：(150, -432)）
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 含元殿坐标：(150, -432)，台基高约6.8
      // 殿前御道两侧增加朱红立柱
      for (let i = -3; i <= 3; i++) {
        const x = 150 + i * 4;
        const z = -418; // 殿前位置
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 8, 8), MAT.red);
        col.position.set(x, 4, z);
        col.castShadow = true;
        scene.add(col);
      }
      console.log('[PalaceDetails] 大明宫殿前立柱已添加（7根）');
    } catch(e) {
      console.warn('[PalaceDetails] 大明宫立柱添加失败:', e);
    }

    // ==============================================
    // 2. 兴庆宫龙池荷花（正确坐标：(342, -152)）
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 龙池中心：(342, -152)
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 18 + Math.random() * 8;
        const x = 342 + Math.cos(angle) * radius;
        const z = -152 + Math.sin(angle) * radius * 0.7;
        
        const lily = new THREE.Mesh(new THREE.CircleGeometry(0.6, 8), MAT.waterLily || MAT.green);
        lily.rotation.x = -Math.PI / 2;
        lily.position.set(x, 0.1, z);
        scene.add(lily);
        
        if (i % 3 === 0) {
          const flower = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 4), MAT.pink || MAT.lantern);
          flower.scale.y = 0.6;
          flower.position.set(x, 0.18, z);
          scene.add(flower);
        }
      }
      console.log('[PalaceDetails] 兴庆宫龙池荷花已添加（15朵）');
    } catch(e) {
      console.warn('[PalaceDetails] 兴庆宫荷花添加失败:', e);
    }

    // ==============================================
    // 3. 太极殿前立柱（正确坐标：(0, -334)）
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 太极殿坐标：(0, -334)
      for (let i = -4; i <= 4; i++) {
        const x = i * 3.5;
        const z = -322;
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 6, 8), MAT.red);
        col.position.set(x, 3, z);
        col.castShadow = true;
        scene.add(col);
      }
      console.log('[PalaceDetails] 太极殿前立柱已添加（9根）');
    } catch(e) {
      console.warn('[PalaceDetails] 太极殿立柱添加失败:', e);
    }

    // ==============================================
    // 4. 城墙垛口（北城墙：z=-380）
    // ==============================================
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;
      
      // 北城墙顶部约6.4高
      for (let x = -400; x <= 400; x += 8) {
        const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.4), MAT.stone);
        merlon.position.set(x, 6.8, -380);
        merlon.castShadow = true;
        scene.add(merlon);
      }
      console.log('[PalaceDetails] 北城墙垛口已添加（100个）');
    } catch(e) {
      console.warn('[PalaceDetails] 城墙垛口添加失败:', e);
    }

    console.log('[PalaceDetails] 宫殿区域细节提升完成！');
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initPalaceDetails, 2500);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
