/* ============================================================
   唐长安 · 国风电影质感统一优化
   仅调整现有系统参数，不新建独立系统
   正确接入现有引擎
   ============================================================ */

(function() {
  'use strict';

  let applied = false;

  function applyCinematicGrade() {
    if (applied) return;
    applied = true;

    console.log('[CinematicGrade] 开始国风电影质感统一优化...');

    try {
      // ==============================================
      // 1. 渲染管线优化（使用现有正确变量）
      // ==============================================
      if (typeof renderer !== 'undefined') {
        // ACES电影级色调映射（符合国风电影质感）
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        console.log('[CinematicGrade] 渲染色调映射已调整');
      }

      // ==============================================
      // 2. 雾效优化（国风薄雾感）
      // ==============================================
      if (typeof scene !== 'undefined' && scene.fog) {
        // 暖色调薄雾，符合国风意境
        scene.fog.color.setHex(0xdcd0b8);
        scene.fog.near = 180;
        scene.fog.far = 750;
        console.log('[CinematicGrade] 雾效已优化');
      }

      // ==============================================
      // 3. 光影微调（黄金时刻暖金色调）
      //    注意：只做微调，不覆盖昼夜系统
      // ==============================================
      if (typeof sun !== 'undefined') {
        // 暖金色调，符合国风电影质感
        sun.color.setHex(0xffd59a);
        // 强度微调（不覆盖昼夜系统的动态变化）
        // sun.intensity 保持由 updateDayNight() 控制
        console.log('[CinematicGrade] 主光源色调已微调');
      }

      if (typeof ambient !== 'undefined') {
        // 环境光更暖
        ambient.color.setHex(0xfff0dc);
        console.log('[CinematicGrade] 环境光色调已微调');
      }

      // ==============================================
      // 4. 性能确认（不破坏现有性能策略）
      // ==============================================
      if (typeof renderer !== 'undefined') {
        // 保持现有DPR策略，不擅自提高
        // renderer.setPixelRatio 保持由现有性能模块控制
        console.log('[CinematicGrade] 性能策略保持现有配置');
      }

      console.log('[CinematicGrade] 国风电影质感统一优化完成！');
      console.log('=== 优化原则 ===');
      console.log('1. 仅调整现有系统参数，不新建独立系统');
      console.log('2. 使用正确的全局变量名（sun/ambient/scene/renderer）');
      console.log('3. 不覆盖昼夜系统的动态变化');
      console.log('4. 保持现有性能策略');
      console.log('5. 国风电影质感：暖金色调 + 薄雾 + ACES色调映射');
      console.log('==================');

    } catch(e) {
      console.warn('[CinematicGrade] 优化应用失败:', e);
    }
  }

  // 轮询等待游戏完全加载
  function checkGameReady() {
    // 检查所有必要的全局对象都已存在
    if (typeof GAME !== 'undefined' && GAME.ready && 
        typeof scene !== 'undefined' && 
        typeof renderer !== 'undefined' &&
        typeof sun !== 'undefined') {
      // 延迟1秒执行，确保所有场景都已构建完成
      setTimeout(applyCinematicGrade, 1000);
    } else {
      setTimeout(checkGameReady, 300);
    }
  }

  // 启动检查
  checkGameReady();

})();
