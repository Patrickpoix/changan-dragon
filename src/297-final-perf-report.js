/* ============================================================
   最终性能指标报告
   输出当前游戏的性能数据
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initFinalPerfReport() {
    if (initialized) return;
    initialized = true;

    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║          《龙游长安》性能指标报告                ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');

    try {
      // 场景统计
      if (typeof scene !== 'undefined') {
        let meshCount = 0;
        let triangleCount = 0;
        
        scene.traverse((obj) => {
          if (obj.isMesh) {
            meshCount++;
            if (obj.geometry) {
              const pos = obj.geometry.attributes.position;
              if (pos) triangleCount += pos.count / 3;
            }
          }
        });
        
        console.log('📊 场景统计:');
        console.log('   - Mesh 数量:', meshCount);
        console.log('   - 三角形数量:', Math.round(triangleCount).toLocaleString());
      }

      // 渲染器统计
      if (typeof renderer !== 'undefined') {
        console.log('');
        console.log('🎨 渲染器:');
        console.log('   - 像素比:', renderer.getPixelRatio());
        console.log('   - 尺寸:', renderer.domElement.width + ' x ' + renderer.domElement.height);
        console.log('   - 阴影映射:', renderer.shadowMap.enabled ? '启用' : '禁用');
        console.log('   - 色调映射:', renderer.toneMapping === 4 ? 'ACES Filmic' : '其他');
      }

      // 灯光统计
      if (typeof scene !== 'undefined') {
        const lights = scene.children.filter(c => c.isLight);
        console.log('');
        console.log('💡 灯光:');
        console.log('   - 灯光总数:', lights.length);
      }

      console.log('');
      console.log('🎯 性能目标:');
      console.log('   - 桌面端: 60 FPS');
      console.log('   - 移动端: 30 FPS');
      console.log('');

    } catch(e) {
      console.warn('[FinalPerfReport] 性能指标报告失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initFinalPerfReport, 198000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
