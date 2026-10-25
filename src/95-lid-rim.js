/* ============================================================
   香炉盖边细节增强 · 提升寺庙氛围
   ============================================================ */

class LidRimDetails {
  // 为大雁塔香炉添加盖边
  addDayantaLidRim() {
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    
    // 大雁塔香炉盖边
    const rim = new THREE.Mesh(UNIT_CYL, rimMat);
    rim.scale.set(0.62, 0.05, 0.62);
    rim.position.set(200, 1.15, -85);
    scene.add(rim);
  },
  
  init() {
    this.addDayantaLidRim();
    console.log('[LidRimDetails] 香炉盖边细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new LidRimDetails().init();
  };
}
