/* ============================================================
   植被增强 · 行道树 + 花树 + 庭院绿植
   让长安绿树成荫
   ============================================================ */

const Vegetation = {
  // 行道树（朱雀大街两侧）
  avenueTrees() {
    const treePositions = [];
    for (let z = -360; z <= 360; z += 24) {
      treePositions.push([-20, z]);
      treePositions.push([20, z + 12]);
    }
    
    const trunkBatch = new Batch(UNIT_CYL, MAT.trunk, { cast: true });
    const leafBatch = new Batch(UNIT_SPHERE, MAT.leaf, { cast: true });
    
    treePositions.forEach(([x, z], i) => {
      const scale = 0.8 + Math.random() * 0.4;
      trunkBatch.add(x, 2*scale, z, 0.4*scale, 4*scale, 0.4*scale);
      leafBatch.add(x, 5.5*scale, z, 2.5*scale, 2*scale, 2.5*scale);
      // 第二层树冠
      leafBatch.add(x + 0.5, 6.5*scale, z - 0.3, 1.8*scale, 1.5*scale, 1.8*scale);
    });
    
    trunkBatch.build();
    leafBatch.build();
  },

  // 花树（樱花/桃花，点缀在坊区和曲江）
  blossomTrees() {
    const positions = [
      [310, 300], [330, 320], [350, 340], [370, 310], [390, 330], // 曲江池
      [-200, 0], [-180, 50], [180, 0], [200, 50], // 东西市周围
      [-50, 200], [50, 200], [-50, -200], [50, -200], // 朱雀大街中段
    ];
    
    const trunkBatch = new Batch(UNIT_CYL, MAT.trunk, { cast: true });
    const blossomBatch = new Batch(UNIT_SPHERE, MAT.blossom, { cast: true });
    
    positions.forEach(([x, z]) => {
      const scale = 0.9 + Math.random() * 0.3;
      trunkBatch.add(x, 2.2*scale, z, 0.35*scale, 4.4*scale, 0.35*scale);
      blossomBatch.add(x, 5.8*scale, z, 2.2*scale, 1.8*scale, 2.2*scale);
    });
    
    trunkBatch.build();
    blossomBatch.build();
  },

  // 柳树（曲江池边，垂柳）
  willows() {
    const positions = [
      [305, 310], [315, 330], [385, 320], [395, 340],
      [320, 295], [375, 295],
    ];
    
    const trunkBatch = new Batch(UNIT_CYL, MAT.trunk, { cast: true });
    const willowMat = new THREE.MeshStandardMaterial({ color: 0x8fbc5a, roughness: 0.85 });
    const willowBatch = new Batch(UNIT_SPHERE, willowMat, { cast: true });
    
    positions.forEach(([x, z]) => {
      const scale = 1.0 + Math.random() * 0.2;
      trunkBatch.add(x, 3*scale, z, 0.4*scale, 6*scale, 0.4*scale);
      // 垂柳树冠（更扁更宽）
      willowBatch.add(x, 7*scale, z, 3*scale, 2.5*scale, 3*scale);
    });
    
    trunkBatch.build();
    willowBatch.build();
  },

  init() {
    this.avenueTrees();
    this.blossomTrees();
    this.willows();
    console.log('[Vegetation] 植被增强完成');
  },
};

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    Vegetation.init();
  };
}
