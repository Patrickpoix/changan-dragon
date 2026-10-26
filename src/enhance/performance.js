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

      // DPR限制（平衡画质与性能）
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      const maxDPR = isMobile ? 1.5 : 2.0;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));

      // 阴影优化：使用原引擎的sun对象
      if (typeof sun !== 'undefined' && sun.shadow) {
        sun.shadow.mapSize.width = isMobile ? 2048 : 4096;
        sun.shadow.mapSize.height = isMobile ? 2048 : 4096;
        sun.shadow.camera.near = 10;
        sun.shadow.camera.far = 1000;
        sun.shadow.camera.left = -500;
        sun.shadow.camera.right = 500;
        sun.shadow.camera.top = 500;
        sun.shadow.camera.bottom = -500;
        sun.shadow.bias = -0.0005;
      }

      // 纹理各向异性过滤
      const maxAnisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
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
      console.log('[Performance] 性能优化完成 - DPR(移动1.5/桌面2.0)+阴影(移动2048/桌面4096)+各向异性16x+视锥剔除');
    } catch(e) { console.warn('[Performance] 初始化失败:', e); }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) setTimeout(init, 20000);
    else setTimeout(checkReady, 300);
  }
  checkReady();
})();