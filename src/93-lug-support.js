/* ============================================================
   香炉耳座细节增强 · 提升寺庙氛围
   ============================================================ */

class LugSupportDetails {
  // 为大雁塔香炉添加耳座
  addDayantaLugSupports() {
    const supportMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    
    // 大雁塔香炉耳座
    const support1 = new THREE.Mesh(UNIT_BOX, supportMat);
    support1.scale.set(0.15, 0.1, 0.15);
    support1.position.set(199.2, 0.65, -85);
    scene.add(support1);
    
    const support2 = new THREE.Mesh(UNIT_BOX, supportMat);
    support2.scale.set(0.15, 0.1, 0.15);
    support2.position.set(200.8, 0.65, -85);
    scene.add(support2);
  },
  
  init() {
    this.addDayantaLugSupports();
    console.log('[LugSupportDetails] 香炉耳座细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new LugSupportDetails().init();
  };
}
