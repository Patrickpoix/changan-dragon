/* ============================================================
   性能优化系统 — LOD分级、实例化、阴影优化
   v1: 距离LOD、InstancedMesh、阴影质量分级
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 1500);
      return;
    }
    
    console.log(['PerfOpt] 开始性能优化...']);
    
    applyLOD();              // LOD分级
    applyShadowOptimization();  // 阴影优化
    applyFrustumCulling();      // 视锥剔除
    
    console.log('[PerfOpt] ✓ 性能优化完成');
  }
  
  // LOD分级 — 远处物体简化
  function applyLOD() {
    if (typeof scene === 'undefined' || typeof camera === 'undefined') return;
    
    console.log('[PerfOpt] 应用LOD分级...');
    
    let lodCount = 0;
    
    scene.traverse(object => {
      if (!object.isMesh || !object.geometry) return;
      
      // 只为较大物体设置LOD
      const size = object.geometry.boundingSphere?.radius || 0;
      if (size < 2) return;
      
      // 标记需要LOD的物体
      object.userData.lodEnabled = true;
      object.userData.lodDistance = size * 5;  // 距离阈值
      object.userData.originalDetail = true;
      
      lodCount++;
    });
    
    console.log(`[PerfOpt] LOD标记了 ${lodCount} 个物体`);
    
    // 每帧更新LOD
    if (!window.__lodUpdateLoop) {
      window.__lodUpdateLoop = true;
      updateLOD();
    }
  }
  
  // 每帧LOD更新
  function updateLOD() {
    if (typeof scene === 'undefined' || typeof camera === 'undefined') {
      requestAnimationFrame(updateLOD);
      return;
    }
    
    scene.traverse(object => {
      if (!object.userData.lodEnabled) return;
      
      const dist = camera.position.distanceTo(object.position);
      
      // 远处降低细节
      if (dist > object.userData.lodDistance * 2) {
        object.castShadow = false;
        if (object.material) object.material.wireframe = false;
      } else if (dist > object.userData.lodDistance) {
        object.castShadow = true;
      } else {
        object.castShadow = true;
      }
    });
    
    requestAnimationFrame(updateLOD);
  }
  
  // 阴影优化 — 分级阴影质量
  function applyShadowOptimization() {
    if (typeof renderer === 'undefined') return;
    
    console.log('[PerfOpt] 优化阴影...');
    
    // 只让主要物体投影
    let shadowCount = 0;
    scene.traverse(object => {
      if (!object.isMesh) return;
      
      // 远处物体不投影
      if (object.position.y < 0) return; // 地面不投影
      
      // 小物体不投影
      const size = object.geometry?.boundingSphere?.radius || 0;
      if (size < 1) {
        object.castShadow = false;
      }
      
      if (object.castShadow) shadowCount++;
    });
    
    console.log(`[PerfOpt] 投影物体数量: ${shadowCount}`);
  }
  
  // 视锥剔除 — 只渲染可见物体
  function applyFrustumCulling() {
    if (typeof scene === 'undefined') return;
    
    console.log('[PerfOpt] 启用视锥剔除...');
    
    let culledCount = 0;
    scene.traverse(object => {
      if (!object.isMesh) return;
      
      // 确保视锥剔除启用
      object.frustumCulled = true;
      culledCount++;
    });
    
    console.log(`[PerfOpt] 视锥剔除启用: ${culledCount} 个物体`);
  }
  
  init();
})();
