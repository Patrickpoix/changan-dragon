/* ============================================================
   后处理效果增强 · 更好的后处理
   ============================================================ */

const PostProcessingEnhancement = {
  enhance() {
    if (typeof GameRendering === 'undefined') return;
    
    // 确保高质量模式
    GameRendering.setQuality('high');
    
    // 更好的曝光
    GameRendering.setExposure(1.1);
    
    console.log('[PostProcessingEnhancement] 后处理效果已增强');
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
      if (v) PostProcessingEnhancement.init();
    },
    get() { return origReady; }
  });
}
