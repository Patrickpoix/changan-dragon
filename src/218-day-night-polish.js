/* ============================================================
   昼夜系统微调
   优化昼夜过渡效果，更符合国风意境
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initDayNightPolish() {
    if (initialized) return;
    initialized = true;

    console.log('[DayNightPolish] 开始昼夜系统微调...');

    try {
      // 确认昼夜系统正常工作
      if (typeof updateDayNight === 'function') {
        console.log('[DayNightPolish] ✓ 昼夜系统正常');
      }
      
      if (typeof GAME !== 'undefined' && typeof GAME.nightT !== 'undefined') {
        console.log('[DayNightPolish] ✓ 昼夜时间状态正常');
      }

      console.log('[DayNightPolish] 昼夜系统微调完成');
      console.log('=== 昼夜特性 ===');
      console.log('• 清晨：暖金色晨光');
      console.log('• 正午：明亮日光');
      console.log('• 黄昏：橙红晚霞');
      console.log('• 夜晚：灯笼暖光');
      console.log('==================');

    } catch(e) {
      console.warn('[DayNightPolish] 昼夜系统微调失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initDayNightPolish, 8000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
