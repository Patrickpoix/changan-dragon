/* ============================================================
   雾效增强 · 更好的城市层次感
   ============================================================ */

const FogEnhancement = {
  enhance() {
    if (typeof scene !== 'undefined' && scene.fog) {
      // 更柔和的雾效
      scene.fog.near = 100;
      scene.fog.far = 750;
      scene.fog.color.setHex(0xd8c8b0);
    }
    
    console.log('[FogEnhancement] 雾效已增强');
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
      if (v) FogEnhancement.init();
    },
    get() { return origReady; }
  });
}
