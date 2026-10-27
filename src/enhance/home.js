/* ============================================================
   家园系统增强 — 陋室铭
   v1: 家园、房屋、装饰
   ============================================================ */

(function() {
  'use strict';
  
  let home = {
    unlocked: false,
    furniture: []
  };
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Home] 开始增强家园系统...']);
    
    loadHome();
    setupHomeUI();
    
    console.log('[Home] ✓ 家园系统增强完成');
  }
  
  // 加载家园
  function loadHome() {
    try {
      const saved = localStorage.getItem('changan-dragon-home');
      if (saved) {
        home = JSON.parse(saved);
        console.log('[Home] 家园已加载');
      }
    } catch(e) {
      console.warn('[Home] 加载家园失败', e);
    }
  }
  
  // 保存家园
  function saveHome() {
    try {
      localStorage.setItem('changan-dragon-home', JSON.stringify(home));
    } catch(e) {
      console.warn('[Home] 保存家园失败', e);
    }
  }
  
  // 家园UI
  function setupHomeUI() {
    // H键打开家园（注意与帮助教程的H键冲突，改用其他键）
    // 用J键已经被任务系统用了，改用Home键
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Home') {
        showHome();
      }
    });
    
    console.log('[Home] 家园UI已就绪，按Home键打开');
  }
  
  // 显示家园
  function showHome() {
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
    menu.style.minWidth = '400px';
    
    let furnitureHTML = '';
    if (home.furniture.length > 0) {
      home.furniture.forEach(item => {
        furnitureHTML += `
          <div style="padding: 10px; margin: 5px 0; background: rgba(139, 69, 19, 0.2); border-radius: 4px;">
            <span style="color: #ffd700;">${item.icon} ${item.name}</span>
          </div>
        `;
      });
    } else {
      furnitureHTML = '<p style="color: #666; text-align: center;">还没有家具，去商店购买吧</p>';
    }
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px; font-family: serif;">🏠 我的家园</h3>
      <p style="color: #ccc; text-align: center; margin-bottom: 15px;">状态: ${home.unlocked ? '已解锁' : '未解锁'}</p>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #fff; margin-bottom: 10px;">家具 (${home.furniture.length})</h4>
        <div style="max-height: 200px; overflow-y: auto;">
          ${furnitureHTML}
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 15px;">
        <button id="closeHomeBtn" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closeHomeBtn').onclick = () => {
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
  
  // 暴露给其他模块
  window.GameHome = {
    unlock: () => { home.unlocked = true; saveHome(); showToast('家园已解锁！'); },
    addFurniture: (name, icon) => {
      home.furniture.push({ name: name, icon: icon });
      saveHome();
      showToast('获得家具: ' + name);
    },
    getHome: () => ({...home})
  };
})();
