/* ============================================================
   曲江池细节增强 · 提升水景质感
   ============================================================ */

class QujiangDetails {
  // 为曲江池添加荷花
  addLotus() {
    const lotusMat = new THREE.MeshStandardMaterial({ color: 0xffb7c5, roughness: 0.8 });
    
    // 曲江池荷花
    for (let i = 0; i < 15; i++) {
      const lotus = new THREE.Mesh(UNIT_SPHERE, lotusMat);
      lotus.scale.set(0.5, 0.3, 0.5);
      lotus.position.set(400 + Math.random() * 80, 0.5, 280 + Math.random() * 60);
      scene.add(lotus);
    }
  },
  
  // 为曲江池添加柳树
  addWillows() {
    const trunkMat = MAT.trunk;
    const leafMat = MAT.leaf;
    
    // 曲江池岸边柳树
    for (let i = 0; i < 10; i++) {
      const trunk = new THREE.Mesh(UNIT_CYL, trunkMat);
      trunk.scale.set(0.3, 3, 0.3);
      trunk.position.set(390 + i * 10, 1.5, 270);
      scene.add(trunk);
      
      const leaf = new THREE.Mesh(UNIT_SPHERE, leafMat);
      leaf.scale.set(2.5, 2, 2.5);
      leaf.position.set(390 + i * 10, 4, 270);
      scene.add(leaf);
    }
  },
  
  init() {
    this.addLotus();
    this.addWillows();
    console.log('[QujiangDetails] 曲江池细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new QujiangDetails().init();
  };
}
