/* ============================================================
   香炉基座栏板细节增强 · 提升寺庙氛围
   ============================================================ */

class RailingPanelDetails {
  // 为大雁塔香炉添加基座栏板
  addDayantaRailingPanels() {
    const panelMat = MAT.stone;
    
    // 大雁塔香炉基座栏板
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const panel = new THREE.Mesh(UNIT_BOX, panelMat);
      panel.scale.set(1.0, 0.15, 0.05);
      panel.position.set(200 + Math.cos(angle) * 1.5, 0.4, -85 + Math.sin(angle) * 1.5);
      panel.rotation.y = -angle;
      scene.add(panel);
    }
  },
  
  init() {
    this.addDayantaRailingPanels();
    console.log('[RailingPanelDetails] 香炉基座栏板细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new RailingPanelDetails().init();
  };
}
