/* ============================================================
   视觉提升后处理模块 · 正确注入方式
   等待游戏加载完成后再添加视觉提升
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initVisualEnhancements() {
    if (initialized) return;
    initialized = true;

    console.log('[VisualEnhancements] 开始视觉提升...');

    // ==============================================
    // 1. 大明宫含元殿前方增加更多立柱细节
    // ==============================================
    try {
      // 含元殿坐标：(150, -432)
      // 在殿前增加更多朱红立柱
      for (let i = -3; i <= 3; i++) {
        const col = new THREE.Mesh(UNIT_CYL, toon(0xc94a3d));
        col.scale.set(0.5, 6, 0.5);
        col.position.set(150 + i * 5, 10, -415);
        col.castShadow = true;
        scene.add(col);
      }
      console.log('[VisualEnhancements] 大明宫殿前立柱已添加');
    } catch(e) {
      console.warn('[VisualEnhancements] 大明宫立柱添加失败:', e);
    }

    // ==============================================
    // 2. 朱雀大街增加更多行道树
    // ==============================================
    try {
      // 朱雀大街：x=0，贯穿南北
      // 在街道两侧增加更多槐树
      for (let z = -350; z <= 350; z += 20) {
        const tree = new THREE.Group();
        // 树干
        const trunk = new THREE.Mesh(UNIT_CYL, toon(0x6d4c2f));
        trunk.scale.set(0.3, 3, 0.3);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        tree.add(trunk);
        // 树冠
        const crown = new THREE.Mesh(UNIT_SPHERE, toon(0x4a7c3f));
        crown.scale.set(2, 1.8, 2);
        crown.position.y = 4;
        crown.castShadow = true;
        tree.add(crown);
        // 左右两侧各一棵
        tree.position.set(-18, 0, z);
        scene.add(tree);
        const tree2 = tree.clone();
        tree2.position.x = 18;
        scene.add(tree2);
      }
      console.log('[VisualEnhancements] 朱雀大街行道树已添加');
    } catch(e) {
      console.warn('[VisualEnhancements] 行道树添加失败:', e);
    }

    // ==============================================
    // 3. 曲江池边增加更多荷花
    // ==============================================
    try {
      // 曲江池中心：(354, 318)
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radiusX = 50 + Math.random() * 10;
        const radiusZ = 40 + Math.random() * 8;
        const lily = new THREE.Mesh(new THREE.CircleGeometry(0.8, 8), toon(0x5c9a62));
        lily.rotation.x = -Math.PI / 2;
        lily.position.set(
          354 + Math.cos(angle) * radiusX,
          0.1,
          318 + Math.sin(angle) * radiusZ
        );
        scene.add(lily);
        // 荷花
        if (i % 3 === 0) {
          const flower = new THREE.Mesh(UNIT_SPHERE, toon(0xf2a7b6));
          flower.scale.set(0.3, 0.2, 0.3);
          flower.position.copy(lily.position);
          flower.position.y += 0.15;
          scene.add(flower);
        }
      }
      console.log('[VisualEnhancements] 曲江池荷花已添加');
    } catch(e) {
      console.warn('[VisualEnhancements] 荷花添加失败:', e);
    }

    // ==============================================
    // 4. 整体色调微调（更暖、更国风）
    // ==============================================
    try {
      // 调整雾色为更暖的色调
      scene.fog.color.setHex(0xf0e0c8);
      // 调整主光源为更暖的金色
      sun.color.setHex(0xffd4a0);
      sun.intensity = 1.8;
      console.log('[VisualEnhancements] 色调已调整');
    } catch(e) {
      console.warn('[VisualEnhancements] 色调调整失败:', e);
    }

    console.log('[VisualEnhancements] 视觉提升完成！');
  }

  // 轮询等待游戏加载完成
  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      initVisualEnhancements();
    } else {
      setTimeout(checkReady, 500);
    }
  }

  // 启动轮询
  checkReady();

})();
