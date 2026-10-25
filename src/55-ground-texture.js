/* ============================================================
   地面纹理增强 · 更有质感的路面
   ============================================================ */

const GroundTextureEnhancement = {
  enhance() {
    if (typeof TEX === 'undefined') return;
    
    // 让石板路更有质感
    if (TEX.stone) {
      TEX.stone.repeat.set(4, 4);
      TEX.stone.anisotropy = 8;
    }
    
    // 让土路更有质感
    if (TEX.dirt) {
      TEX.dirt.repeat.set(8, 8);
      TEX.dirt.anisotropy = 8;
    }
    
    console.log('[GroundTextureEnhancement] 地面纹理已增强');
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
      if (v) GroundTextureEnhancement.init();
    },
    get() { return origReady; }
  });
}
