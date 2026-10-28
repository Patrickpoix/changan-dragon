/* ============================================================
   商店拍卖行系统增强 v2.0
   商店、拍卖行、购买、出售、交易
   ============================================================ */

const ShopAuctionEnhancer = {
  
  shopItems: [
    { id: 'rice', name: '米饭', price: 5, type: 'food', desc: '恢复10点体力' },
    { id: 'wine', name: '葡萄酒', price: 20, type: 'drink', desc: '恢复30点体力' },
    { id: 'sword', name: '铁剑', price: 100, type: 'weapon', desc: '攻击+10' },
    { id: 'armor', name: '皮甲', price: 80, type: 'armor', desc: '防御+5' },
    { id: 'horse', name: '马', price: 500, type: 'mount', desc: '坐骑，速度+5' },
  ],
  
  auctionItems: [
    { id: 'rare_sword', name: '精钢剑', price: 500, seller: '李白', desc: '攻击+30，稀有品质' },
    { id: 'rare_armor', name: '铁甲', price: 400, seller: '杜甫', desc: '防御+20，稀有品质' },
  ],
  
  gold: 1000,
  
  shopPanel: null,
  
  auctionPanel: null,
  
  init() {
    this.createShopPanel();
    this.createAuctionPanel();
    console.log('[Shop] 商店拍卖行系统初始化完成，金币:', this.gold);
  },
  
  createShopPanel() {
    this.shopPanel = document.createElement('div');
    this.shopPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
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
    
    document.body.appendChild(this.shopPanel);
  },
  
  createAuctionPanel() {
    this.auctionPanel = document.createElement('div');
    this.auctionPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
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
    
    document.body.appendChild(this.auctionPanel);
  },
  
  showShop() {
    this.renderShop();
    this.shopPanel.style.display = 'block';
  },
  
  closeShop() {
    this.shopPanel.style.display = 'none';
  },
  
  renderShop() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🏪 商店
        <span style="float: right; font-size: 16px; color: #FFD700;">金币: ${this.gold}</span>
      </div>
    `;
    
    this.shopItems.forEach(item => {
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #d4af37;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold;">${item.name}</div>
              <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">${item.desc}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="color: #FFD700;">${item.price} 文</div>
              <button onclick="ShopAuctionEnhancer.buyItem('${item.id}')" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
                购买
              </button>
            </div>
          </div>
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="ShopAuctionEnhancer.closeShop()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.shopPanel.innerHTML = html;
  },
  
  buyItem(itemId) {
    const item = this.shopItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (this.gold < item.price) {
      console.log('[Shop] 金币不足');
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.error('金币不足', '你没有足够的金币！');
      }
      return;
    }
    
    this.gold -= item.price;
    
    console.log('[Shop] 购买物品:', item.name, '花费:', item.price);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('购买成功', `你购买了 ${item.name}！`);
    }
    
    this.renderShop();
  },
  
  showAuction() {
    this.renderAuction();
    this.auctionPanel.style.display = 'block';
  },
  
  closeAuction() {
    this.auctionPanel.style.display = 'none';
  },
  
  renderAuction() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🏛️ 拍卖行
        <span style="float: right; font-size: 16px; color: #FFD700;">金币: ${this.gold}</span>
      </div>
    `;
    
    this.auctionItems.forEach(item => {
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #9C27B0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold; color: #CE93D8;">${item.name}</div>
              <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">${item.desc}</div>
              <div style="font-size: 11px; opacity: 0.5; margin-top: 3px;">卖家: ${item.seller}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="color: #FFD700;">${item.price} 文</div>
              <button onclick="ShopAuctionEnhancer.buyAuctionItem('${item.id}')" style="padding: 5px 10px; background: #9C27B0; border: none; color: #fff; border-radius: 4px; cursor: pointer;">
                竞拍
              </button>
            </div>
          </div>
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="ShopAuctionEnhancer.closeAuction()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.auctionPanel.innerHTML = html;
  },
  
  buyAuctionItem(itemId) {
    const item = this.auctionItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (this.gold < item.price) {
      console.log('[Auction] 金币不足');
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.error('金币不足', '你没有足够的金币！');
      }
      return;
    }
    
    this.gold -= item.price;
    
    console.log('[Auction] 竞拍成功:', item.name, '花费:', item.price);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('竞拍成功', `你拍到了 ${item.name}！`);
    }
    
    this.renderAuction();
  }
};

window.ShopAuctionEnhancer = ShopAuctionEnhancer;

console.log('[Shop] 商店拍卖行系统增强模块加载完成');
