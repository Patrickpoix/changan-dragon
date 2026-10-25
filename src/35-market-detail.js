/* ============================================================
   东西市细节增强 · 招牌 + 幌子 + 摊位
   繁华商业区氛围
   ============================================================ */

const MarketDistrict = {
  // 商铺招牌（竖匾）
  createSignboard(x, y, z, text, ry = 0) {
    const group = new THREE.Group();
    // 牌匾底板
    const board = new THREE.Mesh(UNIT_BOX, new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 }));
    board.scale.set(0.8, 1.8, 0.08);
    group.add(board);
    // 文字（用Canvas纹理）
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#8b4513'; ctx.fillRect(0, 0, 128, 256);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    // 竖排文字
    const chars = text.split('');
    chars.forEach((ch, i) => {
      ctx.fillText(ch, 64, 50 + i * 45);
    });
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const textPlane = new THREE.Mesh(UNIT_PLANE, new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    textPlane.scale.set(0.75, 1.7, 1);
    textPlane.position.z = 0.05;
    group.add(textPlane);
    group.position.set(x, y, z);
    group.rotation.y = ry;
    scene.add(group);
    return group;
  },

  // 幌子（布帘）
  createBanner(x, y, z, color = 0xe8422f, ry = 0) {
    const group = new THREE.Group();
    // 旗杆
    const pole = new THREE.Mesh(UNIT_CYL, MAT.woodDark);
    pole.scale.set(0.06, 2.5, 0.06);
    pole.position.y = 1.25;
    group.add(pole);
    // 布幡
    const cloth = new THREE.Mesh(UNIT_PLANE, new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.9 }));
    cloth.scale.set(0.8, 1.5, 1);
    cloth.position.set(0.45, 1.6, 0);
    group.add(cloth);
    // 顶部横杆
    const arm = new THREE.Mesh(UNIT_BOX, MAT.woodDark);
    arm.scale.set(0.9, 0.06, 0.06);
    arm.position.set(0.3, 2.4, 0);
    group.add(arm);
    group.position.set(x, y, z);
    group.rotation.y = ry;
    group.traverse(o => { o.castShadow = true; });
    scene.add(group);
    return group;
  },

  // 摊位（集市中的小摊）
  createStall(x, z, type = 'food') {
    const group = new THREE.Group();
    // 台面
    const counter = new THREE.Mesh(UNIT_BOX, MAT.wood);
    counter.scale.set(2.5, 0.8, 1.5);
    counter.position.y = 0.4;
    group.add(counter);
    // 顶棚
    const awning = new THREE.Mesh(UNIT_BOX, new THREE.MeshStandardMaterial({ color: type === 'food' ? 0xe8dcc8 : 0xc9a876, roughness: 0.85 }));
    awning.scale.set(2.8, 0.08, 1.8);
    awning.position.y = 2.2;
    awning.position.x = 0.3;
    group.add(awning);
    // 支柱
    for (const sx of [-1.1, 1.1]) {
      for (const sz of [-0.6, 0.6]) {
        const post = new THREE.Mesh(UNIT_CYL, MAT.woodDark);
        post.scale.set(0.06, 2.2, 0.06);
        post.position.set(sx, 1.1, sz);
        group.add(post);
      }
    }
    // 货物（简单方块）
    if (type === 'food') {
      for (let i = 0; i < 4; i++) {
        const goods = new THREE.Mesh(UNIT_SPHERE, new THREE.MeshStandardMaterial({ color: [0xd4763a, 0xc9542e, 0xe8a84c, 0xb8864a][i], roughness: 0.7 }));
        goods.scale.set(0.2, 0.2, 0.2);
        goods.position.set(-0.8 + i * 0.5, 0.95, 0);
        group.add(goods);
      }
    } else if (type === 'cloth') {
      for (let i = 0; i < 3; i++) {
        const roll = new THREE.Mesh(UNIT_CYL, new THREE.MeshStandardMaterial({ color: [0xc94a3a, 0x3a6ac9, 0x4ac96a][i], roughness: 0.85 }));
        roll.scale.set(0.25, 0.5, 0.25);
        roll.rotation.z = Math.PI / 2;
        roll.position.set(-0.5 + i * 0.5, 1.0, 0);
        group.add(roll);
      }
    }
    group.position.set(x, 0, z);
    group.traverse(o => { o.castShadow = true; o.receiveShadow = true; });
    scene.add(group);
    return group;
  },

  // 西市增强
  enhanceWestMarket() {
    // 西市在 col 1-2, row 2-3，大约 x=-258~-174, z=-47~19
    const shopNames = ['酒肆', '茶坊', '布庄', '粮行', '药铺', '当铺', '客栈', '钱庄'];
    const bannerColors = [0xe8422f, 0x2a9e83, 0xd4763a, 0x8b4513, 0x6b8e23, 0x4a6fa5, 0xc94a8a, 0x9b763a];
    
    for (let i = 0; i < shopNames.length; i++) {
      const x = -250 + (i % 4) * 22;
      const z = -40 + Math.floor(i / 4) * 25;
      // 招牌
      this.createSignboard(x, 3.5, z - 6, shopNames[i], 0);
      // 幌子
      this.createBanner(x - 3, 0, z - 5, bannerColors[i], 0);
      // 摊位
      if (i % 2 === 0) {
        this.createStall(x + 5, z + 5, i % 4 === 0 ? 'food' : 'cloth');
      }
    }
  },

  // 东市增强
  enhanceEastMarket() {
    // 东市在 col 6-7, row 2-3，大约 x=174~258, z=-47~19
    const shopNames = ['香铺', '瓷器', '绸缎', '书店', '画坊', '茶肆', '酒樓', '漆器'];
    const bannerColors = [0xd4763a, 0x4a9ec9, 0xc94a8a, 0x6b8e23, 0x8b4513, 0x2a9e83, 0xe8422f, 0x9b763a];
    
    for (let i = 0; i < shopNames.length; i++) {
      const x = 180 + (i % 4) * 22;
      const z = -40 + Math.floor(i / 4) * 25;
      this.createSignboard(x, 3.5, z - 6, shopNames[i], 0);
      this.createBanner(x - 3, 0, z - 5, bannerColors[i], 0);
      if (i % 2 === 1) {
        this.createStall(x + 5, z + 5, i % 4 === 1 ? 'food' : 'cloth');
      }
    }
  },

  init() {
    this.enhanceWestMarket();
    this.enhanceEastMarket();
    console.log('[MarketDistrict] 东西市细节增强完成');
  },
};

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    MarketDistrict.init();
  };
}
