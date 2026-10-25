/* ============================================================
   香炉基座栏板浮雕细节增强2 · 提升寺庙氛围
   ============================================================ */

class PanelReliefDetails2 {
  // 为大雁塔香炉添加栏板浮雕
  addDayantaPanelReliefs() {
    const reliefMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 });
    
    // 大雁塔香炉栏板浮雕
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const relief = new THREE.Mesh(UNIT_SPHERE, reliefMat);
      relief.scale.set(0.04, 0.04, 0.02);
      relief.position.set(200 + Math.cos(angle) * 1.5, 0.48, -85 + Math.sin(angle) * 1.5);
      relief.rotation.y = -angle;
      scene.add(relief);
    }
  },
  
  init() {
    this.addDayantaPanelReliefs();
    console.log('[PanelReliefDetails2] 香炉基座栏板浮雕细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PanelReliefDetails2().init();
  };
}
