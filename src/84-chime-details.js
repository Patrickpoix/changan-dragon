/* ============================================================
   风铃细节增强 · 提升寺庙氛围
   ============================================================ */

class WindChimeDetails {
  // 为大雁塔添加风铃
  addDayantaChimes() {
    const chimeMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
    
    // 大雁塔风铃
    for (let i = 0; i < 4; i++) {
      const chime = new THREE.Mesh(UNIT_SPHERE, chimeMat);
      chime.scale.set(0.1, 0.15, 0.1);
      chime.position.set(195 + i * 3, 15, -100);
      scene.add(chime);
    }
  },
  
  init() {
    this.addDayantaChimes();
    console.log('[WindChimeDetails] 风铃细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new WindChimeDetails().init();
  };
}
