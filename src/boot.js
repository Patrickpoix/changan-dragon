/* Local, ordered boot of shared engine and scene modules.
 * v7 性能优化（2026-10-27）：
 *   - 修复WorldAssets引用方式：const声明的全局变量不在window上，用typeof检查
 * v6 性能优化：
 *   - runtime-models.js(9.58MB)从关键路径移出，改为后台延迟加载
 *   - 首屏只需等小文件(1MB)+scene-materials.js(7MB)，不等9.58MB模型模板
 *   - runtime-models.js加载完成后自动调用WorldAssets.reset()+populate()重试
 *   - 效果：关键路径下载从16.6MB降到8MB
 * v5: 所有小文件script标签一次性创建，浏览器并行下载、按序执行 */

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

// 关键大文件：buildWorld()依赖MAT材质库，必须等待
const criticalBig = ['assets/scene-materials.js'];
// 延迟大文件：GLB模型模板，WorldAssets.populate()非阻塞，后台加载完自动重试
const deferredBig = ['assets/runtime-models.js'];

(function boot() {
  const statusEl = document.getElementById('bootStatus');

  const smallPromises = smallScripts.map(src => new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('small script failed: ' + src));
    document.head.appendChild(s);
  }));

  const criticalPromises = criticalBig.map(src => new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('critical asset failed: ' + src));
    document.head.appendChild(s);
  }));

  // 延迟大文件：立即开始下载，但不阻塞30-main.js
  for (const src of deferredBig) {
    const s = document.createElement('script'); s.src = src;
    s.onload = () => {
      console.log('[Boot] 延迟模型模板加载完成: ' + src);
      // WorldAssets是const全局变量（不在window上），用typeof安全检查
      try {
        if (typeof WorldAssets !== 'undefined' && typeof WorldAssets.reset === 'function') {
          WorldAssets.reset();
          WorldAssets.populate().then(assets => {
            console.log('[Boot] 延迟素材载入完成: ' + assets.count + '个物件, ' + assets.meshes + '个mesh');
          }).catch(err => console.warn('[Boot] 延迟素材载入失败:', err));
        } else {
          // WorldAssets尚未定义（延迟文件比小文件先到），设标记等30-main.js就绪后处理
          window.__RUNTIME_MODELS_READY = true;
        }
      } catch(e) { console.warn('[Boot] 延迟素材重试异常:', e); }
    };
    s.onerror = () => console.warn('[Boot] 延迟模型模板加载失败: ' + src);
    document.head.appendChild(s);
  }

  Promise.all([...smallPromises, ...criticalPromises]).then(() => {
    if (statusEl) statusEl.textContent = '开始构建长安城…';
    // 如果延迟模型已加载但WorldAssets尚未就绪，现在补上
    if (window.__RUNTIME_MODELS_READY) {
      try { WorldAssets.reset(); WorldAssets.populate().catch(()=>{}); } catch(e) {}
    }
    const s = document.createElement('script'); s.src = 'src/30-main.js';
    document.head.appendChild(s);
  }).catch(err => {
    if (statusEl) statusEl.textContent = '资源加载失败：' + err.message;
    console.error('[Boot]', err);
  });
})();