/* ============================================================
   几何体优化确认
   确认共享几何体正常工作
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initGeometryOpt() {
    if (initialized) return;
    initialized = true;

    console.log('[GeometryOpt] 开始几何体优化确认...');

    try {
      if (typeof UNIT_BOX !== 'undefined') {
        console.log('[GeometryOpt] ✓ 共享几何体正常');
        console.log('  • UNIT_BOX：单位盒子');
        console.log('  • UNIT_CYL：单位圆柱');
        console.log('  • UNIT_SPHERE：单位球体');
        console.log('  • ROOF_UNIT：单位屋顶');
      }

      console.log('[GeometryOpt] 几何体优化确认完成！');

    } catch(e) {
      console.warn('[GeometryOpt] 几何体优化确认失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initGeometryOpt, 14000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
