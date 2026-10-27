/* ============================================================
   人物NPC增强 — 盛唐长安人物百态
   v1: 不同身份NPC、服饰、动作
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['NPC] 开始增强人物NPC效果...']);
    
    addScholars();
    addMerchants();
    addSoldiers();
    addWomen();
    addChildren();
    
    console.log('[NPC] ✓ 人物NPC效果增强完成');
  }
  
  // 文人书生
  function addScholars() {
    // 大雁塔下读书的书生
    for (let i = 0; i < 8; i++) {
      createNPC(300 + (Math.random() - 0.5) * 40, 420 + (Math.random() - 0.5) * 30, 'scholar');
    }
    
    // 国子监太学生
    for (let i = 0; i < 10; i++) {
      createNPC(0 + (Math.random() - 0.5) * 100, -350 + (Math.random() - 0.5) * 50, 'scholar');
    }
  }
  
  // 商人小贩
  function addMerchants() {
    // 东市商人
    for (let i = 0; i < 15; i++) {
      createNPC(150 + (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 160, 'merchant');
    }
    
    // 西市胡商
    for (let i = 0; i < 15; i++) {
      createNPC(-150 + (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 160, 'merchant');
    }
  }
  
  // 士兵卫兵
  function addSoldiers() {
    // 皇宫卫兵
    for (let i = 0; i < 10; i++) {
      createNPC((Math.random() - 0.5) * 200, -450 + (Math.random() - 0.5) * 50, 'soldier');
    }
    
    // 城门守卫
    for (let i = 0; i < 6; i++) {
      createNPC((Math.random() - 0.5) * 40, 550 + (Math.random() - 0.5) * 10, 'soldier');
    }
  }
  
  // 仕女贵妇
  function addWomen() {
    // 曲江池游春的仕女
    for (let i = 0; i < 12; i++) {
      createNPC(520 + (Math.random() - 0.5) * 100, 470 + (Math.random() - 0.5) * 80, 'lady');
    }
    
    // 兴庆宫赏花的贵妇
    for (let i = 0; i < 8; i++) {
      createNPC(610 + (Math.random() - 0.5) * 80, -195 + (Math.random() - 0.5) * 60, 'lady');
    }
  }
  
  // 孩童
  function addChildren() {
    // 街上玩耍的孩童
    for (let i = 0; i < 10; i++) {
      createNPC((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 800, 'child');
    }
  }
  
  // 工具函数
  function createNPC(x, z, type) {
    const npc = new THREE.Group();
    
    // 身体
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.5, 6);
    let bodyColor;
    
    switch(type) {
      case 'scholar': bodyColor = 0x4a5a7a; break; // 青衫
      case 'merchant': bodyColor = 0x8b6f47; break; // 褐色商服
      case 'soldier': bodyColor = 0x4a4a4a; break; // 黑色盔甲
      case 'lady': bodyColor = 0xffb6c1; break; // 粉色襦裙
      case 'child': bodyColor = 0x87ceeb; break; // 蓝色小衫
      default: bodyColor = 0x8b4513;
    }
    
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.75;
    body.castShadow = true;
    npc.add(body);
    
    // 头部
    const headGeo = new THREE.SphereGeometry(0.25, 6, 4);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.75;
    head.castShadow = true;
    npc.add(head);
    
    // 头发/帽子
    if (type === 'scholar' || type === 'merchant') {
      // 幞头
      const hatGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.15, 6);
      const hatMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
      const hat = new THREE.Mesh(hatGeo, hatMat);
      hat.position.y = 1.95;
      npc.add(hat);
    } else if (type === 'soldier') {
      // 头盔
      const helmetGeo = new THREE.SphereGeometry(0.28, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2);
      const helmetMat = new THREE.MeshStandardMaterial({ color: 0x6a6a6a, metalness: 0.5, roughness: 0.5 });
      const helmet = new THREE.Mesh(helmetGeo, helmetMat);
      helmet.position.y = 1.8;
      npc.add(helmet);
    } else if (type === 'lady') {
      // 发髻
      const hairGeo = new THREE.SphereGeometry(0.22, 6, 4);
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.y = 1.9;
      npc.add(hair);
    }
    
    npc.position.set(x, 0, z);
    npc.rotation.y = Math.random() * Math.PI * 2;
    npc.userData.isNPC = true;
    npc.userData.type = type;
    npc.userData.baseX = x;
    npc.userData.baseZ = z;
    npc.userData.walkPhase = Math.random() * Math.PI * 2;
    
    scene.add(npc);
  }
  
  init();
})();
