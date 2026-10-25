/* ============================================================
   视觉色彩优化 · 国风电影色调
   暖金日光 + 青灰雾霭 + 朱砂点缀
   ============================================================ */

const ColorGrading = {
  // 调整天空色调
  tweakSky() {
    if (!skyUniforms) return;
    // 更暖的地平线（落日金）
    skyUniforms.horizonColor.value.setHex(0xf5d5a8);
    // 更青的天顶（水墨蓝）
    skyUniforms.topColor.value.setHex(0x6a9ab8);
    // 更暖的太阳
    skyUniforms.sunColor.value.setHex(0xffb84d);
  },

  // 调整雾效
  tweakFog() {
    if (!scene.fog) return;
    // 更柔和的雾，带暖色调
    scene.fog.color.setHex(0xd8c8b0);
    scene.fog.near = 120;
    scene.fog.far = 650;
  },

  // 调整光照
  tweakLights() {
    // 主光更暖（夕阳金）
    sun.color.setHex(0xffd4a0);
    sun.intensity = 1.6;
    sun.position.set(100, 80, 60);
    
    // 半球光更暖
    hemi.color.setHex(0xfff0d0);
    hemi.groundColor.setHex(0x5a7a6a);
    hemi.intensity = 0.7;
    
    // 环境光
    ambient.color.setHex(0xffe8d0);
    ambient.intensity = 0.25;
    
    // 轮廓光更暖橙
    rim.color.setHex(0xffa870);
    rim.intensity = 0.3;
  },

  // 调整渲染参数
  tweakRender() {
    if (typeof GameRendering !== 'undefined') {
      // 稍高的曝光，让画面更通透
      GameRendering.setExposure(1.12);
      // 环境光强度稍降，突出主光
      GameRendering.setEnvironmentIntensity(0.42);
    }
  },

  // 整体调色
  apply() {
    this.tweakSky();
    this.tweakFog();
    this.tweakLights();
    this.tweakRender();
    console.log('[ColorGrading] 国风电影色调已应用');
  },
};

// 启动时应用
if (typeof GAME !== 'undefined') {
  const origReady = GAME.ready;
  Object.defineProperty(GAME, 'ready', {
    set(v) {
      origReady = v;
      if (v) ColorGrading.apply();
    },
    get() { return origReady; }
  });
}
