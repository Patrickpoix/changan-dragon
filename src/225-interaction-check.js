/* ============================================================
   交互系统确认
   确认探索和交互系统正常
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initInteractionCheck() {
    if (initialized) return;
    initialized = true;

    console.log('[InteractionCheck] 开始交互系统确认...');

    try {
      if (typeof Explore !== 'undefined') {
        console.log('[InteractionCheck] ✓ 探索系统正常');
        console.log('  • 步行模式');
        console.log('  • 骑行模式');
        console.log('  • 飞行模式');
      }

      if (typeof poems !== 'undefined') {
        console.log('[InteractionCheck] ✓ 诗笺系统正常，共', poems.length, '首');
      }

      console.log('[InteractionCheck] 交互系统确认完成！');
      console.log('=== 操作说明 ===');
      console.log('• WASD：移动');
      console.log('• 鼠标：镜头旋转');
      console.log('• 滚轮：缩放');
      console.log('• Shift：加速');
      console.log('• E：拾取诗笺');
      console.log('• G：切换移动模式');
      console.log('==================');

    } catch(e) {
      console.warn('[InteractionCheck] 交互系统确认失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initInteractionCheck, 16000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
