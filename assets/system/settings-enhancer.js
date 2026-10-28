/* ============================================================
   设置系统增强 v2.0
   画面设置、音效设置、操作设置
   ============================================================ */

const SettingsSystemEnhancer = {
  
  defaults: {
    graphics: {
      quality: 'high',
      shadows: true,
      shadowQuality: 'high',
      antiAliasing: true,
      bloom: true,
      depthOfField: false,
      motionBlur: false,
      filmGrain: false,
    },
    audio: {
      masterVolume: 0.8,
      musicVolume: 0.6,
      sfxVolume: 0.8,
      ambientVolume: 0.5,
    },
    controls: {
      mouseSensitivity: 1.0,
      invertY: false,
      walkSpeed: 1.0,
      flySpeed: 5.0,
    },
    game: {
      showFps: false,
      showHelp: true,
      autoSave: true,
    }
  },
  
  current: {},
  
  settingsPanel: null,
  
  init() {
    this.loadSettings();
    this.createSettingsPanel();
    console.log('[Settings] 设置系统初始化完成');
  },
  
  loadSettings() {
    try {
      const saved = localStorage.getItem('changan_settings');
      if (saved) {
        this.current = JSON.parse(saved);
        console.log('[Settings] 加载已保存的设置');
      } else {
        this.current = JSON.parse(JSON.stringify(this.defaults));
        console.log('[Settings] 使用默认设置');
      }
    } catch (e) {
      this.current = JSON.parse(JSON.stringify(this.defaults));
      console.warn('[Settings] 加载设置失败，使用默认值');
    }
  },
  
  saveSettings() {
    try {
      localStorage.setItem('changan_settings', JSON.stringify(this.current));
      console.log('[Settings] 设置已保存');
    } catch (e) {
      console.error('[Settings] 保存设置失败:', e);
    }
  },
  
  get(category, key) {
    if (this.current[category] && this.current[category][key] !== undefined) {
      return this.current[category][key];
    }
    return this.defaults[category]?.[key];
  },
  
  set(category, key, value) {
    if (!this.current[category]) {
      this.current[category] = {};
    }
    this.current[category][key] = value;
    this.saveSettings();
    this.applySettings();
  },
  
  applySettings() {
    if (window.GAME?.renderer) {
      const quality = this.get('graphics', 'quality');
      console.log('[Settings] 应用画质设置:', quality);
    }
    
    if (window.AudioEnhancer?.audioContext) {
      const masterVolume = this.get('audio', 'masterVolume');
      console.log('[Settings] 应用主音量:', masterVolume);
    }
  },
  
  createSettingsPanel() {
    this.settingsPanel = document.createElement('div');
    this.settingsPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      max-height: 600px;
      background: rgba(139, 69, 19, 0.95);
      border: 2px solid #d4af37;
      border-radius: 12px;
      padding: 20px;
      color: #ffd700;
      font-family: serif;
      font-size: 14px;
      overflow-y: auto;
      display: none;
      z-index: 1000;
    `;
    
    document.body.appendChild(this.settingsPanel);
    this.renderSettingsPanel();
  },
  
  renderSettingsPanel() {
    let html = `
      <div style="font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px;">设置</div>
    `;
    
    html += `
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #d4af37; padding-bottom: 5px;">画面设置</div>
    `;
    
    html += this.createToggleRow('阴影', 'graphics', 'shadows');
    html += this.createToggleRow('抗锯齿', 'graphics', 'antiAliasing');
    html += this.createToggleRow('Bloom光晕', 'graphics', 'bloom');
    html += this.createToggleRow('景深', 'graphics', 'depthOfField');
    
    html += `
      <div style="font-size: 18px; font-weight: bold; margin: 20px 0 10px; border-bottom: 1px solid #d4af37; padding-bottom: 5px;">音效设置</div>
    `;
    
    html += this.createSliderRow('主音量', 'audio', 'masterVolume', 0, 1, 0.1);
    html += this.createSliderRow('音乐音量', 'audio', 'musicVolume', 0, 1, 0.1);
    html += this.createSliderRow('音效音量', 'audio', 'sfxVolume', 0, 1, 0.1);
    
    html += `
      <div style="font-size: 18px; font-weight: bold; margin: 20px 0 10px; border-bottom: 1px solid #d4af37; padding-bottom: 5px;">操作设置</div>
    `;
    
    html += this.createSliderRow('鼠标灵敏度', 'controls', 'mouseSensitivity', 0.1, 3, 0.1);
    html += this.createToggleRow('反转Y轴', 'controls', 'invertY');
    
    html += `
      <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: center;">
        <button onclick="SettingsSystemEnhancer.resetToDefaults()" style="padding: 10px 20px; background: #6b3410; border: 2px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">恢复默认</button>
        <button onclick="SettingsSystemEnhancer.closeSettings()" style="padding: 10px 20px; background: #8b4513; border: 2px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    this.settingsPanel.innerHTML = html;
  },
  
  createToggleRow(label, category, key) {
    const value = this.get(category, key);
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
        <span>${label}</span>
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" ${value ? 'checked' : ''} onchange="SettingsSystemEnhancer.set('${category}', '${key}', this.checked)" style="margin-right: 5px;">
          ${value ? '开' : '关'}
        </label>
      </div>
    `;
  },
  
  createSliderRow(label, category, key, min, max, step) {
    const value = this.get(category, key);
    return `
      <div style="padding: 8px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>${label}</span>
          <span>${value}</span>
        </div>
        <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" 
          onchange="SettingsSystemEnhancer.set('${category}', '${key}', parseFloat(this.value))"
          style="width: 100%;">
      </div>
    `;
  },
  
  showSettings() {
    this.settingsPanel.style.display = 'block';
    this.renderSettingsPanel();
  },
  
  closeSettings() {
    this.settingsPanel.style.display = 'none';
  },
  
  resetToDefaults() {
    this.current = JSON.parse(JSON.stringify(this.defaults));
    this.saveSettings();
    this.applySettings();
    this.renderSettingsPanel();
    console.log('[Settings] 已恢复默认设置');
  }
};

window.SettingsSystemEnhancer = SettingsSystemEnhancer;

console.log('[Settings] 设置系统增强模块加载完成');
