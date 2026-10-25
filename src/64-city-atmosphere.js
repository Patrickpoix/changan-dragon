/* ============================================================
   城市氛围增强 · 更有生活气息的长安
   ============================================================ */

const CityAtmosphereEnhancement = {
  enhance() {
    // 添加更多灯笼
    if (typeof MAT !== 'undefined' && MAT.lantern) {
      MAT.lantern.emissiveIntensity = 0.5;
    }
    
    console.log('[CityAtmosphereEnhancement] 城市氛围已增强');
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
      if (v) CityAtmosphereEnhancement.init();
    },
    get() { return origReady; }
  });
}
