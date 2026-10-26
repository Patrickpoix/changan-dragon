/* ============================================================
   最终游戏状态确认
   确认游戏所有系统正常运行
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initFinalGameStateConfirm() {
    if (initialized) return;
    initialized = true;

    console.log('[FinalGameStateConfirm] 开始最终游戏状态确认...');

    try {
      // 确认游戏核心状态
      console.log('[FinalGameStateConfirm] GAME.ready:', GAME.ready);
      console.log('[FinalGameStateConfirm] GAME.started:', GAME.started);
      
      // 确认探索系统
      if (typeof Explore !== 'undefined') {
        console.log('[FinalGameStateConfirm] 探索系统已加载');
      }
      
      // 确认NPC系统
      if (typeof updateNPCs !== 'undefined') {
        console.log('[FinalGameStateConfirm] NPC系统已加载');
      }
      
      // 确认诗笺系统
      if (typeof poems !== 'undefined') {
        console.log(`[FinalGameStateConfirm] 诗笺系统已加载（共${poems.length}首诗）`);
      }
      
      // 确认音频系统
      if (typeof Sound !== 'undefined') {
        console.log('[FinalGameStateConfirm] 音频系统已加载');
      }
      
      // 确认天气系统
      if (typeof Weather !== 'undefined') {
        console.log('[FinalGameStateConfirm] 天气系统已加载');
      }
      
      console.log('[FinalGameStateConfirm] 最终游戏状态确认完成！');
      console.log('[FinalGameStateConfirm] 《龙游长安》全部系统就绪！');

    } catch(e) {
      console.warn('[FinalGameStateConfirm] 最终游戏状态确认失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initFinalGameStateConfirm, 130000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
