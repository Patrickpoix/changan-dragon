/* ============================================================
   游戏公告系统增强 v2.0
   公告栏、活动通知、版本更新
   ============================================================ */

const AnnouncementSystemEnhancer = {
  
  announcements: [
    {
      id: 'welcome',
      type: 'info',
      title: '欢迎来到龙游长安',
      content: '感谢各位玩家参与龙游长安的测试！本次测试开放了长安城核心区域的探索功能。',
      date: '2026-10-28',
    },
    {
      id: 'update_1028',
      type: 'update',
      title: 'v0.28.0 版本更新',
      content: '本次更新：\n1. 新增夜景灯光系统\n2. 优化了水面渲染效果\n3. 修复了城墙角楼重复问题\n4. 提升了整体性能',
      date: '2026-10-28',
    },
    {
      id: 'event_nationalday',
      type: 'event',
      title: '国庆中秋双节活动',
      content: '国庆中秋双节同庆！长安城张灯结彩，欢迎各位玩家前来游玩！活动期间登录可获得限定奖励。',
      date: '2026-10-01',
    },
  ],
  
  announcementPanel: null,
  
  init() {
    this.createAnnouncementPanel();
    console.log('[Announcement] 公告系统初始化完成');
  },
  
  createAnnouncementPanel() {
    this.announcementPanel = document.createElement('div');
    this.announcementPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
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
    
    document.body.appendChild(this.announcementPanel);
  },
  
  showAnnouncements() {
    this.renderAnnouncements();
    this.announcementPanel.style.display = 'block';
  },
  
  closeAnnouncements() {
    this.announcementPanel.style.display = 'none';
  },
  
  renderAnnouncements() {
    let html = `
      <div style="font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        📢 游戏公告
      </div>
    `;
    
    this.announcements.forEach(ann => {
      const typeColors = {
        info: '#87ceeb',
        update: '#90ee90',
        event: '#ffb6c1',
      };
      
      const typeNames = {
        info: '公告',
        update: '更新',
        event: '活动',
      };
      
      html += `
        <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid ${typeColors[ann.type]};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 16px; font-weight: bold;">
              <span style="color: ${typeColors[ann.type]}; margin-right: 8px;">[${typeNames[ann.type]}]</span>
              ${ann.title}
            </div>
            <div style="font-size: 12px; opacity: 0.7;">${ann.date}</div>
          </div>
          <div style="white-space: pre-line; line-height: 1.6;">
            ${ann.content}
          </div>
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="AnnouncementSystemEnhancer.closeAnnouncements()" style="padding: 10px 30px; background: #d4af37; border: none; color: #000; border-radius: 6px; cursor: pointer; font-size: 16px;">
          关闭
        </button>
      </div>
    `;
    
    this.announcementPanel.innerHTML = html;
  },
  
  addAnnouncement(announcement) {
    this.announcements.unshift(announcement);
    console.log('[Announcement] 新公告:', announcement.title);
  },
  
  showWelcomeAnnouncement() {
    const today = new Date().toDateString();
    const lastSeen = localStorage.getItem('changan_last_announcement_seen');
    
    if (lastSeen !== today) {
      setTimeout(() => {
        this.showAnnouncements();
        localStorage.setItem('changan_last_announcement_seen', today);
      }, 3000);
    }
  }
};

window.AnnouncementSystemEnhancer = AnnouncementSystemEnhancer;

console.log('[Announcement] 游戏公告系统增强模块加载完成');
