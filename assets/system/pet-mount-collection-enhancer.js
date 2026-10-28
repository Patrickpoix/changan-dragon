/* ============================================================
   宠物坐骑收集养成进化系统增强 v2.0
   宠物收集、坐骑养成、进化、融合
   ============================================================ */

const PetMountCollectionEnhancer = {
  
  petCollection: [
    { id: 'cat', name: '猫', type: 'pet', rarity: 'common', obtained: true, level: 5 },
    { id: 'dog', name: '狗', type: 'pet', rarity: 'common', obtained: true, level: 3 },
    { id: 'crane', name: '仙鹤', type: 'pet', rarity: 'rare', obtained: false, level: 0 },
    { id: 'qilin', name: '麒麟', type: 'pet', rarity: 'legendary', obtained: false, level: 0 },
    { id: 'dragon', name: '龙', type: 'pet', rarity: 'legendary', obtained: false, level: 0 },
  ],
  
  mountCollection: [
    { id: 'horse_bay', name: '棕马', type: 'mount', rarity: 'common', obtained: true, level: 10 },
    { id: 'horse_black', name: '乌骓马', type: 'mount', rarity: 'uncommon', obtained: false, level: 0 },
    { id: 'horse_white', name: '白龙马', type: 'mount', rarity: 'rare', obtained: false, level: 0 },
    { id: 'pegasus', name: '天马', type: 'mount', rarity: 'legendary', obtained: false, level: 0 },
    { id: 'dragon_mount', name: '飞龙', type: 'mount', rarity: 'legendary', obtained: false, level: 0 },
  ],
  
  rarityColors: {
    common: '#ffffff',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800',
  },
  
  collectionPanel: null,
  
  currentTab: 'pet',
  
  init() {
    this.createCollectionPanel();
    console.log('[Collection] 宠物坐骑收集养成进化系统初始化完成');
  },
  
  createCollectionPanel() {
    this.collectionPanel = document.createElement('div');
    this.collectionPanel.style.cssText = `
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
    
    document.body.appendChild(this.collectionPanel);
  },
  
  showCollectionPanel() {
    this.renderCollectionPanel();
    this.collectionPanel.style.display = 'block';
  },
  
  closeCollectionPanel() {
    this.collectionPanel.style.display = 'none';
  },
  
  renderCollectionPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        📖 收集图鉴
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
        <button onclick="PetMountCollectionEnhancer.setTab('pet')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'pet' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'pet' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          🐱 宠物图鉴 (${this.petCollection.filter(p => p.obtained).length}/${this.petCollection.length})
        </button>
        <button onclick="PetMountCollectionEnhancer.setTab('mount')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'mount' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'mount' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          🐎 坐骑图鉴 (${this.mountCollection.filter(m => m.obtained).length}/${this.mountCollection.length})
        </button>
      </div>
    `;
    
    const collection = this.currentTab === 'pet' ? this.petCollection : this.mountCollection;
    
    collection.forEach(item => {
      html += `
        <div style="padding: 12px; margin-bottom: 10px; background: ${item.obtained ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'}; border-radius: 6px; border-left: 4px solid ${this.rarityColors[item.rarity]}; opacity: ${item.obtained ? 1 : 0.5};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold; color: ${this.rarityColors[item.rarity]};">${item.obtained ? item.name : '???'}</div>
              <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">
                ${item.obtained ? `Lv.${item.level}` : '未收集'} · ${item.rarity}
              </div>
            </div>
            ${item.obtained ? `<button onclick="PetMountCollectionEnhancer.upgradeItem('${item.id}')" style="padding: 5px 10px; background: #4CAF50; border: none; color: #fff; border-radius: 4px; cursor: pointer;">
              升级
            </button>` : ''}
          </div>
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="PetMountCollectionEnhancer.closeCollectionPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.collectionPanel.innerHTML = html;
  },
  
  setTab(tab) {
    this.currentTab = tab;
    this.renderCollectionPanel();
  },
  
  upgradeItem(itemId) {
    let item = this.petCollection.find(p => p.id === itemId);
    if (!item) {
      item = this.mountCollection.find(m => m.id === itemId);
    }
    if (!item) return;
    
    item.level++;
    
    console.log('[Collection] 升级:', item.name, 'Lv.', item.level);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('升级成功', `${item.name} 升到了 Lv.${item.level}！`);
    }
    
    this.renderCollectionPanel();
  }
};

window.PetMountCollectionEnhancer = PetMountCollectionEnhancer;

console.log('[Collection] 宠物坐骑收集养成进化系统增强模块加载完成');
