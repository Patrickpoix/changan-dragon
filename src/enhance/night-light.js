/* ============================================================
   NightLight - 夜景灯光Owner（增强版）
   全部使用共享几何体UNIT_CYL和共享材质MAT
   与原系统昼夜系统联动：夜晚点亮，白天熄灭
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;
  let pointLights = [];

  function addLantern(x, z, height) {
    if (typeof MAT === 'undefined') return;
    const pole = new THREE.Mesh(UNIT_CYL, MAT.wood);
    pole.position.set(x, (height || 4) / 2, z);
    pole.scale.set(0.2, height || 4, 0.2);
    scene.add(pole);
    const lantern = new THREE.Mesh(UNIT_SPHERE, MAT.lanternGlow || MAT.lantern);
    lantern.position.set(x, (height || 4) + 0.5, z);
    lantern.scale.set(0.6, 0.8, 0.6);
    scene.add(lantern);
  }

  function updateLights() {
    // 根据原系统夜晚状态调整灯光强度
    const nightFactor = typeof GAME !== 'undefined' && GAME.nightT !== undefined ? GAME.nightT : 0;
    pointLights.forEach(light => {
      light.intensity = light.userData.baseIntensity * nightFactor;
    });
    requestAnimationFrame(updateLights);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[NightLight] 夜景灯光初始化...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 朱雀大街灯笼（两侧各30组，非常密集）
      for (let i = 0; i < 30; i++) {
        const z = -400 + i * 28;
        addLantern(-10, z, 5);
        addLantern(10, z, 5);
      }

      // 大明宫宫殿灯光（非常密集）
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 30 + Math.random() * 50;
        addLantern(150 + Math.cos(angle) * r, -432 + Math.sin(angle) * r, 4);
      }

      // 太极宫宫殿灯光（非常密集）
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 25 + Math.random() * 45;
        addLantern(0 + Math.cos(angle) * r, -334 + Math.sin(angle) * r, 4);
      }

      // 东市夜市灯光（非常密集）
      for (let i = 0; i < 20; i++) {
        const x = 150 + Math.random() * 60;
        const z = -40 + Math.random() * 40;
        addLantern(x, z, 3);
      }

      // 西市夜市灯光（非常密集）
      for (let i = 0; i < 20; i++) {
        const x = -290 + Math.random() * 60;
        const z = -40 + Math.random() * 40;
        addLantern(x, z, 3);
      }

      // 大雁塔灯光（非常多）
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        addLantern(216 + Math.cos(angle) * 16, 283 + Math.sin(angle) * 16, 4);
      }

      // 小雁塔灯光（非常多）
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        addLantern(-216 + Math.cos(angle) * 16, 349 + Math.sin(angle) * 16, 4);
      }

      // 兴庆宫灯火（非常密集）
      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 30 + Math.random() * 50;
        addLantern(342 + Math.cos(angle) * r, -152 + Math.sin(angle) * r, 4);
      }

      // 曲江池夜游灯光（非常多）
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        addLantern(354 + Math.cos(angle) * 46, 318 + Math.sin(angle) * 46, 3.5);
      }

      // 明德门灯光（非常多）
      for (let i = 0; i < 18; i++) {
        const x = -30 + i * 3.5;
        addLantern(x, 380, 4);
      }

      // 添加点光源（增强夜景效果，与昼夜系统联动）
      const lanternPositions = [
        { x: 0, z: 0, intensity: 0.8, distance: 100 },
        { x: 150, z: -432, intensity: 1.0, distance: 120 },
        { x: 0, z: -334, intensity: 0.9, distance: 110 },
        { x: 342, z: -152, intensity: 0.8, distance: 100 },
        { x: 354, z: 318, intensity: 0.7, distance: 90 },
        { x: 216, z: 283, intensity: 0.6, distance: 80 },
        { x: -216, z: 349, intensity: 0.6, distance: 80 },
        { x: 174, z: -14, intensity: 0.7, distance: 70 },
        { x: -258, z: -14, intensity: 0.7, distance: 70 },
        { x: 0, z: 380, intensity: 0.8, distance: 80 },
      ];

      lanternPositions.forEach(pos => {
        const light = new THREE.PointLight(0xffc97a, 0, pos.distance, 2);
        light.position.set(pos.x, 8, pos.z);
        light.userData.baseIntensity = pos.intensity;
        pointLights.push(light);
        scene.add(light);
      });

      // 启动灯光更新循环
      updateLights();

      console.log('[NightLight] 夜景灯光初始化完成 - 10组点光源(昼夜联动)+200+灯笼，夜晚点亮白天熄灭');
    } catch(e) { console.warn('[NightLight] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 18000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();