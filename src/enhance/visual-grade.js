/* ============================================================
   VisualGrade - 视觉调色Owner
   负责：色调映射/国风雾效/光影/色彩优化
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;

    console.log('[VisualGrade] 初始化视觉调色系统...');

    try {
      if (typeof renderer === 'undefined' || typeof scene === 'undefined') return;

      // ACES色调映射（原引擎已有，确认启用）
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      // 国风雾效优化
      if (scene.fog) {
        scene.fog.color.setHex(0xd4c5a9); // 暖灰黄色，符合国风意境
        scene.fog.near = 100;
        scene.fog.far = 800;
      }

      // 暖金色黄昏光影氛围
      if (typeof sun !== 'undefined') {
        sun.color.setHex(0xffe8c4); // 暖金色
        sun.intensity = 1.2;
      }

      if (typeof ambient !== 'undefined') {
        ambient.color.setHex(0xc8b89a); // 暖灰环境光
        ambient.intensity = 0.5;
      }

      console.log('[VisualGrade] 视觉调色完成');

    } catch(e) {
      console.warn('[VisualGrade] 初始化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(init, 5000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
