/* ============================================================
   香炉底座细节增强 · 提升寺庙氛围
   ============================================================ */

class BurnerBaseDetails {
  // 为大雁塔香炉添加底座
  addDayantaBase() {
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    
    // 大雁塔香炉底座
    const base = new THREE.Mesh(UNIT_CYL, baseMat);
    base.scale.set(1, 0.2, 1);
    base.position.set(200, 0.1, -85);
    scene.add(base);
  },
  
  init() {
    this.addDayantaBase();
    console.log('[BurnerBaseDetails] 香炉底座细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new BurnerBaseDetails().init();
  };
}
