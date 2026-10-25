/* ============================================================
   初始化保障 · 所有模块安全启动
   防止单个模块崩溃影响全局
   ============================================================ */

const SafeInit = {
  modules: [
    'ColorGrading',
    'ArchitectureDetails',
    'DamingPalace',
    'MarketDistrict',
    'QujiangGarden',
    'Vegetation',
    'WaterEnhancement',
    'Atmosphere',
  ],
  
  run() {
    for (const name of this.modules) {
      try {
        if (typeof window[name] !== 'undefined' && window[name].init) {
          window[name].init();
          console.log('[SafeInit] ✓', name);
        }
      } catch (e) {
        console.warn('[SafeInit] ✗', name, ':', e.message);
      }
    }
    console.log('[SafeInit] 所有模块初始化完毕');
  },
};

// 延迟到所有模块加载完后运行
window.addEventListener('load', () => {
  setTimeout(() => SafeInit.run(), 1000);
});
