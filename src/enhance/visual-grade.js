/* ============================================================
   VisualGrade - 视觉调色Owner（国风基调已整合进主循环）
   通过 __enhance.register 注册（优先级10），只做自检+记录视觉状态。
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

  function init() {
    try {
      if (typeof renderer === 'undefined' || typeof scene === 'undefined') return;
      if (typeof window !== 'undefined') {
        window.__visualGrade = {
          integrated: true,
          dayExposure: 1.15,
          nightExposure: 0.92,
          dayFogNear: 60,
          dayFogFar: 600,
          nightFogNear: 95,
          nightFogFar: 590,
          fogColorDay: '#e8d8b8',
          note: '国风基调由主循环updateDayNight()统一驱动，本模块不重复设置'
        };
      }
      console.log('[VisualGrade] 国风基调已整合进主循环 - 曝光1.15/雾距60-600m/暖灰雾色');
    } catch(e) { console.warn('[VisualGrade] 初始化失败:', e); }
  }

  function register() {
    if (registered) return;
    registered = true;
    if (window.__enhance) {
      window.__enhance.register('visual-grade', init, 10);
    } else {
      (window.__enhancePending = window.__enhancePending || []).push({ owner: 'visual-grade', fn: init, priority: 10 });
    }
  }

  if (typeof GAME !== 'undefined' && GAME.ready) register();
  else {
    let tries = 0;
    (function check() {
      if (typeof GAME !== 'undefined' && GAME.ready) register();
      else if (tries++ < 400) setTimeout(check, 100);
      else { if (window.__enhance) window.__enhance.register('visual-grade', init, 10); }
    })();
  }
})();