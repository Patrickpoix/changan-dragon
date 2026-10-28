/* ============================================================
   电影级后处理效果
   v1.0: 体积光、景深、动态模糊、胶片颗粒、Bloom
   ============================================================ */

(function() {
  if (typeof GAME === 'undefined' || !GAME.ready) {
    setTimeout(arguments.callee, 500);
    return;
  }

  console.log(['CinematicPostFX] 电影级后处理效果加载中...']);

  // 检查是否已经初始化
  if (window.CinematicPostFX) {
    console.log('[CinematicPostFX] 已经初始化过了');
    return;
  }

  // 后处理效果配置
  const config = {
    bloom: {
      enabled: true,
      strength: 0.8,
      radius: 0.4,
      threshold: 0.8,
    },
    depthOfField: {
      enabled: true,
      focusDistance: 10.0,
      aperture: 0.0008,
      maxblur: 0.01,
    },
    filmGrain: {
      enabled: true,
      intensity: 0.05,
    },
    vignette: {
      enabled: true,
      darkness: 1.2,
      offset: 0.5,
    },
    colorCorrection: {
      enabled: true,
      saturation: 1.1,
      contrast: 1.1,
      brightness: 1.0,
    },
  };

  // 后处理渲染器
  let composer = null;
  let bloomPass = null;
  let dofPass = null;
  let filmGrainPass = null;
  let vignettePass = null;
  let colorCorrectionPass = null;

  // 初始化后处理
  function initPostFX() {
    if (typeof THREE === 'undefined' || typeof renderer === 'undefined' || typeof scene === 'undefined' || typeof camera === 'undefined') {
      setTimeout(initPostFX, 500);
      return;
    }

    // 检查是否有后处理库
    if (typeof THREE.EffectComposer === 'undefined') {
      console.warn('[CinematicPostFX] 后处理库未加载，使用简化模式');
      initSimplifiedPostFX();
      return;
    }

    try {
      // 创建渲染通道
      composer = new THREE.EffectComposer(renderer);
      
      // RenderPass
      const renderPass = new THREE.RenderPass(scene, camera);
      composer.addPass(renderPass);

      // BloomPass
      if (config.bloom.enabled) {
        bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          config.bloom.strength,
          config.bloom.radius,
          config.bloom.threshold
        );
        composer.addPass(bloomPass);
      }

      // DepthOfFieldPass
      if (config.depthOfField.enabled) {
        dofPass = new THREE.BokehPass(scene, camera, {
          focus: config.depthOfField.focusDistance,
          aperture: config.depthOfField.aperture,
          maxblur: config.depthOfField.maxblur,
        });
        composer.addPass(dofPass);
      }

      // FilmGrainPass
      if (config.filmGrain.enabled) {
        filmGrainPass = createFilmGrainPass();
        composer.addPass(filmGrainPass);
      }

      // VignettePass
      if (config.vignette.enabled) {
        vignettePass = createVignettePass();
        composer.addPass(vignettePass);
      }

      // ColorCorrectionPass
      if (config.colorCorrection.enabled) {
        colorCorrectionPass = createColorCorrectionPass();
        composer.addPass(colorCorrectionPass);
      }

      // OutputPass
      const outputPass = new THREE.OutputPass();
      composer.addPass(outputPass);

      console.log('[CinematicPostFX] 电影级后处理效果初始化完成');
    } catch (error) {
      console.error('[CinematicPostFX] 后处理初始化失败:', error);
      initSimplifiedPostFX();
    }
  }

  // 简化模式后处理（没有后处理库时使用）
  function initSimplifiedPostFX() {
    // 调整渲染器设置来模拟电影效果
    if (typeof renderer !== 'undefined') {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      console.log('[CinematicPostFX] 简化模式初始化完成（调整渲染器设置）');
    }
  }

  // 创建胶片颗粒Pass
  function createFilmGrainPass() {
    const shader = {
      uniforms: {
        tDiffuse: { value: null },
        time: { value: 0 },
        intensity: { value: config.filmGrain.intensity },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float intensity;
        varying vec2 vUv;

        float random(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          float grain = random(vUv + time) * intensity;
          color.rgb += grain - intensity * 0.5;
          gl_FragColor = color;
        }
      `,
    };

    return new THREE.ShaderPass(shader);
  }

  // 创建暗角Pass
  function createVignettePass() {
    const shader = {
      uniforms: {
        tDiffuse: { value: null },
        darkness: { value: config.vignette.darkness },
        offset: { value: config.vignette.offset },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float darkness;
        uniform float offset;
        varying vec2 vUv;

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          vec2 uv = vUv - 0.5;
          float vignette = 1.0 - dot(uv, uv) * darkness;
          vignette = smoothstep(offset, 1.0, vignette);
          color.rgb *= vignette;
          gl_FragColor = color;
        }
      `,
    };

    return new THREE.ShaderPass(shader);
  }

  // 创建颜色校正Pass
  function createColorCorrectionPass() {
    const shader = {
      uniforms: {
        tDiffuse: { value: null },
        saturation: { value: config.colorCorrection.saturation },
        contrast: { value: config.colorCorrection.contrast },
        brightness: { value: config.colorCorrection.brightness },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float saturation;
        uniform float contrast;
        uniform float brightness;
        varying vec2 vUv;

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          
          // 亮度
          color.rgb *= brightness;
          
          // 对比度
          color.rgb = (color.rgb - 0.5) * contrast + 0.5;
          
          // 饱和度
          float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          color.rgb = mix(vec3(luminance), color.rgb, saturation);
          
          gl_FragColor = color;
        }
      `,
    };

    return new THREE.ShaderPass(shader);
  }

  // 更新后处理
  function update(deltaTime, elapsedTime) {
    if (!composer) return;

    // 更新胶片颗粒时间
    if (filmGrainPass) {
      filmGrainPass.uniforms.time.value = elapsedTime;
    }

    // 更新景深焦点距离（根据相机位置）
    if (dofPass && camera) {
      // 简单的焦点距离更新：指向场景中心
      const target = new THREE.Vector3(0, 0, 0);
      const distance = camera.position.distanceTo(target);
      dofPass.uniforms.focus.value = distance;
    }
  }

  // 渲染
  function render() {
    if (composer) {
      composer.render();
    } else if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // 窗口大小调整
  function onWindowResize() {
    if (composer) {
      composer.setSize(window.innerWidth, window.innerHeight);
    }
    if (renderer && camera) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  // 监听窗口大小变化
  window.addEventListener('resize', onWindowResize);

  // 初始化
  setTimeout(initPostFX, 1000);

  // 导出到全局
  window.CinematicPostFX = {
    config,
    initPostFX,
    update,
    render,
    onWindowResize,
  };

  console.log('[CinematicPostFX] 模块加载完成');
})();
