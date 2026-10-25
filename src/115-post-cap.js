/* ============================================================
   香炉基座望柱头细节增强 · 提升寺庙氛围
   ============================================================ */

class PostCapDetails {
  // 为大雁塔香炉添加望柱头
  addDayantaPostCaps() {
    const capMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 });
    
    // 大雁塔香炉望柱头
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const cap = new THREE.Mesh(UNIT_SPHERE, capMat);
      cap.scale.set(0.1, 0.1, 0.1);
      cap.position.set(200 + Math.cos(angle) * 1.5, 0.75, -85 + Math.sin(angle) * 1.5);
      scene.add(cap);
    }
  },
  
  init() {
    this.addDayantaPostCaps();
    console.log('[PostCapDetails] 香炉基座望柱头细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PostCapDetails().init();
  };
}
