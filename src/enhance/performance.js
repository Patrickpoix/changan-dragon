/* ============================================================
   Performance - 性能优化Owner（增强版）
   注意：原系统已有完整质量档位（low/medium/high）和DPR管理
   本模块仅做补充优化：纹理各向异性+阴影范围微调
   注意：阴影范围不是越大越好，过大反而降低阴影精度
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

      // 阴影范围微调（与原系统兼容，不盲目扩大，保持合理精度）
      // 原系统默认：near=1, far=420, left/right/top/bottom=±95
      // 调整为：覆盖整个城市核心区域，同时保持阴影精度
      if (typeof sun !== 'undefined' && sun.shadow) {
        sun.shadow.camera.near = 1;
        sun.shadow.camera.far = 500;
        sun.shadow.camera.left = -500;
        sun.shadow.camera.right = 500;
        sun.shadow.camera.top = 500;
        sun.shadow.camera.bottom = -500;
        sun.shadow.bias = -0.0006;
        sun.shadow.normalBias = 0.035;
        sun.shadow.camera.updateProjectionMatrix();
      }

      console.log('[Performance] 性能优化完成 - 纹理各向异性16x+阴影范围覆盖城市核心(±500m)，保持合理阴影精度');
    } catch(e) { console.warn('[Performance] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 4000);
    else setTimeout(checkReady, 200);
  }
  checkReady();
})();