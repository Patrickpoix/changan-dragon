/* ============================================================
   设置菜单增强 — 游戏设置
   v1: 画质、音量、控制、语言设置
   ============================================================ */

(function() {
  'use strict';
  
  const settings = {
    quality: 'high', // low, medium, high, ultra
    masterVolume: 0.8,
    musicVolume: 0.6,
    sfxVolume: 0.8,
    mouseSensitivity: 1.0,
    invertY: false,
    language: 'zh-CN'
  };
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Settings] 开始增强设置菜单...']);
    
    loadSettings();
    setupSettingsMenu();
    
    console.log('[Settings] ✓ 设置菜单增强完成');
  }
  
  // 加载设置
  function loadSettings() {
    try {
      const saved = localStorage.getItem('changan-dragon-settings');
      if (saved) {
        Object.assign(settings, JSON.parse(saved));
        console.log('[Settings] 设置已加载');
      }
    } catch(e) {
      console.warn('[Settings] 加载设置失败', e);
    }
  }
  
  // 保存设置
  function saveSettings() {
    try {
      localStorage.setItem('changan-dragon-settings', JSON.stringify(settings));
      console.log('[Settings] 设置已保存');
    } catch(e) {
      console.warn('[Settings] 保存设置失败', e);
    }
  }
  
  // 设置菜单
  function setupSettingsMenu() {
    // ESC键打开设置菜单
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        showSettingsMenu();
      }
    });
    
    console.log('[Settings] 设置菜单已就绪，按ESC打开');
  }
  
  // 显示设置菜单
  function showSettingsMenu() {
    // 创建菜单
    const menu = document.createElement('div');
    menu.id = 'settingsMenu';
    menu.style.position = 'absolute';
    menu.style.top = '50%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    menu.style.background = 'rgba(0, 0, 0, 0.9)';
    menu.style.border = '2px solid #8b4513';
    menu.style.borderRadius = '8px';
    menu.style.padding = '20px';
    menu.style.zIndex = '1000';
    menu.style.minWidth = '300px';
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; font-family: serif; margin-bottom: 15px; text-align: center;">⚙️ 设置</h3>
      
      <div style="margin-bottom: 15px;">
        <label style="color: #ffd700; display: block; margin-bottom: 5px;">画质:</label>
        <select id="qualitySelect" style="width: 100%; padding: 5px; background: #333; color: #ffd700; border: 1px solid #8b4513;">
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high" selected>高</option>
          <option value="ultra">超高</option>
        </select>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="color: #ffd700; display: block; margin-bottom: 5px;">主音量: <span id="masterVolValue">80</span>%</label>
        <input type="range" id="masterVol" min="0" max="100" value="80" style="width: 100%;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="color: #ffd700; display: block; margin-bottom: 5px;">音乐音量: <span id="musicVolValue">60</span>%</label>
        <input type="range" id="musicVol" min="0" max="100" value="60" style="width: 100%;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="color: #ffd700; display: block; margin-bottom: 5px;">音效音量: <span id="sfxVolValue">80</span>%</label>
        <input type="range" id="sfxVol" min="0" max="100" value="80" style="width: 100%;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="color: #ffd700;">
          <input type="checkbox" id="invertY" ${settings.invertY ? 'checked' : ''}>
          反转Y轴
        </label>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <button id="saveSettingsBtn" style="padding: 8px 20px; margin-right: 10px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">保存</button>
        <button id="closeSettingsBtn" style="padding: 8px 20px; background: linear-gradient(180deg, #666, #444); color: #fff; border: 1px solid #999; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    // 绑定事件
    document.getElementById('qualitySelect').value = settings.quality;
    document.getElementById('masterVol').value = settings.masterVolume * 100;
    document.getElementById('musicVol').value = settings.musicVolume * 100;
    document.getElementById('sfxVol').value = settings.sfxVolume * 100;
    
    document.getElementById('masterVol').oninput = (e) => {
      document.getElementById('masterVolValue').textContent = e.target.value;
    };
    
    document.getElementById('musicVol').oninput = (e) => {
      document.getElementById('musicVolValue').textContent = e.target.value;
    };
    
    document.getElementById('sfxVol').oninput = (e) => {
      document.getElementById('sfxVolValue').textContent = e.target.value;
    };
    
    document.getElementById('saveSettingsBtn').onclick = () => {
      settings.quality = document.getElementById('qualitySelect').value;
      settings.masterVolume = document.getElementById('masterVol').value / 100;
      settings.musicVolume = document.getElementById('musicVol').value / 100;
      settings.sfxVolume = document.getElementById('sfxVol').value / 100;
      settings.invertY = document.getElementById('invertY').checked;
      
      saveSettings();
      menu.remove();
      showToast('设置已保存');
    };
    
    document.getElementById('closeSettingsBtn').onclick = () => {
      menu.remove();
    };
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
})();
