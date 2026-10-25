/* ============================================================
   香炉耳细节增强 · 提升寺庙氛围
   ============================================================ */

class BurnerHandleDetails {
  // 为大雁塔香炉添加耳
  addDayantaHandles() {
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    
    // 大雁塔香炉耳
    const handle1 = new THREE.Mesh(UNIT_BOX, handleMat);
    handle1.scale.set(0.3, 0.2, 0.2);
    handle1.position.set(199, 0.8, -85);
    scene.add(handle1);
    
    const handle2 = new THREE.Mesh(UNIT_BOX, handleMat);
    handle2.scale.set(0.3, 0.2, 0.2);
    handle2.position.set(201, 0.8, -85);
    scene.add(handle2);
  },
  
  init() {
    this.addDayantaHandles();
    console.log('[BurnerHandleDetails] 香炉耳细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new BurnerHandleDetails().init();
  };
}
