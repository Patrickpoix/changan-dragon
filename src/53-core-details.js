/* ============================================================
   核心建筑细节增强 · 真正可见的细节
   给朱雀大街和大明宫添加斗拱、窗格、栏杆
   ============================================================ */

const CoreBuildingDetails = {
  // 为朱雀大街两侧建筑添加窗格
  addAvenueWindows() {
    const windowMat = new THREE.MeshStandardMaterial({
      map: TEX.lattice,
      transparent: true,
      roughness: 0.7,
    });
    
    // 朱雀大街两侧每隔20米添加一组窗
    for (let z = -340; z <= 340; z += 40) {
      // 左侧建筑窗
      const win1 = new THREE.Mesh(UNIT_PLANE, windowMat);
      win1.scale.set(2, 2, 1);
      win1.position.set(-15.5, 3, z);
      win1.rotation.y = Math.PI / 2;
      scene.add(win1);
      
      // 右侧建筑窗
      const win2 = new THREE.Mesh(UNIT_PLANE, windowMat);
      win2.scale.set(2, 2, 1);
      win2.position.set(15.5, 3, z + 20);
      win2.rotation.y = -Math.PI / 2;
      scene.add(win2);
    }
  },
  
  // 为大明宫添加栏杆
  addDamingRailings() {
    const railMat = MAT.stone;
    
    // 含元殿台阶两侧栏杆
    for (let z = -420; z <= -380; z += 4) {
      // 左侧栏杆
      const post1 = new THREE.Mesh(UNIT_BOX, railMat);
      post1.scale.set(0.2, 1, 0.2);
      post1.position.set(130, 1, z);
      scene.add(post1);
      
      // 右侧栏杆
      const post2 = new THREE.Mesh(UNIT_BOX, railMat);
      post2.scale.set(0.2, 1, 0.2);
      post2.position.set(170, 1, z);
      scene.add(post2);
    }
    
    // 栏杆扶手
    const rail1 = new THREE.Mesh(UNIT_BOX, railMat);
    rail1.scale.set(0.15, 0.15, 40);
    rail1.position.set(130, 1.5, -400);
    scene.add(rail1);
    
    const rail2 = new THREE.Mesh(UNIT_BOX, railMat);
    rail2.scale.set(0.15, 0.15, 40);
    rail2.position.set(170, 1.5, -400);
    scene.add(rail2);
  },
  
  // 为东西市添加招牌
  addMarketSigns() {
    const signMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    
    // 西市招牌
    for (let i = 0; i < 8; i++) {
      const sign = new THREE.Mesh(UNIT_BOX, signMat);
      sign.scale.set(0.8, 1.5, 0.1);
      sign.position.set(-240 + (i % 4) * 20, 4, -30 + Math.floor(i / 4) * 25);
      scene.add(sign);
    }
    
    // 东市招牌
    for (let i = 0; i < 8; i++) {
      const sign = new THREE.Mesh(UNIT_BOX, signMat);
      sign.scale.set(0.8, 1.5, 0.1);
      sign.position.set(180 + (i % 4) * 20, 4, -30 + Math.floor(i / 4) * 25);
      scene.add(sign);
    }
  },
  
  init() {
    this.addAvenueWindows();
    this.addDamingRailings();
    this.addMarketSigns();
    console.log('[CoreBuildingDetails] 核心建筑细节已添加');
  },
};

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    CoreBuildingDetails.init();
  };
}
