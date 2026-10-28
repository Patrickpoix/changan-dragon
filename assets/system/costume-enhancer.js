/* ============================================================
   唐代服饰换装系统增强 v2.0
   服饰、换装、款式、颜色
   ============================================================ */

const CostumeSystemEnhancer = {
  
  costumes: [
    {
      id: 'costume_001',
      name: '圆领袍',
      dynasty: '唐',
      type: '男装',
      desc: '唐代男子最常见的服饰，圆领窄袖，方便行动',
      unlocked: false,
      color: '#8B4513',
    },
    {
      id: 'costume_002',
      name: '襦裙',
      dynasty: '唐',
      type: '女装',
      desc: '唐代女子的传统服饰，上襦下裙，飘逸优雅',
      unlocked: false,
      color: '#FFB6C1',
    },
    {
      id: 'costume_003',
      name: '幞头',
      dynasty: '唐',
      type: '头饰',
      desc: '唐代男子的首服，黑色纱罗制成',
      unlocked: false,
      color: '#000000',
    },
    {
      id: 'costume_004',
      name: '花钿',
      dynasty: '唐',
      type: '面饰',
      desc: '唐代女子的面部装饰，贴在眉心处',
      unlocked: false,
      color: '#FFD700',
    },
    {
      id: 'costume_005',
      name: '铠甲',
      dynasty: '唐',
      type: '戎装',
      desc: '唐代士兵的铠甲，金属制成，威武庄严',
      unlocked: false,
      color: '#808080',
    },
  ],
  
  currentCostumes: new Set(),
  
  costumePanel: null,
  
  init() {
    this.createCostumePanel();
    console.log('[Costume] 唐代服饰换装系统初始化完成');
  },
  
  createCostumePanel() {
    this.costumePanel = document.createElement('div');
    this.costumePanel.style.cssText = `
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
    
    document.body.appendChild(this.costumePanel);
  },
  
  showCostumePanel() {
    this.renderCostumePanel();
    this.costumePanel.style.display = 'block';
  },
  
  closeCostumePanel() {
    this.costumePanel.style.display = 'none';
  },
  
  renderCostumePanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        👘 唐代服饰
      </div>
    `;
    
    this.costumes.forEach(costume => {
      const wearing = this.currentCostumes.has(costume.id);
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${wearing ? '#4CAF50' : costume.color};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div style="font-weight: bold; color: ${wearing ? '#4CAF50' : '#ffd700'}">${costume.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">${costume.dynasty} · ${costume.type}</div>
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">${costume.desc}</div>
          <button onclick="CostumeSystemEnhancer.toggleCostume('${costume.id}')" style="padding: 5px 15px; background: ${wearing ? '#4CAF50' : '#d4af37'}; border: none; color: ${wearing ? '#fff' : '#000'}; border-radius: 4px; cursor: pointer;">
            ${wearing ? '穿着中' : '穿戴'}
          </button>
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="CostumeSystemEnhancer.closeCostumePanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.costumePanel.innerHTML = html;
  },
  
  toggleCostume(costumeId) {
    const costume = this.costumes.find(c => c.id === costumeId);
    if (!costume) return;
    
    if (this.currentCostumes.has(costumeId)) {
      this.currentCostumes.delete(costumeId);
      console.log('[Costume] 脱下:', costume.name);
    } else {
      this.currentCostumes.add(costumeId);
      console.log('[Costume] 穿上:', costume.name);
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.success('换装成功！', `你穿上了 ${costume.name}！`);
      }
    }
    
    this.renderCostumePanel();
  }
};

window.CostumeSystemEnhancer = CostumeSystemEnhancer;

console.log('[Costume] 唐代服饰换装系统增强模块加载完成');
