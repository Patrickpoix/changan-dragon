/* ============================================================
   香炉牌匾细节增强 · 提升寺庙氛围
   ============================================================ */

class PlaqueDetails {
  // 为大雁塔香炉添加牌匾
  addDayantaPlaque() {
    const plaqueMat = new THREE.MeshStandardMaterial({ color: 0x2f1810, roughness: 0.7 });
    
    // 大雁塔香炉牌匾
    const plaque = new THREE.Mesh(UNIT_BOX, plaqueMat);
    plaque.scale.set(0.8, 0.2, 0.05);
    plaque.position.set(200, 0.9, -84);
    scene.add(plaque);
  },
  
  init() {
    this.addDayantaPlaque();
    console.log('[PlaqueDetails] 香炉牌匾细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PlaqueDetails().init();
  };
}
