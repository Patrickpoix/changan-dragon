/* ============================================================
   香炉匾额挂环细节增强 · 提升寺庙氛围
   ============================================================ */

class PlaqueHangerDetails {
  // 为大雁塔香炉添加匾额挂环
  addDayantaPlaqueHangers() {
    const hangerMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 });
    
    // 大雁塔香炉匾额挂环
    const hanger1 = new THREE.Mesh(UNIT_SPHERE, hangerMat);
    hanger1.scale.set(0.05, 0.05, 0.05);
    hanger1.position.set(199.5, 1.15, -84);
    scene.add(hanger1);
    
    const hanger2 = new THREE.Mesh(UNIT_SPHERE, hangerMat);
    hanger2.scale.set(0.05, 0.05, 0.05);
    hanger2.position.set(200.5, 1.15, -84);
    scene.add(hanger2);
  },
  
  init() {
    this.addDayantaPlaqueHangers();
    console.log('[PlaqueHangerDetails] 香炉匾额挂环细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PlaqueHangerDetails().init();
  };
}
