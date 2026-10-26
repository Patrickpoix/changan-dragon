/* ============================================================
   唐长安 · 国风电影级视觉系统
   基于核心引擎的系统性视觉提升
   不重复造轮子，只优化现有系统
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initCinematicSystem() {
    if (initialized) return;
    initialized = true;

    console.log('[CinematicSystem] 开始国风电影级视觉系统初始化...');

    // ==============================================
    // 1. 渲染管线确认与优化
    // ==============================================
    try {
      if (typeof renderer !== 'undefined') {
        // ACES电影级色调映射
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        // 保持现有DPR策略
        console.log('[CinematicSystem] 渲染管线已优化');
      }
    } catch(e) {
      console.warn('[CinematicSystem] 渲染管线优化失败:', e);
    }

    // ==============================================
    // 2. 国风雾效系统
    // ==============================================
    try {
      if (typeof scene !== 'undefined' && scene.fog) {
        // 暖色调薄雾，符合国风意境
        scene.fog.color.setHex(0xd8c8b0);
        scene.fog.near = 200;
        scene.fog.far = 800;
        console.log('[CinematicSystem] 雾效系统已优化');
      }
    } catch(e) {
      console.warn('[CinematicSystem] 雾效优化失败:', e);
    }

    // ==============================================
    // 3. 光影系统微调（不覆盖昼夜系统）
    // ==============================================
    try {
      if (typeof sun !== 'undefined') {
        // 暖金色调，符合国风电影质感
        sun.color.setHex(0xffd59a);
        // 强度由昼夜系统动态控制，这里只微调色调
        console.log('[CinematicSystem] 主光源色调已优化');
      }

      if (typeof ambient !== 'undefined') {
        ambient.color.setHex(0xfff0dc);
        console.log('[CinematicSystem] 环境光色调已优化');
      }

      if (typeof hemi !== 'undefined') {
        hemi.color.setHex(0xfff3d8);
        hemi.groundColor.setHex(0x6a8a7a);
        console.log('[CinematicSystem] 半球光已优化');
      }
    } catch(e) {
      console.warn('[CinematicSystem] 光影优化失败:', e);
    }

    // ==============================================
    // 4. 核心地标视觉确认
    // ==============================================
    try {
      // 确认核心地标都已正确加载
      if (typeof GAME !== 'undefined' && GAME.landmarks) {
        console.log('[CinematicSystem] 核心地标数量:', Object.keys(GAME.landmarks).length);
      }
    } catch(e) {
      console.warn('[CinematicSystem] 地标检查失败:', e);
    }

    console.log('[CinematicSystem] 国风电影级视觉系统初始化完成！');
    console.log('=== 系统特性 ===');
    console.log('• ACES电影级色调映射');
    console.log('• 国风暖雾效果');
    console.log('• 黄金时刻暖金色光影');
    console.log('• 与昼夜系统无缝兼容');
    console.log('• 不重复造轮子，基于核心引擎');
    console.log('==================');
  }

  // 轮询等待游戏完全加载
  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready && 
        typeof scene !== 'undefined' && 
        typeof renderer !== 'undefined' &&
        typeof sun !== 'undefined') {
      setTimeout(initCinematicSystem, 1500);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
