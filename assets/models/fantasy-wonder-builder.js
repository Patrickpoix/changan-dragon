/* ============================================================
   仙侠魔幻奇观建筑生成器 v1.0
   浮空楼阁、云中仙境、超现实盛唐气象
   ============================================================ */

const FantasyWonderBuilder = {
  
  // 浮空岛 — 悬浮岩石基座
  createFloatingIsland(radius, height) {
    const group = new THREE.Group();
    
    const rockGeo = new THREE.ConeGeometry(radius, height, 8);
    const rockMat = new THREE.MeshStandardMaterial({ 
      color: 0x6b5b4a, 
      roughness: 0.9,
      flatShading: true
    });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.rotation.x = Math.PI;
    rock.position.y = -height / 2;
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
    
    const platformGeo = new THREE.CylinderGeometry(radius * 0.9, radius, 2, 8);
    const platformMat = new THREE.MeshStandardMaterial({ 
      color: 0x8a7a6a, 
      roughness: 0.8 
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 1;
    platform.receiveShadow = true;
    group.add(platform);
    
    const vineMat = new THREE.MeshStandardMaterial({ color: 0x4a7c59, roughness: 0.9 });
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const vine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, height * 0.6, 4),
        vineMat
      );
      vine.position.set(
        Math.cos(angle) * radius * 0.7,
        -height * 0.3,
        Math.sin(angle) * radius * 0.7
      );
      group.add(vine);
    }
    
    return group;
  },
  
  // 仙侠风格楼阁 — 多层飞檐
  createXianxiaPavilion(width, height, tiers) {
    const group = new THREE.Group();
    
    let currentY = 0;
    
    for (let i = 0; i < tiers; i++) {
      const t = i / tiers;
      const tierWidth = width * (1 - t * 0.3);
      const tierHeight = height / tiers * (1 - t * 0.2);
      
      const bodyGeo = new THREE.BoxGeometry(tierWidth, tierHeight, tierWidth);
      const bodyMat = new THREE.MeshStandardMaterial({ 
        color: 0x9c4938, 
        roughness: 0.7 
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = currentY + tierHeight / 2;
      body.castShadow = true;
      group.add(body);
      
      const roofGeo = new THREE.ConeGeometry(
        tierWidth * 0.8, 
        tierHeight * 0.6, 
        4
      );
      const roofMat = new THREE.MeshStandardMaterial({ 
        color: 0x5c7475, 
        roughness: 0.6,
        metalness: 0.2
      });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = currentY + tierHeight + tierHeight * 0.3;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);
      
      const finialGeo = new THREE.SphereGeometry(0.3, 8, 6);
      const finialMat = new THREE.MeshStandardMaterial({ 
        color: 0xd4af37, 
        metalness: 0.9, 
        roughness: 0.2 
      });
      const finial = new THREE.Mesh(finialGeo, finialMat);
      finial.position.y = currentY + tierHeight + tierHeight * 0.6 + 0.5;
      group.add(finial);
      
      currentY += tierHeight + tierHeight * 0.6;
    }
    
    return group;
  },
  
  // 悬空栈道
  createSkyBridge(length, width) {
    const group = new THREE.Group();
    
    const deckGeo = new THREE.BoxGeometry(length, 0.3, width);
    const deckMat = new THREE.MeshStandardMaterial({ 
      color: 0x8b6f47, 
      roughness: 0.8 
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.receiveShadow = true;
    group.add(deck);
    
    const railMat = new THREE.MeshStandardMaterial({ color: 0x6b4f2a });
    
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(length, 0.1, 0.1),
        railMat
      );
      rail.position.set(0, 1, side * width / 2);
      group.add(rail);
      
      const postCount = Math.floor(length / 2);
      for (let i = 0; i <= postCount; i++) {
        const t = i / postCount;
        const x = (t - 0.5) * length;
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 1, 0.1),
          railMat
        );
        post.position.set(x, 0.5, side * width / 2);
        group.add(post);
      }
    }
    
    return group;
  },
  
  // 摘星楼 — 超高塔
  createStarTower(height) {
    const group = new THREE.Group();
    
    const baseGeo = new THREE.CylinderGeometry(15, 18, 5, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xd8c9ad, roughness: 0.9 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 2.5;
    base.receiveShadow = true;
    group.add(base);
    
    const tiers = 12;
    let currentY = 5;
    
    for (let i = 0; i < tiers; i++) {
      const t = i / tiers;
      const radius = 10 - t * 6;
      const tierHeight = height / tiers;
      
      const bodyGeo = new THREE.CylinderGeometry(radius * 0.9, radius, tierHeight, 8);
      const bodyMat = new THREE.MeshStandardMaterial({ 
        color: i % 2 === 0 ? 0x9c4938 : 0x8b3a28, 
        roughness: 0.7 
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = currentY + tierHeight / 2;
      body.castShadow = true;
      group.add(body);
      
      const eaveGeo = new THREE.CylinderGeometry(radius * 1.1, radius, 0.5, 8);
      const eaveMat = new THREE.MeshStandardMaterial({ color: 0x5c7475, roughness: 0.6 });
      const eave = new THREE.Mesh(eaveGeo, eaveMat);
      eave.position.y = currentY + tierHeight;
      group.add(eave);
      
      currentY += tierHeight;
    }
    
    const topGeo = new THREE.ConeGeometry(4, 8, 8);
    const topMat = new THREE.MeshStandardMaterial({ 
      color: 0xd4af37, 
      metalness: 0.8, 
      roughness: 0.3 
    });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = currentY + 4;
    group.add(top);
    
    return group;
  },
  
  // 云海 — 地面云雾效果
  createCloudSea(width, depth) {
    const group = new THREE.Group();
    
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      roughness: 1
    });
    
    for (let i = 0; i < 20; i++) {
      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(
          Math.random() * 5 + 3,
          8, 6
        ),
        cloudMat
      );
      cloud.position.set(
        (Math.random() - 0.5) * width,
        Math.random() * 2 + 1,
        (Math.random() - 0.5) * depth
      );
      cloud.scale.y = 0.3;
      group.add(cloud);
    }
    
    return group;
  }
};

window.FantasyWonderBuilder = FantasyWonderBuilder;

console.log('[Fantasy-Wonder] 仙侠魔幻奇观建筑生成器加载完成');
