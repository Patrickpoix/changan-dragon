/* ============================================================
   朱雀大街与城市氛围提升
   正确的后处理模块
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initCityAtmosphere() {
    if (initialized) return;
    initialized = true;

    console.log('[CityAtmosphere] 开始朱雀大街与城市氛围提升...');

    try {
      // ==============================================
      // 1. 朱雀大街增加更多灯笼
      // ==============================================
      // 朱雀大街：x=0，贯穿南北
      // 在街道两侧增加更多灯笼杆
      for (let z = -300; z <= 300; z += 40) {
        // 左侧灯笼杆
        const pole1 = new THREE.Mesh(UNIT_CYL, toon(0x5d4037));
        pole1.scale.set(0.15, 5, 0.15);
        pole1.position.set(-16, 2.5, z);
        pole1.castShadow = true;
        scene.add(pole1);
        // 灯笼
        const lantern1 = new THREE.Mesh(UNIT_SPHERE, MAT.lantern);
        lantern1.scale.set(0.4, 0.5, 0.4);
        lantern1.position.set(-16, 5.2, z);
        scene.add(lantern1);

        // 右侧灯笼杆
        const pole2 = pole1.clone();
        pole2.position.x = 16;
        scene.add(pole2);
        const lantern2 = lantern1.clone();
        lantern2.position.x = 16;
        scene.add(lantern2);
      }
      console.log('[CityAtmosphere] 朱雀大街灯笼已添加');
    } catch(e) {
      console.warn('[CityAtmosphere] 灯笼添加失败:', e);
    }

    try {
      // ==============================================
      // 2. 东西市增加更多摊位
      // ==============================================
      // 西市中心约在(-258, -14)
      for (let i = 0; i < 10; i++) {
        const x = -280 + Math.random() * 50;
        const z = -40 + Math.random() * 50;
        // 摊位桌
        const table = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 2), toon(0x8b4513));
        table.position.set(x, 0.5, z);
        table.castShadow = true;
        scene.add(table);
        // 布篷
        const awning = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 2.5), toon(0x8b0000));
        awning.position.set(x, 2.5, z);
        awning.castShadow = true;
        scene.add(awning);
      }
      console.log('[CityAtmosphere] 西市摊位已添加');
    } catch(e) {
      console.warn('[CityAtmosphere] 摊位添加失败:', e);
    }

    try {
      // ==============================================
      // 3. 整体天空微调（更国风）
      // ==============================================
      // 调整天空顶部颜色为更浅的青蓝色
      skyUniforms.topColor.value.setHex(0x87ceeb);
      // 地平线为更暖的桃色
      skyUniforms.horizonColor.value.setHex(0xffe4c4);
      console.log('[CityAtmosphere] 天空颜色已调整');
    } catch(e) {
      console.warn('[CityAtmosphere] 天空调整失败:', e);
    }

    console.log('[CityAtmosphere] 朱雀大街与城市氛围提升完成！');
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      initCityAtmosphere();
    } else {
      setTimeout(checkReady, 500);
    }
  }

  checkReady();

})();
