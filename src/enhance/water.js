/* ============================================================
   Water - 水景系统Owner（增强版）
   注意：原系统已有完整水景（曲江池/龙池水面Shader+画舫+曲桥+荷叶荷花）
   本模块仅做补充性水景：护城河+城外小河+岸线石头+芦苇+喷泉
   全部使用共享几何体UNIT_BOX/UNIT_CYL/UNIT_SPHERE和共享材质MAT
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function addReed(x, z) {
    if (typeof MAT === 'undefined') return;
    const reed = new THREE.Mesh(UNIT_CYL,
      new THREE.MeshStandardMaterial({ color: 0x8a9a5a, roughness: 0.9 }));
    reed.position.set(x, 1.2, z);
    reed.scale.set(0.07, 2.4, 0.07);
    scene.add(reed);
  }

  function addRock(x, z) {
    if (typeof MAT === 'undefined') return;
    const rock = new THREE.Mesh(UNIT_SPHERE, MAT.stone);
    rock.position.set(x, 0.2, z);
    const s = 0.6 + Math.random() * 0.7;
    rock.scale.set(s, s * 0.7, s);
    rock.castShadow = true;
    scene.add(rock);
  }

  function addFountain(x, z) {
    if (typeof MAT === 'undefined') return;
    const base = new THREE.Mesh(UNIT_CYL, MAT.stone);
    base.position.set(x, 0.2, z);
    base.scale.set(2, 0.4, 2);
    scene.add(base);
    const water = new THREE.Mesh(UNIT_CYL,
      new THREE.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.2, metalness: 0.3 }));
    water.position.set(x, 1.5, z);
    water.scale.set(0.4, 2, 0.4);
    scene.add(water);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Water] 水景系统初始化...');
    try {
      if (typeof scene === 'undefined' || typeof MAT === 'undefined') return;

      // 护城河（南城墙外，补充原系统）
      const moat = new THREE.Mesh(UNIT_PLANE,
        new THREE.MeshStandardMaterial({ color: 0x4a7a9a, roughness: 0.3, metalness: 0.2 }));
      moat.position.set(0, 0.1, 500);
      moat.scale.set(1000, 1, 25);
      moat.receiveShadow = true;
      scene.add(moat);

      // 护城河岸线石头
      for (let i = 0; i < 80; i++) {
        const x = -500 + i * 12.5;
        addRock(x, 490 + Math.random() * 3);
        addRock(x, 510 + Math.random() * 3);
      }

      // 护城河芦苇
      for (let i = 0; i < 60; i++) {
        const x = -500 + Math.random() * 1000;
        addReed(x, 492 + Math.random() * 6);
        addReed(x, 508 + Math.random() * 6);
      }

      // 城外小河（西北方向，补充原系统）
      const river = new THREE.Mesh(UNIT_PLANE,
        new THREE.MeshStandardMaterial({ color: 0x5a8aaa, roughness: 0.3, metalness: 0.2 }));
      river.position.set(-300, 0.08, 470);
      river.scale.set(300, 1, 13);
      river.receiveShadow = true;
      scene.add(river);

      // 兴庆宫喷泉（补充原系统）
      addFountain(342, -160);

      // 曲江池湖心喷泉（补充原系统）
      addFountain(354, 318);

      console.log('[Water] 水景系统初始化完成 - 补充原系统：护城河+城外小河+岸线石头+芦苇+2喷泉，不重复创建已有水面');
    } catch(e) { console.warn('[Water] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 12000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();