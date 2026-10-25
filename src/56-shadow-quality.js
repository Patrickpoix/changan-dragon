/* ============================================================
   阴影质量增强 · 更好的阴影效果
   提升整体画面质感
   ============================================================ */

const ShadowQualityEnhancement = {
  enhance() {
    // 提高阴影贴图分辨率
    if (typeof sun !== 'undefined' && sun.castShadow) {
      sun.shadow.mapSize.width = 2048;
      sun.shadow.mapSize.height = 2048;
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 500;
      sun.shadow.camera.left = -100;
      sun.shadow.camera.right = 100;
      sun.shadow.camera.top = 100;
      sun.shadow.camera.bottom = -100;
      sun.shadow.bias = -0.001;
    }
    
    console.log('[ShadowQualityEnhancement] 阴影质量已增强');
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
      if (v) ShadowQualityEnhancement.init();
    },
    get() { return origReady; }
  });
}
