/* ============================================================
   唐代交通出行系统增强 v2.0
   车马、轿子、步行、骑行
   ============================================================ */

const TransportSystemEnhancer = {
  
  vehicles: [
    {
      id: 'vehicle_001',
      name: '步行',
      type: '基础',
      speed: 1,
      desc: '最基础的出行方式，可随时停下欣赏风景',
      unlocked: true,
    },
    {
      id: 'vehicle_002',
      name: '马',
      type: '骑行',
      speed: 2.5,
      desc: '唐代最常见的交通工具，速度适中',
      unlocked: false,
    },
    {
      id: 'vehicle_003',
      name: '马车',
      type: '乘车',
      speed: 3,
      desc: '舒适的马车，可乘坐多人',
      unlocked: false,
    },
    {
      id: 'vehicle_004',
      name: '轿子',
      type: '乘车',
      speed: 1.5,
      desc: '官宦人家乘坐的轿子，平稳舒适',
      unlocked: false,
    },
    {
      id: 'vehicle_005',
      name: '牛车',
      type: '乘车',
      speed: 1.2,
      desc: '缓慢但平稳的牛车，适合长途旅行',
      unlocked: false,
    },
    {
      id: 'vehicle_006',
      name: '驴',
      type: '骑行',
      speed: 1.8,
      desc: '比马便宜，适合普通百姓使用',
      unlocked: false,
    },
  ],
  
  currentVehicle: 'vehicle_001',
  
  transportPanel: null,
  
  init() {
    this.createTransportPanel();
    console.log('[Transport] 唐代交通出行系统初始化完成');
  },
  
  createTransportPanel() {
    this.transportPanel = document.createElement('div');
    this.transportPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      max-height: 500px;
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
    
    document.body.appendChild(this.transportPanel);
  },
  
  showTransportPanel() {
    this.renderTransportPanel();
    this.transportPanel.style.display = 'block';
  },
  
  closeTransportPanel() {
    this.transportPanel.style.display = 'none';
  },
  
  renderTransportPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🐎 出行方式
      </div>
    `;
    
    this.vehicles.forEach(vehicle => {
      const isCurrent = this.currentVehicle === vehicle.id;
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${isCurrent ? '#4CAF50' : vehicle.unlocked ? '#d4af37' : '#666'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div style="font-weight: bold; color: ${isCurrent ? '#4CAF50' : vehicle.unlocked ? '#ffd700' : '#999'}">${vehicle.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">${vehicle.type} · 速度x${vehicle.speed}</div>
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">${vehicle.desc}</div>
          ${vehicle.unlocked ? `
            <button onclick="TransportSystemEnhancer.selectVehicle('${vehicle.id}')" style="padding: 5px 15px; background: ${isCurrent ? '#4CAF50' : '#d4af37'}; border: none; color: ${isCurrent ? '#fff' : '#000'}; border-radius: 4px; cursor: pointer;">
              ${isCurrent ? '使用中' : '选择'}
            </button>
          ` : '<span style="font-size: 12px; opacity: 0.5;">未解锁</span>'}
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="TransportSystemEnhancer.closeTransportPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.transportPanel.innerHTML = html;
  },
  
  selectVehicle(vehicleId) {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.unlocked) return;
    
    this.currentVehicle = vehicleId;
    
    console.log('[Transport] 选择交通工具:', vehicle.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.info('出行方式', `你选择了 ${vehicle.name}`);
    }
    
    this.renderTransportPanel();
  },
  
  getSpeedMultiplier() {
    const vehicle = this.vehicles.find(v => v.id === this.currentVehicle);
    return vehicle ? vehicle.speed : 1;
  }
};

window.TransportSystemEnhancer = TransportSystemEnhancer;

console.log('[Transport] 唐代交通出行系统增强模块加载完成');
