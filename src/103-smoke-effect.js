/* ============================================================
   香炉烟雾效果增强 · 提升寺庙氛围
   ============================================================ */

class SmokeEffectDetails {
  // 为大雁塔香炉添加烟雾效果
  addDayantaSmoke() {
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.3 });
    
    // 大雁塔香炉烟雾
    for (let i = 0; i < 3; i++) {
      const smoke = new THREE.Mesh(UNIT_SPHERE, smokeMat.clone());
      smoke.scale.set(0.1, 0.15, 0.1);
      smoke.position.set(200 + (Math.random() - 0.5) * 0.2, 1.8 + i * 0.3, -85 + (Math.random() - 0.5) * 0.2);
      scene.add(smoke);
    }
  },
  
  init() {
    this.addDayantaSmoke();
    console.log('[SmokeEffectDetails] 香炉烟雾效果已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new SmokeEffectDetails().init();
  };
}
