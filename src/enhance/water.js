/* ============================================================
   Water - 水景系统Owner（增强版）
   全部使用共享几何体UNIT_BOX/UNIT_CYL/UNIT_SPHERE和共享材质MAT
   ============================================================ */

(function() {
  'use strict';

  const WATER_CONFIG = {
    qujiang: { x: 354, z: 318, radius: 40, boats: 12 },
    longchi: { x: 342, z: -152, radius: 25, boats: 7 },
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
    base.scale.set(8, 0.5, 8);
    base.receiveShadow = true;
    scene.add(base);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const pillar = new THREE.Mesh(UNIT_CYL, MAT.wood);
      pillar.position.set(x + Math.cos(angle) * 3, 3, z + Math.sin(angle) * 3);
      pillar.scale.set(0.4, 5, 0.4);
      pillar.castShadow = true;
      scene.add(pillar);
    }
    const rail = new THREE.Mesh(UNIT_BOX, MAT.wood);
    rail.position.set(x, 2, z);
    rail.scale.set(7, 0.2, 7);
    scene.add(rail);
    const roof = new THREE.Mesh(ROOF_SMALL, MAT.roof || MAT.roofGlazed);
    roof.position.set(x, 6, z);
    roof.scale.set(10, 2.5, 10);
    roof.castShadow = true;
    scene.add(roof);
  }

  function addLotusLeaf(x, z) {
    if (typeof MAT === 'undefined') return;
    const leaf = new THREE.Mesh(UNIT_SPHERE,
      new THREE.MeshStandardMaterial({ color: 0x4a8a4a, roughness: 0.8 }));
    leaf.position.set(x, 0.15, z);
    leaf.scale.set(1, 0.1, 1);
    scene.add(leaf);
  }

  function addLotusFlower(x, z) {
    if (typeof MAT === 'undefined') return;
    const flower = new THREE.Mesh(UNIT_SPHERE,
      new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.7 }));
    flower.position.set(x, 0.4, z);
    flower.scale.set(0.35, 0.35, 0.35);
    scene.add(flower);
  }

  function addReed(x, z) {
    if (typeof MAT === 'undefined') return;
    const reed = new THREE.Mesh(UNIT_CYL,
      new THREE.MeshStandardMaterial({ color: 0x8a9a5a, roughness: 0.9 }));
    reed.position.set(x, 1.2, z);
    reed.scale.set(0.07, 2.4, 0.07);
    scene.add(reed);
  }

  function addFountain(x, z) {
    if (typeof MAT === 'undefined') return;
    const base = new THREE.Mesh(UNIT_CYL, MAT.stone);
    base.position.set(x, 0.2, z);
    base.scale.set(2, 0.4, 2);
    scene.add(base);
    const water = new THREE.Mesh(UNIT_CYL,
      new THREE.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.2, metalness: 0.3 }));
    water.position.set(x, 1.5, z);
    water.scale.set(0.4, 2, 0.4);
    scene.add(water);
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
          WATER_CONFIG.qujiang.x + (Math.random() - 0.5) * 40,
          0.3,
          WATER_CONFIG.qujiang.z + (Math.random() - 0.5) * 40
        );
        boat.scale.set(4, 0.5, 8);
        boat.castShadow = true;
        scene.add(boat);
      }

      // 龙池游船
      for (let i = 0; i < WATER_CONFIG.longchi.boats; i++) {
        const boat = new THREE.Mesh(UNIT_BOX, MAT.wood);
        boat.position.set(
          WATER_CONFIG.longchi.x + (Math.random() - 0.5) * 25,
          0.3,
          WATER_CONFIG.longchi.z + (Math.random() - 0.5) * 25
        );
        boat.scale.set(3.5, 0.4, 7);
        boat.castShadow = true;
        scene.add(boat);
      }

      // 岸线石头
      Object.keys(WATER_CONFIG).forEach(key => {
        const cfg = WATER_CONFIG[key];
        for (let i = 0; i < 60; i++) {
          const angle = (i / 60) * Math.PI * 2;
          const rock = new THREE.Mesh(UNIT_SPHERE, MAT.stone);
          rock.position.set(cfg.x + Math.cos(angle) * (cfg.radius + 2), 0.2, cfg.z + Math.sin(angle) * (cfg.radius + 2));
          const s = 0.6 + Math.random() * 0.7;
          rock.scale.set(s, s * 0.7, s);
          rock.castShadow = true;
          scene.add(rock);
        }
      });

      // 曲江池荷叶
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 40;
        addLotusLeaf(WATER_CONFIG.qujiang.x + Math.cos(angle) * r, WATER_CONFIG.qujiang.z + Math.sin(angle) * r);
      }

      // 曲江池荷花
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 35;
        addLotusFlower(WATER_CONFIG.qujiang.x + Math.cos(angle) * r, WATER_CONFIG.qujiang.z + Math.sin(angle) * r);
      }

      // 龙池荷叶
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 25;
        addLotusLeaf(WATER_CONFIG.longchi.x + Math.cos(angle) * r, WATER_CONFIG.longchi.z + Math.sin(angle) * r);
      }

      // 曲江池岸边芦苇
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        addReed(
          WATER_CONFIG.qujiang.x + Math.cos(angle) * (WATER_CONFIG.qujiang.radius + 3),
          WATER_CONFIG.qujiang.z + Math.sin(angle) * (WATER_CONFIG.qujiang.radius + 3)
        );
      }

      // 龙池岸边芦苇
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        addReed(
          WATER_CONFIG.longchi.x + Math.cos(angle) * (WATER_CONFIG.longchi.radius + 3),
          WATER_CONFIG.longchi.z + Math.sin(angle) * (WATER_CONFIG.longchi.radius + 3)
        );
      }

      // 曲江池石桥
      addBridge(WATER_CONFIG.qujiang.x, WATER_CONFIG.qujiang.z - 30, 22, 4.5);

      // 曲江池亭子
      addPavilion(WATER_CONFIG.qujiang.x + 30, WATER_CONFIG.qujiang.z - 25);

      // 曲江池第二个亭子
      addPavilion(WATER_CONFIG.qujiang.x - 30, WATER_CONFIG.qujiang.z + 25);

      // 龙池小木桥
      addBridge(WATER_CONFIG.longchi.x, WATER_CONFIG.longchi.z - 15, 14, 3.5);

      // 龙池亭子
      addPavilion(WATER_CONFIG.longchi.x + 20, WATER_CONFIG.longchi.z - 15);

      // 兴庆宫喷泉
      addFountain(342, -160);

      // 曲江池第二个喷泉
      addFountain(354, 318);

      console.log('[Water] 水景系统初始化完成 - 19艘游船+2石桥+3亭子(带栏杆)+荷叶荷花芦苇+2喷泉+石头');
    } catch(e) { console.warn('[Water] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 12000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();