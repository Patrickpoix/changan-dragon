/* ============================================================
   香炉基座望柱细节增强 · 提升寺庙氛围
   ============================================================ */

class RailingPostDetails {
  // 为大雁塔香炉添加基座望柱
  addDayantaRailingPosts() {
    const postMat = MAT.stone;
    
    // 大雁塔香炉基座望柱
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const post = new THREE.Mesh(UNIT_CYL, postMat);
      post.scale.set(0.06, 0.6, 0.06);
      post.position.set(200 + Math.cos(angle) * 1.5, 0.3, -85 + Math.sin(angle) * 1.5);
      scene.add(post);
      
      // 望柱顶
      const top = new THREE.Mesh(UNIT_SPHERE, postMat);
      top.scale.set(0.08, 0.08, 0.08);
      top.position.set(200 + Math.cos(angle) * 1.5, 0.65, -85 + Math.sin(angle) * 1.5);
      scene.add(top);
    }
  },
  
  init() {
    this.addDayantaRailingPosts();
    console.log('[RailingPostDetails] 香炉基座望柱细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new RailingPostDetails().init();
  };
}
