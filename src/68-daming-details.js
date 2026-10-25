/* ============================================================
   大明宫细节增强 · 提升宫城质感
   ============================================================ */

const DamingPalaceDetails = {
  // 为大明宫添加宫灯
  addPalaceLanterns() {
    const lanternMat = MAT.lantern;
    const postMat = MAT.wood;
    
    // 含元殿两侧宫灯
    for (let i = 0; i < 6; i++) {
      const x = 130 + i * 8;
      
      // 左侧宫灯
      const post1 = new THREE.Mesh(UNIT_CYL, postMat);
      post1.scale.set(0.2, 5, 0.2);
      post1.position.set(x, 2.5, -460);
      scene.add(post1);
      
      const lantern1 = new THREE.Mesh(UNIT_BOX, lanternMat);
      lantern1.scale.set(0.8, 1, 0.8);
      lantern1.position.set(x, 5.5, -460);
      scene.add(lantern1);
    }
  },
  
  // 为大明宫添加石栏杆
  addStoneRailings() {
    const railMat = MAT.stone;
    
    // 含元殿台阶两侧栏杆
    for (let z = -430; z <= -390; z += 5) {
      // 左侧栏杆柱
      const post1 = new THREE.Mesh(UNIT_BOX, railMat);
      post1.scale.set(0.2, 1.2, 0.2);
      post1.position.set(135, 0.6, z);
      scene.add(post1);
      
      // 右侧栏杆柱
      const post2 = new THREE.Mesh(UNIT_BOX, railMat);
      post2.scale.set(0.2, 1.2, 0.2);
      post2.position.set(165, 0.6, z);
      scene.add(post2);
    }
  },
  
  init() {
    this.addPalaceLanterns();
    this.addStoneRailings();
    console.log('[DamingPalaceDetails] 大明宫细节已添加');
  },
};

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    DamingPalaceDetails.init();
  };
}
