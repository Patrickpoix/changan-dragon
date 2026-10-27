/* ============================================================
   NightLight - 夜景灯光Owner（v5）
   修复：宫殿灯笼改 mulberry32 种子随机（布局可复现）；
        明德门灯笼移到城门内（z=375，不在城墙外 z=384）；
        灯笼用 UNIT_CYL（柱）+ UNIT_SPHERE（灯罩）分层。
   ============================================================ */

(function() {
  'use strict';

  let registered = false;
  const pointLights = [];

  const R = mulberry32(20261029);

  function init() {
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined' || typeof Batch === 'undefined') return;

      const positions = [];

      for (let i = 0; i < 12; i++) {
        const angle = R() * Math.PI * 2, r = 34 + R() * 40;
        positions.push([150 + Math.cos(angle) * r, -432 + Math.sin(angle) * r, 4]);
      }
      for (let i = 0; i < 10; i++) {
        const angle = R() * Math.PI * 2, r = 30 + R() * 35;
        positions.push([0 + Math.cos(angle) * r, -334 + Math.sin(angle) * r, 4]);
      }
      for (let i = 0; i < 8; i++) {
        const angle = R() * Math.PI * 2, r = 34 + R() * 30;
        positions.push([342 + Math.cos(angle) * r, -152 + Math.sin(angle) * r, 4]);
      }
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        positions.push([216 + Math.cos(angle) * 16, 283 + Math.sin(angle) * 16, 4]);
      }
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        positions.push([-216 + Math.cos(angle) * 14, 349 + Math.sin(angle) * 14, 4]);
      }
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        positions.push([354 + Math.cos(angle) * 46, 318 + Math.sin(angle) * 38, 3.5]);
      }
      for (let i = 0; i < 8; i++) positions.push([-16 + i * 4.6, 375, 4]);

      const poles = new Batch(UNIT_CYL, MAT.wood, { cast: true });
      const shades = new Batch(UNIT_SPHERE, MAT.lanternGlow || MAT.lantern, { cast: false });
      positions.forEach(p => {
        const h = p[2];
        poles.add(p[0], h / 2, p[1], 0.15, h, 0.15);
        shades.add(p[0], h + 0.3, p[1], 0.35, 0.45, 0.35);
      });
      poles.build();
      shades.build();

      const lanternPositions = [
        { x: 150, z: -432, intensity: 0.8, distance: 100 },
        { x: 0, z: -334, intensity: 0.7, distance: 90 },
        { x: 342, z: -152, intensity: 0.6, distance: 80 },
        { x: 354, z: 318, intensity: 0.5, distance: 70 },
        { x: 216, z: 283, intensity: 0.4, distance: 60 },
        { x: -216, z: 349, intensity: 0.4, distance: 60 },
        { x: 0, z: 380, intensity: 0.6, distance: 60 },
      ];
      lanternPositions.forEach(pos => {
        const light = new THREE.PointLight(0xffc97a, 0, pos.distance, 2);
        light.position.set(pos.x, 8, pos.z);
        light.userData.baseIntensity = pos.intensity;
        pointLights.push(light);
        scene.add(light);
      });

      if (typeof window !== 'undefined') window.__nightLights = pointLights;

      console.log('[NightLight] v5: 64 lanterns (seeded, pole+shade) + 7 point lights');
    } catch(e) { console.warn('[NightLight] init failed:', e); }
  }

  function register() {
    if (registered) return;
    registered = true;
    if (window.__enhance) {
      window.__enhance.register('night-light', init, 70);
    } else {
      (window.__enhancePending = window.__enhancePending || []).push({ owner: 'night-light', fn: init, priority: 70 });
    }
  }

  if (typeof GAME !== 'undefined' && GAME.ready) register();
  else {
    let tries = 0;
    (function check() {
      if (typeof GAME !== 'undefined' && GAME.ready) register();
      else if (tries++ < 400) setTimeout(check, 100);
      else { if (window.__enhance) window.__enhance.register('night-light', init, 70); }
    })();
  }
})();
