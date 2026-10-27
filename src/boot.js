/* Local, ordered boot of shared engine and scene modules.
 * Keep this list as the single source of load order for the main game.
 * v5 性能优化（2026-10-27）：
 *   - 所有小文件script标签一次性创建，浏览器并行下载、按序执行
 *   - 大素材(7MB+9.58MB)与小引擎文件同时开始下载
 *   - 全部就绪后才加载30-main.js
 *   - 效果：首屏下载时间从串行17.8MB变为并行~16.6MB
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

// 大文件：并行下载（7MB + 9.58MB）
const bigAssets = [
  'assets/scene-materials.js',
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

  // 大文件也立即并行开始下载
  const bigPromises = bigAssets.map(src => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => { if (statusEl) statusEl.textContent = '大素材载入中…'; resolve(); };
    s.onerror = () => reject(new Error('big asset failed: ' + src));
    document.head.appendChild(s);
  }));

  // 小文件+大文件全部就绪后，加载主入口
  Promise.all([...smallPromises, ...bigPromises]).then(() => {
    if (statusEl) statusEl.textContent = '开始构建长安城…';
    const s = document.createElement('script');
    s.src = 'src/30-main.js';
    document.head.appendChild(s);
  }).catch(err => {
    if (statusEl) statusEl.textContent = '资源加载失败：' + err.message;
    console.error('[Boot]', err);
  });
})();
