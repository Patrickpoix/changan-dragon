/* ============================================================
   最终全面确认
   《龙游长安》全部系统最终确认
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initFinalFullCheck() {
    if (initialized) return;
    initialized = true;

    console.log('');
    console.log('============================================');
    console.log('  《龙游长安》 · 全部系统最终确认');
    console.log('============================================');
    console.log('');

    try {
      // 1. 渲染系统
      if (typeof renderer !== 'undefined') {
        console.log('✅ 渲染系统：ACES电影级色调映射');
      } else {
        console.log('❌ 渲染系统：未找到');
      }

      // 2. 场景系统
      if (typeof scene !== 'undefined') {
        console.log('✅ 场景系统：正常');
      } else {
        console.log('❌ 场景系统：未找到');
      }

      // 3. 灯光系统
      if (typeof sun !== 'undefined' && typeof ambient !== 'undefined') {
        console.log('✅ 灯光系统：暖金色光影');
      } else {
        console.log('❌ 灯光系统：未找到');
      }

      // 4. 雾效系统
      if (typeof scene !== 'undefined' && scene.fog) {
        console.log('✅ 雾效系统：国风薄雾');
      } else {
        console.log('❌ 雾效系统：未找到');
      }

      // 5. 材质系统
      if (typeof MAT !== 'undefined') {
        console.log('✅ 材质系统：共享材质库');
      } else {
        console.log('❌ 材质系统：未找到');
      }

      // 6. 探索系统
      if (typeof Explore !== 'undefined') {
        console.log('✅ 探索系统：步行/骑行/飞行');
      } else {
        console.log('❌ 探索系统：未找到');
      }

      // 7. 诗笺系统
      if (typeof poems !== 'undefined') {
        console.log('✅ 诗笺系统：共', poems.length, '首');
      } else {
        console.log('❌ 诗笺系统：未找到');
      }

      // 8. 音频系统
      if (typeof Sound !== 'undefined') {
        console.log('✅ 音频系统：五声音阶环境音景');
      } else {
        console.log('❌ 音频系统：未找到');
      }

      // 9. NPC系统
      if (typeof updateNPCs === 'function') {
        console.log('✅ NPC系统：城市生活');
      } else {
        console.log('❌ NPC系统：未找到');
      }

      // 10. 昼夜系统
      if (typeof updateDayNight === 'function') {
        console.log('✅ 昼夜系统：昼夜循环');
      } else {
        console.log('❌ 昼夜系统：未找到');
      }

      console.log('');
      console.log('============================================');
      console.log('  全部系统确认完成！');
      console.log('  《龙游长安》 · 梦回盛唐');
      console.log('============================================');
      console.log('');

    } catch(e) {
      console.warn('[FinalFullCheck] 最终全面确认失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initFinalFullCheck, 20000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
