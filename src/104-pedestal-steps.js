/* ============================================================
   香炉基座台阶细节增强 · 提升寺庙氛围
   ============================================================ */

class PedestalStepsDetails {
  // 为大雁塔香炉添加基座台阶
  addDayantaPedestalSteps() {
    const stepMat = MAT.stone;
    
    // 大雁塔香炉基座台阶
    for (let i = 0; i < 2; i++) {
      const step = new THREE.Mesh(UNIT_BOX, stepMat);
      step.scale.set(2 + i * 0.5, 0.15, 2 + i * 0.5);
      step.position.set(200, 0.075 + i * 0.15, -85);
      scene.add(step);
    }
  },
  
  init() {
    this.addDayantaPedestalSteps();
    console.log('[PedestalStepsDetails] 香炉基座台阶细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PedestalStepsDetails().init();
  };
}
