/* ============================================================
   建筑细节增强 · 斗拱 + 窗格 + 栏杆 + 台基
   提升中式建筑精致度
   ============================================================ */

const ArchitectureDetails = {
  // 斗拱：简单的层叠方形结构
  createDougong(x, y, z, ry = 0, scale = 1) {
    const group = new THREE.Group();
    // 斗（底座）
    const base = new THREE.Mesh(UNIT_BOX, MAT.woodDark);
    base.scale.set(0.6*scale, 0.18*scale, 0.6*scale);
    base.position.y = 0.09*scale;
    group.add(base);
    // 拱（横木）
    const arm1 = new THREE.Mesh(UNIT_BOX, MAT.wood);
    arm1.scale.set(1.0*scale, 0.12*scale, 0.25*scale);
    arm1.position.y = 0.24*scale;
    group.add(arm1);
    // 拱2（垂直方向）
    const arm2 = new THREE.Mesh(UNIT_BOX, MAT.wood);
    arm2.scale.set(0.25*scale, 0.12*scale, 1.0*scale);
    arm2.position.y = 0.24*scale;
    group.add(arm2);
    // 升（顶部小斗）
    const top = new THREE.Mesh(UNIT_BOX, MAT.woodDark);
    top.scale.set(0.35*scale, 0.15*scale, 0.35*scale);
    top.position.y = 0.38*scale;
    group.add(top);
    
    group.position.set(x, y, z);
    group.rotation.y = ry;
    group.traverse(o => { o.castShadow = true; o.receiveShadow = true; });
    scene.add(group);
    return group;
  },

  // 窗格：木质格栅窗
  createWindow(x, y, z, ry = 0, w = 1.2, h = 1.5) {
    const group = new THREE.Group();
    // 窗框
    const frame = new THREE.Mesh(UNIT_BOX, MAT.woodDark);
    frame.scale.set(w, h, 0.08);
    group.add(frame);
    // 窗格条
    const latticeMat = new THREE.MeshStandardMaterial({ color: 0x6d4c35, roughness: 0.7 });
    for (let i = -1; i <= 1; i++) {
      const bar = new THREE.Mesh(UNIT_BOX, latticeMat);
      bar.scale.set(0.06, h * 0.9, 0.05);
      bar.position.set(i * w / 4, 0, 0.05);
      group.add(bar);
    }
    for (let j = -1; j <= 1; j++) {
      const bar = new THREE.Mesh(UNIT_BOX, latticeMat);
      bar.scale.set(w * 0.9, 0.06, 0.05);
      bar.position.set(0, j * h / 4, 0.05);
      group.add(bar);
    }
    group.position.set(x, y, z);
    group.rotation.y = ry;
    scene.add(group);
    return group;
  },

  // 栏杆：石质或木质栏杆
  createRailing(x, y, z, length, ry = 0, material = MAT.stone) {
    const group = new THREE.Group();
    // 扶手
    const rail = new THREE.Mesh(UNIT_BOX, material);
    rail.scale.set(length, 0.1, 0.12);
    rail.position.y = 0.9;
    group.add(rail);
    // 栏板
    const panel = new THREE.Mesh(UNIT_BOX, material);
    panel.scale.set(length * 0.92, 0.45, 0.06);
    panel.position.y = 0.5;
    group.add(panel);
    // 望柱
    const postCount = Math.max(2, Math.floor(length / 1.2) + 1);
    for (let i = 0; i < postCount; i++) {
      const post = new THREE.Mesh(UNIT_BOX, material);
      post.scale.set(0.12, 1.0, 0.12);
      post.position.set(-length/2 + i * length / (postCount - 1), 0.5, 0);
      group.add(post);
      // 柱头
      const cap = new THREE.Mesh(UNIT_SPHERE, material);
      cap.scale.set(0.18, 0.18, 0.18);
      cap.position.set(post.position.x, 1.05, 0);
      group.add(cap);
    }
    group.position.set(x, y, z);
    group.rotation.y = ry;
    group.traverse(o => { o.castShadow = true; o.receiveShadow = true; });
    scene.add(group);
    return group;
  },

  // 台基：石质台阶基座
  createPlatform(x, z, w, d, h = 0.6) {
    const group = new THREE.Group();
    // 主体
    const base = new THREE.Mesh(UNIT_BOX, MAT.stone);
    base.scale.set(w, h, d);
    base.position.y = h / 2;
    group.add(base);
    // 边缘线脚
    const edge = new THREE.Mesh(UNIT_BOX, MAT.stoneDark);
    edge.scale.set(w + 0.2, 0.12, d + 0.2);
    edge.position.y = h + 0.06;
    group.add(edge);
    group.position.set(x, 0, z);
    group.traverse(o => { o.castShadow = true; o.receiveShadow = true; });
    scene.add(group);
    return group;
  },

  // 为朱雀大街两侧商铺添加细节
  enhanceAvenueShops() {
    // 在朱雀大街两侧添加窗格和招牌
    for (let z = -350; z <= 350; z += 40) {
      // 左侧商铺窗
      this.createWindow(-16, 2.5, z, Math.PI / 2, 1.0, 1.3);
      // 右侧商铺窗
      this.createWindow(16, 2.5, z + 20, -Math.PI / 2, 1.0, 1.3);
    }
  },

  // 为大明宫台阶添加栏杆
  enhanceDamingSteps() {
    // 含元殿台阶两侧栏杆
    this.createRailing(135, 3, -400, 30, 0, MAT.stone);
    this.createRailing(165, 3, -400, 30, 0, MAT.stone);
  },

  // 初始化
  init() {
    this.enhanceAvenueShops();
    this.enhanceDamingSteps();
    console.log('[ArchitectureDetails] 建筑细节增强完成');
  },
};

// 在世界构建后调用
if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    ArchitectureDetails.init();
  };
}
