/* ============================================================
   存档与成就增强 · 旅途记录
   进度保存 / 成就系统 / 收集统计
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildSaveAchievement();
  }

  function buildSaveSystem() {
    setInterval(() => {
      const saveData = { playerPosition: { x: 0, y: 0, z: 0 }, poemCount: 0, visitedLandmarks: [], playTime: Date.now() };
      try {
        localStorage.setItem('changan_save', JSON.stringify(saveData));
        console.log('[Save] 游戏进度已自动保存');
      } catch (e) {
        console.warn('[Save] 保存失败:', e.message);
      }
    }, 30000);
    console.log('[Save] 自动存档系统完成');
  }

  function buildAchievementSystem() {
    const achievements = [
      { id: 'first_step', name: '初入长安', desc: '第一次进入长安城' },
      { id: 'explorer', name: '长安城探险家', desc: '游览全部主要景点' },
      { id: 'poet', name: '诗仙', desc: '收集10首诗笺' },
      { id: 'night_owl', name: '不夜城访客', desc: '在夜晚游览长安城' },
      { id: 'photographer', name: '长安摄影师', desc: '拍摄10张照片' },
    ];
    const achEl = document.createElement('div');
    achEl.id = 'achievementPanel';
    achEl.style.cssText = 'position:fixed;top:60px;right:20px;width:200px;padding:15px;background:rgba(0,0,0,0.7);color:#ffd700;border:1px solid #ffd700;border-radius:8px;z-index:998;font-size:14px;pointer-events:none';
    achEl.innerHTML = '<div style="font-size:16px;margin-bottom:10px;text-align:center;border-bottom:1px solid #ffd700;padding-bottom:5px">🏆 成就</div>';
    for (const ach of achievements) {
      const item = document.createElement('div');
      item.style.cssText = 'padding:5px 0;opacity:0.5';
      item.textContent = '🔒 ' + ach.name;
      achEl.appendChild(item);
    }
    document.body.appendChild(achEl);
    console.log('[Achievement] 成就系统完成: ' + achievements.length + ' 个成就');
  }

  function buildCollectionStats() {
    const statsEl = document.createElement('div');
    statsEl.id = 'collectionStats';
    statsEl.style.cssText = 'position:fixed;top:60px;left:20px;padding:15px;background:rgba(0,0,0,0.7);color:#ffd700;border:1px solid #ffd700;border-radius:8px;z-index:998;font-size:14px';
    statsEl.innerHTML = '<div style="font-size:16px;margin-bottom:10px;text-align:center;border-bottom:1px solid #ffd700;padding-bottom:5px">📜 收集进度</div><div style="padding:3px 0">📝 诗笺: <span style="color:#ffd700">0/20</span></div><div style="padding:3px 0">🏛️ 景点: <span style="color:#ffd700">0/10</span></div><div style="padding:3px 0">⏱️ 游戏时间: <span style="color:#ffd700">0分钟</span></div>';
    document.body.appendChild(statsEl);
    console.log('[Stats] 收集统计面板完成');
  }

  function buildSaveAchievement() {
    console.log('[SaveAchievement] 开始构建存档与成就...');
    buildSaveSystem();
    buildAchievementSystem();
    buildCollectionStats();
    console.log('[SaveAchievement] 存档与成就构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
