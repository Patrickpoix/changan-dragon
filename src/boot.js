/* Local, ordered boot of shared engine and scene modules.
 * Keep this list as the single source of load order for the main game.
 * v6 性能优化（2026-10-27）：
 *   - runtime-models.js(9.58MB)从关键路径移出，改为后台延迟加载
 *   - 首屏只需等小文件(1MB)+scene-materials.js(7MB)，不等9.58MB模型模板
 *   - runtime-models.js加载完成后自动调用WorldAssets.populate()重试
 *   - 效果：关键路径下载从16.6MB降到8MB，首屏可交互时间大幅缩短
 * v5: 所有小文件script标签一次性创建，浏览器并行下载、按序执行
 * v4: scene-materials.js和runtime-models.js改为并行下载
 * v3: 移除6个enhance模块，改为GAME.ready后动态加载 */

// 小文件：按依赖顺序排列（script标签默认按文档顺序执行）
const smallScripts = [
  'vendor/three.min.js',
  'vendor/rendering-addons.js',
  'assets/materials.js',
  'assets/character-faces.js',
  'assets/boat-hulls.js',
  'src/00-core.js',
  'src/04-compatibility.js',
  'src/05-rendering.js',
  'src/06-surfaces.js',
  'src/07-water.js',
  'src/08-assets.js',
  'src/09-botany.js',
  'src/10-world.js',
  'src/11-shorelines.js',
  'src/12-landmarks.js',
  'src/20-character.js',
  'src/25-exploration.js',
  'src/25b-film-shots-extra.js',
  'src/26-extra-places.js',
  'src/26b-extra-places-2.js',
  'src/27-session.js',
  'src/27b-extra-poems.js',
  'src/27c-extra-poems-2.js',
  'src/28-weather.js',
  'src/99-safe-init.js',
];

// 关键大文件：buildWorld()依赖MAT材质库，必须等待
const criticalBig = [
  'assets/scene-materials.js',
];

// 延迟大文件：GLB模型模板，WorldAssets.populate()非阻塞，后台加载完自动重试
const deferredBig = [
  'assets/runtime-models.js',
];

(function boot() {
  const statusEl = document.getElementById('bootStatus');

  // 一次性创建所有小文件script标签——浏览器并行下载，按文档顺序执行
  const smallPromises = smallScripts.map(src => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('small script failed: ' + src));
    document.head.appendChild(s);
  }));

  // 关键大文件立即并行下载
  const criticalPromises = criticalBig.map(src => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('critical asset failed: ' + src));
    document.head.appendChild(s);
  }));

  // 延迟大文件也立即开始下载（preload已在HTML中），但不阻塞30-main.js
  for (const src of deferredBig) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => {
      console.log('[Boot] 延迟模型模板加载完成: ' + src);
      // 模型模板加载完成后，重置WorldAssets的pending状态并重试populate
      if (window.WorldAssets && typeof window.WorldAssets.reset === 'function') {
        window.WorldAssets.reset();
        window.WorldAssets.populate().then(assets => {
          console.log('[Boot] 延迟素材载入完成: ' + assets.count + '个物件, ' + assets.meshes + '个mesh');
        }).catch(err => console.warn('[Boot] 延迟素材载入失败:', err));
      }
    };
    s.onerror = () => console.warn('[Boot] 延迟模型模板加载失败: ' + src);
    document.head.appendChild(s);
  }

  // 小文件+关键大文件就绪后，立即加载主入口（不等延迟模型模板）
  Promise.all([...smallPromises, ...criticalPromises]).then(() => {
    if (statusEl) statusEl.textContent = '开始构建长安城…';
    const s = document.createElement('script');
    s.src = 'src/30-main.js';
    document.head.appendChild(s);
  }).catch(err => {
    if (statusEl) statusEl.textContent = '资源加载失败：' + err.message;
    console.error('[Boot]', err);
  });
})();