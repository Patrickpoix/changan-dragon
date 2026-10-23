/* Local, ordered boot: the user's original engine takes precedence when present. */
(async function () {
  'use strict';
  const status = document.getElementById('bootStatus');
  const load = src => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error('无法载入本地文件：' + src));
    document.body.appendChild(script);
  });
  try {
    try {
      await load('vendor/three.min.js');
      if (!window.THREE?.WebGLRenderer || String(THREE.REVISION) !== '160') throw new Error('引擎版本不兼容');
      window.__changanEngine = { source: 'original', revision: THREE.REVISION };
    } catch (_) {
      // Kept separately: never overwrite a later upload of the original bundle.
      await load('vendor/three.compat.min.js');
      window.__changanEngine = { source: 'bundled', revision: THREE.REVISION };
    }
    if (document.fonts) {
      await Promise.race([document.fonts.load('18px "Ma Shan Zheng"'), new Promise(resolve => setTimeout(resolve, 1800))]);
    }
    for (const file of ['vendor/rendering-addons.js', 'assets/materials.js', 'assets/scene-materials.js', 'assets/runtime-models.js', 'assets/character-faces.js', 'src/00-core.js', 'src/04-compatibility.js', 'src/05-rendering.js', 'src/06-surfaces.js', 'src/07-water.js', 'src/09-botany.js', 'src/10-world.js', 'src/12-landmarks.js', 'src/20-character.js', 'src/25-exploration.js', 'src/27-session.js', 'src/08-assets.js', 'src/30-main.js']) {
      await load(file);
    }
  } catch (error) {
    if (status) status.textContent = '城门没有打开：' + error.message;
    window.__showFatal?.(error.stack || error.message);
  }
})();
