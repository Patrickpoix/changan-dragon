/* ============================================================
   邮件系统增强 — 飞鸽传书
   v1: 邮件、消息、通知
   ============================================================ */

(function() {
  'use strict';
  
  let mails = [];
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Mail] 开始增强邮件系统...']);
    
    loadMails();
    setupMailUI();
    addWelcomeMail();
    
    console.log('[Mail] ✓ 邮件系统增强完成');
  }
  
  // 加载邮件
  function loadMails() {
    try {
      const saved = localStorage.getItem('changan-dragon-mail');
      if (saved) {
        mails = JSON.parse(saved);
        console.log('[Mail] 邮件已加载，共 ' + mails.length + ' 封');
      }
    } catch(e) {
      console.warn('[Mail] 加载邮件失败', e);
    }
  }
  
  // 保存邮件
  function saveMails() {
    try {
      localStorage.setItem('changan-dragon-mail', JSON.stringify(mails));
    } catch(e) {
      console.warn('[Mail] 保存邮件失败', e);
    }
  }
  
  // 邮件UI
  function setupMailUI() {
    // M键打开邮件
    document.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        showMails();
      }
    });
    
    console.log('[Mail] 邮件UI已就绪，按M打开');
  }
  
  // 添加欢迎邮件
  function addWelcomeMail() {
    if (mails.length === 0) {
      mails.push({
        id: 'mail-1',
        from: '长安城官府',
        subject: '欢迎来到长安城',
        body: '欢迎来到盛唐长安城！这里是世界上最伟大的城市，祝你在此度过愉快的时光。',
        read: false,
        time: Date.now()
      });
      saveMails();
      console.log('[Mail] 已添加欢迎邮件');
    }
  }
  
  // 显示邮件
  function showMails() {
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.top = '50%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    menu.style.background = 'rgba(0, 0, 0, 0.95)';
    menu.style.border = '2px solid #8b4513';
    menu.style.borderRadius = '8px';
    menu.style.padding = '20px';
    menu.style.zIndex = '1000';
    menu.style.minWidth = '450px';
    
    let mailsHTML = '';
    mails.forEach(mail => {
      const unreadStyle = mail.read ? '' : 'border-left: 4px solid #ffd700;';
      mailsHTML += `
        <div style="padding: 12px; margin: 8px 0; background: rgba(139, 69, 19, 0.2); border-radius: 6px; ${unreadStyle}; cursor: pointer;" onclick="window.GameMail.readMail('${mail.id}')">
          <h4 style="color: #ffd700; margin-bottom: 3px;">${mail.subject}</h4>
          <p style="color: #999; font-size: 12px;">来自: ${mail.from}</p>
        </div>
      `;
    });
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px; font-family: serif;">✉️ 邮箱 (${mails.filter(m => !m.read).length} 未读)</h3>
      <div style="max-height: 350px; overflow-y: auto;">
        ${mailsHTML}
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <button id="closeMailBtn" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closeMailBtn').onclick = () => {
      menu.remove();
    };
  }
  
  // 阅读邮件
  function readMail(mailId) {
    const mail = mails.find(m => m.id === mailId);
    if (mail) {
      mail.read = true;
      saveMails();
      
      // 显示邮件内容
      const mailMenu = document.createElement('div');
      mailMenu.style.position = 'absolute';
      mailMenu.style.top = '50%';
      mailMenu.style.left = '50%';
      mailMenu.style.transform = 'translate(-50%, -50%)';
      mailMenu.style.background = 'rgba(0, 0, 0, 0.95)';
      mailMenu.style.border = '2px solid #8b4513';
      mailMenu.style.borderRadius = '8px';
      mailMenu.style.padding = '20px';
      mailMenu.style.zIndex = '1001';
      mailMenu.style.minWidth = '400px';
      
      mailMenu.innerHTML = `
        <h3 style="color: #ffd700; margin-bottom: 10px;">${mail.subject}</h3>
        <p style="color: #999; margin-bottom: 15px;">来自: ${mail.from}</p>
        <p style="color: #ccc; line-height: 1.8; margin-bottom: 20px;">${mail.body}</p>
        <div style="text-align: center;">
          <button onclick="this.closest('div[style*=z-index]').remove()" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
        </div>
      `;
      
      document.body.appendChild(mailMenu);
    }
  }
  
  // 工具函数
  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'absolute';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = '#ffd700';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '1000';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
  
  init();
  
  // 暴露给其他模块
  window.GameMail = {
    sendMail: (from, subject, body) => {
      mails.push({
        id: 'mail-' + Date.now(),
        from: from,
        subject: subject,
        body: body,
        read: false,
        time: Date.now()
      });
      saveMails();
      showToast('收到新邮件！');
    },
    readMail: readMail,
    getUnreadCount: () => mails.filter(m => !m.read).length
  };
})();
