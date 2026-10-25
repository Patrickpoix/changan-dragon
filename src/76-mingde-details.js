/* ============================================================
   明德门细节增强 · 提升城门质感
   ============================================================ */

class MingdeGateDetails {
  // 为明德门添加门洞
  addGateOpenings() {
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x2c1810, roughness: 0.9 });
    
    // 五个门洞
    for (let i = -2; i <= 2; i++) {
      const door = new THREE.Mesh(UNIT_BOX, doorMat);
      door.scale.set(4, 5, 1);
      door.position.set(i * 8, 2.5, 380);
      scene.add(door);
    }
  },
  
  // 为明德门添加城楼
  addGateTower() {
    const towerMat = MAT.red;
    const roofMat = MAT.roof;
    
    // 城楼主体
    const tower = new THREE.Mesh(UNIT_BOX, towerMat);
    tower.scale.set(30, 8, 12);
    tower.position.set(0, 10, 380);
    scene.add(tower);
    
    // 城楼屋顶
    const roof = new THREE.Mesh(UNIT_BOX, roofMat);
    roof.scale.set(35, 1.5, 15);
    roof.position.set(0, 14.5, 380);
    scene.add(roof);
  },
  
  init() {
    this.addGateOpenings();
    this.addGateTower();
    console.log('[MingdeGateDetails] 明德门细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new MingdeGateDetails().init();
  };
}
