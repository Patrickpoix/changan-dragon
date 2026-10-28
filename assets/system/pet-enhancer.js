/* ============================================================
   宠物系统增强 v2.0
   宠物收集、养成、跟随、互动
   ============================================================ */

const PetSystemEnhancer = {
  
  pets: [],
  
  activePet: null,
  
  petCatalog: [
    { id: 'cat', name: '橘猫', type: 'cat', rarity: 'common', desc: '可爱的小橘猫', price: 50 },
    { id: 'dog', name: '唐犬', type: 'dog', rarity: 'common', desc: '忠诚的唐代猎犬', price: 80 },
    { id: 'crane', name: '仙鹤', type: 'bird', rarity: 'rare', desc: '优雅的仙鹤', price: 500 },
    { id: 'rabbit', name: '玉兔', type: 'rabbit', rarity: 'epic', desc: '传说中的玉兔', price: 2000 },
    { id: 'qilin', name: '麒麟', type: 'mythical', rarity: 'legendary', desc: '祥瑞神兽麒麟', price: 10000 },
  ],
  
  rarityColors: {
    common: '#ffffff',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800',
  },
  
  petPanel: null,
  
  init() {
    this.createPetPanel();
    console.log('[Pet] 宠物系统初始化完成');
  },
  
  createPetPanel() {
    this.petPanel = document.createElement('div');
    this.petPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 700px;
      max-height: 600px;
      background: rgba(139, 69, 19, 0.98);
      border: 3px solid #d4af37;
      border-radius: 12px;
      padding: 20px;
      color: #ffd700;
      font-family: serif;
      font-size: 14px;
      overflow-y: auto;
      display: none;
      z-index: 2000;
      box-shadow: 0 8px 32px rgba(0,0,0,0.8);
    `;
    
    document.body.appendChild(this.petPanel);
  },
  
  showPetPanel() {
    this.renderPetPanel();
    this.petPanel.style.display = 'block';
  },
  
  closePetPanel() {
    this.petPanel.style.display = 'none';
  },
  
  renderPetPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🐾 宠物系统
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffb6c1;">我的宠物 (${this.pets.length})</div>
    `;
    
    if (this.pets.length === 0) {
      html += '<div style="opacity: 0.5; text-align: center; padding: 20px;">还没有宠物，去领养一只吧！</div>';
    } else {
      this.pets.forEach(pet => {
        const isActive = this.activePet && this.activePet.id === pet.id;
        
        html += `
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${this.rarityColors[pet.rarity]};">
            <div>
              <div style="font-weight: bold; color: ${this.rarityColors[pet.rarity]};">${pet.name}</div>
              <div style="font-size: 12px; opacity: 0.7;">${pet.desc}</div>
            </div>
            <button onclick="PetSystemEnhancer.setActivePet('${pet.id}')" style="padding: 5px 10px; background: ${isActive ? '#4CAF50' : '#d4af37'}; border: none; color: #000; border-radius: 4px; cursor: pointer;">
              ${isActive ? '跟随中' : '设为跟随'}
            </button>
          </div>
        `;
      });
    }
    
    html += `</div>`;
    
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">🐶 宠物商店</div>
    `;
    
    this.petCatalog.forEach(pet => {
      const owned = this.pets.find(p => p.id === pet.id);
      
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${this.rarityColors[pet.rarity]};">
          <div>
            <div style="font-weight: bold; color: ${this.rarityColors[pet.rarity]};">${pet.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">${pet.desc} · ${pet.price} 文</div>
          </div>
          ${owned ? '<span style="color: #4CAF50;">已拥有</span>' : `<button onclick="PetSystemEnhancer.adoptPet('${pet.id}')" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">领养</button>`}
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="PetSystemEnhancer.closePetPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.petPanel.innerHTML = html;
  },
  
  adoptPet(petId) {
    const pet = this.petCatalog.find(p => p.id === petId);
    if (!pet) return;
    
    console.log('[Pet] 领养宠物:', pet.name);
    
    this.pets.push(pet);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('领养成功', `你领养了 ${pet.name}！`);
    }
    
    this.renderPetPanel();
  },
  
  setActivePet(petId) {
    const pet = this.pets.find(p => p.id === petId);
    if (!pet) return;
    
    this.activePet = pet;
    
    console.log('[Pet] 设置跟随宠物:', pet.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.info('宠物跟随', `${pet.name} 开始跟随你了！`);
    }
    
    this.renderPetPanel();
  }
};

window.PetSystemEnhancer = PetSystemEnhancer;

console.log('[Pet] 宠物系统增强模块加载完成');
