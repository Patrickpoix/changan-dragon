/* ============================================================
   电影级视觉核心
   Cinematic Visual Core: 统一提升整体画面质量
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    console.log(['CinematicCore] 开始电影级视觉优化...']);
    
    enhanceLighting();
    enhanceMaterials();
    enhanceAtmosphere();
    enhancePostProcessing();
    
    console.log('[CinematicCore] ✓ 电影级视觉优化完成');
  }
  
  // 光照增强 — 更柔和的全局光照
  function enhanceLighting() {
    if (typeof scene === 'undefined') return;
    
    console.log('[CinematicCore] 优化光照...');
    
    // 太阳光 — 更暖更柔
    if (typeof sun !== 'undefined') {
      sun.color.setHex(0xffe8c8);
      sun.intensity = 2.0;
      
      // 阴影质量提升
      if (sun.shadow) {
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 500;
        sun.shadow.camera.left = -200;
        sun.shadow.camera.right = 200;
        sun.shadow.camera.top = 200;
        sun.shadow.camera.bottom = -200;
        sun.shadow.bias = -0.001;
      }
    }
    
    // 环境光 — 更柔和
    if (typeof ambient !== 'undefined') {
      ambient.color.setHex(0xfff4e0);
      ambient.intensity = 0.5;
    }
    
    // 半球光 — 天空地面色彩
    if (typeof hemi !== 'undefined') {
      hemi.color.setHex(0xfff8e8);
      hemi.groundColor.setHex(0x8a7a6a);
      hemi.intensity = 0.6;
    }
    
    console.log('[CinematicCore] 光照优化完成');
  }
  
  // 材质增强 — PBR质感
  function enhanceMaterials() {
    if (typeof scene === 'undefined') return;
    
    console.log('[CinematicCore] 优化材质...');
    
    // 遍历场景材质，统一优化
    let enhanced = 0;
    scene.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        
        mats.forEach(mat => {
          // 提升粗糙度变化
          if (mat.roughness !== undefined) {
            mat.roughness = Math.min(1, Math.max(0.2, mat.roughness + 0.1));
          }
          
          // 提升金属度
          if (mat.metalness !== undefined) {
            mat.metalness = Math.min(1, Math.max(0, mat.metalness));
          }
          
          // 环境反射强度
          if (mat.envMapIntensity !== undefined) {
            mat.envMapIntensity = 0.8;
          }
          
          mat.needsUpdate = true;
          enhanced++;
        });
      }
    });
    
    console.log(`[CinematicCore] 材质优化完成: ${enhanced}个材质`);
  }
  
  // 大气氛围 — 雾效和天空
  function enhanceAtmosphere() {
    if (typeof scene === 'undefined') return;
    
    console.log('[CinematicCore] 优化大气氛围...');
    
    // 雾效 — 更有层次感
    if (scene.fog) {
      scene.fog.color.setHex(0xd8c8b0);
      scene.fog.near = 50;
      scene.fog.far = 1000;
    }
    
    // 天空背景色 — 渐变感
    scene.background = new THREE.Color(0x87b8e0);
    
    console.log('[CinematicCore] 大气氛围优化完成');
  }
  
  // 后处理增强
  function enhancePostProcessing() {
    if (typeof renderer === 'undefined') return;
    
    console.log('[CinematicCore] 优化后处理...');
    
    // 色调映射 — ACES电影级
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    
    // 输出色彩空间
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    console.log('[CinematicCore] 后处理优化完成');
  }
  
  // 注册到统一生命周期
  if (typeof window.__enhance !== 'undefined') {
    window.__enhance.register('cinematic-core', init, 5);
  } else if (typeof window.__enhancePending !== 'undefined') {
    window.__enhancePending.push({ owner: 'cinematic-core', fn: init, priority: 5 });
  } else {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      init();
    } else {
      setTimeout(init, 1000);
    }
  }
})();
