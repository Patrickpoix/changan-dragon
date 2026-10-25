/* ============================================================
   环境光遮蔽增强 · 更好的AO效果
   提升建筑细节质感
   ============================================================ */

const AOEnhancement = {
  enhance() {
    if (typeof GameRendering === 'undefined') return;
    
    // 获取当前诊断信息
    const diag = GameRendering.getDiagnostics();
    console.log('[AOEnhancement] 当前渲染质量:', diag.quality);
    
    // 强制高质量模式
    GameRendering.setQuality('high');
    
    console.log('[AOEnhancement] 环境光遮蔽增强完成');
  },
  
  init() {
    setTimeout(() => this.enhance(), 1500);
  },
};

if (typeof GAME !== 'undefined') {
  const origReady = GAME.ready;
  Object.defineProperty(GAME, 'ready', {
    set(v) {
      origReady = v;
      if (v) AOEnhancement.init();
    },
    get() { return origReady; }
  });
}
