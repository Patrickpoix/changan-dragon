/* ============================================================
   兴庆宫与太极宫精修
   Xingqing Palace & Taiji Palace refinement
   ============================================================ */

(function() {
  'use strict';
  
  const XX = 610, XZ = -195;  // 兴庆宫
  const TX = 0, TZ = -450;     // 太极宫
  
  function init() {
    console.log(['Palaces] 开始精修兴庆宫与太极宫...']);
    
    refineXingqingPalace();
    refineTaijiPalace();
    refineEastWestMarkets();
    
    console.log('[Palaces] ✓ 兴庆宫与太极宫精修完成');
  }
  
  function makeMat(options) {
    return new THREE.MeshStandardMaterial(Object.assign({
      roughness: 0.7,
      metalness: 0.1
    }, options));
  }
  
  // 精修兴庆宫
  function refineXingqingPalace() {
    if (typeof scene === 'undefined') return;
    
    console.log('[Palaces] 精修兴庆宫...');
    
    // 龙池
    const lake = new THREE.Mesh(
      new THREE.CircleGeometry(50, 24),
      new THREE.MeshStandardMaterial({
        color: 0x4a7a9a,
        roughness: 0.2,
        metalness: 0.6,
        transparent: true,
        opacity: 0.85
      })
    );
    lake.position.set(XX, 0.1, XZ);
    lake.rotation.x = -Math.PI / 2;
    scene.add(lake);
    
    // 沉香亭 — 池畔名亭
    const pavilion = new THREE.Mesh(
      new THREE.BoxGeometry(12, 8, 12),
      makeMat({ color: 0xd4a574, roughness: 0.7 })
    );
    pavilion.position.set(XX + 30, 4, XZ - 30);
    pavilion.castShadow = true;
    scene.add(pavilion);
    
    const pavilionRoof = new THREE.Mesh(
      new THREE.ConeGeometry(10, 5, 4),
      makeMat({ color: 0x8b0000, roughness: 0.5 })
    );
    pavilionRoof.position.set(XX + 30, 10.5, XZ - 30);
    pavilionRoof.rotation.y = Math.PI / 4;
    scene.add(pavilionRoof);
    
    // 花萼相辉楼
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(25, 20, 15),
      makeMat({ color: 0xd4a574, roughness: 0.6 })
    );
    tower.position.set(XX - 30, 10, XZ + 20);
    tower.castShadow = true;
    scene.add(tower);
    
    const towerRoof = new THREE.Mesh(
      new THREE.ConeGeometry(20, 8, 4),
      makeMat({ color: 0x8b0000, roughness: 0.5 })
    );
    towerRoof.position.set(XX - 30, 24, XZ + 20);
    towerRoof.rotation.y = Math.PI / 4;
    scene.add(towerRoof);
    
    console.log('[Palaces] 兴庆宫精修完成');
  }
  
  // 精修太极宫
  function refineTaijiPalace() {
    if (typeof scene === 'undefined') return;
    
    console.log('[Palaces] 精修太极宫...');
    
    // 太极殿 — 正殿
    const hall = new THREE.Mesh(
      new THREE.BoxGeometry(50, 20, 30),
      makeMat({ color: 0xd4a574, roughness: 0.6 })
    );
    hall.position.set(TX, 10, TZ);
    hall.castShadow = true;
    scene.add(hall);
    
    // 朱红立柱
    for (let i = -4; i <= 4; i++) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 20, 8),
        makeMat({ color: 0x8b0000, roughness: 0.5, metalness: 0.2 })
      );
      col.position.set(TX + i * 5, 10, TZ + 15);
      col.castShadow = true;
      scene.add(col);
    }
    
    // 重檐庑殿顶
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(35, 10, 4),
      makeMat({ color: 0x8b0000, roughness: 0.4, metalness: 0.3 })
    );
    roof.position.set(TX, 25, TZ);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
    
    // 朱雀门 — 南门
    const gate = new THREE.Mesh(
      new THREE.BoxGeometry(40, 12, 15),
      makeMat({ color: 0xd4a574, roughness: 0.7 })
    );
    gate.position.set(TX, 6, TZ + 50);
    gate.castShadow = true;
    scene.add(gate);
    
    const gateRoof = new THREE.Mesh(
      new THREE.ConeGeometry(30, 6, 4),
      makeMat({ color: 0x4a6670, roughness: 0.6 })
    );
    gateRoof.position.set(TX, 15, TZ + 50);
    gateRoof.rotation.y = Math.PI / 4;
    scene.add(gateRoof);
    
    console.log('[Palaces] 太极宫精修完成');
  }
  
  // 精修东西市
  function refineEastWestMarkets() {
    if (typeof scene === 'undefined') return;
    
    console.log('[Palaces] 精修东西市...');
    
    // 东市
    const EX = 174, EZ = -14;
    
    // 市场围墙
    const wallMat = makeMat({ color: 0xc8b89a, roughness: 0.85 });
    
    // 北墙
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(60, 3, 1),
      wallMat
    );
    northWall.position.set(EX, 1.5, EZ - 25);
    scene.add(northWall);
    
    // 南墙
    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(60, 3, 1),
      wallMat
    );
    southWall.position.set(EX, 1.5, EZ + 25);
    scene.add(southWall);
    
    // 东墙
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, 3, 50),
      wallMat
    );
    eastWall.position.set(EX + 30, 1.5, EZ);
    scene.add(eastWall);
    
    // 西墙
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, 3, 50),
      wallMat
    );
    westWall.position.set(EX - 30, 1.5, EZ);
    scene.add(westWall);
    
    // 市楼 — 市场中心
    const marketTower = new THREE.Mesh(
      new THREE.BoxGeometry(10, 8, 10),
      makeMat({ color: 0xd4a574, roughness: 0.7 })
    );
    marketTower.position.set(EX, 4, EZ);
    marketTower.castShadow = true;
    scene.add(marketTower);
    
    const towerRoof = new THREE.Mesh(
      new THREE.ConeGeometry(8, 4, 4),
      makeMat({ color: 0x4a6670, roughness: 0.6 })
    );
    towerRoof.position.set(EX, 10, EZ);
    towerRoof.rotation.y = Math.PI / 4;
    scene.add(towerRoof);
    
    console.log('[Palaces] 东西市精修完成');
  }
  
  // 注册到统一生命周期
  if (typeof window.__enhance !== 'undefined') {
    window.__enhance.register('palaces', init, 40);
  } else if (typeof window.__enhancePending !== 'undefined') {
    window.__enhancePending.push({ owner: 'palaces', fn: init, priority: 40 });
  } else {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      init();
    } else {
      setTimeout(init, 2000);
    }
  }
})();
