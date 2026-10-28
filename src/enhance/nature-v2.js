/* ============================================================
   自然景观v2 — 长安山水胜景
   v2: 远山、河流、森林、花海、云雾
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 7000);
      return;
    }
    
    console.log(['NatureV2] 开始增强自然景观...']);
    
    addDistantMountains();      // 远山
    addRivers();                  // 河流
    addForests();                 // 森林
    addFlowerFields();             // 花海
    addMist();                     // 云雾
    
    console.log('[NatureV2] ✓ 自然景观增强完成');
  }
  
  // 远山 — 长安城外的终南山
  function addDistantMountains() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NatureV2] 添加远山...');
    
    // 终南山 — 城南
    const mountainMat = new THREE.MeshStandardMaterial({ 
      color: 0x6a7a6a, 
      roughness: 0.95,
      flatShading: true
    });
    
    // 多座山峰
    const peaks = [
      { x: -400, z: -800, h: 150, w: 200 },
      { x: -100, z: -850, h: 200, w: 250 },
      { x: 200, z: -800, h: 180, w: 220 },
      { x: 500, z: -850, h: 160, w: 200 },
      { x: 0, z: -900, h: 250, w: 300 },
    ];
    
    peaks.forEach(peak => {
      const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(peak.w, peak.h, 6),
        mountainMat
      );
      mountain.position.set(peak.x, peak.h / 2 - 10, peak.z);
      mountain.castShadow = false;
      mountain.receiveShadow = true;
      scene.add(mountain);
    });
    
    console.log('[NatureV2] 远山添加完成，共5座');
  }
  
  // 河流 — 城外的河水
  function addRivers() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NatureV2] 添加河流...');
    
    const riverMat = new THREE.MeshStandardMaterial({ 
      color: 0x4a7a9a,
      roughness: 0.3,
      metalness: 0.5,
      transparent: true,
      opacity: 0.8
    });
    
    // 渭河 — 城北
    const river = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 80),
      riverMat
    );
    river.position.set(0, 0.1, -700);
    river.rotation.x = -Math.PI / 2;
    scene.add(river);
    
    console.log('[NatureV2] 河流添加完成');
  }
  
  // 森林 — 城外树林
  function addForests() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NatureV2] 添加森林...');
    
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4a7a4a, roughness: 0.85 });
    
    // 城外树林 — 城东
    for (let i = 0; i < 50; i++) {
      const tx = 700 + Math.random() * 200;
      const tz = (Math.random() - 0.5) * 1500;
      
      // 树干
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.5, 5, 5),
        trunkMat
      );
      trunk.position.set(tx, 2.5, tz);
      trunk.castShadow = true;
      scene.add(trunk);
      
      // 树冠
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(3 + Math.random() * 2, 6, 5),
        leafMat
      );
      crown.position.set(tx, 7, tz);
      crown.castShadow = true;
      scene.add(crown);
    }
    
    console.log('[NatureV2] 森林添加完成，共50棵');
  }
  
  // 花海 — 曲江池畔的花田
  function addFlowerFields() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NatureV2] 添加花海...');
    
    const flowerColors = [0xff6699, 0xffaa44, 0xffff44, 0x9966ff, 0x66ff99];
    
    // 曲江池畔花田
    for (let i = 0; i < 80; i++) {
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 4, 3),
        new THREE.MeshStandardMaterial({ 
          color: flowerColors[i % flowerColors.length],
          roughness: 0.8
        })
      );
      flower.position.set(
        520 + (Math.random() - 0.5) * 150,
        0.2,
        470 + (Math.random() - 0.5) * 120
      );
      scene.add(flower);
    }
    
    console.log('[NatureV2] 花海添加完成，共80朵');
  }
  
  // 云雾 — 山间云雾
  function addMist() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NatureV2] 添加云雾...');
    
    // 山间云雾团
    for (let i = 0; i < 10; i++) {
      const mist = new THREE.Mesh(
        new THREE.SphereGeometry(50 + Math.random() * 30, 8, 6),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.15,
          depthWrite: false
        })
      );
      mist.position.set(
        (Math.random() - 0.5) * 1000,
        50 + Math.random() * 80,
        -800 + Math.random() * 200
      );
      mist.scale.y = 0.3;
      scene.add(mist);
    }
    
    console.log('[NatureV2] 云雾添加完成，共10团');
  }
  
  init();
})();
