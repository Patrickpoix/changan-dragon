/* ============================================================
   道路街道v2 — 盛唐长安路网
   v2: 石板路、排水沟、牌坊、行道树、路牌
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 4500);
      return;
    }
    
    console.log(['RoadsV2] 开始增强道路街道...']);
    
    addStoneRoads();           // 石板路
    addDrainageDitches();       // 排水沟
    addPaifang();                // 牌坊
    addStreetTrees();            // 行道树
    addRoadSigns();              // 路牌
    
    console.log('[RoadsV2] ✓ 道路街道增强完成');
  }
  
  // 石板路 — 朱雀大街
  function addStoneRoads() {
    if (typeof scene === 'undefined') return;
    
    console.log('[RoadsV2] 添加石板路...');
    
    // 朱雀大街石板路
    const stoneMat = new THREE.MeshStandardMaterial({ 
      color: 0xb8a88a, 
      roughness: 0.9,
      metalness: 0.1
    });
    
    // 主路
    const mainRoad = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 1000),
      stoneMat
    );
    mainRoad.position.set(0, 0.02, 0);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.receiveShadow = true;
    scene.add(mainRoad);
    
    // 石板纹理 — 用小方块模拟
    for (let z = -480; z < 500; z += 10) {
      for (let x = -12; x <= 12; x += 6) {
        const slab = new THREE.Mesh(
          new THREE.BoxGeometry(5.8, 0.05, 9.8),
          new THREE.MeshStandardMaterial({ 
            color: 0xb8a88a + Math.random() * 0x0a0a0a,
            roughness: 0.9
          })
        );
        slab.position.set(x, 0.05, z);
        slab.receiveShadow = true;
        scene.add(slab);
      }
    }
    
    console.log('[RoadsV2] 石板路添加完成');
  }
  
  // 排水沟 — 街道两侧
  function addDrainageDitches() {
    if (typeof scene === 'undefined') return;
    
    console.log('[RoadsV2] 添加排水沟...');
    
    const ditchMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.95 });
    
    // 朱雀大街东侧排水沟
    const eastDitch = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.3, 1000),
      ditchMat
    );
    eastDitch.position.set(16, 0.1, 0);
    scene.add(eastDitch);
    
    // 朱雀大街西侧排水沟
    const westDitch = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.3, 1000),
      ditchMat
    );
    westDitch.position.set(-16, 0.1, 0);
    scene.add(westDitch);
    
    console.log('[RoadsV2] 排水沟添加完成');
  }
  
  // 牌坊 — 街道入口
  function addPaifang() {
    if (typeof scene === 'undefined') return;
    
    console.log('[RoadsV2] 添加牌坊...');
    
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.6 });
    
    // 明德门内牌坊
    const px = 0, pz = 500;
    
    // 两根石柱
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 10, 6),
        stoneMat
      );
      pillar.position.set(side * 12, 5, pz);
      pillar.castShadow = true;
      scene.add(pillar);
    }
    
    // 横梁
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(25, 1, 1),
      stoneMat
    );
    beam.position.set(0, 9.5, pz);
    beam.castShadow = true;
    scene.add(beam);
    
    // 屋顶
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(27, 0.5, 2),
      roofMat
    );
    roof.position.set(0, 10.5, pz);
    roof.castShadow = true;
    scene.add(roof);
    
    // 牌匾
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(8, 1.5, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7 })
    );
    sign.position.set(0, 9.5, pz + 0.6);
    scene.add(sign);
    
    console.log('[RoadsV2] 牌坊添加完成');
  }
  
  // 行道树 — 朱雀大街两侧
  function addStreetTrees() {
    if (typeof scene === 'undefined') return;
    
    console.log('[RoadsV2] 添加行道树...');
    
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x5a8a4a, roughness: 0.85 });
    
    // 朱雀大街两侧槐树
    for (let z = -480; z < 500; z += 20) {
      for (const side of [-1, 1]) {
        // 树干
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.3, 4, 6),
          trunkMat
        );
        trunk.position.set(side * 20, 2, z);
        trunk.castShadow = true;
        scene.add(trunk);
        
        // 树冠
        const crown = new THREE.Mesh(
          new THREE.SphereGeometry(2.5, 8, 6),
          leafMat
        );
        crown.position.set(side * 20, 5.5, z);
        crown.castShadow = true;
        scene.add(crown);
      }
    }
    
    console.log('[RoadsV2] 行道树添加完成，共约100棵');
  }
  
  // 路牌 — 街道标识
  function addRoadSigns() {
    if (typeof scene === 'undefined') return;
    
    console.log('[RoadsV2] 添加路牌...');
    
    const signMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.6 });
    const postMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.8 });
    
    // 几个主要路口路牌
    const signs = [
      { x: 0, z: 300, text: '朱雀大街' },
      { x: 174, z: -14, text: '东市' },
      { x: -258, z: -14, text: '西市' },
      { x: 320, z: -460, text: '大明宫' },
      { x: 300, z: 420, text: '大雁塔' },
    ];
    
    signs.forEach(sign => {
      // 路牌柱
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 3, 4),
        postMat
      );
      post.position.set(sign.x, 1.5, sign.z);
      scene.add(post);
      
      // 路牌板
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1, 0.1),
        signMat
      );
      board.position.set(sign.x, 3, sign.z);
      scene.add(board);
      
      // 金色字
      const text = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.6, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7 })
      );
      text.position.set(sign.x, 3, sign.z + 0.08);
      scene.add(text);
    });
    
    console.log('[RoadsV2] 路牌添加完成，共5个');
  }
  
  init();
})();
