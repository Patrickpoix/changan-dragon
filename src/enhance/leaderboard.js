/* ============================================================
   排行榜系统增强 — 长安群英榜
   v1: 排行榜、排名、竞争
   ============================================================ */

(function() {
  'use strict';
  
  let leaderboard = [];
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Leaderboard] 开始增强排行榜系统...']);
    
    loadLeaderboard();
    setupLeaderboardUI();
    addDefaultEntries();
    
    console.log('[Leaderboard] ✓ 排行榜系统增强完成');
  }
  
  // 加载排行榜
  function loadLeaderboard() {
    try {
      const saved = localStorage.getItem('changan-dragon-leaderboard');
      if (saved) {
        leaderboard = JSON.parse(saved);
        console.log('[Leaderboard] 排行榜已加载，共 ' + leaderboard.length + ' 人');
      }
    } catch(e) {
      console.warn('[Leaderboard] 加载排行榜失败', e);
    }
  }
  
  // 保存排行榜
  function saveLeaderboard() {
    try {
      localStorage.setItem('changan-dragon-leaderboard', JSON.stringify(leaderboard));
    } catch(e) {
      console.warn('[Leaderboard] 保存排行榜失败', e);
    }
  }
  
  // 排行榜UI
  function setupLeaderboardUI() {
    // R键打开排行榜
    document.addEventListener('keydown', (e) => {
      if (e.key === 'r' || e.key === 'R') {
        showLeaderboard();
      }
    });
    
    console.log('[Leaderboard] 排行榜UI已就绪，按R打开');
  }
  
  // 添加默认排行榜
  function addDefaultEntries() {
    if (leaderboard.length === 0) {
      leaderboard = [
        { rank: 1, name: '李白', score: 10000, title: '诗仙' },
        { rank: 2, name: '杜甫', score: 9500, title: '诗圣' },
        { rank: 3, name: '王维', score: 9000, title: '诗佛' },
        { rank: 4, name: '白居易', score: 8500, title: '诗魔' },
        { rank: 5, name: '李商隐', score: 8000, title: '诗鬼' }
      ];
      saveLeaderboard();
      console.log('[Leaderboard] 已添加默认排行榜');
    }
  }
  
  // 显示排行榜
  function showLeaderboard() {
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.top = '50%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    menu.style.background = 'rgba(0, 0, 0, 0.95)';
    menu.style.border = '2px solid #8b4513';
    menu.style.borderRadius = '8px';
    menu.style.padding = '20px';
    menu.style.zIndex = '1000';
    menu.style.minWidth = '400px';
    
    let leaderboardHTML = '';
    leaderboard.forEach(entry => {
      const rankColor = entry.rank === 1 ? '#ffd700' : entry.rank === 2 ? '#c0c0c0' : entry.rank === 3 ? '#cd7f32' : '#ccc';
      
      leaderboardHTML += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin: 8px 0; background: rgba(139, 69, 19, 0.2); border-radius: 6px;">
          <span style="color: ${rankColor}; font-weight: bold; font-size: 18px; width: 40px;">第${entry.rank}名</span>
          <span style="color: #ffd700; flex: 1; margin: 0 15px;">${entry.name} <small style="color: #999;">${entry.title}</small></span>
          <span style="color: #ffd700;">${entry.score}分</span>
        </div>
      `;
    });
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px; font-family: serif;">🏆 长安群英榜</h3>
      <div style="max-height: 350px; overflow-y: auto;">
        ${leaderboardHTML}
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <button id="closeLeaderboardBtn" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closeLeaderboardBtn').onclick = () => {
      menu.remove();
    };
  }
  
  // 工具函数
  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'absolute';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = '#ffd700';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '1000';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
  
  init();
  
  // 暴露给其他模块
  window.GameLeaderboard = {
    addEntry: (name, score, title) => {
      leaderboard.push({ rank: leaderboard.length + 1, name: name, score: score, title: title });
      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard.forEach((entry, i) => entry.rank = i + 1);
      saveLeaderboard();
      showToast('上榜成功！');
    },
    getLeaderboard: () => [...leaderboard]
  };
})();
