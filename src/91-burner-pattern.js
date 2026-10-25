/* ============================================================
   香炉纹饰细节增强 · 提升寺庙氛围
   ============================================================ */

class BurnerPatternDetails {
  // 为大雁塔香炉添加纹饰
  addDayantaPattern() {
    const patternMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 });
    
    // 大雁塔香炉纹饰
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const pattern = new THREE.Mesh(UNIT_SPHERE, patternMat);
      pattern.scale.set(0.05, 0.05, 0.05);
      pattern.position.set(200 + Math.cos(angle) * 0.8, 0.7, -85 + Math.sin(angle) * 0.8);
      scene.add(pattern);
    }
  },
  
  init() {
    this.addDayantaPattern();
    console.log('[BurnerPatternDetails] 香炉纹饰细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new BurnerPatternDetails().init();
  };
}
