/* ============================================================
   VisualGrade - 视觉调色Owner（增强版）
   注意：原系统已有完整渲染管线（ACES+SAO+Bloom+FXAA）
   本模块仅做国风色调微调，不覆盖原系统设置
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

      // 微调曝光（原系统默认1.06，国风暖色调稍提亮）
      if (typeof GameRendering !== 'undefined') {
        GameRendering.setExposure(1.2);
      }

      // 国风雾效微调（暖灰黄色调，类似古画意境）
      // 注意：原系统昼夜系统会动态调整雾效，这里只做初始微调
      if (scene.fog) {
        scene.fog.color.setHex(0xe8d8b8);
        scene.fog.near = 70;
        scene.fog.far = 700;
      }

      // 暖金色太阳光微调（与原昼夜系统兼容）
      if (typeof sun !== 'undefined') {
        sun.color.setHex(0xffdcb0);
        sun.intensity = 1.4;
      }

      // 暖灰环境光微调
      if (typeof ambient !== 'undefined') {
        ambient.color.setHex(0xdccca8);
        ambient.intensity = 0.65;
      }

      // 天空半球光微调
      if (typeof hemi !== 'undefined') {
        hemi.color.setHex(0xfff5e0);
        hemi.groundColor.setHex(0x9aaa8a);
        hemi.intensity = 0.55;
      }

      // 轮廓光微调（暖橙色）
      if (typeof rim !== 'undefined') {
        rim.color.setHex(0xffc99f);
        rim.intensity = 0.5;
      }

      console.log('[VisualGrade] 视觉调色完成 - 国风暖灰雾效(70-700m)+暖金色光影(1.4)+轮廓光(0.5)，兼容原渲染管线');

    } catch(e) {
      console.warn('[VisualGrade] 初始化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(init, 3000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();