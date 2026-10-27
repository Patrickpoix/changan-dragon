/* ============================================================
   成就系统增强 — 功成名就
   v1: 成就、称号、收集品
   ============================================================ */

(function() {
  'use strict';
  
  let achievements = [];
  let unlockedAchievements = [];
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Achievements] 开始增强成就系统...']);
    
    loadAchievements();
    setupAchievementUI();
    addAchievements();
    
    console.log('[Achievements] ✓ 成就系统增强完成');
  }
  
  // 加载成就
  function loadAchievements() {
    try {
      const saved = localStorage.getItem('changan-dragon-achievements');
      if (saved) {
        unlockedAchievements = JSON.parse(saved);
        console.log('[Achievements] 成就已加载，已解锁 ' + unlockedAchievements.length + ' 个');
      }
    } catch(e) {
      console.warn('[Achievements] 加载成就失败', e);
    }
  }
  
  // 保存成就
  function saveAchievements() {
    try {
      localStorage.setItem('changan-dragon-achievements', JSON.stringify(unlockedAchievements));
    } catch(e) {
      console.warn('[Achievements] 保存成就失败', e);
    }
  }
  
  // 成就UI
  function setupAchievementUI() {
    // C键打开成就
    document.addEventListener('keydown', (e) => {
      if (e.key === 'c' || e.key === 'C') {
        showAchievements();
      }
    });
    
    console.log('[Achievements] 成就UI已就绪，按C打开');
  }
  
  // 添加成就
  function addAchievements() {
    achievements = [
      {
        id: 'ach-1',
        name: '初入长安',
        description: '第一次进入长安城',
        icon: '🏯',
        condition: () => true
      },
      {
        id: 'ach-2',
        name: '雁塔题名',
        description: '登上大雁塔',
        icon: '🗼',
        condition: () => false
      },
      {
        id: 'ach-3',
        name: '曲江流饮',
        description: '游览曲江池',
        icon: '🌸',
        condition: () => false
      },
      {
        id: 'ach-4',
        name: '大明宫觐见',
        description: '参观大明宫',
        icon: '🏛️',
        condition: () => false
      },
      {
        id: 'ach-5',
        name: '诗仙附体',
        description: '收集10首诗笺',
        icon: '📜',
        condition: () => false
      },
      {
        id: 'ach-6',
        name: '飞行达人',
        description: '累计飞行1小时',
        icon: '✈️',
        condition: () => false
      },
      {
        id: 'ach-7',
        name: '美食家',
        description: '品尝长安城所有美食',
        icon: '🍜',
        condition: () => false
      },
      {
        id: 'ach-8',
        name: '夜猫子',
        description: '在长安城度过一个夜晚',
        icon: '🌙',
        condition: () => false
      }
    ];
    
    console.log('[Achievements] 成就已添加，共 ' + achievements.length + ' 个');
  }
  
  // 解锁成就
  function unlockAchievement(id) {
    if (unlockedAchievements.includes(id)) return;
    
    unlockedAchievements.push(id);
    saveAchievements();
    
    const ach = achievements.find(a => a.id === id);
    if (ach) {
      showToast('成就解锁: ' + ach.icon + ' ' + ach.name);
      console.log('[Achievements] 解锁成就: ' + ach.name);
    }
  }
  
  // 显示成就
  function showAchievements() {
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
    menu.style.minWidth = '450px';
    
    let achievementsHTML = '';
    achievements.forEach(ach => {
      const unlocked = unlockedAchievements.includes(ach.id);
      const opacity = unlocked ? '1' : '0.4';
      
      achievementsHTML += `
        <div style="display: flex; align-items: center; padding: 12px; margin: 8px 0; background: rgba(139, 69, 19, 0.2); border-radius: 6px; opacity: ${opacity};">
          <span style="font-size: 24px; margin-right: 15px;">${ach.icon}</span>
          <div>
            <h4 style="color: #ffd700; margin-bottom: 3px;">${ach.name}</h4>
            <p style="color: #ccc; font-size: 13px;">${ach.description}</p>
          </div>
        </div>
      `;
    });
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px; font-family: serif;">🏆 成就 (${unlockedAchievements.length}/${achievements.length})</h3>
      <div style="max-height: 400px; overflow-y: auto;">
        ${achievementsHTML}
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <button id="closeAchBtn" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closeAchBtn').onclick = () => {
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
    toast.style.background = 'rgba(255, 215, 0, 0.9)';
    toast.style.color = '#000';
    toast.style.padding = '12px 25px';
    toast.style.borderRadius = '6px';
    toast.style.zIndex = '1000';
    toast.style.fontWeight = 'bold';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
  
  init();
  
  // 暴露给其他模块
  window.GameAchievements = {
    unlock: unlockAchievement,
    getUnlocked: () => [...unlockedAchievements]
  };
})();
