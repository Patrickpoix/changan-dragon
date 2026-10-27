/* ============================================================
   大雁塔深度精修 — 唐代砖塔细节极致版
   v1: 砖缝纹理、塔门窗、塔刹相轮、石刻栏杆、佛龛
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 2000);
      return;
    }
    
    console.log(['DayantaDetail] 开始精修大雁塔...']);
    
    const X = 300, Z = 420; // 大雁塔位置
    
    addBrickTexture(X, Z);       // 砖缝纹理
    addTowerWindows(X, Z);        // 塔门窗
    addSpireDetails(X, Z);        // 塔刹相轮
    addStoneRailing(X, Z);         // 台基栏杆
    addNiches(X, Z);               // 佛龛
    
    console.log('[DayantaDetail] ✓ 大雁塔精修完成');
  }
  
  // 砖缝纹理 — 每层砖缝
  function addBrickTexture(X, Z) {
    const brickMat = new THREE.MeshStandardMaterial({ color: 0xc4a882, roughness: 0.9 });
    
    // 7层塔，每层加水平线装饰
    for (let layer = 0; layer < 7; layer++) {
      const y = 5 + layer * 8;
      const w = 15 - layer * 1.2;
      
      // 砖缝水平线
      const seam = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.2, 0.08, w + 0.2),
        new THREE.MeshStandardMaterial({ color: 0xa88862, roughness: 0.9 })
      );
      seam.position.set(X, y + 3.8, Z);
      scene.add(seam);
    }
    
    console.log('[DayantaDetail] 砖缝纹理完成');
  }
  
  // 塔门窗 — 每层拱形门窗
  function addTowerWindows(X, Z) {
    const windowMat = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a, 
      roughness: 0.9,
      emissive: 0x111122,
      emissiveIntensity: 0.2
    });
    
    // 7层，每层4面门窗
    for (let layer = 0; layer < 7; layer++) {
      const y = 8 + layer * 8;
      const w = 15 - layer * 1.2;
      
      // 正面窗
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 2.5, 0.1),
        windowMat
      );
      win.position.set(X, y, Z + w / 2 + 0.05);
      scene.add(win);
      
      // 背面窗
      const win2 = win.clone();
      win2.position.z = Z - w / 2 - 0.05;
      scene.add(win2);
      
      // 左面窗
      const win3 = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 2.5, 1.5),
        windowMat
      );
      win3.position.set(X - w / 2 - 0.05, y, Z);
      scene.add(win3);
      
      // 右面窗
      const win4 = win3.clone();
      win4.position.x = X + w / 2 + 0.05;
      scene.add(win4);
    }
    
    console.log('[DayantaDetail] 塔门窗完成');
  }
  
  // 塔刹相轮 — 金色塔刹
  function addSpireDetails(X, Z) {
    const goldMat = new THREE.MeshStandardMaterial({ 
      color: 0xd4af37, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0xaa8800,
      emissiveIntensity: 0.2
    });
    
    // 塔刹基座
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 2, 1, 8),
      goldMat
    );
    base.position.set(X, 61, Z);
    scene.add(base);
    
    // 相轮 — 5层
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.2 - i * 0.15, 0.15, 8, 16),
        goldMat
      );
      ring.position.set(X, 62 + i * 0.6, Z);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    }
    
    // 宝珠
    const pearl = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      goldMat
    );
    pearl.position.set(X, 65.5, Z);
    scene.add(pearl);
    
    // 塔刹灯光
    const light = new THREE.PointLight(0xffd700, 1, 50);
    light.position.set(X, 65, Z);
    scene.add(light);
    
    console.log('[DayantaDetail] 塔刹相轮完成');
  }
  
  // 台基栏杆 — 寺院内栏杆
  function addStoneRailing(X, Z) {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.9 });
    
    // 塔基四周栏杆
    const baseSize = 20;
    
    // 前排
    for (let i = -10; i <= 10; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), stoneMat);
      post.position.set(X + i * 2, 3.5, Z + baseSize / 2);
      scene.add(post);
    }
    
    // 后排
    for (let i = -10; i <= 10; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), stoneMat);
      post.position.set(X + i * 2, 3.5, Z - baseSize / 2);
      scene.add(post);
    }
    
    // 左排
    for (let i = -10; i <= 10; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), stoneMat);
      post.position.set(X - baseSize / 2, 3.5, Z + i * 2);
      scene.add(post);
    }
    
    // 右排
    for (let i = -10; i <= 10; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), stoneMat);
      post.position.set(X + baseSize / 2, 3.5, Z + i * 2);
      scene.add(post);
    }
    
    console.log('[DayantaDetail] 台基栏杆完成');
  }
  
  // 佛龛 — 塔身佛龛
  function addNiches(X, Z) {
    const nicheMat = new THREE.MeshStandardMaterial({ 
      color: 0x8b7355, 
      roughness: 0.8,
      emissive: 0x443322,
      emissiveIntensity: 0.1
    });
    
    // 首层佛龛 — 每面3个
    for (let side = 0; side < 4; side++) {
      const angle = side * Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      for (let i = -1; i <= 1; i++) {
        const nx = X + i * 3 * cos + 10 * sin;
        const nz = Z + i * 3 * sin - 10 * cos;
        
        const niche = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1.5, 0.2),
          nicheMat
        );
        niche.position.set(nx, 6, nz);
        niche.rotation.y = angle;
        scene.add(niche);
      }
    }
    
    console.log('[DayantaDetail] 佛龛完成');
  }
  
  init();
})();
