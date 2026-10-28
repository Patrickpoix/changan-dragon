/* ============================================================
   唐代园林山水系统增强 v2.0
   园林、山水、亭台楼阁、曲水流觞
   ============================================================ */

const GardenSystemEnhancer = {
  
  gardens: [
    {
      id: 'garden_001',
      name: '曲江池',
      type: '皇家园林',
      desc: '唐代著名风景区，池水碧波荡漾，亭台楼阁掩映其间',
      location: '城东南',
      visited: false,
    },
    {
      id: 'garden_002',
      name: '芙蓉园',
      type: '皇家园林',
      desc: '唐玄宗的行宫园林，花繁柳密，景色迷人',
      location: '曲江池西',
      visited: false,
    },
    {
      id: 'garden_003',
      name: '辋川别业',
      type: '私人园林',
      desc: '王维的别墅园林，山水相依，诗画合一',
      location: '终南山下',
      visited: false,
    },
    {
      id: 'garden_004',
      name: '乐游原',
      type: '公共园林',
      desc: '长安登高胜地，春天赏花，秋天赏月',
      location: '城东南',
      visited: false,
    },
    {
      id: 'garden_005',
      name: '杏园',
      type: '公共园林',
      desc: '新科进士探花宴举行之地，杏花盛开时美不胜收',
      location: '曲江池西',
      visited: false,
    },
  ],
  
  attractions: [
    {
      id: 'attract_001',
      name: '曲水流觞',
      type: '文人雅集',
      desc: '文人沿溪而坐，酒杯顺流而下，停在谁面前谁就饮酒赋诗',
      discovered: false,
    },
    {
      id: 'attract_002',
      name: '亭台赏月',
      type: '夜景',
      desc: '中秋夜在曲江池畔的亭台中赏月',
      discovered: false,
    },
    {
      id: 'attract_003',
      name: '花萼相辉',
      type: '建筑',
      desc: '兴庆宫内的花萼相辉楼，富丽堂皇',
      discovered: false,
    },
  ],
  
  gardenPanel: null,
  
  init() {
    this.createGardenPanel();
    console.log('[Garden] 唐代园林山水系统初始化完成');
  },
  
  createGardenPanel() {
    this.gardenPanel = document.createElement('div');
    this.gardenPanel.style.cssText = `
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
    
    document.body.appendChild(this.gardenPanel);
  },
  
  showGardenPanel() {
    this.renderGardenPanel();
    this.gardenPanel.style.display = 'block';
  },
  
  closeGardenPanel() {
    this.gardenPanel.style.display = 'none';
  },
  
  renderGardenPanel() {
    let visitedCount = this.gardens.filter(g => g.visited).length;
    let discoveredCount = this.attractions.filter(a => a.discovered).length;
    
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🏞️ 园林山水
        <span style="float: right; font-size: 14px; color: #d4af37;">${visitedCount}/${this.gardens.length} 园林 · ${discoveredCount}/${this.attractions.length} 景点</span>
      </div>
    `;
    
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">🌳 著名园林</div>
    `;
    
    this.gardens.forEach(garden => {
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${garden.visited ? '#4CAF50' : '#d4af37'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div style="font-weight: bold; color: ${garden.visited ? '#4CAF50' : '#ffd700'}">${garden.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">${garden.type}</div>
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">${garden.desc}</div>
          <div style="font-size: 11px; opacity: 0.6; margin-bottom: 8px;">📍 ${garden.location}</div>
          <button onclick="GardenSystemEnhancer.visit('${garden.id}')" style="padding: 5px 15px; background: ${garden.visited ? '#666' : '#4CAF50'}; border: none; color: ${garden.visited ? '#999' : '#fff'}; border-radius: 4px; cursor: ${garden.visited ? 'default' : 'pointer'};">
            ${garden.visited ? '已游览' : '游览'}
          </button>
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div>
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffb6c1;">✨ 特色景点</div>
    `;
    
    this.attractions.forEach(attraction => {
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${attraction.discovered ? '#ffb6c1' : '#666'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div style="font-weight: bold; color: ${attraction.discovered ? '#ffb6c1' : '#999'}">${attraction.discovered ? attraction.name : '？？？'}</div>
            <div style="font-size: 12px; opacity: 0.7;">${attraction.type}</div>
          </div>
          ${attraction.discovered ? `
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">${attraction.desc}</div>
          ` : '<div style="font-size: 12px; opacity: 0.5; margin-bottom: 8px;">未发现</div>'}
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="GardenSystemEnhancer.closeGardenPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.gardenPanel.innerHTML = html;
  },
  
  visit(gardenId) {
    const garden = this.gardens.find(g => g.id === gardenId);
    if (!garden || garden.visited) return;
    
    garden.visited = true;
    
    console.log('[Garden] 游览园林:', garden.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('游览成功！', `你游览了 ${garden.name}，景色美不胜收！`);
    }
    
    this.renderGardenPanel();
  }
};

window.GardenSystemEnhancer = GardenSystemEnhancer;

console.log('[Garden] 唐代园林山水系统增强模块加载完成');
