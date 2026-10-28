/* ============================================================
   货币商店交易拍卖行经济系统增强 v2.0
   货币、商店、交易、拍卖行、经济系统
   ============================================================ */

const EconomyShopEnhancer = {
  
  currencies: {
    copper: { name: '铜钱', amount: 1000, icon: '🪙' },
    silver: { name: '银两', amount: 100, icon: '🥈' },
    gold: { name: '金锭', amount: 10, icon: '🥇' },
  },
  
  exchangeRate: {
    copperToSilver: 100,
    silverToGold: 100,
  },
  
  shopItems: [
    { id: 'potion_hp', name: '回血药', price: 50, currency: 'copper', type: 'consumable', desc: '恢复50点生命值' },
    { id: 'potion_mp', name: '回蓝药', price: 40, currency: 'copper', type: 'consumable', desc: '恢复30点法力值' },
    { id: 'food_rice', name: '米饭', price: 10, currency: 'copper', type: 'food', desc: '恢复10点体力' },
    { id: 'food_wine', name: '葡萄酒', price: 30, currency: 'copper', type: 'food', desc: '恢复30点体力' },
    { id: 'weapon_sword', name: '铁剑', price: 500, currency: 'silver', type: 'weapon', desc: '攻击+15' },
    { id: 'armor_leather', name: '皮甲', price: 300, currency: 'silver', type: 'armor', desc: '防御+8' },
  ],
  
  auctionItems: [
    { id: 'rare_sword', name: '精钢剑', price: 50, currency: 'silver', seller: '李白', desc: '攻击+30，稀有品质' },
    { id: 'rare_armor', name: '钢甲', price: 80, currency: 'silver', seller: '杜甫', desc: '防御+20，稀有品质' },
    { id: 'legendary_gem', name: '传奇宝石', price: 5, currency: 'gold', seller: '玄奘', desc: '可镶嵌在装备上' },
  ],
  
  economyPanel: null,
  
  currentTab: 'currency',
  
  init() {
    this.createEconomyPanel();
    console.log('[Economy] 货币商店交易拍卖行经济系统初始化完成');
  },
  
  createEconomyPanel() {
    this.economyPanel = document.createElement('div');
    this.economyPanel.style.cssText = `
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
    
    document.body.appendChild(this.economyPanel);
  },
  
  showEconomyPanel() {
    this.renderEconomyPanel();
    this.economyPanel.style.display = 'block';
  },
  
  closeEconomyPanel() {
    this.economyPanel.style.display = 'none';
  },
  
  renderEconomyPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        💰 经济系统
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
        <button onclick="EconomyShopEnhancer.setTab('currency')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'currency' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'currency' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          货币
        </button>
        <button onclick="EconomyShopEnhancer.setTab('shop')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'shop' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'shop' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          商店
        </button>
        <button onclick="EconomyShopEnhancer.setTab('auction')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'auction' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'auction' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          拍卖行
        </button>
      </div>
    `;
    
    if (this.currentTab === 'currency') {
      html += `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      `;
      
      for (const curKey in this.currencies) {
        const cur = this.currencies[curKey];
        html += `
          <div style="padding: 20px; background: rgba(0,0,0,0.2); border-radius: 8px; text-align: center; border-bottom: 3px solid ${curKey === 'copper' ? '#CD7F32' : curKey === 'silver' ? '#C0C0C0' : '#FFD700'};">
            <div style="font-size: 32px; margin-bottom: 10px;">${cur.icon}</div>
            <div style="font-size: 20px; font-weight: bold;">${cur.amount}</div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">${cur.name}</div>
          </div>
        `;
      }
      
      html += `</div>`;
      
      html += `
        <div style="padding: 15px; background: rgba(0,0,0,0.15); border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">兑换汇率</div>
          <div style="font-size: 12px; opacity: 0.8; line-height: 1.8;">
            100 铜钱 = 1 银两<br>
            100 银两 = 1 金锭
          </div>
        </div>
      `;
    } else if (this.currentTab === 'shop') {
      this.shopItems.forEach(item => {
        const cur = this.currencies[item.currency];
        html += `
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #d4af37;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: bold;">${item.name}</div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">${item.desc}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="color: #FFD700;">${item.price} ${cur.name}</div>
                <button onclick="EconomyShopEnhancer.buyItem('${item.id}')" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
                  购买
                </button>
              </div>
            </div>
          </div>
        `;
      });
    } else {
      this.auctionItems.forEach(item => {
        const cur = this.currencies[item.currency];
        html += `
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #9C27B0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: bold; color: #CE93D8;">${item.name}</div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">${item.desc}</div>
                <div style="font-size: 11px; opacity: 0.5; margin-top: 3px;">卖家: ${item.seller}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="color: #FFD700;">${item.price} ${cur.name}</div>
                <button onclick="EconomyShopEnhancer.bidItem('${item.id}')" style="padding: 5px 10px; background: #9C27B0; border: none; color: #fff; border-radius: 4px; cursor: pointer;">
                  竞拍
                </button>
              </div>
            </div>
          </div>
        `;
      });
    }
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="EconomyShopEnhancer.closeEconomyPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.economyPanel.innerHTML = html;
  },
  
  setTab(tab) {
    this.currentTab = tab;
    this.renderEconomyPanel();
  },
  
  buyItem(itemId) {
    const item = this.shopItems.find(i => i.id === itemId);
    if (!item) return;
    
    const cur = this.currencies[item.currency];
    
    if (cur.amount < item.price) {
      console.log('[Economy] 货币不足');
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.error('货币不足', `你没有足够的${cur.name}！`);
      }
      return;
    }
    
    cur.amount -= item.price;
    
    console.log('[Economy] 购买物品:', item.name, '花费:', item.price, cur.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('购买成功', `你购买了 ${item.name}！`);
    }
    
    this.renderEconomyPanel();
  },
  
  bidItem(itemId) {
    const item = this.auctionItems.find(i => i.id === itemId);
    if (!item) return;
    
    const cur = this.currencies[item.currency];
    
    if (cur.amount < item.price) {
      console.log('[Economy] 货币不足');
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.error('货币不足', `你没有足够的${cur.name}！`);
      }
      return;
    }
    
    cur.amount -= item.price;
    
    console.log('[Economy] 竞拍成功:', item.name, '花费:', item.price, cur.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('竞拍成功', `你拍到了 ${item.name}！`);
    }
    
    this.renderEconomyPanel();
  }
};

window.EconomyShopEnhancer = EconomyShopEnhancer;

console.log('[Economy] 货币商店交易拍卖行经济系统增强模块加载完成');
