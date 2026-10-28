/* ============================================================
   宫殿皇家v2 — 盛唐皇宫气派
   v2: 宫殿群、御花园、金水桥、铜狮、华表、侍卫
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 5500);
      return;
    }
    
    console.log(['PalaceV2] 开始增强宫殿皇家建筑...']);
    
    addPalaceComplex();        // 大明宫宫殿群
    addImperialGarden();         // 御花园
    addGoldenWaterBridge();      // 金水桥
    addBronzeLions();             // 铜狮
    addOrnamentalColumns();       // 华表
    addPalaceGuards();            // 宫殿侍卫
    
    console.log('[PalaceV2] ✓ 宫殿皇家建筑增强完成');
  }
  
  // 大明宫宫殿群
  function addPalaceComplex() {
    if (typeof scene === 'undefined') return;
    
    console.log('[PalaceV2] 添加大明宫宫殿群...');
    
    const DX = 320, DZ = -460;
    
    // 紫宸殿
    const zichen = new THREE.Mesh(
      new THREE.BoxGeometry(30, 12, 20),
      new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
    );
    zichen.position.set(DX, 6, DZ - 40);
    zichen.castShadow = true;
    scene.add(zichen);
    
    const zichenRoof = new THREE.Mesh(
      new THREE.ConeGeometry(22, 6, 4),
      new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.5 })
    );
    zichenRoof.position.set(DX, 15, DZ - 40);
    zichenRoof.rotation.y = Math.PI / 4;
    zichenRoof.castShadow = true;
    scene.add(zichenRoof);
    
    // 宣政殿
    const xuanzheng = new THREE.Mesh(
      new THREE.BoxGeometry(35, 14, 25),
      new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
    );
    xuanzheng.position.set(DX, 7, DZ - 80);
    xuanzheng.castShadow = true;
    scene.add(xuanzheng);
    
    const xuanzhengRoof = new THREE.Mesh(
      new THREE.ConeGeometry(25, 7, 4),
      new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.5 })
    );
    xuanzhengRoof.position.set(DX, 17.5, DZ - 80);
    xuanzhengRoof.rotation.y = Math.PI / 4;
    xuanzhengRoof.castShadow = true;
    scene.add(xuanzhengRoof);
    
    // 东西配殿
    for (const side of [-1, 1]) {
      const sideHall = new THREE.Mesh(
        new THREE.BoxGeometry(15, 8, 12),
        new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
      );
      sideHall.position.set(DX + side * 30, 4, DZ - 60);
      sideHall.castShadow = true;
      scene.add(sideHall);
      
      const sideRoof = new THREE.Mesh(
        new THREE.ConeGeometry(10, 4, 4),
        new THREE.MeshStandardMaterial({ color: 0x4a6670, roughness: 0.6 })
      );
      sideRoof.position.set(DX + side * 30, 10, DZ - 60);
      sideRoof.rotation.y = Math.PI / 4;
      scene.add(sideRoof);
    }
    
    console.log('[PalaceV2] 大明宫宫殿群添加完成');
  }
  
  // 御花园 — 太液池畔
  function addImperialGarden() {
    if (typeof scene === 'undefined') return;
    
    console.log('[PalaceV2] 添加御花园...');
    
    const DX = 320, DZ = -460;
    
    // 太液池
    const lake = new THREE.Mesh(
      new THREE.CircleGeometry(40, 16),
      new THREE.MeshStandardMaterial({ 
        color: 0x4a7a9a,
        roughness: 0.3,
        metalness: 0.5
      })
    );
    lake.position.set(DX + 50, 0.05, DZ + 50);
    lake.rotation.x = -Math.PI / 2;
    scene.add(lake);
    
    // 湖心亭
    const pavilion = new THREE.Mesh(
      new THREE.BoxGeometry(8, 5, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
    );
    pavilion.position.set(DX + 50, 2.5, DZ + 50);
    pavilion.castShadow = true;
    scene.add(pavilion);
    
    const pavilionRoof = new THREE.Mesh(
      new THREE.ConeGeometry(6, 3, 4),
      new THREE.MeshStandardMaterial({ color: 0x4a6670, roughness: 0.6 })
    );
    pavilionRoof.position.set(DX + 50, 6.5, DZ + 50);
    pavilionRoof.rotation.y = Math.PI / 4;
    scene.add(pavilionRoof);
    
    // 花园树木
    for (let i = 0; i < 10; i++) {
      const tree = new THREE.Mesh(
        new THREE.SphereGeometry(2, 6, 5),
        new THREE.MeshStandardMaterial({ color: 0x5a8a4a, roughness: 0.85 })
      );
      tree.position.set(
        DX + (Math.random() - 0.5) * 80,
        3,
        DZ + 50 + (Math.random() - 0.5) * 60
      );
      tree.castShadow = true;
      scene.add(tree);
    }
    
    console.log('[PalaceV2] 御花园添加完成');
  }
  
  // 金水桥 — 宫门前的桥
  function addGoldenWaterBridge() {
    if (typeof scene === 'undefined') return;
    
    console.log('[PalaceV2] 添加金水桥...');
    
    const DX = 320, DZ = -460;
    
    // 金水河
    const river = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a7a9a, roughness: 0.3 })
    );
    river.position.set(DX, 0.05, DZ + 30);
    river.rotation.x = -Math.PI / 2;
    scene.add(river);
    
    // 汉白玉桥
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(15, 0.5, 10),
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.7 })
    );
    bridge.position.set(DX, 1, DZ + 30);
    bridge.castShadow = true;
    bridge.receiveShadow = true;
    scene.add(bridge);
    
    // 桥栏杆
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.8, 0.2),
          new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.7 })
        );
        post.position.set(DX - 6 + i * 3, 1.7, DZ + 30 + side * 5);
        scene.add(post);
      }
      
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(15, 0.1, 0.15),
        new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.7 })
      );
      rail.position.set(DX, 2, DZ + 30 + side * 5);
      scene.add(rail);
    }
    
    console.log('[PalaceV2] 金水桥添加完成');
  }
  
  // 铜狮 — 宫门前的狮子
  function addBronzeLions() {
    if (typeof scene === 'undefined') return;
    
    console.log('[PalaceV2] 添加铜狮...');
    
    const bronzeMat = new THREE.MeshStandardMaterial({ 
      color: 0x8b6914, 
      roughness: 0.3,
      metalness: 0.8
    });
    
    const DX = 320, DZ = -460;
    
    for (const side of [-1, 1]) {
      // 狮身
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 8, 6),
        bronzeMat
      );
      body.position.set(DX + side * 8, 1.2, DZ + 15);
      body.scale.set(1, 0.8, 1.3);
      body.castShadow = true;
      scene.add(body);
      
      // 狮头
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 6, 5),
        bronzeMat
      );
      head.position.set(DX + side * 8, 2, DZ + 15 + 1);
      scene.add(head);
      
      // 基座
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.5, 2),
        new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.8 })
      );
      base.position.set(DX + side * 8, 0.25, DZ + 15);
      scene.add(base);
    }
    
    console.log('[PalaceV2] 铜狮添加完成');
  }
  
  // 华表 — 宫殿前的石柱
  function addOrnamentalColumns() {
    if (typeof scene === 'undefined') return;
    
    console.log('[PalaceV2] 添加华表...');
    
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.7 });
    const goldMat = new THREE.MeshStandardMaterial({ 
      color: 0xffd700, 
      roughness: 0.3,
      metalness: 0.8
    });
    
    const DX = 320, DZ = -460;
    
    for (const side of [-1, 1]) {
      // 柱身
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 8, 8),
        stoneMat
      );
      pillar.position.set(DX + side * 15, 4, DZ + 10);
      pillar.castShadow = true;
      scene.add(pillar);
      
      // 云板
      const cloud = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.2, 0.5),
        stoneMat
      );
      cloud.position.set(DX + side * 15, 5, DZ + 10);
      scene.add(cloud);
      
      // 顶部蹲兽
      const beast = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 6, 5),
        goldMat
      );
      beast.position.set(DX + side * 15, 8.5, DZ + 10);
      scene.add(beast);
    }
    
    console.log('[PalaceV2] 华表添加完成');
  }
  
  // 宫殿侍卫 — 宫门守卫
  function addPalaceGuards() {
    if (typeof scene === 'undefined') return;
    
    console.log('[PalaceV2] 添加宫殿侍卫...');
    
    const armorMat = new THREE.MeshStandardMaterial({ 
      color: 0x8b0000, 
      roughness: 0.4,
      metalness: 0.6
    });
    
    const DX = 320, DZ = -460;
    
    // 12个侍卫
    for (let i = 0; i < 12; i++) {
      const group = new THREE.Group();
      
      // 身体
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.3, 1.0, 6),
        armorMat
      );
      body.position.y = 0.9;
      body.castShadow = true;
      group.add(body);
      
      // 头
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 6, 5),
        new THREE.MeshStandardMaterial({ color: 0xd8a888, roughness: 0.7 })
      );
      head.position.y = 1.55;
      group.add(head);
      
      // 头盔
      const helmet = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.15, 0.15, 6),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 })
      );
      helmet.position.y = 1.65;
      group.add(helmet);
      
      // 长矛
      const spear = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 2, 4),
        new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.8 })
      );
      spear.position.set(0.3, 1.3, 0);
      group.add(spear);
      
      group.position.set(
        DX - 20 + i * 4,
        0,
        DZ + 20
      );
      group.rotation.y = Math.PI;
      
      scene.add(group);
    }
    
    console.log('[PalaceV2] 宫殿侍卫添加完成，共12个');
  }
  
  init();
})();
