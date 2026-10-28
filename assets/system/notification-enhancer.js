/* ============================================================
   通知系统增强 v2.0
   游戏内通知、系统公告、提示消息
   ============================================================ */

const NotificationSystemEnhancer = {
  
  notifications: [],
  
  activeNotifications: [],
  
  maxActive: 3,
  
  container: null,
  
  init() {
    this.createContainer();
    console.log('[Notification] 通知系统初始化完成');
  },
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 80px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 999;
      pointer-events: none;
    `;
    
    document.body.appendChild(this.container);
  },
  
  send(type, title, message, duration = 3000) {
    const notification = {
      id: Date.now() + Math.random(),
      type: type,
      title: title,
      message: message,
      duration: duration,
      createdAt: Date.now(),
    };
    
    this.notifications.push(notification);
    this.processQueue();
    
    console.log(`[Notification] ${type}: ${title} - ${message}`);
    
    return notification.id;
  },
  
  processQueue() {
    while (this.activeNotifications.length < this.maxActive && this.notifications.length > 0) {
      const notification = this.notifications.shift();
      this.showNotification(notification);
    }
  },
  
  showNotification(notification) {
    const el = document.createElement('div');
    
    const colors = {
      info: { bg: 'rgba(50, 100, 200, 0.9)', border: '#87ceeb' },
      success: { bg: 'rgba(50, 150, 50, 0.9)', border: '#90ee90' },
      warning: { bg: 'rgba(200, 150, 50, 0.9)', border: '#ffd700' },
      error: { bg: 'rgba(200, 50, 50, 0.9)', border: '#ff6b6b' },
    };
    
    const color = colors[notification.type] || colors.info;
    
    el.style.cssText = `
      background: ${color.bg};
      border: 2px solid ${color.border};
      border-radius: 8px;
      padding: 12px 20px;
      color: #ffffff;
      font-family: serif;
      min-width: 300px;
      max-width: 500px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    `;
    
    el.innerHTML = `
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${notification.title}</div>
      <div style="font-size: 14px; opacity: 0.9;">${notification.message}</div>
    `;
    
    this.container.appendChild(el);
    this.activeNotifications.push({ el: el, notification: notification });
    
    setTimeout(() => {
      this.hideNotification(notification.id);
    }, notification.duration);
  },
  
  hideNotification(notificationId) {
    const index = this.activeNotifications.findIndex(n => n.notification.id === notificationId);
    
    if (index !== -1) {
      const { el } = this.activeNotifications[index];
      
      el.style.transition = 'opacity 0.3s';
      el.style.opacity = '0';
      
      setTimeout(() => {
        el.remove();
        this.activeNotifications.splice(index, 1);
        this.processQueue();
      }, 300);
    }
  },
  
  info(title, message, duration) {
    return this.send('info', title, message, duration);
  },
  
  success(title, message, duration) {
    return this.send('success', title, message, duration);
  },
  
  warning(title, message, duration) {
    return this.send('warning', title, message, duration);
  },
  
  error(title, message, duration) {
    return this.send('error', title, message, duration);
  },
  
  welcome() {
    this.info('欢迎来到龙游长安', '按H键打开帮助，了解更多游戏玩法');
  },
  
  areaDiscovered(areaName) {
    this.success('发现新区域', areaName);
  }
};

window.NotificationSystemEnhancer = NotificationSystemEnhancer;

console.log('[Notification] 通知系统增强模块加载完成');
