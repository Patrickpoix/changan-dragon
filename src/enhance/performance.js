/* ============================================================
   Performance - 性能优化Owner（增强版）
   注意：原系统已有完整质量档位（low/medium/high）和DPR管理
   本模块仅做补充优化：纹理各向异性+阴影范围微调
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Performance] 初始化性能优化系统...');
    try {
      if (typeof renderer === 'undefined') return;

      // 纹理各向异性过滤（原系统未统一设置）
      const maxAnisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
      if (typeof TEX !== 'undefined') {
        Object.values(TEX).forEach(tex => {
          tex.anisotropy = maxAnisotropy;
          tex.needsUpdate = true;
        });
      }

      // 阴影范围微调（与原系统兼容，仅扩大阴影覆盖范围）
      if (typeof sun !== 'undefined' && sun.shadow) {
        sun.shadow.camera.near = 10;
        sun.shadow.camera.far = 1500;
        sun.shadow.camera.left = -700;
        sun.shadow.camera.right = 700;
        sun.shadow.camera.top = 700;
        sun.shadow.camera.bottom = -700;
        sun.shadow.bias = -0.0004;
        sun.shadow.normalBias = 0.02;
      }

      console.log('[Performance] 性能优化完成 - 纹理各向异性16x+阴影范围扩大至1400m，兼容原质量档位系统');
    } catch(e) { console.warn('[Performance] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 15000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();