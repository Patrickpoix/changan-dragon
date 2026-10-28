/* ============================================================
   性能统计面板增强 v2.0
   FPS、Draw Call、内存、GPU耗时
   ============================================================ */

const PerformanceStatsEnhancer = {
  
  statsPanel: null,
  
  frameCount: 0,
  lastTime: performance.now(),
  fps: 0,
  
  fpsHistory: [],
  
  visible: false,
  
  init() {
    this.createStatsPanel();
    this.setupKeyboardShortcut();
    console.log('[Performance-Stats] 性能统计面板初始化完成');
  },
  
  createStatsPanel() {
    this.statsPanel = document.createElement('div');
    this.statsPanel.style.cssText = `
      position: absolute;
      left: 20px;
      bottom: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      min-width: 200px;
      display: none;
      z-index: 999;
      border: 1px solid #00ff00;
    `;
    
    document.body.appendChild(this.statsPanel);
  },
  
  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'f' && e.ctrlKey) {
        this.toggle();
      }
    });
  },
  
  toggle() {
    this.visible = !this.visible;
    this.statsPanel.style.display = this.visible ? 'block' : 'none';
  },
  
  update() {
    this.frameCount++;
    
    const now = performance.now();
    const delta = now - this.lastTime;
    
    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastTime = now;
      
      this.fpsHistory.push(this.fps);
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      
      this.renderStats();
    }
  },
  
  renderStats() {
    if (!this.visible) return;
    
    let rendererInfo = '';
    if (window.GAME?.renderer) {
      const info = GAME.renderer.info;
      rendererInfo = `
        <div>Draw Calls: ${info.render.calls}</div>
        <div>Triangles: ${(info.render.triangles / 1000).toFixed(1)}k</div>
        <div>Vertices: ${(info.render.vertices / 1000).toFixed(1)}k</div>
        <div>Textures: ${info.memory.textures}</div>
        <div>Geometries: ${info.memory.geometries}</div>
      `;
    }
    
    const avgFps = this.fpsHistory.length > 0
      ? Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length)
      : this.fps;
    
    let fpsColor = '#00ff00';
    if (this.fps < 30) fpsColor = '#ff0000';
    else if (this.fps < 60) fpsColor = '#ffff00';
    
    this.statsPanel.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px; color: #ffffff;">性能统计</div>
      <div style="color: ${fpsColor}; font-size: 16px; font-weight: bold;">FPS: ${this.fps} (avg: ${avgFps})</div>
      ${rendererInfo}
      <div style="margin-top: 5px; opacity: 0.7;">Ctrl+F 切换显示</div>
    `;
  },
  
  getSceneStats(scene) {
    let meshCount = 0;
    let totalVertices = 0;
    
    scene.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
        if (child.geometry?.attributes?.position) {
          totalVertices += child.geometry.attributes.position.count;
        }
      }
    });
    
    return {
      meshes: meshCount,
      vertices: totalVertices,
    };
  }
};

window.PerformanceStatsEnhancer = PerformanceStatsEnhancer;

console.log('[Performance-Stats] 性能统计面板增强模块加载完成');
