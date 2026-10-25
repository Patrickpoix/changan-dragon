/* ============================================================
   香炉盖装饰环细节增强 · 提升寺庙氛围
   ============================================================ */

class LidBandDetails {
  // 为大雁塔香炉添加盖装饰环
  addDayantaLidBand() {
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 });
    
    // 大雁塔香炉盖装饰环
    const band = new THREE.Mesh(UNIT_CYL, bandMat);
    band.scale.set(0.55, 0.03, 0.55);
    band.position.set(200, 1.35, -85);
    scene.add(band);
  },
  
  init() {
    this.addDayantaLidBand();
    console.log('[LidBandDetails] 香炉盖装饰环细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new LidBandDetails().init();
  };
}
