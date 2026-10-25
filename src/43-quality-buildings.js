/* ============================================================
   高质量建筑生成器 · 精致中式建筑
   替代简单积木方块
   ============================================================ */

const QualityBuildings = {
  // 精致商铺建筑（带门窗细节）
  createShop(x, z, ry = 0, style = 'normal') {
    const g = new THREE.Group();
    
    // 台基
    const platform = new THREE.Mesh(UNIT_BOX, MAT.stone);
    platform.scale.set(8, 0.5, 6);
    platform.position.y = 0.25;
    g.add(platform);
    
    // 主体墙面
    const wallMat = style === 'luxury' ? MAT.plasterWarm : MAT.plaster;
    const wall = new THREE.Mesh(roundedBoxGeo(7, 3.5, 5, 0.15), wallMat);
    wall.position.y = 2.25;
    g.add(wall);
    
    // 柱子（红柱）
    for (const sx of [-3, 3]) {
      for (const sz of [-2, 2]) {
        const col = new THREE.Mesh(UNIT_CYL, MAT.red);
        col.scale.set(0.2, 3.5, 0.2);
        col.position.set(sx, 2.25, sz);
        g.add(col);
      }
    }
    
    // 屋顶（曲面）
    const roofMat = style === 'luxury' ? MAT.roofGlazed : MAT.roof;
    const roof = new THREE.Mesh(ROOF_UNIT, roofMat);
    roof.scale.set(9, 2.5, 7);
    roof.position.y = 4.5;
    g.add(roof);
    
    // 屋脊装饰
    const ridge = new THREE.Mesh(UNIT_BOX, MAT.roofDark);
    ridge.scale.set(6, 0.2, 0.3);
    ridge.position.y = 5.8;
    g.add(ridge);
    
    // 鸱吻（两端）
    for (const sx of [-3, 3]) {
      const chi = new THREE.Mesh(UNIT_SPHERE, style === 'luxury' ? MAT.gold : MAT.roofDark);
      chi.scale.set(0.25, 0.35, 0.25);
      chi.position.set(sx, 5.9, 0);
      g.add(chi);
    }
    
    // 门窗
    const door = new THREE.Mesh(UNIT_BOX, MAT.woodDark);
    door.scale.set(1.5, 2, 0.1);
    door.position.set(0, 1.5, 2.55);
    g.add(door);
    
    // 窗格
    for (const sx of [-2, 2]) {
      const window = new THREE.Mesh(UNIT_PLANE, new THREE.MeshStandardMaterial({
        map: TEX.lattice,
        transparent: true,
      }));
      window.scale.set(1.2, 1.2, 1);
      window.position.set(sx, 2.2, 2.56);
      g.add(window);
    }
    
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    g.traverse(o => { o.castShadow = true; o.receiveShadow = true; });
    scene.add(g);
    return g;
  },

  // 朱雀大街两侧精致商铺
  enhanceAvenueShops() {
    for (let z = -300; z <= 300; z += 50) {
      // 左侧商铺
      this.createShop(-20, z, Math.PI / 2, z % 100 === 0 ? 'luxury' : 'normal');
      // 右侧商铺
      this.createShop(20, z + 25, -Math.PI / 2, z % 100 === 25 ? 'luxury' : 'normal');
    }
  },

  init() {
    this.enhanceAvenueShops();
    console.log('[QualityBuildings] 高质量建筑生成完成');
  },
};

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    QualityBuildings.init();
  };
}
