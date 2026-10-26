/* ============================================================
   Water - 水景系统Owner
   负责：所有水面/船/桥/岸线/荷花
   ============================================================ */

(function() {
  'use strict';

  const WATER_CONFIG = {
    qujiang: { x: 354, z: 318, radius: 40, boats: 3 },
    longchi: { x: 342, z: -152, radius: 25, boats: 2 },
    moat: { z: 400, width: 900, depth: 20 },
  };

  let initialized = false;

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

      console.log('[Water] 水景系统初始化完成');
    } catch(e) { console.warn('[Water] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 12000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();
