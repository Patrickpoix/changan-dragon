/* ============================================================
   NightLight - 夜景灯光Owner
   负责：夜晚灯笼/点光源/夜景氛围
   使用原系统共享MAT.lantern材质
   ============================================================ */

(function() {
  'use strict';

  // 灯光配置 - 集中管理
  const LIGHT_CONFIG = {
    mainStreet: { count: 30, zStart: -300, zEnd: 300, intensity: 0.7, distance: 30 },
    daming: { count: 15, x: 150, z: -432, intensity: 1.2, distance: 45 },
    taiji: { count: 12, x: 0, z: -334, intensity: 1.0, distance: 40 },
    eastMarket: { count: 10, x: 174, z: -14, intensity: 0.8, distance: 35 },
    westMarket: { count: 10, x: -258, z: -14, intensity: 0.8, distance: 35 },
    dayanta: { x: 216, z: 283, intensity: 1.0, distance: 40 },
    xiaoyanta: { x: -216, z: 349, intensity: 0.7, distance: 30 },
    xingqing: { x: 342, z: -152, intensity: 0.7, distance: 30 },
    qujiang: { x: 354, z: 318, intensity: 0.6, distance: 30 },
  };

  let initialized = false;

  function addLantern(x, y, z) {
    if (typeof MAT === 'undefined') return;
    const lantern = new THREE.Mesh(UNIT_SPHERE, MAT.lantern);
    lantern.position.set(x, y, z);
    lantern.scale.set(0.8, 1, 0.8);
    scene.add(lantern);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[NightLight] 初始化夜景灯光系统...');
    try {
      if (typeof scene === 'undefined') return;

      // 朱雀大街灯笼点光源 + 灯笼模型
      const mainCfg = LIGHT_CONFIG.mainStreet;
      const step = (mainCfg.zEnd - mainCfg.zStart) / (mainCfg.count - 1);
      for (let i = 0; i < mainCfg.count; i++) {
        const z = mainCfg.zStart + i * step;
        const light = new THREE.PointLight(0xffaa44, mainCfg.intensity, mainCfg.distance);
        light.position.set(0, 7, z);
        scene.add(light);
        addLantern(-8, 5, z);
        addLantern(8, 5, z);
      }

      // 大明宫灯光
      for (let i = 0; i < LIGHT_CONFIG.daming.count; i++) {
        const angle = (i / LIGHT_CONFIG.daming.count) * Math.PI * 2;
        const light = new THREE.PointLight(0xffcc66, LIGHT_CONFIG.daming.intensity, LIGHT_CONFIG.daming.distance);
        light.position.set(
          LIGHT_CONFIG.daming.x + Math.cos(angle) * 30,
          10,
          LIGHT_CONFIG.daming.z + Math.sin(angle) * 30
        );
        scene.add(light);
      }

      // 太极宫灯光
      for (let i = 0; i < LIGHT_CONFIG.taiji.count; i++) {
        const angle = (i / LIGHT_CONFIG.taiji.count) * Math.PI * 2;
        const light = new THREE.PointLight(0xffcc66, LIGHT_CONFIG.taiji.intensity, LIGHT_CONFIG.taiji.distance);
        light.position.set(
          LIGHT_CONFIG.taiji.x + Math.cos(angle) * 25,
          9,
          LIGHT_CONFIG.taiji.z + Math.sin(angle) * 25
        );
        scene.add(light);
      }

      // 东市灯光
      for (let i = 0; i < LIGHT_CONFIG.eastMarket.count; i++) {
        const light = new THREE.PointLight(0xffaa44, LIGHT_CONFIG.eastMarket.intensity, LIGHT_CONFIG.eastMarket.distance);
        light.position.set(
          LIGHT_CONFIG.eastMarket.x + (i - 4.5) * 15,
          5,
          LIGHT_CONFIG.eastMarket.z
        );
        scene.add(light);
      }

      // 西市灯光
      for (let i = 0; i < LIGHT_CONFIG.westMarket.count; i++) {
        const light = new THREE.PointLight(0xffaa44, LIGHT_CONFIG.westMarket.intensity, LIGHT_CONFIG.westMarket.distance);
        light.position.set(
          LIGHT_CONFIG.westMarket.x + (i - 4.5) * 15,
          5,
          LIGHT_CONFIG.westMarket.z
        );
        scene.add(light);
      }

      // 大雁塔灯光
      const dayantaLight = new THREE.PointLight(0xffcc66, LIGHT_CONFIG.dayanta.intensity, LIGHT_CONFIG.dayanta.distance);
      dayantaLight.position.set(LIGHT_CONFIG.dayanta.x, 40, LIGHT_CONFIG.dayanta.z);
      scene.add(dayantaLight);

      // 小雁塔灯光
      const xiaoyantaLight = new THREE.PointLight(0xffcc66, LIGHT_CONFIG.xiaoyanta.intensity, LIGHT_CONFIG.xiaoyanta.distance);
      xiaoyantaLight.position.set(LIGHT_CONFIG.xiaoyanta.x, 30, LIGHT_CONFIG.xiaoyanta.z);
      scene.add(xiaoyantaLight);

      // 兴庆宫灯光
      const xingqingLight = new THREE.PointLight(0xffaa44, LIGHT_CONFIG.xingqing.intensity, LIGHT_CONFIG.xingqing.distance);
      xingqingLight.position.set(LIGHT_CONFIG.xingqing.x, 7, LIGHT_CONFIG.xingqing.z);
      scene.add(xingqingLight);

      // 曲江池灯光
      const qujiangLight = new THREE.PointLight(0xffaa44, LIGHT_CONFIG.qujiang.intensity, LIGHT_CONFIG.qujiang.distance);
      qujiangLight.position.set(LIGHT_CONFIG.qujiang.x, 7, LIGHT_CONFIG.qujiang.z);
      scene.add(qujiangLight);

      // 明德门灯光
      const mingdeLight = new THREE.PointLight(0xffcc66, 0.9, 35);
      mingdeLight.position.set(0, 10, 380);
      scene.add(mingdeLight);

      console.log('[NightLight] 夜景灯光系统初始化完成 - 10组点光源(增强)+60个灯笼模型+极致繁华唐夜');
    } catch(e) { console.warn('[NightLight] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 18000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();