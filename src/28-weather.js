/* ============================================================
   天气系统 · 晴/阴/雨（v2 接入统一调度器 + GRADE基线）
   - 雨滴粒子（800点，跟随玩家，遇雨天落下）
   - 雾/曝光：基于主循环 GRADE 基线的相对微调（晴天=GRADE 不变）
   - 通过 __enhance.register 注册（优先级35），init 时包装
     window.updateDayNight，每帧在 GRADE 基线之后应用天气因子
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

  const Weather = {
    current: 'sunny',
    target: 'sunny',
    t: 1.0,
    // 相对因子：晴天为0（完全等于GRADE基线），阴/雨在基线上收雾、压曝光
    types: {
      sunny:  { fog: 0.00, expDrop: 0.00 },
      cloudy: { fog: 0.12, expDrop: 0.06 },
      rain:   { fog: 0.30, expDrop: 0.18 },
    },
    particles: null,
    hooked: false,

    init() {
      // 幂等：粒子已存在则不再重复创建/重复包装
      if (this.particles || typeof scene === 'undefined') return;
      const geo = new THREE.BufferGeometry();
      const count = 800;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i*3]   = (Math.random() - 0.5) * 200;
        pos[i*3+1] = Math.random() * 60;
        pos[i*3+2] = (Math.random() - 0.5) * 200;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color: 0xaac4ff, size: 0.3, transparent: true, opacity: 0, depthWrite: false });
      this.particles = new THREE.Points(geo, mat);
      this.particles.visible = false;
      scene.add(this.particles);
      this.hook();
      console.log('[Weather] 天气系统就绪 - 雨滴粒子800 + updateDayNight包装(GRADE相对微调)');
    },

    // 每帧在 GRADE 基线之后应用天气因子（不竞争、单一权威）
    hook() {
      if (this.hooked || typeof window.updateDayNight !== 'function') return;
      this.hooked = true;
      const orig = window.updateDayNight;
      window.updateDayNight = (dt) => {
        orig(dt);
        this.update(dt);
      };
    },

    set(type) {
      if (!this.types[type]) return;
      this.target = type;
      toast('天气 · ' + ({sunny:'晴', cloudy:'阴', rain:'雨'})[type]);
    },

    cycle() {
      const order = ['sunny', 'cloudy', 'rain'];
      const next = order[(order.indexOf(this.current) + 1) % order.length];
      this.set(next);
    },

    update(dt) {
      const targetType = this.types[this.target];
      this.t = damp(this.t, 1, 0.8, dt);
      const night = typeof GAME !== 'undefined' ? GAME.nightT : 0;
      // 雾效：GRADE 基线的相对收雾（晴天 = 1.0 倍，完全由主循环驱动）
      if (scene.fog) {
        const baseNear = lerp(GRADE.dayFogNear, GRADE.nightFogNear, night);
        const baseFar  = lerp(GRADE.dayFogFar,  GRADE.nightFogFar,  night);
        scene.fog.near = baseNear * (1 - targetType.fog * this.t * 0.5);
        scene.fog.far  = baseFar  * (1 - targetType.fog * this.t);
      }
      // 曝光：GRADE 基线的相对压暗（晴天 = 基线曝光不变）
      const baseExp = lerp(GRADE.dayExposure, GRADE.nightExposure, night);
      GameRendering.setExposure(baseExp * (1 - targetType.expDrop * this.t));
      // 雨滴粒子
      if (this.particles) {
        this.particles.material.opacity = targetType.fog * this.t * 2;
        this.particles.visible = targetType.fog * this.t > 0.03;
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
      if (this.t >= 0.98) this.current = this.target;
    },
  };

  // 天气切换按钮（若存在）
  if (typeof bindHold !== 'undefined') {
    const weatherBtn = document.getElementById('weatherBtn');
    if (weatherBtn) weatherBtn.addEventListener('click', () => Weather.cycle());
  }

  // 暴露全局（调试/其他系统引用）
  window.Weather = Weather;

  function register() {
    if (registered) return;
    registered = true;
    if (window.__enhance) {
      window.__enhance.register('weather', Weather.init.bind(Weather), 35);
    } else {
      (window.__enhancePending = window.__enhancePending || []).push({ owner: 'weather', fn: Weather.init.bind(Weather), priority: 35 });
    }
  }

  if (typeof GAME !== 'undefined' && GAME.ready) register();
  else {
    let tries = 0;
    (function check() {
      if (typeof GAME !== 'undefined' && GAME.ready) register();
      else if (tries++ < 400) setTimeout(check, 100);
      else { if (window.__enhance) window.__enhance.register('weather', Weather.init.bind(Weather), 35); }
    })();
  }
})();