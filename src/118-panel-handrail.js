/* ============================================================
   香炉基座栏板扶手细节增强 · 提升寺庙氛围
   ============================================================ */

class PanelHandrailDetails {
  // 为大雁塔香炉添加栏板扶手
  addDayantaPanelHandrails() {
    const railMat = MAT.stone;
    
    // 大雁塔香炉栏板扶手
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const handrail = new THREE.Mesh(UNIT_CYL, railMat);
      handrail.scale.set(0.02, 0.8, 0.02);
      handrail.rotation.z = Math.PI / 2;
      handrail.position.set(200 + Math.cos(angle) * 1.5, 0.55, -85 + Math.sin(angle) * 1.5);
      handrail.rotation.y = -angle;
      scene.add(handrail);
    }
  },
  
  init() {
    this.addDayantaPanelHandrails();
    console.log('[PanelHandrailDetails] 香炉基座栏板扶手细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PanelHandrailDetails().init();
  };
}
