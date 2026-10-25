/* ============================================================
   阴影质量增强 · 更柔和更真实
   提升画面层次感
   ============================================================ */

const ShadowEnhancement = {
  enhance() {
    if (typeof sun === 'undefined') return;
    
    // 更好的阴影参数
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0003;
    sun.shadow.normalBias = 0.04;
    sun.shadow.radius = 4; // PCFSoft模糊
    
    // 更大的阴影相机范围
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 500;
    
    console.log('[ShadowEnhancement] 阴影质量增强完成');
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
      if (v) ShadowEnhancement.init();
    },
    get() { return origReady; }
  });
}
