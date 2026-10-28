/* ============================================================
   唐代市井生活系统增强 v2.0
   市井、百姓、小贩、街头表演
   ============================================================ */

const CityLifeSystemEnhancer = {
  
  professions: [
    {
      id: 'prof_001',
      name: '卖花姑娘',
      type: '小贩',
      desc: '在街头售卖鲜花，花香四溢',
      location: '朱雀大街',
      met: false,
    },
    {
      id: 'prof_002',
      name: '说书先生',
      type: '艺人',
      desc: '在茶馆说书，讲述历史故事和英雄传说',
      location: '西市茶馆',
      met: false,
    },
    {
      id: 'prof_003',
      name: '杂耍艺人',
      type: '艺人',
      desc: '在街头表演杂耍，吸引围观群众',
      location: '东市广场',
      met: false,
    },
    {
      id: 'prof_004',
      name: '算命先生',
      type: '术士',
      desc: '在街边算命，预测吉凶祸福',
      location: '城隍庙前',
      met: false,
    },
    {
      id: 'prof_005',
      name: '卖艺江湖',
      type: '艺人',
      desc: '表演武术和杂技，行走江湖',
      location: '城门边',
      met: false,
    },
  ],
  
  streetFoods: [
    {
      id: 'food_001',
      name: '胡饼',
      desc: '刚出炉的芝麻胡饼，香酥可口',
      tried: false,
    },
    {
      id: 'food_002',
      name: '蒸饼',
      desc: '热腾腾的蒸饼，有各种馅料',
      tried: false,
    },
    {
      id: 'food_003',
      name: '酥饼',
      desc: '酥脆香甜的酥饼，入口即化',
      tried: false,
    },
    {
      id: 'food_004',
      name: '奶茶',
      desc: '西域传入的奶茶，香醇浓郁',
      tried: false,
    },
  ],
  
  cityLifePanel: null,
  
  init() {
    this.createCityLifePanel();
    console.log('[CityLife] 唐代市井生活系统初始化完成');
  },
  
  createCityLifePanel() {
    this.cityLifePanel = document.createElement('div');
    this.cityLifePanel.style.cssText = `
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
    
    document.body.appendChild(this.cityLifePanel);
  },
  
  showCityLifePanel() {
    this.renderCityLifePanel();
    this.cityLifePanel.style.display = 'block';
  },
  
  closeCityLifePanel() {
    this.cityLifePanel.style.display = 'none';
  },
  
  renderCityLifePanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🏮 市井生活
      </div>
    `;
    
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">👥 市井人物</div>
    `;
    
    this.professions.forEach(prof => {
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${prof.met ? '#4CAF50' : '#d4af37'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div style="font-weight: bold; color: ${prof.met ? '#4CAF50' : '#ffd700'}">${prof.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">${prof.type}</div>
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">${prof.desc}</div>
          <div style="font-size: 11px; opacity: 0.6; margin-bottom: 8px;">📍 ${prof.location}</div>
          <button onclick="CityLifeSystemEnhancer.meet('${prof.id}')" style="padding: 5px 15px; background: ${prof.met ? '#666' : '#d4af37'}; border: none; color: ${prof.met ? '#999' : '#000'}; border-radius: 4px; cursor: ${prof.met ? 'default' : 'pointer'};">
            ${prof.met ? '已认识' : '打招呼'}
          </button>
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div>
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffb6c1;">🍢 街头小吃</div>
    `;
    
    this.streetFoods.forEach(food => {
      html += `
        <div style="padding: 10px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: bold; color: ${food.tried ? '#4CAF50' : '#ffd700'}">${food.name}</div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">${food.desc}</div>
          </div>
          <button onclick="CityLifeSystemEnhancer.taste('${food.id}')" style="padding: 5px 15px; background: ${food.tried ? '#666' : '#ffb6c1'}; border: none; color: ${food.tried ? '#999' : '#000'}; border-radius: 4px; cursor: ${food.tried ? 'default' : 'pointer'};">
            ${food.tried ? '已品尝' : '品尝'}
          </button>
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="CityLifeSystemEnhancer.closeCityLifePanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.cityLifePanel.innerHTML = html;
  },
  
  meet(profId) {
    const prof = this.professions.find(p => p.id === profId);
    if (!prof || prof.met) return;
    
    prof.met = true;
    
    console.log('[CityLife] 认识了:', prof.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('认识新朋友！', `你认识了 ${prof.name}！`);
    }
    
    this.renderCityLifePanel();
  },
  
  taste(foodId) {
    const food = this.streetFoods.find(f => f.id === foodId);
    if (!food || food.tried) return;
    
    food.tried = true;
    
    console.log('[CityLife] 品尝了:', food.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('品尝成功！', `你品尝了 ${food.name}，味道不错！`);
    }
    
    this.renderCityLifePanel();
  }
};

window.CityLifeSystemEnhancer = CityLifeSystemEnhancer;

console.log('[CityLife] 唐代市井生活系统增强模块加载完成');
