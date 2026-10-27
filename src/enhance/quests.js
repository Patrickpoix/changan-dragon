/* ============================================================
   任务系统增强 — 长安行记
   v1: 主线任务、支线任务、日常任务
   ============================================================ */

(function() {
  'use strict';
  
  let quests = [];
  let activeQuest = null;
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Quests] 开始增强任务系统...']);
    
    loadQuests();
    setupQuestLog();
    addMainQuests();
    
    console.log('[Quests] ✓ 任务系统增强完成');
  }
  
  // 加载任务
  function loadQuests() {
    try {
      const saved = localStorage.getItem('changan-dragon-quests');
      if (saved) {
        quests = JSON.parse(saved);
        console.log('[Quests] 任务已加载，共 ' + quests.length + ' 个任务');
      }
    } catch(e) {
      console.warn('[Quests] 加载任务失败', e);
    }
  }
  
  // 保存任务
  function saveQuests() {
    try {
      localStorage.setItem('changan-dragon-quests', JSON.stringify(quests));
    } catch(e) {
      console.warn('[Quests] 保存任务失败', e);
    }
  }
  
  // 任务日志
  function setupQuestLog() {
    // J键打开任务日志
    document.addEventListener('keydown', (e) => {
      if (e.key === 'j' || e.key === 'J') {
        showQuestLog();
      }
    });
    
    console.log('[Quests] 任务日志已就绪，按J打开');
  }
  
  // 添加主线任务
  function addMainQuests() {
    const mainQuests = [
      {
        id: 'quest-1',
        name: '初入长安',
        description: '从明德门进入长安城，感受盛唐气象。',
        objective: '到达朱雀大街',
        target: { x: 0, z: 100 },
        reward: { exp: 100, gold: 50 },
        status: 'active'
      },
      {
        id: 'quest-2',
        name: '雁塔题名',
        description: '前往大慈恩寺，登上大雁塔，一览长安风光。',
        objective: '到达大雁塔',
        target: { x: 300, z: 420 },
        reward: { exp: 200, gold: 100 },
        status: 'locked'
      },
      {
        id: 'quest-3',
        name: '曲江流饮',
        description: '前往曲江池，与文人雅士一同赏花饮酒。',
        objective: '到达曲江池',
        target: { x: 520, z: 470 },
        reward: { exp: 300, gold: 150 },
        status: 'locked'
      },
      {
        id: 'quest-4',
        name: '大明宫觐见',
        description: '前往大明宫，感受皇宫的宏伟壮丽。',
        objective: '到达大明宫',
        target: { x: 320, z: -460 },
        reward: { exp: 500, gold: 300 },
        status: 'locked'
      }
    ];
    
    // 添加未完成的任务
    mainQuests.forEach(q => {
      if (!quests.find(x => x.id === q.id)) {
        quests.push(q);
      }
    });
    
    saveQuests();
    console.log('[Quests] 主线任务已加载，共 ' + mainQuests.length + ' 个');
  }
  
  // 显示任务日志
  function showQuestLog() {
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
    
    let questsHTML = '';
    quests.forEach(quest => {
      let statusColor = '#999';
      if (quest.status === 'active') statusColor = '#44ff44';
      else if (quest.status === 'completed') statusColor = '#4488ff';
      else if (quest.status === 'locked') statusColor = '#666';
      
      questsHTML += `
        <div style="padding: 15px; margin: 10px 0; background: rgba(139, 69, 19, 0.2); border-left: 4px solid ${statusColor}; border-radius: 4px;">
          <h4 style="color: #ffd700; margin-bottom: 5px;">${quest.name}</h4>
          <p style="color: #ccc; font-size: 14px; margin-bottom: 8px;">${quest.description}</p>
          <p style="color: #999; font-size: 12px;">目标: ${quest.objective}</p>
          <p style="color: #ffd700; font-size: 12px; margin-top: 5px;">奖励: ${quest.reward.exp}经验, ${quest.reward.gold}铜钱</p>
        </div>
      `;
    });
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px; font-family: serif;">📜 任务日志</h3>
      <div style="max-height: 400px; overflow-y: auto;">
        ${questsHTML}
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <button id="closeQuestsBtn" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closeQuestsBtn').onclick = () => {
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
    setTimeout(() => toast.remove(), 3000);
  }
  
  init();
  
  // 暴露给其他模块
  window.GameQuests = {
    getQuests: () => [...quests],
    completeQuest: (id) => {
      const quest = quests.find(q => q.id === id);
      if (quest) {
        quest.status = 'completed';
        saveQuests();
        showToast('任务完成: ' + quest.name);
      }
    }
  };
})();
