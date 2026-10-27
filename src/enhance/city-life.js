/* ============================================================
   城市生活增强 — 盛唐长安市井气息
   v1: NPC行人、马车、摊贩、市民活动
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log('[CityLife] 开始增强城市生活气息...');
    
    addPedestrians();
    addHorseCarts();
    addStreetVendors();
    addMarketActivity();
    
    console.log('[CityLife] ✓ 城市生活气息增强完成');
  }
  
  // NPC行人 — 朱雀大街两旁
  function addPedestrians() {
    const pedestrianCount = 50;
    
    for (let i = 0; i < pedestrianCount; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = Math.random() * 800 - 200;
      
      // 行人身体
      const bodyGeo = new THREE.CylinderGeometry(0.4, 0.5, 1.6, 6);
      const bodyColors = [0x8b4513, 0x2e8b57, 0x4169e1, 0x8b0000, 0x2f4f4f, 0xdaa520];
      const bodyMat = new THREE.MeshStandardMaterial({
        color: pick(bodyColors),
        roughness: 0.8
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(x, 0.8, z);
      body.castShadow = true;
      scene.add(body);
      
      // 行人头部
      const headGeo = new THREE.SphereGeometry(0.3, 6, 4);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.7 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(x, 1.9, z);
      head.castShadow = true;
      scene.add(head);
      
      // 行人动画数据
      body.userData.isPedestrian = true;
      body.userData.baseX = x;
      body.userData.baseZ = z;
      body.userData.speed = 0.5 + Math.random() * 0.5;
      body.userData.direction = Math.random() > 0.5 ? 1 : -1;
      body.userData.walkPhase = Math.random() * Math.PI * 2;
    }
    
    animatePedestrians();
  }
  
  // 马车 — 朱雀大街上
  function addHorseCarts() {
    const cartCount = 8;
    
    for (let i = 0; i < cartCount; i++) {
      const z = -300 + i * 100;
      
      // 马车车身
      const cartGeo = new THREE.BoxGeometry(2, 1.5, 3);
      const cartMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
      const cart = new THREE.Mesh(cartGeo, cartMat);
      cart.position.set(0, 1, z);
      cart.castShadow = true;
      cart.receiveShadow = true;
      scene.add(cart);
      
      // 马车顶棚
      const roofGeo = new THREE.ConeGeometry(2, 1, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 0.7 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(0, 2.25, z);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      scene.add(roof);
      
      // 马
      const horseGeo = new THREE.CapsuleGeometry(0.5, 1.5, 4, 6);
      const horseColors = [0x8b4513, 0x2f4f4f, 0x696969, 0xffffff];
      const horseMat = new THREE.MeshStandardMaterial({ color: pick(horseColors), roughness: 0.7 });
      const horse = new THREE.Mesh(horseGeo, horseMat);
      horse.position.set(0, 1, z - 2.5);
      horse.castShadow = true;
      scene.add(horse);
      
      // 马车动画数据
      cart.userData.isCart = true;
      cart.userData.baseZ = z;
      cart.userData.speed = 0.3 + Math.random() * 0.2;
      cart.userData.direction = Math.random() > 0.5 ? 1 : -1;
    }
    
    animateCarts();
  }
  
  // 街头摊贩
  function addStreetVendors() {
    const vendorPositions = [
      { x: 50, z: 0 }, { x: -50, z: 50 },
      { x: 50, z: 100 }, { x: -50, z: 150 },
      { x: 50, z: 200 }, { x: -50, z: 250 },
      { x: 150, z: 0 }, { x: -150, z: 0 }
    ];
    
    vendorPositions.forEach((pos, i) => {
      // 摊位
      const stallGeo = new THREE.BoxGeometry(3, 1, 2);
      const stallMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.8 });
      const stall = new THREE.Mesh(stallGeo, stallMat);
      stall.position.set(pos.x, 0.5, pos.z);
      stall.castShadow = true;
      stall.receiveShadow = true;
      scene.add(stall);
      
      // 摊位遮阳棚
      const awningGeo = new THREE.BoxGeometry(3.5, 0.1, 2.5);
      const awningColors = [0xc0392b, 0x27ae60, 0x2980b9, 0xf39c12];
      const awningMat = new THREE.MeshStandardMaterial({ color: pick(awningColors), roughness: 0.7 });
      const awning = new THREE.Mesh(awningGeo, awningMat);
      awning.position.set(pos.x, 1.8, pos.z);
      awning.castShadow = true;
      scene.add(awning);
      
      // 摊贩
      const vendorGeo = new THREE.CylinderGeometry(0.35, 0.4, 1.5, 6);
      const vendorMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
      const vendor = new THREE.Mesh(vendorGeo, vendorMat);
      vendor.position.set(pos.x + 2, 0.75, pos.z);
      vendor.castShadow = true;
      scene.add(vendor);
      
      // 货物
      for (let j = 0; j < 3; j++) {
        const goodsGeo = new THREE.BoxGeometry(0.5, 0.3, 0.5);
        const goodsColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3];
        const goodsMat = new THREE.MeshStandardMaterial({ color: pick(goodsColors), roughness: 0.6 });
        const goods = new THREE.Mesh(goodsGeo, goodsMat);
        goods.position.set(pos.x - 1 + j, 1.15, pos.z + (Math.random() - 0.5));
        scene.add(goods);
      }
    });
  }
  
  // 市场活动 — 东西市
  function addMarketActivity() {
    // 东市 — 奢侈品市场
    addMarketStalls(150, 0, '东市');
    // 西市 — 国际贸易市场
    addMarketStalls(-150, 0, '西市');
  }
  
  function addMarketStalls(cx, cz, name) {
    // 市场街道两旁的摊位
    for (let i = 0; i < 10; i++) {
      for (const side of [-1, 1]) {
        const x = cx + side * 30;
        const z = cz - 80 + i * 18;
        
        // 摊位
        const stallGeo = new THREE.BoxGeometry(4, 1.2, 3);
        const stallMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.8 });
        const stall = new THREE.Mesh(stallGeo, stallMat);
        stall.position.set(x, 0.6, z);
        stall.castShadow = true;
        stall.receiveShadow = true;
        scene.add(stall);
        
        // 招牌
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 128;
        signCanvas.height = 64;
        const ctx = signCanvas.getContext('2d');
        ctx.fillStyle = '#8b2500';
        ctx.fillRect(0, 0, 128, 64);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 28px serif';
        ctx.textAlign = 'center';
        const shopTypes = ['丝绸', '茶叶', '瓷器', '香料', '珠宝', '药材', '书籍', '字画'];
        ctx.fillText(pick(shopTypes), 64, 42);
        const signTex = new THREE.CanvasTexture(signCanvas);
        const signMat = new THREE.MeshBasicMaterial({ map: signTex });
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.5), signMat);
        sign.position.set(x, 2, z - side * 1.6);
        sign.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        scene.add(sign);
      }
    }
  }
  
  // 动画循环
  function animatePedestrians() {
    function animate() {
      requestAnimationFrame(animate);
      
      scene.children.forEach(obj => {
        if (obj.userData.isPedestrian) {
          obj.userData.walkPhase += 0.05;
          obj.position.z += obj.userData.speed * obj.userData.direction * 0.02;
          
          // 走路摆动
          obj.position.y = 0.8 + Math.sin(obj.userData.walkPhase) * 0.05;
          
          // 边界循环
          if (obj.position.z > 600) obj.position.z = -200;
          if (obj.position.z < -200) obj.position.z = 600;
        }
      });
    }
    animate();
  }
  
  function animateCarts() {
    function animate() {
      requestAnimationFrame(animate);
      
      scene.children.forEach(obj => {
        if (obj.userData.isCart) {
          obj.position.z += obj.userData.speed * obj.userData.direction * 0.03;
          
          // 边界循环
          if (obj.position.z > 600) obj.position.z = -300;
          if (obj.position.z < -300) obj.position.z = 600;
        }
      });
    }
    animate();
  }
  
  init();
})();
