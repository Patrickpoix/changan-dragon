// 电影级后处理管线：Render→SSAO→SSR→Bloom→Output→LUT→Vignette→FilmGrain→FXAA
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/addons/shaders/VignetteShader.js';
import { FilmShader } from 'three/addons/shaders/FilmShader.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { createLUTTexture } from './LUTs.js';

export function buildPostFX({ renderer, scene, camera, width, height }) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const ssao = new SSAOPass(scene, camera, width/2, height/2);
  ssao.kernelRadius = 8; ssao.minDistance = 0.002; ssao.maxDistance = 0.1;
  composer.addPass(ssao);
  const bloom = new UnrealBloomPass(new THREE.Vector2(width/2, height/2), 0.9, 0.45, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const vignette = new ShaderPass(VignetteShader);
  vignette.uniforms.offset.value = 1.05; vignette.uniforms.darkness.value = 1.15;
  composer.addPass(vignette);
  const film = new ShaderPass(FilmShader);
  film.uniforms.intensity.value = 0.32;
  composer.addPass(film);
  const fxaa = new ShaderPass(FXAAShader);
  fxaa.material.uniforms.resolution.value.set(1/width, 1/height);
  composer.addPass(fxaa);
  return { composer, bloom, film, fxaa, resize(w,h){composer.setSize(w,h);fxaa.material.uniforms.resolution.value.set(1/w,1/h);} };
}
