/* ============================================================
   香炉底座脚细节增强 · 提升寺庙氛围
   ============================================================ */

class FootPadDetails {
  // 为大雁塔香炉添加底座脚
  addDayantaFootPads() {
    const padMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    
    // 大雁塔香炉底座脚
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const pad = new THREE.Mesh(UNIT_SPHERE, padMat);
      pad.scale.set(0.15, 0.08, 0.15);
      pad.position.set(200 + Math.cos(angle) * 0.9, 0.04, -85 + Math.sin(angle) * 0.9);
      scene.add(pad);
    }
  },
  
  init() {
    this.addDayantaFootPads();
    console.log('[FootPadDetails] 香炉底座脚细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new FootPadDetails().init();
  };
}
