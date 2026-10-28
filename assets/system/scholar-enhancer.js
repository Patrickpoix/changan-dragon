/* ============================================================
   唐代科举文人系统增强 v2.0
   文人、诗会、雅集、科举
   ============================================================ */

const ScholarSystemEnhancer = {
  
  scholars: [
    {
      id: 'scholar_001',
      name: '李白',
      style: '浪漫主义',
      desc: '诗仙，斗酒诗百篇，豪放飘逸',
      location: '曲江池',
      friendship: 0,
    },
    {
      id: 'scholar_002',
      name: '杜甫',
      style: '现实主义',
      desc: '诗圣，忧国忧民，沉郁顿挫',
      location: '大明宫',
      friendship: 0,
    },
    {
      id: 'scholar_003',
      name: '王维',
      style: '山水田园',
      desc: '诗佛，诗中有画，画中有诗',
      location: '辋川别业',
      friendship: 0,
    },
    {
      id: 'scholar_004',
      name: '白居易',
      style: '通俗写实',
      desc: '诗魔，文章合为时而著，歌诗合为事而作',
      location: '长乐坊',
      friendship: 0,
    },
    {
      id: 'scholar_005',
      name: '孟浩然',
      style: '山水田园',
      desc: '与王维齐名，隐居襄阳，诗风清淡',
      location: '终南山',
      friendship: 0,
    },
  ],
  
  gatherings: [
    {
      id: 'gather_001',
      name: '曲江诗会',
      time: '春季',
      desc: '每年春天在曲江池举行的大型诗会',
      participated: false,
    },
    {
      id: 'gather_002',
      name: '杏园探花',
      time: '春季',
      desc: '新科进士在杏园举行的庆祝活动',
      participated: false,
    },
    {
      id: 'gather_003',
      name: '雁塔题名',
      time: '秋季',
      desc: '新科进士在大雁塔下题名留念',
      participated: false,
    },
  ],
  
  scholarPanel: null,
  
  init() {
    this.createScholarPanel();
    console.log('[Scholar] 唐代科举文人系统初始化完成');
  },
  
  createScholarPanel() {
    this.scholarPanel = document.createElement('div');
    this.scholarPanel.style.cssText = `
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
    
    document.body.appendChild(this.scholarPanel);
  },
  
  showScholarPanel() {
    this.renderScholarPanel();
    this.scholarPanel.style.display = 'block';
  },
  
  closeScholarPanel() {
    this.scholarPanel.style.display = 'none';
  },
  
  renderScholarPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        📚 文人雅集
      </div>
    `;
    
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">✍️ 著名文人</div>
    `;
    
    this.scholars.forEach(scholar => {
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #d4af37;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div style="font-weight: bold; color: #ffd700;">${scholar.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">${scholar.style}</div>
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">${scholar.desc}</div>
          <div style="font-size: 11px; opacity: 0.6; margin-bottom: 8px;">📍 ${scholar.location} · 好感度: ${scholar.friendship}/100</div>
          <button onclick="ScholarSystemEnhancer.interact('${scholar.id}')" style="padding: 5px 15px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
            交流
          </button>
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div>
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffb6c1;">🎭 文人雅集</div>
    `;
    
    this.gatherings.forEach(gathering => {
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${gathering.participated ? '#4CAF50' : '#666'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div style="font-weight: bold; color: ${gathering.participated ? '#4CAF50' : '#ffd700'}">${gathering.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">${gathering.time}</div>
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">${gathering.desc}</div>
          <button onclick="ScholarSystemEnhancer.joinGathering('${gathering.id}')" style="padding: 5px 15px; background: ${gathering.participated ? '#666' : '#ffb6c1'}; border: none; color: ${gathering.participated ? '#999' : '#000'}; border-radius: 4px; cursor: ${gathering.participated ? 'default' : 'pointer'};">
            ${gathering.participated ? '已参加' : '参加'}
          </button>
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="ScholarSystemEnhancer.closeScholarPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.scholarPanel.innerHTML = html;
  },
  
  interact(scholarId) {
    const scholar = this.scholars.find(s => s.id === scholarId);
    if (!scholar) return;
    
    scholar.friendship = Math.min(100, scholar.friendship + 10);
    
    console.log('[Scholar] 与', scholar.name, '交流，好感度提升到', scholar.friendship);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('交流成功！', `你与 ${scholar.name} 谈诗论道，好感度提升！`);
    }
    
    this.renderScholarPanel();
  },
  
  joinGathering(gatheringId) {
    const gathering = this.gatherings.find(g => g.id === gatheringId);
    if (!gathering || gathering.participated) return;
    
    gathering.participated = true;
    
    console.log('[Scholar] 参加雅集:', gathering.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('参加成功！', `你参加了 ${gathering.name}！`);
    }
    
    this.renderScholarPanel();
  }
};

window.ScholarSystemEnhancer = ScholarSystemEnhancer;

console.log('[Scholar] 唐代科举文人系统增强模块加载完成');
