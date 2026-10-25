/* ============================================================
   香炉内膛细节增强 · 提升寺庙氛围
   ============================================================ */

class InnerPotDetails {
  // 为大雁塔香炉添加内膛
  addDayantaInnerPot() {
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x2f1810, roughness: 0.8 });
    
    // 大雁塔香炉内膛
    const inner = new THREE.Mesh(UNIT_CYL, innerMat);
    inner.scale.set(0.7, 0.8, 0.7);
    inner.position.set(200, 0.8, -85);
    scene.add(inner);
  },
  
  init() {
    this.addDayantaInnerPot();
    console.log('[InnerPotDetails] 香炉内膛细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new InnerPotDetails().init();
  };
}
