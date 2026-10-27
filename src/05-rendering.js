/* Filmic rendering for the actual 3D scene. Official r160 addons are bundled
 * locally; see vendor/rendering-addons-LICENSE.txt and tools/build_rendering_addons.mjs.
 * v2: 新增 fastStart 快速启动模式 — 开始界面用 low 质量，用户进入后再升级。
 */
(function (global) {
  'use strict';
  const T = global.THREE;
  const A = global.ChanganRenderingAddons;
  let renderer, scene, camera, composer, ao, bloom, fxaa, outputPass, environmentTarget;
  let width = 1, height = 1, pixelRatio = 1, requestedQuality = 'auto';
  let quality = 'low', suspended = false, initialized = false, failed = false;
  let failureReason = '', environmentReady = false, excluded = [], refreshNeeded = true;
  let environmentIntensity = 0.48, frameCount = 0, lastFrameMs = 0;
  let fastStartMode = false; // 快速启动模式标记
  const materialBaseIntensity = new WeakMap();
  let detailBatches = [], lodBatches = [];
  const lodPoint = new T.Vector3();
  const state = { aoWidth: 0, aoHeight: 0, bloom: false, postprocessing: false };
  const validQuality = value => ['auto', 'low', 'medium', 'high'].includes(value) ? value : 'auto';

  function resolveQuality(value) {
    if (value !== 'auto') return value;
    const mobile = global.matchMedia?.('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const economical = navigator.deviceMemory && navigator.deviceMemory < 4;
    return mobile || economical ? 'low' : 'medium';
  }

  function destroyPipeline() {
    if (composer) {
      for (const pass of composer.passes) pass.dispose?.();
      composer.dispose();
    }
    composer = ao = bloom = fxaa = outputPass = null;
    Object.assign(state, { aoWidth: 0, aoHeight: 0, bloom: false, postprocessing: false });
  }

  function supportsPostprocessing() {
    const gl = renderer.getContext();
    // SAO's depth-stencil texture and HDR intermediate buffers require these.
    if (!renderer.capabilities.isWebGL2 || !gl.getExtension('EXT_color_buffer_float')) {
      failureReason = 'HDR postprocessing unavailable; using filmic direct rendering';
      return false;
    }
    return true;
  }

  function makeEnvironment() {
    if (!A?.RoomEnvironment || !T.PMREMGenerator) return;
    let room, pmrem;
    const oldTarget = renderer.getRenderTarget();
    try {
      pmrem = new T.PMREMGenerator(renderer);
      if (typeof SCENE_MATERIALS !== 'undefined' && SCENE_MATERIALS.environment && A.RGBELoader) {
        const raw = atob(SCENE_MATERIALS.environment);
        const bytes = Uint8Array.from(raw, character => character.charCodeAt(0));
        const hdr = new A.RGBELoader().parse(bytes.buffer);
        const texture = new T.DataTexture(hdr.data, hdr.width, hdr.height, T.RGBAFormat, hdr.type);
        texture.mapping = T.EquirectangularReflectionMapping;
        texture.minFilter = texture.magFilter = T.LinearFilter;
        texture.needsUpdate = true;
        environmentTarget = pmrem.fromEquirectangular(texture);
        texture.dispose();
        scene.environment = environmentTarget.texture;
        environmentReady = true;
        return;
      }
      room = new A.RoomEnvironment(renderer);
      // Neutral reflections and restrained warm fill keep shaded wood readable
      // without lifting every recess to the same brightness as the sunlit roof.
      room.traverse(object => {
        if (object.isPointLight) object.color.setHex(0xffe8d2);
      });
      environmentTarget = pmrem.fromScene(room, 0.04, 0.1, 100);
      scene.environment = environmentTarget.texture;
      environmentReady = true;
    } catch (error) {
      failureReason = 'Environment fallback: ' + String(error.message || error).slice(0, 180);
      environmentTarget?.dispose();
      environmentTarget = null;
    } finally {
      room?.dispose();
      pmrem?.dispose();
      renderer.setRenderTarget(oldTarget);
    }
  }

  function refreshScene() {
    if (!scene) return;
    excluded = [];
    detailBatches = []; lodBatches = [];
    scene.traverse(object => {
      if (object.userData.detailDistance) detailBatches.push(object);
      if (object.userData.lowGeometry) lodBatches.push(object);
      if (!object.material) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      if (object.userData.screenSpaceAO === false || object.isPoints || object.isLine ||
          materials.every(material => material.transparent || material.depthWrite === false)) excluded.push(object);
      for (const material of materials) {
        if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
          if (!materialBaseIntensity.has(material)) materialBaseIntensity.set(material, material.envMapIntensity);
          material.envMapIntensity = materialBaseIntensity.get(material) * environmentIntensity;
        }
      }
    });
    refreshNeeded = false;
  }

  function makePipeline() {
    destroyPipeline();
    if (quality === 'low' || failed || !A?.EffectComposer || !supportsPostprocessing()) return;
    try {
      composer = new A.EffectComposer(renderer);
      composer.addPass(new A.RenderPass(scene, camera));
      ao = new A.SAOPass(scene, camera, new T.Vector2(1, 1));
      Object.assign(ao.params, {
        saoBias: 0.55, saoIntensity: 0.035, saoScale: camera.far / 25,
        saoKernelRadius: 28, saoMinResolution: 0.00015,
        saoBlur: true, saoBlurRadius: 3, saoBlurStdDev: 2,
        saoBlurDepthCutoff: 0.0015,
      });
      ao.saoMaterial.defines.NUM_SAMPLES = quality === 'high' ? 9 : 7;
      ao.saoMaterial.defines.NUM_RINGS = 4;
      // Upstream SAO assumes a much shorter camera range and can produce
      // negative HDR factors at architectural contacts. Keep occlusion a
      // bounded light reduction so filmic output cannot invert those values.
      ao.saoMaterial.fragmentShader = ao.saoMaterial.fragmentShader.replace(
        'gl_FragColor.xyz *=  1.0 - ambientOcclusion;',
        'gl_FragColor.xyz *= clamp(1.0 - ambientOcclusion, 0.0, 1.0);');
      // Composer sizes passes in drawing-buffer pixels. Only AO is reduced;
      // scene/color/typography stay at their normal rendering resolution.
      const setAOSize = ao.setSize.bind(ao);
      ao.setSize = (w, h) => {
        const scale = quality === 'high' ? 0.66 : 0.5;
        state.aoWidth = Math.max(1, Math.round(w * scale));
        state.aoHeight = Math.max(1, Math.round(h * scale));
        setAOSize(state.aoWidth, state.aoHeight);
      };
      const renderOverride = ao.renderOverride.bind(ao);
      ao.renderOverride = (...args) => {
        const hidden = [];
        // Sky, additive glows, particles, and water must not become opaque
        // blockers merely because the normal pass overrides their material.
        for (const object of excluded) if (object.visible) { object.visible = false; hidden.push(object); }
        const oldOverride = scene.overrideMaterial;
        const shadowUpdate = renderer.shadowMap.autoUpdate;
        renderer.shadowMap.autoUpdate = false;
        try { renderOverride(...args); }
        finally {
          for (const object of hidden) object.visible = true;
          scene.overrideMaterial = oldOverride;
          renderer.shadowMap.autoUpdate = shadowUpdate;
        }
      };
      composer.addPass(ao);
      // Bloom is an explicit high-quality choice. It remains below the
      // broad diffuse light range, retaining grain and roof-tile detail.
      if (quality === 'high') {
        bloom = new A.UnrealBloomPass(new T.Vector2(width, height), 0.12, 0.35, 1.25);
        // A few invalid HDR taps otherwise poison every progressively blurred
        // mip and black out the image. Keep finite scene radiance unchanged;
        // ignore invalid taps before they can enter the glare pyramid.
        const sample='vec4 texel = texture2D( tDiffuse, vUv );';
        bloom.materialHighPassFilter.fragmentShader=bloom.materialHighPassFilter.fragmentShader.replace(sample,
          sample+'\nif(any(isnan(texel)) || any(isinf(texel))) texel=vec4(0.0);');
        composer.addPass(bloom);
        state.bloom = true;
      }
      outputPass=new A.OutputPass();
      outputPass.uniforms.changanTexelSize={value:new T.Vector2(1,1)};
      outputPass.material.fragmentShader=outputPass.material.fragmentShader
        .replace('uniform sampler2D tDiffuse;', 'uniform sampler2D tDiffuse;\nuniform vec2 changanTexelSize;')
        .replace('void main() {', `bool changanFinite(vec4 value) {
          return all(lessThanEqual(abs(value),vec4(65504.0)));
        }
        void main() {`)
        .replace('gl_FragColor = texture2D( tDiffuse, vUv );', `gl_FragColor=texture2D(tDiffuse,vUv);
          if(!changanFinite(gl_FragColor)) {
            // Reconstruct only an invalid HDR pixel from nearby valid scene
            // samples. Valid texture detail and lighting pass through untouched.
            vec2 stepUV=changanTexelSize*4.;vec4 sum=vec4(0.);float weight=0.;
            vec4 sampleColor=texture2D(tDiffuse,vUv+vec2(stepUV.x,0.));
            if(changanFinite(sampleColor)){sum+=sampleColor;weight+=1.;}
            sampleColor=texture2D(tDiffuse,vUv-vec2(stepUV.x,0.));
            if(changanFinite(sampleColor)){sum+=sampleColor;weight+=1.;}
            sampleColor=texture2D(tDiffuse,vUv+vec2(0.,stepUV.y));
            if(changanFinite(sampleColor)){sum+=sampleColor;weight+=1.;}
            sampleColor=texture2D(tDiffuse,vUv-vec2(0.,stepUV.y));
            if(changanFinite(sampleColor)){sum+=sampleColor;weight+=1.;}
            gl_FragColor=weight>0.?sum/weight:vec4(0.,0.,0.,1.);
          }`);
      composer.addPass(outputPass);
      if (A.ShaderPass && A.FXAAShader) {
        fxaa = new A.ShaderPass(A.FXAAShader);
        composer.addPass(fxaa);
      }
      state.postprocessing = true;
      resize(width, height, pixelRatio);
    } catch (error) {
      failed = true;
      failureReason = 'Postprocessing fallback: ' + String(error.message || error).slice(0, 180);
      destroyPipeline();
    }
  }

  function resize(w, h, dpr) {
    width = Math.max(1, Math.round(w || renderer?.domElement.clientWidth || 1));
    height = Math.max(1, Math.round(h || renderer?.domElement.clientHeight || 1));
    pixelRatio = Math.max(0.5, Number(dpr) || renderer?.getPixelRatio() || 1);
    if (composer) {
      // On large retina screens cap only the post chain's buffers; the main
      // renderer still respects the caller's own mobile/desktop DPR policy.
      const cap = quality === 'high' ? 1.5 : 1.25;
      composer.setPixelRatio(Math.min(pixelRatio, cap));
      composer.setSize(width, height);
      fxaa?.material.uniforms.resolution.value.set(1 / (width * Math.min(pixelRatio, cap)), 1 / (height * Math.min(pixelRatio, cap)));
    }
  }

  function onContextLost(event) {
    event.preventDefault();
    suspended = true;
    destroyPipeline();
    if (scene.environment === environmentTarget?.texture) scene.environment = null;
    environmentTarget?.dispose();
    environmentTarget = null;
    environmentReady = false;
  }

  function onContextRestored() {
    suspended = false;
    failed = false;
    failureReason = '';
    if (!fastStartMode) {
      makeEnvironment();
      makePipeline();
    }
    refreshNeeded = true;
  }

  function init(options) {
    if (initialized) dispose();
    renderer = options.renderer; scene = options.scene; camera = options.camera;
    if (!renderer || !scene || !camera) throw new Error('GameRendering.init requires renderer, scene and camera');
    requestedQuality = validQuality(options.quality || 'auto');
    quality = resolveQuality(requestedQuality);
    environmentIntensity = options.environmentIntensity ?? 0.48;
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = options.exposure ?? 1.06;
    const size = renderer.getSize(new T.Vector2());
    width = size.x; height = size.y; pixelRatio = renderer.getPixelRatio();
    initialized = true; suspended = false; failed = false; failureReason = ''; frameCount = 0;
    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);

    // v2 快速启动模式：如果指定了 fastStart=true，跳过环境贴图和后处理管线创建
    // 开始界面用 low 质量快速渲染，用户进入后再调用 upgradeToFullQuality() 升级
    fastStartMode = !!options.fastStart;
    if (!fastStartMode) {
      makeEnvironment();
      makePipeline();
    } else {
      // 快速启动时只设置基础渲染参数，不创建 PMREM 和后处理管线
      // 这些重资源在 upgradeToFullQuality() 中再创建
      console.log('[Rendering] 快速启动模式：开始界面用 low 质量，进入游戏后升级');
    }

    refreshNeeded = true;
    return getDiagnostics();
  }

  // v2 新增：快速启动后升级到完整质量
  // 用户点击"入城漫游"后调用，创建 PMREM 环境贴图和后处理管线
  function upgradeToFullQuality() {
    if (!fastStartMode) return; // 已经是完整模式
    fastStartMode = false;
    console.log('[Rendering] 升级到完整质量：创建环境贴图和后处理管线');
    makeEnvironment();
    makePipeline();
    refreshNeeded = true;
    return getDiagnostics();
  }

  function render(delta = 1 / 60) {
    if (!initialized || suspended) return;
    if (refreshNeeded) refreshScene();
    for (const batch of detailBatches) {
      const range = batch.userData.detailDistance + batch.userData.detailRadius;
      batch.visible = camera.position.distanceToSquared(batch.userData.detailCenter) < range * range;
    }
    for (const batch of lodBatches) {
      const data = batch.userData;
      data.lodBounds.clampPoint(camera.position, lodPoint);
      const distance = data.nearDistance * (quality === 'high' ? 1.5 : quality === 'medium' ? 1.15 : 1);
      batch.geometry = camera.position.distanceToSquared(lodPoint) < distance * distance ? data.highGeometry : data.lowGeometry;
    }
    const started = performance.now();
    if (!composer) {
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    } else {
      const oldAutoClear = renderer.autoClear;
      const oldOverride = scene.overrideMaterial;
      const oldClearColor = renderer.getClearColor(new T.Color());
      const oldClearAlpha = renderer.getClearAlpha();
      const oldShaderError = renderer.debug.onShaderError;
      const oldInfoAutoReset = renderer.info.autoReset;
      let shaderFailed = false;
      // Preserve meaningful frame diagnostics across the scene, normal, blur,
      // and output draws; the default would report only the final screen quad.
      renderer.info.autoReset = false;
      renderer.info.reset();
      renderer.debug.onShaderError = (...args) => {
        shaderFailed = true;
        oldShaderError?.(...args);
      };
      try {
        // r160 SAOPass copies this inverse only during construction/setSize.
        // Depth reconstruction must also track FOV changes between resizes.
        outputPass?.uniforms.changanTexelSize.value.set(1/composer.readBuffer.width,1/composer.readBuffer.height);
        if(ao) {
          ao.saoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
          ao.saoMaterial.uniforms.cameraProjectionMatrix.value=camera.projectionMatrix;
        }
        composer.render(Math.min(0.1, Math.max(0, Number(delta) || 0)));
        if (shaderFailed) throw new Error('GPU could not compile a postprocessing shader');
      } catch (error) {
        failed = true;
        failureReason = 'Postprocessing fallback: ' + String(error.message || error).slice(0, 180);
        scene.overrideMaterial = oldOverride;
        renderer.autoClear = oldAutoClear;
        renderer.setClearColor(oldClearColor, oldClearAlpha);
        destroyPipeline();
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
      } finally {
        renderer.debug.onShaderError = oldShaderError;
        renderer.info.autoReset = oldInfoAutoReset;
      }
    }
    frameCount++;
    lastFrameMs = performance.now() - started;
  }

  function setQuality(value) {
    requestedQuality = validQuality(value);
    quality = resolveQuality(requestedQuality);
    failed = false;
    failureReason = '';
    if (initialized && !suspended && !fastStartMode) makePipeline();
    return getDiagnostics();
  }

  function getDiagnostics() {
    return { initialized, quality, requestedQuality, suspended, fastStartMode,
      antiAliasing: composer && fxaa ? 'FXAA' : renderer?.getContext().getContextAttributes()?.antialias ? 'MSAA' : 'none',
      toneMapping: 'ACESFilmic', exposure: renderer?.toneMappingExposure,
      environment: environmentReady ? (typeof SCENE_MATERIALS !== 'undefined' ? 'Poly Haven Venice Sunset PMREM' : 'RoomEnvironment PMREM') : 'scene lighting', environmentIntensity,
      ...state, width, height, pixelRatio, frameCount,
      drawCalls: renderer?.info.render.calls || 0, triangles: renderer?.info.render.triangles || 0,
      lastFrameMs: Math.round(lastFrameMs * 100) / 100, fallback: failureReason || null };
  }

  function dispose() {
    if (!initialized) return;
    renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
    renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
    destroyPipeline();
    if (scene.environment === environmentTarget?.texture) scene.environment = null;
    environmentTarget?.dispose();
    environmentTarget = null;
    environmentReady = false;
    excluded = [];
    initialized = false;
  }

  global.GameRendering = { init, render, resize, setQuality, getDiagnostics, dispose, refreshScene,
    upgradeToFullQuality,
    setExposure(value) { if (renderer && Number.isFinite(value)) renderer.toneMappingExposure = Math.max(0.1, Math.min(3, value)); },
    setEnvironmentIntensity(value) { if (Number.isFinite(value)) { environmentIntensity = Math.max(0, Math.min(2, value)); refreshScene(); } },
  };
})(window);