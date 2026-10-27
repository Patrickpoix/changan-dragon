/* ============================================================
   帮派系统增强 — 江湖帮派
   v1: 帮派、帮会、帮派活动
   ============================================================ */

(function() {
  'use strict';
  
  let guild = {
    name: null,
    level: 1,
    members: [],
    contributions: 0
  };
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Guild] 开始增强帮派系统...']);
    
    loadGuild();
    setupGuildUI();
    
    console.log('[Guild] ✓ 帮派系统增强完成');
  }
  
  // 加载帮派
  function loadGuild() {
    try {
      const saved = localStorage.getItem('changan-dragon-guild');
      if (saved) {
        guild = JSON.parse(saved);
        console.log('[Guild] 帮派已加载: ' + guild.name);
      }
    } catch(e) {
      console.warn('[Guild] 加载帮派失败', e);
    }
  }
  
  // 保存帮派
  function saveGuild() {
    try {
      localStorage.setItem('changan-dragon-guild', JSON.stringify(guild));
    } catch(e) {
      console.warn('[Guild] 保存帮派失败', e);
    }
  }
  
  // 帮派UI
  function setupGuildUI() {
    // G键打开帮派
    document.addEventListener('keydown', (e) => {
      if (e.key === 'g' || e.key === 'G') {
        showGuild();
      }
    });
    
    console.log('[Guild] 帮派UI已就绪，按G打开');
  }
  
  // 显示帮派
  function showGuild() {
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
    
    let contentHTML = '';
    if (guild.name) {
      contentHTML = `
        <h4 style="color: #ffd700; margin-bottom: 10px;">帮派: ${guild.name}</h4>
        <p style="color: #ccc; margin-bottom: 5px;">等级: Lv.${guild.level}</p>
        <p style="color: #ccc; margin-bottom: 5px;">成员: ${guild.members.length} 人</p>
        <p style="color: #ccc; margin-bottom: 15px;">贡献: ${guild.contributions}</p>
      `;
    } else {
      contentHTML = '<p style="color: #666; text-align: center; margin: 20px 0;">你还没有加入帮派</p>';
    }
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px; font-family: serif;">⚔️ 帮派</h3>
      ${contentHTML}
      <div style="text-align: center; margin-top: 15px;">
        <button id="closeGuildBtn" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closeGuildBtn').onclick = () => {
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
  window.GameGuild = {
    join: (name) => { guild.name = name; guild.members = [name]; saveGuild(); showToast('加入帮派成功: ' + name); },
    leave: () => { guild.name = null; guild.members = []; saveGuild(); showToast('已离开帮派'); },
    addContribution: (amount) => { guild.contributions += amount; saveGuild(); },
    getGuild: () => ({...guild})
  };
})();
