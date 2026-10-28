/* ============================================================
   整体视觉氛围增强 — 国风漫剧电影质感
   v2: 修复THREE.SpriteGeometry错误，接入统一生命周期
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    console.log('[Atmosphere] 开始提升视觉氛围...');
    
    enhanceFog();
    enhanceSky();
    enhanceLighting();
    addAtmosphericParticles();
    
    console.log('[Atmosphere] ✓ 视觉氛围提升完成');
  }
  
  // 雾气增强
  function enhanceFog() {
    if (typeof scene === 'undefined') return;
    if (scene.fog) {
      scene.fog.color.setHex(0xd4c4a0);
      scene.fog.near = 100;
      scene.fog.far = 800;
    }
  }
  
  // 天空增强 — 修复SpriteGeometry错误
  function enhanceSky() {
    if (typeof scene === 'undefined') return;
    
    // 太阳光晕 — 用Sprite+SpriteMaterial（不需要Geometry参数）
    const sunGlowMat = new THREE.SpriteMaterial({
      map: makeGlowTexture(0xffdd88),
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });
    const sunGlow = new THREE.Sprite(sunGlowMat);
    sunGlow.scale.set(200, 200, 1);
    sunGlow.position.set(500, 300, -500);
    scene.add(sunGlow);
    
    // 月亮光晕
    const moonGlowMat = new THREE.SpriteMaterial({
      map: makeGlowTexture(0xeeeeff),
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });
    const moonGlow = new THREE.Sprite(moonGlowMat);
    moonGlow.scale.set(100, 100, 1);
    moonGlow.position.set(-300, 400, 300);
    scene.add(moonGlow);
  }
  
  // 创建光晕纹理（Canvas）
  function makeGlowTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
  
  // 光照增强
  function enhanceLighting() {
    if (typeof ambient !== 'undefined') {
      ambient.intensity = 0.4;
      ambient.color.setHex(0xfff4e2);
    }
    
    if (typeof hemi !== 'undefined') {
      hemi.intensity = 0.9;
      hemi.color.setHex(0xfff3d8);
      hemi.groundColor.setHex(0x4f8f78);
    }
    
    if (typeof sun !== 'undefined') {
      sun.intensity = 2.5;
      sun.color.setHex(0xffe6bd);
    }
  }
  
  // 大气粒子 — 花瓣、萤火
  function addAtmosphericParticles() {
    if (typeof scene === 'undefined') return;
    
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
    scene.add(petals);
    
    // 萤火虫粒子
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
      opacity: 0.9
    });
    
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflies);
    
    // 注册到主循环，不创建独立RAF
    if (typeof window.__changan === 'undefined') window.__changan = {};
    window.__changan.particleUpdaters = window.__changan.particleUpdaters || [];
    window.__changan.particleUpdaters.push((time) => {
      const pos = petals.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i] += Math.sin(time + i) * 0.02;
        pos[i + 1] -= 0.02;
        pos[i + 2] += Math.cos(time + i) * 0.01;
        if (pos[i + 1] < 0) pos[i + 1] = 100;
      }
      petals.geometry.attributes.position.needsUpdate = true;
      fireflies.material.opacity = 0.5 + Math.sin(time * 3) * 0.3;
    });
  }
  
  // 注册到统一生命周期
  if (typeof window.__enhancePending !== 'undefined' || typeof window.__enhance !== 'undefined') {
    const registry = window.__enhance || window.__enhancePending;
    const task = { owner: 'atmosphere', fn: init, priority: 50 };
    if (window.__enhance) {
      window.__enhance.register(task.owner, task.fn, task.priority);
    } else {
      window.__enhancePending.push(task);
    }
  } else {
    // 兜底：直接初始化
    if (typeof GAME !== 'undefined' && GAME.ready) {
      init();
    } else {
      setTimeout(init, 2000);
    }
  }
})();
