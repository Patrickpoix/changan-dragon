/* ============================================================
   帮助教程增强 — 初入长安
   v1: 新手教程、操作指南、快捷键
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Help] 开始增强帮助教程...']);
    
    showWelcomeGuide();
    setupHelpMenu();
    addKeyboardShortcuts();
    
    console.log('[Help] ✓ 帮助教程增强完成');
  }
  
  // 欢迎指南
  function showWelcomeGuide() {
    // 检查是否是第一次游玩
    const isFirstTime = !localStorage.getItem('changan-dragon-seen-welcome');
    
    if (isFirstTime) {
      setTimeout(() => {
        showWelcomeModal();
        localStorage.setItem('changan-dragon-seen-welcome', 'true');
      }, 2000);
    }
  }
  
  // 帮助菜单
  function setupHelpMenu() {
    // H键打开帮助
    document.addEventListener('keydown', (e) => {
      if (e.key === 'h' || e.key === 'H') {
        showHelpMenu();
      }
    });
    
    console.log('[Help] 帮助菜单已就绪，按H打开');
  }
  
  // 快捷键
  function addKeyboardShortcuts() {
    const shortcuts = [
      { key: 'WASD', desc: '移动' },
      { key: '鼠标', desc: '视角旋转' },
      { key: '空格', desc: '跳跃/上升(飞行模式)' },
      { key: 'Shift', desc: '冲刺/下降(飞行模式)' },
      { key: 'F', desc: '切换飞行模式' },
      { key: 'E', desc: '交互' },
      { key: 'T', desc: '快速旅行' },
      { key: 'P', desc: '拍照模式' },
      { key: 'H', desc: '帮助菜单' },
      { key: 'ESC', desc: '设置菜单' },
      { key: 'F5', desc: '快速存档' },
      { key: 'F9', desc: '快速读档' }
    ];
    
    console.log('[Help] 快捷键已加载，共 ' + shortcuts.length + ' 个');
  }
  
  // 显示欢迎弹窗
  function showWelcomeModal() {
    const modal = document.createElement('div');
    modal.style.position = 'absolute';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.background = 'rgba(0, 0, 0, 0.95)';
    modal.style.border = '3px solid #ffd700';
    modal.style.borderRadius = '12px';
    modal.style.padding = '30px';
    modal.style.zIndex = '10000';
    modal.style.maxWidth = '500px';
    modal.style.color = '#ffd700';
    modal.style.fontFamily = 'serif';
    
    modal.innerHTML = `
      <h2 style="text-align: center; margin-bottom: 20px; font-size: 28px;">🏯 欢迎来到长安城</h2>
      <p style="margin-bottom: 15px; line-height: 1.6;">这里是盛唐长安，世界上最伟大的城市。</p>
      <p style="margin-bottom: 15px; line-height: 1.6;">你将在这里自由探索，参观大明宫、大雁塔、曲江池等名胜古迹，与文人墨客、仕女商人交谈，收集散落的诗笺。</p>
      <p style="margin-bottom: 20px; line-height: 1.6; opacity: 0.8;">按 H 键查看完整操作指南。</p>
      <div style="text-align: center;">
        <button id="startBtn" style="padding: 12px 40px; font-size: 18px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 2px solid #ffd700; border-radius: 6px; cursor: pointer;">开始游历</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('startBtn').onclick = () => {
      modal.remove();
      showToast('欢迎来到长安城！');
    };
  }
  
  // 显示帮助菜单
  function showHelpMenu() {
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.top = '50%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    menu.style.background = 'rgba(0, 0, 0, 0.95)';
    menu.style.border = '2px solid #8b4513';
    menu.style.borderRadius = '8px';
    menu.style.padding = '25px';
    menu.style.zIndex = '1000';
    menu.style.maxWidth = '400px';
    menu.style.maxHeight = '80vh';
    menu.style.overflowY = 'auto';
    menu.style.color = '#ffd700';
    
    menu.innerHTML = `
      <h3 style="text-align: center; margin-bottom: 20px; font-family: serif;">📖 操作指南</h3>
      
      <div style="margin-bottom: 20px;">
        <h4 style="margin-bottom: 10px; color: #fff;">🗺️ 移动</h4>
        <div style="font-size: 14px; line-height: 1.8;">
          WASD — 前后左右移动<br>
          鼠标 — 旋转视角<br>
          空格 — 跳跃<br>
          Shift — 冲刺
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="margin-bottom: 10px; color: #fff;">✈️ 飞行模式</h4>
        <div style="font-size: 14px; line-height: 1.8;">
          F — 切换飞行/步行模式<br>
          空格 — 上升<br>
          Shift — 下降
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="margin-bottom: 10px; color: #fff;">🎮 交互</h4>
        <div style="font-size: 14px; line-height: 1.8;">
          E — 与NPC交谈/拾取物品<br>
          T — 快速旅行菜单<br>
          P — 拍照模式
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="margin-bottom: 10px; color: #fff;">💾 系统</h4>
        <div style="font-size: 14px; line-height: 1.8;">
          H — 帮助菜单<br>
          ESC — 设置菜单<br>
          F5 — 快速存档<br>
          F9 — 快速读档
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <button id="closeHelpBtn" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closeHelpBtn').onclick = () => {
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
    setTimeout(() => toast.remove(), 3000);
  }
  
  init();
})();
