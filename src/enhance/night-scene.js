/* ============================================================
   长安城夜景增强 — 万家灯火盛唐夜景
   v1: 灯笼、月光、星空、霓虹效果
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['NightScene] 开始增强夜景效果...']);
    
    addStreetLanterns();
    addPalaceLights();
    addShopSignLights();
    addStarField();
    addMoonGlow();
    
    console.log('[NightScene] ✓ 夜景效果增强完成');
  }
  
  // 沿街灯笼 — 朱雀大街两旁
  function addStreetLanterns() {
    for (let z = -300; z <= 500; z += 30) {
      for (const side of [-1, 1]) {
        createLantern(side * 35, z, 4);
      }
    }
    
    // 东西市街道
    for (let z = -80; z <= 80; z += 20) {
      for (const x of [-150, 150]) {
        createLantern(x - 25, z, 3.5);
        createLantern(x + 25, z, 3.5);
      }
    }
  }
  
  // 宫殿灯光 — 大明宫、太极宫
  function addPalaceLights() {
    // 大明宫
    const DX = 320, DZ = -460;
    for (let i = -5; i <= 5; i++) {
      createPalaceLight(DX + i * 10, DZ - 20, 10);
    }
    
    // 太极宫
    for (let i = -4; i <= 4; i++) {
      createPalaceLight(i * 12, -450, 8);
    }
  }
  
  // 店铺招牌灯
  function addShopSignLights() {
    // 东西市店铺
    for (let i = 0; i < 10; i++) {
      for (const side of [-1, 1]) {
        const x = 150 + side * 45;
        const z = -80 + i * 25;
        createShopLight(x, z, 5);
      }
    }
  }
  
  // 星空
  function addStarField() {
    const starCount = 1000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      // 球面分布
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const radius = 1400;
      
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.cos(phi) + 100;
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.8
    });
    
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
  }
  
  // 月亮光晕
  function addMoonGlow() {
    // 月亮
    const moonGeo = new THREE.SphereGeometry(30, 16, 12);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(-400, 500, -600);
    scene.add(moon);
    
    // 月亮光晕
    const glowGeo = new THREE.SphereGeometry(50, 16, 12);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffffcc,
      transparent: true,
      opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(moon.position);
    scene.add(glow);
    
    // 月光
    const moonLight = new THREE.DirectionalLight(0xaaaaff, 0.3);
    moonLight.position.copy(moon.position);
    scene.add(moonLight);
  }
  
  // 工具函数
  function createLantern(x, z, height) {
    // 灯柱
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, height, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, height / 2, z);
    scene.add(pole);
    
    // 灯笼
    const lanternGeo = new THREE.SphereGeometry(0.4, 8, 6);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xff4422,
      emissive: 0xff2200,
      emissiveIntensity: 1.0
    });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.set(x, height + 0.3, z);
    scene.add(lantern);
    
    // 灯光
    const light = new THREE.PointLight(0xff6644, 0.3, 15);
    light.position.set(x, height + 0.3, z);
    scene.add(light);
  }
  
  function createPalaceLight(x, z, y) {
    const lightGeo = new THREE.SphereGeometry(0.8, 8, 6);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xffdd88,
      emissive: 0xffcc44,
      emissiveIntensity: 1.5
    });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(x, y, z);
    scene.add(light);
    
    const pointLight = new THREE.PointLight(0xffdd88, 0.8, 30);
    pointLight.position.set(x, y, z);
    scene.add(pointLight);
  }
  
  function createShopLight(x, z, y) {
    const lightGeo = new THREE.BoxGeometry(1.5, 0.5, 0.1);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xffcc88,
      emissive: 0xffaa44,
      emissiveIntensity: 0.8
    });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(x, y, z);
    scene.add(light);
  }
  
  init();
})();
