/* ============================================================
   经幢细节增强 · 提升寺庙氛围
   ============================================================ */

class PillarDetails {
  // 为大雁塔添加经幢
  addDayantaPillars() {
    const pillarMat = MAT.stone;
    
    // 大雁塔经幢
    for (let i = 0; i < 2; i++) {
      const pillar = new THREE.Mesh(UNIT_CYL, pillarMat);
      pillar.scale.set(0.2, 4, 0.2);
      pillar.position.set(195 + i * 10, 2, -80);
      scene.add(pillar);
    }
  },
  
  init() {
    this.addDayantaPillars();
    console.log('[PillarDetails] 经幢细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PillarDetails().init();
  };
}
