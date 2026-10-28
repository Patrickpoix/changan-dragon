/* ============================================================
   家园建造家具装饰园林布置系统增强 v2.0
   家园建造、家具装饰、园林布置
   ============================================================ */

const HomeDecorEnhancer = {
  
  homeLevel: 1,
  
  homeArea: 100,
  
  placedFurniture: [],
  
  furnitureCatalog: [
    { id: 'table', name: '木桌', category: '家具', price: 50, desc: '一张漂亮的木桌' },
    { id: 'chair', name: '木椅', category: '家具', price: 30, desc: '一把舒适的木椅' },
    { id: 'bed', name: '床', category: '家具', price: 100, desc: '一张柔软的床' },
    { id: 'painting', name: '山水画', category: '装饰', price: 80, desc: '一幅精美的山水画' },
    { id: 'plant', name: '盆栽', category: '装饰', price: 20, desc: '一盆绿色植物' },
    { id: 'rock', name: '假山', category: '园林', price: 200, desc: '一座假山' },
    { id: 'pond', name: '池塘', category: '园林', price: 300, desc: '一个小池塘' },
  ],
  
  homePanel: null,
  
  currentTab: 'overview',
  
  init() {
    this.createHomePanel();
    console.log('[Home] 家园建造家具装饰园林布置系统初始化完成');
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
        🏠 我的家园
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
        <button onclick="HomeDecorEnhancer.setTab('overview')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'overview' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'overview' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          概览
        </button>
        <button onclick="HomeDecorEnhancer.setTab('furniture')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'furniture' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'furniture' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          家具装饰
        </button>
        <button onclick="HomeDecorEnhancer.setTab('garden')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'garden' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'garden' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          园林布置
        </button>
      </div>
    `;
    
    if (this.currentTab === 'overview') {
      html += `
        <div style="margin-bottom: 20px; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 15px;">
            <div style="font-size: 48px;">🏡</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
            <div style="text-align: center; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px;">
              <div style="font-size: 20px; font-weight: bold; color: #d4af37;">Lv.${this.homeLevel}</div>
              <div style="font-size: 12px; opacity: 0.7;">家园等级</div>
            </div>
            <div style="text-align: center; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px;">
              <div style="font-size: 20px; font-weight: bold; color: #d4af37;">${this.homeArea}㎡</div>
              <div style="font-size: 12px; opacity: 0.7;">家园面积</div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 15px; opacity: 0.7;">
            已放置家具：${this.placedFurniture.length} 件
          </div>
        </div>
      `;
    } else if (this.currentTab === 'furniture') {
      html += `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">可购买家具装饰</div>
      `;
      
      this.furnitureCatalog.filter(f => f.category === '家具' || f.category === '装饰').forEach(item => {
        html += `
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #d4af37;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: bold;">${item.name}</div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">${item.desc}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="color: #FFD700;">${item.price} 文</div>
                <button onclick="HomeDecorEnhancer.buyFurniture('${item.id}')" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
                  购买
                </button>
              </div>
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
    } else {
      html += `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #4CAF50;">可购买园林装饰</div>
      `;
      
      this.furnitureCatalog.filter(f => f.category === '园林').forEach(item => {
        html += `
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #4CAF50;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: bold; color: #8bc34a;">${item.name}</div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">${item.desc}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="color: #FFD700;">${item.price} 文</div>
                <button onclick="HomeDecorEnhancer.buyFurniture('${item.id}')" style="padding: 5px 10px; background: #4CAF50; border: none; color: #fff; border-radius: 4px; cursor: pointer;">
                  购买
                </button>
              </div>
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="HomeDecorEnhancer.closeHomePanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.homePanel.innerHTML = html;
  },
  
  setTab(tab) {
    this.currentTab = tab;
    this.renderHomePanel();
  },
  
  buyFurniture(itemId) {
    const item = this.furnitureCatalog.find(f => f.id === itemId);
    if (!item) return;
    
    this.placedFurniture.push(item);
    
    console.log('[Home] 购买家具:', item.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('购买成功', `你购买了 ${item.name}！`);
    }
    
    this.renderHomePanel();
  }
};

window.HomeDecorEnhancer = HomeDecorEnhancer;

console.log('[Home] 家园建造家具装饰园林布置系统增强模块加载完成');
