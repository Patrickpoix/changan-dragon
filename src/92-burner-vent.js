/* ============================================================
   香炉出烟口细节增强 · 提升寺庙氛围
   ============================================================ */

class BurnerVentDetails {
  // 为大雁塔香炉添加出烟口
  addDayantaVents() {
    const ventMat = new THREE.MeshStandardMaterial({ color: 0x2f1810, roughness: 0.8 });
    
    // 大雁塔香炉出烟口
    for (let i = 0; i < 3; i++) {
      const vent = new THREE.Mesh(UNIT_BOX, ventMat);
      vent.scale.set(0.15, 0.1, 0.02);
      const angle = (i / 3) * Math.PI * 2;
      vent.position.set(200 + Math.cos(angle) * 0.85, 0.9, -85 + Math.sin(angle) * 0.85);
      vent.rotation.y = -angle;
      scene.add(vent);
    }
  },
  
  init() {
    this.addDayantaVents();
    console.log('[BurnerVentDetails] 香炉出烟口细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new BurnerVentDetails().init();
  };
}
