/* ============================================================
   Outside - 城外环境Owner（增强版）
   全部使用共享几何体UNIT_BOX/UNIT_CYL/UNIT_SPHERE和共享材质MAT
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function addBridge(x, z, length) {
    if (typeof MAT === 'undefined') return;
    const bridge = new THREE.Mesh(UNIT_BOX, MAT.wood);
    bridge.position.set(x, 1, z);
    bridge.scale.set(5, 0.5, length);
    bridge.receiveShadow = true;
    bridge.castShadow = true;
    scene.add(bridge);
  }

  function addVillageHouse(x, z) {
    if (typeof MAT === 'undefined') return;
    const base = new THREE.Mesh(UNIT_BOX, MAT.plaster || MAT.wood);
    base.position.set(x, 1.5, z);
    base.scale.set(8, 3, 6);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    const roof = new THREE.Mesh(ROOF_SMALL, MAT.roof);
    roof.position.set(x, 4, z);
    roof.scale.set(10, 2, 8);
    roof.castShadow = true;
    scene.add(roof);
  }

  function addTree(x, z) {
    if (typeof MAT === 'undefined') return;
    const trunk = new THREE.Mesh(UNIT_CYL, MAT.trunk || MAT.wood);
    trunk.position.set(x, 2, z);
    trunk.scale.set(0.3, 4, 0.3);
    trunk.castShadow = true;
    scene.add(trunk);
    const leaves = new THREE.Mesh(UNIT_SPHERE, MAT.leaf);
    leaves.position.set(x, 5.5, z);
    leaves.scale.set(3.5, 3.5, 3.5);
    leaves.castShadow = true;
    scene.add(leaves);
  }

  function addWell(x, z) {
    if (typeof MAT === 'undefined') return;
    const base = new THREE.Mesh(UNIT_CYL, MAT.stone);
    base.position.set(x, 0.5, z);
    base.scale.set(1.5, 1, 1.5);
    base.castShadow = true;
    scene.add(base);
    const roof = new THREE.Mesh(ROOF_SMALL, MAT.roof);
    roof.position.set(x, 2.5, z);
    roof.scale.set(3, 1.5, 3);
    roof.castShadow = true;
    scene.add(roof);
  }

  function addPostStation(x, z) {
    if (typeof MAT === 'undefined') return;
    // 驿站主体
    const main = new THREE.Mesh(UNIT_BOX, MAT.plaster || MAT.wood);
    main.position.set(x, 3, z);
    main.scale.set(15, 6, 10);
    main.castShadow = true;
    main.receiveShadow = true;
    scene.add(main);
    // 驿站屋顶
    const roof = new THREE.Mesh(ROOF_UNIT, MAT.roof);
    roof.position.set(x, 7, z);
    roof.scale.set(18, 3.5, 13);
    roof.castShadow = true;
    scene.add(roof);
    // 驿站围墙
    const wall = new THREE.Mesh(UNIT_BOX, MAT.stone);
    wall.position.set(x, 1.5, z + 8);
    wall.scale.set(25, 3, 0.5);
    wall.castShadow = true;
    scene.add(wall);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Outside] 城外环境初始化...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 护城河（南城墙外，宽25米）
      const moat = new THREE.Mesh(UNIT_PLANE,
        new THREE.MeshStandardMaterial({ color: 0x4a7a9a, roughness: 0.3, metalness: 0.2 }));
      moat.position.set(0, 0.1, 500);
      moat.scale.set(1000, 1, 25);
      moat.receiveShadow = true;
      scene.add(moat);

      // 护城河桥（明德门外）
      addBridge(0, 500, 30);

      // 城外村落（东南方向，25间农舍）
      for (let i = 0; i < 25; i++) {
        const x = 500 + Math.random() * 200;
        const z = 400 + Math.random() * 200;
        addVillageHouse(x, z);
      }

      // 城外村落（西北方向，15间农舍）
      for (let i = 0; i < 15; i++) {
        const x = -600 + Math.random() * 150;
        const z = -500 + Math.random() * 200;
        addVillageHouse(x, z);
      }

      // 东南西北四座驿站
      addPostStation(500, -500);   // 东南
      addPostStation(-550, 500);   // 西北
      addPostStation(550, 500);    // 东北
      addPostStation(-500, -500);  // 西南

      // 城外树林（东南，80棵）
      for (let i = 0; i < 80; i++) {
        addTree(600 + Math.random() * 300, 300 + Math.random() * 300);
      }

      // 城外树林（西南，70棵）
      for (let i = 0; i < 70; i++) {
        addTree(-700 + Math.random() * 300, 300 + Math.random() * 300);
      }

      // 城外树林（东北，70棵）
      for (let i = 0; i < 70; i++) {
        addTree(600 + Math.random() * 300, -400 + Math.random() * 300);
      }

      // 城外树林（西北，60棵）
      for (let i = 0; i < 60; i++) {
        addTree(-700 + Math.random() * 300, -400 + Math.random() * 300);
      }

      // 东南村落水井
      addWell(580, 480);

      // 西北村落水井
      addWell(-520, 550);

      console.log('[Outside] 城外环境初始化完成 - 护城河+桥+40农舍+4驿站+280树+2水井');
    } catch(e) { console.warn('[Outside] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 16000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();