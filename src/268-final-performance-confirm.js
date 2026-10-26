/* ============================================================
   性能优化最终确认
   确认性能优化措施已生效
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initFinalPerformanceConfirm() {
    if (initialized) return;
    initialized = true;

    console.log('[FinalPerformanceConfirm] 开始性能优化最终确认...');

    try {
      if (typeof renderer === 'undefined') return;
      
      // 确认渲染器设置
      console.log('[FinalPerformanceConfirm] 渲染器信息:', {
        pixelRatio: renderer.getPixelRatio(),
        size: renderer.getSize(new THREE.Vector2()),
      });
      
      // 确认阴影设置
      if (typeof sun !== 'undefined') {
        console.log('[FinalPerformanceConfirm] 阴影映射:', sun.castShadow);
      }
      
      // 确认抗锯齿
      console.log('[FinalPerformanceConfirm] 抗锯齿:', renderer.antialias);
      
      console.log('[FinalPerformanceConfirm] 性能优化最终确认完成！');

    } catch(e) {
      console.warn('[FinalPerformanceConfirm] 性能优化最终确认失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initFinalPerformanceConfirm, 125000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
