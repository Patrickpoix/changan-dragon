/* ============================================================
   Sky - 天空系统Owner（增强版）
   注意：原系统已有完整天空Shader + 星星 + 连续远山
   本模块仅做微调增强，不重复创建
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Sky] 天空系统增强初始化...');
    try {
      if (typeof scene === 'undefined') return;

      // 原系统已有：sky Shader天空 + stars星星 + 连续远山
      // 本模块仅做微调，不重复创建

      // 微调天空颜色（与原昼夜系统兼容）
      if (typeof skyUniforms !== 'undefined') {
        skyUniforms.topColor.value.setHex(0x6a9fc0);
        skyUniforms.horizonColor.value.setHex(0xfae8d0);
        skyUniforms.sunColor.value.setHex(0xffd47a);
      }

      console.log('[Sky] 天空系统增强完成 - 微调原Shader颜色：天顶蓝+地平线暖金+太阳亮黄');
    } catch(e) { console.warn('[Sky] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 14000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();