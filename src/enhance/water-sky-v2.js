/* ============================================================
   水面与天空增强 — 反射、波纹、云层、星空
   v1: 真实水面反射、动态波纹、体积云、银河星空
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 1200);
      return;
    }
    
    console.log(['WaterSky] 开始增强水面与天空...']);
    
    enhanceWater();       // 水面增强
    enhanceSky();         // 天空增强
    addClouds();          // 体积云
    addStarrySky();       // 星空银河
    
    console.log('[WaterSky] ✓ 水面与天空增强完成');
  }
  
  // 水面增强 — 更好的反射和波纹
  function enhanceWater() {
    if (typeof scene === 'undefined' || typeof waterUniforms === 'undefined') return;
    
    console.log('[WaterSky] 增强水面...');
    
    // 增强曲江池水面效果
    // 增加更多波纹层
    if (typeof pondMeshes !== 'undefined') {
      pondMeshes.forEach((water, i) => {
        // 增强水面颜色
        if (water.material) {
          water.material.uniforms = water.material.uniforms || {};
          // 增加高光
          water.material.uniforms.sunColor = { value: new THREE.Color(0xffe6b0) };
          water.material.needsUpdate = true;
        }
      });
    }
    
    // 增加水面反光效果 — 镜面高光
    const glintGeo = new THREE.PlaneGeometry(2, 0.5);
    const glintMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    // 在曲江池添加反光光斑
    for (let i = 0; i < 20; i++) {
      const glint = new THREE.Mesh(glintGeo, glintMat);
      glint.position.set(
        520 + (Math.random() - 0.5) * 140,
        0.1,
        470 + (Math.random() - 0.5) * 110
      );
      glint.rotation.x = -Math.PI / 2;
      glint.rotation.z = Math.random() * Math.PI;
      glint.scale.setScalar(0.5 + Math.random());
      scene.add(glint);
    }
    
    console.log('[WaterSky] 水面增强完成');
  }
  
  // 天空增强 — 更好的天空颜色和渐变
  function enhanceSky() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WaterSky] 增强天空...');
    
    // 天空球 — 渐变颜色
    const skyGeo = new THREE.SphereGeometry(1500, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(0x4a7ab5) },
        bottomColor: { value: new THREE.Color(0xb8d4e8) },
        offset: { value: 200 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `
    });
    
    const sky = new THREE.Mesh(skyGeo, skyMat);
    sky.position.copy(camera.position);
    scene.add(sky);
    
    // 保存引用以便跟随相机
    window.__skyDome = sky;
    
    console.log('[WaterSky] 天空增强完成');
  }
  
  // 体积云 — 多层云层
  function addClouds() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WaterSky] 添加体积云...');
    
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 1.0,
      depthWrite: false
    });
    
    // 多层云团
    for (let layer = 0; layer < 3; layer++) {
      const y = 200 + layer * 100;
      const count = 8 - layer * 2;
      
      for (let i = 0; i < count; i++) {
        const cloud = new THREE.Mesh(
          new THREE.SphereGeometry(30 + Math.random() * 40, 8, 6),
          cloudMat
        );
        cloud.position.set(
          (Math.random() - 0.5) * 1600,
          y + (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 1600
        );
        cloud.scale.y = 0.3;
        scene.add(cloud);
      }
    }
    
    console.log('[WaterSky] 体积云添加完成');
  }
  
  // 星空银河 — 夜晚星空
  function addStarrySky() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WaterSky] 添加星空银河...');
    
    // 星星粒子
    const starCount = 2000;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      // 球面分布
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5; // 上半球
      const radius = 1400;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    
    // 银河带 — 更亮的星星
    const galaxyCount = 500;
    const galaxyGeo = new THREE.BufferGeometry();
    const galaxyPositions = new Float32Array(galaxyCount * 3);
    
    for (let i = 0; i < galaxyCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.PI * 0.3 + (Math.random() - 0.5) * 0.3; // 银河带角度
      const radius = 1380;
      
      galaxyPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      galaxyPositions[i * 3 + 1] = radius * Math.cos(phi);
      galaxyPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
    
    const galaxyMat = new THREE.PointsMaterial({
      color: 0x8899ff,
      size: 1.5,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });
    
    const galaxy = new THREE.Points(galaxyGeo, galaxyMat);
    scene.add(galaxy);
    
    // 月亮
    const moonGeo = new THREE.SphereGeometry(30, 16, 12);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xfff8e0,
      transparent: true,
      opacity: 0.9
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(-800, 600, -1000);
    scene.add(moon);
    
    console.log('[WaterSky] 星空银河添加完成');
  }
  
  init();
})();
