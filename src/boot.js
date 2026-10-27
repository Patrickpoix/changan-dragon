/* Local, ordered boot of shared engine and scene modules.
 * v72: 光影渲染增强加载
 * v71: 节日庆典增强加载
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
        // 光影渲染增强 — 最先加载
        const renderScript = document.createElement('script');
        renderScript.src = 'src/enhance/render-enhance.js';
        renderScript.onerror = () => console.warn('[Boot] 光影渲染增强模块加载失败');
        document.head.appendChild(renderScript);
        
        // PBR材质增强
        setTimeout(() => {
          const pbrScript = document.createElement('script');
          pbrScript.src = 'src/enhance/pbr-enhance.js';
          pbrScript.onerror = () => console.warn('[Boot] PBR材质增强模块加载失败');
          document.head.appendChild(pbrScript);
        }, 200);
        
        // 视觉氛围
        setTimeout(() => {
          const atmosphereScript = document.createElement('script');
          atmosphereScript.src = 'src/enhance/atmosphere.js';
          atmosphereScript.onerror = () => console.warn('[Boot] 视觉氛围模块加载失败');
          document.head.appendChild(atmosphereScript);
        }, 400);
        
        // 城墙城门
        setTimeout(() => {
          const cityWallScript = document.createElement('script');
          cityWallScript.src = 'src/enhance/city-wall.js';
          cityWallScript.onerror = () => console.warn('[Boot] 城墙城门模块加载失败');
          document.head.appendChild(cityWallScript);
        }, 600);
        
        // 桥梁道路
        setTimeout(() => {
          const roadsScript = document.createElement('script');
          roadsScript.src = 'src/enhance/roads-bridges.js';
          roadsScript.onerror = () => console.warn('[Boot] 桥梁道路模块加载失败');
          document.head.appendChild(roadsScript);
        }, 800);
        
        // 植被增强
        setTimeout(() => {
          const greeneryScript = document.createElement('script');
          greeneryScript.src = 'src/enhance/greenery.js';
          greeneryScript.onerror = () => console.warn('[Boot] 植被增强模块加载失败');
          document.head.appendChild(greeneryScript);
        }, 1000);
        
        // 水景增强
        setTimeout(() => {
          const waterFxScript = document.createElement('script');
          waterFxScript.src = 'src/enhance/water-fx.js';
          waterFxScript.onerror = () => console.warn('[Boot] 水景增强模块加载失败');
          document.head.appendChild(waterFxScript);
        }, 1200);
        
        // 人物NPC
        setTimeout(() => {
          const npcScript = document.createElement('script');
          npcScript.src = 'src/enhance/npc-people.js';
          npcScript.onerror = () => console.warn('[Boot] 人物NPC模块加载失败');
          document.head.appendChild(npcScript);
        }, 1400);
        
        // 动物宠物
        setTimeout(() => {
          const animalsScript = document.createElement('script');
          animalsScript.src = 'src/enhance/animals.js';
          animalsScript.onerror = () => console.warn('[Boot] 动物宠物模块加载失败');
          document.head.appendChild(animalsScript);
        }, 1600);
        
        // 天气氛围
        setTimeout(() => {
          const weatherScript = document.createElement('script');
          weatherScript.src = 'src/enhance/weather-fx.js';
          weatherScript.onerror = () => console.warn('[Boot] 天气氛围模块加载失败');
          document.head.appendChild(weatherScript);
        }, 1800);
        
        // 节日庆典
        setTimeout(() => {
          const festivalScript = document.createElement('script');
          festivalScript.src = 'src/enhance/festival.js';
          festivalScript.onerror = () => console.warn('[Boot] 节日庆典模块加载失败');
          document.head.appendChild(festivalScript);
        }, 2000);
        
        // 夜景增强
        setTimeout(() => {
          const nightSceneScript = document.createElement('script');
          nightSceneScript.src = 'src/enhance/night-scene.js';
          nightSceneScript.onerror = () => console.warn('[Boot] 夜景增强模块加载失败');
          document.head.appendChild(nightSceneScript);
        }, 2200);
        
        // 核心建筑精修
        setTimeout(() => {
          const coreDetailScript = document.createElement('script');
          coreDetailScript.src = 'src/enhance/core-detail.js';
          coreDetailScript.onerror = () => console.warn('[Boot] 核心建筑精修模块加载失败');
          document.head.appendChild(coreDetailScript);
        }, 2400);
        
        // 城市生活
        setTimeout(() => {
          const cityLifeScript = document.createElement('script');
          cityLifeScript.src = 'src/enhance/city-life.js';
          cityLifeScript.onerror = () => console.warn('[Boot] 城市生活模块加载失败');
          document.head.appendChild(cityLifeScript);
        }, 2600);
        
        // 奇观建筑v2
        setTimeout(() => {
          const wondersV2Script = document.createElement('script');
          wondersV2Script.src = 'src/enhance/wonders-v2.js';
          wondersV2Script.onerror = () => console.warn('[Boot] 奇观建筑v2模块加载失败');
          document.head.appendChild(wondersV2Script);
        }, 2800);
        
        // 奇观建筑v1
        setTimeout(() => {
          const wonderScript = document.createElement('script');
          wonderScript.src = 'src/enhance/wonders.js';
          wonderScript.onerror = () => console.warn('[Boot] 奇观建筑模块加载失败');
          document.head.appendChild(wonderScript);
        }, 3000);
        
        // 夜景灯光
        setTimeout(() => {
          const nightScript = document.createElement('script');
          nightScript.src = 'src/enhance/night-light.js';
          nightScript.onerror = () => console.warn('[Boot] 夜景灯光模块加载失败');
          document.head.appendChild(nightScript);
        }, 3300);
        
        // 城市细节
        setTimeout(() => {
          const cityDetailsScript = document.createElement('script');
          cityDetailsScript.src = 'src/enhance/city-details.js';
          cityDetailsScript.onerror = () => console.warn('[Boot] 城市细节模块加载失败');
          document.head.appendChild(cityDetailsScript);
        }, 3600);
        
        // 建筑细节
        setTimeout(() => {
          const archScript = document.createElement('script');
          archScript.src = 'src/enhance/arch-details.js';
          archScript.onerror = () => console.warn('[Boot] 建筑细节模块加载失败');
          document.head.appendChild(archScript);
        }, 3900);
        
        // 人物与自然
        setTimeout(() => {
          const lifeScript = document.createElement('script');
          lifeScript.src = 'src/enhance/life-enhancement.js';
          lifeScript.onerror = () => console.warn('[Boot] 人物与自然模块加载失败');
          document.head.appendChild(lifeScript);
        }, 4200);
        
        // 天空水面
        setTimeout(() => {
          const skyScript = document.createElement('script');
          skyScript.src = 'src/enhance/sky-water.js';
          skyScript.onerror = () => console.warn('[Boot] 天空水面模块加载失败');
          document.head.appendChild(skyScript);
        }, 4500);
        
        // 植被交通
        setTimeout(() => {
          const vegScript = document.createElement('script');
          vegScript.src = 'src/enhance/vegetation-traffic.js';
          vegScript.onerror = () => console.warn('[Boot] 植被交通模块加载失败');
          document.head.appendChild(vegScript);
        }, 4800);
        
        // UI增强
        setTimeout(() => {
          const uiScript = document.createElement('script');
          uiScript.src = 'src/enhance/ui-enhancement.js';
          uiScript.onerror = () => console.warn('[Boot] UI增强模块加载失败');
          document.head.appendChild(uiScript);
        }, 5100);
        
        // 存档成就
        setTimeout(() => {
          const saveScript = document.createElement('script');
          saveScript.src = 'src/enhance/save-achievement.js';
          saveScript.onerror = () => console.warn('[Boot] 存档成就模块加载失败');
          document.head.appendChild(saveScript);
        }, 5400);
        
        // 性能音效
        setTimeout(() => {
          const perfScript = document.createElement('script');
          perfScript.src = 'src/enhance/perf-audio.js';
          perfScript.onerror = () => console.warn('[Boot] 性能音效模块加载失败');
          document.head.appendChild(perfScript);
        }, 5700);
        
        // 后续游戏系统模块
        setTimeout(() => {
          const gameSystems = [
            'economy-shop.js', 'social-friends.js', 'quest-story-pro.js',
            'combat-skills.js', 'home-decoration.js', 'pets-mounts.js',
            'equipment-items.js', 'economy-trading.js', 'growth-advancement.js',
            'social-interaction.js', 'achievements-collection.js', 'events-tournaments.js',
            'privacy-security.js', 'feedback-support.js', 'announcement-notice.js',
            'help-tutorial.js', 'settings.js', 'bag-item.js',
            'friend-chat.js', 'shop-recharge.js', 'achievement-title.js',
            'guild-war.js', 'pet-mount-growth.js', 'equipment-gem.js',
            'activity-dungeon.js', 'ranking-achievement.js', 'home-garden.js',
            'social-marriage.js', 'mounts-pets.js', 'combat-pvp.js',
            'sect-cultivation.js', 'imperial-exam.js', 'collection-business.js',
            'cultural-arts.js', 'photo-leisure.js', 'pet-fashion.js',
            'quest-story.js'
          ];
          gameSystems.forEach((mod, i) => {
            setTimeout(() => {
              const script = document.createElement('script');
              script.src = 'src/enhance/' + mod;
              script.onerror = () => console.warn('[Boot] 模块加载失败: ' + mod);
              document.head.appendChild(script);
            }, i * 150);
          });
        }, 6500);
      }, 500);
    };
    document.head.appendChild(s);
  }).catch(err => {
    if (statusEl) statusEl.textContent = '资源加载失败：' + err.message;
    console.error('[Boot]', err);
  });
})();
