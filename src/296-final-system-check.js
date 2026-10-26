/* ============================================================
   最终系统总验收
   对整个《龙游长安》做一次完整的系统检查
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initFinalSystemCheck() {
    if (initialized) return;
    initialized = true;

    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║          《龙游长安》最终系统总验收              ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');

    try {
      // 1. 场景检查
      if (typeof scene !== 'undefined') {
        console.log('✅ 场景系统: OK');
        console.log('   - 对象总数:', scene.children.length);
      } else {
        console.log('❌ 场景系统: FAIL');
      }

      // 2. 渲染器检查
      if (typeof renderer !== 'undefined') {
        console.log('✅ 渲染器: OK');
        console.log('   - 像素比:', renderer.getPixelRatio());
        console.log('   - 阴影映射:', renderer.shadowMap.enabled ? '启用' : '禁用');
        console.log('   - 色调映射:', renderer.toneMapping);
      } else {
        console.log('❌ 渲染器: FAIL');
      }

      // 3. 灯光检查
      if (typeof sun !== 'undefined' && typeof ambient !== 'undefined') {
        console.log('✅ 灯光系统: OK (sun + ambient)');
      } else {
        console.log('❌ 灯光系统: FAIL');
      }

      // 4. 材质库检查
      if (typeof MAT !== 'undefined') {
        console.log('✅ 材质库: OK');
      } else {
        console.log('❌ 材质库: FAIL');
      }

      // 5. 游戏状态检查
      if (typeof GAME !== 'undefined') {
        console.log('✅ 游戏状态: OK');
        console.log('   - ready:', GAME.ready);
        console.log('   - started:', GAME.started);
      } else {
        console.log('❌ 游戏状态: FAIL');
      }

      // 6. 相机检查
      if (typeof camera !== 'undefined') {
        console.log('✅ 相机: OK');
      } else {
        console.log('❌ 相机: FAIL');
      }

      console.log('');
      console.log('╔══════════════════════════════════════════════════╗');
      console.log('║        验收完成 · 梦回盛唐 · 龙游长安            ║');
      console.log('╚══════════════════════════════════════════════════╝');
      console.log('');

    } catch(e) {
      console.warn('[FinalSystemCheck] 最终系统总验收失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initFinalSystemCheck, 196000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
