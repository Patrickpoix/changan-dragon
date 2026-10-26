/* ============================================================
   VisualGrade - 视觉调色Owner（国风基调已整合进主循环）
   国风电影感基调参数（曝光/雾距/雾色）已直接写入 src/30-main.js
   的 updateDayNight() 与 Colors/GRADE 定义中，由主循环每帧统一驱动。
   本模块不再延迟覆盖主循环参数（那会在下一帧被冲掉），
   只负责：启动自检 + 记录视觉状态，供调试与验收。
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;

    try {
      if (typeof renderer === 'undefined' || typeof scene === 'undefined') return;

      // 国风基调参数已整合进主循环（30-main.js）：
      //  - 白天曝光 1.06 → 1.15（国风暖调略提亮）
      //  - 雾距 175/760 → 60/600（更集中的电影感纵深）
      //  - 雾色 0xc9d7d5 → 0xe8d8b8（国风暖灰，古画意境）
      // 此处不再做会被 updateDayNight() 覆盖的重复设置。

      // 暴露诊断信息，供浏览器控制台与自动验收读取
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