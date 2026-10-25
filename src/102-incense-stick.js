/* ============================================================
   香炉香支细节增强 · 提升寺庙氛围
   ============================================================ */

class IncenseStickDetails {
  // 为大雁塔香炉添加香支
  addDayantaIncenseSticks() {
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
    
    // 大雁塔香炉香支
    for (let i = 0; i < 5; i++) {
      const stick = new THREE.Mesh(UNIT_CYL, stickMat);
      stick.scale.set(0.02, 0.3, 0.02);
      stick.position.set(200 + (Math.random() - 0.5) * 0.4, 1.4, -85 + (Math.random() - 0.5) * 0.4);
      scene.add(stick);
    }
  },
  
  init() {
    this.addDayantaIncenseSticks();
    console.log('[IncenseStickDetails] 香炉香支细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new IncenseStickDetails().init();
  };
}
