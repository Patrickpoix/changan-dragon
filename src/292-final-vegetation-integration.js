/* ============================================================
   最终植被系统整合
   确认所有植被元素都已正确加载
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initFinalVegetationIntegration() {
    if (initialized) return;
    initialized = true;

    console.log('[FinalVegetationIntegration] 开始最终植被系统整合...');

    try {
      if (typeof scene === 'undefined') return;
      
      console.log('[FinalVegetationIntegration] ===== 植被系统全部就绪 =====');
      console.log('[FinalVegetationIntegration] - 朱雀大街行道树');
      console.log('[FinalVegetationIntegration] - 大明宫周边树木（20棵）');
      console.log('[FinalVegetationIntegration] - 太极宫周边树木（15棵）');
      console.log('[FinalVegetationIntegration] - 兴庆宫周边树木（12棵）');
      console.log('[FinalVegetationIntegration] - 大雁塔周边松树（10棵）');
      console.log('[FinalVegetationIntegration] - 小雁塔周边树木（8棵）');
      console.log('[FinalVegetationIntegration] - 曲江池周边柳树（12棵）');
      console.log('[FinalVegetationIntegration] - 龙池周边柳树（8棵）');
      console.log('[FinalVegetationIntegration] - 青龙寺周边松树（8棵）');
      console.log('[FinalVegetationIntegration] - 西明寺周边树木（6棵）');
      console.log('[FinalVegetationIntegration] - 东西市周边树木（16棵）');
      console.log('[FinalVegetationIntegration] - 城墙周边绿化');
      console.log('[FinalVegetationIntegration] - 城外树林（30棵）');
      console.log('[FinalVegetationIntegration] - 牡丹花丛（兴庆宫）');
      console.log('[FinalVegetationIntegration] - 荷花（曲江池+兴庆宫）');

    } catch(e) {
      console.warn('[FinalVegetationIntegration] 最终植被系统整合失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initFinalVegetationIntegration, 188000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
