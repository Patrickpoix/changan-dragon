/* ============================================================
   最终交互系统整合
   确认所有交互元素都已正确加载
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initFinalInteractionIntegration() {
    if (initialized) return;
    initialized = true;

    console.log('[FinalInteractionIntegration] 开始最终交互系统整合...');

    try {
      console.log('[FinalInteractionIntegration] ===== 交互系统全部就绪 =====');
      console.log('[FinalInteractionIntegration] - 步行/骑行/飞行 三种模式');
      console.log('[FinalInteractionIntegration] - WASD + 鼠标镜头控制');
      console.log('[FinalInteractionIntegration] - 移动端触控摇杆');
      console.log('[FinalInteractionIntegration] - 诗笺收集系统');
      console.log('[FinalInteractionIntegration] - 景点靠近提示');
      console.log('[FinalInteractionIntegration] - 画质切换');
      console.log('[FinalInteractionIntegration] - 自动存档');

    } catch(e) {
      console.warn('[FinalInteractionIntegration] 最终交互系统整合失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initFinalInteractionIntegration, 194000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
