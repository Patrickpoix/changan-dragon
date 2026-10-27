/* Local, ordered boot of shared engine and scene modules.
 * v40: 背包与物品管理系统
 * v39: 好友与聊天社交系统
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
      // 主游戏加载完成后，依次加载增强模块
      setTimeout(() => {
        // 背包与物品管理系统
        const bagScript = document.createElement('script');
        bagScript.src = 'src/enhance/bag-item.js';
        bagScript.onerror = () => console.warn('[Boot] 背包物品模块加载失败');
        document.head.appendChild(bagScript);
        
        // 好友与聊天社交系统
        setTimeout(() => {
          const friendScript = document.createElement('script');
          friendScript.src = 'src/enhance/friend-chat.js';
          friendScript.onerror = () => console.warn('[Boot] 好友聊天模块加载失败');
          document.head.appendChild(friendScript);
        }, 200);
        
        // 商城与充值系统
        setTimeout(() => {
          const shopScript = document.createElement('script');
          shopScript.src = 'src/enhance/shop-recharge.js';
          shopScript.onerror = () => console.warn('[Boot] 商城充值模块加载失败');
          document.head.appendChild(shopScript);
        }, 400);
        
        // 成就与称号收集系统
        setTimeout(() => {
          const achievementScript = document.createElement('script');
          achievementScript.src = 'src/enhance/achievement-title.js';
          achievementScript.onerror = () => console.warn('[Boot] 成就称号模块加载失败');
          document.head.appendChild(achievementScript);
        }, 600);
        
        // 帮派与帮战系统
        setTimeout(() => {
          const guildScript = document.createElement('script');
          guildScript.src = 'src/enhance/guild-war.js';
          guildScript.onerror = () => console.warn('[Boot] 帮派帮战模块加载失败');
          document.head.appendChild(guildScript);
        }, 800);
        
        // 宠物与坐骑养成系统
        setTimeout(() => {
          const petMountScript = document.createElement('script');
          petMountScript.src = 'src/enhance/pet-mount-growth.js';
          petMountScript.onerror = () => console.warn('[Boot] 宠物坐骑养成模块加载失败');
          document.head.appendChild(petMountScript);
        }, 1000);
        
        // 装备与宝石系统
        setTimeout(() => {
          const equipScript = document.createElement('script');
          equipScript.src = 'src/enhance/equipment-gem.js';
          equipScript.onerror = () => console.warn('[Boot] 装备宝石模块加载失败');
          document.head.appendChild(equipScript);
        }, 1200);
        
        // 活动与副本系统
        setTimeout(() => {
          const activityScript = document.createElement('script');
          activityScript.src = 'src/enhance/activity-dungeon.js';
          activityScript.onerror = () => console.warn('[Boot] 活动副本模块加载失败');
          document.head.appendChild(activityScript);
        }, 1400);
        
        // 排行榜与成就系统
        setTimeout(() => {
          const rankScript = document.createElement('script');
          rankScript.src = 'src/enhance/ranking-achievement.js';
          rankScript.onerror = () => console.warn('[Boot] 排行榜成就模块加载失败');
          document.head.appendChild(rankScript);
        }, 1600);
        
        // 家园与种植系统
        setTimeout(() => {
          const homeScript = document.createElement('script');
          homeScript.src = 'src/enhance/home-garden.js';
          homeScript.onerror = () => console.warn('[Boot] 家园种植模块加载失败');
          document.head.appendChild(homeScript);
        }, 1800);
        
        // 社交与婚姻系统
        setTimeout(() => {
          const socialScript = document.createElement('script');
          socialScript.src = 'src/enhance/social-marriage.js';
          socialScript.onerror = () => console.warn('[Boot] 社交婚姻模块加载失败');
          document.head.appendChild(socialScript);
        }, 2000);
        
        // 坐骑与宠物养成系统
        setTimeout(() => {
          const mountScript = document.createElement('script');
          mountScript.src = 'src/enhance/mounts-pets.js';
          mountScript.onerror = () => console.warn('[Boot] 坐骑宠物模块加载失败');
          document.head.appendChild(mountScript);
        }, 2200);
        
        // 战斗与PK系统
        setTimeout(() => {
          const combatScript = document.createElement('script');
          combatScript.src = 'src/enhance/combat-pvp.js';
          combatScript.onerror = () => console.warn('[Boot] 战斗PK模块加载失败');
          document.head.appendChild(combatScript);
        }, 2400);
        
        // 门派与修炼系统
        setTimeout(() => {
          const sectScript = document.createElement('script');
          sectScript.src = 'src/enhance/sect-cultivation.js';
          sectScript.onerror = () => console.warn('[Boot] 门派修炼模块加载失败');
          document.head.appendChild(sectScript);
        }, 2600);
        
        // 科举与官职系统
        setTimeout(() => {
          const examScript = document.createElement('script');
          examScript.src = 'src/enhance/imperial-exam.js';
          examScript.onerror = () => console.warn('[Boot] 科举官职模块加载失败');
          document.head.appendChild(examScript);
        }, 2800);
        
        // 收藏与商业系统
        setTimeout(() => {
          const collectScript = document.createElement('script');
          collectScript.src = 'src/enhance/collection-business.js';
          collectScript.onerror = () => console.warn('[Boot] 收藏商业模块加载失败');
          document.head.appendChild(collectScript);
        }, 3000);
        
        // 文化艺术系统
        setTimeout(() => {
          const artScript = document.createElement('script');
          artScript.src = 'src/enhance/cultural-arts.js';
          artScript.onerror = () => console.warn('[Boot] 文化艺术模块加载失败');
          document.head.appendChild(artScript);
        }, 3200);
        
        // 拍照与休闲系统
        setTimeout(() => {
          const photoScript = document.createElement('script');
          photoScript.src = 'src/enhance/photo-leisure.js';
          photoScript.onerror = () => console.warn('[Boot] 拍照休闲模块加载失败');
          document.head.appendChild(photoScript);
        }, 3400);
        
        // 宠物与时装系统
        setTimeout(() => {
          const petScript = document.createElement('script');
          petScript.src = 'src/enhance/pet-fashion.js';
          petScript.onerror = () => console.warn('[Boot] 宠物时装模块加载失败');
          document.head.appendChild(petScript);
        }, 3600);
        
        // 任务与剧情系统
        setTimeout(() => {
          const questScript = document.createElement('script');
          questScript.src = 'src/enhance/quest-story.js';
          questScript.onerror = () => console.warn('[Boot] 任务剧情模块加载失败');
          document.head.appendChild(questScript);
        }, 3800);
        
        // 植被与交通增强
        setTimeout(() => {
          const vegScript = document.createElement('script');
          vegScript.src = 'src/enhance/vegetation-traffic.js';
          vegScript.onerror = () => console.warn('[Boot] 植被交通模块加载失败');
          document.head.appendChild(vegScript);
        }, 4000);
        
        // 天空与水面增强
        setTimeout(() => {
          const skyScript = document.createElement('script');
          skyScript.src = 'src/enhance/sky-water.js';
          skyScript.onerror = () => console.warn('[Boot] 天空水面模块加载失败');
          document.head.appendChild(skyScript);
        }, 4200);
        
        // 存档与成就系统
        setTimeout(() => {
          const saveScript = document.createElement('script');
          saveScript.src = 'src/enhance/save-achievement.js';
          saveScript.onerror = () => console.warn('[Boot] 存档成就模块加载失败');
          document.head.appendChild(saveScript);
        }, 4400);
        
        // 性能与音效增强
        setTimeout(() => {
          const perfScript = document.createElement('script');
          perfScript.src = 'src/enhance/perf-audio.js';
          perfScript.onerror = () => console.warn('[Boot] 性能音效模块加载失败');
          document.head.appendChild(perfScript);
        }, 4600);
        
        // UI交互增强
        setTimeout(() => {
          const uiScript = document.createElement('script');
          uiScript.src = 'src/enhance/ui-enhancement.js';
          uiScript.onerror = () => console.warn('[Boot] UI增强模块加载失败');
          document.head.appendChild(uiScript);
        }, 4800);
        
        // 天气与环境增强
        setTimeout(() => {
          const weatherScript = document.createElement('script');
          weatherScript.src = 'src/enhance/weather-env.js';
          weatherScript.onerror = () => console.warn('[Boot] 天气环境模块加载失败');
          document.head.appendChild(weatherScript);
        }, 5000);
        
        // 建筑细节增强
        setTimeout(() => {
          const archScript = document.createElement('script');
          archScript.src = 'src/enhance/arch-details.js';
          archScript.onerror = () => console.warn('[Boot] 建筑细节模块加载失败');
          document.head.appendChild(archScript);
        }, 5200);
        
        // 城市细节增强
        setTimeout(() => {
          const cityDetailsScript = document.createElement('script');
          cityDetailsScript.src = 'src/enhance/city-details.js';
          cityDetailsScript.onerror = () => console.warn('[Boot] 城市细节模块加载失败');
          document.head.appendChild(cityDetailsScript);
        }, 5400);
        
        // 人物与自然增强
        setTimeout(() => {
          const lifeScript = document.createElement('script');
          lifeScript.src = 'src/enhance/life-enhancement.js';
          lifeScript.onerror = () => console.warn('[Boot] 人物与自然模块加载失败');
          document.head.appendChild(lifeScript);
        }, 5600);
        
        // 夜景灯光
        setTimeout(() => {
          const nightScript = document.createElement('script');
          nightScript.src = 'src/enhance/night-light.js';
          nightScript.onerror = () => console.warn('[Boot] 夜景灯光模块加载失败');
          document.head.appendChild(nightScript);
        }, 5800);
        
        // 奇观建筑
        setTimeout(() => {
          const wonderScript = document.createElement('script');
          wonderScript.src = 'src/enhance/wonders.js';
          wonderScript.onerror = () => console.warn('[Boot] 奇观建筑模块加载失败');
          document.head.appendChild(wonderScript);
        }, 6200);
      }, 1000);
    };
    document.head.appendChild(s);
  }).catch(err => {
    if (statusEl) statusEl.textContent = '资源加载失败：' + err.message;
    console.error('[Boot]', err);
  });
})();
