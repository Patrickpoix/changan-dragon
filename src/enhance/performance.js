/* ============================================================
   Performance - 性能优化Owner（增强版）
   纹理各向异性+阴影范围微调（±500m保持合理精度）。
   通过 __enhance.register 注册（优先级30）
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

  function init() {
    try {
      if (typeof renderer === 'undefined') return;
      const maxAnisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
      if (typeof TEX !== 'undefined') {
        Object.values(TEX).forEach(tex => {
          tex.anisotropy = maxAnisotropy;
          tex.needsUpdate = true;
        });
      }
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
      console.log('[Performance] 性能优化完成 - 纹理各向异性16x+阴影范围覆盖城市核心(±500m)');
    } catch(e) { console.warn('[Performance] 初始化失败:', e); }
  }

  function register() {
    if (registered) return;
    registered = true;
    if (window.__enhance) {
      window.__enhance.register('performance', init, 30);
    } else {
      (window.__enhancePending = window.__enhancePending || []).push({ owner: 'performance', fn: init, priority: 30 });
    }
  }

  if (typeof GAME !== 'undefined' && GAME.ready) register();
  else {
    let tries = 0;
    (function check() {
      if (typeof GAME !== 'undefined' && GAME.ready) register();
      else if (tries++ < 400) setTimeout(check, 100);
      else { if (window.__enhance) window.__enhance.register('performance', init, 30); }
    })();
  }
})();