/* ============================================================
   大气透视增强 · 远景层次
   让城市更有深度感
   ============================================================ */

const AtmosphericPerspective = {
  enhance() {
    if (!scene.fog) return;
    
    // 分层雾效（近清淡浓）
    scene.fog.near = 80;
    scene.fog.far = 800;
    scene.fog.color.setHex(0xd8c8b0);
    
    console.log('[AtmosphericPerspective] 大气透视增强完成');
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
      if (v) AtmosphericPerspective.init();
    },
    get() { return origReady; }
  });
}
