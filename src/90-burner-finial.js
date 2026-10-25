/* ============================================================
   香炉盖钮细节增强 · 提升寺庙氛围
   ============================================================ */

class BurnerFinialDetails {
  // 为大雁塔香炉添加盖钮
  addDayantaFinial() {
    const finialMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    
    // 大雁塔香炉盖钮
    const finial = new THREE.Mesh(UNIT_SPHERE, finialMat);
    finial.scale.set(0.1, 0.15, 0.1);
    finial.position.set(200, 1.55, -85);
    scene.add(finial);
  },
  
  init() {
    this.addDayantaFinial();
    console.log('[BurnerFinialDetails] 香炉盖钮细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new BurnerFinialDetails().init();
  };
}
