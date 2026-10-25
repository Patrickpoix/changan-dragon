/* ============================================================
   香炉基座栏板望柱头细节增强 · 提升寺庙氛围
   ============================================================ */

class PanelPostCapDetails {
  // 为大雁塔香炉添加栏板望柱头
  addDayantaPanelPostCaps() {
    const capMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 });
    
    // 大雁塔香炉栏板望柱头
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const cap = new THREE.Mesh(UNIT_SPHERE, capMat);
      cap.scale.set(0.06, 0.06, 0.06);
      cap.position.set(200 + Math.cos(angle) * 1.5, 0.45, -85 + Math.sin(angle) * 1.5);
      scene.add(cap);
    }
  },
  
  init() {
    this.addDayantaPanelPostCaps();
    console.log('[PanelPostCapDetails] 香炉基座栏板望柱头细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PanelPostCapDetails().init();
  };
}
