/* ============================================================n   水面效果增强 · 更有质感的水面
   ============================================================ */

const WaterEffectEnhancement = {
  enhance() {
    if (typeof waterUniforms === 'undefined') return;
    
    // 更清澈的水面
    waterUniforms.deep.value.setHex(0x2e6c70);
    waterUniforms.shallow.value.setHex(0x78b4aa);
    
    // 更好的反光
    waterUniforms.sunColor.value.setHex(0xffe6bd);
    
    console.log('[WaterEffectEnhancement] 水面效果已增强');
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
      if (v) WaterEffectEnhancement.init();
    },
    get() { return origReady; }
  });
}
