/* ============================================================
   性能优化增强 · 确保游戏流畅运行
   ============================================================ */

const PerformanceEnhancement = {
  enhance() {
    // 限制像素比，避免高DPR设备过载
    if (typeof renderer !== 'undefined') {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }
    
    console.log('[PerformanceEnhancement] 性能优化已增强');
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
      if (v) PerformanceEnhancement.init();
    },
    get() { return origReady; }
  });
}
