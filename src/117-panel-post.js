/* ============================================================
   香炉基座栏板望柱细节增强 · 提升寺庙氛围
   ============================================================ */

class PanelPostDetails {
  // 为大雁塔香炉添加栏板望柱
  addDayantaPanelPosts() {
    const postMat = MAT.stone;
    
    // 大雁塔香炉栏板望柱
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const post = new THREE.Mesh(UNIT_CYL, postMat);
      post.scale.set(0.04, 0.4, 0.04);
      post.position.set(200 + Math.cos(angle) * 1.5, 0.2, -85 + Math.sin(angle) * 1.5);
      scene.add(post);
    }
  },
  
  init() {
    this.addDayantaPanelPosts();
    console.log('[PanelPostDetails] 香炉基座栏板望柱细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PanelPostDetails().init();
  };
}
