/* ============================================================
   背包系统增强 v2.0
   物品背包、分类整理、使用物品
   ============================================================ */

const InventorySystemEnhancer = {
  
  capacity: 20,
  
  items: [],
  
  inventoryPanel: null,
  
  itemDatabase: {
    'poem_001': {
      id: 'poem_001',
      name: '《春晓》诗笺',
      type: 'poem',
      description: '春眠不觉晓，处处闻啼鸟。',
      icon: '📜',
      rarity: 'common',
    },
    'poem_002': {
      id: 'poem_002',
      name: '《静夜思》诗笺',
      type: 'poem',
      description: '床前明月光，疑是地上霜。',
      icon: '📜',
      rarity: 'common',
    },
    'tea': {
      id: 'tea',
      name: '长安茶',
      type: 'consumable',
      description: '一杯清香的长安茶，恢复体力。',
      icon: '🍵',
      rarity: 'common',
      effect: { stamina: 20 },
    },
    'pastry': {
      id: 'pastry',
      name: '胡饼',
      type: 'consumable',
      description: '西域传入的美味胡饼。',
      icon: '🥮',
      rarity: 'common',
      effect: { stamina: 10 },
    },
    'jade_pendant': {
      id: 'jade_pendant',
      name: '玉佩',
      type: 'collectible',
      description: '一块温润的白玉佩。',
      icon: '📿',
      rarity: 'rare',
    },
    'silk_scroll': {
      id: 'silk_scroll',
      name: '绢画',
      type: 'collectible',
      description: '一幅精美的唐代绢画。',
      icon: '🖼️',
      rarity: 'rare',
    },
  },
  
  init() {
    this.createInventoryPanel();
    this.addItem('tea', 3);
    this.addItem('pastry', 5);
    console.log('[Inventory] 背包系统初始化完成');
  },
  
  createInventoryPanel() {
    this.inventoryPanel = document.createElement('div');
    this.inventoryPanel.style.cssText = `
      position: absolute;
      right: 300px;
      top: 100px;
      width: 350px;
      max-height: 500px;
      background: rgba(139, 69, 19, 0.95);
      border: 2px solid #d4af37;
      border-radius: 12px;
      padding: 15px;
      color: #ffd700;
      font-family: serif;
      font-size: 14px;
      overflow-y: auto;
      display: none;
      z-index: 1000;
    `;
    
    document.body.appendChild(this.inventoryPanel);
  },
  
  addItem(itemId, count = 1) {
    const item = this.itemDatabase[itemId];
    if (!item) {
      console.warn('[Inventory] 未知物品:', itemId);
      return false;
    }
    
    const existing = this.items.find(i => i.itemId === itemId);
    if (existing) {
      existing.count += count;
    } else {
      if (this.items.length >= this.capacity) {
        console.warn('[Inventory] 背包已满');
        return false;
      }
      this.items.push({ itemId: itemId, count: count });
    }
    
    console.log(`[Inventory] 添加物品: ${item.name} x${count}`);
    return true;
  },
  
  removeItem(itemId, count = 1) {
    const index = this.items.findIndex(i => i.itemId === itemId);
    if (index === -1) return false;
    
    this.items[index].count -= count;
    
    if (this.items[index].count <= 0) {
      this.items.splice(index, 1);
    }
    
    console.log(`[Inventory] 移除物品: ${itemId} x${count}`);
    return true;
  },
  
  useItem(itemId) {
    const item = this.itemDatabase[itemId];
    if (!item) return;
    
    if (item.type === 'consumable') {
      this.removeItem(itemId, 1);
      console.log(`[Inventory] 使用物品: ${item.name}`);
      
      if (item.effect) {
        console.log('[Inventory] 效果:', item.effect);
      }
    }
  },
  
  showInventory() {
    this.inventoryPanel.style.display = 'block';
    this.renderInventory();
  },
  
  closeInventory() {
    this.inventoryPanel.style.display = 'none';
  },
  
  renderInventory() {
    let html = `
      <div style="font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 15px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
        背包 (${this.items.length}/${this.capacity})
      </div>
    `;
    
    if (this.items.length === 0) {
      html += `<div style="text-align: center; opacity: 0.5; padding: 20px;">背包是空的</div>`;
    } else {
      const types = {
        poem: '诗笺',
        consumable: '消耗品',
        collectible: '收藏品',
      };
      
      for (const type in types) {
        const typeItems = this.items.filter(i => this.itemDatabase[i.itemId].type === type);
        
        if (typeItems.length > 0) {
          html += `<div style="font-size: 16px; font-weight: bold; margin: 10px 0 5px;">${types[type]}</div>`;
          
          typeItems.forEach(invItem => {
            const item = this.itemDatabase[invItem.itemId];
            const rarityColors = {
              common: '#ffffff',
              rare: '#87ceeb',
              epic: '#dda0dd',
            };
            
            html += `
              <div style="display: flex; align-items: center; padding: 8px; margin-bottom: 5px; background: rgba(0,0,0,0.2); border-radius: 4px; cursor: pointer;" onclick="InventorySystemEnhancer.useItem('${invItem.itemId}')">
                <div style="font-size: 24px; margin-right: 10px;">${item.icon}</div>
                <div style="flex: 1;">
                  <div style="color: ${rarityColors[item.rarity]}; font-weight: bold;">${item.name}</div>
                  <div style="font-size: 12px; opacity: 0.8;">${item.description}</div>
                </div>
                <div style="font-weight: bold;">x${invItem.count}</div>
              </div>
            `;
          });
        }
      }
    }
    
    html += `
      <div style="text-align: center; margin-top: 15px;">
        <button onclick="InventorySystemEnhancer.closeInventory()" style="padding: 8px 20px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    this.inventoryPanel.innerHTML = html;
  }
};

window.InventorySystemEnhancer = InventorySystemEnhancer;

console.log('[Inventory] 背包系统增强模块加载完成');
