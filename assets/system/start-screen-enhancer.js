/* ============================================================
   启动界面增强 v2.0
   开始界面、加载画面、标题画面
   ============================================================ */

const StartScreenEnhancer = {
  
  startScreen: null,
  
  loadingScreen: null,
  
  init() {
    this.createLoadingScreen();
    console.log('[Start-Screen] 启动界面初始化完成');
  },
  
  createLoadingScreen() {
    this.loadingScreen = document.createElement('div');
    this.loadingScreen.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      color: #ffd700;
      font-family: serif;
    `;
    
    this.loadingScreen.innerHTML = `
      <div style="font-size: 48px; font-weight: bold; margin-bottom: 20px; text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);">
        龙游长安
      </div>
      <div style="font-size: 18px; margin-bottom: 40px; opacity: 0.8;">
        一座盛唐，一梦长安
      </div>
      <div style="width: 300px; height: 4px; background: rgba(255, 255, 255, 0.2); border-radius: 2px; overflow: hidden;">
        <div id="loading-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ffd700, #ff8c00); transition: width 0.3s;"></div>
      </div>
      <div id="loading-text" style="margin-top: 15px; font-size: 14px; opacity: 0.7;">
        正在加载长安城...
      </div>
    `;
    
    document.body.appendChild(this.loadingScreen);
  },
  
  updateLoadingProgress(percent, text) {
    const bar = document.getElementById('loading-bar');
    const textEl = document.getElementById('loading-text');
    
    if (bar) {
      bar.style.width = percent + '%';
    }
    
    if (textEl && text) {
      textEl.textContent = text;
    }
  },
  
  hideLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.style.transition = 'opacity 0.5s';
      this.loadingScreen.style.opacity = '0';
      
      setTimeout(() => {
        this.loadingScreen.remove();
      }, 500);
    }
  },
  
  createStartScreen() {
    this.startScreen = document.createElement('div');
    this.startScreen.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: #ffd700;
      font-family: serif;
    `;
    
    this.startScreen.innerHTML = `
      <div style="font-size: 64px; font-weight: bold; margin-bottom: 20px; text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);">
        龙游长安
      </div>
      <div style="font-size: 20px; margin-bottom: 60px; opacity: 0.8;">
        盛唐开放世界探索
      </div>
      <div style="display: flex; flex-direction: column; gap: 15px; width: 250px;">
        <button id="btn-start" style="padding: 15px; font-size: 20px; background: linear-gradient(180deg, #8b4513 0%, #6b3410 100%); border: 2px solid #d4af37; color: #ffd700; border-radius: 8px; cursor: pointer; font-family: serif;">
          开始游戏
        </button>
        <button id="btn-continue" style="padding: 15px; font-size: 18px; background: rgba(139, 69, 19, 0.5); border: 2px solid #d4af37; color: #ffd700; border-radius: 8px; cursor: pointer; font-family: serif;">
          继续游戏
        </button>
        <button id="btn-settings" style="padding: 15px; font-size: 18px; background: rgba(139, 69, 19, 0.5); border: 2px solid #d4af37; color: #ffd700; border-radius: 8px; cursor: pointer; font-family: serif;">
          设置
        </button>
      </div>
      <div style="margin-top: 60px; font-size: 12px; opacity: 0.5;">
        按H键查看帮助 | 按M键打开地图
      </div>
    `;
    
    document.body.appendChild(this.startScreen);
    
    document.getElementById('btn-start').onclick = () => {
      this.hideStartScreen();
    };
    
    document.getElementById('btn-continue').onclick = () => {
      this.hideStartScreen();
    };
    
    document.getElementById('btn-settings').onclick = () => {
      if (window.SettingsSystemEnhancer) {
        SettingsSystemEnhancer.showSettings();
      }
    };
  },
  
  showStartScreen() {
    if (!this.startScreen) {
      this.createStartScreen();
    }
    this.startScreen.style.display = 'flex';
  },
  
  hideStartScreen() {
    if (this.startScreen) {
      this.startScreen.style.transition = 'opacity 0.5s';
      this.startScreen.style.opacity = '0';
      
      setTimeout(() => {
        this.startScreen.style.display = 'none';
        this.startScreen.style.opacity = '1';
      }, 500);
    }
  }
};

window.StartScreenEnhancer = StartScreenEnhancer;

console.log('[Start-Screen] 启动界面增强模块加载完成');
