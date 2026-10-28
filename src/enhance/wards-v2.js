/* ============================================================
   108坊v2 — 长安城坊里盛景
   v2: 坊门、坊墙、坊内民居、街道、绿树
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 4000);
      return;
    }
    
    console.log(['WardsV2] 开始增强108坊...']);
    
    addWardGates();           // 坊门
    addWardWalls();            // 坊墙
    addWardHouses();           // 坊内民居
    addWardTrees();             // 坊内绿树
    
    console.log('[WardsV2] ✓ 108坊增强完成');
  }
  
  // 坊门 — 每个坊的入口
  function addWardGates() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WardsV2] 添加坊门...');
    
    // 朱雀大街两侧的坊门
    const wardXs = [-500, -400, -300, -200, -100, 100, 200, 300, 400, 500];
    const wardZs = [-400, -300, -200, -100, 100, 200, 300, 400];
    
    wardXs.forEach((x, xi) => {
      wardZs.forEach((z, zi) => {
        // 只在朱雀大街两侧加坊门
        if (Math.abs(x) > 80) return;
        
        // 坊门
        const gate = new THREE.Mesh(
          new THREE.BoxGeometry(8, 5, 3),
          new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
        );
        gate.position.set(x, 2.5, z);
        gate.castShadow = true;
        scene.add(gate);
        
        // 坊门屋顶
        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(6, 2, 4),
          new THREE.MeshStandardMaterial({ color: 0x4a6670, roughness: 0.6 })
        );
        roof.position.set(x, 6, z);
        roof.rotation.y = Math.PI / 4;
        scene.add(roof);
        
        // 坊名牌
        const sign = new THREE.Mesh(
          new THREE.BoxGeometry(5, 1, 0.2),
          new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.6 })
        );
        sign.position.set(x, 4, z + 1.6);
        scene.add(sign);
      });
    });
    
    console.log('[WardsV2] 坊门添加完成');
  }
  
  // 坊墙 — 每个坊的围墙
  function addWardWalls() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WardsV2] 添加坊墙...');
    
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xc8b89a, roughness: 0.85 });
    
    // 选取几个主要的坊，加坊墙
    const wards = [
      { x: -250, z: -200, w: 80, d: 60 },
      { x: 250, z: -200, w: 80, d: 60 },
      { x: -250, z: 200, w: 80, d: 60 },
      { x: 250, z: 200, w: 80, d: 60 },
    ];
    
    wards.forEach(ward => {
      // 北墙
      const northWall = new THREE.Mesh(
        new THREE.BoxGeometry(ward.w, 2, 1),
        wallMat
      );
      northWall.position.set(ward.x, 1, ward.z - ward.d / 2);
      scene.add(northWall);
      
      // 南墙
      const southWall = new THREE.Mesh(
        new THREE.BoxGeometry(ward.w, 2, 1),
        wallMat
      );
      southWall.position.set(ward.x, 1, ward.z + ward.d / 2);
      scene.add(southWall);
      
      // 东墙
      const eastWall = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, ward.d),
        wallMat
      );
      eastWall.position.set(ward.x + ward.w / 2, 1, ward.z);
      scene.add(eastWall);
      
      // 西墙
      const westWall = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, ward.d),
        wallMat
      );
      westWall.position.set(ward.x - ward.w / 2, 1, ward.z);
      scene.add(westWall);
    });
    
    console.log('[WardsV2] 坊墙添加完成');
  }
  
  // 坊内民居 — 普通百姓家
  function addWardHouses() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WardsV2] 添加坊内民居...');
    
    const houseColors = [0xd4a574, 0xc89868, 0xb88858, 0xd4b584];
    
    // 每个坊里加几间民居
    const wards = [
      { x: -250, z: -200 },
      { x: 250, z: -200 },
      { x: -250, z: 200 },
      { x: 250, z: 200 },
    ];
    
    wards.forEach(ward => {
      // 8间民居
      for (let i = 0; i < 8; i++) {
        const hx = ward.x + (Math.random() - 0.5) * 60;
        const hz = ward.z + (Math.random() - 0.5) * 40;
        
        // 正房
        const house = new THREE.Mesh(
          new THREE.BoxGeometry(6, 4, 5),
          new THREE.MeshStandardMaterial({ 
            color: houseColors[Math.floor(Math.random() * houseColors.length)],
            roughness: 0.8
          })
        );
        house.position.set(hx, 2, hz);
        house.castShadow = true;
        scene.add(house);
        
        // 屋顶
        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(4.5, 2.5, 4),
          new THREE.MeshStandardMaterial({ color: 0x5a6a6a, roughness: 0.6 })
        );
        roof.position.set(hx, 5.2, hz);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        scene.add(roof);
      }
    });
    
    console.log('[WardsV2] 坊内民居添加完成');
  }
  
  // 坊内绿树 — 坊里的树木
  function addWardTrees() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WardsV2] 添加坊内绿树...');
    
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x5a8a4a, roughness: 0.85 });
    
    const wards = [
      { x: -250, z: -200 },
      { x: 250, z: -200 },
      { x: -250, z: 200 },
      { x: 250, z: 200 },
    ];
    
    wards.forEach(ward => {
      // 每个坊10棵树
      for (let i = 0; i < 10; i++) {
        const tx = ward.x + (Math.random() - 0.5) * 70;
        const tz = ward.z + (Math.random() - 0.5) * 50;
        
        // 树干
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.25, 3, 5),
          trunkMat
        );
        trunk.position.set(tx, 1.5, tz);
        trunk.castShadow = true;
        scene.add(trunk);
        
        // 树冠
        const crown = new THREE.Mesh(
          new THREE.SphereGeometry(1.5 + Math.random(), 7, 5),
          leafMat
        );
        crown.position.set(tx, 3.5, tz);
        crown.castShadow = true;
        scene.add(crown);
      }
    });
    
    console.log('[WardsV2] 坊内绿树添加完成');
  }
  
  init();
})();
