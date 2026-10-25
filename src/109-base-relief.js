/* ============================================================
   香炉基座浮雕细节增强 · 提升寺庙氛围
   ============================================================ */

class BaseReliefDetails {
  // 为大雁塔香炉添加基座浮雕
  addDayantaBaseRelief() {
    const reliefMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 });
    
    // 大雁塔香炉基座浮雕
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const relief = new THREE.Mesh(UNIT_SPHERE, reliefMat);
      relief.scale.set(0.08, 0.08, 0.02);
      relief.position.set(200 + Math.cos(angle) * 0.92, 0.35, -85 + Math.sin(angle) * 0.92);
      relief.rotation.y = -angle;
      scene.add(relief);
    }
  },
  
  init() {
    this.addDayantaBaseRelief();
    console.log('[BaseReliefDetails] 香炉基座浮雕细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new BaseReliefDetails().init();
  };
}
