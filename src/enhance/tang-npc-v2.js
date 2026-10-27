/* ============================================================
   唐代人物NPC精模 — 服饰、头饰、姿态
   v1: 书生、仕女、商人、士兵、百姓
   ============================================================ */

(function() {
  'use strict';
  
  // ===== 人物工厂 =====
  const TangCharacterFactory = {
    // 创建书生
    createScholar(x, z, rotation = 0) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rotation;
      
      // 身体 — 宽袖长袍
      const robeMat = new THREE.MeshStandardMaterial({ color: 0x4a6fa5, roughness: 0.8 });
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.35, 1.2, 8),
        robeMat
      );
      body.position.y = 0.9;
      body.castShadow = true;
      group.add(body);
      
      // 宽袖
      for (const side of [-1, 1]) {
        const sleeve = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.6, 0.15),
          robeMat
        );
        sleeve.position.set(side * 0.3, 1.1, 0);
        group.add(sleeve);
      }
      
      // 头
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xe8b89a, roughness: 0.7 })
      );
      head.position.y = 1.7;
      head.castShadow = true;
      group.add(head);
      
      // 头巾
      const hat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.1, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 })
      );
      hat.position.y = 1.82;
      group.add(hat);
      
      // 脚
      for (const side of [-1, 1]) {
        const foot = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.08, 0.25),
          new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 })
        );
        foot.position.set(side * 0.12, 0.04, 0);
        group.add(foot);
      }
      
      scene.add(group);
      return group;
    },
    
    // 创建仕女
    createLady(x, z, rotation = 0) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rotation;
      
      // 身体 — 长裙
      const dressMat = new THREE.MeshStandardMaterial({ color: 0xf2a7b6, roughness: 0.7 });
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.4, 1.3, 8),
        dressMat
      );
      body.position.y = 0.85;
      body.castShadow = true;
      group.add(body);
      
      // 上身
      const top = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.2, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0xfff0f0, roughness: 0.7 })
      );
      top.position.y = 1.6;
      group.add(top);
      
      // 头
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xf0c8a8, roughness: 0.7 })
      );
      head.position.y = 2.0;
      head.castShadow = true;
      group.add(head);
      
      // 发髻
      const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 })
      );
      hair.position.y = 2.1;
      hair.scale.y = 0.8;
      group.add(hair);
      
      // 发饰
      const hairpin = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 4, 4),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 })
      );
      hairpin.position.set(0.1, 2.15, 0);
      group.add(hairpin);
      
      // 袖
      for (const side of [-1, 1]) {
        const sleeve = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.5, 0.12),
          dressMat
        );
        sleeve.position.set(side * 0.25, 1.5, 0);
        group.add(sleeve);
      }
      
      scene.add(group);
      return group;
    },
    
    // 创建商人
    createMerchant(x, z, rotation = 0) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rotation;
      
      // 身体 — 短打
      const clothMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.85 });
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.32, 0.9, 8),
        clothMat
      );
      body.position.y = 0.8;
      body.castShadow = true;
      group.add(body);
      
      // 腰带
      const belt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.08, 8),
        new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.8 })
      );
      belt.position.y = 1.0;
      group.add(belt);
      
      // 头
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xe0b090, roughness: 0.7 })
      );
      head.position.y = 1.45;
      group.add(head);
      
      // 头巾
      const turban = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.12, 8),
        new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.8 })
      );
      turban.position.y = 1.57;
      group.add(turban);
      
      // 腿
      for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.07, 0.6, 6),
          new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.8 })
        );
        leg.position.set(side * 0.12, 0.3, 0);
        group.add(leg);
      }
      
      scene.add(group);
      return group;
    },
    
    // 创建士兵
    createSoldier(x, z, rotation = 0) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rotation;
      
      // 身体 — 盔甲
      const armorMat = new THREE.MeshStandardMaterial({ 
        color: 0x4a5a6a, 
        roughness: 0.5,
        metalness: 0.6
      });
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.35, 1.1, 8),
        armorMat
      );
      body.position.y = 0.95;
      body.castShadow = true;
      group.add(body);
      
      // 胸甲
      const chest = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.4, 0.2),
        armorMat
      );
      chest.position.set(0, 1.2, 0.2);
      group.add(chest);
      
      // 头
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xd8a888, roughness: 0.7 })
      );
      head.position.y = 1.7;
      group.add(head);
      
      // 头盔
      const helmet = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.18, 0.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x3a4a5a, metalness: 0.7, roughness: 0.4 })
      );
      helmet.position.y = 1.82;
      group.add(helmet);
      
      // 红缨
      const plume = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.2, 4),
        new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.8 })
      );
      plume.position.y = 2.0;
      group.add(plume);
      
      // 长矛
      const spear = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.8 })
      );
      spear.position.set(0.4, 1.2, 0);
      spear.rotation.z = 0.1;
      group.add(spear);
      
      scene.add(group);
      return group;
    }
  };
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 800);
      return;
    }
    
    console.log(['TangNPC] 开始创建唐代精模NPC...']);
    
    // 在朱雀大街放置不同角色
    const npcPositions = [
      { type: 'scholar', x: -20, z: 0, rot: 0 },
      { type: 'scholar', x: 25, z: -50, rot: Math.PI },
      { type: 'lady', x: -30, z: 50, rot: Math.PI / 2 },
      { type: 'lady', x: 35, z: -100, rot: -Math.PI / 2 },
      { type: 'merchant', x: -40, z: -20, rot: 0 },
      { type: 'merchant', x: 45, z: 30, rot: Math.PI },
      { type: 'soldier', x: -50, z: -320, rot: 0 },  // 朱雀门士兵
      { type: 'soldier', x: 50, z: -320, rot: 0 },
    ];
    
    npcPositions.forEach(pos => {
      switch(pos.type) {
        case 'scholar': TangCharacterFactory.createScholar(pos.x, pos.z, pos.rot); break;
        case 'lady': TangCharacterFactory.createLady(pos.x, pos.z, pos.rot); break;
        case 'merchant': TangCharacterFactory.createMerchant(pos.x, pos.z, pos.rot); break;
        case 'soldier': TangCharacterFactory.createSoldier(pos.x, pos.z, pos.rot); break;
      }
    });
    
    console.log('[TangNPC] ✓ 唐代精模NPC创建完成，共' + npcPositions.length + '个');
  }
  
  init();
  
  // 暴露工厂
  window.TangCharacterFactory = TangCharacterFactory;
})();
