/* ============================================================
   宠物系统增强 — 萌宠相随
   v1: 宠物、坐骑、养成
   ============================================================ */

(function() {
  'use strict';
  
  let pets = [];
  let activePet = null;
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Pets] 开始增强宠物系统...']);
    
    loadPets();
    setupPetUI();
    addDefaultPets();
    
    console.log('[Pets] ✓ 宠物系统增强完成');
  }
  
  // 加载宠物
  function loadPets() {
    try {
      const saved = localStorage.getItem('changan-dragon-pets');
      if (saved) {
        const data = JSON.parse(saved);
        pets = data.pets || [];
        activePet = data.activePet;
        console.log('[Pets] 宠物已加载，共 ' + pets.length + ' 只');
      }
    } catch(e) {
      console.warn('[Pets] 加载宠物失败', e);
    }
  }
  
  // 保存宠物
  function savePets() {
    try {
      localStorage.setItem('changan-dragon-pets', JSON.stringify({
        pets: pets,
        activePet: activePet
      }));
    } catch(e) {
      console.warn('[Pets] 保存宠物失败', e);
    }
  }
  
  // 宠物UI
  function setupPetUI() {
    // V键打开宠物
    document.addEventListener('keydown', (e) => {
      if (e.key === 'v' || e.key === 'V') {
        showPets();
      }
    });
    
    console.log('[Pets] 宠物UI已就绪，按V打开');
  }
  
  // 添加默认宠物
  function addDefaultPets() {
    if (pets.length === 0) {
      pets = [
        { id: 'pet-1', name: '小白', type: 'cat', icon: '🐱', level: 1, exp: 0 },
        { id: 'pet-2', name: '大黄', type: 'dog', icon: '🐕', level: 1, exp: 0 }
      ];
      savePets();
      console.log('[Pets] 已添加默认宠物');
    }
  }
  
  // 显示宠物
  function showPets() {
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
    
    let petsHTML = '';
    pets.forEach(pet => {
      const isActive = activePet === pet.id;
      
      petsHTML += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin: 8px 0; background: rgba(139, 69, 19, 0.2); border-radius: 6px; ${isActive ? 'border: 2px solid #ffd700;' : ''}">
          <span style="font-size: 28px;">${pet.icon}</span>
          <div style="flex: 1; margin: 0 15px;">
            <h4 style="color: #ffd700; margin-bottom: 3px;">${pet.name}</h4>
            <p style="color: #999; font-size: 12px;">Lv.${pet.level} · ${pet.type}</p>
          </div>
          <button onclick="window.GamePets.setActive('${pet.id}')" style="padding: 6px 15px; background: ${isActive ? '#4CAF50' : '#8b4513'}; color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">${isActive ? '出战中' : '出战'}</button>
        </div>
      `;
    });
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px; font-family: serif;">🐾 我的宠物</h3>
      <div style="max-height: 300px; overflow-y: auto;">
        ${petsHTML}
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <button id="closePetsBtn" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closePetsBtn').onclick = () => {
      menu.remove();
    };
  }
  
  // 设置出战宠物
  function setActive(petId) {
    activePet = petId;
    savePets();
    showToast('宠物已出战！');
    // 重新打开
    // showPets();
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
  window.GamePets = {
    setActive: setActive,
    getActive: () => activePet,
    addPet: (name, type, icon) => {
      pets.push({ id: 'pet-' + Date.now(), name: name, type: type, icon: icon, level: 1, exp: 0 });
      savePets();
      showToast('获得新宠物: ' + name);
    }
  };
})();
