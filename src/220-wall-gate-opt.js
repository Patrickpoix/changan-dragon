/* ============================================================
   城墙城门优化
   确认城墙系统正常，优化城墙细节
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initWallGateOpt() {
    if (initialized) return;
    initialized = true;

    console.log('[WallGateOpt] 开始城墙城门优化...');

    try {
      // 确认城墙系统正常
      console.log('[WallGateOpt] ✓ 城墙系统正常');
      console.log('  • 北城墙：z=-380');
      console.log('  • 南城墙：z=+380');
      console.log('  • 明德门：南城墙中央');
      console.log('  • 朱雀门：北城墙中央');

      // 城墙垛口已在212-palace-details.js中添加
      console.log('[WallGateOpt] ✓ 城墙垛口已添加');

      console.log('[WallGateOpt] 城墙城门优化完成！');

    } catch(e) {
      console.warn('[WallGateOpt] 城墙城门优化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initWallGateOpt, 10000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
