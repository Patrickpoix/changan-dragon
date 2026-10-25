/* ============================================================
   光照效果增强 · 更有氛围的光照
   ============================================================ */

const LightingEnhancement = {
  enhance() {
    if (typeof hemi !== 'undefined') {
      hemi.intensity = 0.5;
      hemi.color.setHex(0xfff3d8);
    }
    
    if (typeof sun !== 'undefined') {
      sun.intensity = 2.4;
      sun.color.setHex(0xffe6bd);
    }
    
    if (typeof ambient !== 'undefined') {
      ambient.intensity = 0.08;
    }
    
    console.log('[LightingEnhancement] 光照效果已增强');
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
      if (v) LightingEnhancement.init();
    },
    get() { return origReady; }
  });
}
