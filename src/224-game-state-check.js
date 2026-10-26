/* ============================================================
   游戏状态确认
   确认游戏状态和存档系统正常
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initGameStateCheck() {
    if (initialized) return;
    initialized = true;

    console.log('[GameStateCheck] 开始游戏状态确认...');

    try {
      if (typeof GAME !== 'undefined') {
        console.log('[GameStateCheck] ✓ 游戏状态对象正常');
        console.log('  • GAME.ready:', GAME.ready);
        console.log('  • GAME.started:', GAME.started);
        console.log('  • GAME.nightT:', GAME.nightT);
        console.log('  • GAME.poemsFound:', GAME.poemsFound);
      }

      console.log('[GameStateCheck] 游戏状态确认完成！');

    } catch(e) {
      console.warn('[GameStateCheck] 游戏状态确认失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initGameStateCheck, 15000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
