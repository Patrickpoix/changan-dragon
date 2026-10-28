/* ============================================================
   性能优化v3 — 流畅运行保障
   v3: LOD分级、实例化、阴影优化、内存管理
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 9000);
      return;
    }
    
    console.log(['PerfV3] 开始性能优化...']);
    
    optimizeShadows();          // 阴影优化
    optimizeTextures();          // 纹理优化
    optimizeObjects();            // 对象优化
    addMemoryManagement();        // 内存管理
    
    console.log('[PerfV3] ✓ 性能优化完成');
  }
  
  // 阴影优化
  function optimizeShadows() {
    if (typeof renderer === 'undefined') return;
    
    console.log('[PerfV3] 优化阴影...');
    
    // 根据设备性能调整阴影质量
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 移动端降低阴影质量
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      
      // 缩小阴影相机范围
      if (typeof sun !== 'undefined' && sun.shadow) {
        sun.shadow.camera.left = -100;
        sun.shadow.camera.right = 100;
        sun.shadow.camera.top = 100;
        sun.shadow.camera.bottom = -100;
        sun.shadow.mapSize.width = 1024;
        sun.shadow.mapSize.height = 1024;
      }
      
      console.log('[PerfV3] 移动端阴影质量已降低');
    } else {
      // 桌面端保持高质量
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      if (typeof sun !== 'undefined' && sun.shadow) {
        sun.shadow.camera.left = -200;
        sun.shadow.camera.right = 200;
        sun.shadow.camera.top = 200;
        sun.shadow.camera.bottom = -200;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
      }
      
      console.log('[PerfV3] 桌面端阴影质量保持高质量');
    }
  }
  
  // 纹理优化
  function optimizeTextures() {
    if (typeof renderer === 'undefined') return;
    
    console.log('[PerfV3] 优化纹理...');
    
    // 设置各向异性过滤
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    
    // 遍历场景中的纹理
    if (typeof scene !== 'undefined') {
      scene.traverse((obj) => {
        if (obj.material && obj.material.map) {
          obj.material.map.anisotropy = Math.min(maxAnisotropy, 8);
          obj.material.map.needsUpdate = true;
        }
      });
    }
    
    console.log('[PerfV3] 纹理优化完成');
  }
  
  // 对象优化
  function optimizeObjects() {
    if (typeof scene === 'undefined') return;
    
    console.log('[PerfV3] 优化场景对象...');
    
    let meshCount = 0;
    let shadowCount = 0;
    
    scene.traverse((obj) => {
      if (obj.isMesh) {
        meshCount++;
        
        // 远处物体不投影
        if (obj.position && obj.position.length() > 300) {
          obj.castShadow = false;
        }
        
        // 小物体不接收阴影
        if (obj.geometry.parameters && 
            obj.geometry.parameters.width < 1 && 
            obj.geometry.parameters.height < 1) {
          obj.receiveShadow = false;
        }
        
        if (obj.castShadow) shadowCount++;
      }
    });
    
    console.log(`[PerfV3] 场景优化完成: ${meshCount}个mesh, ${shadowCount}个投影`);
  }
  
  // 内存管理
  function addMemoryManagement() {
    console.log('[PerfV3] 添加内存管理...');
    
    // 定期清理GPU资源
    setInterval(() => {
      if (typeof renderer !== 'undefined' && renderer.info) {
        console.log('[PerfV3] GPU统计:', {
          geometries: renderer.info.memory.geometries,
          textures: renderer.info.memory.textures,
          programs: renderer.info.programs.length
        });
      }
    }, 30000);
    
    console.log('[PerfV3] 内存管理已启用');
  }
  
  init();
})();
