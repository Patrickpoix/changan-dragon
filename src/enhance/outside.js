/* ============================================================
   Outside - 城外环境Owner（增强版）
   注意：原系统buildGround()已有70块城外农田
   本模块仅添加：护城河/桥/村落/驿站/树林
   全部使用共享几何体和共享材质
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function addPostStation(x, z) {
    if (typeof MAT === 'undefined') return;
    const main = new THREE.Mesh(UNIT_BOX, MAT.wood);
    main.position.set(x, 3, z);
    main.scale.set(14, 6, 10);
    main.castShadow = true;
    main.receiveShadow = true;
    scene.add(main);
    const roof = new THREE.Mesh(ROOF_UNIT, MAT.roof || MAT.roofGlazed);
    roof.position.set(x, 6, z);
    roof.scale.set(16, 2.5, 12);
    roof.castShadow = true;
    scene.add(roof);
    // 驿站院子围墙
    const wall1 = new THREE.Mesh(UNIT_BOX, MAT.plaster || MAT.stone);
    wall1.position.set(x, 1, z - 10);
    wall1.scale.set(20, 2, 0.5);
    scene.add(wall1);
    const wall2 = new THREE.Mesh(UNIT_BOX, MAT.plaster || MAT.stone);
    wall2.position.set(x - 10, 1, z);
    wall2.scale.set(0.5, 2, 20);
    scene.add(wall2);
  }

  function addVillageHouse(x, z) {
    if (typeof MAT === 'undefined') return;
    const house = new THREE.Mesh(UNIT_BOX, MAT.plaster || MAT.wood);
    house.position.set(x, 1.5, z);
    house.scale.set(7, 3, 6);
    house.castShadow = true;
    scene.add(house);
    const roof = new THREE.Mesh(ROOF_SMALL, MAT.roof);
    roof.position.set(x, 3, z);
    roof.scale.set(8, 1.5, 7);
    roof.castShadow = true;
    scene.add(roof);
  }

  function addTree(x, z) {
    if (typeof MAT === 'undefined') return;
    const trunk = new THREE.Mesh(UNIT_CYL, MAT.trunk || MAT.wood);
    trunk.position.set(x, 2, z);
    trunk.scale.set(0.4, 4, 0.4);
    trunk.castShadow = true;
    scene.add(trunk);
    const leaves = new THREE.Mesh(UNIT_SPHERE, MAT.leaf);
    leaves.position.set(x, 5, z);
    leaves.scale.set(3.5, 3.5, 3.5);
    leaves.castShadow = true;
    scene.add(leaves);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Outside] 城外环境增强初始化...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 南护城河
      const moatMat = new THREE.MeshStandardMaterial({ color: 0x2a4a5a, roughness: 0.3, metalness: 0.1 });
      const moat = new THREE.Mesh(new THREE.PlaneGeometry(900, 25), moatMat);
      moat.rotation.x = -Math.PI / 2;
      moat.position.set(0, 0.1, 400);
      scene.add(moat);

      // 明德门桥
      const bridge = new THREE.Mesh(UNIT_BOX, MAT.stone);
      bridge.position.set(0, 0.3, 400);
      bridge.scale.set(10, 0.5, 25);
      bridge.receiveShadow = true;
      scene.add(bridge);

      // 城外东南树林
      for (let i = 0; i < 60; i++) {
        const x = 450 + Math.random() * 180;
        const z = 350 + Math.random() * 180;
        addTree(x, z);
      }

      // 城外西南树林
      for (let i = 0; i < 45; i++) {
        const x = -580 + Math.random() * 120;
        const z = 350 + Math.random() * 120;
        addTree(x, z);
      }

      // 城外东北树林
      for (let i = 0; i < 45; i++) {
        const x = 450 + Math.random() * 120;
        const z = -580 + Math.random() * 120;
        addTree(x, z);
      }

      // 城外西北树林
      for (let i = 0; i < 35; i++) {
        const x = -580 + Math.random() * 120;
        const z = -580 + Math.random() * 120;
        addTree(x, z);
      }

      // 城外村落（东南18间农舍）
      for (let i = 0; i < 18; i++) {
        const x = 520 + (Math.random() - 0.5) * 100;
        const z = 480 + (Math.random() - 0.5) * 100;
        addVillageHouse(x, z);
      }

      // 西北村落（12间农舍）
      for (let i = 0; i < 12; i++) {
        const x = -580 + (Math.random() - 0.5) * 80;
        const z = -480 + (Math.random() - 0.5) * 80;
        addVillageHouse(x, z);
      }

      // 南门外驿站
      addPostStation(100, 480);

      // 西门外驿站
      addPostStation(-550, 0);

      // 东门外驿站
      addPostStation(550, 0);

      // 北门外驿站
      addPostStation(0, -550);

      console.log('[Outside] 城外环境增强完成 - 护城河加宽+桥加宽+30间农舍+4驿站(带围墙)+185棵树');
    } catch(e) { console.warn('[Outside] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 16000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();