/* ============================================================
   Outside - 城外环境Owner
   负责：城外农田/树林/村落/驿站/护城河
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function addPostStation(x, z) {
    if (typeof MAT === 'undefined') return;
    // 驿站主建筑
    const main = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 8), MAT.wall || MAT.wood);
    main.position.set(x, 2.5, z);
    main.castShadow = true;
    main.receiveShadow = true;
    scene.add(main);
    // 驿站屋顶
    const roof = new THREE.Mesh(new THREE.ConeGeometry(9, 3, 4), MAT.roof || MAT.roofGlazed);
    roof.position.set(x, 6.5, z);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Outside] 初始化城外环境系统...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 南护城河
      const moatMat = new THREE.MeshStandardMaterial({ color: 0x2a4a5a, roughness: 0.3, metalness: 0.1 });
      const moat = new THREE.Mesh(new THREE.PlaneGeometry(900, 20), moatMat);
      moat.rotation.x = -Math.PI / 2;
      moat.position.set(0, 0.1, 400);
      scene.add(moat);

      // 明德门桥
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 20), MAT.stone);
      bridge.position.set(0, 0.3, 400);
      bridge.receiveShadow = true;
      scene.add(bridge);

      // 城外农田
      for (let i = 0; i < 10; i++) {
        const field = new THREE.Mesh(new THREE.PlaneGeometry(30, 20),
          new THREE.MeshStandardMaterial({ color: 0x6a8a4a, roughness: 0.9 }));
        field.rotation.x = -Math.PI / 2;
        field.position.set(-200 + i * 40, 0.05, 450 + Math.random() * 30);
        scene.add(field);
      }

      // 城外东南树林
      for (let i = 0; i < 30; i++) {
        const x = 450 + Math.random() * 100;
        const z = 350 + Math.random() * 100;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 3, 5), MAT.wood);
        trunk.position.set(x, 1.5, z);
        trunk.castShadow = true;
        scene.add(trunk);
        const leaves = new THREE.Mesh(new THREE.SphereGeometry(2, 6, 5),
          new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.9 }));
        leaves.position.set(x, 4, z);
        leaves.castShadow = true;
        scene.add(leaves);
      }

      // 城外村落（5间农舍）
      for (let i = 0; i < 5; i++) {
        const x = 500 + (Math.random() - 0.5) * 60;
        const z = 450 + (Math.random() - 0.5) * 60;
        const house = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 5), MAT.wall || MAT.wood);
        house.position.set(x, 1.5, z);
        house.castShadow = true;
        scene.add(house);
      }

      // 南门外驿站
      addPostStation(100, 450);

      console.log('[Outside] 城外环境系统初始化完成');
    } catch(e) { console.warn('[Outside] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 16000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();
