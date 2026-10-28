/* ============================================================
   唐代诗词歌赋鉴赏系统增强 v2.0
   诗词、歌赋、鉴赏、收集
   ============================================================ */

const PoetrySystemEnhancer = {
  
  poems: [
    {
      id: 'poem_001',
      title: '《静夜思》',
      author: '李白',
      content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
      discovered: false,
      location: '曲江池',
    },
    {
      id: 'poem_002',
      title: '《春晓》',
      author: '孟浩然',
      content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
      discovered: false,
      location: '兴庆宫',
    },
    {
      id: 'poem_003',
      title: '《登鹳雀楼》',
      author: '王之涣',
      content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
      discovered: false,
      location: '大雁塔',
    },
    {
      id: 'poem_004',
      title: '《相思》',
      author: '王维',
      content: '红豆生南国，春来发几枝。愿君多采撷，此物最相思。',
      discovered: false,
      location: '西市',
    },
    {
      id: 'poem_005',
      title: '《绝句》',
      author: '杜甫',
      content: '两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。',
      discovered: false,
      location: '大明宫',
    },
  ],
  
  poetryPanel: null,
  
  init() {
    this.createPoetryPanel();
    console.log('[Poetry] 唐代诗词歌赋鉴赏系统初始化完成');
  },
  
  createPoetryPanel() {
    this.poetryPanel = document.createElement('div');
    this.poetryPanel.style.cssText = `
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
    
    document.body.appendChild(this.poetryPanel);
  },
  
  showPoetryPanel() {
    this.renderPoetryPanel();
    this.poetryPanel.style.display = 'block';
  },
  
  closePoetryPanel() {
    this.poetryPanel.style.display = 'none';
  },
  
  renderPoetryPanel() {
    let discoveredCount = this.poems.filter(p => p.discovered).length;
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        📜 唐诗鉴赏
        <span style="float: right; font-size: 16px; color: #d4af37;">${discoveredCount}/${this.poems.length}</span>
      </div>
    `;
    
    this.poems.forEach(poem => {
      html += `
        <div style="padding: 15px; margin-bottom: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${poem.discovered ? '#d4af37' : '#666'};">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: ${poem.discovered ? '#ffd700' : '#999'};">
            ${poem.discovered ? poem.title : '？？？'}
            <span style="float: right; font-size: 12px; opacity: 0.7;">${poem.discovered ? poem.author : ''}</span>
          </div>
          ${poem.discovered ? `
            <div style="font-size: 14px; line-height: 1.8; opacity: 0.9; margin-bottom: 8px; text-align: center; font-style: italic;">
              ${poem.content}
            </div>
            <div style="font-size: 11px; opacity: 0.6; text-align: right;">发现于: ${poem.location}</div>
          ` : '<div style="font-size: 12px; opacity: 0.5;">未发现</div>'}
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="PoetrySystemEnhancer.closePoetryPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.poetryPanel.innerHTML = html;
  },
  
  discoverPoem(poemId) {
    const poem = this.poems.find(p => p.id === poemId);
    if (!poem || poem.discovered) return;
    
    poem.discovered = true;
    
    console.log('[Poetry] 发现诗词:', poem.title);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('发现诗词！', `你发现了 ${poem.title}！${poem.author} 作`);
    }
    
    this.renderPoetryPanel();
  }
};

window.PoetrySystemEnhancer = PoetrySystemEnhancer;

console.log('[Poetry] 唐代诗词歌赋鉴赏系统增强模块加载完成');
