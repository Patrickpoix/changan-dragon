/* ============================================================
   装备系统增强 — 锦袍玉带
   v1: 装备、武器、防具、强化
   ============================================================ */

(function() {
  'use strict';
  
  let equipment = {
    weapon: null,
    head: null,
    body: null,
    feet: null
  };
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Equipment] 开始增强装备系统...']);
    
    loadEquipment();
    setupEquipmentUI();
    
    console.log('[Equipment] ✓ 装备系统增强完成');
  }
  
  // 加载装备
  function loadEquipment() {
    try {
      const saved = localStorage.getItem('changan-dragon-equipment');
      if (saved) {
        equipment = JSON.parse(saved);
        console.log('[Equipment] 装备已加载');
      }
    } catch(e) {
      console.warn('[Equipment] 加载装备失败', e);
    }
  }
  
  // 保存装备
  function saveEquipment() {
    try {
      localStorage.setItem('changan-dragon-equipment', JSON.stringify(equipment));
    } catch(e) {
      console.warn('[Equipment] 保存装备失败', e);
    }
  }
  
  // 装备UI
  function setupEquipmentUI() {
    // U键打开装备
    document.addEventListener('keydown', (e) => {
      if (e.key === 'u' || e.key === 'U') {
        showEquipment();
      }
    });
    
    console.log('[Equipment] 装备UI已就绪，按U打开');
  }
  
  // 显示装备
  function showEquipment() {
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
    
    const slots = [
      { key: 'weapon', name: '武器', icon: '⚔️' },
      { key: 'head', name: '头部', icon: '👒' },
      { key: 'body', name: '身体', icon: '👘' },
      { key: 'feet', name: '脚部', icon: '👞' }
    ];
    
    let equipmentHTML = '';
    slots.forEach(slot => {
      const item = equipment[slot.key];
      equipmentHTML += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin: 8px 0; background: rgba(139, 69, 19, 0.2); border-radius: 6px;">
          <span style="color: #ffd700; font-size: 16px;">${slot.icon} ${slot.name}</span>
          <span style="color: ${item ? '#ffd700' : '#666'};">${item ? item.name : '空'}</span>
        </div>
      `;
    });
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px; font-family: serif;">⚔️ 我的装备</h3>
      <div style="max-height: 300px; overflow-y: auto;">
        ${equipmentHTML}
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <button id="closeEquipBtn" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closeEquipBtn').onclick = () => {
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
  window.GameEquipment = {
    equip: (slot, item) => {
      equipment[slot] = item;
      saveEquipment();
      showToast('装备成功: ' + item.name);
    },
    unequip: (slot) => {
      equipment[slot] = null;
      saveEquipment();
      showToast('已卸下装备');
    },
    getEquipment: () => ({...equipment})
  };
})();
