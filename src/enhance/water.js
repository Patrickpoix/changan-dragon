/* ============================================================
   Water - 水景系统Owner（v3.1）
   原系统已有曲江池/龙池/太液池（waterMat Shader+画舫+荷叶）+城外小河
   本模块补充护城河三面（南/东/西，共享waterMat）+木桥+岸石芦苇鸭
   - 南：z=400 宽20m 两段(x:-450..-25 / 25..450，明德门御道通道)
   - 东：x=465 宽12m 两段(z:-380..45 / 65..380，春明门通道)，桥 z=±150
   - 西：x=-465 宽12m 两段(z同东，金光门通道)，桥 z=±150
   木桥按跨河方向（南桥沿z、东西桥沿x），deck/bridgeZones一一对应
   装饰物全部使用局部Batch（绝不调用共享B.build避免重复instance）
   通过 __enhance.register 注册（优先级60）
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

  const _mat = {};
  function sharedMat(key, opts) {
    if (!_mat[key]) _mat[key] = new THREE.MeshStandardMaterial(opts);
    return _mat[key];
  }

  // 用原系统共享waterMat创建水面（波纹/高光/昼夜联动）
  function addSharedWaterPlane(x, z, w, d, y) {
    if (typeof waterMat === 'undefined') return null;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), waterMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  }

  // 护城河木桥：alongZ=true 沿z跨河（南桥），false 沿x跨河（东西桥）
  function addMoatBridge(cx, cz, alongZ) {
    if (typeof MAT === 'undefined' || typeof UNIT_BOX === 'undefined') return;
    const deck = new THREE.Mesh(UNIT_BOX, MAT.wood);
    deck.position.set(cx, 0.28, cz);
    if (alongZ) deck.scale.set(7, 0.1, 20);
    else deck.scale.set(18, 0.1, 7);
    deck.receiveShadow = true;
    scene.add(deck);
    // 桥侧栏杆柱（沿桥长方向两侧）
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(UNIT_BOX, MAT.wood);
      if (alongZ) { post.position.set(cx + side * 3.2, 1.0, cz); post.scale.set(0.25, 2.0, 0.25); }
      else { post.position.set(cx, 1.0, cz + side * 3.2); post.scale.set(0.25, 2.0, 0.25); }
      post.castShadow = true;
      scene.add(post);
    }
    if (typeof bridgeZones !== 'undefined' && Array.isArray(bridgeZones)) {
      if (alongZ) bridgeZones.push({ points: [[cx, cz - 10], [cx, cz + 10]], halfWidth: 3.2, y: 0.32, squareEnds: true });
      else bridgeZones.push({ points: [[cx - 9, cz], [cx + 9, cz]], halfWidth: 3.2, y: 0.32, squareEnds: true });
    }
  }

  function init() {
    console.log('[Water] 水景系统初始化...');
    try {
      if (typeof scene === 'undefined' || typeof waterMat === 'undefined') return;

      // ============ 南护城河（明德门外） ============
      addSharedWaterPlane(-237.5, 400, 425, 20, 0.1);
      addSharedWaterPlane(237.5, 400, 425, 20, 0.1);
      if (typeof waterRects !== 'undefined' && Array.isArray(waterRects)) {
        waterRects.push({ minX: -450, maxX: -25, minZ: 390, maxZ: 410 });
        waterRects.push({ minX: 25, maxX: 450, minZ: 390, maxZ: 410 });
      }
      addMoatBridge(-90, 400, true);
      addMoatBridge(90, 400, true);

      // ============ 东护城河（春明门外，z通道45..65） ============
      addSharedWaterPlane(465, -167.5, 12, 425, 0.1);
      addSharedWaterPlane(465, 222.5, 12, 315, 0.1);
      if (typeof waterRects !== 'undefined' && Array.isArray(waterRects)) {
        waterRects.push({ minX: 459, maxX: 471, minZ: -380, maxZ: 45 });
        waterRects.push({ minX: 459, maxX: 471, minZ: 65, maxZ: 380 });
      }
      addMoatBridge(463, -150, false);
      addMoatBridge(463, 150, false);

      // ============ 西护城河（金光门外） ============
      addSharedWaterPlane(-465, -167.5, 12, 425, 0.1);
      addSharedWaterPlane(-465, 222.5, 12, 315, 0.1);
      if (typeof waterRects !== 'undefined' && Array.isArray(waterRects)) {
        waterRects.push({ minX: -471, maxX: -459, minZ: -380, maxZ: 45 });
        waterRects.push({ minX: -471, maxX: -459, minZ: 65, maxZ: 380 });
      }
      addMoatBridge(-463, -150, false);
      addMoatBridge(-463, 150, false);

      // ============ 岸线装饰（局部Batch，避免重复instance） ============
      if (typeof Batch !== 'undefined') {
        const rocks = new Batch(UNIT_SPHERE, MAT.stone, { cast: true });
        for (let i = 0; i < 52; i++) {
          const x = -440 + i * 17;
          const s = 0.5 + Math.random() * 0.6;
          rocks.add(x, 0.18, 387 + Math.random() * 2, s, s * 0.65, s, 0, 0xd8cdb5);
          rocks.add(x, 0.18, 413 + Math.random() * 2, s, s * 0.65, s, 0, 0xd2c6ae);
        }
        rocks.build();

        const reeds = new Batch(UNIT_CYL, sharedMat('reed', { color: 0x8a9a5a, roughness: 0.9 }), { cast: false });
        for (let i = 0; i < 34; i++) {
          const x = -440 + Math.random() * 880;
          reeds.add(x, 1.0, 388 + Math.random() * 4, 0.07, 2.0, 0.07);
          reeds.add(x, 1.0, 412 + Math.random() * 4, 0.07, 2.0, 0.07);
        }
        reeds.build();

        const duckMat = sharedMat('duck', { color: 0x8b4513, roughness: 0.8 });
        const ducks = new Batch(UNIT_SPHERE, duckMat, { cast: false });
        for (let i = 0; i < 6; i++) {
          const x = -300 + Math.random() * 600;
          const z = 400 + (Math.random() * 12 - 6);
          ducks.add(x, 0.28, z, 0.55, 0.36, 0.72);
          ducks.add(x + 0.1, 0.55, z + 0.42, 0.22, 0.22, 0.22);
        }
        ducks.build();
      }

      console.log('[Water] 水景系统增强完成 - 护城河三面(南z400/东x465/西x-465，共享waterMat，各留城门通道)+6木桥(按跨河方向)+岸石芦苇鸭(局部Batch)，waterRects/bridgeZones已注册');
    } catch(e) { console.warn('[Water] 初始化失败:', e); }
  }

  function register() {
    if (registered) return;
    registered = true;
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