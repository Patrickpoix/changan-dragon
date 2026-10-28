/* ============================================================
   唐代美食烹饪系统增强 v2.0
   美食、烹饪、食谱、品尝
   ============================================================ */

const CuisineSystemEnhancer = {
  
  dishes: [
    {
      id: 'dish_001',
      name: '胡饼',
      dynasty: '唐',
      desc: '西域传入的烤饼，芝麻香酥，是长安最常见的主食',
      price: 5,
      effect: '恢复10点体力',
      learned: false,
    },
    {
      id: 'dish_002',
      name: '毕罗',
      dynasty: '唐',
      desc: '唐代的一种馅料饭食，有樱桃毕罗、蟹黄毕罗等',
      price: 15,
      effect: '恢复30点体力',
      learned: false,
    },
    {
      id: 'dish_003',
      name: '烧尾宴',
      dynasty: '唐',
      desc: '唐代豪华宴席，升官必设，菜品多达数十道',
      price: 100,
      effect: '全属性临时提升',
      learned: false,
    },
    {
      id: 'dish_004',
      name: '酥山',
      dynasty: '唐',
      desc: '唐代冰淇淋，奶油制成，冰凉甜美',
      price: 20,
      effect: '恢复20点魔力',
      learned: false,
    },
    {
      id: 'dish_005',
      name: '三勒浆',
      dynasty: '唐',
      desc: '唐代名酒，由三种果实酿制而成',
      price: 30,
      effect: '短暂提升攻击力',
      learned: false,
    },
  ],
  
  tastedDishes: new Set(),
  
  cuisinePanel: null,
  
  init() {
    this.createCuisinePanel();
    console.log('[Cuisine] 唐代美食烹饪系统初始化完成');
  },
  
  createCuisinePanel() {
    this.cuisinePanel = document.createElement('div');
    this.cuisinePanel.style.cssText = `
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
    
    document.body.appendChild(this.cuisinePanel);
  },
  
  showCuisinePanel() {
    this.renderCuisinePanel();
    this.cuisinePanel.style.display = 'block';
  },
  
  closeCuisinePanel() {
    this.cuisinePanel.style.display = 'none';
  },
  
  renderCuisinePanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🍜 长安美食
      </div>
    `;
    
    this.dishes.forEach(dish => {
      const tasted = this.tastedDishes.has(dish.id);
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${tasted ? '#4CAF50' : '#d4af37'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div style="font-weight: bold; color: ${tasted ? '#4CAF50' : '#ffd700'}">${dish.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">${dish.price} 文</div>
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 3px;">${dish.desc}</div>
          <div style="font-size: 11px; opacity: 0.6; margin-bottom: 8px;">效果: ${dish.effect}</div>
          <button onclick="CuisineSystemEnhancer.tasteDish('${dish.id}')" style="padding: 5px 10px; background: ${tasted ? '#666' : '#d4af37'}; border: none; color: ${tasted ? '#999' : '#000'}; border-radius: 4px; cursor: ${tasted ? 'default' : 'pointer'};">
            ${tasted ? '已品尝' : '品尝'}
          </button>
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="CuisineSystemEnhancer.closeCuisinePanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.cuisinePanel.innerHTML = html;
  },
  
  tasteDish(dishId) {
    const dish = this.dishes.find(d => d.id === dishId);
    if (!dish) return;
    
    if (this.tastedDishes.has(dishId)) return;
    
    this.tastedDishes.add(dishId);
    
    console.log('[Cuisine] 品尝美食:', dish.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('品尝成功！', `你品尝了 ${dish.name}！${dish.effect}`);
    }
    
    this.renderCuisinePanel();
  }
};

window.CuisineSystemEnhancer = CuisineSystemEnhancer;

console.log('[Cuisine] 唐代美食烹饪系统增强模块加载完成');
