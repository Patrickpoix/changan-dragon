/* ============================================================
   天空效果增强 · 更有氛围的天空
   ============================================================ */

const SkyEnhancement = {
  enhance() {
    if (typeof skyUniforms === 'undefined') return;
    
    // 更柔和的天空渐变
    skyUniforms.topColor.value.setHex(0x7eb8d9);
    skyUniforms.horizonColor.value.setHex(0xf5e6c8);
    
    // 更柔和的太阳
    skyUniforms.sunColor.value.setHex(0xffd700);
    
    console.log('[SkyEnhancement] 天空效果已增强');
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
      if (v) SkyEnhancement.init();
    },
    get() { return origReady; }
  });
}
