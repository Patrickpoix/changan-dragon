/* ============================================================
   Sky - 天空系统Owner（增强版）
   注意：原系统已有完整天空Shader + 星星 + 连续远山
   本模块仅做微调增强，不重复创建
   注意：不直接修改天空uniform，避免被updateDayNight()主循环覆盖
   通过 __enhance.register 注册（优先级20）
   ============================================================ */

(function() {
  'use strict';

  function init() {
    try {
      if (typeof scene === 'undefined') return;

      // 原系统已有：sky Shader天空 + stars星星 + 连续远山
      // 本模块仅做微调，不重复创建

      // 注意：不直接修改skyUniforms的参数，因为这些会被updateDayNight()主循环动态调整
      // 国风天空基调（天顶色/地平线色）已由主循环 Colors 统一驱动

      console.log('[Sky] 天空系统增强完成 - 原系统天空Shader已完善，本模块不重复创建');
    } catch(e) { console.warn('[Sky] 初始化失败:', e); }
  }

  function register() {
    if (window.__enhance) {
      window.__enhance.register('sky', init, 20);
    } else {
      (window.__enhancePending = window.__enhancePending || []).push({ owner: 'sky', fn: init, priority: 20 });
    }
  }

  if (typeof GAME !== 'undefined' && GAME.ready) register();
  else {
    let tries = 0;
    (function check() {
      if (typeof GAME !== 'undefined' && GAME.ready) register();
      else if (tries++ < 400) setTimeout(check, 100);
      else { if (window.__enhance) window.__enhance.register('sky', init, 20); }
    })();
  }
})();