/* ============================================================
   背包系统增强 — 行旅囊橐
   v1: 背包、物品栏、装备、道具
   ============================================================ */

(function() {
  'use strict';
  
  let inventory = [];
  const maxSlots = 20;
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Inventory] 开始增强背包系统...']);
    
    loadInventory();
    setupInventoryUI();
    addStarterItems();
    
    console.log('[Inventory] ✓ 背包系统增强完成');
  }
  
  // 加载背包
  function loadInventory() {
    try {
      const saved = localStorage.getItem('changan-dragon-inventory');
      if (saved) {
        inventory = JSON.parse(saved);
        console.log('[Inventory] 背包已加载，共 ' + inventory.length + ' 件物品');
      }
    } catch(e) {
      console.warn('[Inventory] 加载背包失败', e);
    }
  }
  
  // 保存背包
  function saveInventory() {
    try {
      localStorage.setItem('changan-dragon-inventory', JSON.stringify(inventory));
    } catch(e) {
      console.warn('[Inventory] 保存背包失败', e);
    }
  }
  
  // 背包UI
  function setupInventoryUI() {
    // I键打开背包
    document.addEventListener('keydown', (e) => {
      if (e.key === 'i' || e.key === 'I') {
        showInventory();
      }
    });
    
    console.log('[Inventory] 背包UI已就绪，按I打开');
  }
  
  // 添加初始物品
  function addStarterItems() {
    if (inventory.length === 0) {
      addItem({ id: 'poem-scroll', name: '诗笺卷轴', type: 'quest', icon: '📜', count: 1 });
      addItem({ id: 'gold-coin', name: '铜钱', type: 'currency', icon: '🪙', count: 100 });
      addItem({ id: 'rice-wine', name: '米酒', type: 'consumable', icon: '🍶', count: 3 });
      console.log('[Inventory] 已添加初始物品');
    }
  }
  
  // 添加物品
  function addItem(item) {
    if (inventory.length >= maxSlots) {
      showToast('背包已满！');
      return false;
    }
    
    // 检查是否已有相同物品
    const existing = inventory.find(i => i.id === item.id);
    if (existing && item.type !== 'unique') {
      existing.count += item.count || 1;
    } else {
      inventory.push({ ...item, count: item.count || 1 });
    }
    
    saveInventory();
    showToast('获得: ' + item.icon + ' ' + item.name);
    return true;
  }
  
  // 移除物品
  function removeItem(itemId, count = 1) {
    const index = inventory.findIndex(i => i.id === itemId);
    if (index === -1) return false;
    
    inventory[index].count -= count;
    if (inventory[index].count <= 0) {
      inventory.splice(index, 1);
    }
    
    saveInventory();
    return true;
  }
  
  // 显示背包
  function showInventory() {
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
    
    let itemsHTML = '';
    inventory.forEach((item, index) => {
      itemsHTML += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; background: rgba(139, 69, 19, 0.2); border-radius: 4px;">
          <span style="color: #ffd700; font-size: 16px;">${item.icon} ${item.name}</span>
          <span style="color: #fff; font-size: 14px;">x${item.count}</span>
        </div>
      `;
    });
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px; font-family: serif;">🎒 背包 (${inventory.length}/${maxSlots})</h3>
      <div style="max-height: 300px; overflow-y: auto;">
        ${itemsHTML || '<p style="color: #999; text-align: center;">背包是空的</p>'}
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <button id="closeInvBtn" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closeInvBtn').onclick = () => {
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
  window.GameInventory = {
    addItem: addItem,
    removeItem: removeItem,
    getInventory: () => [...inventory]
  };
})();
