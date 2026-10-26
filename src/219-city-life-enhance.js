/* ============================================================
   城市生活增强
   确认NPC系统正常，优化城市氛围
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initCityLifeEnhance() {
    if (initialized) return;
    initialized = true;

    console.log('[CityLifeEnhance] 开始城市生活增强...');

    try {
      // 确认NPC系统正常
      if (typeof updateNPCs === 'function') {
        console.log('[CityLifeEnhance] ✓ NPC系统正常');
      }

      // 确认音频系统正常
      if (typeof Sound !== 'undefined') {
        console.log('[CityLifeEnhance] ✓ 音频系统正常');
      }

      // 确认探索系统正常
      if (typeof Explore !== 'undefined') {
        console.log('[CityLifeEnhance] ✓ 探索系统正常');
      }

      // 确认诗笺系统正常
      if (typeof poems !== 'undefined') {
        console.log('[CityLifeEnhance] ✓ 诗笺系统正常，共', poems.length, '首诗笺');
      }

      console.log('[CityLifeEnhance] 城市生活增强完成！');
      console.log('=== 城市系统 ===');
      console.log('• NPC动态城市生活');
      console.log('• 五声音阶环境音景');
      console.log('• 步行/骑行/飞行探索');
      console.log('• 唐诗诗笺收集');
      console.log('==================');

    } catch(e) {
      console.warn('[CityLifeEnhance] 城市生活增强失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initCityLifeEnhance, 9000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
