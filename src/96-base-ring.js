/* ============================================================
   香炉底座环细节增强 · 提升寺庙氛围
   ============================================================ */

class BaseRingDetails {
  // 为大雁塔香炉添加底座环
  addDayantaBaseRing() {
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 });
    
    // 大雁塔香炉底座环
    const ring = new THREE.Mesh(UNIT_CYL, ringMat);
    ring.scale.set(0.95, 0.05, 0.95);
    ring.position.set(200, 0.25, -85);
    scene.add(ring);
  },
  
  init() {
    this.addDayantaBaseRing();
    console.log('[BaseRingDetails] 香炉底座环细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new BaseRingDetails().init();
  };
}
