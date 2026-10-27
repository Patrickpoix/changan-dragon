/* ============================================================
   城墙城门增强 — 长安都城雄姿
   v1: 城墙、城门、城楼、角楼、垛口
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['CityWall] 开始增强城墙城门效果...']);
    
    enhanceCityWalls();
    enhanceMingdeGate();
    enhanceCornerTowers();
    addWallLamps();
    
    console.log('[CityWall] ✓ 城墙城门效果增强完成');
  }
  
  // 城墙增强
  function enhanceCityWalls() {
    // 南城墙 — 明德门到安化门
    for (let x = -600; x <= 600; x += 20) {
      // 城墙垛口
      createCrenellation(x, 550, 8);
    }
    
    // 北城墙
    for (let x = -600; x <= 600; x += 20) {
      createCrenellation(x, -550, 8);
    }
    
    // 东城墙
    for (let z = -550; z <= 550; z += 20) {
      createCrenellation(620, z, 8);
    }
    
    // 西城墙
    for (let z = -550; z <= 550; z += 20) {
      createCrenellation(-620, z, 8);
    }
  }
  
  // 明德门 — 正南门
  function enhanceMingdeGate() {
    // 城楼
    const gateX = 0, gateZ = 550;
    
    // 城楼基座
    const baseGeo = new THREE.BoxGeometry(60, 10, 20);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xc8b896, roughness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(gateX, 5, gateZ);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    
    // 城楼主体
    const hallGeo = new THREE.BoxGeometry(40, 12, 15);
    const hallMat = new THREE.MeshStandardMaterial({
      color: 0xd4a574,
      roughness: 0.7
    });
    const hall = new THREE.Mesh(hallGeo, hallMat);
    hall.position.set(gateX, 16, gateZ);
    hall.castShadow = true;
    scene.add(hall);
    
    // 城楼屋顶
    const roofGeo = new THREE.ConeGeometry(25, 8, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a6a6a, roughness: 0.6 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(gateX, 26, gateZ);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
    
    // 城门洞 — 三个门洞
    for (const offset of [-15, 0, 15]) {
      const gateGeo = new THREE.BoxGeometry(10, 8, 2);
      const gateMat = new THREE.MeshBasicMaterial({ color: 0x2a2a2a });
      const gate = new THREE.Mesh(gateGeo, gateMat);
      gate.position.set(gateX + offset, 4, gateZ + 10);
      scene.add(gate);
    }
    
    // 匾额
    const plaqueCanvas = document.createElement('canvas');
    plaqueCanvas.width = 512;
    plaqueCanvas.height = 128;
    const ctx = plaqueCanvas.getContext('2d');
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 80px serif';
    ctx.textAlign = 'center';
    ctx.fillText('明德门', 256, 90);
    const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
    const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTex });
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), plaqueMat);
    plaque.position.set(gateX, 14, gateZ + 10.5);
    scene.add(plaque);
  }
  
  // 角楼 — 城墙四角
  function enhanceCornerTowers() {
    const corners = [
      { x: -620, z: -550 }, // 西北
      { x: 620, z: -550 },  // 东北
      { x: -620, z: 550 },   // 西南
      { x: 620, z: 550 }     // 东南
    ];
    
    corners.forEach(corner => {
      createCornerTower(corner.x, corner.z);
    });
  }
  
  // 城墙上的灯笼
  function addWallLamps() {
    // 南城墙
    for (let x = -600; x <= 600; x += 50) {
      createWallLamp(x, 550);
    }
    
    // 北城墙
    for (let x = -600; x <= 600; x += 50) {
      createWallLamp(x, -550);
    }
  }
  
  // 工具函数
  function createCrenellation(x, z, height) {
    const merlonGeo = new THREE.BoxGeometry(2, height, 1);
    const merlonMat = new THREE.MeshStandardMaterial({ color: 0xc8b896, roughness: 0.8 });
    const merlon = new THREE.Mesh(merlonGeo, merlonMat);
    merlon.position.set(x, 10 + height / 2, z);
    merlon.castShadow = true;
    scene.add(merlon);
  }
  
  function createCornerTower(x, z) {
    // 角楼基座
    const baseGeo = new THREE.BoxGeometry(15, 12, 15);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xc8b896, roughness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(x, 6, z);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    
    // 角楼主体
    const towerGeo = new THREE.BoxGeometry(10, 8, 10);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(x, 16, z);
    tower.castShadow = true;
    scene.add(tower);
    
    // 角楼屋顶
    const roofGeo = new THREE.ConeGeometry(8, 6, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a6a6a, roughness: 0.6 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(x, 23, z);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
  }
  
  function createWallLamp(x, z) {
    const lampGeo = new THREE.SphereGeometry(0.4, 6, 4);
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xff6644,
      emissive: 0xff4422,
      emissiveIntensity: 0.8
    });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(x, 12, z);
    scene.add(lamp);
  }
  
  init();
})();
