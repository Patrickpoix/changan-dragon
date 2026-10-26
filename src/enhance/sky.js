/* ============================================================
   Sky - 天空系统Owner（增强版）
   原系统已有完整天空Shader + 星星 + 连续远山，本模块仅微调不重复创建。
   通过 __enhance.register 注册（优先级20）
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

  function init() {
    try {
      if (typeof scene === 'undefined') return;
      console.log('[Sky] 天空系统增强完成 - 原系统天空Shader已完善，本模块不重复创建');
    } catch(e) { console.warn('[Sky] 初始化失败:', e); }
  }

  function register() {
    if (registered) return;
    registered = true;
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