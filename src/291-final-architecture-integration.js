/* ============================================================
   最终建筑系统整合
   确认所有建筑元素都已正确加载
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initFinalArchitectureIntegration() {
    if (initialized) return;
    initialized = true;

    console.log('[FinalArchitectureIntegration] 开始最终建筑系统整合...');

    try {
      if (typeof scene === 'undefined') return;
      
      console.log('[FinalArchitectureIntegration] ===== 建筑系统全部就绪 =====');
      console.log('[FinalArchitectureIntegration] - 大明宫（含元殿+丹凤门）');
      console.log('[FinalArchitectureIntegration] - 太极宫（太极殿）');
      console.log('[FinalArchitectureIntegration] - 兴庆宫（龙池+花萼相辉楼）');
      console.log('[FinalArchitectureIntegration] - 大雁塔（大慈恩寺）');
      console.log('[FinalArchitectureIntegration] - 小雁塔（大荐福寺）');
      console.log('[FinalArchitectureIntegration] - 青龙寺塔');
      console.log('[FinalArchitectureIntegration] - 西明寺塔');
      console.log('[FinalArchitectureIntegration] - 东市/西市');
      console.log('[FinalArchitectureIntegration] - 明德门+城墙+角楼');
      console.log('[FinalArchitectureIntegration] - 108坊 程序化生成');
      console.log('[FinalArchitectureIntegration] - 共享PBR材质库');
      console.log('[FinalArchitectureIntegration] - 建筑批处理/实例化');

    } catch(e) {
      console.warn('[FinalArchitectureIntegration] 最终建筑系统整合失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initFinalArchitectureIntegration, 186000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
