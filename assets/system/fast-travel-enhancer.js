/* ============================================================
   快速传送系统增强 v2.0
   地标传送、已访问地点快速移动
   ============================================================ */

const FastTravelEnhancer = {
  
  teleportPoints: [
    { id: 'mingde_gate', name: '明德门', x: 0, z: 550, unlocked: false },
    { id: 'zhuque_avenue', name: '朱雀大街', x: 0, z: 0, unlocked: true },
    { id: 'daming_palace', name: '大明宫', x: 320, z: -460, unlocked: false },
    { id: 'taiji_palace', name: '太极宫', x: 0, z: -450, unlocked: false },
    { id: 'xingqing_palace', name: '兴庆宫', x: 610, z: -195, unlocked: false },
    { id: 'big_wild_goose_pagoda', name: '大雁塔', x: 300, z: 420, unlocked: false },
    { id: 'small_wild_goose_pagoda', name: '小雁塔', x: -300, z: 480, unlocked: false },
    { id: 'qujiang_pool', name: '曲江池', x: 520, z: 470, unlocked: false },
  ],
  
  teleportPanel: null,
  
  init() {
    this.createTeleportPanel();
    console.log('[Fast-Travel] 快速传送系统初始化完成');
  },
  
  createTeleportPanel() {
    this.teleportPanel = document.createElement('div');
    this.teleportPanel.style.cssText = `
      position: absolute;
      right: 20px;
      top: 200px;
      width: 250px;
      max-height: 400px;
      background: rgba(139, 69, 19, 0.95);
      border: 2px solid #d4af37;
      border-radius: 8px;
      padding: 15px;
      color: #ffd700;
      font-family: serif;
      font-size: 14px;
      overflow-y: auto;
      display: none;
      z-index: 1000;
    `;
    
    document.body.appendChild(this.teleportPanel);
  },
  
  unlockTeleportPoint(pointId) {
    const point = this.teleportPoints.find(p => p.id === pointId);
    if (!point) return;
    
    if (!point.unlocked) {
      point.unlocked = true;
      console.log('[Fast-Travel] 解锁传送点:', point.name);
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.success('解锁传送点', point.name);
      }
    }
  },
  
  showTeleportPanel() {
    this.teleportPanel.style.display = 'block';
    this.renderTeleportPanel();
  },
  
  closeTeleportPanel() {
    this.teleportPanel.style.display = 'none';
  },
  
  renderTeleportPanel() {
    let html = `
      <div style="font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 15px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
        快速传送
      </div>
    `;
    
    this.teleportPoints.forEach(point => {
      if (point.unlocked) {
        html += `
          <div style="padding: 10px; margin-bottom: 5px; background: rgba(0,0,0,0.2); border-radius: 4px; cursor: pointer;" onclick="FastTravelEnhancer.teleportTo('${point.id}')">
            <div style="font-weight: bold;">${point.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">点击传送</div>
          </div>
        `;
      } else {
        html += `
          <div style="padding: 10px; margin-bottom: 5px; background: rgba(0,0,0,0.1); border-radius: 4px; opacity: 0.5;">
            <div style="font-weight: bold;">???</div>
            <div style="font-size: 12px; opacity: 0.7;">未解锁</div>
          </div>
        `;
      }
    });
    
    html += `
      <div style="text-align: center; margin-top: 15px;">
        <button onclick="FastTravelEnhancer.closeTeleportPanel()" style="padding: 8px 20px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    this.teleportPanel.innerHTML = html;
  },
  
  teleportTo(pointId) {
    const point = this.teleportPoints.find(p => p.id === pointId);
    if (!point || !point.unlocked) return;
    
    if (window.GAME) {
      GAME.playerPosition = { x: point.x, y: 0, z: point.z };
      console.log('[Fast-Travel] 传送至:', point.name);
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.info('传送完成', `已到达 ${point.name}`);
      }
    }
    
    this.closeTeleportPanel();
  }
};

window.FastTravelEnhancer = FastTravelEnhancer;

console.log('[Fast-Travel] 快速传送系统增强模块加载完成');
