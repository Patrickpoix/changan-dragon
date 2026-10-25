/* ============================================================
   塔寺细节增强 · 提升地标质感
   ============================================================ */

class PagodaDetails {
  // 为大雁塔添加细节
  addDayantaDetails() {
    const baseMat = MAT.stone;
    
    // 大雁塔基座
    const base = new THREE.Mesh(UNIT_BOX, baseMat);
    base.scale.set(15, 2, 15);
    base.position.set(200, 1, -100);
    scene.add(base);
  },
  
  // 为小雁塔添加细节
  addXiaoyantaDetails() {
    const baseMat = MAT.stone;
    
    // 小雁塔基座
    const base = new THREE.Mesh(UNIT_BOX, baseMat);
    base.scale.set(12, 2, 12);
    base.position.set(180, 1, 0);
    scene.add(base);
  },
  
  init() {
    this.addDayantaDetails();
    this.addXiaoyantaDetails();
    console.log('[PagodaDetails] 塔寺细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PagodaDetails().init();
  };
}
