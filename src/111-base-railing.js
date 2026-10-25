/* ============================================================
   香炉基座栏杆细节增强 · 提升寺庙氛围
   ============================================================ */

class BaseRailingDetails {
  // 为大雁塔香炉添加基座栏杆
  addDayantaBaseRailing() {
    const railMat = MAT.stone;
    
    // 大雁塔香炉基座栏杆
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const post = new THREE.Mesh(UNIT_CYL, railMat);
      post.scale.set(0.05, 0.5, 0.05);
      post.position.set(200 + Math.cos(angle) * 1.5, 0.25, -85 + Math.sin(angle) * 1.5);
      scene.add(post);
    }
  },
  
  init() {
    this.addDayantaBaseRailing();
    console.log('[BaseRailingDetails] 香炉基座栏杆细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new BaseRailingDetails().init();
  };
}
