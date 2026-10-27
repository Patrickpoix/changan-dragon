/* ============================================================
   植被增强 — 长安绿化系统
   v1: 行道树、花坛、花树、城外田园
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log('[Greenery] 开始增强植被效果...');
    
    addStreetTrees();
    addFlowerBeds();
    addFloweringTrees();
    addOutsideFields();
    
    console.log('[Greenery] ✓ 植被效果增强完成');
  }
  
  // 行道树 — 朱雀大街两旁
  function addStreetTrees() {
    // 槐树 — 朱雀大街
    for (let z = -350; z <= 550; z += 20) {
      for (const side of [-1, 1]) {
        createPagodaTree(side * 55, z);
      }
    }
    
    // 东西市街道树
    for (let z = -80; z <= 80; z += 15) {
      for (const x of [-150, 150]) {
        createRoundTree(x - 35, z);
        createRoundTree(x + 35, z);
      }
    }
  }
  
  // 花坛 — 宫殿前、广场
  function addFlowerBeds() {
    // 大明宫前广场花坛
    const DX = 320, DZ = -460;
    for (let i = -5; i <= 5; i++) {
      createFlowerBed(DX + i * 15, DZ + 40, 0xff69b4);
    }
    
    // 大雁塔前花坛
    for (let i = -3; i <= 3; i++) {
      createFlowerBed(300 + i * 12, 420 + 30, 0xffb6c1);
    }
    
    // 曲江池边花坛
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      createFlowerBed(
        520 + Math.cos(angle) * 95,
        470 + Math.sin(angle) * 80,
        pick([0xff69b4, 0xff1493, 0xffd700, 0xff6347])
      );
    }
  }
  
  // 花树 — 桃花、樱花
  function addFloweringTrees() {
    // 曲江池边桃花
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 90 + Math.random() * 10;
      createPeachTree(
        520 + Math.cos(angle) * radius,
        470 + Math.sin(angle) * radius
      );
    }
    
    // 兴庆宫牡丹
    for (let i = 0; i < 20; i++) {
      createPeachTree(
        560 + Math.random() * 100,
        -240 + Math.random() * 90
      );
    }
  }
  
  // 城外田园
  function addOutsideFields() {
    // 城外农田
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 1000;
      const z = 600 + Math.random() * 200;
      
      // 稻田
      const fieldGeo = new THREE.PlaneGeometry(20, 15);
      const fieldMat = new THREE.MeshStandardMaterial({ color: 0x9acd32, roughness: 1.0 });
      const field = new THREE.Mesh(fieldGeo, fieldMat);
      field.rotation.x = -Math.PI / 2;
      field.position.set(x, 0.02, z);
      field.receiveShadow = true;
      scene.add(field);
    }
    
    // 城外树林
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 1200;
      const z = (Math.random() > 0.5 ? 1 : -1) * (550 + Math.random() * 200);
      
      if (Math.random() > 0.5) {
        createRoundTree(x, z);
      } else {
        createPineTree(x, z);
      }
    }
  }
  
  // 工具函数
  function createPagodaTree(x, z) {
    // 树干
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 5, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 2.5, z);
    trunk.castShadow = true;
    scene.add(trunk);
    
    // 塔形树冠
    for (let i = 0; i < 4; i++) {
      const leafGeo = new THREE.SphereGeometry(4 - i * 0.6, 8, 6);
      const leafMat = new THREE.MeshStandardMaterial({ color: i % 2 ? 0x5a8a4a : 0x4a7a3a, roughness: 0.85 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(x, 6 + i * 2.2, z);
      leaf.scale.y = 0.7;
      leaf.castShadow = true;
      scene.add(leaf);
    }
  }
  
  function createRoundTree(x, z) {
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 2, z);
    trunk.castShadow = true;
    scene.add(trunk);
    
    const leafGeo = new THREE.SphereGeometry(3.5, 8, 6);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x5a8a4a, roughness: 0.85 });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(x, 6, z);
    leaf.castShadow = true;
    scene.add(leaf);
  }
  
  function createPineTree(x, z) {
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 2, z);
    trunk.castShadow = true;
    scene.add(trunk);
    
    for (let i = 0; i < 3; i++) {
      const pineGeo = new THREE.ConeGeometry(3 - i * 0.5, 3, 8);
      const pineMat = new THREE.MeshStandardMaterial({ color: 0x3a5a3a, roughness: 0.85 });
      const pine = new THREE.Mesh(pineGeo, pineMat);
      pine.position.set(x, 5 + i * 2.5, z);
      pine.castShadow = true;
      scene.add(pine);
    }
  }
  
  function createPeachTree(x, z) {
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 1.5, z);
    trunk.castShadow = true;
    scene.add(trunk);
    
    const blossomGeo = new THREE.SphereGeometry(3, 8, 6);
    const blossomMat = new THREE.MeshStandardMaterial({
      color: 0xffb6c1,
      roughness: 0.7,
      emissive: 0xff99aa,
      emissiveIntensity: 0.1
    });
    const blossom = new THREE.Mesh(blossomGeo, blossomMat);
    blossom.position.set(x, 4.5, z);
    blossom.castShadow = true;
    scene.add(blossom);
  }
  
  function createFlowerBed(x, z, color) {
    // 花坛
    const bedGeo = new THREE.BoxGeometry(8, 0.3, 3);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.9 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(x, 0.15, z);
    bed.receiveShadow = true;
    scene.add(bed);
    
    // 花
    for (let i = 0; i < 10; i++) {
      const flowerGeo = new THREE.SphereGeometry(0.3, 4, 3);
      const flowerMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
      const flower = new THREE.Mesh(flowerGeo, flowerMat);
      flower.position.set(x - 3.5 + i * 0.8, 0.5, z + (Math.random() - 0.5) * 2);
      scene.add(flower);
    }
  }
  
  init();
})();
