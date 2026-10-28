/* ============================================================
   唐代植被生成器 v2.0
   精细树木、花卉、竹林 — 替代简单球体树冠
   ============================================================ */

const TangNatureBuilder = {
  
  // 松树 — 层叠式树冠
  createPine(scale = 1) {
    const group = new THREE.Group();
    
    const trunkGeo = new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 1.5 * scale, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.75 * scale;
    trunk.castShadow = true;
    group.add(trunk);
    
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d5a3d, roughness: 0.8 });
    
    for (let i = 0; i < 3; i++) {
      const layerScale = 1 - i * 0.2;
      const layerGeo = new THREE.ConeGeometry(
        0.8 * scale * layerScale,
        0.6 * scale,
        8
      );
      const layer = new THREE.Mesh(layerGeo, leafMat);
      layer.position.y = (1.5 + i * 0.5) * scale;
      layer.castShadow = true;
      group.add(layer);
    }
    
    return group;
  },
  
  // 柳树 — 垂枝
  createWillow(scale = 1) {
    const group = new THREE.Group();
    
    const trunkGeo = new THREE.CylinderGeometry(0.1 * scale, 0.15 * scale, 2 * scale, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1 * scale;
    trunk.castShadow = true;
    group.add(trunk);
    
    const crownGeo = new THREE.SphereGeometry(1 * scale, 10, 8);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x4a8c5a, roughness: 0.8 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = 2.2 * scale;
    crown.scale.y = 0.7;
    crown.castShadow = true;
    group.add(crown);
    
    const branchMat = new THREE.MeshStandardMaterial({ color: 0x5a9c6a, roughness: 0.8 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02 * scale, 0.01 * scale, 0.8 * scale, 4),
        branchMat
      );
      branch.position.set(
        Math.cos(angle) * 0.8 * scale,
        2 * scale,
        Math.sin(angle) * 0.8 * scale
      );
      branch.rotation.z = Math.cos(angle) * 0.3;
      branch.rotation.x = Math.sin(angle) * 0.3;
      group.add(branch);
    }
    
    return group;
  },
  
  // 桃花树 — 粉色花树
  createPeachTree(scale = 1) {
    const group = new THREE.Group();
    
    const trunkGeo = new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 1.2 * scale, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.6 * scale;
    trunk.castShadow = true;
    group.add(trunk);
    
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf2a7b6, roughness: 0.8 });
    
    const crownPositions = [
      [0, 1.8, 0],
      [-0.5, 1.6, 0.3],
      [0.5, 1.6, -0.3],
      [0.2, 2.0, -0.2],
      [-0.2, 2.0, 0.2],
    ];
    
    crownPositions.forEach(([x, y, z]) => {
      const blossom = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 * scale, 8, 6),
        flowerMat
      );
      blossom.position.set(x * scale, y * scale, z * scale);
      blossom.castShadow = true;
      group.add(blossom);
    });
    
    return group;
  },
  
  // 竹子
  createBamboo(scale = 1) {
    const group = new THREE.Group();
    
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x4a8c4a, roughness: 0.7 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x5a9c5a, roughness: 0.8 });
    
    for (let i = 0; i < 3; i++) {
      const offsetX = (i - 1) * 0.15 * scale;
      const offsetZ = (i % 2) * 0.1 * scale;
      
      const stalkGeo = new THREE.CylinderGeometry(0.03 * scale, 0.04 * scale, 2.5 * scale, 6);
      const stalk = new THREE.Mesh(stalkGeo, stalkMat);
      stalk.position.set(offsetX, 1.25 * scale, offsetZ);
      stalk.castShadow = true;
      group.add(stalk);
      
      for (let j = 0; j < 4; j++) {
        const nodeGeo = new THREE.CylinderGeometry(0.045 * scale, 0.045 * scale, 0.02 * scale, 6);
        const node = new THREE.Mesh(nodeGeo, stalkMat);
        node.position.set(offsetX, (0.5 + j * 0.6) * scale, offsetZ);
        group.add(node);
      }
      
      for (let j = 0; j < 5; j++) {
        const leafGeo = new THREE.PlaneGeometry(0.3 * scale, 0.05 * scale);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(
          offsetX + (Math.random() - 0.5) * 0.4 * scale,
          (2.2 + Math.random() * 0.3) * scale,
          offsetZ + (Math.random() - 0.5) * 0.4 * scale
        );
        leaf.rotation.z = Math.random() * Math.PI;
        leaf.rotation.x = Math.random() * 0.5;
        group.add(leaf);
      }
    }
    
    return group;
  },
  
  // 荷花
  createLotus(scale = 1) {
    const group = new THREE.Group();
    
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4a8c5a, roughness: 0.8 });
    const leafGeo = new THREE.CircleGeometry(0.3 * scale, 12);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.rotation.x = -Math.PI / 2;
    leaf.position.y = 0.05 * scale;
    group.add(leaf);
    
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xf2a7b6, roughness: 0.7 });
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const petalGeo = new THREE.SphereGeometry(0.08 * scale, 6, 4);
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(
        Math.cos(angle) * 0.1 * scale,
        0.15 * scale,
        Math.sin(angle) * 0.1 * scale
      );
      petal.scale.y = 1.5;
      group.add(petal);
    }
    
    const centerGeo = new THREE.SphereGeometry(0.05 * scale, 6, 4);
    const centerMat = new THREE.MeshStandardMaterial({ color: 0xf1ce78 });
    const center = new THREE.Mesh(centerGeo, centerMat);
    center.position.y = 0.15 * scale;
    group.add(center);
    
    return group;
  }
};

window.TangNatureBuilder = TangNatureBuilder;

console.log('[Tang-Nature] 唐代植被生成器加载完成');
