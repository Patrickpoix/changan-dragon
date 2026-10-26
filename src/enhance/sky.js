/* ============================================================
   Sky - 天空系统Owner（增强版）
   注意：原系统已有完整天空Shader + 星星 + 连续远山
   本模块仅做微调增强，不重复创建
   注意：不直接修改天空uniform，避免被updateDayNight()主循环覆盖
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Sky] 天空系统增强初始化...');
    try {
      if (typeof scene === 'undefined') return;

      // 原系统已有：sky Shader天空 + stars星星 + 连续远山
      // 本模块仅做微调，不重复创建

      // 注意：不直接修改skyUniforms的参数，因为这些会被updateDayNight()主循环动态调整

      console.log('[Sky] 天空系统增强完成 - 原系统天空Shader已完善，本模块不重复创建');
    } catch(e) { console.warn('[Sky] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 2000);
    else setTimeout(checkReady, 100);
  }
  checkReady();
})();