/* ============================================================
   电影级色调增强 · 国风漫剧质感
   ============================================================ */

const CinematicColorGrading = {
  enhance() {
    if (typeof GameRendering === 'undefined') return;
    
    // 电影级曝光
    GameRendering.setExposure(1.12);
    
    // 电影级环境光
    GameRendering.setEnvironmentIntensity(0.5);
    
    console.log('[CinematicColorGrading] 电影级色调已增强');
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
      if (v) CinematicColorGrading.init();
    },
    get() { return origReady; }
  });
}
