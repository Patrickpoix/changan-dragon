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

      // ACES色调映射（电影级）
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      // 国风雾效（暖灰黄色调，类似古画意境）
      if (scene.fog) {
        scene.fog.color.setHex(0xd4c5a9);
        scene.fog.near = 80;
        scene.fog.far = 700;
      }

      // 暖金色太阳光（清晨/黄昏氛围）
      if (typeof sun !== 'undefined') {
        sun.color.setHex(0xffe8c4);
        sun.intensity = 1.3;
      }

      // 暖灰环境光
      if (typeof ambient !== 'undefined') {
        ambient.color.setHex(0xc8b89a);
        ambient.intensity = 0.3;
      }

      // 天空半球光微调
      if (typeof hemi !== 'undefined') {
        hemi.color.setHex(0xfff3d8);
        hemi.groundColor.setHex(0x6a8a6a);
        hemi.intensity = 0.8;
      }

      // 轮廓光（暖橙色，增强立体感）
      if (typeof rim !== 'undefined') {
        rim.color.setHex(0xffb98f);
        rim.intensity = 0.35;
      }

      // 天空Shader微调（与原昼夜系统兼容）
      if (typeof skyUniforms !== 'undefined') {
        skyUniforms.topColor.value.setHex(0x85b6ce);
        skyUniforms.horizonColor.value.setHex(0xf8e3c8);
        skyUniforms.sunColor.value.setHex(0xffc95e);
      }

      // 背景色微调（国风暖色调）
      scene.background = new THREE.Color(0xc8d8e8);

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
