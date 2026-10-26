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
    // 驿站主建筑 - 使用共享UNIT_BOX
    const main = new THREE.Mesh(UNIT_BOX, MAT.wood);
    main.position.set(x, 2.5, z);
    main.scale.set(12, 5, 8);
    main.castShadow = true;
    main.receiveShadow = true;
    scene.add(main);
    // 驿站屋顶 - 使用共享ROOF_UNIT
    const roof = new THREE.Mesh(ROOF_UNIT, MAT.roof || MAT.roofGlazed);
    roof.position.set(x, 5, z);
    roof.scale.set(14, 2, 10);
    roof.castShadow = true;
    scene.add(roof);
  }

  function addVillageHouse(x, z) {
    if (typeof MAT === 'undefined') return;
    const house = new THREE.Mesh(UNIT_BOX, MAT.plaster || MAT.wood);
    house.position.set(x, 1.5, z);
    house.scale.set(6, 3, 5);
    house.castShadow = true;
    scene.add(house);
    const roof = new THREE.Mesh(ROOF_SMALL, MAT.roof);
    roof.position.set(x, 3, z);
    roof.scale.set(7, 1.5, 6);
    roof.castShadow = true;
    scene.add(roof);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Outside] 城外环境增强初始化...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 南护城河
      const moatMat = new THREE.MeshStandardMaterial({ color: 0x2a4a5a, roughness: 0.3, metalness: 0.1 });
      const moat = new THREE.Mesh(new THREE.PlaneGeometry(900, 20), moatMat);
      moat.rotation.x = -Math.PI / 2;
      moat.position.set(0, 0.1, 400);
      scene.add(moat);

      // 明德门桥 - 使用共享UNIT_BOX
      const bridge = new THREE.Mesh(UNIT_BOX, MAT.stone);
      bridge.position.set(0, 0.3, 400);
      bridge.scale.set(8, 0.5, 20);
      bridge.receiveShadow = true;
      scene.add(bridge);

      // 城外东南树林 - 使用共享UNIT_CYL和UNIT_SPHERE
      for (let i = 0; i < 20; i++) {
        const x = 450 + Math.random() * 100;
        const z = 350 + Math.random() * 100;
        const trunk = new THREE.Mesh(UNIT_CYL, MAT.trunk || MAT.wood);
        trunk.position.set(x, 1.5, z);
        trunk.scale.set(0.4, 3, 0.4);
        trunk.castShadow = true;
        scene.add(trunk);
        const leaves = new THREE.Mesh(UNIT_SPHERE, MAT.leaf || MAT.blossom);
        leaves.position.set(x, 4, z);
        leaves.scale.set(3, 3, 3);
        leaves.castShadow = true;
        scene.add(leaves);
      }

      // 城外村落（5间农舍）- 使用共享几何体
      for (let i = 0; i < 5; i++) {
        const x = 500 + (Math.random() - 0.5) * 60;
        const z = 450 + (Math.random() - 0.5) * 60;
        addVillageHouse(x, z);
      }

      // 南门外驿站
      addPostStation(100, 450);

      console.log('[Outside] 城外环境增强完成');
    } catch(e) { console.warn('[Outside] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 16000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();
