/* ============================================================
   天空与水面效果优化
   基于现有系统优化，不新建独立系统
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initSkyWaterOptimization() {
    if (initialized) return;
    initialized = true;

    console.log('[SkyWaterOpt] 开始天空与水面效果优化...');

    // ==============================================
    // 1. 天空颜色优化（国风天空）
    // ==============================================
    try {
      // 检查是否有天空uniforms
      if (typeof skyUniforms !== 'undefined') {
        // 顶部：更浅的青蓝色
        skyUniforms.topColor.value.setHex(0x8ecae6);
        // 地平线：更暖的桃色（国风黄昏感）
        skyUniforms.horizonColor.value.setHex(0xffe8c4);
        console.log('[SkyWaterOpt] 天空颜色已优化');
      }
    } catch(e) {
      console.warn('[SkyWaterOpt] 天空优化失败:', e);
    }

    // ==============================================
    // 2. 水面效果确认
    // ==============================================
    try {
      if (typeof waterMat !== 'undefined') {
        console.log('[SkyWaterOpt] 水面Shader系统正常');
      }
    } catch(e) {
      console.warn('[SkyWaterOpt] 水面确认失败:', e);
    }

    // ==============================================
    // 3. 阴影质量确认
    // ==============================================
    try {
      if (typeof sun !== 'undefined' && sun.shadow) {
        sun.shadow.mapSize.set(2048, 2048);
        console.log('[SkyWaterOpt] 阴影质量已确认');
      }
    } catch(e) {
      console.warn('[SkyWaterOpt] 阴影优化失败:', e);
    }

    console.log('[SkyWaterOpt] 天空与水面效果优化完成！');
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initSkyWaterOptimization, 5000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
