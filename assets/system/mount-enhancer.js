/* ============================================================
   坐骑系统增强 v2.0
   坐骑收集、骑乘、速度、外观
   ============================================================ */

const MountSystemEnhancer = {
  
  mounts: [],
  
  activeMount: null,
  
  mountCatalog: [
    { id: 'horse_bay', name: '棕马', type: 'horse', speed: 8, rarity: 'common', price: 100 },
    { id: 'horse_black', name: '乌骓马', type: 'horse', speed: 10, rarity: 'uncommon', price: 300 },
    { id: 'horse_white', name: '白龙马', type: 'horse', speed: 12, rarity: 'rare', price: 800 },
    { id: 'camel', name: '骆驼', type: 'camel', speed: 6, rarity: 'common', price: 80 },
    { id: 'qilin', name: '麒麟', type: 'mythical', speed: 20, rarity: 'legendary', price: 10000 },
  ],
  
  rarityColors: {
    common: '#ffffff',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800',
  },
  
  mountPanel: null,
  
  isRiding: false,
  
  init() {
    this.createMountPanel();
    console.log('[Mount] 坐骑系统初始化完成');
  },
  
  createMountPanel() {
    this.mountPanel = document.createElement('div');
    this.mountPanel.style.cssText = `
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
    
    document.body.appendChild(this.mountPanel);
  },
  
  showMountPanel() {
    this.renderMountPanel();
    this.mountPanel.style.display = 'block';
  },
  
  closeMountPanel() {
    this.mountPanel.style.display = 'none';
  },
  
  renderMountPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🐎 坐骑系统
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffb6c1;">我的坐骑 (${this.mounts.length})</div>
    `;
    
    if (this.mounts.length === 0) {
      html += '<div style="opacity: 0.5; text-align: center; padding: 20px;">还没有坐骑，去购买一匹吧！</div>';
    } else {
      this.mounts.forEach(mount => {
        const isActive = this.activeMount && this.activeMount.id === mount.id;
        
        html += `
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${this.rarityColors[mount.rarity]};">
            <div>
              <div style="font-weight: bold; color: ${this.rarityColors[mount.rarity]};">${mount.name}</div>
              <div style="font-size: 12px; opacity: 0.7;">速度 ${mount.speed} · ${mount.price} 文</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button onclick="MountSystemEnhancer.setActiveMount('${mount.id}')" style="padding: 5px 10px; background: ${isActive ? '#4CAF50' : '#d4af37'}; border: none; color: #000; border-radius: 4px; cursor: pointer;">
                ${isActive ? '已装备' : '装备'}
              </button>
              ${isActive ? `<button onclick="MountSystemEnhancer.toggleRide()" style="padding: 5px 10px; background: #87ceeb; border: none; color: #000; border-radius: 4px; cursor: pointer;">
                ${this.isRiding ? '下马' : '骑乘'}
              </button>` : ''}
            </div>
          </div>
        `;
      });
    }
    
    html += `</div>`;
    
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">🏪 坐骑商店</div>
    `;
    
    this.mountCatalog.forEach(mount => {
      const owned = this.mounts.find(m => m.id === mount.id);
      
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${this.rarityColors[mount.rarity]};">
          <div>
            <div style="font-weight: bold; color: ${this.rarityColors[mount.rarity]};">${mount.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">速度 ${mount.speed} · ${mount.price} 文</div>
          </div>
          ${owned ? '<span style="color: #4CAF50;">已拥有</span>' : `<button onclick="MountSystemEnhancer.buyMount('${mount.id}')" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">购买</button>`}
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="MountSystemEnhancer.closeMountPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.mountPanel.innerHTML = html;
  },
  
  buyMount(mountId) {
    const mount = this.mountCatalog.find(m => m.id === mountId);
    if (!mount) return;
    
    console.log('[Mount] 购买坐骑:', mount.name);
    
    this.mounts.push(mount);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('购买成功', `你购买了 ${mount.name}！`);
    }
    
    this.renderMountPanel();
  },
  
  setActiveMount(mountId) {
    const mount = this.mounts.find(m => m.id === mountId);
    if (!mount) return;
    
    this.activeMount = mount;
    
    console.log('[Mount] 装备坐骑:', mount.name);
    
    this.renderMountPanel();
  },
  
  toggleRide() {
    this.isRiding = !this.isRiding;
    
    if (this.isRiding) {
      console.log('[Mount] 骑乘坐骑:', this.activeMount?.name);
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.info('骑乘中', `你骑上了 ${this.activeMount.name}`);
      }
    } else {
      console.log('[Mount] 下马');
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.info('下马', '你下马了');
      }
    }
    
    this.renderMountPanel();
  }
};

window.MountSystemEnhancer = MountSystemEnhancer;

console.log('[Mount] 坐骑系统增强模块加载完成');
