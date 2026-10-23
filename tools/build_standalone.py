#!/usr/bin/env python3
"""Build the existing local game into one offline HTML file without dependencies."""
import base64
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'dist' / 'changan-dragon.html'
SOURCES = ['vendor/rendering-addons.js', 'assets/materials.js', 'assets/scene-materials.js', 'assets/runtime-models.js', 'assets/character-faces.js', 'assets/boat-hulls.js', 'src/00-core.js', 'src/04-compatibility.js', 'src/05-rendering.js', 'src/06-surfaces.js', 'src/07-water.js', 'src/09-botany.js', 'src/10-world.js',
           'src/11-shorelines.js', 'src/12-landmarks.js', 'src/20-character.js',
           'src/25-exploration.js', 'src/27-session.js', 'src/08-assets.js', 'src/30-main.js']


def inline_script(path):
    code = path.read_text(encoding='utf-8').replace('</script', '<\\/script')
    return '<script type="application/x-changan">\n' + code + '\n</script>'


def build():
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    # Ship the checksum-verified r160 bundle used to build the official addons.
    # A future uploaded engine is preserved and checked by the source bootstrap.
    engine = ROOT / 'vendor' / 'three.compat.min.js'
    if not engine.is_file():
        raise SystemExit('Missing local Three.js engine; run tools/prepare_assets.py')
    license_text = (ROOT / 'vendor' / 'THREE-LICENSE.txt').read_text(encoding='utf-8')
    scripts = ['<!-- Bundled Three.js license:\n' + license_text.replace('--', '—') + '\n-->']
    scripts.append(inline_script(engine))
    scripts.append('<script type="application/x-changan">window.__changanEngine={source:"standalone",revision:THREE.REVISION};</script>')
    scripts.extend(inline_script(ROOT / source) for source in SOURCES)
    for license_path in ['vendor/rendering-addons-LICENSE.txt', 'vendor/miniLibs-LICENSE.txt', 'assets/fonts/MaShanZheng-OFL.txt', 'assets/library/quaternius/LICENSE-CC0-1.0.txt']:
        text = (ROOT / license_path).read_text(encoding='utf-8').replace('--', '—')
        scripts.append('<!-- ' + license_path + '\n' + text + '\n-->')
    scripts.append('''<script>
    (async function () {
      try {
        if (document.fonts) await document.fonts.load('18px "Ma Shan Zheng"');
        for (const block of document.querySelectorAll('script[type="application/x-changan"]')) {
          const executable = document.createElement('script');
          executable.textContent = block.textContent;
          document.body.appendChild(executable);
          executable.remove();
          block.remove();
        }
      } catch (error) { window.__showFatal?.(error.stack || String(error)); }
    })();
    </script>''')
    marker = '<script src="src/boot.js"></script>'
    if html.count(marker) != 1:
        raise SystemExit('Expected exactly one src/boot.js entry')
    html = html.replace(marker, '\n'.join(scripts))

    # Keep future local image and font references self-contained as well. Missing
    # assets fail loudly; do not invent replacements for the user's uploads.
    mime = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf'}
    def data_url(relative):
        file = (ROOT / relative).resolve()
        if not file.is_relative_to(ROOT):
            raise ValueError('Resource escapes checkout: ' + relative)
        if not file.is_file():
            raise FileNotFoundError('Referenced resource missing: ' + relative)
        return 'data:' + mime[file.suffix.lower()] + ';base64,' + base64.b64encode(file.read_bytes()).decode('ascii')
    html = re.sub(r'''url\(["']?([^\s()"']+\.(?:woff2?|ttf|png|jpe?g|webp))["']?\)''',
                  lambda m: 'url("' + data_url(m.group(1)) + '")', html)
    html = re.sub(r'''((?:src|href)=["'])([^"']+\.(?:png|jpe?g|webp))(["'])''',
                  lambda m: m.group(1) + data_url(m.group(2)) + m.group(3), html)
    OUTPUT.parent.mkdir(exist_ok=True)
    temporary=OUTPUT.with_suffix('.html.tmp')
    temporary.write_text(html, encoding='utf-8')
    temporary.replace(OUTPUT)
    print(f'Built {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size:,} bytes), engine: {engine.name}')


if __name__ == '__main__':
    build()
