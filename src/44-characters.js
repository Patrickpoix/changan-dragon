/* ============================================================
   精致NPC人物系统 · 唐代服饰
   替代简单胶囊体
   ============================================================ */

const CharacterModels = {
  // 创建精致人物
  createPerson(x, z, type = 'commoner') {
    const g = new THREE.Group();
    
    // 颜色方案
    const colors = {
      commoner: { robe: 0x8a7a6a, sleeve: 0x7a6a5a, hat: 0x4a3a2a },
      scholar: { robe: 0x4a6a8a, sleeve: 0x3a5a7a, hat: 0x2a3a4a },
      merchant: { robe: 0x8a6a4a, sleeve: 0x7a5a3a, hat: 0x3a2a1a },
      guard: { robe: 0x8a4a3a, sleeve: 0x7a3a2a, hat: 0x2a1a1a },
    };
    const c = colors[type] || colors.commoner;
    
    // 长袍身体
    const robe = new THREE.Mesh(UNIT_CYL, new THREE.MeshStandardMaterial({ color: c.robe, roughness: 0.85 }));
    robe.scale.set(0.35, 1.1, 0.35);
    robe.position.y = 0.75;
    g.add(robe);
    
    // 袖子（手臂）
    for (const side of [-1, 1]) {
      const sleeve = new THREE.Mesh(UNIT_CYL, new THREE.MeshStandardMaterial({ color: c.sleeve, roughness: 0.85 }));
      sleeve.scale.set(0.12, 0.7, 0.12);
      sleeve.position.set(side * 0.32, 0.9, 0);
      g.add(sleeve);
    }
    
    // 头
    const head = new THREE.Mesh(UNIT_SPHERE, new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 }));
    head.scale.set(0.18, 0.2, 0.18);
    head.position.y = 1.5;
    g.add(head);
    
    // 帽子/发髻
    const hat = new THREE.Mesh(UNIT_CYL, new THREE.MeshStandardMaterial({ color: c.hat, roughness: 0.8 }));
    hat.scale.set(0.15, 0.1, 0.15);
    hat.position.y = 1.65;
    g.add(hat);
    
    g.position.set(x, 0, z);
    g.traverse(o => { o.castShadow = true; });
    scene.add(g);
    return g;
  },
  
  // 生成各类型人物
  populate() {
    const types = ['commoner', 'scholar', 'merchant', 'guard'];
    
    // 朱雀大街行人
    for (let i = 0; i < 20; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      this.createPerson(
        (Math.random() - 0.5) * 18,
        -350 + Math.random() * 700,
        type
      );
    }
    
    // 东西市商人
    for (let i = 0; i < 15; i++) {
      this.createPerson(-240 + Math.random() * 60, -30 + Math.random() * 80, 'merchant');
      this.createPerson(190 + Math.random() * 60, -30 + Math.random() * 80, 'merchant');
    }
    
    console.log('[CharacterModels] 精致人物生成完成');
  },
  
  init() {
    this.populate();
  },
};

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    CharacterModels.init();
  };
}
