/* ============================================================
   VisualGrade - 视觉调色Owner
   负责：色调映射/国风雾效/光影/色彩优化
   注意：不与原昼夜系统冲突，仅做微调
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

      // 国风雾效优化（暖灰黄色调）
      if (scene.fog) {
        scene.fog.color.setHex(0xd4c5a9);
        scene.fog.near = 100;
        scene.fog.far = 800;
      }

      // 暖金色基调（与原昼夜系统兼容，不覆盖每帧更新）
      if (typeof sun !== 'undefined') {
        sun.color.setHex(0xffe8c4);
      }

      if (typeof ambient !== 'undefined') {
        ambient.color.setHex(0xc8b89a);
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
