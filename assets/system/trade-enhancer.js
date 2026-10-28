/* ============================================================
   唐代商业贸易系统增强 v2.0
   东西市、店铺、交易、物价
   ============================================================ */

const TradeSystemEnhancer = {
  
  shops: [
    {
      id: 'shop_001',
      name: '西市肉铺',
      type: '食品',
      desc: '售卖各种肉类，新鲜美味',
      goods: ['猪肉', '牛肉', '羊肉', '鸡肉'],
    },
    {
      id: 'shop_002',
      name: '东市绸缎庄',
      type: '布料',
      desc: '售卖各种丝绸布料，华丽精美',
      goods: ['蜀锦', '绫罗', '绸缎', '麻布'],
    },
    {
      id: 'shop_003',
      name: '西市药铺',
      type: '药品',
      desc: '售卖各种药材，治病救人',
      goods: ['人参', '当归', '黄芪', '甘草'],
    },
    {
      id: 'shop_004',
      name: '东市珠宝行',
      type: '珠宝',
      desc: '售卖各种珠宝首饰，珍贵稀有',
      goods: ['珍珠', '玛瑙', '翡翠', '黄金'],
    },
    {
      id: 'shop_005',
      name: '西市茶铺',
      type: '饮品',
      desc: '售卖各种茶叶，香气扑鼻',
      goods: ['龙井茶', '碧螺春', '铁观音', '普洱茶'],
    },
  ],
  
  gold: 1000,
  
  inventory: new Map(),
  
  tradePanel: null,
  
  init() {
    this.createTradePanel();
    console.log('[Trade] 唐代商业贸易系统初始化完成');
  },
  
  createTradePanel() {
    this.tradePanel = document.createElement('div');
    this.tradePanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 800px;
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
    
    document.body.appendChild(this.tradePanel);
  },
  
  showTradePanel() {
    this.renderTradePanel();
    this.tradePanel.style.display = 'block';
  },
  
  closeTradePanel() {
    this.tradePanel.style.display = 'none';
  },
  
  renderTradePanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🏪 长安市集
        <span style="float: right; font-size: 16px; color: #d4af37;">💰 ${this.gold} 文</span>
      </div>
    `;
    
    this.shops.forEach(shop => {
      html += `
        <div style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px; color: #d4af37;">${shop.name}</div>
          <div style="font-size: 12px; opacity: 0.7; margin-bottom: 10px;">${shop.type} - ${shop.desc}</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
      `;
      
      shop.goods.forEach(good => {
        const price = Math.floor(Math.random() * 50) + 10;
        html += `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">
            <span>${good}</span>
            <div>
              <span style="font-size: 12px; margin-right: 10px; opacity: 0.8;">${price} 文</span>
              <button onclick="TradeSystemEnhancer.buyGood('${good}', ${price})" style="padding: 3px 10px; background: #4CAF50; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 12px;">购买</button>
            </div>
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="TradeSystemEnhancer.closeTradePanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.tradePanel.innerHTML = html;
  },
  
  buyGood(goodName, price) {
    if (this.gold < price) {
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.error('金钱不足', `你需要 ${price} 文钱`);
      }
      return;
    }
    
    this.gold -= price;
    this.inventory.set(goodName, (this.inventory.get(goodName) || 0) + 1);
    
    console.log('[Trade] 购买:', goodName, '-', price, '文');
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('购买成功！', `你购买了 ${goodName}`);
    }
    
    this.renderTradePanel();
  }
};

window.TradeSystemEnhancer = TradeSystemEnhancer;

console.log('[Trade] 唐代商业贸易系统增强模块加载完成');
