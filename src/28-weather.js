/* ============================================================
   天气系统 · 晴/阴/雨（v5 主循环驱动）
   - 雨滴粒子（800点，跟随玩家，遇雨天落下）
   - 雾/曝光：基于主循环 GRADE 基线的相对微调（晴天=GRADE 不变）
   - 包装 GameRendering.render：animate() 每帧调用 GameRendering.render(dt)，
     包装必然生效（单一权威更新流程，不包装 window.updateDayNight、不创建第二套 RAF）
   - v5：修复 v3/v4 包装了不存在的 GameRendering.update 方法的 bug
     （GameRendering 只有 render(dt)，update 从未被调用，天气系统静默失效）
   - v5.1：雨滴下落速度 30→18 单位/秒（≈9m/s 真实雨滴，原≈60m/s 过快）
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
    initialized: false,

    init() {
      // 幂等：粒子只创建一次；主循环入口 = GameRendering.render 包装
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
      // 主循环入口：animate() 每帧调用 GameRendering.render(dt)，在此挂载天气更新
      // v5 修复：GameRendering 只有 render(dt) 方法，没有 update(dt)；
      // 此前包装 update 导致天气系统静默失效。现在包装 render。
      if (typeof GameRendering !== 'undefined' && GameRendering && typeof GameRendering.render === 'function') {
        const origRender = GameRendering.render;
        GameRendering.render = function(dt) {
          origRender.call(GameRendering, dt);
          Weather.update(dt);
        };
      }
      // 暴露全局（调试/其他系统引用）
      window.Weather = Weather;
      window.__weather = this;
      // 天气切换按钮（bindHold 定义于 30-main，须在 GAME.ready 后绑定）
      // 优先绑定 HTML 声明的 #weatherBtn；若旧版 index.html 未声明，则动态注入
      //（保持单一权威：按钮 UI 归 HTML，注入仅作兼容层，不做第二套控制逻辑）
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
            // 7 个按钮在竖屏 grid(3列) 会溢出：inline 覆盖为 4 列（media 规则仍在，inline 优先）
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
        // 帮助面板补天气条目（旧版 index.html 无该条目时的兼容注入）
        const helpGrid = document.querySelector('.help-grid');
        if (helpGrid && !Array.from(helpGrid.children).some(el => el.textContent.indexOf('天气按钮') !== -1)) {
          const item = document.createElement('div');
          item.className = 'help-item';
          item.innerHTML = '<strong>☁ 天气按钮</strong><span>晴天、阴天与细雨，随行切换，雨滴飘落</span>';
          helpGrid.appendChild(item);
        }
      }
      console.log('[Weather] 天气系统就绪 - 雨滴粒子800 + GameRendering.render 主循环驱动(GRADE相对微调, v5.1雨滴18u/s)');
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
        if (this.particles.visible && typeof player !== 'undefined' && player) {
          const pos = this.particles.geometry.attributes.position.array;
          for (let i = 0; i < pos.length; i += 3) {
            pos[i+1] -= dt * 18;
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

  // 天气切换按钮改在 init()（GAME.ready 后）绑定，避免 bindHold 未定义。

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
