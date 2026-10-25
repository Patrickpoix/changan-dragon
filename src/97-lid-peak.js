/* ============================================================
   香炉盖顶细节增强 · 提升寺庙氛围
   ============================================================ */

class LidPeakDetails {
  // 为大雁塔香炉添加盖顶
  addDayantaLidPeak() {
    const peakMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    
    // 大雁塔香炉盖顶
    const peak = new THREE.Mesh(UNIT_CONE, peakMat);
    peak.scale.set(0.3, 0.2, 0.3);
    peak.position.set(200, 1.4, -85);
    scene.add(peak);
  },
  
  init() {
    this.addDayantaLidPeak();
    console.log('[LidPeakDetails] 香炉盖顶细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new LidPeakDetails().init();
  };
}
