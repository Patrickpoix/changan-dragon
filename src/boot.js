/* Local, ordered boot of shared engine and scene modules.
 * v8.8: 修复竞态——大文件可能先于小文件加载完成，onload回调时SurfaceLibrary未定义。
 *       小文件全部加载后检查SCENE_MATERIALS/RUNTIME_MODELS是否已就绪，触发补绑。
 * v8.7: deferred大文件改async=true并行加载，不阻塞30-main.js执行
 * v8.6: script.async=false确保按插入顺序执行
 * v8.5: scene-materials.js加载后补绑衣物PBR法线(refreshClothMaterials)
 * v8.4: PBR补绑后requestAnimationFrame重新编译着色器
 * v8.3: scene-materials.js加载后调用SurfaceLibrary.architecture()补绑PBR法线/粗糙度
 * v8.2: scene-materials.js加载后调用GameRendering.refreshEnvironment()用HDRI替换fallback
 * v8.1: 注册Service Worker
 * v8: scene-materials.js移出关键路径
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

const criticalBig = [];
const deferredBig = ['assets/scene-materials.js', 'assets/runtime-models.js'];

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// v8.8: 统一的PBR补绑入口，可被大文件onload或小文件就绪后调用
function applyDeferredPBR() {
  if (typeof SCENE_MATERIALS === 'undefined') return false;
  try { if (typeof GameRendering !== 'undefined' && GameRendering.refreshEnvironment) GameRendering.refreshEnvironment(); } catch(e) {}
  try { if (typeof SurfaceLibrary !== 'undefined' && SurfaceLibrary.architecture) SurfaceLibrary.architecture(); } catch(e) {}
  try { if (typeof SurfaceLibrary !== 'undefined' && SurfaceLibrary.refreshClothMaterials) SurfaceLibrary.refreshClothMaterials(); } catch(e) {}
  try {
    if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
      requestAnimationFrame(() => { try { renderer.compile(scene, camera); console.log('[Boot] ✓ PBR材质着色器重新编译完成'); } catch(e){} });
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

  const smallPromises = smallScripts.map(src => new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = src;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('small script failed: ' + src));
    document.head.appendChild(s);
  }));

  // v8.7: 大文件立即开始下载但async=true（默认），不阻塞30-main.js执行
  for (const src of deferredBig) {
    const s = document.createElement('script'); s.src = src;
    s.onload = () => {
      console.log('[Boot] 延迟素材加载完成: ' + src);
      if (src.indexOf('scene-materials') !== -1) {
        // v8.8: 可能此时SurfaceLibrary尚未定义，applyDeferredPBR内部有typeof检查
        if (!applyDeferredPBR()) window.__PBR_PENDING = true;
      }
      // v8.8: 可能此时WorldAssets尚未定义
      if (!populateDeferredModels()) window.__MODELS_PENDING = true;
    };
    s.onerror = () => console.warn('[Boot] 延迟素材加载失败: ' + src);
    document.head.appendChild(s);
  }

  Promise.all(smallPromises).then(() => {
    if (statusEl) statusEl.textContent = '开始构建长安城…';
    // v8.8: 小文件已就绪，检查大文件是否已先加载完成
    if (window.__PBR_PENDING) { applyDeferredPBR(); window.__PBR_PENDING = false; }
    if (window.__MODELS_PENDING) { populateDeferredModels(); window.__MODELS_PENDING = false; }
    // 兼容旧的计数器逻辑
    if (window.__DEFERRED_ASSETS_READY > 0) {
      try { WorldAssets.reset(); WorldAssets.populate().catch(()=>{}); } catch(e) {}
    }
    const s = document.createElement('script'); s.src = 'src/30-main.js';
    s.async = false;
    document.head.appendChild(s);
  }).catch(err => {
    if (statusEl) statusEl.textContent = '资源加载失败：' + err.message;
    console.error('[Boot]', err);
  });
})();