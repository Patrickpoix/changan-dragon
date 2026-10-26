/* ============================================================
   Performance - 性能优化Owner
   负责：DPR/阴影/LOD/渲染优化
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

      // 移动端DPR限制
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      const maxDPR = isMobile ? 1.25 : 1.65;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));

      // 阴影优化：使用原引擎的sun对象
      if (typeof sun !== 'undefined' && sun.shadow) {
        sun.shadow.mapSize.width = isMobile ? 1024 : 2048;
        sun.shadow.mapSize.height = isMobile ? 1024 : 2048;
        sun.shadow.camera.near = 10;
        sun.shadow.camera.far = 800;
        sun.shadow.camera.left = -400;
        sun.shadow.camera.right = 400;
        sun.shadow.camera.top = 400;
        sun.shadow.camera.bottom = -400;
        sun.shadow.bias = -0.0006;
      }

      // 纹理各向异性过滤
      const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      if (typeof TEX !== 'undefined') {
        Object.values(TEX).forEach(tex => {
          tex.anisotropy = maxAnisotropy;
          tex.needsUpdate = true;
        });
      }

      // 渲染优化：启用视锥剔除（默认已启用，这里显式设置确保）
      if (typeof scene !== 'undefined') {
        scene.traverse(obj => {
          if (obj.isMesh) {
            obj.frustumCulled = true;
          }
        });
      }

      // 加载统计信息
      const stats = {
        isMobile: isMobile,
        maxDPR: maxDPR,
        pixelRatio: renderer.getPixelRatio(),
        maxAnisotropy: maxAnisotropy,
      };
      console.log('[Performance] 性能优化完成', stats);
    } catch(e) { console.warn('[Performance] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 20000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();
