#!/usr/bin/env node
/** Rebuild the offline official Three.js r160 addon subset, using the game's engine. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prefix = process.env.CHANGAN_RENDERING_BUILD_PREFIX || '/workspace/.environment/changan-rendering';
fs.mkdirSync(prefix, { recursive: true });
// npm verifies package integrity and retains its resolved URLs/checksums in this
// external build directory; neither npm nor Node is needed by the shipped game.
execFileSync('npm', ['install', '--prefix', prefix, '--cache', path.join(prefix, 'npm-cache'),
  '--no-audit', '--no-fund', '--save-exact', 'three@0.160.1', 'esbuild@0.25.12'], { stdio: 'inherit' });
const require = createRequire(path.join(prefix, 'package.json'));
const esbuild = require('esbuild');
const three = require('three');
if (three.REVISION !== '160') throw new Error('Expected the pinned r160 engine');
const addons = path.join(prefix, 'node_modules/three/examples/jsm');
const entry = [
  ['EffectComposer', 'postprocessing/EffectComposer.js'],
  ['RenderPass', 'postprocessing/RenderPass.js'],
  ['SAOPass', 'postprocessing/SAOPass.js'],
  ['UnrealBloomPass', 'postprocessing/UnrealBloomPass.js'],
  ['OutputPass', 'postprocessing/OutputPass.js'],
  ['ShaderPass', 'postprocessing/ShaderPass.js'],
  ['FXAAShader', 'shaders/FXAAShader.js'],
  ['RoomEnvironment', 'environments/RoomEnvironment.js'],
  ['Water', 'objects/Water.js'],
  ['GLTFLoader', 'loaders/GLTFLoader.js'],
  ['RGBELoader', 'loaders/RGBELoader.js'],
  ['cloneSkeleton', 'utils/SkeletonUtils.js', 'clone'],
].map(([symbol, file, sourceSymbol]) => `export { ${sourceSymbol ? sourceSymbol + ' as ' + symbol : symbol} } from ${JSON.stringify(path.join(addons, file))};`).join('\n');
await esbuild.build({
  stdin: { contents: entry, resolveDir: prefix, sourcefile: 'rendering-addons-entry.js', loader: 'js' },
  bundle: true, format: 'iife', globalName: 'ChanganRenderingAddons',
  minify: true, target: ['es2020'], legalComments: 'none',
  outfile: path.join(root, 'vendor/rendering-addons.js'),
  banner: { js: '/* Official Three.js 0.160.1 addons, MIT. See rendering-addons-LICENSE.txt. Uses the existing global THREE; no second engine. */' },
  plugins: [{ name: 'existing-global-three', setup(build) {
    build.onResolve({ filter: /^three$/ }, () => ({ path: 'three', namespace: 'global-three' }));
    build.onLoad({ filter: /.*/, namespace: 'global-three' }, () => ({
      contents: Object.keys(three).filter(name => /^[A-Za-z_$][\w$]*$/.test(name))
        .map(name => `export const ${name} = globalThis.THREE.${name};`).join('\n'),
      loader: 'js',
    }));
  } }],
});
const lock = JSON.parse(fs.readFileSync(path.join(prefix, 'package-lock.json'), 'utf8'));
const license = fs.readFileSync(path.join(prefix, 'node_modules/three/LICENSE'), 'utf8');
fs.writeFileSync(path.join(root, 'vendor/rendering-addons-LICENSE.txt'),
  'Three.js official example addons, version 0.160.1 (r160)\n' +
  'Source: https://www.npmjs.com/package/three/v/0.160.1\n' +
  'Upstream: https://github.com/mrdoob/three.js/tree/r160/examples/jsm\n' +
  'Included: EffectComposer, RenderPass, SAOPass, UnrealBloomPass, OutputPass,\n' +
  'RoomEnvironment, Water, GLTFLoader, RGBELoader, ShaderPass, FXAAShader, SkeletonUtils.clone and dependencies.\n' +
  'The two loaders are optional local asset pipelines; no assets are fetched automatically.\n' +
  'Runtime imports are bound to globalThis.THREE by tools/build_rendering_addons.mjs.\n' +
  'npm package integrity: ' + lock.packages['node_modules/three'].integrity + '\n\n' + license);
console.log('Built vendor/rendering-addons.js against global THREE r160');
