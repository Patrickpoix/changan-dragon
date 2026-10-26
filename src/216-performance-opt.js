/* ============================================================
   性能优化确认
   确保游戏流畅运行，不破坏现有性能策略
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initPerformanceOpt() {
    if (initialized) return;
    initialized = true;

    console.log('[PerformanceOpt] 开始性能优化确认...');

    // ==============================================
    // 1. 渲染性能确认
    // ==============================================
    try {
      if (typeof renderer !== 'undefined') {
        // 保持现有DPR策略，不擅自提高
        // 像素比限制在合理范围
        const dpr = Math.min(window.devicePixelRatio, 1.5);
        renderer.setPixelRatio(dpr);
        console.log('[PerformanceOpt] 渲染像素比已确认:', dpr);
      }
    } catch(e) {
      console.warn('[PerformanceOpt] 渲染性能确认失败:', e);
    }

    // ==============================================
    // 2. 阴影性能确认
    // ==============================================
    try {
      if (typeof sun !== 'undefined' && sun.shadow) {
        // 阴影贴图大小保持2048x2048（平衡质量与性能）
        sun.shadow.mapSize.set(2048, 2048);
        console.log('[PerformanceOpt] 阴影性能已确认');
      }
    } catch(e) {
      console.warn('[PerformanceOpt] 阴影性能确认失败:', e);
    }

    // ==============================================
    // 3. 场景性能统计
    // ==============================================
    try {
      if (typeof scene !== 'undefined') {
        const meshCount = scene.children.filter(c => c.isMesh).length;
        console.log('[PerformanceOpt] 场景Mesh数量:', meshCount);
        console.log('[PerformanceOpt] 场景总对象数:', scene.children.length);
      }
    } catch(e) {
      console.warn('[PerformanceOpt] 场景统计失败:', e);
    }

    console.log('[PerformanceOpt] 性能优化确认完成！');
    console.log('=== 性能策略 ===');
    console.log('• DPR上限：1.5');
    console.log('• 阴影贴图：2048x2048');
    console.log('• 保持原有批处理与实例化');
    console.log('• 保持原有LOD系统');
    console.log('==================');
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initPerformanceOpt, 6000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
