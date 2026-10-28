/* ============================================================
   水域桥梁v2 — 曲江池盛景
   v2: 画舫、游船、曲桥、石栏杆、荷花、锦鲤
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 3500);
      return;
    }
    
    console.log(['WaterV2] 开始增强水域桥梁...']);
    
    addPaintedBoats();        // 画舫
    addSmallBoats();           // 小游船
    addStoneBridge();          // 石拱桥
    addLotusFlowers();          // 荷花
    addKoiFish();               // 锦鲤
    addWaterWillows();          // 水边垂柳
    
    console.log('[WaterV2] ✓ 水域桥梁增强完成');
  }
  
  // 画舫 — 曲江池上的豪华游船
  function addPaintedBoats() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WaterV2] 添加画舫...');
    
    const boatMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.6 });
    
    // 3艘画舫
    for (let i = 0; i < 3; i++) {
      const group = new THREE.Group();
      
      // 船身
      const hull = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.8, 6),
        boatMat
      );
      hull.position.y = 0.4;
      hull.castShadow = true;
      group.add(hull);
      
      // 船舱
      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.5, 3),
        new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
      );
      cabin.position.y = 1.5;
      group.add(cabin);
      
      // 船顶
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(2, 1, 4),
        roofMat
      );
      roof.position.y = 2.5;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);
      
      // 船窗
      for (const side of [-1, 1]) {
        const window = new THREE.Mesh(
          new THREE.PlaneGeometry(0.8, 0.8),
          new THREE.MeshStandardMaterial({ 
            color: 0xffeecc,
            emissive: 0xffcc88,
            emissiveIntensity: 0.5
          })
        );
        window.position.set(side * 1.26, 1.5, 0);
        window.rotation.y = side * Math.PI / 2;
        group.add(window);
      }
      
      group.position.set(
        520 + (i - 1) * 30,
        0.1,
        470 + (i % 2) * 20
      );
      group.rotation.y = Math.random() * Math.PI * 2;
      
      scene.add(group);
    }
    
    console.log('[WaterV2] 画舫添加完成，共3艘');
  }
  
  // 小游船 — 渔船
  function addSmallBoats() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WaterV2] 添加小游船...');
    
    const boatMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.8 });
    
    // 8艘小船
    for (let i = 0; i < 8; i++) {
      const boat = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.5, 3),
        boatMat
      );
      boat.position.set(
        520 + (Math.random() - 0.5) * 140,
        0.1,
        470 + (Math.random() - 0.5) * 110
      );
      boat.rotation.y = Math.random() * Math.PI * 2;
      boat.castShadow = true;
      scene.add(boat);
      
      // 船夫
      const rower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 0.6, 4),
        new THREE.MeshStandardMaterial({ color: 0x4a6fa5, roughness: 0.8 })
      );
      rower.position.copy(boat.position);
      rower.position.y = 0.6;
      scene.add(rower);
    }
    
    console.log('[WaterV2] 小游船添加完成，共8艘');
  }
  
  // 石拱桥 — 曲江池上的桥
  function addStoneBridge() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WaterV2] 添加石拱桥...');
    
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.85 });
    
    // 桥面 — 拱形
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(40, 0.5, 4),
      stoneMat
    );
    bridge.position.set(520, 2, 400);
    bridge.castShadow = true;
    bridge.receiveShadow = true;
    scene.add(bridge);
    
    // 桥栏
    for (const side of [-1, 1]) {
      for (let i = 0; i < 10; i++) {
        // 望柱
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.8, 0.2),
          stoneMat
        );
        post.position.set(502 + i * 4, 2.5, 400 + side * 2);
        scene.add(post);
        
        // 柱头
        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 4, 4),
          stoneMat
        );
        cap.position.set(502 + i * 4, 3.0, 400 + side * 2);
        scene.add(cap);
      }
      
      // 栏板
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(40, 0.1, 0.15),
        stoneMat
      );
      rail.position.set(520, 2.9, 400 + side * 2);
      scene.add(rail);
    }
    
    console.log('[WaterV2] 石拱桥添加完成');
  }
  
  // 荷花 — 水面上的荷花
  function addLotusFlowers() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WaterV2] 添加荷花...');
    
    // 荷叶
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4a8a5a, roughness: 0.8 });
    // 荷花
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf2a7b6, roughness: 0.7 });
    // 莲蓬
    const seedMat = new THREE.MeshStandardMaterial({ color: 0x8b9a5a, roughness: 0.8 });
    
    // 30朵荷花
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 60;
      const x = 520 + Math.cos(angle) * radius;
      const z = 470 + Math.sin(angle) * radius * 0.8;
      
      // 荷叶
      const leaf = new THREE.Mesh(
        new THREE.CircleGeometry(0.5 + Math.random() * 0.5, 8),
        leafMat
      );
      leaf.position.set(x, 0.05, z);
      leaf.rotation.x = -Math.PI / 2;
      scene.add(leaf);
      
      // 荷花（每隔几个加一个）
      if (i % 3 === 0) {
        const flower = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 6, 5),
          flowerMat
        );
        flower.position.set(x, 0.3, z);
        flower.scale.y = 0.6;
        scene.add(flower);
      }
    }
    
    console.log('[WaterV2] 荷花添加完成，共30朵');
  }
  
  // 锦鲤 — 水中的鱼
  function addKoiFish() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WaterV2] 添加锦鲤...');
    
    const koiColors = [0xff6644, 0xffcc44, 0xff8866, 0xff4444];
    
    // 20条锦鲤
    for (let i = 0; i < 20; i++) {
      const fish = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 4, 3),
        new THREE.MeshStandardMaterial({ 
          color: koiColors[i % koiColors.length],
          roughness: 0.5
        })
      );
      fish.position.set(
        520 + (Math.random() - 0.5) * 120,
        -0.2,
        470 + (Math.random() - 0.5) * 90
      );
      fish.scale.set(1, 0.3, 2);
      fish.rotation.y = Math.random() * Math.PI * 2;
      scene.add(fish);
    }
    
    console.log('[WaterV2] 锦鲤添加完成，共20条');
  }
  
  // 水边垂柳 — 曲江池岸边
  function addWaterWillows() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WaterV2] 添加水边垂柳...');
    
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x6a9a5a, roughness: 0.85 });
    
    // 15棵垂柳
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const x = 520 + Math.cos(angle) * 80;
      const z = 470 + Math.sin(angle) * 65;
      
      // 树干
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.35, 4, 6),
        trunkMat
      );
      trunk.position.set(x, 2, z);
      trunk.castShadow = true;
      scene.add(trunk);
      
      // 树冠 — 下垂
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(2.5, 8, 6),
        leafMat
      );
      crown.position.set(x, 5, z);
      crown.scale.y = 0.7;
      crown.castShadow = true;
      scene.add(crown);
    }
    
    console.log('[WaterV2] 水边垂柳添加完成，共15棵');
  }
  
  init();
})();
