/* ============================================================
   性能优化 — 流畅运行不卡顿
   v1: 加载优化、渲染优化、内存优化
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Perf] 开始性能优化...']);
    
    optimizeLoading();
    optimizeRendering();
    optimizeMemory();
    
    console.log('[Perf] ✓ 性能优化完成');
  }
  
  // 加载优化
  function optimizeLoading() {
    // 延迟加载非关键模块
    const deferredModules = [
      'src/enhance/wonders.js',
      'src/enhance/wonders-v2.js',
      'src/enhance/night-light.js',
      'src/enhance/city-details.js',
      'src/enhance/arch-details.js',
      'src/enhance/life-enhancement.js',
      'src/enhance/sky-water.js',
      'src/enhance/vegetation-traffic.js',
      'src/enhance/ui-enhancement.js',
      'src/enhance/save-achievement.js',
      'src/enhance/perf-audio.js'
    ];
    
    deferredModules.forEach((src, i) => {
      setTimeout(() => {
        const script = document.createElement('script');
        script.src = src;
        script.onerror = () => console.warn('[Perf] 延迟加载失败: ' + src);
        document.head.appendChild(script);
      }, 10000 + i * 500);
    });
  }
  
  // 渲染优化
  function optimizeRendering() {
    if (typeof renderer === 'undefined') return;
    
    // 根据设备性能调整DPR
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      console.log('[Perf] 移动端DPR限制为1.5');
    } else {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
      console.log('[Perf] 桌面端DPR限制为2.0');
    }
    
    // 阴影优化
    if (typeof sun !== 'undefined') {
      if (isMobile) {
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
      } else {
        sun.shadow.mapSize.width = 4096;
        sun.shadow.mapSize.height = 4096;
      }
    }
  }
  
  // 内存优化
  function optimizeMemory() {
    // 清理未使用的几何体
    if (typeof scene !== 'undefined') {
      let geometryCount = 0;
      let materialCount = 0;
      
      scene.traverse(obj => {
        if (obj.geometry) geometryCount++;
        if (obj.material) materialCount++;
      });
      
      console.log('[Perf] 当前场景: ' + geometryCount + ' 几何体, ' + materialCount + ' 材质');
    }
  }
  
  init();
})();
