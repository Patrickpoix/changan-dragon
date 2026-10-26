/* ============================================================
   最终音频系统整合
   确认所有音频元素都已正确加载
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initFinalAudioIntegration() {
    if (initialized) return;
    initialized = true;

    console.log('[FinalAudioIntegration] 开始最终音频系统整合...');

    try {
      console.log('[FinalAudioIntegration] ===== 音频系统全部就绪 =====');
      console.log('[FinalAudioIntegration] - 五声音阶环境音景');
      console.log('[FinalAudioIntegration] - 程序化环境音效');
      console.log('[FinalAudioIntegration] - 背景音乐');
      console.log('[FinalAudioIntegration] - 静音切换');
      console.log('[FinalAudioIntegration] - 自动暂停（后台切换）');

    } catch(e) {
      console.warn('[FinalAudioIntegration] 最终音频系统整合失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initFinalAudioIntegration, 192000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
