/* ============================================================
   活动赛事系统增强 v2.0
   限时活动、赛事挑战、排行榜
   ============================================================ */

const EventSystemEnhancer = {
  
  events: [
    {
      id: 'spring_festival',
      name: '上元灯节',
      description: '元宵节赏灯活动，长安城彻夜不眠！',
      startDate: '2026-02-12',
      endDate: '2026-02-15',
      rewards: ['限定灯笼', '500文铜钱', '上元称号'],
    },
    {
      id: 'dragon_boat',
      name: '龙舟赛',
      description: '曲江池龙舟大赛，看谁是长安最快的水手！',
      startDate: '2026-06-10',
      endDate: '2026-06-12',
      rewards: ['龙舟坐骑', '1000文铜钱', '龙舟高手称号'],
    },
    {
      id: 'mid_autumn',
      name: '中秋赏月会',
      description: '中秋佳节，赏月吟诗，共话团圆。',
      startDate: '2026-09-25',
      endDate: '2026-09-27',
      rewards: ['玉兔宠物', '800文铜钱', '赏月达人称号'],
    },
  ],
  
  competitions: [
    {
      id: 'poetry_contest',
      name: '诗词大会',
      description: '大唐诗词大赛，看谁是诗仙！',
      participants: 128,
      rewards: ['诗仙称号', '2000文铜钱', '文房四宝'],
    },
    {
      id: 'architecture_contest',
      name: '建筑设计赛',
      description: '设计最美的唐代建筑，赢得大奖！',
      participants: 64,
      rewards: ['建筑师称号', '1500文铜钱', '精美建筑图纸'],
    },
  ],
  
  eventPanel: null,
  
  init() {
    this.createEventPanel();
    console.log('[Event] 活动赛事系统初始化完成');
  },
  
  createEventPanel() {
    this.eventPanel = document.createElement('div');
    this.eventPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      max-height: 700px;
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
    
    document.body.appendChild(this.eventPanel);
  },
  
  showEventPanel() {
    this.renderEvents();
    this.eventPanel.style.display = 'block';
  },
  
  closeEventPanel() {
    this.eventPanel.style.display = 'none';
  },
  
  renderEvents() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🎉 活动赛事中心
      </div>
    `;
    
    html += `
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #ffb6c1;">📅 限时活动</div>
    `;
    
    this.events.forEach(event => {
      const isActive = this.isEventActive(event);
      
      html += `
        <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid ${isActive ? '#4CAF50' : '#666'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 16px; font-weight: bold;">
              ${event.name}
              ${isActive ? '<span style="color: #4CAF50; font-size: 12px; margin-left: 10px;">[进行中]</span>' : '<span style="color: #999; font-size: 12px; margin-left: 10px;">[未开始]</span>'}
            </div>
            <div style="font-size: 12px; opacity: 0.7;">
              ${event.startDate} ~ ${event.endDate}
            </div>
          </div>
          <div style="margin-bottom: 10px; line-height: 1.5;">
            ${event.description}
          </div>
          <div style="font-size: 12px; opacity: 0.8;">
            奖励：${event.rewards.join('、')}
          </div>
        </div>
      `;
    });
    
    html += `
      <div style="font-size: 18px; font-weight: bold; margin: 20px 0 15px 0; color: #87ceeb;">🏆 赛事挑战</div>
    `;
    
    this.competitions.forEach(comp => {
      html += `
        <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid #ffd700;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 16px; font-weight: bold;">
              ${comp.name}
            </div>
            <div style="font-size: 12px; opacity: 0.7;">
              ${comp.participants} 人参与
            </div>
          </div>
          <div style="margin-bottom: 10px; line-height: 1.5;">
            ${comp.description}
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 10px;">
            奖励：${comp.rewards.join('、')}
          </div>
          <button onclick="EventSystemEnhancer.joinCompetition('${comp.id}')" style="padding: 8px 16px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
            立即参与
          </button>
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="EventSystemEnhancer.closeEventPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.eventPanel.innerHTML = html;
  },
  
  isEventActive(event) {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return now >= start && now <= end;
  },
  
  joinCompetition(compId) {
    const comp = this.competitions.find(c => c.id === compId);
    if (!comp) return;
    
    console.log('[Event] 参加赛事:', comp.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('报名成功', `你已成功参加 ${comp.name}！`);
    }
  }
};

window.EventSystemEnhancer = EventSystemEnhancer;

console.log('[Event] 活动赛事系统增强模块加载完成');
