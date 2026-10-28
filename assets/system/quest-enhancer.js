/* ============================================================
   任务系统增强 v2.0
   主线任务、支线任务、任务追踪
   ============================================================ */

const QuestSystemEnhancer = {
  
  quests: {},
  
  completedQuests: [],
  
  trackedQuest: null,
  
  questPanel: null,
  
  init() {
    this.createQuestPanel();
    this.loadQuests();
    console.log('[Quest] 任务系统初始化完成');
  },
  
  createQuestPanel() {
    this.questPanel = document.createElement('div');
    this.questPanel.style.cssText = `
      position: absolute;
      right: 20px;
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
    
    document.body.appendChild(this.questPanel);
  },
  
  loadQuests() {
    this.addQuest({
      id: 'main_001',
      type: 'main',
      title: '初入长安',
      description: '来到长安城，感受这座伟大城市的气息',
      objectives: [
        { id: 'visit_bright_gate', description: '参观明德门', completed: false },
        { id: 'walk_zhuque_avenue', description: '走过朱雀大街', completed: false },
      ],
      rewards: {
        exp: 100,
        gold: 50,
      }
    });
    
    this.addQuest({
      id: 'main_002',
      type: 'main',
      title: '诗圣足迹',
      description: '寻访长安城的诗人们',
      objectives: [
        { id: 'meet_dufu', description: '拜访杜甫', completed: false },
        { id: 'meet_li_taibai', description: '拜访李白', completed: false },
      ],
      rewards: {
        exp: 200,
        gold: 100,
      }
    });
    
    this.addQuest({
      id: 'side_001',
      type: 'side',
      title: '雁塔题名',
      description: '在大雁塔下题名留念',
      objectives: [
        { id: 'visit_big_wild_goose_pagoda', description: '参观大雁塔', completed: false },
      ],
      rewards: {
        exp: 50,
        gold: 20,
      }
    });
  },
  
  addQuest(quest) {
    this.quests[quest.id] = quest;
    console.log('[Quest] 新任务:', quest.title);
  },
  
  updateObjective(questId, objectiveId) {
    const quest = this.quests[questId];
    if (!quest) return;
    
    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (objective && !objective.completed) {
      objective.completed = true;
      console.log('[Quest] 任务目标完成:', objective.description);
      
      if (quest.objectives.every(o => o.completed)) {
        this.completeQuest(questId);
      }
    }
  },
  
  completeQuest(questId) {
    const quest = this.quests[questId];
    if (!quest) return;
    
    quest.completed = true;
    this.completedQuests.push(questId);
    
    console.log('[Quest] 任务完成:', quest.title);
    console.log('[Quest] 获得奖励:', quest.rewards);
    
    this.showQuestCompleteNotification(quest);
  },
  
  showQuestCompleteNotification(quest) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 100px;
      background: rgba(0, 100, 0, 0.9);
      color: #ffffff;
      padding: 15px 30px;
      border-radius: 8px;
      font-family: serif;
      font-size: 16px;
      border: 2px solid #ffd700;
    `;
    
    notification.innerHTML = `
      <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">任务完成！</div>
      <div>${quest.title}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  },
  
  showQuestPanel() {
    if (this.questPanel.style.display === 'none') {
      this.questPanel.style.display = 'block';
      this.updateQuestPanel();
    } else {
      this.questPanel.style.display = 'none';
    }
  },
  
  updateQuestPanel() {
    let html = '<div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">任务日志</div>';
    
    for (const questId in this.quests) {
      const quest = this.quests[questId];
      if (quest.completed) continue;
      
      html += `
        <div style="margin-bottom: 10px; padding: 5px; background: rgba(0,0,0,0.2); border-radius: 4px;">
          <div style="font-weight: bold; color: ${quest.type === 'main' ? '#ffd700' : '#87ceeb'};">
            ${quest.type === 'main' ? '【主线】' : '【支线】'} ${quest.title}
          </div>
          <div style="font-size: 12px; margin: 5px 0;">${quest.description}</div>
          <div style="font-size: 12px;">
      `;
      
      quest.objectives.forEach(obj => {
        html += `
          <div style="color: ${obj.completed ? '#888888' : '#ffffff'};">
            ${obj.completed ? '✓' : '○'} ${obj.description}
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    }
    
    this.questPanel.innerHTML = html;
  }
};

window.QuestSystemEnhancer = QuestSystemEnhancer;

console.log('[Quest] 任务系统增强模块加载完成');
