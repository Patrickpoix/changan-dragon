/* ============================================================
   电影光影增强 · 体积光 + 光晕
   提升画面电影感
   ============================================================ */

const CinematicLighting = {
  // 太阳光晕
  sunGlow: null,
  
  createSunGlow() {
    // 创建一个圆形光晕贴图
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 180, 80, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 160, 60, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    this.sunGlow = new THREE.Sprite(mat);
    this.sunGlow.scale.set(50, 50, 1);
    scene.add(this.sunGlow);
  },
  
  update() {
    if (!this.sunGlow || !sun) return;
    // 光晕跟随太阳位置
    this.sunGlow.position.copy(sun.position).multiplyScalar(5);
  },
  
  init() {
    this.createSunGlow();
    console.log('[CinematicLighting] 电影光影增强完成');
  },
};

if (typeof GAME !== 'undefined') {
  const origReady = GAME.ready;
  Object.defineProperty(GAME, 'ready', {
    set(v) {
      origReady = v;
      if (v) CinematicLighting.init();
    },
    get() { return origReady; }
  });
}

if (typeof animate !== 'undefined') {
  const origAnim = animate;
  animate = function(now) {
    origAnim(now);
    if (GAME && GAME.ready) CinematicLighting.update();
  };
}
