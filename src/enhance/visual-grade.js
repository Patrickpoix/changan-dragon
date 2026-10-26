/* ============================================================
   VisualGrade - 视觉调色Owner（增强版）
   注意：原系统已有完整渲染管线（ACES+SAO+Bloom+FXAA）
   本模块仅做国风色调微调，不覆盖原系统设置
   注意：不直接修改灯光参数，避免被updateDayNight()主循环覆盖
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;

    console.log('[VisualGrade] 初始化视觉调色系统...');

    try {
      if (typeof renderer === 'undefined' || typeof scene === 'undefined') return;

      // 微调曝光（原系统默认1.06，国风暖色调稍提亮）
      if (typeof GameRendering !== 'undefined') {
        GameRendering.setExposure(1.15);
      }

      // 注意：不直接修改sun/ambient/hemi/rim的颜色和强度，
      // 因为这些会被updateDayNight()主循环动态调整
      // 只做不会被覆盖的微调

      // 国风雾效微调（暖灰黄色调，类似古画意境）
      // 注意：原系统昼夜系统会动态调整雾效，这里只做初始微调
      if (scene.fog) {
        scene.fog.color.setHex(0xe8d8b8);
        scene.fog.near = 60;
        scene.fog.far = 600;
      }

      console.log('[VisualGrade] 视觉调色完成 - 国风暖灰雾效(60-600m)+曝光微调(1.15)，不修改灯光参数避免被主循环覆盖');

    } catch(e) {
      console.warn('[VisualGrade] 初始化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(init, 1000);
    } else {
      setTimeout(checkReady, 100);
    }
  }

  checkReady();

})();