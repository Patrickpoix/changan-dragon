/* ============================================================
   香炉细节增强 · 提升寺庙氛围
   ============================================================ */

class IncenseBurnerDetails {
  // 为大雁塔添加香炉
  addDayantaBurner() {
    const burnerMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    
    // 大雁塔香炉
    const burner = new THREE.Mesh(UNIT_CYL, burnerMat);
    burner.scale.set(0.8, 1, 0.8);
    burner.position.set(200, 0.5, -85);
    scene.add(burner);
  },
  
  init() {
    this.addDayantaBurner();
    console.log('[IncenseBurnerDetails] 香炉细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new IncenseBurnerDetails().init();
  };
}
