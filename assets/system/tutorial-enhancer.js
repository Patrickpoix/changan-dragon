/* ============================================================
   新手引导系统增强 v2.0
   新手教程、提示气泡、引导步骤
   ============================================================ */

const TutorialSystemEnhancer = {
  
  steps: [
    {
      id: 'welcome',
      title: '欢迎来到龙游长安',
      text: '欢迎来到伟大的长安城！这里是大唐的国都，世界上最繁华的城市。',
      position: { x: 0, y: 5, z: 0 },
    },
    {
      id: 'movement',
      title: '移动',
      text: '使用WASD键移动，鼠标旋转视角。按Shift可以跑步。',
      position: { x: 0, y: 5, z: 10 },
    },
    {
      id: 'fly_mode',
      title: '飞行模式',
      text: '按F键切换到飞行模式，可以自由飞翔，欣赏长安城的美景！',
      position: { x: 0, y: 20, z: 0 },
    },
    {
      id: 'interact',
      title: '交互',
      text: '点击建筑或NPC可以查看信息。走近发光的诗笺可以收集它们。',
      position: { x: 50, y: 5, z: 0 },
    },
    {
      id: 'map',
      title: '地图',
      text: '按M键打开大地图，可以看到长安城的全貌和各个地标位置。',
      position: { x: 0, y: 5, z: -50 },
    },
    {
      id: 'quests',
      title: '任务',
      text: '按J键打开任务日志，可以查看当前任务和目标。',
      position: { x: 100, y: 5, z: 0 },
    },
    {
      id: 'explore',
      title: '自由探索',
      text: '好了，现在开始自由探索长安城吧！祝你旅途愉快！',
      position: { x: 0, y: 5, z: 0 },
    },
  ],
  
  currentStep: 0,
  
  tutorialPanel: null,
  
  completed: false,
  
  init() {
    this.createTutorialPanel();
    
    const hasPlayed = localStorage.getItem('changan_tutorial_completed');
    if (!hasPlayed) {
      console.log('[Tutorial] 检测到第一次游玩，开始新手引导');
      this.startTutorial();
    } else {
      console.log('[Tutorial] 已完成新手引导，跳过');
      this.completed = true;
    }
  },
  
  createTutorialPanel() {
    this.tutorialPanel = document.createElement('div');
    this.tutorialPanel.style.cssText = `
      position: absolute;
      left: 50%;
      bottom: 100px;
      transform: translateX(-50%);
      width: 400px;
      background: rgba(139, 69, 19, 0.95);
      border: 2px solid #d4af37;
      border-radius: 12px;
      padding: 20px;
      color: #ffd700;
      font-family: serif;
      font-size: 14px;
      display: none;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    
    document.body.appendChild(this.tutorialPanel);
  },
  
  startTutorial() {
    this.currentStep = 0;
    this.showStep();
  },
  
  showStep() {
    if (this.currentStep >= this.steps.length) {
      this.completeTutorial();
      return;
    }
    
    const step = this.steps[this.currentStep];
    
    this.tutorialPanel.style.display = 'block';
    this.tutorialPanel.innerHTML = `
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; text-align: center;">
        ${step.title}
      </div>
      <div style="margin-bottom: 15px; line-height: 1.6;">
        ${step.text}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 12px; opacity: 0.7;">
          步骤 ${this.currentStep + 1} / ${this.steps.length}
        </div>
        <div style="display: flex; gap: 10px;">
          <button onclick="TutorialSystemEnhancer.skipTutorial()" style="padding: 8px 16px; background: rgba(0,0,0,0.3); border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">
            跳过
          </button>
          <button onclick="TutorialSystemEnhancer.nextStep()" style="padding: 8px 16px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
            ${this.currentStep === this.steps.length - 1 ? '完成' : '下一步'}
          </button>
        </div>
      </div>
    `;
    
    if (window.GAME) {
      GAME.playerPosition = { ...step.position };
    }
  },
  
  nextStep() {
    this.currentStep++;
    this.showStep();
  },
  
  skipTutorial() {
    this.completeTutorial();
  },
  
  completeTutorial() {
    this.tutorialPanel.style.display = 'none';
    this.completed = true;
    
    localStorage.setItem('changan_tutorial_completed', 'true');
    
    console.log('[Tutorial] 新手引导完成');
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('欢迎来到长安', '开始你的探索之旅吧！');
    }
  },
  
  replayTutorial() {
    localStorage.removeItem('changan_tutorial_completed');
    this.startTutorial();
  }
};

window.TutorialSystemEnhancer = TutorialSystemEnhancer;

console.log('[Tutorial] 新手引导系统增强模块加载完成');
