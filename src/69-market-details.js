/* ============================================================
   东西市细节增强 · 提升市井质感
   ============================================================ */

class MarketDetails {
  // 为东西市添加摊位
  addStalls() {
    const stallMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });
    
    // 西市摊位
    for (let i = 0; i < 10; i++) {
      const stall = new THREE.Mesh(UNIT_BOX, stallMat);
      stall.scale.set(3, 2, 2);
      stall.position.set(-250 + (i % 5) * 12, 1, -20 + Math.floor(i / 5) * 20);
      scene.add(stall);
    }
    
    // 东市摊位
    for (let i = 0; i < 10; i++) {
      const stall = new THREE.Mesh(UNIT_BOX, stallMat);
      stall.scale.set(3, 2, 2);
      stall.position.set(180 + (i % 5) * 12, 1, -20 + Math.floor(i / 5) * 20);
      scene.add(stall);
    }
  },
  
  // 为东西市添加幌子
  addSigns() {
    const signMat = new THREE.MeshStandardMaterial({ color: 0xc94a3d, roughness: 0.6 });
    
    // 西市幌子
    for (let i = 0; i < 6; i++) {
      const sign = new THREE.Mesh(UNIT_PLANE, signMat);
      sign.scale.set(1.5, 2, 1);
      sign.position.set(-255 + i * 10, 3, -15);
      scene.add(sign);
    }
    
    // 东市幌子
    for (let i = 0; i < 6; i++) {
      const sign = new THREE.Mesh(UNIT_PLANE, signMat);
      sign.scale.set(1.5, 2, 1);
      sign.position.set(175 + i * 10, 3, -15);
      scene.add(sign);
    }
  },
  
  init() {
    this.addStalls();
    this.addSigns();
    console.log('[MarketDetails] 东西市细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new MarketDetails().init();
  };
}
