/* ============================================================
   最终视觉整合 · 唐长安国风电影质感
   确保所有提升协同工作
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initFinalPolish() {
    if (initialized) return;
    initialized = true;

    console.log('[FinalPolish] 开始最终视觉整合...');

    try {
      // ==============================================
      // 1. 最终色调确认（国风电影感）
      // ==============================================
      // ACES电影级色调映射
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;

      // 暖金色调统一
      sun.color.setHex(0xffd090);
      sun.intensity = 1.75;

      // 薄雾国风
      scene.fog.color.setHex(0xd8c8b0);
      scene.fog.near = 160;
      scene.fog.far = 780;

      console.log('[FinalPolish] 最终色调确认完成');
    } catch(e) {
      console.warn('[FinalPolish] 色调调整失败:', e);
    }

    try {
      // ==============================================
      // 2. 性能优化确认
      // ==============================================
      // 像素比限制
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      // 阴影质量确认
      sun.shadow.mapSize.set(2048, 2048);

      console.log('[FinalPolish] 性能优化确认完成');
    } catch(e) {
      console.warn('[FinalPolish] 性能优化失败:', e);
    }

    console.log('[FinalPolish] 最终视觉整合完成！');
    console.log('=== 唐长安开放世界3D页游 · 国风电影质感 ===');
    console.log('核心建筑：大明宫/太极宫/兴庆宫/曲江池/大雁塔/小雁塔/朱雀大街');
    console.log('视觉风格：国风漫剧/电影画风');
    console.log('光影系统：黄金时刻暖金色 + 国风薄雾');
    console.log('=============================================');
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      // 延迟一点执行，确保其他模块先完成
      setTimeout(initFinalPolish, 1000);
    } else {
      setTimeout(checkReady, 500);
    }
  }

  checkReady();

})();
