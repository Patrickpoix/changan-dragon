/* ============================================================
   兴庆宫与太极宫精修
   正确的后处理模块
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initPalaceRefinement() {
    if (initialized) return;
    initialized = true;

    console.log('[PalaceRefinement] 开始兴庆宫与太极宫精修...');

    try {
      // ==============================================
      // 1. 兴庆宫龙池增加更多荷花
      // ==============================================
      // 兴庆宫龙池中心：(342, -152)
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 15 + Math.random() * 10;
        const lily = new THREE.Mesh(new THREE.CircleGeometry(0.6, 8), toon(0x5c9a62));
        lily.rotation.x = -Math.PI / 2;
        lily.position.set(
          342 + Math.cos(angle) * radius,
          0.1,
          -152 + Math.sin(angle) * radius * 0.7
        );
        scene.add(lily);
        // 荷花
        if (i % 3 === 0) {
          const flower = new THREE.Mesh(UNIT_SPHERE, toon(0xf2a7b6));
          flower.scale.set(0.25, 0.15, 0.25);
          flower.position.copy(lily.position);
          flower.position.y += 0.12;
          scene.add(flower);
        }
      }
      console.log('[PalaceRefinement] 兴庆宫龙池荷花已添加');
    } catch(e) {
      console.warn('[PalaceRefinement] 兴庆宫荷花添加失败:', e);
    }

    try {
      // ==============================================
      // 2. 太极宫殿前增加更多立柱
      // ==============================================
      // 太极殿坐标：(0, -334)
      for (let i = -4; i <= 4; i++) {
        const col = new THREE.Mesh(UNIT_CYL, toon(0xc94a3d));
        col.scale.set(0.4, 5, 0.4);
        col.position.set(i * 4, 3.5, -320);
        col.castShadow = true;
        scene.add(col);
      }
      console.log('[PalaceRefinement] 太极殿立柱已添加');
    } catch(e) {
      console.warn('[PalaceRefinement] 太极殿立柱添加失败:', e);
    }

    try {
      // ==============================================
      // 3. 城墙增加更多垛口
      // ==============================================
      // 北城墙：y约6.4，z约-380
      for (let x = -450; x <= 450; x += 10) {
        const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 0.5), toon(0xb8a88a));
        merlon.position.set(x, 6.9, -380);
        merlon.castShadow = true;
        scene.add(merlon);
      }
      console.log('[PalaceRefinement] 城墙垛口已添加');
    } catch(e) {
      console.warn('[PalaceRefinement] 垛口添加失败:', e);
    }

    console.log('[PalaceRefinement] 兴庆宫与太极宫精修完成！');
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      initPalaceRefinement();
    } else {
      setTimeout(checkReady, 500);
    }
  }

  checkReady();

})();
