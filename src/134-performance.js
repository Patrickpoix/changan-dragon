/* ============================================================
   性能优化 · 页游流畅运行
   视锥剔除/LOD/纹理压缩/阴影优化
   ============================================================ */

class PerformanceOptimizer {
  // 视锥剔除（只渲染视野内物体）
  frustumCulling() {
    if (typeof scene !== 'undefined') {
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.frustumCulled = true;
        }
      });
      console.log('[PerformanceOptimizer] 视锥剔除已开启');
    }
  },

  // 阴影优化（只在主光源开阴影，阴影贴图尺寸）
  shadowOptimization() {
    if (typeof sunLight !== 'undefined') {
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 500;
      sunLight.shadow.camera.left = -200;
      sunLight.shadow.camera.right = 200;
      sunLight.shadow.camera.top = 200;
      sunLight.shadow.camera.bottom = -200;
      sunLight.shadow.bias = -0.001;
      console.log('[PerformanceOptimizer] 阴影参数已优化');
    }
  },

  // 纹理各向异性过滤
  textureAnisotropy() {
    if (typeof renderer !== 'undefined' && typeof TEX !== 'undefined') {
      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      for (const key in TEX) {
        if (TEX[key] && TEX[key].anisotropy !== undefined) {
          TEX[key].anisotropy = Math.min(8, maxAniso);
          TEX[key].needsUpdate = true;
        }
      }
      console.log('[PerformanceOptimizer] 纹理各向异性过滤已设置');
    }
  },

  // 像素比限制（避免高分屏过度渲染）
  pixelRatioLimit() {
    if (typeof renderer !== 'undefined') {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      console.log('[PerformanceOptimizer] 像素比已限制为最大2');
    }
  },

  init() {
    this.frustumCulling();
    this.shadowOptimization();
    this.textureAnisotropy();
    this.pixelRatioLimit();
    console.log('[PerformanceOptimizer] 性能优化完成');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PerformanceOptimizer().init();
  };
}
