/* ============================================================
   香炉匾额边框细节增强 · 提升寺庙氛围
   ============================================================ */

class PlaqueFrameDetails {
  // 为大雁塔香炉添加匾额边框
  addDayantaPlaqueFrame() {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 });
    
    // 大雁塔香炉匾额边框
    const frameTop = new THREE.Mesh(UNIT_BOX, frameMat);
    frameTop.scale.set(0.85, 0.03, 0.06);
    frameTop.position.set(200, 1.02, -84);
    scene.add(frameTop);
    
    const frameBottom = new THREE.Mesh(UNIT_BOX, frameMat);
    frameBottom.scale.set(0.85, 0.03, 0.06);
    frameBottom.position.set(200, 0.78, -84);
    scene.add(frameBottom);
  },
  
  init() {
    this.addDayantaPlaqueFrame();
    console.log('[PlaqueFrameDetails] 香炉匾额边框细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PlaqueFrameDetails().init();
  };
}
