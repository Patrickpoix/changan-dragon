/* Local, ordered boot of shared engine and scene modules.
 * v105: 集成GLB模型自动加载，检测可用模型并替换程序化建筑
 * v104: 加载所有高精模型生成器（建筑/人物/植被/桥梁/动物/交通工具/奇观）
 */

const smallScripts = [
  'vendor/three.min.js','vendor/rendering-addons.js',
  'assets/materials.js','assets/character-faces.js','assets/boat-hulls.js',
  // 高精模型生成器
  'assets/models/hq-architecture.js',
  'assets/models/pro-roof-builder.js',
  'assets/models/tang-architecture-pro.js',
  'assets/models/fantasy-wonder-builder.js',
  'assets/models/tang-character-builder.js',
  'assets/models/tang-nature-builder.js',
  'assets/models/tang-bridge-builder.js',
  'assets/models/tang-animal-builder.js',
  'assets/models/tang-vehicle-builder.js',
  'assets/models/model-library.js',
  // 核心引擎
  'src/00-core.js','src/04-compatibility.js','src/05-rendering.js','src/06-surfaces.js',
  'src/07-water.js','src/08-assets.js','src/09-botany.js','src/10-world.js',
  'src/11-shorelines.js','src/12-landmarks.js','src/20-character.js',
  'src/25-exploration.js','src/25b-film-shots-extra.js','src/26-extra-places.js',
  'src/26b-extra-places-2.js','src/27-session.js','src/27b-extra-poems.js',
  'src/27c-extra-poems-2.js','src/28-weather.js','src/30-models.js','src/99-safe-init.js',
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
    console.log('[Boot] 延迟素材载入完成: ' + assets.count + '个物件');
  }).catch(err => console.warn('[Boot] 延迟素材载入失败:', err.message));
  return true;
}

function loadHighQualityModels() {
  if (typeof CHANGAN_MODELS === 'undefined') return;
  
  // v105: 自动检测并加载可用的GLB模型
  if (CHANGAN_MODELS.autoLoad) {
    CHANGAN_MODELS.autoLoad().then(availableKeys => {
      console.log('[Boot] 自动加载可用GLB模型:', availableKeys.length, '个');
    });
  } else {
    // 兜底：手动加载核心模型
    CHANGAN_MODELS.loadBatch([
      'dayanta',
      'pagodaSquare',
      'templeHall'
    ], (models) => {
      console.log('[Boot] 高精模型加载完成:', Object.keys(models));
    });
  }
}

(function boot() {
  const statusEl = document.getElementById('bootStatus');
  let loadedCount = 0;
  const totalCount = smallScripts.length;

  function updateStatus() {
    if (!statusEl) return;
    const pct = Math.round(loadedCount / totalCount * 100);
    if (loadedCount < 5) statusEl.textContent = '铺开长安城… ' + pct + '%';
    else if (loadedCount < 15) statusEl.textContent = '搭建坊市宫阙… ' + pct + '%';
    else statusEl.textContent = '点亮万家灯火… ' + pct + '%';
  }

  const smallPromises = smallScripts.map(src => new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = src;
    s.async = false;
    s.onload = () => { loadedCount++; updateStatus(); resolve(); };
    s.onerror = () => reject(new Error('small script failed: ' + src));
    document.head.appendChild(s);
  }));

  for (const src of deferredBig) {
    const s = document.createElement('script'); s.src = src;
    s.onload = () => {
      if (src.indexOf('scene-materials') !== -1) {
        if (!applyDeferredPBR()) window.__PBR_PENDING = true;
      }
      if (!populateDeferredModels()) window.__MODELS_PENDING = true;
    };
    document.head.appendChild(s);
  }

  Promise.all(smallPromises).then(() => {
    if (statusEl) statusEl.textContent = '开始构建长安城…';
    if (window.__PBR_PENDING) { applyDeferredPBR(); window.__PBR_PENDING = false; }
    if (window.__MODELS_PENDING) { populateDeferredModels(); window.__MODELS_PENDING = false; }
    
    const s = document.createElement('script'); s.src = 'src/30-main.js';
    s.async = false;
    s.onload = () => {
      setTimeout(() => {
        const coreScripts = [
          'cinematic-core.js',
          'sample-district.js',
          'daming-palace.js',
          'pagoda-qujiang.js',
          'palaces.js',
          'atmosphere.js',
          'wonders-v3.js',
        ];
        
        coreScripts.forEach((script) => {
          const el = document.createElement('script');
          el.src = 'src/enhance/' + script;
          el.onerror = () => console.warn('[Boot] 模块加载失败: ' + script);
          document.head.appendChild(el);
        });
        
        loadHighQualityModels();
        
        console.log('[Boot] v105 核心模块加载完成');
        console.log('[Boot] 高精模型生成器已就绪:', typeof ChangAnModelLibrary !== 'undefined' ? '是' : '否');
        console.log('[Boot] GLB模型加载器已就绪:', typeof CHANGAN_MODELS !== 'undefined' ? '是' : '否');
      }, 500);
    };
    document.head.appendChild(s);
  }).catch(err => {
    if (statusEl) statusEl.textContent = '资源加载失败';
    console.error('[Boot]', err);
  });
})();
