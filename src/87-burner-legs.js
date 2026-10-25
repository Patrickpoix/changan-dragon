/* ============================================================
   香炉腿细节增强 · 提升寺庙氛围
   ============================================================ */

class BurnerLegDetails {
  // 为大雁塔香炉添加腿
  addDayantaLegs() {
    const legMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    
    // 大雁塔香炉腿
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(UNIT_CYL, legMat);
      leg.scale.set(0.1, 0.3, 0.1);
      leg.position.set(200 + Math.cos(angle) * 0.6, 0.15, -85 + Math.sin(angle) * 0.6);
      scene.add(leg);
    }
  },
  
  init() {
    this.addDayantaLegs();
    console.log('[BurnerLegDetails] 香炉腿细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new BurnerLegDetails().init();
  };
}
