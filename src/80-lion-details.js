/* ============================================================
   石狮子细节增强 · 提升城门威严感
   ============================================================ */

class StoneLionDetails {
  // 为明德门添加石狮子
  addGateLions() {
    const lionMat = MAT.stone;
    
    // 左侧石狮子
    const lion1 = new THREE.Mesh(UNIT_SPHERE, lionMat);
    lion1.scale.set(1, 1.5, 1);
    lion1.position.set(-15, 1.5, 385);
    scene.add(lion1);
    
    // 右侧石狮子
    const lion2 = new THREE.Mesh(UNIT_SPHERE, lionMat);
    lion2.scale.set(1, 1.5, 1);
    lion2.position.set(15, 1.5, 385);
    scene.add(lion2);
  },
  
  init() {
    this.addGateLions();
    console.log('[StoneLionDetails] 石狮子细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new StoneLionDetails().init();
  };
}
