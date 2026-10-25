/* ============================================================
   香炉基座斗拱细节增强 · 提升寺庙氛围
   ============================================================ */

class BaseBracketDetails {
  // 为大雁塔香炉添加基座斗拱
  addDayantaBaseBrackets() {
    const bracketMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    
    // 大雁塔香炉基座斗拱
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const bracket = new THREE.Mesh(UNIT_BOX, bracketMat);
      bracket.scale.set(0.2, 0.1, 0.15);
      bracket.position.set(200 + Math.cos(angle) * 0.95, 0.45, -85 + Math.sin(angle) * 0.95);
      bracket.rotation.y = -angle;
      scene.add(bracket);
    }
  },
  
  init() {
    this.addDayantaBaseBrackets();
    console.log('[BaseBracketDetails] 香炉基座斗拱细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new BaseBracketDetails().init();
  };
}
