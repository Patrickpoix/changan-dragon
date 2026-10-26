/* ============================================================
   Water - 水景系统Owner
   负责：所有水面/船/桥/岸线/亭子
   ============================================================ */

(function() {
  'use strict';

  const WATER_CONFIG = {
    qujiang: { x: 354, z: 318, radius: 40, boats: 3 },
    longchi: { x: 342, z: -152, radius: 25, boats: 2 },
    moat: { z: 400, width: 900, depth: 20 },
  };

  let initialized = false;

  function addBridge(x, z, length, width) {
    if (typeof MAT === 'undefined') return;
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(width, 0.5, length), MAT.stone);
    bridge.position.set(x, 0.3, z);
    bridge.receiveShadow = true;
    bridge.castShadow = true;
    scene.add(bridge);
  }

  function addPavilion(x, z) {
    if (typeof MAT === 'undefined') return;
    // 亭子基座
    const base = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 6), MAT.stone);
    base.position.set(x, 0.25, z);
    base.receiveShadow = true;
    scene.add(base);
    // 亭子柱子
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3, 6), MAT.wood);
      pillar.position.set(x + Math.cos(angle) * 2, 2, z + Math.sin(angle) * 2);
      pillar.castShadow = true;
      scene.add(pillar);
    }
    // 亭子屋顶（四角攒尖）
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4, 2, 4), MAT.roof || MAT.roofGlazed);
    roof.position.set(x, 4.5, z);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Water] 初始化水景系统...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 曲江池游船
      for (let i = 0; i < WATER_CONFIG.qujiang.boats; i++) {
        const boat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 6), MAT.wood);
        boat.position.set(
          WATER_CONFIG.qujiang.x + (Math.random() - 0.5) * 30,
          0.3,
          WATER_CONFIG.qujiang.z + (Math.random() - 0.5) * 30
        );
        boat.castShadow = true;
        scene.add(boat);
      }

      // 龙池游船
      for (let i = 0; i < WATER_CONFIG.longchi.boats; i++) {
        const boat = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 5), MAT.wood);
        boat.position.set(
          WATER_CONFIG.longchi.x + (Math.random() - 0.5) * 20,
          0.3,
          WATER_CONFIG.longchi.z + (Math.random() - 0.5) * 20
        );
        boat.castShadow = true;
        scene.add(boat);
      }

      // 岸线石头
      Object.keys(WATER_CONFIG).forEach(key => {
        if (key === 'moat') return;
        const cfg = WATER_CONFIG[key];
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.4, 0), MAT.stone);
          rock.position.set(cfg.x + Math.cos(angle) * (cfg.radius + 2), 0.2, cfg.z + Math.sin(angle) * (cfg.radius + 2));
          rock.castShadow = true;
          scene.add(rock);
        }
      });

      // 曲江池石桥
      addBridge(WATER_CONFIG.qujiang.x, WATER_CONFIG.qujiang.z - 30, 15, 3);

      // 曲江池亭子
      addPavilion(WATER_CONFIG.qujiang.x + 20, WATER_CONFIG.qujiang.z - 20);

      // 龙池小木桥
      addBridge(WATER_CONFIG.longchi.x, WATER_CONFIG.longchi.z - 15, 10, 2);

      console.log('[Water] 水景系统初始化完成');
    } catch(e) { console.warn('[Water] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 12000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();
