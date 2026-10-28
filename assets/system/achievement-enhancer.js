/* ============================================================
   成就系统增强 v2.0
   成就解锁、成就展示、成就奖励
   ============================================================ */

const AchievementSystemEnhancer = {
  
  achievements: {
    'first_step': {
      id: 'first_step',
      name: '初来乍到',
      description: '第一次踏上长安城的土地',
      icon: '👣',
      category: 'exploration',
      unlocked: false,
    },
    'explore_all_landmarks': {
      id: 'explore_all_landmarks',
      name: '遍访长安',
      description: '参观所有主要地标',
      icon: '🏛️',
      category: 'exploration',
      unlocked: false,
    },
    'walk_zhuque_avenue': {
      id: 'walk_zhuque_avenue',
      name: '朱雀大街',
      description: '走过朱雀大街',
      icon: '🛤️',
      category: 'exploration',
      unlocked: false,
    },
    'collect_first_poem': {
      id: 'collect_first_poem',
      name: '诗笺初得',
      description: '收集第一张诗笺',
      icon: '📜',
      category: 'collection',
      unlocked: false,
    },
    'collect_all_poems': {
      id: 'collect_all_poems',
      name: '诗仙全集',
      description: '收集所有诗笺',
      icon: '📚',
      category: 'collection',
      unlocked: false,
    },
    'visit_market': {
      id: 'visit_market',
      name: '东市西市',
      description: '参观长安东西两市',
      icon: '🏪',
      category: 'life',
      unlocked: false,
    },
    'night_owl': {
      id: 'night_owl',
      name: '不夜城',
      description: '在夜晚游览长安城',
      icon: '🌙',
      category: 'life',
      unlocked: false,
    },
  },
  
  unlockedAchievements: [],
  
  achievementPanel: null,
  
  init() {
    this.createAchievementPanel();
    console.log('[Achievement] 成就系统初始化完成');
  },
  
  createAchievementPanel() {
    this.achievementPanel = document.createElement('div');
    this.achievementPanel.style.cssText = `
      position: absolute;
      left: 20px;
      top: 100px;
      width: 250px;
      max-height: 400px;
      background: rgba(139, 69, 19, 0.9);
      border: 2px solid #d4af37;
      border-radius: 8px;
      padding: 10px;
      color: #ffd700;
      font-family: serif;
      font-size: 14px;
      overflow-y: auto;
      display: none;
    `;
    
    document.body.appendChild(this.achievementPanel);
  },
  
  unlockAchievement(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement) return;
    
    if (achievement.unlocked) {
      console.log('[Achievement] 成就已解锁:', achievement.name);
      return;
    }
    
    achievement.unlocked = true;
    this.unlockedAchievements.push(achievementId);
    
    console.log('[Achievement] 解锁成就:', achievement.name);
    
    this.showAchievementNotification(achievement);
  },
  
  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 200px;
      background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
      color: #000000;
      padding: 15px 30px;
      border-radius: 8px;
      font-family: serif;
      font-size: 16px;
      border: 3px solid #ffd700;
      box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
    `;
    
    notification.innerHTML = `
      <div style="font-size: 24px; text-align: center; margin-bottom: 5px;">${achievement.icon}</div>
      <div style="font-size: 18px; font-weight: bold; text-align: center;">成就解锁！</div>
      <div style="font-size: 16px; text-align: center; margin-top: 5px;">${achievement.name}</div>
      <div style="font-size: 12px; text-align: center; margin-top: 5px; opacity: 0.8;">${achievement.description}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transition = 'opacity 1s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 1000);
    }, 3000);
  },
  
  showAchievementPanel() {
    if (this.achievementPanel.style.display === 'none') {
      this.achievementPanel.style.display = 'block';
      this.updateAchievementPanel();
    } else {
      this.achievementPanel.style.display = 'none';
    }
  },
  
  updateAchievementPanel() {
    let html = `
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
        成就 (${this.unlockedAchievements.length}/${Object.keys(this.achievements).length})
      </div>
    `;
    
    const categories = {
      exploration: '探索',
      collection: '收集',
      life: '生活',
    };
    
    for (const category in categories) {
      html += `<div style="font-size: 16px; font-weight: bold; margin-top: 10px; margin-bottom: 5px;">${categories[category]}</div>`;
      
      for (const id in this.achievements) {
        const achievement = this.achievements[id];
        if (achievement.category !== category) continue;
        
        html += `
          <div style="display: flex; align-items: center; padding: 5px; margin-bottom: 3px; background: rgba(0,0,0,0.2); border-radius: 4px; opacity: ${achievement.unlocked ? '1' : '0.5'};">
            <div style="font-size: 20px; margin-right: 10px;">${achievement.icon}</div>
            <div>
              <div style="font-weight: bold;">${achievement.name}</div>
              <div style="font-size: 12px; opacity: 0.8;">${achievement.description}</div>
            </div>
          </div>
        `;
      }
    }
    
    this.achievementPanel.innerHTML = html;
  }
};

window.AchievementSystemEnhancer = AchievementSystemEnhancer;

console.log('[Achievement] 成就系统增强模块加载完成');
