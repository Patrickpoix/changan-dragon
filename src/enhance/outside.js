/* ============================================================
   Outside - 城外环境Owner（增强版）
   注意：原系统已有完整城外田园（明德门外御道+小村庄+城外小河+柳树）
   本模块仅做补充性城外建筑：驿站+水井+城外树林，不重复创建农舍
   全部使用共享几何体UNIT_BOX/UNIT_CYL/UNIT_SPHERE和共享材质MAT
   权威坐标：WORLD = { x0: -780, x1: 780, z0: -660, z1: 660 }
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function addPostStation(x, z) {
    if (typeof MAT === 'undefined') return;
    // 驿站主体
    const main = new THREE.Mesh(UNIT_BOX, MAT.plaster || MAT.wood);
    main.position.set(x, 3, z);
    main.scale.set(18, 6, 12);
    main.castShadow = true;
    main.receiveShadow = true;
    scene.add(main);
    // 驿站屋顶
    const roof = new THREE.Mesh(ROOF_UNIT, MAT.roof);
    roof.position.set(x, 7, z);
    roof.scale.set(21, 3.5, 15);
    roof.castShadow = true;
    scene.add(roof);
    // 驿站围墙
    const wall = new THREE.Mesh(UNIT_BOX, MAT.stone);
    wall.position.set(x, 1.5, z + 10);
    wall.scale.set(30, 3, 0.5);
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

  function addMilestone(x, z, direction) {
    if (typeof MAT === 'undefined') return;
    const milestone = new THREE.Mesh(UNIT_BOX, MAT.stone);
    milestone.position.set(x, 1.5, z);
    milestone.scale.set(0.8, 3, 0.3);
    milestone.castShadow = true;
    scene.add(milestone);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Outside] 城外环境初始化...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 四座驿站（补充原系统，位于世界范围边缘）
      addPostStation(500, -500);   // 东南驿站
      addPostStation(-550, 500);   // 西北驿站
      addPostStation(550, 500);    // 东北驿站
      addPostStation(-500, -500);  // 西南驿站

      // 东南村落水井（补充原系统）
      addWell(580, 480);

      // 西北村落水井（补充原系统）
      addWell(-520, 550);

      // 城外里程碑（朱雀大街南段，补充原系统）
      for (let i = 0; i < 8; i++) {
        addMilestone(-8, 400 + i * 15, 'south');
        addMilestone(8, 400 + i * 15, 'south');
      }

      // 城外树林（东南，补充原系统，使用原系统addTree函数）
      // 注意：不直接创建树木，使用原系统的addTree函数，确保正确参与批处理
      if (typeof addTree !== 'undefined') {
        // 东南城外树林
        for (let i = 0; i < 30; i++) {
          addTree(500 + Math.random() * 200, 300 + Math.random() * 200, i % 2 ? 'willow' : 'pine', 0.8 + Math.random() * 0.3);
        }
        // 西南城外树林
        for (let i = 0; i < 25; i++) {
          addTree(-600 + Math.random() * 200, 300 + Math.random() * 200, i % 2 ? 'willow' : 'pine', 0.8 + Math.random() * 0.3);
        }
        // 东北城外树林
        for (let i = 0; i < 25; i++) {
          addTree(500 + Math.random() * 200, -400 + Math.random() * 200, i % 2 ? 'willow' : 'pine', 0.8 + Math.random() * 0.3);
        }
        // 西北城外树林
        for (let i = 0; i < 20; i++) {
          addTree(-600 + Math.random() * 200, -400 + Math.random() * 200, i % 2 ? 'willow' : 'pine', 0.8 + Math.random() * 0.3);
        }
      }

      console.log('[Outside] 城外环境初始化完成 - 补充原系统：4驿站+2水井+16里程碑+100城外树(使用原系统addTree)，不重复创建已有农舍');
    } catch(e) { console.warn('[Outside] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 7000);
    else setTimeout(checkReady, 100);
  }
  checkReady();
})();