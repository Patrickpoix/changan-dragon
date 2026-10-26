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

      // 移动端DPR限制（原引擎已有，确认不超过合理值）
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      const maxDPR = isMobile ? 1.25 : 1.65;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));

      console.log('[Performance] 性能优化完成 - DPR:', renderer.getPixelRatio());
    } catch(e) { console.warn('[Performance] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 20000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();
