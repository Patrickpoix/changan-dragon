/* ============================================================
   市场商业v2 — 东西市繁华盛景
   v2: 商铺、摊位、灯笼、商贩、顾客、招牌
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 6000);
      return;
    }
    
    console.log(['MarketV2] 开始增强市场商业区...']);
    
    addShopBuildings();        // 商铺建筑
    addMarketStalls();           // 集市摊位
    addMarketLanterns();          // 市场灯笼
    addVendors();                  // 商贩
    addCustomers();               // 顾客
    addShopSigns();                // 店铺招牌
    
    console.log('[MarketV2] ✓ 市场商业区增强完成');
  }
  
  // 商铺建筑 — 东西市两侧
  function addShopBuildings() {
    if (typeof scene === 'undefined') return;
    
    console.log('[MarketV2] 添加商铺建筑...');
    
    const shopColors = [0xd4a574, 0xc89868, 0xb88858];
    
    // 东市商铺
    for (let i = 0; i < 15; i++) {
      const shop = new THREE.Mesh(
        new THREE.BoxGeometry(8, 5, 6),
        new THREE.MeshStandardMaterial({ 
          color: shopColors[i % shopColors.length],
          roughness: 0.8
        })
      );
      shop.position.set(
        174 + (i % 5) * 12,
        2.5,
        -14 + Math.floor(i / 5) * 10
      );
      shop.castShadow = true;
      scene.add(shop);
      
      // 屋顶
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(6, 2.5, 4),
        new THREE.MeshStandardMaterial({ color: 0x4a6670, roughness: 0.6 })
      );
      roof.position.set(
        174 + (i % 5) * 12,
        6.25,
        -14 + Math.floor(i / 5) * 10
      );
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      scene.add(roof);
    }
    
    console.log('[MarketV2] 商铺建筑添加完成，共15间');
  }
  
  // 集市摊位 — 市场中央
  function addMarketStalls() {
    if (typeof scene === 'undefined') return;
    
    console.log('[MarketV2] 添加集市摊位...');
    
    const stallMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.8 });
    
    // 东市场地摊位
    for (let i = 0; i < 12; i++) {
      const stall = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.8, 2),
        stallMat
      );
      stall.position.set(
        174 + (Math.random() - 0.5) * 50,
        0.4,
        -14 + (Math.random() - 0.5) * 40
      );
      stall.castShadow = true;
      scene.add(stall);
      
      // 货物
      const goods = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.3, 1.5),
        new THREE.MeshStandardMaterial({ 
          color: [0xff6644, 0x44aa66, 0x4488ff, 0xffaa00][i % 4],
          roughness: 0.8
        })
      );
      goods.position.copy(stall.position);
      goods.position.y = 1.05;
      scene.add(goods);
    }
    
    console.log('[MarketV2] 集市摊位添加完成，共12个');
  }
  
  // 市场灯笼 — 商铺前
  function addMarketLanterns() {
    if (typeof scene === 'undefined') return;
    
    console.log('[MarketV2] 添加市场灯笼...');
    
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xff4422,
      emissive: 0xff2200,
      emissiveIntensity: 0.8,
      roughness: 0.5
    });
    
    // 东市灯笼
    for (let i = 0; i < 20; i++) {
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 6, 4),
        lanternMat
      );
      lantern.position.set(
        174 + (Math.random() - 0.5) * 60,
        4,
        -14 + (Math.random() - 0.5) * 50
      );
      lantern.scale.y = 1.3;
      scene.add(lantern);
    }
    
    console.log('[MarketV2] 市场灯笼添加完成');
  }
  
  // 商贩 — 摊位后的小贩
  function addVendors() {
    if (typeof scene === 'undefined') return;
    
    console.log('[MarketV2] 添加商贩...');
    
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8b89a, roughness: 0.7 });
    const clothColors = [0x8b4513, 0x4a6fa5, 0x2d5a3d];
    
    // 15个商贩
    for (let i = 0; i < 15; i++) {
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
      
      group.position.set(
        174 + (Math.random() - 0.5) * 50,
        0,
        -14 + (Math.random() - 0.5) * 40
      );
      group.rotation.y = Math.PI / 2;
      
      scene.add(group);
    }
    
    console.log('[MarketV2] 商贩添加完成，共15个');
  }
  
  // 顾客 — 市场里逛街的人
  function addCustomers() {
    if (typeof scene === 'undefined') return;
    
    console.log('[MarketV2] 添加顾客...');
    
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8b89a, roughness: 0.7 });
    const clothColors = [0x4a6fa5, 0x8b4513, 0x2d5a3d, 0x6b3410, 0x8b0000];
    
    // 25个顾客
    for (let i = 0; i < 25; i++) {
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
      
      group.position.set(
        174 + (Math.random() - 0.5) * 60,
        0,
        -14 + (Math.random() - 0.5) * 50
      );
      group.rotation.y = Math.random() * Math.PI * 2;
      
      scene.add(group);
    }
    
    console.log('[MarketV2] 顾客添加完成，共25个');
  }
  
  // 店铺招牌 — 商铺上方的牌匾
  function addShopSigns() {
    if (typeof scene === 'undefined') return;
    
    console.log('[MarketV2] 添加店铺招牌...');
    
    const signNames = ['酒肆', '茶坊', '绸缎庄', '当铺', '书局', '客栈', '镖局', '糕点铺', '瓷器店', '药铺'];
    
    // 东市招牌
    for (let i = 0; i < 10; i++) {
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1, 0.15),
        new THREE.MeshStandardMaterial({ 
          color: 0x8b0000,
          roughness: 0.6
        })
      );
      sign.position.set(
        174 + (i % 5) * 12,
        5.5,
        -14 + Math.floor(i / 5) * 10 + 3.1
      );
      scene.add(sign);
      
      // 金色字
      const text = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.6, 0.05),
        new THREE.MeshStandardMaterial({ 
          color: 0xffd700,
          metalness: 0.7
        })
      );
      text.position.set(
        174 + (i % 5) * 12,
        5.5,
        -14 + Math.floor(i / 5) * 10 + 3.2
      );
      scene.add(text);
    }
    
    console.log('[MarketV2] 店铺招牌添加完成');
  }
  
  init();
})();
