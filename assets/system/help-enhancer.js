/* ============================================================
   帮助系统增强 v2.0
   新手引导、操作说明、常见问题
   ============================================================ */

const HelpSystemEnhancer = {
  
  helpPanel: null,
  
  currentPage: 'main',
  
  pages: {
    main: {
      title: '帮助',
      content: `
        <div style="margin-bottom: 15px;">
          <h3>欢迎来到《龙游长安》</h3>
          <p>这是一座以盛唐长安城为原型的3D开放世界游戏。</p>
        </div>
        <div style="margin-bottom: 10px;">
          <button onclick="HelpSystemEnhancer.showPage('controls')" style="display: block; width: 100%; padding: 10px; margin-bottom: 5px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">操作说明</button>
          <button onclick="HelpSystemEnhancer.showPage('gameplay')" style="display: block; width: 100%; padding: 10px; margin-bottom: 5px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">游戏玩法</button>
          <button onclick="HelpSystemEnhancer.showPage('landmarks')" style="display: block; width: 100%; padding: 10px; margin-bottom: 5px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">名胜古迹</button>
          <button onclick="HelpSystemEnhancer.showPage('faq')" style="display: block; width: 100%; padding: 10px; margin-bottom: 5px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">常见问题</button>
        </div>
      `
    },
    controls: {
      title: '操作说明',
      content: `
        <div style="margin-bottom: 15px;">
          <h3>移动控制</h3>
          <p><b>WASD</b> — 移动</p>
          <p><b>鼠标</b> — 旋转视角</p>
          <p><b>Shift</b> — 跑步</p>
          <p><b>空格</b> — 跳跃</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h3>模式切换</h3>
          <p><b>F</b> — 步行/飞行模式切换</p>
          <p><b>滚轮</b> — 飞行时上升/下降</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h3>交互</h3>
          <p><b>点击</b> — 与景点/NPC交互</p>
          <p><b>M</b> — 打开地图</p>
          <p><b>J</b> — 打开任务日志</p>
          <p><b>C</b> — 打开成就</p>
          <p><b>H</b> — 打开帮助</p>
        </div>
        <button onclick="HelpSystemEnhancer.showPage('main')" style="padding: 8px 16px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">返回</button>
      `
    },
    gameplay: {
      title: '游戏玩法',
      content: `
        <div style="margin-bottom: 15px;">
          <h3>探索长安城</h3>
          <p>自由探索这座伟大的城市，参观著名的历史地标。</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h3>收集诗笺</h3>
          <p>在长安城各处收集散落的诗笺，了解唐代诗歌文化。</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h3>完成任务</h3>
          <p>接受各种任务，了解长安城的故事和历史。</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h3>解锁成就</h3>
          <p>探索、收集、完成各种挑战，解锁成就称号。</p>
        </div>
        <button onclick="HelpSystemEnhancer.showPage('main')" style="padding: 8px 16px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">返回</button>
      `
    },
    landmarks: {
      title: '名胜古迹',
      content: `
        <div style="margin-bottom: 15px;">
          <h3>明德门</h3>
          <p>长安城的正南门，是隋唐长安外郭城正门。</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h3>朱雀大街</h3>
          <p>长安城的中轴线，宽达150米，是当时世界上最宽的街道。</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h3>大明宫</h3>
          <p>唐代皇宫，含元殿是其正殿。</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h3>大雁塔</h3>
          <p>玄奘法师为存放从印度带回的经像而建。</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h3>曲江池</h3>
          <p>长安著名的风景名胜区，文人雅士聚集之地。</p>
        </div>
        <button onclick="HelpSystemEnhancer.showPage('main')" style="padding: 8px 16px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">返回</button>
      `
    },
    faq: {
      title: '常见问题',
      content: `
        <div style="margin-bottom: 15px;">
          <h3>Q: 如何飞行？</h3>
          <p>A: 按F键切换到飞行模式，然后用WASD移动，滚轮控制上升下降。</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h3>Q: 如何收集诗笺？</h3>
          <p>A: 走近发光的诗笺，点击即可收集。</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h3>Q: 游戏进度如何保存？</h3>
          <p>A: 游戏会自动保存，也可以手动按Esc打开设置查看。</p>
        </div>
        <div style="margin-bottom: 15px;">
          <h3>Q: 为什么画面很卡？</h3>
          <p>A: 按Esc打开设置，降低画质或关闭一些特效。</p>
        </div>
        <button onclick="HelpSystemEnhancer.showPage('main')" style="padding: 8px 16px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">返回</button>
      `
    }
  },
  
  init() {
    this.createHelpPanel();
    this.setupKeyboardShortcut();
    console.log('[Help] 帮助系统初始化完成');
  },
  
  createHelpPanel() {
    this.helpPanel = document.createElement('div');
    this.helpPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      max-height: 600px;
      background: rgba(139, 69, 19, 0.95);
      border: 2px solid #d4af37;
      border-radius: 12px;
      padding: 20px;
      color: #ffd700;
      font-family: serif;
      font-size: 14px;
      overflow-y: auto;
      display: none;
      z-index: 1000;
    `;
    
    document.body.appendChild(this.helpPanel);
  },
  
  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'h' || e.key === 'H') {
        this.toggleHelp();
      }
    });
  },
  
  toggleHelp() {
    if (this.helpPanel.style.display === 'none') {
      this.showHelp();
    } else {
      this.closeHelp();
    }
  },
  
  showHelp() {
    this.helpPanel.style.display = 'block';
    this.showPage('main');
  },
  
  closeHelp() {
    this.helpPanel.style.display = 'none';
  },
  
  showPage(pageName) {
    this.currentPage = pageName;
    const page = this.pages[pageName];
    
    this.helpPanel.innerHTML = `
      <div style="font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
        ${page.title}
      </div>
      ${page.content}
    `;
  }
};

window.HelpSystemEnhancer = HelpSystemEnhancer;

console.log('[Help] 帮助系统增强模块加载完成');
