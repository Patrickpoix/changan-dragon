/* ============================================================
   Water - 水景系统Owner（增强版）
   注意：原系统已有完整水景（曲江池/龙池水面Shader+画舫+曲桥+荷叶荷花）
   以及城外小河（buildOutskirts中的waterMat小河）
   本模块仅做补充：护城河（waterMat共享Shader）+岸线石头+芦苇
   全部使用共享几何体UNIT_*和共享材质waterMat/MAT
   权威坐标：CITY = { x0: -450, x1: 450, z0: -380, z1: 380 }
   护城河应在城墙外：z=400（城墙z=380外）
   通过 __enhance.register 注册（优先级60）
   ============================================================ */

(function() {
  'use strict';

  function addReed(x, z) {
    if (typeof MAT === 'undefined' || typeof UNIT_CYL === 'undefined') return;
    const reed = new THREE.Mesh(UNIT_CYL,
      new THREE.MeshStandardMaterial({ color: 0x8a9a5a, roughness: 0.9 }));
    reed.position.set(x, 1.0, z);
    reed.scale.set(0.07, 2.0, 0.07);
    scene.add(reed);
  }

  function addRock(x, z) {
    if (typeof MAT === 'undefined' || typeof UNIT_SPHERE === 'undefined') return;
    const rock = new THREE.Mesh(UNIT_SPHERE, MAT.stone);
    rock.position.set(x, 0.18, z);
    const s = 0.5 + Math.random() * 0.6;
    rock.scale.set(s, s * 0.65, s);
    rock.castShadow = true;
    scene.add(rock);
  }

  function addDuck(x, z) {
    if (typeof UNIT_SPHERE === 'undefined') return;
    const body = new THREE.Mesh(UNIT_SPHERE,
      new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 }));
    body.position.set(x, 0.28, z);
    body.scale.set(0.55, 0.36, 0.72);
    scene.add(body);
    const head = new THREE.Mesh(UNIT_SPHERE,
      new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 }));
    head.position.set(x + 0.1, 0.55, z + 0.42);
    head.scale.set(0.22, 0.22, 0.22);
    scene.add(head);
  }

  // 用原系统共享waterMat创建水面（有波纹/高光/昼夜联动）
  function addSharedWaterPlane(x, z, w, d, y) {
    if (typeof waterMat === 'undefined') return null;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), waterMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  }

  // 护城河木桥（可通行，注册bridgeZones）
  function addMoatBridge(cx) {
    if (typeof MAT === 'undefined' || typeof UNIT_BOX === 'undefined') return;
    // 桥面
    const deck = new THREE.Mesh(UNIT_BOX, MAT.wood);
    deck.position.set(cx, 0.28, 400);
    deck.scale.set(7, 0.1, 20);
    deck.receiveShadow = true;
    scene.add(deck);
    // 桥柱
    for (const sx of [-2.6, 2.6]) {
      const post = new THREE.Mesh(UNIT_BOX, MAT.wood);
      post.position.set(cx + sx, 1.0, 400);
      post.scale.set(0.25, 2.0, 0.25);
      post.castShadow = true;
      scene.add(post);
    }
    if (typeof bridgeZones !== 'undefined' && Array.isArray(bridgeZones)) {
      bridgeZones.push({ points: [[cx, 390], [cx, 410]], halfWidth: 3.2, y: 0.3, squareEnds: true });
    }
  }

  function init() {
    console.log('[Water] 水景系统初始化...');
    try {
      if (typeof scene === 'undefined' || typeof waterMat === 'undefined') return;

      // 护城河（南城墙外 z=400，与城墙z=380平行，宽20米）
      // 使用原系统共享waterMat：波纹+高光+昼夜联动，与曲江池/龙池视觉统一
      // 分左右两段，中间保留明德门御道通道（x=-25..25）
      const MOAT_Z = 400, MOAT_HALF = 10;
      // 左段
      addSharedWaterPlane(-237.5, MOAT_Z, 425, MOAT_HALF * 2, 0.1);
      // 右段
      addSharedWaterPlane(237.5, MOAT_Z, 425, MOAT_HALF * 2, 0.1);

      // 注册waterRects：让玩家不能走入护城河（会提示从桥上过）
      if (typeof waterRects !== 'undefined' && Array.isArray(waterRects)) {
        waterRects.push({ minX: -450, maxX: -25, minZ: 390, maxZ: 410 });
        waterRects.push({ minX: 25, maxX: 450, minZ: 390, maxZ: 410 });
      }

      // 护城河木桥两座（x=±90），供玩家横向过河
      addMoatBridge(-90);
      addMoatBridge(90);

      // 护城河岸线石头（北岸城墙侧+南岸外侧）
      for (let i = 0; i < 52; i++) {
        const x = -440 + i * 17;
        addRock(x, 387 + Math.random() * 2);
        addRock(x, 413 + Math.random() * 2);
      }

      // 护城河芦苇（两岸稀疏点缀）
      for (let i = 0; i < 34; i++) {
        const x = -440 + Math.random() * 880;
        addReed(x, 388 + Math.random() * 4);
        addReed(x, 412 + Math.random() * 4);
      }

      // 护城河鸭子（6只，在水面上）
      for (let i = 0; i < 6; i++) {
        const x = -300 + Math.random() * 600;
        addDuck(x, 400 + (Math.random() * 12 - 6));
      }

      // 注意：不重复创建城外小河（原系统buildOutskirts已有waterMat小河）
      // 注意：不创建喷泉（避免与曲江池湖心亭/龙池亭冲突，且几何圆柱不像真实水景）

      console.log('[Water] 水景系统增强完成 - 护城河(waterMat共享Shader,分两段保留御道通道)+2木桥+岸线石头+芦苇+6鸭子，已注册waterRects可通行校验');
    } catch(e) { console.warn('[Water] 初始化失败:', e); }
  }

  function register() {
    if (window.__enhance) {
      window.__enhance.register('water', init, 60);
    } else {
      (window.__enhancePending = window.__enhancePending || []).push({ owner: 'water', fn: init, priority: 60 });
    }
  }

  if (typeof GAME !== 'undefined' && GAME.ready) register();
  else {
    let tries = 0;
    (function check() {
      if (typeof GAME !== 'undefined' && GAME.ready) register();
      else if (tries++ < 400) setTimeout(check, 100);
      else { if (window.__enhance) window.__enhance.register('water', init, 60); }
    })();
  }
})();