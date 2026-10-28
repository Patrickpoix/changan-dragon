/* ============================================================
   邮件系统增强 v2.0
   收件箱、发件箱、系统邮件、附件
   ============================================================ */

const MailSystemEnhancer = {
  
  inbox: [
    {
      id: 1,
      from: '系统',
      subject: '欢迎来到龙游长安',
      body: '欢迎来到伟大的长安城！这是你的第一封邮件。祝你在长安的旅程愉快！',
      time: '2026-10-28 10:00',
      read: false,
      attachments: [{ name: '新手礼包', type: 'item', count: 1 }],
    },
    {
      id: 2,
      from: '李白',
      subject: '曲江池一游',
      body: '贤弟，今日曲江池荷花盛开，可否同游？',
      time: '2026-10-28 09:30',
      read: false,
      attachments: [],
    },
    {
      id: 3,
      from: '系统',
      subject: '版本更新通知',
      body: '龙游长安 v0.28.0 已更新！新增夜景灯光系统，修复了多个bug。',
      time: '2026-10-27 18:00',
      read: true,
      attachments: [],
    },
  ],
  
  sent: [],
  
  mailPanel: null,
  
  currentTab: 'inbox',
  
  init() {
    this.createMailPanel();
    console.log('[Mail] 邮件系统初始化完成');
  },
  
  createMailPanel() {
    this.mailPanel = document.createElement('div');
    this.mailPanel.style.cssText = `
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
    
    document.body.appendChild(this.mailPanel);
  },
  
  showMailPanel() {
    this.renderMailPanel();
    this.mailPanel.style.display = 'block';
  },
  
  closeMailPanel() {
    this.mailPanel.style.display = 'none';
  },
  
  renderMailPanel() {
    const unreadCount = this.inbox.filter(m => !m.read).length;
    
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        ✉️ 邮件系统
        ${unreadCount > 0 ? `<span style="font-size: 14px; color: #ff6b6b; margin-left: 10px;">${unreadCount} 封未读</span>` : ''}
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
        <button onclick="MailSystemEnhancer.setTab('inbox')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'inbox' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'inbox' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          收件箱 (${this.inbox.length})
        </button>
        <button onclick="MailSystemEnhancer.setTab('sent')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'sent' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'sent' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          已发送 (${this.sent.length})
        </button>
      </div>
    `;
    
    if (this.currentTab === 'inbox') {
      this.inbox.forEach(mail => {
        html += `
          <div style="padding: 12px; margin-bottom: 8px; background: ${mail.read ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.3)'}; border-radius: 6px; border-left: 4px solid ${mail.read ? '#666' : '#d4af37'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <div style="font-weight: bold; ${mail.read ? '' : 'color: #d4af37;'}">
                ${mail.read ? '' : '● '}${mail.subject}
              </div>
              <div style="font-size: 12px; opacity: 0.7;">${mail.time}</div>
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">来自：${mail.from}</div>
            <div style="font-size: 12px; opacity: 0.8;">${mail.body.substring(0, 50)}...</div>
            ${mail.attachments.length > 0 ? `<div style="font-size: 12px; color: #4CAF50; margin-top: 5px;">📎 ${mail.attachments.length} 个附件</div>` : ''}
          </div>
        `;
      });
    } else {
      html += '<div style="opacity: 0.5; text-align: center; padding: 40px;">还没有发送过邮件</div>';
    }
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="MailSystemEnhancer.closeMailPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.mailPanel.innerHTML = html;
  },
  
  setTab(tab) {
    this.currentTab = tab;
    this.renderMailPanel();
  }
};

window.MailSystemEnhancer = MailSystemEnhancer;

console.log('[Mail] 邮件系统增强模块加载完成');
