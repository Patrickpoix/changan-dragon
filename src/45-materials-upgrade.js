/* ============================================================
   材质质感增强 · PBR深度优化
   让建筑更有真实材质感
   ============================================================ */

const MaterialUpgrade = {
  // 增强所有材质
  upgrade() {
    if (typeof MAT === 'undefined') return;
    
    // 屋顶：更有瓦的质感
    MAT.roof.roughness = 0.75;
    MAT.roof.metalness = 0.05;
    MAT.roof.envMapIntensity = 0.8;
    
    // 琉璃瓦：更光亮
    MAT.roofGlazed.roughness = 0.35;
    MAT.roofGlazed.metalness = 0.3;
    MAT.roofGlazed.envMapIntensity = 1.2;
    
    // 木柱：更有木纹质感
    MAT.wood.roughness = 0.6;
    MAT.wood.envMapIntensity = 0.6;
    
    // 红漆：更饱和
    MAT.red.roughness = 0.5;
    MAT.red.envMapIntensity = 0.7;
    
    // 石材：更粗糙
    MAT.stone.roughness = 0.9;
    MAT.stone.envMapIntensity = 0.5;
    
    // 金饰：更闪亮
    MAT.gold.roughness = 0.25;
    MAT.gold.metalness = 0.8;
    MAT.gold.envMapIntensity = 1.5;
    
    console.log('[MaterialUpgrade] PBR材质已升级');
  },
  
  init() {
    // 延迟执行，等所有材质加载完
    setTimeout(() => this.upgrade(), 500);
  },
};

if (typeof GAME !== 'undefined') {
  const origReady = GAME.ready;
  Object.defineProperty(GAME, 'ready', {
    set(v) {
      origReady = v;
      if (v) MaterialUpgrade.init();
    },
    get() { return origReady; }
  });
}
