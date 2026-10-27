/* Local, ordered boot of shared engine and scene modules.
 * Keep this list as the single source of load order for the main game.
 * 2026-10-27 v3 性能优化：
 *   - 从 boot 清单中移除 6 个 enhance 模块（performance/landmarks/vegetation/water/night-light/outside）
 *   - enhance 模块改为在 buildWorld() 完成后由 30-main.js 动态加载
 *   - 原因：enhance 模块在 GAME.ready 后才执行，boot 阶段提前加载只是浪费首屏请求
 *   - boot 阶段从 34 个文件减到 28 个，减少约 18% 首屏请求数
 * 2026-10-27 v2：移除无实际功能的空模块 visual-grade.js / sky.js
 * （视觉基调已由主循环 updateDayNight 统一驱动，天空 Shader 已在 00-core.js）。 */

const scripts = [
  'vendor/three.min.js',
  'vendor/rendering-addons.js',
  'assets/materials.js',
  'assets/scene-materials.js',
  'assets/runtime-models.js',
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
  'src/30-main.js',
];

(function boot() {
  let index = 0;
  function load() {
    if (index >= scripts.length) return;
    const script = document.createElement('script');
    script.src = scripts[index++];
    script.onload = load;
    script.onerror = () => {
      document.getElementById('bootStatus').textContent = '模块加载失败：' + script.src;
    };
    document.head.appendChild(script);
  }
  load();
})();
