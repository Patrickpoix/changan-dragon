/* ============================================================
   唐代桥梁生成器 v2.0
   精细石拱桥、木桥、廊桥 — 替代简单长方体桥梁
   ============================================================ */

const TangBridgeBuilder = {
  
  // 石拱桥 — 半圆形拱
  createStoneArchBridge(length, width, archHeight) {
    const group = new THREE.Group();
    
    const deckShape = new THREE.Shape();
    const segments = 16;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = (t - 0.5) * length;
      const y = Math.sin(t * Math.PI) * archHeight * 0.3;
      
      if (i === 0) {
        deckShape.moveTo(x, y);
      } else {
        deckShape.lineTo(x, y);
      }
    }
    
    for (let i = segments; i >= 0; i--) {
      const t = i / segments;
      const x = (t - 0.5) * length;
      const y = Math.sin(t * Math.PI) * archHeight * 0.3 - 0.5;
      deckShape.lineTo(x, y);
    }
    
    deckShape.closePath();
    
    const deckGeo = new THREE.ExtrudeGeometry(deckShape, {
      depth: width,
      bevelEnabled: false
    });
    
    const deckMat = new THREE.MeshStandardMaterial({ 
      color: 0xd8c9ad, 
      roughness: 0.9 
    });
    
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.rotation.y = Math.PI / 2;
    deck.position.y = 1;
    deck.castShadow = true;
    deck.receiveShadow = true;
    group.add(deck);
    
    const archShape = new THREE.Shape();
    archShape.moveTo(-length * 0.3, 0);
    archShape.lineTo(length * 0.3, 0);
    archShape.lineTo(length * 0.3, archHeight);
    archShape.absarc(0, archHeight, length * 0.3, 0, Math.PI, false);
    archShape.lineTo(-length * 0.3, 0);
    
    const archHole = new THREE.Path();
    archHole.moveTo(-length * 0.25, 0.1);
    archHole.lineTo(length * 0.25, 0.1);
    archHole.lineTo(length * 0.25, archHeight * 0.9);
    archHole.absarc(0, archHeight * 0.9, length * 0.25, 0, Math.PI, false);
    archHole.lineTo(-length * 0.25, 0.1);
    
    archShape.holes.push(archHole);
    
    const archGeo = new THREE.ExtrudeGeometry(archShape, {
      depth: width * 0.9,
      bevelEnabled: false
    });
    
    const arch = new THREE.Mesh(archGeo, deckMat);
    arch.rotation.y = Math.PI / 2;
    arch.position.y = 0;
    arch.castShadow = true;
    group.add(arch);
    
    const railMat = new THREE.MeshStandardMaterial({ color: 0xc8b99d, roughness: 0.9 });
    
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(length, 0.15, 0.1),
        railMat
      );
      rail.position.set(0, 1.8, side * width / 2);
      group.add(rail);
      
      const postCount = Math.floor(length / 2);
      for (let i = 0; i <= postCount; i++) {
        const t = i / postCount;
        const x = (t - 0.5) * length;
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.8, 0.15),
          railMat
        );
        post.position.set(x, 1.4, side * width / 2);
        group.add(post);
      }
    }
    
    return group;
  },
  
  // 木桥 — 平直板桥
  createWoodenBridge(length, width) {
    const group = new THREE.Group();
    
    const deckMat = new THREE.MeshStandardMaterial({ 
      color: 0x8b6f47, 
      roughness: 0.8 
    });
    
    const plankCount = Math.floor(length / 1);
    for (let i = 0; i < plankCount; i++) {
      const t = i / plankCount;
      const x = (t - 0.5) * length + 0.5;
      
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.1, width),
        deckMat
      );
      plank.position.set(x, 0.5, 0);
      plank.receiveShadow = true;
      group.add(plank);
    }
    
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.9 });
    const pierCount = Math.floor(length / 10);
    
    for (let i = 0; i <= pierCount; i++) {
      const t = i / pierCount;
      const x = (t - 0.5) * length;
      
      const pier = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 1, 8),
        pierMat
      );
      pier.position.set(x, 0, 0);
      group.add(pier);
    }
    
    const railMat = new THREE.MeshStandardMaterial({ color: 0x6b4f2a });
    
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(length, 0.1, 0.1),
        railMat
      );
      rail.position.set(0, 1.2, side * width / 2);
      group.add(rail);
      
      const postCount = Math.floor(length / 1.5);
      for (let i = 0; i <= postCount; i++) {
        const t = i / postCount;
        const x = (t - 0.5) * length;
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6),
          railMat
        );
        post.position.set(x, 0.9, side * width / 2);
        group.add(post);
      }
    }
    
    return group;
  },
  
  // 廊桥 — 带屋顶的桥
  createCoveredBridge(length, width) {
    const group = new THREE.Group();
    
    const base = this.createWoodenBridge(length, width);
    group.add(base);
    
    const roofGeo = new THREE.BoxGeometry(length, 0.2, width + 1);
    const roofMat = new THREE.MeshStandardMaterial({ 
      color: 0x5c7475, 
      roughness: 0.7 
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 2.5;
    roof.castShadow = true;
    group.add(roof);
    
    const columnMat = new THREE.MeshStandardMaterial({ color: 0x6b4f2a });
    const columnCount = Math.floor(length / 3);
    
    for (let i = 0; i <= columnCount; i++) {
      const t = i / columnCount;
      const x = (t - 0.5) * length;
      
      for (const side of [-1, 1]) {
        const column = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8),
          columnMat
        );
        column.position.set(x, 1.75, side * width / 2);
        column.castShadow = true;
        group.add(column);
      }
    }
    
    return group;
  }
};

window.TangBridgeBuilder = TangBridgeBuilder;

console.log('[Tang-Bridge] 唐代桥梁生成器加载完成');
