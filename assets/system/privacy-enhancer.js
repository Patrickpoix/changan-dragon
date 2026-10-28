/* ============================================================
   隐私安全设置系统增强 v2.0
   隐私设置、账号绑定、实名认证
   ============================================================ */

const PrivacySecurityEnhancer = {
  
  privacyPanel: null,
  
  settings: {
    showOnlineStatus: true,
    showLocation: true,
    allowFriendRequest: true,
    showInLeaderboard: true,
    twoFactorAuth: false,
    loginNotification: true,
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false,
  },
  
  init() {
    this.loadSettings();
    this.createPrivacyPanel();
    console.log('[Privacy] 隐私安全系统初始化完成');
  },
  
  loadSettings() {
    const saved = localStorage.getItem('changan_privacy_settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  },
  
  saveSettings() {
    localStorage.setItem('changan_privacy_settings', JSON.stringify(this.settings));
    console.log('[Privacy] 设置已保存');
  },
  
  createPrivacyPanel() {
    this.privacyPanel = document.createElement('div');
    this.privacyPanel.style.cssText = `
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
    
    document.body.appendChild(this.privacyPanel);
  },
  
  showPrivacyPanel() {
    this.renderPrivacySettings();
    this.privacyPanel.style.display = 'block';
  },
  
  closePrivacyPanel() {
    this.privacyPanel.style.display = 'none';
  },
  
  renderPrivacySettings() {
    let html = `
      <div style="font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🔒 隐私与安全设置
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffb6c1;">📋 隐私设置</div>
    `;
    
    const privacyOptions = [
      { key: 'showOnlineStatus', label: '显示在线状态', desc: '允许其他玩家看到你是否在线' },
      { key: 'showLocation', label: '显示位置信息', desc: '在地图上显示你的位置' },
      { key: 'allowFriendRequest', label: '允许好友请求', desc: '允许其他玩家添加你为好友' },
      { key: 'showInLeaderboard', label: '显示在排行榜', desc: '允许你的名字出现在排行榜上' },
    ];
    
    privacyOptions.forEach(option => {
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 5px; background: rgba(0,0,0,0.2); border-radius: 6px;">
          <div>
            <div style="font-weight: bold;">${option.label}</div>
            <div style="font-size: 12px; opacity: 0.7;">${option.desc}</div>
          </div>
          <label style="position: relative; display: inline-block; width: 50px; height: 24px;">
            <input type="checkbox" ${this.settings[option.key] ? 'checked' : ''} onchange="PrivacySecurityEnhancer.toggleSetting('${option.key}', this.checked)" style="opacity: 0; width: 0; height: 0;">
            <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: ${this.settings[option.key] ? '#4CAF50' : '#ccc'}; border-radius: 24px; transition: 0.3s;">
              <span style="position: absolute; height: 18px; width: 18px; left: ${this.settings[option.key] ? '28px' : '4px'}; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s;"></span>
            </span>
          </label>
        </div>
      `;
    });
    
    html += `
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">🛡️ 安全设置</div>
    `;
    
    const securityOptions = [
      { key: 'twoFactorAuth', label: '两步验证', desc: '登录时需要额外验证码' },
      { key: 'loginNotification', label: '登录通知', desc: '新设备登录时发送通知' },
    ];
    
    securityOptions.forEach(option => {
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 5px; background: rgba(0,0,0,0.2); border-radius: 6px;">
          <div>
            <div style="font-weight: bold;">${option.label}</div>
            <div style="font-size: 12px; opacity: 0.7;">${option.desc}</div>
          </div>
          <label style="position: relative; display: inline-block; width: 50px; height: 24px;">
            <input type="checkbox" ${this.settings[option.key] ? 'checked' : ''} onchange="PrivacySecurityEnhancer.toggleSetting('${option.key}', this.checked)" style="opacity: 0; width: 0; height: 0;">
            <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: ${this.settings[option.key] ? '#4CAF50' : '#ccc'}; border-radius: 24px; transition: 0.3s;">
              <span style="position: absolute; height: 18px; width: 18px; left: ${this.settings[option.key] ? '28px' : '4px'}; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s;"></span>
            </span>
          </label>
        </div>
      `;
    });
    
    html += `
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="PrivacySecurityEnhancer.closePrivacyPanel()" style="padding: 10px 30px; background: #d4af37; border: none; color: #000; border-radius: 6px; cursor: pointer; font-size: 16px;">
          完成
        </button>
      </div>
    `;
    
    this.privacyPanel.innerHTML = html;
  },
  
  toggleSetting(key, value) {
    this.settings[key] = value;
    this.saveSettings();
    this.renderPrivacySettings();
    
    console.log('[Privacy] 设置更新:', key, '=', value);
  }
};

window.PrivacySecurityEnhancer = PrivacySecurityEnhancer;

console.log('[Privacy] 隐私安全设置系统增强模块加载完成');
