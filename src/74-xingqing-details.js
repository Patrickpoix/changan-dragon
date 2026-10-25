/* ============================================================
   兴庆宫细节增强 · 提升宫苑质感
   ============================================================ */

class XingqingDetails {
  // 为兴庆宫添加牡丹
  addPeonies() {
    const peonyMat = new THREE.MeshStandardMaterial({ color: 0xd4738c, roughness: 0.8 });
    
    // 沉香亭畔牡丹
    for (let i = 0; i < 12; i++) {
      const peony = new THREE.Mesh(UNIT_SPHERE, peonyMat);
      peony.scale.set(0.4, 0.3, 0.4);
      peony.position.set(-200 + Math.random() * 40, 0.3, 100 + Math.random() * 30);
      scene.add(peony);
    }
  },
  
  // 为兴庆宫添加龙池岸边柳树
  addWillows() {
    const trunkMat = MAT.trunk;
    const leafMat = MAT.leaf;
    
    // 龙池岸边柳树
    for (let i = 0; i < 8; i++) {
      const trunk = new THREE.Mesh(UNIT_CYL, trunkMat);
      trunk.scale.set(0.3, 3, 0.3);
      trunk.position.set(-220 + i * 8, 1.5, 90);
      scene.add(trunk);
      
      const leaf = new THREE.Mesh(UNIT_SPHERE, leafMat);
      leaf.scale.set(2.5, 2, 2.5);
      leaf.position.set(-220 + i * 8, 4, 90);
      scene.add(leaf);
    }
  },
  
  init() {
    this.addPeonies();
    this.addWillows();
    console.log('[XingqingDetails] 兴庆宫细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new XingqingDetails().init();
  };
}
