// 龙游长安 · 天空天气Demo主入口
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RainSystem, SnowSystem, LeafSystem, PetalSystem } from './particles/Particles.js';
import { DayNightCycle } from './scenes/DayNightCycle.js';
import { buildScene } from './scenes/DemoScene.js';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xc8d8e8, 0.002);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 6, 25);
camera.lookAt(0, 4, 0);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(0, 100, 0);
dirLight.castShadow = true;
scene.add(dirLight, new THREE.HemisphereLight(0x90b8e8, 0x506070, 1.0));

const { lanterns } = buildScene(scene);
const cycle = new DayNightCycle(scene, null, dirLight, scene.children[1], lanterns);

const rain = new RainSystem(scene, 3000);
const snow = new SnowSystem(scene, 2000);
const leaves = new LeafSystem(scene, 1000);
const petals = new PetalSystem(scene, 500);
rain.setVisible(false); snow.setVisible(false); leaves.setVisible(false); petals.setVisible(true);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.0, 0.6, 0.85);
composer.addPass(bloomPass);

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  cycle.update(dt, t);
  rain.update(dt, camera.position);
  snow.update(dt, camera.position, t);
  leaves.update(dt, camera.position, t);
  petals.update(dt, camera.position, t);
  camera.position.x = Math.sin(t * 0.05) * 25;
  camera.position.z = Math.cos(t * 0.05) * 25;
  camera.lookAt(0, 4, 0);
  composer.render();
}
animate();
