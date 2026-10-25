/* ============================================================
   植被效果增强 · 更有生机的城市
   ============================================================ */

const VegetationEnhancement = {
  enhance() {
    if (typeof MAT === 'undefined') return;
    
    // 增强树叶材质
    if (MAT.leaf) {
      MAT.leaf.color.setHex(0x4a7c3a);
      MAT.leaf.roughness = 0.8;
    }
    
    // 增强树干材质
    if (MAT.trunk) {
      MAT.trunk.color.setHex(0x5d4037);
      MAT.trunk.roughness = 0.9;
    }
    
    console.log('[VegetationEnhancement] 植被效果已增强');
  },
  
  init() {
    setTimeout(() => this.enhance(), 1000);
  },
};

if (typeof GAME !== 'undefined') {
  const origReady = GAME.ready;
  Object.defineProperty(GAME, 'ready', {
    set(v) {
      origReady = v;
      if (v) VegetationEnhancement.init();
    },
    get() { return origReady; }
  });
}
