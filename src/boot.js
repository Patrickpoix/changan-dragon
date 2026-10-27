/* Local, ordered boot of shared engine and scene modules.
 * v8.6: script.async=false确保按插入顺序执行（动态创建默认async=true会乱序）
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

(function boot() {
  const statusEl = document.getElementById('bootStatus');

  const smallPromises = smallScripts.map(src => new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = src;
    s.async = false; // v8.6: 动态创建默认async=true会乱序执行；false确保按插入顺序
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('small script failed: ' + src));
    document.head.appendChild(s);
  }));

  for (const src of deferredBig) {
    const s = document.createElement('script'); s.src = src;
    s.async = false; // 延迟文件也按序执行，确保不依赖执行顺序的代码正确
    s.onload = () => {
      console.log('[Boot] 延迟素材加载完成: ' + src);
      if (src.indexOf('scene-materials') !== -1) {
        try { if (typeof GameRendering !== 'undefined' && GameRendering.refreshEnvironment) GameRendering.refreshEnvironment(); } catch(e) {}
        try { if (typeof SurfaceLibrary !== 'undefined' && SurfaceLibrary.architecture) SurfaceLibrary.architecture(); } catch(e) {}
        try { if (typeof SurfaceLibrary !== 'undefined' && SurfaceLibrary.refreshClothMaterials) SurfaceLibrary.refreshClothMaterials(); } catch(e) {}
        try {
          if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
            requestAnimationFrame(() => { try { renderer.compile(scene, camera); console.log('[Boot] ✓ PBR材质着色器重新编译完成'); } catch(e){} });
          }
        } catch(e) {}
      }
      try {
        if (typeof WorldAssets !== 'undefined' && typeof WorldAssets.reset === 'function') {
          WorldAssets.reset();
          WorldAssets.populate().then(assets => {
            console.log('[Boot] 延迟素材载入完成: ' + assets.count + '个物件, ' + assets.meshes + '个mesh');
          }).catch(err => console.warn('[Boot] 延迟素材载入失败(等另一个素材):', err.message));
        } else {
          window.__DEFERRED_ASSETS_READY = (window.__DEFERRED_ASSETS_READY || 0) + 1;
        }
      } catch(e) { console.warn('[Boot] 延迟素材重试异常:', e); }
    };
    s.onerror = () => console.warn('[Boot] 延迟素材加载失败: ' + src);
    document.head.appendChild(s);
  }

  Promise.all(smallPromises).then(() => {
    if (statusEl) statusEl.textContent = '开始构建长安城…';
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