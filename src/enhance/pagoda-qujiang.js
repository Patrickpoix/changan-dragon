/* ============================================================
   大雁塔与曲江池精修
   Dayan Pagoda & Qujiang Pool refinement
   ============================================================ */

(function() {
  'use strict';
  
  const DX = 300, DZ = 420;
  const QX = 520, QZ = 470;
  
  function init() {
    console.log(['PagodaQujiang] 开始精修大雁塔与曲江池...']);
    
    refineDayanPagoda();
    refineCienTemple();
    refineQujiangPool();
    
    console.log('[PagodaQujiang] ✓ 大雁塔与曲江池精修完成');
  }
  
  function makeMat(options) {
    return new THREE.MeshStandardMaterial(Object.assign({
      roughness: 0.7,
      metalness: 0.1
    }, options));
  }
  
  // 精修大雁塔
  function refineDayanPagoda() {
    if (typeof scene === 'undefined') return;
    
    console.log('[PagodaQujiang] 精修大雁塔...');
    
    // 基座
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(30, 3, 30),
      makeMat({ color: 0xb89878, roughness: 0.85 })
    );
    base.position.set(DX, 1.5, DZ);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    
    // 七层砖塔
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const layerH = 8 - t * 2;
      const layerW = 24 - t * 8;
      
      // 塔层
      const layer = new THREE.Mesh(
        new THREE.BoxGeometry(layerW, layerH, layerW),
        makeMat({ 
          color: 0xa88868,
          roughness: 0.9,
          flatShading: true
        })
      );
      layer.position.set(DX, 3 + i * 8 + layerH / 2, DZ);
      layer.castShadow = true;
      scene.add(layer);
      
      // 砖缝纹理 — 用横向线条模拟
      for (let j = 0; j < 3; j++) {
        const seam = new THREE.Mesh(
          new THREE.BoxGeometry(layerW + 0.1, 0.05, layerW + 0.1),
          makeMat({ color: 0x886848, roughness: 0.9 })
        );
        seam.position.set(DX, 3 + i * 8 + layerH * (j + 1) / 4, DZ);
        scene.add(seam);
      }
      
      // 每层四面门窗
      const windowMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.9
      });
      
      // 南面门
      const door = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 3),
        windowMat
      );
      door.position.set(DX, 3 + i * 8 + layerH / 2, DZ + layerW / 2 + 0.05);
      scene.add(door);
      
      // 东西窗
      for (const side of [-1, 1]) {
        const win = new THREE.Mesh(
          new THREE.PlaneGeometry(1.5, 2),
          windowMat
        );
        win.position.set(DX + side * (layerW / 2 + 0.05), 3 + i * 8 + layerH / 2, DZ);
        win.rotation.y = side * Math.PI / 2;
        scene.add(win);
      }
    }
    
    // 塔刹 — 金色
    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(3, 10, 8),
      makeMat({ 
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0xffaa00,
        emissiveIntensity: 0.3
      })
    );
    spire.position.set(DX, 3 + 56 + 5, DZ);
    spire.castShadow = true;
    scene.add(spire);
    
    // 相轮 — 五重
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(2 - i * 0.2, 2 - i * 0.2, 0.5, 8),
        makeMat({ color: 0xffd700, metalness: 0.8, roughness: 0.3 })
      );
      ring.position.set(DX, 3 + 50 + i * 1, DZ);
      scene.add(ring);
    }
    
    console.log('[PagodaQujiang] 大雁塔精修完成');
  }
  
  // 精修大慈恩寺
  function refineCienTemple() {
    if (typeof scene === 'undefined') return;
    
    console.log('[PagodaQujiang] 精修大慈恩寺...');
    
    // 山门
    const gate = new THREE.Mesh(
      new THREE.BoxGeometry(20, 8, 10),
      makeMat({ color: 0xd4a574, roughness: 0.7 })
    );
    gate.position.set(DX, 4, DZ + 40);
    gate.castShadow = true;
    scene.add(gate);
    
    const gateRoof = new THREE.Mesh(
      new THREE.ConeGeometry(15, 4, 4),
      makeMat({ color: 0x4a6670, roughness: 0.6 })
    );
    gateRoof.position.set(DX, 10, DZ + 40);
    gateRoof.rotation.y = Math.PI / 4;
    scene.add(gateRoof);
    
    // 大雄宝殿
    const hall = new THREE.Mesh(
      new THREE.BoxGeometry(30, 12, 20),
      makeMat({ color: 0xd4a574, roughness: 0.7 })
    );
    hall.position.set(DX, 6, DZ + 20);
    hall.castShadow = true;
    scene.add(hall);
    
    const hallRoof = new THREE.Mesh(
      new THREE.ConeGeometry(22, 6, 4),
      makeMat({ color: 0x4a6670, roughness: 0.6 })
    );
    hallRoof.position.set(DX, 15, DZ + 20);
    hallRoof.rotation.y = Math.PI / 4;
    hallRoof.castShadow = true;
    scene.add(hallRoof);
    
    // 庭院地面
    const courtyard = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 60),
      makeMat({ color: 0xc8b89a, roughness: 0.9 })
    );
    courtyard.position.set(DX, 0.02, DZ + 20);
    courtyard.rotation.x = -Math.PI / 2;
    courtyard.receiveShadow = true;
    scene.add(courtyard);
    
    console.log('[PagodaQujiang] 大慈恩寺精修完成');
  }
  
  // 精修曲江池
  function refineQujiangPool() {
    if (typeof scene === 'undefined') return;
    
    console.log('[PagodaQujiang] 精修曲江池...');
    
    // 湖面
    const lake = new THREE.Mesh(
      new THREE.CircleGeometry(80, 32),
      new THREE.MeshStandardMaterial({
        color: 0x4a7a9a,
        roughness: 0.2,
        metalness: 0.6,
        transparent: true,
        opacity: 0.85
      })
    );
    lake.position.set(QX, 0.1, QZ);
    lake.rotation.x = -Math.PI / 2;
    scene.add(lake);
    
    // 紫云楼 — 池畔高楼
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(20, 25, 15),
      makeMat({ color: 0xd4a574, roughness: 0.6 })
    );
    tower.position.set(QX + 50, 12.5, QZ - 50);
    tower.castShadow = true;
    scene.add(tower);
    
    const towerRoof = new THREE.Mesh(
      new THREE.ConeGeometry(16, 8, 4),
      makeMat({ color: 0x8b0000, roughness: 0.5 })
    );
    towerRoof.position.set(QX + 50, 29, QZ - 50);
    towerRoof.rotation.y = Math.PI / 4;
    scene.add(towerRoof);
    
    // 曲桥
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(60, 0.5, 4),
      makeMat({ color: 0xd4c4a8, roughness: 0.8 })
    );
    bridge.position.set(QX, 1, QZ);
    bridge.rotation.y = 0.3;
    bridge.castShadow = true;
    bridge.receiveShadow = true;
    scene.add(bridge);
    
    // 湖心亭
    const pavilion = new THREE.Mesh(
      new THREE.BoxGeometry(10, 6, 10),
      makeMat({ color: 0xd4a574, roughness: 0.7 })
    );
    pavilion.position.set(QX - 30, 3, QZ + 20);
    pavilion.castShadow = true;
    scene.add(pavilion);
    
    const pavilionRoof = new THREE.Mesh(
      new THREE.ConeGeometry(8, 4, 4),
      makeMat({ color: 0x4a6670, roughness: 0.6 })
    );
    pavilionRoof.position.set(QX - 30, 8, QZ + 20);
    pavilionRoof.rotation.y = Math.PI / 4;
    scene.add(pavilionRoof);
    
    console.log('[PagodaQujiang] 曲江池精修完成');
  }
  
  // 注册到统一生命周期
  if (typeof window.__enhance !== 'undefined') {
    window.__enhance.register('pagoda-qujiang', init, 30);
  } else if (typeof window.__enhancePending !== 'undefined') {
    window.__enhancePending.push({ owner: 'pagoda-qujiang', fn: init, priority: 30 });
  } else {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      init();
    } else {
      setTimeout(init, 2000);
    }
  }
})();
