/* ============================================================
   城市生活v2 — 繁华盛唐市井
   v2: 马车、摊贩、店铺招牌、行人、飞鸟、猫狗
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 2500);
      return;
    }
    
    console.log(['CityLifeV2] 开始增强城市生活...']);
    
    addHorseCarts();          // 马车
    addStreetVendors();       // 街头摊贩
    addShopFronts();           // 店铺门面
    addPedestrians();          // 行人
    addBirds();                 // 飞鸟
    addPets();                  // 猫狗
    
    console.log('[CityLifeV2] ✓ 城市生活增强完成');
  }
  
  // 马车 — 朱雀大街上行驶
  function addHorseCarts() {
    if (typeof scene === 'undefined') return;
    
    console.log('[CityLifeV2] 添加马车...');
    
    const cartMat = new THREE.MeshStandardMaterial({ color: 0x8b6a4a, roughness: 0.8 });
    const horseMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });
    
    // 5辆马车
    for (let i = 0; i < 5; i++) {
      const group = new THREE.Group();
      
      // 车厢
      const cart = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1.2, 3),
        cartMat
      );
      cart.position.y = 1;
      cart.castShadow = true;
      group.add(cart);
      
      // 车顶
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.2, 3.2),
        new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.8 })
      );
      roof.position.y = 1.7;
      group.add(roof);
      
      // 车轮
      for (const side of [-1, 1]) {
        for (let j = 0; j < 2; j++) {
          const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 0.1, 8),
            new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 0.9 })
          );
          wheel.position.set(side * 1.1, 0.5, j === 0 ? 1 : -1);
          wheel.rotation.z = Math.PI / 2;
          group.add(wheel);
        }
      }
      
      // 马
      const horse = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.3, 1.5, 4, 6),
        horseMat
      );
      horse.position.set(0, 1, -2.5);
      horse.castShadow = true;
      group.add(horse);
      
      // 马头
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 6, 5),
        horseMat
      );
      head.position.set(0, 1.5, -3.5);
      group.add(head);
      
      // 位置
      group.position.set(
        (Math.random() - 0.5) * 20,
        0,
        -300 + i * 120
      );
      group.rotation.y = Math.PI; // 朝北
      
      scene.add(group);
    }
    
    console.log('[CityLifeV2] 马车添加完成，共5辆');
  }
  
  // 街头摊贩 — 东西市
  function addStreetVendors() {
    if (typeof scene === 'undefined') return;
    
    console.log('[CityLifeV2] 添加街头摊贩...');
    
    const stallMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.8 });
    const awningMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.7 });
    
    // 东市摊贩
    for (let i = 0; i < 8; i++) {
      const group = new THREE.Group();
      
      // 摊位桌
      const table = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.8, 1.5),
        stallMat
      );
      table.position.y = 0.4;
      group.add(table);
      
      // 遮阳棚
      const awning = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.1, 2),
        awningMat
      );
      awning.position.y = 2;
      group.add(awning);
      
      // 棚柱
      for (const side of [-1, 1]) {
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 2, 4),
          new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.8 })
        );
        pole.position.set(side * 1.2, 1, 0.8);
        group.add(pole);
      }
      
      // 货物
      for (let j = 0; j < 3; j++) {
        const goods = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.2, 0.3),
          new THREE.MeshStandardMaterial({ 
            color: [0xff6644, 0x44aa66, 0x4488ff][j],
            roughness: 0.8
          })
        );
        goods.position.set((j - 1) * 0.5, 0.95, 0);
        group.add(goods);
      }
      
      group.position.set(
        174 + (Math.random() - 0.5) * 40,
        0,
        -14 + (Math.random() - 0.5) * 40
      );
      
      scene.add(group);
    }
    
    console.log('[CityLifeV2] 街头摊贩添加完成，共8个');
  }
  
  // 店铺门面 — 东西市
  function addShopFronts() {
    if (typeof scene === 'undefined') return;
    
    console.log('[CityLifeV2] 添加店铺门面...');
    
    const shopNames = ['酒肆', '茶坊', '绸缎庄', '当铺', '书局', '客栈', '镖局', '糕点铺', '瓷器店', '药铺'];
    
    // 东市店铺
    for (let i = 0; i < 10; i++) {
      const group = new THREE.Group();
      
      // 店面
      const shop = new THREE.Mesh(
        new THREE.BoxGeometry(6, 4, 4),
        new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.8 })
      );
      shop.position.y = 2;
      shop.castShadow = true;
      group.add(shop);
      
      // 招牌
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(4, 1, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.6 })
      );
      sign.position.set(0, 4.5, 2.1);
      group.add(sign);
      
      // 金色字（简化）
      const text = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.6, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7 })
      );
      text.position.set(0, 4.5, 2.22);
      group.add(text);
      
      group.position.set(
        174 + (i % 5) * 12,
        0,
        -14 + Math.floor(i / 5) * 10
      );
      
      scene.add(group);
    }
    
    console.log('[CityLifeV2] 店铺门面添加完成，共10间');
  }
  
  // 行人 — 朱雀大街
  function addPedestrians() {
    if (typeof scene === 'undefined') return;
    
    console.log('[CityLifeV2] 添加行人...');
    
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8b89a, roughness: 0.7 });
    const clothColors = [0x4a6fa5, 0x8b4513, 0x2d5a3d, 0x6b3410, 0x8b0000];
    
    // 30个行人
    for (let i = 0; i < 30; i++) {
      const group = new THREE.Group();
      
      // 身体
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 0.8, 6),
        new THREE.MeshStandardMaterial({ 
          color: clothColors[i % clothColors.length],
          roughness: 0.8
        })
      );
      body.position.y = 0.9;
      body.castShadow = true;
      group.add(body);
      
      // 头
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 6, 5),
        skinMat
      );
      head.position.y = 1.5;
      group.add(head);
      
      // 腿
      for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.05, 0.5, 4),
          new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 })
        );
        leg.position.set(side * 0.08, 0.25, 0);
        group.add(leg);
      }
      
      group.position.set(
        (Math.random() - 0.5) * 50,
        0,
        -400 + Math.random() * 800
      );
      group.rotation.y = Math.random() * Math.PI * 2;
      
      scene.add(group);
    }
    
    console.log('[CityLifeV2] 行人添加完成，共30个');
  }
  
  // 飞鸟 — 城市上空
  function addBirds() {
    if (typeof scene === 'undefined') return;
    
    console.log('[CityLifeV2] 添加飞鸟...');
    
    const birdMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    
    // 20只飞鸟
    for (let i = 0; i < 20; i++) {
      const bird = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.8, 4),
        birdMat
      );
      bird.position.set(
        (Math.random() - 0.5) * 800,
        50 + Math.random() * 80,
        (Math.random() - 0.5) * 800
      );
      bird.rotation.y = Math.random() * Math.PI * 2;
      bird.scale.set(1, 0.3, 0.3);
      scene.add(bird);
    }
    
    console.log('[CityLifeV2] 飞鸟添加完成，共20只');
  }
  
  // 猫狗 — 街头小动物
  function addPets() {
    if (typeof scene === 'undefined') return;
    
    console.log('[CityLifeV2] 添加猫狗...');
    
    const catMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.8 });
    const dogMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.8 });
    
    // 10只猫
    for (let i = 0; i < 10; i++) {
      const cat = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 5),
        catMat
      );
      cat.position.set(
        (Math.random() - 0.5) * 100,
        0.15,
        -200 + Math.random() * 400
      );
      cat.scale.y = 0.8;
      scene.add(cat);
    }
    
    // 5只狗
    for (let i = 0; i < 5; i++) {
      const dog = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.12, 0.4, 2, 4),
        dogMat
      );
      dog.position.set(
        (Math.random() - 0.5) * 100,
        0.25,
        -200 + Math.random() * 400
      );
      dog.rotation.y = Math.random() * Math.PI * 2;
      scene.add(dog);
    }
    
    console.log('[CityLifeV2] 猫狗添加完成，共15只');
  }
  
  init();
})();
