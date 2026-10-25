/* ============================================================
   色彩饱和度增强 · 更生动的画面
   ============================================================ */

const ColorSaturation = {
  enhance() {
    if (typeof GameRendering === 'undefined') return;
    
    // 稍高的曝光让画面更通透
    GameRendering.setExposure(1.15);
    
    // 环境光强度
    GameRendering.setEnvironmentIntensity(0.45);
    
    console.log('[ColorSaturation] 色彩饱和度增强完成');
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
      if (v) ColorSaturation.init();
    },
    get() { return origReady; }
  });
}
