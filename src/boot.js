/* Local, ordered boot of shared engine and scene modules.
 * v86: 社交系统增强加载
 * v85: 商店系统增强最先加载
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
        // 社交系统
        const socialScript = document.createElement('script');
        socialScript.src = 'src/enhance/social.js';
        socialScript.onerror = () => console.warn('[Boot] 社交系统模块加载失败');
        document.head.appendChild(socialScript);
        
        // 商店系统
        setTimeout(() => {
          const shopsScript = document.createElement('script');
          shopsScript.src = 'src/enhance/shops.js';
          shopsScript.onerror = () => console.warn('[Boot] 商店系统模块加载失败');
          document.head.appendChild(shopsScript);
        }, 100);
        
        // 成就系统
        setTimeout(() => {
          const achScript = document.createElement('script');
          achScript.src = 'src/enhance/achievements.js';
          achScript.onerror = () => console.warn('[Boot] 成就系统模块加载失败');
          document.head.appendChild(achScript);
        }, 300);
        
        // 任务系统
        setTimeout(() => {
          const questsScript = document.createElement('script');
          questsScript.src = 'src/enhance/quests.js';
          questsScript.onerror = () => console.warn('[Boot] 任务系统模块加载失败');
          document.head.appendChild(questsScript);
        }, 500);
        
        // 背包系统
        setTimeout(() => {
          const invScript = document.createElement('script');
          invScript.src = 'src/enhance/inventory.js';
          invScript.onerror = () => console.warn('[Boot] 背包系统模块加载失败');
          document.head.appendChild(invScript);
        }, 700);
        
        // 帮助教程
        setTimeout(() => {
          const helpScript = document.createElement('script');
          helpScript.src = 'src/enhance/help-tutorial.js';
          helpScript.onerror = () => console.warn('[Boot] 帮助教程模块加载失败');
          document.head.appendChild(helpScript);
        }, 900);
        
        // 设置菜单
        setTimeout(() => {
          const settingsScript = document.createElement('script');
          settingsScript.src = 'src/enhance/settings-menu.js';
          settingsScript.onerror = () => console.warn('[Boot] 设置菜单模块加载失败');
          document.head.appendChild(settingsScript);
        }, 1100);
        
        // 拍照模式
        setTimeout(() => {
          const photoScript = document.createElement('script');
          photoScript.src = 'src/enhance/photo-mode.js';
          photoScript.onerror = () => console.warn('[Boot] 拍照模式模块加载失败');
          document.head.appendChild(photoScript);
        }, 1300);
        
        // 探索系统
        setTimeout(() => {
          const exploreScript = document.createElement('script');
          exploreScript.src = 'src/enhance/explore-system.js';
          exploreScript.onerror = () => console.warn('[Boot] 探索系统模块加载失败');
          document.head.appendChild(exploreScript);
        }, 1500);
        
        // 交互系统
        setTimeout(() => {
          const interactScript = document.createElement('script');
          interactScript.src = 'src/enhance/interaction.js';
          interactScript.onerror = () => console.warn('[Boot] 交互系统模块加载失败');
          document.head.appendChild(interactScript);
        }, 1700);
        
        // 存档系统
        setTimeout(() => {
          const saveScript = document.createElement('script');
          saveScript.src = 'src/enhance/save-system.js';
          saveScript.onerror = () => console.warn('[Boot] 存档系统模块加载失败');
          document.head.appendChild(saveScript);
        }, 1900);
        
        // UI界面增强
        setTimeout(() => {
          const uiScript = document.createElement('script');
          uiScript.src = 'src/enhance/ui-enhance.js';
          uiScript.onerror = () => console.warn('[Boot] UI界面增强模块加载失败');
          document.head.appendChild(uiScript);
        }, 2100);
        
        // 性能优化
        setTimeout(() => {
          const perfScript = document.createElement('script');
          perfScript.src = 'src/enhance/perf-optimize.js';
          perfScript.onerror = () => console.warn('[Boot] 性能优化模块加载失败');
          document.head.appendChild(perfScript);
        }, 2300);
        
        // 光影渲染增强
        setTimeout(() => {
          const renderScript = document.createElement('script');
          renderScript.src = 'src/enhance/render-enhance.js';
          renderScript.onerror = () => console.warn('[Boot] 光影渲染增强模块加载失败');
          document.head.appendChild(renderScript);
        }, 2500);
        
        // PBR材质增强
        setTimeout(() => {
          const pbrScript = document.createElement('script');
          pbrScript.src = 'src/enhance/pbr-enhance.js';
          pbrScript.onerror = () => console.warn('[Boot] PBR材质增强模块加载失败');
          document.head.appendChild(pbrScript);
        }, 2700);
        
        // 视觉氛围
        setTimeout(() => {
          const atmosphereScript = document.createElement('script');
          atmosphereScript.src = 'src/enhance/atmosphere.js';
          atmosphereScript.onerror = () => console.warn('[Boot] 视觉氛围模块加载失败');
          document.head.appendChild(atmosphereScript);
        }, 2900);
        
        // 城墙城门
        setTimeout(() => {
          const cityWallScript = document.createElement('script');
          cityWallScript.src = 'src/enhance/city-wall.js';
          cityWallScript.onerror = () => console.warn('[Boot] 城墙城门模块加载失败');
          document.head.appendChild(cityWallScript);
        }, 3100);
        
        // 桥梁道路
        setTimeout(() => {
          const roadsScript = document.createElement('script');
          roadsScript.src = 'src/enhance/roads-bridges.js';
          roadsScript.onerror = () => console.warn('[Boot] 桥梁道路模块加载失败');
          document.head.appendChild(roadsScript);
        }, 3300);
        
        // 植被增强
        setTimeout(() => {
          const greeneryScript = document.createElement('script');
          greeneryScript.src = 'src/enhance/greenery.js';
          greeneryScript.onerror = () => console.warn('[Boot] 植被增强模块加载失败');
          document.head.appendChild(greeneryScript);
        }, 3500);
        
        // 水景增强
        setTimeout(() => {
          const waterFxScript = document.createElement('script');
          waterFxScript.src = 'src/enhance/water-fx.js';
          waterFxScript.onerror = () => console.warn('[Boot] 水景增强模块加载失败');
          document.head.appendChild(waterFxScript);
        }, 3700);
        
        // 人物NPC
        setTimeout(() => {
          const npcScript = document.createElement('script');
          npcScript.src = 'src/enhance/npc-people.js';
          npcScript.onerror = () => console.warn('[Boot] 人物NPC模块加载失败');
          document.head.appendChild(npcScript);
        }, 3900);
        
        // 动物宠物
        setTimeout(() => {
          const animalsScript = document.createElement('script');
          animalsScript.src = 'src/enhance/animals.js';
          animalsScript.onerror = () => console.warn('[Boot] 动物宠物模块加载失败');
          document.head.appendChild(animalsScript);
        }, 4100);
        
        // 天气氛围
        setTimeout(() => {
          const weatherScript = document.createElement('script');
          weatherScript.src = 'src/enhance/weather-fx.js';
          weatherScript.onerror = () => console.warn('[Boot] 天气氛围模块加载失败');
          document.head.appendChild(weatherScript);
        }, 4300);
        
        // 节日庆典
        setTimeout(() => {
          const festivalScript = document.createElement('script');
          festivalScript.src = 'src/enhance/festival.js';
          festivalScript.onerror = () => console.warn('[Boot] 节日庆典模块加载失败');
          document.head.appendChild(festivalScript);
        }, 4500);
        
        // 音效音乐
        setTimeout(() => {
          const audioScript = document.createElement('script');
          audioScript.src = 'src/enhance/audio-fx.js';
          audioScript.onerror = () => console.warn('[Boot] 音效音乐模块加载失败');
          document.head.appendChild(audioScript);
        }, 4700);
        
        // 夜景增强
        setTimeout(() => {
          const nightSceneScript = document.createElement('script');
          nightSceneScript.src = 'src/enhance/night-scene.js';
          nightSceneScript.onerror = () => console.warn('[Boot] 夜景增强模块加载失败');
          document.head.appendChild(nightSceneScript);
        }, 4900);
        
        // 核心建筑精修
        setTimeout(() => {
          const coreDetailScript = document.createElement('script');
          coreDetailScript.src = 'src/enhance/core-detail.js';
          coreDetailScript.onerror = () => console.warn('[Boot] 核心建筑精修模块加载失败');
          document.head.appendChild(coreDetailScript);
        }, 5100);
        
        // 城市生活
        setTimeout(() => {
          const cityLifeScript = document.createElement('script');
          cityLifeScript.src = 'src/enhance/city-life.js';
          cityLifeScript.onerror = () => console.warn('[Boot] 城市生活模块加载失败');
          document.head.appendChild(cityLifeScript);
        }, 5300);
        
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
        }, 9500);
      }, 500);
    };
    document.head.appendChild(s);
  }).catch(err => {
    if (statusEl) statusEl.textContent = '资源加载失败：' + err.message;
    console.error('[Boot]', err);
  });
})();
