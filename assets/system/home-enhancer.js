/* ============================================================
   家园系统增强 v2.0
   宅邸、家具、装饰、种植
   ============================================================ */

const HomeSystemEnhancer = {
  
  home: {
    name: '我的府邸',
    location: '安仁坊',
    level: 1,
    furniture: [],
    decorations: [],
    garden: null,
  },
  
  furnitureCatalog: [
    { id: 'bed', name: '雕花大床', type: 'bed', price: 200 },
    { id: 'desk', name: '书案', type: 'desk', price: 100 },
    { id: 'chair', name: '圈椅', type: 'chair', price: 50 },
    { id: 'bookshelf', name: '书架', type: 'storage', price: 150 },
    { id: 'table', name: '八仙桌', type: 'table', price: 80 },
  ],
  
  decorationCatalog: [
    { id: 'painting', name: '山水画', type: 'wall', price: 120 },
    { id: 'vase', name: '青花瓷瓶', type: 'table', price: 80 },
    { id: 'lamp', name: '宫灯', type: 'floor', price: 60 },
    { id: 'plant', name: '盆栽', type: 'floor', price: 30 },
  ],
  
  homePanel: null,
  
  init() {
    this.createHomePanel();
    console.log('[Home] 家园系统初始化完成');
  },
  
  createHomePanel() {
    this.homePanel = document.createElement('div');
    this.homePanel.style.cssText = `
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
    
    document.body.appendChild(this.homePanel);
  },
  
  showHomePanel() {
    this.renderHomePanel();
    this.homePanel.style.display = 'block';
  },
  
  closeHomePanel() {
    this.homePanel.style.display = 'none';
  },
  
  renderHomePanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🏠 我的府邸
      </div>
      
      <div style="text-align: center; margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
        <div style="font-size: 20px; font-weight: bold; color: #ffd700;">${this.home.name}</div>
        <div style="margin-top: 5px; opacity: 0.8;">📍 ${this.home.location} · Lv.${this.home.level}</div>
      </div>
    `;
    
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffb6c1;">🪑 家具 (${this.home.furniture.length})</div>
    `;
    
    if (this.home.furniture.length === 0) {
      html += '<div style="opacity: 0.5; text-align: center; padding: 20px;">还没有家具，去购买一些吧！</div>';
    } else {
      this.home.furniture.forEach(item => {
        html += `
          <div style="padding: 8px; margin-bottom: 5px; background: rgba(0,0,0,0.2); border-radius: 6px;">
            ${item.name}
          </div>
        `;
      });
    }
    
    html += `</div>`;
    
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">🎨 装饰 (${this.home.decorations.length})</div>
    `;
    
    if (this.home.decorations.length === 0) {
      html += '<div style="opacity: 0.5; text-align: center; padding: 20px;">还没有装饰，让家更温馨一些吧！</div>';
    } else {
      this.home.decorations.forEach(item => {
        html += `
          <div style="padding: 8px; margin-bottom: 5px; background: rgba(0,0,0,0.2); border-radius: 6px;">
            ${item.name}
          </div>
        `;
      });
    }
    
    html += `</div>`;
    
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #4CAF50;">🛒 家具商店</div>
    `;
    
    this.furnitureCatalog.forEach(item => {
      html += `
        <div style="padding: 10px; margin-bottom: 5px; background: rgba(0,0,0,0.2); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: bold;">${item.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">${item.price} 文</div>
          </div>
          <button onclick="HomeSystemEnhancer.buyFurniture('${item.id}')" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
            购买
          </button>
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="HomeSystemEnhancer.closeHomePanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.homePanel.innerHTML = html;
  },
  
  buyFurniture(itemId) {
    const item = this.furnitureCatalog.find(i => i.id === itemId);
    if (!item) return;
    
    console.log('[Home] 购买家具:', item.name);
    
    this.home.furniture.push(item);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('购买成功', `你购买了 ${item.name}`);
    }
    
    this.renderHomePanel();
  }
};

window.HomeSystemEnhancer = HomeSystemEnhancer;

console.log('[Home] 家园系统增强模块加载完成');
