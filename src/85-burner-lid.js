/* ============================================================
   香炉盖细节增强 · 提升寺庙氛围
   ============================================================ */

class BurnerLidDetails {
  // 为大雁塔香炉添加盖子
  addDayantaLid() {
    const lidMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    
    // 大雁塔香炉盖
    const lid = new THREE.Mesh(UNIT_SPHERE, lidMat);
    lid.scale.set(0.6, 0.3, 0.6);
    lid.position.set(200, 1.3, -85);
    scene.add(lid);
  },
  
  init() {
    this.addDayantaLid();
    console.log('[BurnerLidDetails] 香炉盖细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new BurnerLidDetails().init();
  };
}
