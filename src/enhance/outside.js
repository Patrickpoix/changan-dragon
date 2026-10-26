/* ============================================================
   Outside - 城外环境Owner（增强版）
   注意：原系统已有完整城外田园（明德门外御道+小村庄+城外小河+柳树）
   本模块仅做补充性城外建筑：驿站+水井+城外树林，不重复创建农舍
   全部使用共享几何体UNIT_BOX/UNIT_CYL/UNIT_SPHERE和共享材质MAT
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

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

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Outside] 城外环境初始化...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 四座驿站（补充原系统）
      addPostStation(500, -500);   // 东南驿站
      addPostStation(-550, 500);   // 西北驿站
      addPostStation(550, 500);    // 东北驿站
      addPostStation(-500, -500);  // 西南驿站

      // 东南村落水井（补充原系统）
      addWell(580, 480);

      // 西北村落水井（补充原系统）
      addWell(-520, 550);

      // 城外树林（东南，补充原系统，使用原系统addTree函数）
      if (typeof addTree !== 'undefined') {
        for (let i = 0; i < 40; i++) {
          addTree(600 + Math.random() * 300, 300 + Math.random() * 300, i % 2 ? 'willow' : 'pine', 0.8 + Math.random() * 0.3);
        }
        // 城外树林（西南）
        for (let i = 0; i < 35; i++) {
          addTree(-700 + Math.random() * 300, 300 + Math.random() * 300, i % 2 ? 'willow' : 'pine', 0.8 + Math.random() * 0.3);
        }
        // 城外树林（东北）
        for (let i = 0; i < 35; i++) {
          addTree(600 + Math.random() * 300, -400 + Math.random() * 300, i % 2 ? 'willow' : 'pine', 0.8 + Math.random() * 0.3);
        }
        // 城外树林（西北）
        for (let i = 0; i < 30; i++) {
          addTree(-700 + Math.random() * 300, -400 + Math.random() * 300, i % 2 ? 'willow' : 'pine', 0.8 + Math.random() * 0.3);
        }
      }

      console.log('[Outside] 城外环境初始化完成 - 补充原系统：4驿站+2水井+140城外树，不重复创建已有农舍');
    } catch(e) { console.warn('[Outside] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 16000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();