/* ============================================================
   屋顶细节增强 · 瓦当 + 脊兽
   让建筑更有中式特色
   ============================================================ */

const RoofDetails = {
  // 为大明宫含元殿添加脊兽
  addRidgeBeasts() {
    // 含元殿屋顶两端的鸱吻
    const beastMat = MAT.gold;
    
    // 左侧鸱吻
    const beast1 = new THREE.Mesh(UNIT_SPHERE, beastMat);
    beast1.scale.set(0.5, 0.7, 0.5);
    beast1.position.set(130, 12, -450);
    scene.add(beast1);
    
    // 右侧鸱吻
    const beast2 = new THREE.Mesh(UNIT_SPHERE, beastMat);
    beast2.scale.set(0.5, 0.7, 0.5);
    beast2.position.set(170, 12, -450);
    scene.add(beast2);
  },
  
  // 为朱雀大街建筑添加瓦当
  addEavesTiles() {
    const tileMat = MAT.roofDark;
    
    // 朱雀大街两侧屋檐
    for (let z = -340; z <= 340; z += 40) {
      // 左侧屋檐瓦当
      const tile1 = new THREE.Mesh(UNIT_CYL, tileMat);
      tile1.scale.set(0.1, 0.1, 0.1);
      tile1.position.set(-15, 5.5, z);
      scene.add(tile1);
      
      // 右侧屋檐瓦当
      const tile2 = new THREE.Mesh(UNIT_CYL, tileMat);
      tile2.scale.set(0.1, 0.1, 0.1);
      tile2.position.set(15, 5.5, z + 20);
      scene.add(tile2);
    }
  },
  
  init() {
    this.addRidgeBeasts();
    this.addEavesTiles();
    console.log('[RoofDetails] 屋顶细节已添加');
  },
};

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    RoofDetails.init();
  };
}
