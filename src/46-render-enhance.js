/* ============================================================
   渲染全局优化 · 全局光照增强
   提升整体画面质感
   ============================================================ */

const RenderEnhancement = {
  // 调整全局光照
  enhance() {
    if (typeof renderer === 'undefined') return;
    
    // 更高的DPR（如果设备支持）
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    
    // 更好的阴影设置
    if (sun) {
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.bias = -0.0004;
      sun.shadow.normalBias = 0.05;
    }
    
    // 更好的雾效颜色
    if (scene.fog) {
      scene.fog.color.setHex(0xd8c8b0);
      scene.fog.near = 100;
      scene.fog.far = 700;
    }
    
    console.log('[RenderEnhancement] 渲染全局优化完成');
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
      if (v) RenderEnhancement.init();
    },
    get() { return origReady; }
  });
}
