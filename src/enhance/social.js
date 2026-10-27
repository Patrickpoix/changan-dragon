/* ============================================================
   社交系统增强 — 长安交友
   v1: 好友、聊天、社交互动
   ============================================================ */

(function() {
  'use strict';
  
  let friends = [];
  let chatHistory = [];
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Social] 开始增强社交系统...']);
    
    loadSocial();
    setupSocialUI();
    addDefaultFriends();
    
    console.log('[Social] ✓ 社交系统增强完成');
  }
  
  // 加载社交数据
  function loadSocial() {
    try {
      const saved = localStorage.getItem('changan-dragon-social');
      if (saved) {
        const data = JSON.parse(saved);
        friends = data.friends || [];
        chatHistory = data.chat || [];
        console.log('[Social] 社交数据已加载，好友 ' + friends.length + ' 个');
      }
    } catch(e) {
      console.warn('[Social] 加载社交数据失败', e);
    }
  }
  
  // 保存社交数据
  function saveSocial() {
    try {
      localStorage.setItem('changan-dragon-social', JSON.stringify({
        friends: friends,
        chat: chatHistory.slice(-50)
      }));
    } catch(e) {
      console.warn('[Social] 保存社交数据失败', e);
    }
  }
  
  // 社交UI
  function setupSocialUI() {
    // N键打开社交
    document.addEventListener('keydown', (e) => {
      if (e.key === 'n' || e.key === 'N') {
        showSocialMenu();
      }
    });
    
    console.log('[Social] 社交UI已就绪，按N打开');
  }
  
  // 添加默认好友
  function addDefaultFriends() {
    if (friends.length === 0) {
      friends = [
        { id: 'friend-1', name: '李白', title: '诗仙', status: 'online' },
        { id: 'friend-2', name: '杜甫', title: '诗圣', status: 'online' },
        { id: 'friend-3', name: '王维', title: '诗佛', status: 'offline' },
        { id: 'friend-4', name: '杨玉环', title: '贵妃', status: 'online' }
      ];
      saveSocial();
      console.log('[Social] 已添加默认好友');
    }
  }
  
  // 显示社交菜单
  function showSocialMenu() {
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
    
    let friendsHTML = '';
    friends.forEach(friend => {
      const statusColor = friend.status === 'online' ? '#44ff44' : '#666';
      const statusText = friend.status === 'online' ? '在线' : '离线';
      
      friendsHTML += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin: 8px 0; background: rgba(139, 69, 19, 0.2); border-radius: 6px;">
          <div>
            <h4 style="color: #ffd700; margin-bottom: 3px;">👤 ${friend.name}</h4>
            <p style="color: #999; font-size: 12px;">${friend.title}</p>
          </div>
          <span style="color: ${statusColor}; font-size: 13px;">${statusText}</span>
        </div>
      `;
    });
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px; font-family: serif;">👥 社交</h3>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #fff; margin-bottom: 10px;">好友列表 (${friends.length})</h4>
        <div style="max-height: 200px; overflow-y: auto;">
          ${friendsHTML}
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 15px;">
        <button id="closeSocialBtn" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closeSocialBtn').onclick = () => {
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
  window.GameSocial = {
    getFriends: () => [...friends],
    addFriend: (name, title) => {
      friends.push({ id: 'friend-' + Date.now(), name: name, title: title, status: 'online' });
      saveSocial();
      showToast('添加好友成功: ' + name);
    }
  };
})();
