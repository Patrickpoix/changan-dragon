/* ============================================================
   Performance - 性能优化Owner
   负责：DPR/阴影/LOD/渲染优化
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Performance] 初始化性能优化系统...');
    try {
      if (typeof renderer === 'undefined') return;

      // 移动端DPR限制
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      const maxDPR = isMobile ? 1.25 : 1.65;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));

      // 阴影优化：使用原引擎的sun对象（不是sunLight）
      if (typeof sun !== 'undefined' && sun.shadow) {
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 10;
        sun.shadow.camera.far = 1000;
        sun.shadow.camera.left = -500;
        sun.shadow.camera.right = 500;
        sun.shadow.camera.top = 500;
        sun.shadow.camera.bottom = -500;
      }

      console.log('[Performance] 性能优化完成 - DPR:', renderer.getPixelRatio());
    } catch(e) { console.warn('[Performance] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 20000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();
