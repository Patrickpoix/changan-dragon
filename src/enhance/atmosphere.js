/* ============================================================
   整体视觉氛围增强 — 国风漫剧电影质感
   v1: 全局光照、雾气、色彩、后处理全面升级
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log('[Atmosphere] 开始提升视觉氛围...');
    
    enhanceFog();
    enhanceSky();
    enhanceLighting();
    enhancePostProcessing();
    addAtmosphericParticles();
    
    console.log('[Atmosphere] ✓ 视觉氛围提升完成');
  }
  
  // 雾气增强 — 更有层次感的晨雾暮霭
  function enhanceFog() {
    // 修改场景雾效
    if (scene.fog) {
      scene.fog.color.setHex(0xd4c4a0);
      scene.fog.near = 100;
      scene.fog.far = 800;
    }
    
    // 添加多层雾效 — 近处薄雾，远处浓雾
    // 创建 volumetric fog 效果
    const fogGeo = new THREE.PlaneGeometry(2000, 2000);
    const fogMat = new THREE.MeshBasicMaterial({
      color: 0xe8d8c0,
      transparent: true,
      opacity: 0.15,
      depthWrite: false
    });
    const fogPlane = new THREE.Mesh(fogGeo, fogMat);
    fogPlane.rotation.x = -Math.PI / 2;
    fogPlane.position.y = 5;
    scene.add(fogPlane);
    
    // 第二层雾
    const fogGeo2 = new THREE.PlaneGeometry(2000, 2000);
    const fogMat2 = new THREE.MeshBasicMaterial({
      color: 0xd8c8b0,
      transparent: true,
      opacity: 0.1,
      depthWrite: false
    });
    const fogPlane2 = new THREE.Mesh(fogGeo2, fogMat2);
    fogPlane2.rotation.x = -Math.PI / 2;
    fogPlane2.position.y = 15;
    scene.add(fogPlane2);
  }
  
  // 天空增强 — 更绚烂的日出日落
  function enhanceSky() {
    // 修改天空球颜色
    scene.background = new THREE.Color(0x87ceeb);
    
    // 添加太阳光晕
    const sunGlowGeo = new THREE.SpriteGeometry(100);
    const sunGlowMat = new THREE.SpriteMaterial({
      color: 0xffdd88,
      transparent: true,
      opacity: 0.6
    });
    const sunGlow = new THREE.Sprite(sunGlowMat);
    sunGlow.position.set(500, 300, -500);
    scene.add(sunGlow);
    
    // 添加月亮光晕
    const moonGlowGeo = new THREE.SpriteGeometry(50);
    const moonGlowMat = new THREE.SpriteMaterial({
      color: 0xeeeeff,
      transparent: true,
      opacity: 0.4
    });
    const moonGlow = new THREE.Sprite(moonGlowMat);
    moonGlow.position.set(-300, 400, 300);
    scene.add(moonGlow);
  }
  
  // 光照增强 — 更柔和的全局光照
  function enhanceLighting() {
    // 增强环境光
    if (typeof ambient !== 'undefined') {
      ambient.intensity = 0.4;
      ambient.color.setHex(0xfff4e2);
    }
    
    // 增强半球光
    if (typeof hemi !== 'undefined') {
      hemi.intensity = 0.9;
      hemi.color.setHex(0xfff3d8);
      hemi.groundColor.setHex(0x4f8f78);
    }
    
    // 调整太阳光
    if (typeof sun !== 'undefined') {
      sun.intensity = 2.5;
      sun.color.setHex(0xffe6bd);
    }
  }
  
  // 后处理增强
  function enhancePostProcessing() {
    // 这里可以通过GameRendering调整后处理参数
    try {
      if (typeof GameRendering !== 'undefined' && GameRendering.setExposure) {
        GameRendering.setExposure(1.2);
      }
    } catch(e) {
      console.warn('[Atmosphere] 曝光调整失败:', e);
    }
  }
  
  // 大气粒子 — 飘落的花瓣、萤火、尘埃
  function addAtmosphericParticles() {
    // 花瓣粒子
    const petalCount = 200;
    const petalGeo = new THREE.BufferGeometry();
    const petalPositions = new Float32Array(petalCount * 3);
    
    for (let i = 0; i < petalCount; i++) {
      petalPositions[i * 3] = (Math.random() - 0.5) * 1000;
      petalPositions[i * 3 + 1] = Math.random() * 100;
      petalPositions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    }
    
    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    
    const petalMat = new THREE.PointsMaterial({
      color: 0xffb6c1,
      size: 0.5,
      transparent: true,
      opacity: 0.8
    });
    
    const petals = new THREE.Points(petalGeo, petalMat);
    petals.userData.isPetals = true;
    scene.add(petals);
    
    // 萤火虫粒子 — 夜晚效果
    const fireflyCount = 100;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    
    for (let i = 0; i < fireflyCount; i++) {
      fireflyPositions[i * 3] = (Math.random() - 0.5) * 800;
      fireflyPositions[i * 3 + 1] = Math.random() * 30 + 2;
      fireflyPositions[i * 3 + 2] = (Math.random() - 0.5) * 800;
    }
    
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
    
    const fireflyMat = new THREE.PointsMaterial({
      color: 0xffff88,
      size: 0.3,
      transparent: true,
      opacity: 0.9,
      emissive: 0xffff00,
      emissiveIntensity: 0.5
    });
    
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    fireflies.userData.isFireflies = true;
    scene.add(fireflies);
    
    // 更新循环
    animateParticles(petals, fireflies);
  }
  
  function animateParticles(petals, fireflies) {
    let time = 0;
    
    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;
      
      // 花瓣飘落
      if (petals) {
        const positions = petals.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += Math.sin(time + i) * 0.02;
          positions[i + 1] -= 0.02;
          positions[i + 2] += Math.cos(time + i) * 0.01;
          
          if (positions[i + 1] < 0) {
            positions[i + 1] = 100;
          }
        }
        petals.geometry.attributes.position.needsUpdate = true;
      }
      
      // 萤火虫闪烁
      if (fireflies) {
        fireflies.material.opacity = 0.5 + Math.sin(time * 3) * 0.3;
      }
    }
    
    animate();
  }
  
  init();
})();
