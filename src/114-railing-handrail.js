/* ============================================================
   香炉基座扶手细节增强 · 提升寺庙氛围
   ============================================================ */

class RailingHandrailDetails {
  // 为大雁塔香炉添加基座扶手
  addDayantaRailingHandrails() {
    const railMat = MAT.stone;
    
    // 大雁塔香炉基座扶手
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const handrail = new THREE.Mesh(UNIT_CYL, railMat);
      handrail.scale.set(0.03, 1.0, 0.03);
      handrail.rotation.z = Math.PI / 2;
      handrail.position.set(200 + Math.cos(angle) * 1.5, 0.65, -85 + Math.sin(angle) * 1.5);
      handrail.rotation.y = -angle;
      scene.add(handrail);
    }
  },
  
  init() {
    this.addDayantaRailingHandrails();
    console.log('[RailingHandrailDetails] 香炉基座扶手细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new RailingHandrailDetails().init();
  };
}
