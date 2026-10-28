/* Local, ordered boot of shared engine and scene modules.
 * v100: 全面视觉升级完成 — 20+增强模块
 * v99: 水面天空v2、夜景v2、仙侠奇观v3
 * v98: 全面视觉升级 — 风格系统、电影后处理、PBR增强、人物精模、植被精修、性能优化
 */

const smallScripts = [
  'vendor/three.min.js','vendor/rendering-addons.js',
  'assets/materials.js','assets/character-faces.js','assets/boat-hulls.js',
  'src/00-core.js','src/04-compatibility.js','src/05-rendering.js','src/06-surfaces.js',
  'src/07-water.js','src/08-assets.js','src/09-botany.js','src/10-world.js',
  'src/11-shorelines.js','src/12-landmarks.js','src/20-character.js',
  'src/25-exploration.js','src/25b-film-shots-extra.js','src/26-extra-places.js',
  'src/26b-extra-places-2.js','src/27-session.js','src/27b-extra-poems.js',
  'src/27c-extra-poems-2.js','src/28-weather.js','src/99-safe-init.js',
];

const deferredBig = ['assets/scene-materials.js', 'assets/runtime-models.js'];

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

function applyDeferredPBR() {
  if (typeof SCENE_MATERIALS === 'undefined') return false;
  try { if (typeof GameRendering !== 'undefined' && GameRendering.refreshEnvironment) GameRendering.refreshEnvironment(); } catch(e) {}
  try { if (typeof SurfaceLibrary !== 'undefined' && SurfaceLibrary.architecture) SurfaceLibrary.architecture(); } catch(e) {}
  try { if (typeof SurfaceLibrary !== 'undefined' && SurfaceLibrary.refreshClothMaterials) SurfaceLibrary.refreshClothMaterials(); } catch(e) {}
  try {
    if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
      requestAnimationFrame(() => { try { renderer.compile(scene, camera); } catch(e){} });
    }
  } catch(e) {}
  return true;
}

function populateDeferredModels() {
  if (typeof WorldAssets === 'undefined' || typeof WorldAssets.reset !== 'function') return false;
  WorldAssets.reset();
  WorldAssets.populate().then(assets => {
    console.log('[Boot] 延迟素材载入完成: ' + assets.count + '个物件, ' + assets.meshes + '个mesh');
  }).catch(err => console.warn('[Boot] 延迟素材载入失败:', err.message));
  return true;
}

(function boot() {
  const statusEl = document.getElementById('bootStatus');
  let loadedCount = 0;
  const totalCount = smallScripts.length;

  function updateStatus() {
    if (!statusEl) return;
    const pct = Math.round(loadedCount / totalCount * 100);
    if (loadedCount === 0) statusEl.textContent = '正在准备笔墨纸砚…';
    else if (loadedCount < 5) statusEl.textContent = '铺开长安城… ' + pct + '%';
    else if (loadedCount < 15) statusEl.textContent = '搭建坊市宫阙… ' + pct + '%';
    else if (loadedCount < totalCount) statusEl.textContent = '点亮万家灯火… ' + pct + '%';
  }

  const smallPromises = smallScripts.map(src => new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = src;
    s.async = false;
    if (src === 'vendor/three.min.js') { try { s.fetchPriority = 'high'; } catch(e){} }
    s.onload = () => { loadedCount++; updateStatus(); resolve(); };
    s.onerror = () => reject(new Error('small script failed: ' + src));
    document.head.appendChild(s);
  }));

  for (const src of deferredBig) {
    const s = document.createElement('script'); s.src = src;
    s.onload = () => {
      console.log('[Boot] 延迟素材加载完成: ' + src);
      if (src.indexOf('scene-materials') !== -1) {
        if (!applyDeferredPBR()) window.__PBR_PENDING = true;
      }
      if (!populateDeferredModels()) window.__MODELS_PENDING = true;
    };
    s.onerror = () => console.warn('[Boot] 延迟素材加载失败: ' + src);
    document.head.appendChild(s);
  }

  Promise.all(smallPromises).then(() => {
    if (statusEl) statusEl.textContent = '开始构建长安城…';
    if (window.__PBR_PENDING) { applyDeferredPBR(); window.__PBR_PENDING = false; }
    if (window.__MODELS_PENDING) { populateDeferredModels(); window.__MODELS_PENDING = false; }
    if (window.__DEFERRED_ASSETS_READY > 0) {
      try { WorldAssets.reset(); WorldAssets.populate().catch(()=>{}); } catch(e) {}
    }
    const s = document.createElement('script'); s.src = 'src/30-main.js';
    s.async = false;
    s.onload = () => {
      setTimeout(() => {
        // ===== 核心视觉升级（最高优先级）=====
        const coreScripts = [
          'style-system.js',        // 统一视觉风格
          'tang-detail.js',          // 唐式建筑精修
          'hanyuan-detail.js',       // 含元殿深度精修
          'dayanta-detail.js',       // 大雁塔精修
          'zhuque-detail.js',        // 朱雀大街精修
          'cinematic-fx.js',          // 电影级后处理
          'pbr-enhance-v2.js',        // PBR材质增强
          'water-sky-v2.js',          // 水面天空增强
          'night-v2.js',              // 夜景灯光增强
          'wonders-v3.js',            // 仙侠奇观
          'tang-npc-v2.js',           // 唐代人物NPC
          'vegetation-v2.js',          // 植被系统
          'perf-opt-v2.js',            // 性能优化
        ];
        
        coreScripts.forEach((script, i) => {
          setTimeout(() => {
            const el = document.createElement('script');
            el.src = 'src/enhance/' + script;
            el.onerror = () => console.warn('[Boot] 模块加载失败: ' + script);
            document.head.appendChild(el);
          }, i * 80);
        });
        
        // ===== 城市细节增强 =====
        const cityScripts = [
          'city-life-v2.js',         // 城市生活
          'wall-v2.js',               // 城墙城门
          'water-v2.js',               // 水域桥梁
          'wards-v2.js',               // 108坊
          'roads-v2.js',                // 道路街道
          'temples-v2.js',              // 寺庙宗教
          'palace-v2.js',               // 宫殿皇家
          'market-v2.js',                // 市场商业
          'night-v3.js',                  // 夜景氛围
          'nature-v2.js',                 // 自然景观
          'seasons-v2.js',                 // 天气季节
        ];
        
        cityScripts.forEach((script, i) => {
          setTimeout(() => {
            const el = document.createElement('script');
            el.src = 'src/enhance/' + script;
            el.onerror = () => console.warn('[Boot] 模块加载失败: ' + script);
            document.head.appendChild(el);
          }, 1200 + i * 100);
        });
        
        // ===== 游戏系统增强 =====
        const gameScripts = [
          'ui-v2.js',                // UI界面
          'audio-v2.js',              // 音效音乐
          'perf-v3.js',                // 性能优化
          'interaction-v2.js',          // 交互玩法
        ];
        
        gameScripts.forEach((script, i) => {
          setTimeout(() => {
            const el = document.createElement('script');
            el.src = 'src/enhance/' + script;
            el.onerror = () => console.warn('[Boot] 模块加载失败: ' + script);
            document.head.appendChild(el);
          }, 2500 + i * 200);
        });
        
        // ===== 原有视觉增强模块 =====
        const legacyScripts = [
          'render-enhance.js', 'atmosphere.js', 'core-detail.js',
          'city-wall.js', 'roads-bridges.js', 'water-fx.js',
          'night-scene.js', 'city-life.js', 'animals.js',
          'weather-fx.js', 'festival.js', 'audio-fx.js'
        ];
        
        legacyScripts.forEach((script, i) => {
          setTimeout(() => {
            const el = document.createElement('script');
            el.src = 'src/enhance/' + script;
            el.onerror = () => console.warn('[Boot] 模块加载失败: ' + script);
            document.head.appendChild(el);
          }, 3500 + i * 100);
        });
        
        // ===== 其他游戏系统（更晚加载）=====
        setTimeout(() => {
          const moreSystems = [
            'inventory.js', 'quests.js', 'achievements.js',
            'shops.js', 'social.js', 'pets.js',
            'equipment.js', 'skills.js', 'home.js',
            'guild.js', 'leaderboard.js', 'mail.js', 'chat.js',
            'help-tutorial.js'
          ];
          moreSystems.forEach((mod, i) => {
            setTimeout(() => {
              const el = document.createElement('script');
              el.src = 'src/enhance/' + mod;
              el.onerror = () => console.warn('[Boot] 模块加载失败: ' + mod);
              document.head.appendChild(el);
            }, i * 200);
          });
        }, 5000);
      }, 500);
    };
    document.head.appendChild(s);
  }).catch(err => {
    if (statusEl) statusEl.textContent = '资源加载失败：' + err.message;
    console.error('[Boot]', err);
  });
})();
