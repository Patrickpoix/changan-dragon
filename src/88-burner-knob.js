/* ============================================================
   香炉耳柄细节增强 · 提升寺庙氛围
   ============================================================ */

class BurnerKnobDetails {
  // 为大雁塔香炉添加耳柄
  addDayantaKnobs() {
    const knobMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    
    // 大雁塔香炉耳柄
    const knob1 = new THREE.Mesh(UNIT_SPHERE, knobMat);
    knob1.scale.set(0.15, 0.15, 0.15);
    knob1.position.set(198.8, 0.9, -85);
    scene.add(knob1);
    
    const knob2 = new THREE.Mesh(UNIT_SPHERE, knobMat);
    knob2.scale.set(0.15, 0.15, 0.15);
    knob2.position.set(201.2, 0.9, -85);
    scene.add(knob2);
  },
  
  init() {
    this.addDayantaKnobs();
    console.log('[BurnerKnobDetails] 香炉耳柄细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new BurnerKnobDetails().init();
  };
}
