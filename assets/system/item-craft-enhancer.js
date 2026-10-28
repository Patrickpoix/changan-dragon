/* ============================================================
   装备物品品质打造合成系统增强 v2.0
   装备品质、物品打造、合成、分解
   ============================================================ */

const ItemCraftEnhancer = {
  
  qualities: [
    { id: 'common', name: '普通', color: '#ffffff', bonus: 0 },
    { id: 'uncommon', name: '优秀', color: '#4CAF50', bonus: 5 },
    { id: 'rare', name: '稀有', color: '#2196F3', bonus: 10 },
    { id: 'epic', name: '史诗', color: '#9C27B0', bonus: 20 },
    { id: 'legendary', name: '传说', color: '#FF9800', bonus: 40 },
  ],
  
  recipes: [
    {
      id: 'iron_sword',
      name: '铁剑',
      quality: 'common',
      materials: [
        { id: 'iron', count: 5 },
        { id: 'wood', count: 2 },
      ],
      result: { attack: 10, defense: 0 },
    },
    {
      id: 'steel_sword',
      name: '钢剑',
      quality: 'rare',
      materials: [
        { id: 'iron', count: 10 },
        { id: 'steel', count: 3 },
        { id: 'wood', count: 2 },
      ],
      result: { attack: 25, defense: 0 },
    },
    {
      id: 'leather_armor',
      name: '皮甲',
      quality: 'common',
      materials: [
        { id: 'leather', count: 5 },
        { id: 'cloth', count: 3 },
      ],
      result: { attack: 0, defense: 8 },
    },
    {
      id: 'magic_robe',
      name: '法袍',
      quality: 'epic',
      materials: [
        { id: 'cloth', count: 10 },
        { id: 'silk', count: 5 },
        { id: 'gem', count: 1 },
      ],
      result: { attack: 5, defense: 15, magic: 20 },
    },
  ],
  
  playerMaterials: {
    iron: 20,
    wood: 30,
    leather: 15,
    cloth: 25,
    steel: 5,
    silk: 2,
    gem: 0,
  },
  
  craftedItems: [],
  
  craftPanel: null,
  
  currentTab: 'recipes',
  
  init() {
    this.createCraftPanel();
    console.log('[ItemCraft] 装备物品品质打造合成系统初始化完成');
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
        🔨 打造合成
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
        <button onclick="ItemCraftEnhancer.setTab('recipes')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'recipes' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'recipes' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          打造配方
        </button>
        <button onclick="ItemCraftEnhancer.setTab('materials')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'materials' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'materials' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          我的材料
        </button>
        <button onclick="ItemCraftEnhancer.setTab('items')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'items' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'items' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          已打造装备 (${this.craftedItems.length})
        </button>
      </div>
    `;
    
    if (this.currentTab === 'recipes') {
      this.recipes.forEach(recipe => {
        const quality = this.qualities.find(q => q.id === recipe.quality);
        
        let canCraft = true;
        recipe.materials.forEach(mat => {
          if (this.playerMaterials[mat.id] < mat.count) {
            canCraft = false;
          }
        });
        
        html += `
          <div style="padding: 15px; margin-bottom: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; border-left: 4px solid ${quality.color};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div>
                <div style="font-weight: bold; color: ${quality.color}; font-size: 16px;">${recipe.name}</div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">品质: ${quality.name}</div>
              </div>
              <button onclick="ItemCraftEnhancer.craftItem('${recipe.id}')" ${canCraft ? '' : 'disabled'} style="padding: 8px 16px; background: ${canCraft ? '#d4af37' : '#666'}; border: none; color: #000; border-radius: 4px; cursor: ${canCraft ? 'pointer' : 'not-allowed'};">
                打造
              </button>
            </div>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">
              属性: 攻击+${recipe.result.attack} · 防御+${recipe.result.defense}${recipe.result.magic ? ` · 法术+${recipe.result.magic}` : ''}
            </div>
            <div style="font-size: 12px; opacity: 0.7;">
              需要材料: ${recipe.materials.map(m => `${m.id} x${m.count} (${this.playerMaterials[m.id]}/${m.count})`).join(', ')}
            </div>
          </div>
        `;
      });
    } else if (this.currentTab === 'materials') {
      for (const matId in this.playerMaterials) {
        html += `
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #8bc34a;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-weight: bold;">${matId}</div>
              <div style="color: #FFD700;">x${this.playerMaterials[matId]}</div>
            </div>
          </div>
        `;
      }
    } else {
      if (this.craftedItems.length === 0) {
        html += '<div style="opacity: 0.5; text-align: center; padding: 40px;">还没有打造任何装备</div>';
      } else {
        this.craftedItems.forEach((item, index) => {
          const quality = this.qualities.find(q => q.id === item.quality);
          html += `
            <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${quality.color};">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: bold; color: ${quality.color};">${item.name}</div>
                  <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">
                    攻击+${item.attack} · 防御+${item.defense}
                  </div>
                </div>
                <button onclick="ItemCraftEnhancer.disassembleItem(${index})" style="padding: 5px 10px; background: #ff6b6b; border: none; color: #fff; border-radius: 4px; cursor: pointer;">
                  分解
                </button>
              </div>
            </div>
          `;
        });
      }
    }
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="ItemCraftEnhancer.closeCraftPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
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
  
  craftItem(recipeId) {
    const recipe = this.recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    let canCraft = true;
    recipe.materials.forEach(mat => {
      if (this.playerMaterials[mat.id] < mat.count) {
        canCraft = false;
      }
    });
    
    if (!canCraft) {
      console.log('[ItemCraft] 材料不足');
      return;
    }
    
    recipe.materials.forEach(mat => {
      this.playerMaterials[mat.id] -= mat.count;
    });
    
    this.craftedItems.push({
      name: recipe.name,
      quality: recipe.quality,
      attack: recipe.result.attack,
      defense: recipe.result.defense,
    });
    
    console.log('[ItemCraft] 打造成功:', recipe.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('打造成功', `你成功打造了 ${recipe.name}！`);
    }
    
    this.renderCraftPanel();
  },
  
  disassembleItem(index) {
    const item = this.craftedItems[index];
    if (!item) return;
    
    this.playerMaterials.iron += 2;
    this.playerMaterials.wood += 1;
    
    this.craftedItems.splice(index, 1);
    
    console.log('[ItemCraft] 分解物品:', item.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.info('分解成功', `你分解了 ${item.name}，获得了一些材料。`);
    }
    
    this.renderCraftPanel();
  }
};

window.ItemCraftEnhancer = ItemCraftEnhancer;

console.log('[ItemCraft] 装备物品品质打造合成系统增强模块加载完成');
