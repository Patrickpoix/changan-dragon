/* ============================================================
   材质细节增强 · 更有质感的建筑材质
   ============================================================ */

const MaterialDetailEnhancement = {
  enhance() {
    if (typeof MAT === 'undefined') return;
    
    // 增强木材材质
    if (MAT.wood) {
      MAT.wood.roughness = 0.6;
      MAT.wood.metalness = 0.1;
    }
    
    // 增强石材材质
    if (MAT.stone) {
      MAT.stone.roughness = 0.8;
      MAT.stone.metalness = 0.0;
    }
    
    // 增强屋顶材质
    if (MAT.roof) {
      MAT.roof.roughness = 0.7;
      MAT.roof.metalness = 0.2;
    }
    
    console.log('[MaterialDetailEnhancement] 材质细节已增强');
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
      if (v) MaterialDetailEnhancement.init();
    },
    get() { return origReady; }
  });
}
