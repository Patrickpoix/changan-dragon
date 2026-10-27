/* ============================================================
   天气系统 · 晴/阴/雨（v6 粒子坐标系修复）
   v6: 修复雨滴双重位移bug——粒子容器跟随玩家，
       但重置雨滴时又写入了player.x+random，导致实际位置=2*player.x+random
       修正：粒子局部坐标只用random偏移，容器position跟随玩家
   v5.1: 雨滴下落速度18单位/秒
   ============================================================ */

(function() {
  'use strict';

  let registered = false;

  const Weather = {
    current: 'sunny',
    target: 'sunny',
    t: 1.0,
    types: {
      sunny:  { fog: 0.00, expDrop: 0.00 },
      cloudy: { fog: 0.12, expDrop: 0.06 },
      rain:   { fog: 0.30, expDrop: 0.18 },
    },
    particles: null,
    initialized: false,

    init() {
      if (this.initialized || typeof scene === 'undefined') return;
      this.initialized = true;
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

      if (typeof GameRendering !== 'undefined' && GameRendering && typeof GameRendering.render === 'function') {
        const origRender = GameRendering.render;
        GameRendering.render = function(dt) {
          origRender.call(GameRendering, dt);
          Weather.update(dt);
        };
      }
      window.Weather = Weather;
      window.__weather = this;

      if (typeof bindHold !== 'undefined') {
        let weatherBtn = document.getElementById('weatherBtn');
        if (!weatherBtn) {
          const top = document.querySelector('.top-actions');
          if (top) {
            weatherBtn = document.createElement('button');
            weatherBtn.className = 'round-btn';
            weatherBtn.id = 'weatherBtn';
            weatherBtn.title = '天气';
            weatherBtn.setAttribute('aria-label', '切换晴雨');
            weatherBtn.textContent = '☁';
            top.insertBefore(weatherBtn, top.querySelector('#helpBtn') || null);
            const applyGrid = function() {
              if (window.matchMedia && matchMedia('(orientation: portrait) and (max-width: 600px)').matches) {
                top.style.gridTemplateColumns = 'repeat(4, 44px)';
              } else {
                top.style.removeProperty('grid-template-columns');
              }
            };
            applyGrid();
            window.addEventListener('resize', applyGrid, { passive: true });
          }
        }
        if (weatherBtn && !this._btnBound) {
          this._btnBound = true;
          weatherBtn.addEventListener('click', () => Weather.cycle());
        }
        const helpGrid = document.querySelector('.help-grid');
        if (helpGrid && !Array.from(helpGrid.children).some(el => el.textContent.indexOf('天气按钮') !== -1)) {
          const item = document.createElement('div');
          item.className = 'help-item';
          item.innerHTML = '<strong>☁ 天气按钮</strong><span>晴天、阴天与细雨，随行切换，雨滴飘落</span>';
          helpGrid.appendChild(item);
        }
      }
      console.log('[Weather] 天气系统就绪 v6（粒子局部坐标系修复）');
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
      if (!this.initialized) return;
      const targetType = this.types[this.target];
      this.t = damp(this.t, 1, 0.8, dt);
      const night = typeof GAME !== 'undefined' ? GAME.nightT : 0;

      if (scene.fog) {
        const baseNear = lerp(GRADE.dayFogNear, GRADE.nightFogNear, night);
        const baseFar  = lerp(GRADE.dayFogFar,  GRADE.nightFogFar,  night);
        scene.fog.near = baseNear * (1 - targetType.fog * this.t * 0.5);
        scene.fog.far  = baseFar  * (1 - targetType.fog * this.t);
      }
      const baseExp = lerp(GRADE.dayExposure, GRADE.nightExposure, night);
      GameRendering.setExposure(baseExp * (1 - targetType.expDrop * this.t));

      if (this.particles) {
        this.particles.material.opacity = targetType.fog * this.t * 2;
        this.particles.visible = targetType.fog * this.t > 0.03;
        if (this.particles.visible && typeof player !== 'undefined' && player) {
          const pos = this.particles.geometry.attributes.position.array;
          for (let i = 0; i < pos.length; i += 3) {
            pos[i+1] -= dt * 18;
            if (pos[i+1] < 0) {
              // v6修复：粒子容器position跟随玩家，局部坐标只写random偏移
              // 之前误写 player.x + random 导致双重位移
              pos[i+1] = 60 + Math.random() * 10;
              pos[i]   = (Math.random() - 0.5) * 200;
              pos[i+2] = (Math.random() - 0.5) * 200;
            }
          }
          this.particles.geometry.attributes.position.needsUpdate = true;
          // 容器跟随玩家（局部坐标已不含玩家位置）
          this.particles.position.set(
            player.group.position.x,
            player.group.position.y,
            player.group.position.z
          );
        }
      }
      if (this.t >= 0.98) this.current = this.target;
    },
  };

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