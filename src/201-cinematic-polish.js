/* ============================================================
   国风电影级色调与光影提升
   正确的后处理模块，等待游戏加载完成
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initCinematicPolish() {
    if (initialized) return;
    initialized = true;

    console.log('[CinematicPolish] 开始国风电影级色调提升...');

    try {
      // ==============================================
      // 1. 提升整体色调为国风电影质感
      // ==============================================
      // 调整雾色为更暖的青灰色（国风薄雾）
      scene.fog.color.setHex(0xd4c8b0);
      scene.fog.near = 150;
      scene.fog.far = 800;

      // 主光源：黄金时刻暖金色
      sun.color.setHex(0xffd090);
      sun.intensity = 1.8;
      sun.position.set(150 + 125, 105, -430 + 75);

      // 环境光：更暖的色调
      ambient.color.setHex(0xfff0d8);
      ambient.intensity = 0.3;

      // 半球光：天空暖，地面青
      hemi.color.setHex(0xfff3d8);
      hemi.groundColor.setHex(0x6a8a7a);
      hemi.intensity = 0.6;

      console.log('[CinematicPolish] 色调调整完成');
    } catch(e) {
      console.warn('[CinematicPolish] 色调调整失败:', e);
    }

    try {
      // ==============================================
      // 2. 大明宫含元殿前方增加台阶细节
      // ==============================================
      // 含元殿坐标：(150, -432)，台基高约6.8
      // 前方增加御道台阶
      for (let step = 0; step < 10; step++) {
        const stepH = 0.3;
        const stepY = step * stepH;
        const stepZ = -410 + step * 0.8;
        const stepMesh = new THREE.Mesh(
          new THREE.BoxGeometry(20, stepH, 1),
          toon(0xd8c9a8)
        );
        stepMesh.position.set(150, stepY, stepZ);
        stepMesh.receiveShadow = true;
        scene.add(stepMesh);
      }
      console.log('[CinematicPolish] 大明宫台阶已添加');
    } catch(e) {
      console.warn('[CinematicPolish] 台阶添加失败:', e);
    }

    try {
      // ==============================================
      // 3. 大雁塔周围增加寺院围墙细节
      // ==============================================
      // 大雁塔坐标：(216, 283)
      // 已经有围墙了，这里增加一些寺院内的树木
      for (let i = 0; i < 8; i++) {
        const x = 216 + (Math.random() - 0.5) * 50;
        const z = 283 + (Math.random() - 0.5) * 50;
        // 松树
        const trunk = new THREE.Mesh(UNIT_CYL, toon(0x5d4037));
        trunk.scale.set(0.25, 2, 0.25);
        trunk.position.set(x, 1, z);
        trunk.castShadow = true;
        scene.add(trunk);
        const crown = new THREE.Mesh(UNIT_CONE, toon(0x2e5d3a));
        crown.scale.set(1.5, 3, 1.5);
        crown.position.set(x, 3.5, z);
        crown.castShadow = true;
        scene.add(crown);
      }
      console.log('[CinematicPolish] 大雁塔寺院树木已添加');
    } catch(e) {
      console.warn('[CinematicPolish] 树木添加失败:', e);
    }

    console.log('[CinematicPolish] 国风电影级色调提升完成！');
  }

  // 轮询等待游戏加载完成
  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      initCinematicPolish();
    } else {
      setTimeout(checkReady, 500);
    }
  }

  checkReady();

})();
