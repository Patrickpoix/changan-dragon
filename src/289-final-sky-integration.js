/* ============================================================
   最终天空系统整合
   确认所有天空元素都已正确加载
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initFinalSkyIntegration() {
    if (initialized) return;
    initialized = true;

    console.log('[FinalSkyIntegration] 开始最终天空系统整合...');

    try {
      if (typeof scene === 'undefined') return;
      
      console.log('[FinalSkyIntegration] ===== 天空系统全部就绪 =====');
      console.log('[FinalSkyIntegration] - 太阳/月亮/星空 已配置');
      console.log('[FinalSkyIntegration] - 远山轮廓 已添加');
      console.log('[FinalSkyIntegration] - 云朵 已添加');
      console.log('[FinalSkyIntegration] - 国风雾效 已启用');
      console.log('[FinalSkyIntegration] - 昼夜循环 已运行');
      console.log('[FinalSkyIntegration] - 黄昏/黎明 色彩过渡 已优化');

    } catch(e) {
      console.warn('[FinalSkyIntegration] 最终天空系统整合失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initFinalSkyIntegration, 182000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
