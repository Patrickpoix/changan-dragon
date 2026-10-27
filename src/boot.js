/* Local, ordered boot of shared engine and scene modules.
 * Keep this list as the single source of load order for the main game.
 * v4 性能优化（2026-10-27）：
 *   - scene-materials.js (7MB) 和 runtime-models.js (9.58MB) 改为并行下载
 *   - 小引擎文件串行加载，同时大文件并行下载，互不阻塞
 *   - 30-main.js 仅在所有文件就绪后加载（此时才执行 boot()）
 *   - 效果：首屏下载时间从串行 17.9MB 变为并行 ~10MB（取最大文件）
 * v3: 移除6个enhance模块，改为GAME.ready后动态加载 */

// 小文件：串行加载（有依赖顺序）
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

// 大文件：并行下载（7MB + 9.58MB，不互相阻塞）
const bigAssets = [
  'assets/scene-materials.js',
  'assets/runtime-models.js',
];

(function boot() {
  const statusEl = document.getElementById('bootStatus');

  // 立即并行启动大文件下载
  const bigPromises = bigAssets.map(src => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => { if (statusEl) statusEl.textContent = '大素材载入中…'; resolve(); };
    s.onerror = () => reject(new Error('big asset failed: ' + src));
    document.head.appendChild(s);
  }));

  // 串行加载小引擎文件
  let index = 0;
  function loadSmall() {
    if (index >= smallScripts.length) {
      // 小文件全部加载完毕，等待大文件就绪后加载主入口
      Promise.all(bigPromises).then(() => {
        if (statusEl) statusEl.textContent = '开始构建长安城…';
        const s = document.createElement('script');
        s.src = 'src/30-main.js';
        document.head.appendChild(s);
      }).catch(err => {
        if (statusEl) statusEl.textContent = '大素材加载失败：' + err.message;
        console.error('[Boot]', err);
      });
      return;
    }
    const script = document.createElement('script');
    script.src = smallScripts[index++];
    script.onload = loadSmall;
    script.onerror = () => {
      if (statusEl) statusEl.textContent = '模块加载失败：' + script.src;
    };
    document.head.appendChild(script);
  }
  loadSmall();
})();
