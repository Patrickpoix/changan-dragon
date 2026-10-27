/* ============================================================
   核心建筑精修 — 朱雀大街、大明宫、大雁塔
   v1: 电影级唐式建筑细节升级
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log('[CoreDetail] 开始精修核心建筑...');
    
    enhanceZhuqueAvenue();
    enhanceDamingPalace();
    enhanceDayanta();
    enhanceMarketStreets();
    
    console.log('[CoreDetail] ✓ 核心建筑精修完成');
  }
  
  function enhanceZhuqueAvenue() {
    const roadGeo = new THREE.PlaneGeometry(60, 900);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0xc8b896,
      roughness: 0.85,
      metalness: 0.05
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.03, 100);
    road.receiveShadow = true;
    scene.add(road);
    
    for (const side of [-1, 1]) {
      const ditchGeo = new THREE.BoxGeometry(3, 0.5, 900);
      const ditchMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9 });
      const ditch = new THREE.Mesh(ditchGeo, ditchMat);
      ditch.position.set(side * 35, 0.25, 100);
      scene.add(ditch);
      
      const curbGeo = new THREE.BoxGeometry(1.2, 0.4, 900);
      const curbMat = new THREE.MeshStandardMaterial({ color: 0x9a8b70, roughness: 0.8 });
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(side * 33, 0.2, 100);
      curb.castShadow = true;
      curb.receiveShadow = true;
      scene.add(curb);
    }
    
    for (let z = -350; z <= 550; z += 25) {
      for (const side of [-1, 1]) {
        createDetailedTree(side * 50, z, 'pagoda');
      }
    }
    
    for (let z = -300; z <= 500; z += 50) {
      for (const side of [-1, 1]) {
        createStreetLamp(side * 28, z);
      }
    }
    
    createPaifang(0, 480, '朱雀大街');
    createPaifang(0, -300, '皇城南门');
  }
  
  function enhanceDamingPalace() {
    const DX = 320, DZ = -460;
    
    const plazaGeo = new THREE.PlaneGeometry(200, 150);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xd4c4a0,
      roughness: 0.75
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(DX, 0.05, DZ + 20);
    plaza.receiveShadow = true;
    scene.add(plaza);
    
    for (let i = 0; i < 12; i++) {
      const stepGeo = new THREE.BoxGeometry(120 - i * 3, 0.3, 1.2);
      const stepMat = new THREE.MeshStandardMaterial({ color: 0xc8b896, roughness: 0.8 });
      const step = new THREE.Mesh(stepGeo, stepMat);
      step.position.set(DX, 0.15 + i * 0.3, DZ + 55 - i * 1.2);
      step.receiveShadow = true;
      scene.add(step);
    }
    
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        createPalaceLantern(DX + side * (30 + i * 20), DZ - 10 + i * 8);
      }
    }
    
    const hillGeo = new THREE.ConeGeometry(200, 30, 64);
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x8a9a6a, roughness: 1.0 });
    const hill = new THREE.Mesh(hillGeo, hillMat);
    hill.position.set(DX, -15, DZ - 50);
    hill.scale.set(1.5, 1, 1.2);
    hill.receiveShadow = true;
    scene.add(hill);
  }
  
  function enhanceDayanta() {
    const x = 300, z = 420;
    
    const plazaGeo = new THREE.PlaneGeometry(100, 100);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xd8ccb0,
      roughness: 0.8
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(x, 0.04, z);
    plaza.receiveShadow = true;
    scene.add(plaza);
    
    for (let i = 0; i < 3; i++) {
      createIncenseBurner(x - 20 + i * 20, z + 30);
    }
    
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const radius = 50 + Math.random() * 20;
      createDetailedTree(x + Math.cos(angle) * radius, z + Math.sin(angle) * radius, 'pine');
    }
  }
  
  function enhanceMarketStreets() {
    createMarketDistrict(150, 0, '东市');
    createMarketDistrict(-150, 0, '西市');
  }
  
  function createMarketDistrict(cx, cz, name) {
    const streetGeo = new THREE.PlaneGeometry(80, 200);
    const streetMat = new THREE.MeshStandardMaterial({ color: 0xc0b090, roughness: 0.9 });
    const street = new THREE.Mesh(streetGeo, streetMat);
    street.rotation.x = -Math.PI / 2;
    street.position.set(cx, 0.03, cz);
    street.receiveShadow = true;
    scene.add(street);
    
    for (let i = 0; i < 8; i++) {
      for (const side of [-1, 1]) {
        createShopHouse(cx + side * 45, cz - 80 + i * 25, side);
      }
    }
    
    createPaifang(cx, cz - 100, name);
  }
  
  function createShopHouse(x, z, facing) {
    const bodyGeo = new THREE.BoxGeometry(12, 6, 10);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xd8c8a8,
      roughness: 0.8
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(x, 3, z);
    body.castShadow = true;
    body.receiveShadow = true;
    scene.add(body);
    
    const roofGeo = new THREE.ConeGeometry(9, 4, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a6a6a, roughness: 0.7 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(x, 8, z);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
    
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 64;
    const ctx = signCanvas.getContext('2d');
    ctx.fillStyle = '#8b2500';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.fillText(pick(['酒肆', '茶坊', '布庄', '当铺', '客栈', '药铺']), 128, 45);
    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), signMat);
    sign.position.set(x, 5, z - facing * 5.1);
    sign.rotation.y = facing > 0 ? -Math.PI / 2 : Math.PI / 2;
    scene.add(sign);
  }
  
  function createDetailedTree(x, z, type) {
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 2, z);
    trunk.castShadow = true;
    scene.add(trunk);
    
    if (type === 'pine') {
      for (let i = 0; i < 3; i++) {
        const pineGeo = new THREE.ConeGeometry(2.5 - i * 0.5, 2.5, 8);
        const pineMat = new THREE.MeshStandardMaterial({ color: 0x3a5a3a, roughness: 0.85 });
        const pine = new THREE.Mesh(pineGeo, pineMat);
        pine.position.set(x, 5 + i * 2, z);
        pine.castShadow = true;
        scene.add(pine);
      }
    } else if (type === 'pagoda') {
      for (let i = 0; i < 4; i++) {
        const leafGeo = new THREE.SphereGeometry(3 - i * 0.5, 8, 6);
        const leafMat = new THREE.MeshStandardMaterial({ color: i % 2 ? 0x5a8a4a : 0x4a7a3a, roughness: 0.85 });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(x, 5 + i * 1.8, z);
        leaf.scale.y = 0.7;
        leaf.castShadow = true;
        scene.add(leaf);
      }
    } else {
      const leafGeo = new THREE.SphereGeometry(3, 8, 6);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x5a8a4a, roughness: 0.85 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(x, 6, z);
      leaf.castShadow = true;
      scene.add(leaf);
    }
  }
  
  function createStreetLamp(x, z) {
    const poleGeo = new THREE.CylinderGeometry(0.15, 0.2, 4, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, 2, z);
    scene.add(pole);
    
    const lanternGeo = new THREE.SphereGeometry(0.5, 8, 6);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xff6644,
      emissive: 0xff4422,
      emissiveIntensity: 0.5
    });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.set(x, 4.2, z);
    scene.add(lantern);
  }
  
  function createPalaceLantern(x, z) {
    const baseGeo = new THREE.BoxGeometry(1, 0.3, 1);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, metalness: 0.6, roughness: 0.4 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(x, 0.15, z);
    scene.add(base);
    
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, 3, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, metalness: 0.6, roughness: 0.4 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, 1.8, z);
    scene.add(pole);
    
    const lanternGeo = new THREE.BoxGeometry(0.8, 1.2, 0.8);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xffaa44,
      emissive: 0xff8822,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9
    });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.set(x, 3.8, z);
    scene.add(lantern);
    
    const light = new THREE.PointLight(0xffaa66, 0.5, 10);
    light.position.set(x, 4, z);
    scene.add(light);
  }
  
  function createPaifang(x, z, name) {
    for (const side of [-1, 1]) {
      const pillarGeo = new THREE.CylinderGeometry(0.5, 0.6, 8, 8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x8b2500, roughness: 0.7 });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x + side * 8, 4, z);
      pillar.castShadow = true;
      scene.add(pillar);
    }
    
    const beamGeo = new THREE.BoxGeometry(18, 1.5, 1);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x8b2500, roughness: 0.7 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(x, 7, z);
    beam.castShadow = true;
    scene.add(beam);
    
    const roofGeo = new THREE.BoxGeometry(20, 0.5, 3);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a6a6a, roughness: 0.7 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(x, 8, z);
    roof.castShadow = true;
    scene.add(roof);
    
    const plaqueCanvas = document.createElement('canvas');
    plaqueCanvas.width = 512;
    plaqueCanvas.height = 128;
    const ctx = plaqueCanvas.getContext('2d');
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 72px serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 256, 90);
    const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
    const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTex });
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(10, 2), plaqueMat);
    plaque.position.set(x, 6.8, z + 0.6);
    scene.add(plaque);
  }
  
  function createIncenseBurner(x, z) {
    const burnerGeo = new THREE.CylinderGeometry(0.8, 0.6, 1, 8);
    const burnerMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, metalness: 0.7, roughness: 0.3 });
    const burner = new THREE.Mesh(burnerGeo, burnerMat);
    burner.position.set(x, 0.5, z);
    burner.castShadow = true;
    scene.add(burner);
  }
  
  init();
})();
