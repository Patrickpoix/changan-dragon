/* ============================================================
   水面效果增强 · 波光粼粼 + 倒影感
   提升水景真实度
   ============================================================ */

const WaterEnhancement = {
  // 增强水面材质
  enhanceWater() {
    if (typeof MAT === 'undefined' || !MAT.water) return;
    
    // 让水面更有通透感和波光
    MAT.water.roughness = 0.15;
    MAT.water.metalness = 0.6;
    MAT.water.envMapIntensity = 1.2;
    
    // 添加动画波纹效果（通过修改uniform或vertex shader）
    // 这里用简单的方法：周期性调整水面y位置模拟波浪
    this.waterMeshes = [];
    scene.traverse(obj => {
      if (obj.material === MAT.water) this.waterMeshes.push(obj);
    });
  },
  
  update(dt, t) {
    if (!this.waterMeshes) return;
    // 轻微波浪起伏
    this.waterMeshes.forEach((mesh, i) => {
      mesh.position.y = Math.sin(t * 0.8 + i * 0.5) * 0.05;
    });
  },
  
  init() {
    this.enhanceWater();
    console.log('[WaterEnhancement] 水面效果增强完成');
  },
};

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    WaterEnhancement.init();
  };
}

// 挂接主循环更新
if (typeof animate !== 'undefined') {
  const origAnim = animate;
  animate = function(now) {
    origAnim(now);
    if (GAME && GAME.ready) {
      WaterEnhancement.update(Math.min(0.05, (now - GAME.lastFrame) / 1000), GAME.time);
    }
  };
}
