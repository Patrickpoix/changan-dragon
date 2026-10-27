/* ============================================================
   交互与UI增强 · 沉浸体验
   提示信息 / 收集反馈 / 导航指引
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildUIEnhancement();
  }

  function buildLandmarkTips() {
    const landmarks = [
      { name: '大明宫', x: 150, z: -400, radius: 50 },
      { name: '大雁塔', x: 216, z: 283, radius: 40 },
      { name: '小雁塔', x: -216, z: 349, radius: 30 },
      { name: '曲江池', x: 354, z: 318, radius: 60 },
      { name: '东市', x: 174, z: -14, radius: 40 },
      { name: '西市', x: -258, z: -14, radius: 40 },
      { name: '朱雀大街', x: 0, z: 0, radius: 30 },
    ];
    const tipEl = document.createElement('div');
    tipEl.id = 'landmarkTip';
    tipEl.style.cssText = 'position:fixed;top:15%;left:50%;transform:translateX(-50%);padding:12px 24px;background:rgba(0,0,0,0.7);color:#ffd700;font-size:20px;font-family:KaiTi,STKaiti,serif;border:1px solid #ffd700;border-radius:4px;pointer-events:none;opacity:0;transition:opacity 0.5s;z-index:1000;text-shadow:0 0 10px rgba(255,215,0,0.5)';
    document.body.appendChild(tipEl);
    setInterval(() => {
      if (typeof camera === 'undefined') return;
      const px = camera.position.x;
      const pz = camera.position.z;
      let nearLandmark = null;
      for (const lm of landmarks) {
        const dx = px - lm.x;
        const dz = pz - lm.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < lm.radius) { nearLandmark = lm; break; }
      }
      if (nearLandmark) {
        tipEl.textContent = '🏮 ' + nearLandmark.name + ' 🏮';
        tipEl.style.opacity = '1';
      } else {
        tipEl.style.opacity = '0';
      }
    }, 500);
    console.log('[UI] 景点提示系统完成');
  }

  function buildCollectionFeedback() {
    const collectEl = document.createElement('div');
    collectEl.id = 'collectFeedback';
    collectEl.style.cssText = 'position:fixed;top:30%;left:50%;transform:translateX(-50%) scale(0.5);padding:20px 40px;background:rgba(255,215,0,0.9);color:#8b0000;font-size:24px;font-family:KaiTi,STKaiti,serif;border-radius:8px;pointer-events:none;opacity:0;transition:all 0.5s;z-index:1001;box-shadow:0 0 30px rgba(255,215,0,0.8)';
    collectEl.textContent = '✨ 拾取诗笺！✨';
    document.body.appendChild(collectEl);
    console.log('[UI] 收集反馈系统完成');
  }

  function buildMiniMap() {
    const mapEl = document.createElement('div');
    mapEl.id = 'miniMap';
    mapEl.style.cssText = 'position:fixed;bottom:20px;right:20px;width:120px;height:120px;background:rgba(0,0,0,0.6);border:2px solid #ffd700;border-radius:50%;pointer-events:none;z-index:999';
    const playerDot = document.createElement('div');
    playerDot.style.cssText = 'position:absolute;top:50%;left:50%;width:8px;height:8px;background:#ffd700;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 10px #ffd700';
    mapEl.appendChild(playerDot);
    document.body.appendChild(mapEl);
    console.log('[UI] 小地图完成');
  }

  function buildUIEnhancement() {
    console.log('[UI] 开始构建UI增强...');
    buildLandmarkTips();
    buildCollectionFeedback();
    buildMiniMap();
    console.log('[UI] UI增强完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
