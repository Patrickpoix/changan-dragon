/* ============================================================
   家具细节增强 · 让建筑更有生活气息
   ============================================================ */

class FurnitureDetails {
  // 为东西市添加货架
  addShelves() {
    const shelfMat = MAT.wood;
    
    // 西市货架
    for (let i = 0; i < 8; i++) {
      const shelf = new THREE.Mesh(UNIT_BOX, shelfMat);
      shelf.scale.set(2, 1.5, 1);
      shelf.position.set(-250 + (i % 4) * 10, 0.75, -25 + Math.floor(i / 4) * 15);
      scene.add(shelf);
    }
    
    // 东市货架
    for (let i = 0; i < 8; i++) {
      const shelf = new THREE.Mesh(UNIT_BOX, shelfMat);
      shelf.scale.set(2, 1.5, 1);
      shelf.position.set(180 + (i % 4) * 10, 0.75, -25 + Math.floor(i / 4) * 15);
      scene.add(shelf);
    }
  },
  
  init() {
    this.addShelves();
    console.log('[FurnitureDetails] 家具细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new FurnitureDetails().init();
  };
}
