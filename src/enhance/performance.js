/* ============================================================
   Performance - 性能优化Owner（增强版 v2）
   重要：原系统阴影相机以玩家为焦点跟随（sun.target=player），
   ±95m范围 + 2048 贴图 ≈ 10.8cm/texel（近景阴影清晰）。
   v1 曾把范围扩到 ±500m → 2048/1000 ≈ 0.49m/texel，阴影严重模糊。
   v2 改为 ±140m（覆盖建筑近景 + 街道纵深），far=500 保持覆盖，
   阴影精度 2048/280 ≈ 7.3cm/texel。
   通过 __enhance.register 注册（优先级30）
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

  function init() {
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

      // 阴影范围：±140m（略大于原±95，保留清晰近景阴影；避免v1的±500m精度灾难）
      if (typeof sun !== 'undefined' && sun.shadow) {
        sun.shadow.camera.near = 1;
        sun.shadow.camera.far = 500;
        sun.shadow.camera.left = -140;
        sun.shadow.camera.right = 140;
        sun.shadow.camera.top = 140;
        sun.shadow.camera.bottom = -140;
        sun.shadow.bias = -0.0006;
        sun.shadow.normalBias = 0.035;
        sun.shadow.camera.updateProjectionMatrix();
      }

      console.log('[Performance] 性能优化完成 - 纹理各向异性16x + 阴影范围±140m(保持近景清晰阴影，2048贴图≈7.3cm/texel)');
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