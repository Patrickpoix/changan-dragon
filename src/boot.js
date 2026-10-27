/* Local, ordered boot of shared engine and scene modules.
 * v98: 全面视觉升级 — 风格系统、电影后处理、PBR增强、人物精模、植被精修、性能优化
 * v97: 朱雀大街精修模块加载
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
        
        // 1. 统一视觉风格系统
        const styleScript = document.createElement('script');
        styleScript.src = 'src/enhance/style-system.js';
        styleScript.onerror = () => console.warn('[Boot] 统一视觉风格系统加载失败');
        document.head.appendChild(styleScript);
        
        // 2. 唐式建筑精修
        setTimeout(() => {
          const tangDetailScript = document.createElement('script');
          tangDetailScript.src = 'src/enhance/tang-detail.js';
          tangDetailScript.onerror = () => console.warn('[Boot] 唐式建筑精修模块加载失败');
          document.head.appendChild(tangDetailScript);
        }, 100);
        
        // 3. 含元殿深度精修
        setTimeout(() => {
          const hanyuanScript = document.createElement('script');
          hanyuanScript.src = 'src/enhance/hanyuan-detail.js';
          hanyuanScript.onerror = () => console.warn('[Boot] 含元殿深度精修模块加载失败');
          document.head.appendChild(hanyuanScript);
        }, 200);
        
        // 4. 大雁塔精修
        setTimeout(() => {
          const dayantaScript = document.createElement('script');
          dayantaScript.src = 'src/enhance/dayanta-detail.js';
          dayantaScript.onerror = () => console.warn('[Boot] 大雁塔精修模块加载失败');
          document.head.appendChild(dayantaScript);
        }, 300);
        
        // 5. 朱雀大街精修
        setTimeout(() => {
          const zhuqueScript = document.createElement('script');
          zhuqueScript.src = 'src/enhance/zhuque-detail.js';
          zhuqueScript.onerror = () => console.warn('[Boot] 朱雀大街精修模块加载失败');
          document.head.appendChild(zhuqueScript);
        }, 400);
        
        // 6. 电影级后处理
        setTimeout(() => {
          const cinematicScript = document.createElement('script');
          cinematicScript.src = 'src/enhance/cinematic-fx.js';
          cinematicScript.onerror = () => console.warn('[Boot] 电影级后处理模块加载失败');
          document.head.appendChild(cinematicScript);
        }, 500);
        
        // 7. PBR材质增强
        setTimeout(() => {
          const pbrScript = document.createElement('script');
          pbrScript.src = 'src/enhance/pbr-enhance-v2.js';
          pbrScript.onerror = () => console.warn('[Boot] PBR材质增强v2加载失败');
          document.head.appendChild(pbrScript);
        }, 600);
        
        // 8. 唐代人物NPC精模
        setTimeout(() => {
          const npcScript = document.createElement('script');
          npcScript.src = 'src/enhance/tang-npc-v2.js';
          npcScript.onerror = () => console.warn('[Boot] 唐代人物NPC精模加载失败');
          document.head.appendChild(npcScript);
        }, 700);
        
        // 9. 植被系统精修
        setTimeout(() => {
          const vegScript = document.createElement('script');
          vegScript.src = 'src/enhance/vegetation-v2.js';
          vegScript.onerror = () => console.warn('[Boot] 植被系统精修加载失败');
          document.head.appendChild(vegScript);
        }, 800);
        
        // 10. 性能优化
        setTimeout(() => {
          const perfScript = document.createElement('script');
          perfScript.src = 'src/enhance/perf-opt-v2.js';
          perfScript.onerror = () => console.warn('[Boot] 性能优化v2加载失败');
          document.head.appendChild(perfScript);
        }, 900);
        
        // ===== 原有视觉增强模块 =====
        setTimeout(() => {
          const renderScript = document.createElement('script');
          renderScript.src = 'src/enhance/render-enhance.js';
          renderScript.onerror = () => console.warn('[Boot] 光影渲染增强模块加载失败');
          document.head.appendChild(renderScript);
        }, 1000);
        
        setTimeout(() => {
          const atmosphereScript = document.createElement('script');
          atmosphereScript.src = 'src/enhance/atmosphere.js';
          atmosphereScript.onerror = () => console.warn('[Boot] 视觉氛围模块加载失败');
          document.head.appendChild(atmosphereScript);
        }, 1100);
        
        setTimeout(() => {
          const coreDetailScript = document.createElement('script');
          coreDetailScript.src = 'src/enhance/core-detail.js';
          coreDetailScript.onerror = () => console.warn('[Boot] 核心建筑精修模块加载失败');
          document.head.appendChild(coreDetailScript);
        }, 1200);
        
        setTimeout(() => {
          const cityWallScript = document.createElement('script');
          cityWallScript.src = 'src/enhance/city-wall.js';
          cityWallScript.onerror = () => console.warn('[Boot] 城墙城门模块加载失败');
          document.head.appendChild(cityWallScript);
        }, 1300);
        
        setTimeout(() => {
          const roadsScript = document.createElement('script');
          roadsScript.src = 'src/enhance/roads-bridges.js';
          roadsScript.onerror = () => console.warn('[Boot] 桥梁道路模块加载失败');
          document.head.appendChild(roadsScript);
        }, 1400);
        
        setTimeout(() => {
          const waterFxScript = document.createElement('script');
          waterFxScript.src = 'src/enhance/water-fx.js';
          waterFxScript.onerror = () => console.warn('[Boot] 水景增强模块加载失败');
          document.head.appendChild(waterFxScript);
        }, 1500);
        
        setTimeout(() => {
          const nightSceneScript = document.createElement('script');
          nightSceneScript.src = 'src/enhance/night-scene.js';
          nightSceneScript.onerror = () => console.warn('[Boot] 夜景增强模块加载失败');
          document.head.appendChild(nightSceneScript);
        }, 1600);
        
        setTimeout(() => {
          const cityLifeScript = document.createElement('script');
          cityLifeScript.src = 'src/enhance/city-life.js';
          cityLifeScript.onerror = () => console.warn('[Boot] 城市生活模块加载失败');
          document.head.appendChild(cityLifeScript);
        }, 1700);
        
        setTimeout(() => {
          const animalsScript = document.createElement('script');
          animalsScript.src = 'src/enhance/animals.js';
          animalsScript.onerror = () => console.warn('[Boot] 动物宠物模块加载失败');
          document.head.appendChild(animalsScript);
        }, 1800);
        
        setTimeout(() => {
          const weatherScript = document.createElement('script');
          weatherScript.src = 'src/enhance/weather-fx.js';
          weatherScript.onerror = () => console.warn('[Boot] 天气氛围模块加载失败');
          document.head.appendChild(weatherScript);
        }, 1900);
        
        setTimeout(() => {
          const festivalScript = document.createElement('script');
          festivalScript.src = 'src/enhance/festival.js';
          festivalScript.onerror = () => console.warn('[Boot] 节日庆典模块加载失败');
          document.head.appendChild(festivalScript);
        }, 2000);
        
        setTimeout(() => {
          const audioScript = document.createElement('script');
          audioScript.src = 'src/enhance/audio-fx.js';
          audioScript.onerror = () => console.warn('[Boot] 音效音乐模块加载失败');
          document.head.appendChild(audioScript);
        }, 2100);
        
        // ===== 游戏系统模块（延迟加载）=====
        setTimeout(() => {
          const uiScript = document.createElement('script');
          uiScript.src = 'src/enhance/ui-enhance.js';
          uiScript.onerror = () => console.warn('[Boot] UI界面增强模块加载失败');
          document.head.appendChild(uiScript);
        }, 2600);
        
        setTimeout(() => {
          const saveScript = document.createElement('script');
          saveScript.src = 'src/enhance/save-system.js';
          saveScript.onerror = () => console.warn('[Boot] 存档系统模块加载失败');
          document.head.appendChild(saveScript);
        }, 2800);
        
        setTimeout(() => {
          const interactScript = document.createElement('script');
          interactScript.src = 'src/enhance/interaction.js';
          interactScript.onerror = () => console.warn('[Boot] 交互系统模块加载失败');
          document.head.appendChild(interactScript);
        }, 3000);
        
        setTimeout(() => {
          const exploreScript = document.createElement('script');
          exploreScript.src = 'src/enhance/explore-system.js';
          exploreScript.onerror = () => console.warn('[Boot] 探索系统模块加载失败');
          document.head.appendChild(exploreScript);
        }, 3200);
        
        setTimeout(() => {
          const settingsScript = document.createElement('script');
          settingsScript.src = 'src/enhance/settings-menu.js';
          settingsScript.onerror = () => console.warn('[Boot] 设置菜单模块加载失败');
          document.head.appendChild(settingsScript);
        }, 3400);
        
        setTimeout(() => {
          const photoScript = document.createElement('script');
          photoScript.src = 'src/enhance/photo-mode.js';
          photoScript.onerror = () => console.warn('[Boot] 拍照模式模块加载失败');
          document.head.appendChild(photoScript);
        }, 3600);
        
        setTimeout(() => {
          const perfScript2 = document.createElement('script');
          perfScript2.src = 'src/enhance/perf-optimize.js';
          perfScript2.onerror = () => console.warn('[Boot] 性能优化模块加载失败');
          document.head.appendChild(perfScript2);
        }, 3800);
        
        // ===== 其他游戏系统（更晚加载）=====
        setTimeout(() => {
          const gameSystems = [
            'inventory.js', 'quests.js', 'achievements.js',
            'shops.js', 'social.js', 'pets.js',
            'equipment.js', 'skills.js', 'home.js',
            'guild.js', 'leaderboard.js', 'mail.js', 'chat.js',
            'help-tutorial.js'
          ];
          gameSystems.forEach((mod, i) => {
            setTimeout(() => {
              const script = document.createElement('script');
              script.src = 'src/enhance/' + mod;
              script.onerror = () => console.warn('[Boot] 模块加载失败: ' + mod);
              document.head.appendChild(script);
            }, i * 200);
          });
        }, 5500);
      }, 500);
    };
    document.head.appendChild(s);
  }).catch(err => {
    if (statusEl) statusEl.textContent = '资源加载失败：' + err.message;
    console.error('[Boot]', err);
  });
})();
