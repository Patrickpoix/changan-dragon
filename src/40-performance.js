/* ============================================================
   性能优化 · 自动LOD + 距离剔除
   保证大量细节下依然流畅
   ============================================================ */

const PerformanceOptimizer = {
  // 远距离自动隐藏的细节对象
  distantDetails: [],
  
  // 收集需要距离剔除的对象
  collect() {
    this.distantDetails = [];
    scene.traverse(obj => {
      // 新添加的细节（斗拱、窗格、招牌等）在远距离时隐藏
      if (obj.parent && obj.parent.type === 'Group' && 
          (obj.parent.name.includes('dougong') || 
           obj.parent.name.includes('window') ||
           obj.parent.name.includes('signboard') ||
           obj.parent.name.includes('banner'))) {
        this.distantDetails.push(obj.parent);
      }
    });
    console.log('[PerformanceOptimizer] 收集了', this.distantDetails.length, '个远处细节对象');
  },
  
  // 每帧更新可见性
  update() {
    if (!camera || !this.distantDetails.length) return;
    const camPos = camera.position;
    
    for (const obj of this.distantDetails) {
      const dist = obj.position.distanceTo(camPos);
      // 超过80米隐藏细节
      obj.visible = dist < 80;
    }
  },
  
  // 调整阴影距离
  optimizeShadows() {
    if (sun) {
      // 缩小阴影相机范围，提升阴影渲染效率
      sun.shadow.camera.left = -80;
      sun.shadow.camera.right = 80;
      sun.shadow.camera.top = 80;
      sun.shadow.camera.bottom = -80;
      sun.shadow.camera.near = 1;
      sun.shadow.camera.far = 300;
      sun.shadow.mapSize.set(1024, 1024); // 移动端降级
    }
  },
  
  init() {
    this.optimizeShadows();
    // 延迟收集（等世界构建完）
    setTimeout(() => this.collect(), 2000);
    console.log('[PerformanceOptimizer] 性能优化已启用');
  },
};

if (typeof GAME !== 'undefined') {
  const origReady = GAME.ready;
  Object.defineProperty(GAME, 'ready', {
    set(v) {
      origReady = v;
      if (v) PerformanceOptimizer.init();
    },
    get() { return origReady; }
  });
}

if (typeof animate !== 'undefined') {
  const origAnim = animate;
  animate = function(now) {
    origAnim(now);
    if (GAME && GAME.ready) PerformanceOptimizer.update();
  };
}
