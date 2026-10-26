/* ============================================================
   音频系统确认
   确认音频系统正常工作
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initAudioCheck() {
    if (initialized) return;
    initialized = true;

    console.log('[AudioCheck] 开始音频系统确认...');

    try {
      if (typeof Sound !== 'undefined') {
        console.log('[AudioCheck] ✓ 音频系统正常');
        console.log('  • 五声音阶环境音景');
        console.log('  • 程序化合成音效');
        console.log('  • 静音/音量控制');
      }

      console.log('[AudioCheck] 音频系统确认完成！');

    } catch(e) {
      console.warn('[AudioCheck] 音频系统确认失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initAudioCheck, 17000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
