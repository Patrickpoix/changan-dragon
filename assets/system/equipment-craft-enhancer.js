/* ============================================================
   装备打造强化系统增强 v2.0
   装备打造、强化、镶嵌、分解
   ============================================================ */

const EquipmentCraftEnhancer = {
  
  qualities: [
    { id: 'common', name: '普通', color: '#ffffff' },
    { id: 'uncommon', name: '优秀', color: '#4CAF50' },
    { id: 'rare', name: '稀有', color: '#2196F3' },
    { id: 'epic', name: '史诗', color: '#9C27B0' },
    { id: 'legendary', name: '传说', color: '#FF9800' },
  ],
  
  materials: {
    iron: { name: '铁矿', count: 10 },
    wood: { name: '木材', count: 20 },
    cloth: { name: '布料', count: 15 },
    leather: { name: '皮革', count: 8 },
  },
  
  craftedEquipments: [],
  
  maxEnhanceLevel: 10,
  
  craftPanel: null,
  
  currentTab: 'craft',
  
  init() {
    this.createCraftPanel();
    console.log('[Craft] 装备打造强化系统初始化完成');
  },
  
  createCraftPanel() {
    this.craftPanel = document.createElement('div');
    this.craftPanel.style.cssText = `
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
    
    document.body.appendChild(this.craftPanel);
  },
  
  showCraftPanel() {
    this.renderCraftPanel();
    this.craftPanel.style.display = 'block';
  },
  
  closeCraftPanel() {
    this.craftPanel.style.display = 'none';
  },
  
  renderCraftPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🔨 装备打造强化
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
        <button onclick="EquipmentCraftEnhancer.setTab('craft')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'craft' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'craft' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          打造装备
        </button>
        <button onclick="EquipmentCraftEnhancer.setTab('enhance')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'enhance' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'enhance' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          强化装备
        </button>
        <button onclick="EquipmentCraftEnhancer.setTab('materials')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'materials' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'materials' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          我的材料
        </button>
      </div>
    `;
    
    if (this.currentTab === 'craft') {
      html += `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">可打造装备</div>
          
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #2196F3;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: bold; color: #2196F3;">铁剑</div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">需要：铁矿 x5, 木材 x2</div>
              </div>
              <button onclick="EquipmentCraftEnhancer.craftEquipment('iron_sword')" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
                打造
              </button>
            </div>
          </div>
          
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #4CAF50;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: bold; color: #4CAF50;">皮甲</div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">需要：皮革 x3, 布料 x2</div>
              </div>
              <button onclick="EquipmentCraftEnhancer.craftEquipment('leather_armor')" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
                打造
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (this.currentTab === 'enhance') {
      html += `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ff9800;">强化装备</div>
          <div style="opacity: 0.7; text-align: center; padding: 20px;">
            选择一件装备进行强化<br>
            强化等级上限：+${this.maxEnhanceLevel}<br>
            每次强化消耗：铁矿 x1
          </div>
        </div>
      `;
    } else {
      html += `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #4CAF50;">我的材料</div>
      `;
      
      for (const matKey in this.materials) {
        const mat = this.materials[matKey];
        html += `
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #8bc34a;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-weight: bold;">${mat.name}</div>
              <div style="color: #FFD700;">x${mat.count}</div>
            </div>
          </div>
        `;
      }
      
      html += `</div>`;
    }
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="EquipmentCraftEnhancer.closeCraftPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.craftPanel.innerHTML = html;
  },
  
  setTab(tab) {
    this.currentTab = tab;
    this.renderCraftPanel();
  },
  
  craftEquipment(equipId) {
    if (equipId === 'iron_sword') {
      if (this.materials.iron.count < 5 || this.materials.wood.count < 2) {
        console.log('[Craft] 材料不足');
        
        if (window.NotificationSystemEnhancer) {
          NotificationSystemEnhancer.error('材料不足', '你没有足够的材料打造铁剑！');
        }
        return;
      }
      
      this.materials.iron.count -= 5;
      this.materials.wood.count -= 2;
    }
    
    console.log('[Craft] 打造装备成功:', equipId);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('打造成功', '你成功打造了一件装备！');
    }
    
    this.renderCraftPanel();
  }
};

window.EquipmentCraftEnhancer = EquipmentCraftEnhancer;

console.log('[Craft] 装备打造强化系统增强模块加载完成');
