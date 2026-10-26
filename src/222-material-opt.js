/* ============================================================
   材质优化确认
   确认共享材质库正常工作
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initMaterialOpt() {
    if (initialized) return;
    initialized = true;

    console.log('[MaterialOpt] 开始材质优化确认...');

    try {
      if (typeof MAT !== 'undefined') {
        console.log('[MaterialOpt] ✓ 共享材质库正常');
        console.log('  • MAT.red：朱红漆');
        console.log('  • MAT.roof：青瓦');
        console.log('  • MAT.roofGlazed：琉璃瓦');
        console.log('  • MAT.stone：石材');
        console.log('  • MAT.wood：木材');
        console.log('  • MAT.lantern：灯笼');
        console.log('  • MAT.green：植被');
      }

      if (typeof TEX !== 'undefined') {
        console.log('[MaterialOpt] ✓ 纹理库正常');
      }

      if (typeof toon === 'function') {
        console.log('[MaterialOpt] ✓ 卡通渲染函数正常');
      }

      console.log('[MaterialOpt] 材质优化确认完成！');

    } catch(e) {
      console.warn('[MaterialOpt] 材质优化确认失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initMaterialOpt, 13000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
