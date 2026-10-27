/* ============================================================
   朱雀大街深度精修 — 盛唐第一街
   v1: 石板路、排水沟、牌坊、店铺招牌、沿街灯笼、行道树
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 2500);
      return;
    }
    
    console.log(['ZhuqueDetail] 开始精修朱雀大街...']);
    
    addStonePavement();      // 石板路
    addDrainageDitches();     // 排水沟
    addPaifangDetails();       // 牌坊细节
    addShopSigns();           // 店铺招牌
    addStreetLanterns();       // 沿街灯笼
    addStreetTrees();          // 行道树
    
    console.log('[ZhuqueDetail] ✓ 朱雀大街精修完成');
  }
  
  // 石板路 — 精细石板纹理
  function addStonePavement() {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xb8a888, roughness: 0.9 });
    
    // 朱雀大街主路 — 宽60米，长1200米
    for (let i = 0; i < 60; i++) {
      for (let j = 0; j < 100; j++) {
        const x = -30 + i * 1.0;
        const z = -500 + j * 12;
        
        // 每块石板
        const slab = new THREE.Mesh(
          new THREE.BoxGeometry(0.95, 0.1, 11.5),
          stoneMat
        );
        slab.position.set(x, 0.05, z);
        slab.receiveShadow = true;
        scene.add(slab);
      }
    }
    
    console.log('[ZhuqueDetail] 石板路完成');
  }
  
  // 排水沟 — 街道两侧
  function addDrainageDitches() {
    const ditchMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.95 });
    
    // 两侧排水沟
    for (const side of [-1, 1]) {
      const ditch = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.3, 1200),
        ditchMat
      );
      ditch.position.set(side * 32, 0.15, 100);
      ditch.receiveShadow = true;
      scene.add(ditch);
      
      // 排水沟盖板
      for (let i = 0; i < 120; i++) {
        const cover = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.08, 1.0),
          new THREE.MeshStandardMaterial({ color: 0x6a6a6a, roughness: 0.8 })
        );
        cover.position.set(side * 32, 0.32, -500 + i * 10);
        scene.add(cover);
      }
    }
    
    console.log('[ZhuqueDetail] 排水沟完成');
  }
  
  // 牌坊细节 — 增加斗拱和彩绘
  function addPaifangDetails() {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 });
    
    // 朱雀门牌坊
    const px = 0, pz = -320;
    
    // 斗拱装饰
    for (const side of [-1, 1]) {
      const dougong = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.5, 1.0),
        woodMat
      );
      dougong.position.set(side * 12, 12.5, pz);
      scene.add(dougong);
      
      // 彩绘
      const cai = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.1, 1.1),
        goldMat
      );
      cai.position.set(side * 12, 12.8, pz);
      scene.add(cai);
    }
    
    console.log('[ZhuqueDetail] 牌坊细节完成');
  }
  
  // 店铺招牌 — 真实文字招牌
  function addShopSigns() {
    const shopNames = ['酒肆', '茶坊', '绸缎庄', '当铺', '书局', '客栈', '镖局', '糕点铺'];
    
    for (let i = 0; i < shopNames.length; i++) {
      const side = i % 2 ? 1 : -1;
      const x = side * 40 + (i > 3 ? side * 20 : 0);
      const z = -300 + Math.floor(i / 2) * 80;
      
      // 招牌板
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1.5, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.6 })
      );
      sign.position.set(x, 5, z);
      sign.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      scene.add(sign);
      
      // 文字（简化为金色条）
      const textBar = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.8, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7 })
      );
      textBar.position.set(x, 5, z + side * 0.12);
      textBar.rotation.y = sign.rotation.y;
      scene.add(textBar);
    }
    
    console.log('[ZhuqueDetail] 店铺招牌完成');
  }
  
  // 沿街灯笼 — 每隔20米一个
  function addStreetLanterns() {
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xff4422,
      emissive: 0xff2200,
      emissiveIntensity: 0.8,
      roughness: 0.5
    });
    
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 0.8 });
    
    for (let i = 0; i < 30; i++) {
      const z = -400 + i * 30;
      
      for (const side of [-1, 1]) {
        // 灯杆
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.12, 5, 6),
          poleMat
        );
        pole.position.set(side * 25, 2.5, z);
        pole.castShadow = true;
        scene.add(pole);
        
        // 灯笼
        const lantern = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 8, 6),
          lanternMat
        );
        lantern.position.set(side * 25, 5.2, z);
        lantern.scale.y = 1.2;
        scene.add(lantern);
        
        // 灯笼光
        if (i % 3 === 0) {
          const light = new THREE.PointLight(0xff6633, 0.5, 15);
          light.position.set(side * 25, 5.2, z);
          scene.add(light);
        }
      }
    }
    
    console.log('[ZhuqueDetail] 沿街灯笼完成');
  }
  
  // 行道树 — 槐树
  function addStreetTrees() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4a7a4a, roughness: 0.85 });
    
    for (let i = 0; i < 20; i++) {
      const z = -400 + i * 40;
      
      for (const side of [-1, 1]) {
        // 树干
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.4, 4, 6),
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
    
    console.log('[ZhuqueDetail] 行道树完成');
  }
  
  init();
})();
