/* ============================================================
   曲江池景观增强 · 亭台 + 荷花 + 芦苇 + 曲水
   城南诗意水景
   ============================================================ */

const QujiangGarden = {
  // 六角亭
  createPavilion(x, z, ry = 0) {
    const g = new THREE.Group();
    // 台基
    const plat = new THREE.Mesh(UNIT_CYL, MAT.stone);
    plat.scale.set(3, 0.4, 3);
    plat.position.y = 0.2;
    g.add(plat);
    // 六根柱子
    for (let i = 0; i < 6; i++) {
      const a = i * TAU / 6;
      const col = new THREE.Mesh(UNIT_CYL, MAT.red);
      col.scale.set(0.18, 2.8, 0.18);
      col.position.set(Math.cos(a) * 2.2, 1.8, Math.sin(a) * 2.2);
      g.add(col);
    }
    // 攒尖顶
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.5, 6), MAT.roofGlazed);
    roof.position.y = 3.8;
    roof.rotation.y = Math.PI / 6;
    g.add(roof);
    // 宝顶
    const finial = new THREE.Mesh(UNIT_SPHERE, MAT.gold);
    finial.scale.set(0.2, 0.3, 0.2);
    finial.position.y = 4.7;
    g.add(finial);
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    g.traverse(o => { o.castShadow = true; o.receiveShadow = true; });
    scene.add(g);
    return g;
  },

  // 荷花
  createLotus(x, z, scale = 1) {
    const g = new THREE.Group();
    // 荷叶
    const leaf = new THREE.Mesh(UNIT_CYL, new THREE.MeshStandardMaterial({ color: 0x4a9e5a, roughness: 0.8, flatShading: true }));
    leaf.scale.set(0.8*scale, 0.05*scale, 0.8*scale);
    leaf.position.y = 0.1;
    g.add(leaf);
    // 荷花
    const flower = new THREE.Group();
    // 花瓣
    for (let i = 0; i < 6; i++) {
      const a = i * TAU / 6;
      const petal = new THREE.Mesh(UNIT_SPHERE, new THREE.MeshStandardMaterial({ color: 0xffb7c5, roughness: 0.6 }));
      petal.scale.set(0.12*scale, 0.06*scale, 0.2*scale);
      petal.position.set(Math.cos(a) * 0.15*scale, 0.3*scale, Math.sin(a) * 0.15*scale);
      petal.rotation.y = -a;
      flower.add(petal);
    }
    // 花蕊
    const center = new THREE.Mesh(UNIT_SPHERE, new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.5 }));
    center.scale.set(0.08*scale, 0.08*scale, 0.08*scale);
    center.position.y = 0.28*scale;
    flower.add(center);
    flower.position.y = 0.15;
    g.add(flower);
    g.position.set(x, 0, z);
    scene.add(g);
    return g;
  },

  // 芦苇
  createReed(x, z, count = 5) {
    const g = new THREE.Group();
    for (let i = 0; i < count; i++) {
      const bx = x + (Math.random() - 0.5) * 1.5;
      const bz = z + (Math.random() - 0.5) * 1.5;
      // 茎
      const stem = new THREE.Mesh(UNIT_CYL, new THREE.MeshStandardMaterial({ color: 0x8a9a4a, roughness: 0.9 }));
      stem.scale.set(0.03, 1.5 + Math.random() * 0.5, 0.03);
      stem.position.set(bx, 0.8, bz);
      g.add(stem);
      // 穗
      const tassel = new THREE.Mesh(UNIT_CYL, new THREE.MeshStandardMaterial({ color: 0xb8a060, roughness: 0.95 }));
      tassel.scale.set(0.06, 0.4, 0.06);
      tassel.position.set(bx, 1.7 + Math.random() * 0.2, bz);
      g.add(tassel);
    }
    scene.add(g);
    return g;
  },

  // 曲水桥（小桥）
  createBridge(x, z, length = 8, ry = 0) {
    const g = new THREE.Group();
    // 桥面
    const deck = new THREE.Mesh(UNIT_BOX, MAT.woodDark);
    deck.scale.set(length, 0.15, 1.5);
    deck.position.y = 0.8;
    g.add(deck);
    // 栏杆
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(UNIT_BOX, MAT.wood);
      rail.scale.set(length, 0.08, 0.08);
      rail.position.set(0, 1.4, side * 0.65);
      g.add(rail);
      // 栏杆柱
      const posts = Math.floor(length / 1.5) + 1;
      for (let i = 0; i < posts; i++) {
        const px = -length/2 + i * length / (posts - 1);
        const post = new THREE.Mesh(UNIT_CYL, MAT.woodDark);
        post.scale.set(0.05, 0.6, 0.05);
        post.position.set(px, 1.1, side * 0.65);
        g.add(post);
      }
    }
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    g.traverse(o => { o.castShadow = true; o.receiveShadow = true; });
    scene.add(g);
    return g;
  },

  init() {
    // 曲江池在城南，大约 x=300~420, z=280~380
    // 池边亭子
    this.createPavilion(310, 290, Math.PI / 6);
    this.createPavilion(380, 350, -Math.PI / 4);
    this.createPavilion(350, 320, Math.PI / 3);
    // 荷花
    for (let i = 0; i < 20; i++) {
      this.createLotus(320 + Math.random() * 80, 300 + Math.random() * 60, 0.8 + Math.random() * 0.6);
    }
    // 芦苇
    for (let i = 0; i < 12; i++) {
      this.createReed(305 + Math.random() * 10, 295 + Math.random() * 70, 3 + Math.floor(Math.random() * 4));
      this.createReed(395 + Math.random() * 10, 295 + Math.random() * 70, 3 + Math.floor(Math.random() * 4));
    }
    // 小桥
    this.createBridge(350, 310, 10, Math.PI / 2);
    console.log('[QujiangGarden] 曲江池景观增强完成');
  },
};

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    QujiangGarden.init();
  };
}
