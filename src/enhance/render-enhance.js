/* ============================================================
   光影渲染增强 — 电影级画质
   v1: 阴影、后处理、色彩分级、Bloom
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Render] 开始增强光影渲染效果...']);
    
    enhanceShadows();
    enhancePostProcessing();
    enhanceColorGrading();
    enhanceAtmosphere();
    
    console.log('[Render] ✓ 光影渲染效果增强完成');
  }
  
  // 阴影增强
  function enhanceShadows() {
    if (typeof renderer === 'undefined') return;
    
    // 提高阴影质量
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 太阳阴影
    if (typeof sun !== 'undefined') {
      sun.castShadow = true;
      sun.shadow.mapSize.width = 4096;
      sun.shadow.mapSize.height = 4096;
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 2000;
      sun.shadow.camera.left = -500;
      sun.shadow.camera.right = 500;
      sun.shadow.camera.top = 500;
      sun.shadow.camera.bottom = -500;
      sun.shadow.bias = -0.001;
    }
  }
  
  // 后处理增强
  function enhancePostProcessing() {
    if (typeof GameRendering === 'undefined') return;
    
    // 增加Bloom效果
    if (GameRendering.composer) {
      // 调整Bloom参数
      if (GameRendering.bloomPass) {
        GameRendering.bloomPass.strength = 0.5;
        GameRendering.bloomPass.radius = 0.4;
        GameRendering.bloomPass.threshold = 0.8;
      }
      
      // 调整SAO
      if (GameRendering.saoPass) {
        GameRendering.saoPass.params.saoBias = 0.5;
        GameRendering.saoPass.params.saoIntensity = 0.12;
        GameRendering.saoPass.params.saoScale = 10;
      }
    }
  }
  
  // 色彩分级
  function enhanceColorGrading() {
    if (typeof renderer === 'undefined') return;
    
    // ACES电影级色调映射
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    
    // 输出颜色空间
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  
  // 大气效果
  function enhanceAtmosphere() {
    if (typeof scene === 'undefined') return;
    
    // 雾效
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.0008);
    
    // 环境光
    if (typeof ambient !== 'undefined') {
      ambient.intensity = 0.6;
      ambient.color.setHex(0xfff5e6);
    }
    
    // 半球光
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.4);
    scene.add(hemiLight);
  }
  
  init();
})();
