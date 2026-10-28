/* ============================================================
   经济系统增强 v2.0
   货币、商店、交易、物价
   ============================================================ */

const EconomySystemEnhancer = {
  
  coins: 100,
  
  shops: [
    { id: 'grocery', name: '杂货店', type: 'general' },
    { id: 'teahouse', name: '茶馆', type: 'food' },
    { id: 'cloth_shop', name: '布庄', type: 'clothing' },
    { id: 'antique', name: '古董店', type: 'collectible' },
  ],
  
  items: {
    tea: { name: '长安茶', price: 10, type: 'food' },
    pastry: { name: '胡饼', price: 5, type: 'food' },
    silk: { name: '丝绸', price: 50, type: 'clothing' },
    porcelain: { name: '唐三彩', price: 100, type: 'collectible' },
    scroll: { name: '法帖', price: 80, type: 'collectible' },
  },
  
  shopPanel: null,
  
  init() {
    this.createShopPanel();
    console.log('[Economy] 经济系统初始化完成，初始铜钱:', this.coins);
  },
  
  createShopPanel() {
    this.shopPanel = document.createElement('div');
    this.shopPanel.style.cssText = `
      position: absolute;
      right: 300px;
      top: 150px;
      width: 300px;
      max-height: 400px;
      background: rgba(139, 69, 19, 0.95);
      border: 2px solid #d4af37;
      border-radius: 8px;
      padding: 15px;
      color: #ffd700;
      font-family: serif;
      font-size: 14px;
      overflow-y: auto;
      display: none;
      z-index: 1000;
    `;
    
    document.body.appendChild(this.shopPanel);
  },
  
  showCoins() {
    const coinDisplay = document.createElement('div');
    coinDisplay.id = 'coin-display';
    coinDisplay.style.cssText = `
      position: absolute;
      left: 20px;
      top: 20px;
      background: rgba(139, 69, 19, 0.8);
      border: 2px solid #d4af37;
      border-radius: 4px;
      padding: 8px 12px;
      color: #ffd700;
      font-family: serif;
      font-size: 16px;
    `;
    coinDisplay.textContent = `💰 ${this.coins} 文`;
    
    document.body.appendChild(coinDisplay);
  },
  
  updateCoinDisplay() {
    const coinDisplay = document.getElementById('coin-display');
    if (coinDisplay) {
      coinDisplay.textContent = `💰 ${this.coins} 文`;
    }
  },
  
  buyItem(itemId, quantity = 1) {
    const item = this.items[itemId];
    if (!item) return false;
    
    const totalPrice = item.price * quantity;
    
    if (this.coins >= totalPrice) {
      this.coins -= totalPrice;
      this.updateCoinDisplay();
      
      console.log(`[Economy] 购买 ${item.name} x${quantity}，花费 ${totalPrice} 文`);
      
      if (window.InventorySystemEnhancer) {
        InventorySystemEnhancer.addItem(itemId, quantity);
      }
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.success('购买成功', `获得 ${item.name} x${quantity}`);
      }
      
      return true;
    } else {
      console.log('[Economy] 铜钱不足');
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.error('铜钱不足', `需要 ${totalPrice} 文，你只有 ${this.coins} 文`);
      }
      
      return false;
    }
  },
  
  sellItem(itemId, quantity = 1) {
    const item = this.items[itemId];
    if (!item) return false;
    
    const sellPrice = Math.floor(item.price / 2) * quantity;
    
    this.coins += sellPrice;
    this.updateCoinDisplay();
    
    console.log(`[Economy] 出售 ${item.name} x${quantity}，获得 ${sellPrice} 文`);
    
    if (window.InventorySystemEnhancer) {
      InventorySystemEnhancer.removeItem(itemId, quantity);
    }
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('出售成功', `获得 ${sellPrice} 文铜钱`);
    }
    
    return true;
  },
  
  showShop(shopType) {
    this.shopPanel.style.display = 'block';
    this.renderShop(shopType);
  },
  
  closeShop() {
    this.shopPanel.style.display = 'none';
  },
  
  renderShop(shopType) {
    let html = `
      <div style="font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 15px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
        ${shopType === 'food' ? '茶馆' : shopType === 'clothing' ? '布庄' : shopType === 'collectible' ? '古董店' : '杂货店'}
      </div>
    `;
    
    for (const itemId in this.items) {
      const item = this.items[itemId];
      
      if (shopType !== 'general' && item.type !== shopType) continue;
      
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-bottom: 5px; background: rgba(0,0,0,0.2); border-radius: 4px;">
          <div>
            <div style="font-weight: bold;">${item.name}</div>
            <div style="font-size: 12px; color: #ffd700;">${item.price} 文</div>
          </div>
          <button onclick="EconomySystemEnhancer.buyItem('${itemId}')" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
            购买
          </button>
        </div>
      `;
    }
    
    html += `
      <div style="text-align: center; margin-top: 15px;">
        <button onclick="EconomySystemEnhancer.closeShop()" style="padding: 8px 20px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    this.shopPanel.innerHTML = html;
  }
};

window.EconomySystemEnhancer = EconomySystemEnhancer;

console.log('[Economy] 经济系统增强模块加载完成');
