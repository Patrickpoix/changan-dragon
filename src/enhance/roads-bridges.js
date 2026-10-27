/* ============================================================
   桥梁道路增强 — 长安路网系统
   v1: 桥梁、道路、街道、牌坊
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Roads] 开始增强桥梁道路效果...']);
    
    enhanceMainRoads();
    addBridges();
    addPaifangs();
    
    console.log('[Roads] ✓ 桥梁道路效果增强完成');
  }
  
  // 主干道增强
  function enhanceMainRoads() {
    // 朱雀大街 — 御道
    const zhuqueGeo = new THREE.PlaneGeometry(50, 1000);
    const zhuqueMat = new THREE.MeshStandardMaterial({
      color: 0xd4c4a0,
      roughness: 0.8
    });
    const zhuque = new THREE.Mesh(zhuqueGeo, zhuqueMat);
    zhuque.rotation.x = -Math.PI / 2;
    zhuque.position.set(0, 0.03, 100);
    zhuque.receiveShadow = true;
    scene.add(zhuque);
    
    // 两侧排水沟
    for (const side of [-1, 1]) {
      const ditchGeo = new THREE.BoxGeometry(2, 0.4, 1000);
      const ditchMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.9 });
      const ditch = new THREE.Mesh(ditchGeo, ditchMat);
      ditch.position.set(side * 30, 0.2, 100);
      scene.add(ditch);
      
      // 沟边石条
      const curbGeo = new THREE.BoxGeometry(1, 0.3, 1000);
      const curbMat = new THREE.MeshStandardMaterial({ color: 0x9a8b70, roughness: 0.8 });
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(side * 28, 0.15, 100);
      curb.castShadow = true;
      curb.receiveShadow = true;
      scene.add(curb);
    }
    
    // 东西大街
    const eastWestGeo = new THREE.PlaneGeometry(1000, 40);
    const eastWestMat = new THREE.MeshStandardMaterial({
      color: 0xc8b896,
      roughness: 0.85
    });
    const eastWest = new THREE.Mesh(eastWestGeo, eastWestMat);
    eastWest.rotation.x = -Math.PI / 2;
    eastWest.position.set(0, 0.03, 0);
    eastWest.receiveShadow = true;
    scene.add(eastWest);
  }
  
  // 桥梁
  function addBridges() {
    // 曲江池曲桥
    createBridge(520, 470, 60, 8);
    
    // 兴庆宫龙池桥
    createBridge(610, -195, 30, 6);
    
    // 护城河桥 — 明德门外
    createBridge(0, 640, 20, 8);
  }
  
  // 牌坊
  function addPaifangs() {
    // 朱雀大街入口
    createPaifang(0, 500, '朱雀大街');
    createPaifang(0, -300, '皇城南门');
    
    // 东西市入口
    createPaifang(150, -100, '东市');
    createPaifang(-150, -100, '西市');
    
    // 大雁塔入口
    createPaifang(300, 380, '大慈恩寺');
    
    // 曲江池入口
    createPaifang(450, 400, '曲江池');
  }
  
  // 工具函数
  function createBridge(x, z, length, width) {
    // 桥面
    const deckGeo = new THREE.BoxGeometry(width, 0.5, length);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x8b6f47,
      roughness: 0.8
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(x, 1, z);
    deck.castShadow = true;
    deck.receiveShadow = true;
    scene.add(deck);
    
    // 栏杆
    for (const side of [-1, 1]) {
      const railGeo = new THREE.BoxGeometry(0.2, 1, length);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.8 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(x + side * width / 2, 1.75, z);
      rail.castShadow = true;
      scene.add(rail);
      
      // 栏杆柱
      for (let i = 0; i < 5; i++) {
        const postGeo = new THREE.BoxGeometry(0.3, 1.5, 0.3);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.8 });
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(x + side * width / 2, 1.25, z - length / 2 + i * length / 4);
        post.castShadow = true;
        scene.add(post);
      }
    }
  }
  
  function createPaifang(x, z, name) {
    // 立柱
    for (const side of [-1, 1]) {
      const pillarGeo = new THREE.CylinderGeometry(0.5, 0.6, 10, 8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x8b2500, roughness: 0.7 });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x + side * 10, 5, z);
      pillar.castShadow = true;
      scene.add(pillar);
    }
    
    // 横梁
    const beamGeo = new THREE.BoxGeometry(22, 1.8, 1.2);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x8b2500, roughness: 0.7 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(x, 8.5, z);
    beam.castShadow = true;
    scene.add(beam);
    
    // 屋顶
    const roofGeo = new THREE.BoxGeometry(24, 0.6, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a6a6a, roughness: 0.6 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(x, 9.7, z);
    roof.castShadow = true;
    scene.add(roof);
    
    // 匾额
    const plaqueCanvas = document.createElement('canvas');
    plaqueCanvas.width = 512;
    plaqueCanvas.height = 128;
    const ctx = plaqueCanvas.getContext('2d');
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 72px serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 256, 88);
    const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
    const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTex });
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), plaqueMat);
    plaque.position.set(x, 8.3, z + 0.7);
    scene.add(plaque);
  }
  
  init();
})();
