/* ============================================================
   香炉香灰细节增强 · 提升寺庙氛围
   ============================================================ */

class AshLayerDetails {
  // 为大雁塔香炉添加香灰
  addDayantaAshLayer() {
    const ashMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 });
    
    // 大雁塔香炉香灰
    const ash = new THREE.Mesh(UNIT_CYL, ashMat);
    ash.scale.set(0.65, 0.05, 0.65);
    ash.position.set(200, 1.2, -85);
    scene.add(ash);
  },
  
  init() {
    this.addDayantaAshLayer();
    console.log('[AshLayerDetails] 香炉香灰细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new AshLayerDetails().init();
  };
}
