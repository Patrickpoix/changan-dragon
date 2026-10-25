/* ============================================================
   香炉匾额文字细节增强 · 提升寺庙氛围
   ============================================================ */

class PlaqueTextDetails {
  // 为大雁塔香炉添加匾额文字
  addDayantaPlaqueText() {
    const textMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 });
    
    // 大雁塔香炉匾额文字（简化为金色线条）
    const textLine1 = new THREE.Mesh(UNIT_BOX, textMat);
    textLine1.scale.set(0.5, 0.03, 0.02);
    textLine1.position.set(200, 0.92, -83.95);
    scene.add(textLine1);
    
    const textLine2 = new THREE.Mesh(UNIT_BOX, textMat);
    textLine2.scale.set(0.4, 0.03, 0.02);
    textLine2.position.set(200, 0.85, -83.95);
    scene.add(textLine2);
  },
  
  init() {
    this.addDayantaPlaqueText();
    console.log('[PlaqueTextDetails] 香炉匾额文字细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PlaqueTextDetails().init();
  };
}
