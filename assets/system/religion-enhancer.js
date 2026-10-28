/* ============================================================
   唐代宗教信仰系统增强 v2.0
   佛教、道教、寺庙、道观、祈福
   ============================================================ */

const ReligionSystemEnhancer = {
  
  temples: [
    {
      id: 'temple_001',
      name: '大慈恩寺',
      type: '佛教',
      desc: '唐代著名寺庙，玄奘法师曾在此翻译佛经',
      location: '大雁塔旁',
      blessing: '智慧加持',
    },
    {
      id: 'temple_002',
      name: '大兴善寺',
      type: '佛教',
      desc: '唐代密宗发源地，长安三大译经场之一',
      location: '靖善坊',
      blessing: '平安健康',
    },
    {
      id: 'temple_003',
      name: '青龙寺',
      type: '佛教',
      desc: '唐代著名佛教寺院，日本真言宗祖庭',
      location: '乐游原',
      blessing: '好运连连',
    },
    {
      id: 'temple_004',
      name: '玄都观',
      type: '道教',
      desc: '唐代著名道观，桃花盛开时游人如织',
      location: '崇业坊',
      blessing: '延年益寿',
    },
    {
      id: 'temple_005',
      name: '昊天观',
      type: '道教',
      desc: '唐代皇家道观，供奉昊天上帝',
      location: '安仁坊',
      blessing: '事业有成',
    },
  ],
  
  blessedTemples: new Set(),
  
  religionPanel: null,
  
  init() {
    this.createReligionPanel();
    console.log('[Religion] 唐代宗教信仰系统初始化完成');
  },
  
  createReligionPanel() {
    this.religionPanel = document.createElement('div');
    this.religionPanel.style.cssText = `
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
    
    document.body.appendChild(this.religionPanel);
  },
  
  showReligionPanel() {
    this.renderReligionPanel();
    this.religionPanel.style.display = 'block';
  },
  
  closeReligionPanel() {
    this.religionPanel.style.display = 'none';
  },
  
  renderReligionPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🛕 寺庙道观
      </div>
    `;
    
    this.temples.forEach(temple => {
      const blessed = this.blessedTemples.has(temple.id);
      html += `
        <div style="padding: 15px; margin-bottom: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${blessed ? '#4CAF50' : temple.type === '佛教' ? '#FF6B6B' : '#4ECDC4'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div style="font-weight: bold; color: ${blessed ? '#4CAF50' : '#ffd700'}">${temple.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">${temple.type}</div>
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">${temple.desc}</div>
          <div style="font-size: 11px; opacity: 0.6; margin-bottom: 10px;">📍 ${temple.location} · ✨ 祈福: ${temple.blessing}</div>
          <button onclick="ReligionSystemEnhancer.bless('${temple.id}')" style="padding: 5px 15px; background: ${blessed ? '#666' : temple.type === '佛教' ? '#FF6B6B' : '#4ECDC4'}; border: none; color: ${blessed ? '#999' : '#fff'}; border-radius: 4px; cursor: ${blessed ? 'default' : 'pointer'};">
            ${blessed ? '已祈福' : '祈福'}
          </button>
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="ReligionSystemEnhancer.closeReligionPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.religionPanel.innerHTML = html;
  },
  
  bless(templeId) {
    const temple = this.temples.find(t => t.id === templeId);
    if (!temple || this.blessedTemples.has(templeId)) return;
    
    this.blessedTemples.add(templeId);
    
    console.log('[Religion] 祈福:', temple.name, '-', temple.blessing);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('祈福成功！', `${temple.name} 保佑你: ${temple.blessing}`);
    }
    
    this.renderReligionPanel();
  }
};

window.ReligionSystemEnhancer = ReligionSystemEnhancer;

console.log('[Religion] 唐代宗教信仰系统增强模块加载完成');
