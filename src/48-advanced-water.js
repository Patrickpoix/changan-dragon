/* ============================================================
   高级水面效果 · 反射 + 折射
   提升水景真实度
   ============================================================ */

const AdvancedWater = {
  waterMesh: null,
  
  // 查找水面网格
  findWater() {
    scene.traverse(obj => {
      if (obj.material === MAT.water || obj.material.name === 'water') {
        this.waterMesh = obj;
      }
    });
  },
  
  // 增强水面材质
  enhance() {
    if (!this.waterMesh) return;
    
    // 更透明的水面
    this.waterMesh.material.transparent = true;
    this.waterMesh.material.opacity = 0.8;
    this.waterMesh.material.roughness = 0.1;
    this.waterMesh.material.metalness = 0.7;
    this.waterMesh.material.envMapIntensity = 1.5;
    
    console.log('[AdvancedWater] 高级水面效果已启用');
  },
  
  init() {
    setTimeout(() => {
      this.findWater();
      this.enhance();
    }, 1000);
  },
};

if (typeof GAME !== 'undefined') {
  const origReady = GAME.ready;
  Object.defineProperty(GAME, 'ready', {
    set(v) {
      origReady = v;
      if (v) AdvancedWater.init();
    },
    get() { return origReady; }
  });
}
