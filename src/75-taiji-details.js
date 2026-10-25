/* ============================================================
   太极宫细节增强 · 提升皇宫质感
   ============================================================ */

class TaijiDetails {
  // 为太极宫添加宫门
  addPalaceGate() {
    const gateMat = MAT.red;
    const roofMat = MAT.roofGold;
    
    // 太极宫正门
    const gate = new THREE.Mesh(UNIT_BOX, gateMat);
    gate.scale.set(15, 6, 5);
    gate.position.set(0, 3, -200);
    scene.add(gate);
    
    // 宫门屋顶
    const roof = new THREE.Mesh(UNIT_BOX, roofMat);
    roof.scale.set(18, 1, 6);
    roof.position.set(0, 6.5, -200);
    scene.add(roof);
  },
  
  // 为太极宫添加宫灯
  addPalaceLanterns() {
    const lanternMat = MAT.lantern;
    const postMat = MAT.wood;
    
    // 宫门两侧宫灯
    for (let i = 0; i < 4; i++) {
      const x = -8 + i * 5;
      
      const post = new THREE.Mesh(UNIT_CYL, postMat);
      post.scale.set(0.2, 4, 0.2);
      post.position.set(x, 2, -195);
      scene.add(post);
      
      const lantern = new THREE.Mesh(UNIT_BOX, lanternMat);
      lantern.scale.set(0.6, 0.8, 0.6);
      lantern.position.set(x, 4.2, -195);
      scene.add(lantern);
    }
  },
  
  init() {
    this.addPalaceGate();
    this.addPalaceLanterns();
    console.log('[TaijiDetails] 太极宫细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new TaijiDetails().init();
  };
}
