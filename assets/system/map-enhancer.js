/* ============================================================
   地图系统增强 v2.0
   大地图、小地图、地标标记、导航
   ============================================================ */

const MapSystemEnhancer = {
  
  bigMapPanel: null,
  
  minimapCanvas: null,
  
  landmarks: [
    { id: 'mingde_gate', name: '明德门', x: 0, z: 550, icon: '🏯' },
    { id: 'zhuque_avenue', name: '朱雀大街', x: 0, z: 0, icon: '🛤️' },
    { id: 'daming_palace', name: '大明宫', x: 320, z: -460, icon: '🏛️' },
    { id: 'taiji_palace', name: '太极宫', x: 0, z: -450, icon: '🏯' },
    { id: 'xingqing_palace', name: '兴庆宫', x: 610, z: -195, icon: '🏯' },
    { id: 'big_wild_goose_pagoda', name: '大雁塔', x: 300, z: 420, icon: '🗼' },
    { id: 'small_wild_goose_pagoda', name: '小雁塔', x: -300, z: 480, icon: '🗼' },
    { id: 'qujiang_pool', name: '曲江池', x: 520, z: 470, icon: '🌊' },
  ],
  
  mapWidth: 1240,
  mapHeight: 1100,
  
  init() {
    this.createBigMapPanel();
    this.createMinimap();
    console.log('[Map] 地图系统初始化完成');
  },
  
  createBigMapPanel() {
    this.bigMapPanel = document.createElement('div');
    this.bigMapPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 800px;
      height: 600px;
      background: rgba(139, 69, 19, 0.95);
      border: 2px solid #d4af37;
      border-radius: 12px;
      padding: 20px;
      color: #ffd700;
      font-family: serif;
      display: none;
      z-index: 1000;
    `;
    
    this.bigMapPanel.innerHTML = `
      <div style="font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 15px;">长安城地图</div>
      <canvas id="big-map-canvas" width="760" height="520" style="background: #2a5a2a; border-radius: 8px;"></canvas>
      <div style="text-align: center; margin-top: 15px;">
        <button onclick="MapSystemEnhancer.closeBigMap()" style="padding: 8px 20px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">关闭 (M)</button>
      </div>
    `;
    
    document.body.appendChild(this.bigMapPanel);
  },
  
  createMinimap() {
    this.minimapCanvas = document.createElement('canvas');
    this.minimapCanvas.width = 150;
    this.minimapCanvas.height = 150;
    this.minimapCanvas.style.cssText = `
      position: absolute;
      right: 20px;
      top: 20px;
      border: 2px solid #d4af37;
      border-radius: 8px;
      background: rgba(0,0,0,0.5);
    `;
    
    document.body.appendChild(this.minimapCanvas);
    this.updateMinimap(0, 0);
  },
  
  showBigMap() {
    this.bigMapPanel.style.display = 'block';
    this.renderBigMap();
  },
  
  closeBigMap() {
    this.bigMapPanel.style.display = 'none';
  },
  
  renderBigMap() {
    const canvas = document.getElementById('big-map-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#2a5a2a';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, width - 100, height - 100);
    
    ctx.strokeStyle = '#d7d0bd';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(width / 2, 50);
    ctx.lineTo(width / 2, height - 50);
    ctx.stroke();
    
    this.landmarks.forEach(landmark => {
      const x = 50 + ((landmark.x + 620) / 1240) * (width - 100);
      const y = 50 + ((landmark.z + 550) / 1100) * (height - 100);
      
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.fillText(landmark.name, x, y - 12);
    });
    
    if (window.GAME?.playerPosition) {
      const player = GAME.playerPosition;
      const px = 50 + ((player.x + 620) / 1240) * (width - 100);
      const py = 50 + ((player.z + 550) / 1100) * (height - 100);
      
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  
  updateMinimap(playerX, playerZ) {
    if (!this.minimapCanvas) return;
    
    const ctx = this.minimapCanvas.getContext('2d');
    const width = this.minimapCanvas.width;
    const height = this.minimapCanvas.height;
    
    ctx.fillStyle = '#2a5a2a';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    
    this.landmarks.forEach(landmark => {
      const x = 5 + ((landmark.x + 620) / 1240) * (width - 10);
      const y = 5 + ((landmark.z + 550) / 1100) * (height - 10);
      
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    
    const px = 5 + ((playerX + 620) / 1240) * (width - 10);
    const py = 5 + ((playerZ + 550) / 1100) * (height - 10);
    
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
  }
};

window.MapSystemEnhancer = MapSystemEnhancer;

console.log('[Map] 地图系统增强模块加载完成');
