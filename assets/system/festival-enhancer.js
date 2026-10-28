/* ============================================================
   节日庆典活动系统增强 v2.0
   节日、庆典、活动、奖励
   ============================================================ */

const FestivalSystemEnhancer = {
  
  festivals: [
    {
      id: 'spring_festival',
      name: '春节',
      desc: '万象更新，长安城张灯结彩',
      date: '正月初一',
      activities: ['放烟花', '贴春联', '吃饺子'],
      rewards: { exp: 500, gold: 200, item: '春节礼包' },
      active: false,
    },
    {
      id: 'lantern_festival',
      name: '元宵节',
      desc: '花灯如昼，火树银花不夜天',
      date: '正月十五',
      activities: ['赏花灯', '猜灯谜', '吃元宵'],
      rewards: { exp: 800, gold: 300, item: '花灯' },
      active: false,
    },
    {
      id: 'dragon_boat',
      name: '端午节',
      desc: '龙舟竞渡，粽叶飘香',
      date: '五月初五',
      activities: ['赛龙舟', '吃粽子', '挂艾草'],
      rewards: { exp: 1000, gold: 400, item: '龙舟奖' },
      active: false,
    },
    {
      id: 'mid_autumn',
      name: '中秋节',
      desc: '月圆人团圆，把酒问青天',
      date: '八月十五',
      activities: ['赏月', '吃月饼', '饮桂花酒'],
      rewards: { exp: 1500, gold: 600, item: '月饼礼盒' },
      active: false,
    },
    {
      id: 'chongyang',
      name: '重阳节',
      desc: '登高望远，遍插茱萸',
      date: '九月初九',
      activities: ['登高', '赏菊', '饮菊花酒'],
      rewards: { exp: 1200, gold: 500, item: '茱萸囊' },
      active: false,
    },
  ],
  
  festivalPanel: null,
  
  init() {
    this.createFestivalPanel();
    console.log('[Festival] 节日庆典活动系统初始化完成');
  },
  
  createFestivalPanel() {
    this.festivalPanel = document.createElement('div');
    this.festivalPanel.style.cssText = `
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
    
    document.body.appendChild(this.festivalPanel);
  },
  
  showFestivalPanel() {
    this.renderFestivalPanel();
    this.festivalPanel.style.display = 'block';
  },
  
  closeFestivalPanel() {
    this.festivalPanel.style.display = 'none';
  },
  
  renderFestivalPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🎊 节日庆典
      </div>
    `;
    
    this.festivals.forEach(festival => {
      html += `
        <div style="padding: 15px; margin-bottom: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; border-left: 4px solid ${festival.active ? '#ff6b6b' : '#d4af37'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <div style="font-weight: bold; font-size: 16px; color: ${festival.active ? '#ff6b6b' : '#ffd700'}">${festival.name}</div>
              <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">日期: ${festival.date}</div>
            </div>
            ${festival.active 
              ? '<span style="color: #ff6b6b;">🔥 进行中</span>'
              : `<button onclick="FestivalSystemEnhancer.activateFestival('${festival.id}')" style="padding: 8px 16px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
                  开启
                </button>`
            }
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">${festival.desc}</div>
          <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">
            活动: ${festival.activities.join('、')}
          </div>
          <div style="font-size: 12px; opacity: 0.6;">
            奖励: 经验${festival.rewards.exp} · 金币${festival.rewards.gold} · ${festival.rewards.item}
          </div>
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="FestivalSystemEnhancer.closeFestivalPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.festivalPanel.innerHTML = html;
  },
  
  activateFestival(festivalId) {
    const festival = this.festivals.find(f => f.id === festivalId);
    if (!festival) return;
    
    festival.active = true;
    
    console.log('[Festival] 开启节日:', festival.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('节日开启！', `${festival.name}开始了！${festival.desc}`);
    }
    
    this.renderFestivalPanel();
  }
};

window.FestivalSystemEnhancer = FestivalSystemEnhancer;

console.log('[Festival] 节日庆典活动系统增强模块加载完成');
