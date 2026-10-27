/* Local, ordered boot of shared engine and scene modules.
 * v19: 添加天空与水面增强模块
 * v18: 添加存档与成就系统
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
        // 天空与水面增强
        const skyScript = document.createElement('script');
        skyScript.src = 'src/enhance/sky-water.js';
        skyScript.onerror = () => console.warn('[Boot] 天空水面模块加载失败');
        document.head.appendChild(skyScript);
        
        // 存档与成就系统
        setTimeout(() => {
          const saveScript = document.createElement('script');
          saveScript.src = 'src/enhance/save-achievement.js';
          saveScript.onerror = () => console.warn('[Boot] 存档成就模块加载失败');
          document.head.appendChild(saveScript);
        }, 200);
        
        // 性能与音效增强
        setTimeout(() => {
          const perfScript = document.createElement('script');
          perfScript.src = 'src/enhance/perf-audio.js';
          perfScript.onerror = () => console.warn('[Boot] 性能音效模块加载失败');
          document.head.appendChild(perfScript);
        }, 400);
        
        // UI交互增强
        setTimeout(() => {
          const uiScript = document.createElement('script');
          uiScript.src = 'src/enhance/ui-enhancement.js';
          uiScript.onerror = () => console.warn('[Boot] UI增强模块加载失败');
          document.head.appendChild(uiScript);
        }, 600);
        
        // 天气与环境增强
        setTimeout(() => {
          const weatherScript = document.createElement('script');
          weatherScript.src = 'src/enhance/weather-env.js';
          weatherScript.onerror = () => console.warn('[Boot] 天气环境模块加载失败');
          document.head.appendChild(weatherScript);
        }, 800);
        
        // 建筑细节增强
        setTimeout(() => {
          const archScript = document.createElement('script');
          archScript.src = 'src/enhance/arch-details.js';
          archScript.onerror = () => console.warn('[Boot] 建筑细节模块加载失败');
          document.head.appendChild(archScript);
        }, 1000);
        
        // 城市细节增强
        setTimeout(() => {
          const cityDetailsScript = document.createElement('script');
          cityDetailsScript.src = 'src/enhance/city-details.js';
          cityDetailsScript.onerror = () => console.warn('[Boot] 城市细节模块加载失败');
          document.head.appendChild(cityDetailsScript);
        }, 1200);
        
        // 人物与自然增强
        setTimeout(() => {
          const lifeScript = document.createElement('script');
          lifeScript.src = 'src/enhance/life-enhancement.js';
          lifeScript.onerror = () => console.warn('[Boot] 人物与自然模块加载失败');
          document.head.appendChild(lifeScript);
        }, 1400);
        
        // 夜景灯光
        setTimeout(() => {
          const nightScript = document.createElement('script');
          nightScript.src = 'src/enhance/night-light.js';
          nightScript.onerror = () => console.warn('[Boot] 夜景灯光模块加载失败');
          document.head.appendChild(nightScript);
        }, 1600);
        
        // 奇观建筑
        setTimeout(() => {
          const wonderScript = document.createElement('script');
          wonderScript.src = 'src/enhance/wonders.js';
          wonderScript.onerror = () => console.warn('[Boot] 奇观建筑模块加载失败');
          document.head.appendChild(wonderScript);
        }, 2000);
      }, 1000);
    };
    document.head.appendChild(s);
  }).catch(err => {
    if (statusEl) statusEl.textContent = '资源加载失败：' + err.message;
    console.error('[Boot]', err);
  });
})();
