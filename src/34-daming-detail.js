/* ============================================================
   大明宫细节增强 · 含元殿 + 麟德殿 + 太液池
   核心地标精雕
   ============================================================ */

const DamingPalace = {
  // 含元殿强化
  enhanceHanyuan() {
    // 殿前双阙（已经有了，强化细节）
    // 添加殿前广场石灯
    for (let i = -2; i <= 2; i++) {
      this.createStoneLantern(150 + i * 15, -420, 1.0);
    }
    // 殿后廊道
    this.createCorridor(150, -450, 40, 1.0);
  },

  // 石灯
  createStoneLantern(x, z, scale = 1) {
    const group = new THREE.Group();
    // 基座
    const base = new THREE.Mesh(UNIT_BOX, MAT.stone);
    base.scale.set(0.8*scale, 0.3*scale, 0.8*scale);
    base.position.y = 0.15*scale;
    group.add(base);
    // 柱身
    const pillar = new THREE.Mesh(UNIT_CYL, MAT.stone);
    pillar.scale.set(0.25*scale, 1.2*scale, 0.25*scale);
    pillar.position.y = 0.9*scale;
    group.add(pillar);
    // 灯室
    const chamber = new THREE.Mesh(UNIT_BOX, MAT.lantern);
    chamber.scale.set(0.5*scale, 0.5*scale, 0.5*scale);
    chamber.position.y = 1.7*scale;
    group.add(chamber);
    // 屋顶
    const roof = new THREE.Mesh(ROOF_SMALL, MAT.roofDark);
    roof.scale.set(0.8*scale, 0.4*scale, 0.8*scale);
    roof.position.y = 2.1*scale;
    group.add(roof);
    group.position.set(x, 0, z);
    group.traverse(o => { o.castShadow = true; o.receiveShadow = true; });
    scene.add(group);
    return group;
  },

  // 廊道
  createCorridor(x, z, length, scale = 1) {
    const group = new THREE.Group();
    // 廊道屋顶
    const roof = new THREE.Mesh(ROOF_SMALL, MAT.roof);
    roof.scale.set(length*scale, 0.6*scale, 2.5*scale);
    roof.position.y = 3.2*scale;
    group.add(roof);
    // 廊柱
    const colCount = Math.floor(length / 3) + 1;
    for (let i = 0; i < colCount; i++) {
      const cx = -length/2*scale + i * length*scale / (colCount - 1);
      for (const side of [-1, 1]) {
        const col = new THREE.Mesh(UNIT_CYL, MAT.red);
        col.scale.set(0.18*scale, 3*scale, 0.18*scale);
        col.position.set(cx, 1.5*scale, side * 1.0*scale);
        group.add(col);
      }
    }
    group.position.set(x, 0, z);
    group.traverse(o => { o.castShadow = true; o.receiveShadow = true; });
    scene.add(group);
    return group;
  },

  // 麟德殿（宫内宴饮大殿）
  buildLindeHall() {
    const g = new THREE.Group();
    g.name = 'linde-hall';
    // 台基
    const plat = new THREE.Mesh(UNIT_BOX, MAT.stone);
    plat.scale.set(28, 1.5, 18);
    plat.position.y = 0.75;
    g.add(plat);
    // 主体
    const body = new THREE.Mesh(roundedBoxGeo(22, 6, 14, 0.3), MAT.plasterWarm);
    body.position.y = 4.5;
    g.add(body);
    // 柱子
    for (const sx of [-9, -4.5, 0, 4.5, 9]) {
      for (const sz of [-5.5, 5.5]) {
        const col = new THREE.Mesh(UNIT_CYL, MAT.red);
        col.scale.set(0.35, 6, 0.35);
        col.position.set(sx, 4.5, sz);
        g.add(col);
      }
    }
    // 上层屋檐
    const upperRoof = new THREE.Mesh(ROOF_UNIT, MAT.roofGlazed);
    upperRoof.scale.set(26, 3.5, 18);
    upperRoof.position.y = 8.5;
    g.add(upperRoof);
    // 下层屋檐（环绕）
    const lowerRoof = new THREE.Mesh(ROOF_SMALL, MAT.roof);
    lowerRoof.scale.set(26, 2, 18);
    lowerRoof.position.y = 6.5;
    g.add(lowerRoof);
    // 鸱吻
    for (const sx of [-12, 12]) {
      const chi = new THREE.Mesh(UNIT_SPHERE, MAT.gold);
      chi.scale.set(0.6, 0.8, 0.6);
      chi.position.set(sx, 10.2, 0);
      g.add(chi);
    }
    g.position.set(150, 0, -480);
    g.traverse(o => { o.castShadow = true; o.receiveShadow = true; });
    scene.add(g);
    return g;
  },

  init() {
    this.enhanceHanyuan();
    this.buildLindeHall();
    console.log('[DamingPalace] 大明宫细节增强完成');
  },
};

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    DamingPalace.init();
  };
}
