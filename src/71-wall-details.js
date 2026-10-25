/* ============================================================
   城墙细节增强 · 提升城防质感
   ============================================================ */

class CityWallDetails {
  // 为城墙添加垛口
  addCrenellations() {
    const wallMat = MAT.stone;
    
    // 南城墙垛口
    for (let x = -400; x <= 400; x += 10) {
      const crenel = new THREE.Mesh(UNIT_BOX, wallMat);
      crenel.scale.set(1.5, 1, 2);
      crenel.position.set(x, 6, 380);
      scene.add(crenel);
    }
  },
  
  // 为城墙添加城楼
  addGateTowers() {
    const towerMat = MAT.roof;
    
    // 明德门城楼
    const tower = new THREE.Mesh(UNIT_BOX, towerMat);
    tower.scale.set(20, 8, 10);
    tower.position.set(0, 8, 380);
    scene.add(tower);
  },
  
  init() {
    this.addCrenellations();
    this.addGateTowers();
    console.log('[CityWallDetails] 城墙细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new CityWallDetails().init();
  };
}
