/* ============================================================
   Water - 水景系统Owner（增强版）
   全部使用共享几何体UNIT_BOX/UNIT_CYL/UNIT_SPHERE和共享材质MAT
   ============================================================ */

(function() {
  'use strict';

  const WATER_CONFIG = {
    qujiang: { x: 354, z: 318, radius: 40, boats: 3 },
    longchi: { x: 342, z: -152, radius: 25, boats: 2 },
  };

  let initialized = false;

  function addBridge(x, z, length, width) {
    if (typeof MAT === 'undefined') return;
    const bridge = new THREE.Mesh(UNIT_BOX, MAT.stone);
    bridge.position.set(x, 0.3, z);
    bridge.scale.set(width, 0.5, length);
    bridge.receiveShadow = true;
    bridge.castShadow = true;
    scene.add(bridge);
  }

  function addPavilion(x, z) {
    if (typeof MAT === 'undefined') return;
    const base = new THREE.Mesh(UNIT_BOX, MAT.stone);
    base.position.set(x, 0.25, z);
    base.scale.set(6, 0.5, 6);
    base.receiveShadow = true;
    scene.add(base);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const pillar = new THREE.Mesh(UNIT_CYL, MAT.wood);
      pillar.position.set(x + Math.cos(angle) * 2, 2, z + Math.sin(angle) * 2);
      pillar.scale.set(0.3, 3, 0.3);
      pillar.castShadow = true;
      scene.add(pillar);
    }
    const roof = new THREE.Mesh(ROOF_SMALL, MAT.roof || MAT.roofGlazed);
    roof.position.set(x, 4.5, z);
    roof.scale.set(8, 2, 8);
    roof.castShadow = true;
    scene.add(roof);
  }

  function addLotusLeaf(x, z) {
    if (typeof MAT === 'undefined') return;
    const leaf = new THREE.Mesh(UNIT_SPHERE,
      new THREE.MeshStandardMaterial({ color: 0x4a8a4a, roughness: 0.8 }));
    leaf.position.set(x, 0.15, z);
    leaf.scale.set(0.8, 0.1, 0.8);
    scene.add(leaf);
  }

  function addReed(x, z) {
    if (typeof MAT === 'undefined') return;
    const reed = new THREE.Mesh(UNIT_CYL,
      new THREE.MeshStandardMaterial({ color: 0x8a9a5a, roughness: 0.9 }));
    reed.position.set(x, 0.8, z);
    reed.scale.set(0.05, 1.6, 0.05);
    scene.add(reed);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Water] 水景系统初始化...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 曲江池游船
      for (let i = 0; i < WATER_CONFIG.qujiang.boats; i++) {
        const boat = new THREE.Mesh(UNIT_BOX, MAT.wood);
        boat.position.set(
          WATER_CONFIG.qujiang.x + (Math.random() - 0.5) * 30,
          0.3,
          WATER_CONFIG.qujiang.z + (Math.random() - 0.5) * 30
        );
        boat.scale.set(3, 0.5, 6);
        boat.castShadow = true;
        scene.add(boat);
      }

      // 龙池游船
      for (let i = 0; i < WATER_CONFIG.longchi.boats; i++) {
        const boat = new THREE.Mesh(UNIT_BOX, MAT.wood);
        boat.position.set(
          WATER_CONFIG.longchi.x + (Math.random() - 0.5) * 20,
          0.3,
          WATER_CONFIG.longchi.z + (Math.random() - 0.5) * 20
        );
        boat.scale.set(2.5, 0.4, 5);
        boat.castShadow = true;
        scene.add(boat);
      }

      // 岸线石头
      Object.keys(WATER_CONFIG).forEach(key => {
        const cfg = WATER_CONFIG[key];
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const rock = new THREE.Mesh(UNIT_SPHERE, MAT.stone);
          rock.position.set(cfg.x + Math.cos(angle) * (cfg.radius + 2), 0.2, cfg.z + Math.sin(angle) * (cfg.radius + 2));
          const s = 0.3 + Math.random() * 0.4;
          rock.scale.set(s, s * 0.7, s);
          rock.castShadow = true;
          scene.add(rock);
        }
      });

      // 曲江池荷叶
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 30;
        addLotusLeaf(WATER_CONFIG.qujiang.x + Math.cos(angle) * r, WATER_CONFIG.qujiang.z + Math.sin(angle) * r);
      }

      // 曲江池岸边芦苇
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        addReed(
          WATER_CONFIG.qujiang.x + Math.cos(angle) * (WATER_CONFIG.qujiang.radius + 3),
          WATER_CONFIG.qujiang.z + Math.sin(angle) * (WATER_CONFIG.qujiang.radius + 3)
        );
      }

      // 曲江池石桥
      addBridge(WATER_CONFIG.qujiang.x, WATER_CONFIG.qujiang.z - 30, 15, 3);

      // 曲江池亭子
      addPavilion(WATER_CONFIG.qujiang.x + 20, WATER_CONFIG.qujiang.z - 20);

      // 龙池小木桥
      addBridge(WATER_CONFIG.longchi.x, WATER_CONFIG.longchi.z - 15, 10, 2);

      // 龙池亭子
      addPavilion(WATER_CONFIG.longchi.x + 15, WATER_CONFIG.longchi.z - 10);

      console.log('[Water] 水景系统初始化完成');
    } catch(e) { console.warn('[Water] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 12000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();
