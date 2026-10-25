/* ============================================================
   朱雀大街细节增强 · 更有长安特色的天街
   ============================================================ */

const ZhuqueAvenueDetails = {
  // 为朱雀大街添加行道树
  addStreetTrees() {
    const trunkMat = MAT.trunk;
    const leafMat = MAT.leaf;
    
    // 朱雀大街两侧行道树
    for (let z = -340; z <= 340; z += 30) {
      // 左侧树
      const trunk1 = new THREE.Mesh(UNIT_CYL, trunkMat);
      trunk1.scale.set(0.3, 2, 0.3);
      trunk1.position.set(-12, 1, z);
      scene.add(trunk1);
      
      const leaf1 = new THREE.Mesh(UNIT_SPHERE, leafMat);
      leaf1.scale.set(2, 1.5, 2);
      leaf1.position.set(-12, 3.5, z);
      scene.add(leaf1);
      
      // 右侧树
      const trunk2 = new THREE.Mesh(UNIT_CYL, trunkMat);
      trunk2.scale.set(0.3, 2, 0.3);
      trunk2.position.set(12, 1, z + 15);
      scene.add(trunk2);
      
      const leaf2 = new THREE.Mesh(UNIT_SPHERE, leafMat);
      leaf2.scale.set(2, 1.5, 2);
      leaf2.position.set(12, 3.5, z + 15);
      scene.add(leaf2);
    }
  },
  
  // 为朱雀大街添加灯笼柱
  addLanternPosts() {
    const postMat = MAT.wood;
    const lanternMat = MAT.lantern;
    
    for (let z = -340; z <= 340; z += 60) {
      // 左侧灯柱
      const post1 = new THREE.Mesh(UNIT_CYL, postMat);
      post1.scale.set(0.15, 4, 0.15);
      post1.position.set(-10, 2, z);
      scene.add(post1);
      
      const lantern1 = new THREE.Mesh(UNIT_BOX, lanternMat);
      lantern1.scale.set(0.6, 0.8, 0.6);
      lantern1.position.set(-10, 4.2, z);
      scene.add(lantern1);
      
      // 右侧灯柱
      const post2 = new THREE.Mesh(UNIT_CYL, postMat);
      post2.scale.set(0.15, 4, 0.15);
      post2.position.set(10, 2, z + 30);
      scene.add(post2);
      
      const lantern2 = new THREE.Mesh(UNIT_BOX, lanternMat);
      lantern2.scale.set(0.6, 0.8, 0.6);
      lantern2.position.set(10, 4.2, z + 30);
      scene.add(lantern2);
    }
  },
  
  init() {
    this.addStreetTrees();
    this.addLanternPosts();
    console.log('[ZhuqueAvenueDetails] 朱雀大街细节已添加');
  },
};

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    ZhuqueAvenueDetails.init();
  };
}
