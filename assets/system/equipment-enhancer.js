/* ============================================================
   装备系统增强 v2.0
   装备栏、穿戴、强化、品质
   ============================================================ */

const EquipmentEnhancer = {
  
  slots: {
    weapon: null,
    head: null,
    body: null,
    legs: null,
    feet: null,
    accessory: null,
  },
  
  inventory: [
    { id: 1, name: '青锋剑', type: 'weapon', quality: 'common', attack: 10, price: 50 },
    { id: 2, name: '唐巾', type: 'head', quality: 'common', defense: 2, price: 20 },
    { id: 3, name: '圆领袍', type: 'body', quality: 'uncommon', defense: 5, price: 80 },
    { id: 4, name: '乌皮靴', type: 'feet', quality: 'common', defense: 1, price: 15 },
    { id: 5, name: '玉佩', type: 'accessory', quality: 'rare', charm: 5, price: 200 },
  ],
  
  qualityColors: {
    common: '#ffffff',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800',
  },
  
  equipmentPanel: null,
  
  init() {
    this.createEquipmentPanel();
    console.log('[Equipment] 装备系统初始化完成');
  },
  
  createEquipmentPanel() {
    this.equipmentPanel = document.createElement('div');
    this.equipmentPanel.style.cssText = `
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
    
    document.body.appendChild(this.equipmentPanel);
  },
  
  showEquipmentPanel() {
    this.renderEquipmentPanel();
    this.equipmentPanel.style.display = 'block';
  },
  
  closeEquipmentPanel() {
    this.equipmentPanel.style.display = 'none';
  },
  
  renderEquipmentPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        ⚔️ 装备系统
      </div>
      
      <div style="display: flex; gap: 20px;">
        <div style="flex: 1;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #ffb6c1;">已穿戴</div>
    `;
    
    const slotNames = {
      weapon: '武器',
      head: '头部',
      body: '身体',
      legs: '腿部',
      feet: '脚部',
      accessory: '饰品',
    };
    
    for (const slotKey in this.slots) {
      const item = this.slots[slotKey];
      
      html += `
        <div style="padding: 10px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px solid #d4af37;">
          <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">${slotNames[slotKey]}</div>
          ${item ? `
            <div style="color: ${this.qualityColors[item.quality]}; font-weight: bold;">
              ${item.name}
            </div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 3px;">
              ${item.attack ? `攻击 +${item.attack}` : ''}
              ${item.defense ? `防御 +${item.defense}` : ''}
              ${item.charm ? `魅力 +${item.charm}` : ''}
            </div>
          ` : '<div style="opacity: 0.5; text-align: center; padding: 10px;">空</div>'}
        </div>
      `;
    }
    
    html += `
        </div>
        
        <div style="flex: 1;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #87ceeb;">背包 (${this.inventory.length})</div>
    `;
    
    this.inventory.forEach(item => {
      html += `
        <div style="padding: 10px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="color: ${this.qualityColors[item.quality]}; font-weight: bold;">${item.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">
              ${slotNames[item.type]} · ${item.price}文
            </div>
          </div>
          <button onclick="EquipmentEnhancer.equipItem(${item.id})" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
            穿戴
          </button>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="EquipmentEnhancer.closeEquipmentPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.equipmentPanel.innerHTML = html;
  },
  
  equipItem(itemId) {
    const itemIndex = this.inventory.findIndex(i => i.id === itemId);
    if (itemIndex < 0) return;
    
    const item = this.inventory[itemIndex];
    
    const current = this.slots[item.type];
    if (current) {
      this.inventory.push(current);
    }
    
    this.slots[item.type] = item;
    this.inventory.splice(itemIndex, 1);
    
    console.log('[Equipment] 穿戴装备:', item.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('穿戴成功', `你穿上了 ${item.name}`);
    }
    
    this.renderEquipmentPanel();
  }
};

window.EquipmentEnhancer = EquipmentEnhancer;

console.log('[Equipment] 装备系统增强模块加载完成');
