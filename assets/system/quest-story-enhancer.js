/* ============================================================
   主线支线任务剧情对话故事背景系统增强 v2.0
   主线任务、支线任务、剧情对话、故事背景
   ============================================================ */

const QuestStoryEnhancer = {
  
  mainQuests: [
    {
      id: 'main_1',
      name: '初入长安',
      desc: '你来到了伟大的长安城，开始你的传奇之旅。',
      objective: '前往明德门',
      reward: { exp: 100, gold: 50, item: '新手剑' },
      completed: false,
      currentStep: 0,
    },
    {
      id: 'main_2',
      name: '遇见李白',
      desc: '在曲江池边，你遇见了诗仙李白。',
      objective: '与李白对话',
      reward: { exp: 200, gold: 100, item: '诗仙的笔记' },
      completed: false,
      currentStep: 0,
    },
    {
      id: 'main_3',
      name: '大雁塔之行',
      desc: '玄奘法师从西天取经归来，你前往大雁塔拜见。',
      objective: '前往大雁塔',
      reward: { exp: 500, gold: 300, item: '佛经一卷' },
      completed: false,
      currentStep: 0,
    },
  ],
  
  sideQuests: [
    {
      id: 'side_1',
      name: '寻找丢失的猫',
      desc: '王大娘的猫不见了，请你帮忙寻找。',
      objective: '找到王大娘的猫',
      reward: { exp: 50, gold: 20 },
      completed: false,
    },
    {
      id: 'side_2',
      name: '送一封信',
      desc: '帮李书生把一封信送到西市的张老板手中。',
      objective: '把信送到西市',
      reward: { exp: 80, gold: 30 },
      completed: false,
    },
  ],
  
  dialogues: {
    'li_bai': [
      { speaker: '李白', text: '贤弟，你也来曲江池赏景？' },
      { speaker: '我', text: '是的，久闻诗仙大名，今日得见，真是荣幸。' },
      { speaker: '李白', text: '哈哈，过奖了。来，共饮一杯！' },
    ],
  },
  
  questPanel: null,
  
  currentTab: 'main',
  
  init() {
    this.createQuestPanel();
    console.log('[Quest] 主线支线任务剧情对话故事背景系统初始化完成');
  },
  
  createQuestPanel() {
    this.questPanel = document.createElement('div');
    this.questPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 700px;
      max-height: 600px;
      background: rgba(139, 69, 19, 0.98);
      border: 3px solid #d4af37;
      border-radius: 12px;
      padding: 20px;
      color: #ffd700;
      font-family: serif;
      font-size: 14px;
      overflow-y: auto;
      display: none;
      z-index: 2000;
      box-shadow: 0 8px 32px rgba(0,0,0,0.8);
    `;
    
    document.body.appendChild(this.questPanel);
  },
  
  showQuestPanel() {
    this.renderQuestPanel();
    this.questPanel.style.display = 'block';
  },
  
  closeQuestPanel() {
    this.questPanel.style.display = 'none';
  },
  
  renderQuestPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        📜 任务与剧情
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
        <button onclick="QuestStoryEnhancer.setTab('main')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'main' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'main' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          主线任务 (${this.mainQuests.filter(q => !q.completed).length})
        </button>
        <button onclick="QuestStoryEnhancer.setTab('side')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'side' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'side' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          支线任务 (${this.sideQuests.filter(q => !q.completed).length})
        </button>
      </div>
    `;
    
    if (this.currentTab === 'main') {
      this.mainQuests.forEach(quest => {
        html += `
          <div style="padding: 15px; margin-bottom: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; border-left: 4px solid #d4af37;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-weight: bold; color: #d4af37; font-size: 16px;">${quest.name}</div>
              ${quest.completed ? '<span style="color: #4CAF50; font-size: 12px;">✓ 已完成</span>' : '<span style="color: #ff6b6b; font-size: 12px;">进行中</span>'}
            </div>
            <div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">${quest.desc}</div>
            <div style="font-size: 12px; opacity: 0.7; margin-bottom: 8px;">目标：${quest.objective}</div>
            <div style="font-size: 12px; opacity: 0.6;">
              奖励：经验 ${quest.reward.exp} · 金币 ${quest.reward.gold} · ${quest.reward.item}
            </div>
          </div>
        `;
      });
    } else {
      this.sideQuests.forEach(quest => {
        html += `
          <div style="padding: 12px; margin-bottom: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #4CAF50;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <div style="font-weight: bold; color: #8bc34a;">${quest.name}</div>
              ${quest.completed ? '<span style="color: #4CAF50; font-size: 12px;">✓ 已完成</span>' : '<span style="color: #ff6b6b; font-size: 12px;">进行中</span>'}
            </div>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 6px;">${quest.desc}</div>
            <div style="font-size: 11px; opacity: 0.6;">
              目标：${quest.objective} · 奖励：经验 ${quest.reward.exp} · 金币 ${quest.reward.gold}
            </div>
          </div>
        `;
      });
    }
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="QuestStoryEnhancer.closeQuestPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.questPanel.innerHTML = html;
  },
  
  setTab(tab) {
    this.currentTab = tab;
    this.renderQuestPanel();
  }
};

window.QuestStoryEnhancer = QuestStoryEnhancer;

console.log('[Quest] 主线支线任务剧情对话故事背景系统增强模块加载完成');
