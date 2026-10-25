/* ============================================================
   天气系统基础框架 · 晴/阴/雨
   ============================================================ */

const Weather = {
  current: 'sunny',
  target: 'sunny',
  t: 1.0,
  
  types: {
    sunny: { fog: 0, cloud: 0.1, rain: 0, exposure: 1.06 },
    cloudy: { fog: 0.15, cloud: 0.6, rain: 0, exposure: 0.95 },
    rain: { fog: 0.35, cloud: 0.9, rain: 1, exposure: 0.85 },
  },
  
  particles: null,
  
  init() {
    // 雨滴粒子系统
    const geo = new THREE.BufferGeometry();
    const count = 800;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3] = (Math.random() - 0.5) * 200;
      pos[i*3+1] = Math.random() * 60;
      pos[i*3+2] = (Math.random() - 0.5) * 200;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    
    const mat = new THREE.PointsMaterial({
      color: 0xaac4ff,
      size: 0.3,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    
    this.particles = new THREE.Points(geo, mat);
    this.particles.visible = false;
    scene.add(this.particles);
  },
  
  set(type) {
    if (!this.types[type]) return;
    this.target = type;
    toast('天气 · ' + ({sunny:'晴',cloudy:'阴',rain:'雨'})[type]);
  },
  
  cycle() {
    const order = ['sunny', 'cloudy', 'rain'];
    const next = order[(order.indexOf(this.current) + 1) % order.length];
    this.set(next);
  },
  
  update(dt) {
    const targetType = this.types[this.target];
    this.t = damp(this.t, 1, 0.8, dt);
    
    // 雾效
    if (scene.fog) {
      const baseFar = lerp(760, 590, GAME.nightT);
      scene.fog.far = baseFar * (1 - targetType.fog * this.t);
    }
    
    // 雨滴
    if (this.particles) {
      this.particles.material.opacity = targetType.rain * this.t * 0.6;
      this.particles.visible = targetType.rain * this.t > 0.05;
      
      if (this.particles.visible) {
        const pos = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
          pos[i+1] -= dt * 30;
          if (pos[i+1] < 0) {
            pos[i+1] = 60;
            pos[i] = player.group.position.x + (Math.random() - 0.5) * 200;
            pos[i+2] = player.group.position.z + (Math.random() - 0.5) * 200;
          }
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.position.copy(player.group.position);
      }
    }
    
    // 曝光调整
    GameRendering.setExposure(lerp(1.06, targetType.exposure, this.t));
    
    // 当前天气平滑过渡
    if (this.t < 0.98 && this.t > 0.02) {
      // 正在过渡中
    } else if (this.t >= 0.98) {
      this.current = this.target;
    }
  },
};

// 绑定天气切换按钮（如果存在）
if (typeof bindHold !== 'undefined') {
  const weatherBtn = document.getElementById('weatherBtn');
  if (weatherBtn) {
    weatherBtn.addEventListener('click', () => Weather.cycle());
  }
}
