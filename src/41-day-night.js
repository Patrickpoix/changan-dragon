/* ============================================================
   昼夜系统增强 · 自然过渡 + 夜景灯火
   ============================================================ */

const DayNightCycle = {
  // 当前时间（0-1，0=午夜，0.5=正午）
  time: 0.3,
  nightIntensity: 0,
  
  // 调整天空和光照
  update(dt) {
    // 时间流逝速度（游戏内一天 = 现实10分钟）
    this.time = (this.time + dt / 600) % 1;
    
    // 计算夜晚强度（黄昏→夜晚→黎明）
    const t = this.time;
    let night = 0;
    if (t > 0.7 || t < 0.2) {
      // 夜晚时段
      night = Math.min(1, Math.max(0, (t - 0.7) / 0.1, (0.2 - t) / 0.1));
    } else if (t > 0.6 && t < 0.7) {
      // 黄昏
      night = (t - 0.6) / 0.1;
    } else if (t > 0.2 && t < 0.3) {
      // 黎明
      night = 1 - (t - 0.2) / 0.1;
    }
    
    this.nightIntensity = night;
    
    // 调整天空
    if (skyUniforms) {
      skyUniforms.night.value = night;
    }
    
    // 调整太阳
    if (sun) {
      // 太阳角度随时间变化
      const sunAngle = (t - 0.25) * Math.PI * 2;
      sun.position.x = Math.cos(sunAngle) * 150;
      sun.position.y = Math.sin(sunAngle) * 120;
      sun.intensity = 1.7 * (1 - night);
    }
    
    // 调整环境光
    if (ambient) {
      ambient.intensity = 0.22 + night * 0.05;
    }
    
    // 夜晚灯笼变亮
    if (MAT.lantern) {
      MAT.lantern.emissiveIntensity = 0.25 + night * 0.8;
    }
    if (MAT.window) {
      MAT.window.emissiveIntensity = night * 0.6;
    }
    
    // 星星显示
    if (stars) {
      stars.material.opacity = night * 0.9;
    }
  },
  
  init() {
    console.log('[DayNightCycle] 昼夜循环已启用');
  },
};

if (typeof animate !== 'undefined') {
  const origAnim = animate;
  animate = function(now) {
    origAnim(now);
    if (GAME && GAME.ready) {
      DayNightCycle.update(Math.min(0.05, (now - GAME.lastFrame) / 1000));
    }
  };
}
