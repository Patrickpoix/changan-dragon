/* ============================================================
   夜景灯光增强 — 万家灯火、宫殿灯影、水面倒影
   v1: 沿街灯笼、宫灯、水面反光、夜景氛围
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 1500);
      return;
    }
    
    console.log(['NightV2] 开始增强夜景灯光...']);
    
    addStreetLanterns();       // 沿街灯笼
    addPalaceLights();          // 宫殿灯光
    addWaterReflection();       // 水面灯光倒影
    addCityGlow();              // 城市光晕
    
    console.log('[NightV2] ✓ 夜景灯光增强完成');
  }
  
  // 沿街灯笼 — 朱雀大街两侧
  function addStreetLanterns() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NightV2] 添加沿街灯笼...');
    
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xff4422,
      emissive: 0xff2200,
      emissiveIntensity: 1.2,
      roughness: 0.5
    });
    
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.8 });
    
    // 朱雀大街两侧 — 每隔20米一个灯笼
    for (let i = 0; i < 40; i++) {
      const z = -400 + i * 30;
      
      for (const side of [-1, 1]) {
        // 灯杆
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.1, 5, 6),
          poleMat
        );
        pole.position.set(side * 28, 2.5, z);
        pole.castShadow = true;
        scene.add(pole);
        
        // 灯笼
        const lantern = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 8, 6),
          lanternMat
        );
        lantern.position.set(side * 28, 5.2, z);
        lantern.scale.y = 1.3;
        scene.add(lantern);
        
        // 灯笼下方流苏
        const tassel = new THREE.Mesh(
          new THREE.ConeGeometry(0.1, 0.3, 4),
          new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.6 })
        );
        tassel.position.set(side * 28, 4.6, z);
        scene.add(tassel);
        
        // 点光源（每隔几个加一个，避免太多灯）
        if (i % 4 === 0) {
          const light = new THREE.PointLight(0xff6633, 0.8, 20);
          light.position.set(side * 28, 5.2, z);
          scene.add(light);
        }
      }
    }
    
    console.log('[NightV2] 沿街灯笼添加完成，共80个');
  }
  
  // 宫殿灯光 — 大明宫、太极宫
  function addPalaceLights() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NightV2] 添加宫殿灯光...');
    
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xffeecc,
      emissive: 0xffcc88,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.8
    });
    
    // 大明宫含元殿灯光
    const DX = 320, DZ = -460;
    
    // 殿内灯光 — 一排窗户
    for (let i = -5; i <= 5; i++) {
      const window = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 2),
        windowMat
      );
      window.position.set(DX + i * 4, 15, DZ - 8.5);
      scene.add(window);
    }
    
    // 宫殿大门灯光
    const mainDoor = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 5),
      new THREE.MeshStandardMaterial({
        color: 0xffaa44,
        emissive: 0xff8800,
        emissiveIntensity: 1.5
      })
    );
    mainDoor.position.set(DX, 12, DZ - 8.6);
    scene.add(mainDoor);
    
    // 宫殿主光源
    const palaceLight = new THREE.PointLight(0xffcc88, 2, 100);
    palaceLight.position.set(DX, 20, DZ);
    scene.add(palaceLight);
    
    // 大雁塔灯光
    const dayantaLight = new THREE.PointLight(0xffdd88, 1.5, 60);
    dayantaLight.position.set(300, 40, 420);
    scene.add(dayantaLight);
    
    console.log('[NightV2] 宫殿灯光添加完成');
  }
  
  // 水面灯光倒影
  function addWaterReflection() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NightV2] 添加水面灯光倒影...');
    
    const reflectionMat = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    // 曲江池水面反光
    for (let i = 0; i < 30; i++) {
      const reflection = new THREE.Mesh(
        new THREE.PlaneGeometry(2 + Math.random() * 3, 0.3),
        reflectionMat
      );
      reflection.position.set(
        520 + (Math.random() - 0.5) * 150,
        0.08,
        470 + (Math.random() - 0.5) * 120
      );
      reflection.rotation.x = -Math.PI / 2;
      reflection.rotation.z = Math.random() * Math.PI;
      scene.add(reflection);
    }
    
    console.log('[NightV2] 水面灯光倒影添加完成');
  }
  
  // 城市光晕 — 远处城市光污染效果
  function addCityGlow() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NightV2] 添加城市光晕...');
    
    // 地平线光晕
    const glowGeo = new THREE.CylinderGeometry(1200, 1200, 200, 32, 1, true);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa66,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 100;
    scene.add(glow);
    
    console.log('[NightV2] 城市光晕添加完成');
  }
  
  init();
})();
