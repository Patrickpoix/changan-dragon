/* Local, ordered boot of shared engine and scene modules.
 * Keep this list as the single source of load order for the main game.
 * 29-lanterns.js 已于 2026-10-27 整合进 25-exploration.js 的
 * buildArchitecturalDetails()（消除覆盖模式，减少碎片模块）。 */

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
  'src/26-vehicle.js',
  'src/26b-vehicle-details.js',
  'src/27-session.js',
  'src/27b-ui.js',
  'src/27c-overlays.js',
  'src/28-weather.js',
  'src/enhance/visual-grade.js',
  'src/enhance/sky.js',
  'src/enhance/performance.js',
  'src/enhance/landmarks.js',
  'src/enhance/vegetation.js',
  'src/enhance/water.js',
  'src/enhance/night-light.js',
  'src/enhance/outside.js',
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