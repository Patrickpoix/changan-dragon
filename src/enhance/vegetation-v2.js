/* ============================================================
   植被系统精修 — 多层树冠、自然形态、实例化
   v1: 槐树、松树、柳树、桃树、实例化优化
   ============================================================ */

(function() {
  'use strict';
  
  // ===== 树木工厂 =====
  const TreeFactory = {
    // 创建槐树（行道树）
    createSophora(x, z, scale = 1) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.scale.setScalar(scale);
      
      // 树干 — 略带弯曲
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 });
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.35, 3, 6),
        trunkMat
      );
      trunk.position.y = 1.5;
      trunk.rotation.z = (Math.random() - 0.5) * 0.1;
      trunk.castShadow = true;
      group.add(trunk);
      
      // 主枝
      for (let i = 0; i < 3; i++) {
        const branch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.12, 1.5, 5),
          trunkMat
        );
        branch.position.set(
          (Math.random() - 0.5) * 0.5,
          2.5 + Math.random() * 0.5,
          (Math.random() - 0.5) * 0.5
        );
        branch.rotation.z = (Math.random() - 0.5) * 0.8;
        branch.rotation.x = (Math.random() - 0.5) * 0.8;
        group.add(branch);
      }
      
      // 树冠 — 多层球体，自然形态
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x4a7a4a, roughness: 0.85 });
      
      const crown1 = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 8, 6),
        leafMat
      );
      crown1.position.y = 3.5;
      crown1.castShadow = true;
      group.add(crown1);
      
      const crown2 = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 6, 5),
        leafMat
      );
      crown2.position.set(0.8, 4.2, 0.3);
      crown2.castShadow = true;
      group.add(crown2);
      
      const crown3 = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 6, 5),
        leafMat
      );
      crown3.position.set(-0.6, 4.0, -0.4);
      crown3.castShadow = true;
      group.add(crown3);
      
      scene.add(group);
      return group;
    },
    
    // 创建松树（常青）
    createPine(x, z, scale = 1) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.scale.setScalar(scale);
      
      // 树干
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.9 });
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.25, 4, 6),
        trunkMat
      );
      trunk.position.y = 2;
      trunk.castShadow = true;
      group.add(trunk);
      
      // 松针层 — 锥形
      const pineMat = new THREE.MeshStandardMaterial({ color: 0x2d5a3d, roughness: 0.85 });
      
      for (let i = 0; i < 4; i++) {
        const tier = new THREE.Mesh(
          new THREE.ConeGeometry((1.8 - i * 0.3) * 1.2, 1.2, 6),
          pineMat
        );
        tier.position.y = 2 + i * 1.0;
        tier.castShadow = true;
        group.add(tier);
      }
      
      scene.add(group);
      return group;
    },
    
    // 创建柳树（垂柳）
    createWillow(x, z, scale = 1) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.scale.setScalar(scale);
      
      // 树干
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.9 });
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.4, 3.5, 6),
        trunkMat
      );
      trunk.position.y = 1.75;
      trunk.castShadow = true;
      group.add(trunk);
      
      // 树冠 — 下垂形态
      const willowMat = new THREE.MeshStandardMaterial({ color: 0x6a9a5a, roughness: 0.85 });
      
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(2, 8, 6),
        willowMat
      );
      crown.position.y = 4.2;
      crown.scale.y = 0.7;
      crown.castShadow = true;
      group.add(crown);
      
      // 垂柳枝条 — 垂下来的
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const branch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.02, 1.5, 4),
          willowMat
        );
        branch.position.set(
          Math.cos(angle) * 1.5,
          3.5,
          Math.sin(angle) * 1.5
        );
        branch.rotation.z = Math.cos(angle) * 0.3;
        branch.rotation.x = Math.sin(angle) * 0.3;
        group.add(branch);
      }
      
      scene.add(group);
      return group;
    },
    
    // 创建桃树（花树）
    createPeach(x, z, scale = 1) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.scale.setScalar(scale);
      
      // 树干
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 });
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.25, 2.5, 6),
        trunkMat
      );
      trunk.position.y = 1.25;
      trunk.castShadow = true;
      group.add(trunk);
      
      // 树冠 — 粉色花团
      const blossomMat = new THREE.MeshStandardMaterial({ color: 0xf2a7b6, roughness: 0.8 });
      
      const crown1 = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 8, 6),
        blossomMat
      );
      crown1.position.y = 3.2;
      crown1.castShadow = true;
      group.add(crown1);
      
      // 点缀更深的花团
      for (let i = 0; i < 5; i++) {
        const blossom = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 5, 4),
          new THREE.MeshStandardMaterial({ color: 0xf08aa0, roughness: 0.8 })
        );
        blossom.position.set(
          (Math.random() - 0.5) * 2.5,
          2.8 + Math.random() * 1.2,
          (Math.random() - 0.5) * 2.5
        );
        group.add(blossom);
      }
      
      scene.add(group);
      return group;
    }
  };
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 1000);
      return;
    }
    
    console.log(['VegetationV2] 开始精修植被...']);
    
    // 朱雀大街行道槐树
    for (let i = 0; i < 15; i++) {
      const z = -400 + i * 55;
      TreeFactory.createSophora(-25, z, 0.9);
      TreeFactory.createSophora(25, z, 0.9);
    }
    
    // 曲江池柳树
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      TreeFactory.createWillow(
        520 + Math.cos(angle) * 90,
        470 + Math.sin(angle) * 75,
        1.0
      );
    }
    
    // 曲江池桃花
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + 0.3;
      TreeFactory.createPeach(
        520 + Math.cos(angle) * 85,
        470 + Math.sin(angle) * 70,
        0.9
      );
    }
    
    // 大明宫松树
    for (let i = 0; i < 12; i++) {
      TreeFactory.createPine(
        320 + (Math.random() - 0.5) * 200,
        -460 + (Math.random() - 0.5) * 150,
        1.0
      );
    }
    
    console.log('[VegetationV2] ✓ 植被精修完成');
  }
  
  init();
  
  // 暴露工厂
  window.TreeFactory = TreeFactory;
})();
