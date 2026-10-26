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
      renderer.toneMappingExposure = 1.3;

      // 国风雾效（暖灰黄色调，类似古画意境）
      if (scene.fog) {
        scene.fog.color.setHex(0xe0ccaa);
        scene.fog.near = 40;
        scene.fog.far = 550;
      }

      // 暖金色太阳光（清晨/黄昏氛围）
      if (typeof sun !== 'undefined') {
        sun.color.setHex(0xffd8a8);
        sun.intensity = 1.3;
      }

      // 暖灰环境光
      if (typeof ambient !== 'undefined') {
        ambient.color.setHex(0xd8c8a8);
        ambient.intensity = 0.45;
      }

      // 天空半球光微调
      if (typeof hemi !== 'undefined') {
        hemi.color.setHex(0xfff8e8);
        hemi.groundColor.setHex(0x8aaa8a);
        hemi.intensity = 1.1;
      }

      // 轮廓光（暖橙色，增强立体感）
      if (typeof rim !== 'undefined') {
        rim.color.setHex(0xffc99f);
        rim.intensity = 0.5;
      }

      // 天空Shader微调（与原昼夜系统兼容）
      if (typeof skyUniforms !== 'undefined') {
        skyUniforms.topColor.value.setHex(0x70a0c0);
        skyUniforms.horizonColor.value.setHex(0xfce8d0);
        skyUniforms.sunColor.value.setHex(0xffd880);
      }

      // 背景色微调（国风暖色调）
      scene.background = new THREE.Color(0xd8e0e8);

      console.log('[VisualGrade] 视觉调色完成 - ACES电影级(曝光1.3)+国风暖灰雾效(40-550m)+暖金色光影+轮廓光(0.5)');

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