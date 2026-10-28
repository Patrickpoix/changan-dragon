/* ============================================================
   寺庙宗教v2 — 盛唐佛道盛景
   v2: 寺庙、佛塔、经幢、香炉、钟鼓楼、僧人
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 5000);
      return;
    }
    
    console.log(['TemplesV2] 开始增强寺庙宗教...']);
    
    addTempleCourtyard();       // 大慈恩寺庭院
    addDiamondThrone();          // 经幢
    addIncenseBurner();          // 香炉
    addBellDrumTowers();          // 钟鼓楼
    addMonks();                   // 僧人
    addPrayerFlags();             // 经幡
    
    console.log('[TemplesV2] ✓ 寺庙宗教增强完成');
  }
  
  // 大慈恩寺庭院
  function addTempleCourtyard() {
    if (typeof scene === 'undefined') return;
    
    console.log('[TemplesV2] 添加大慈恩寺庭院...');
    
    const tx = 300, tz = 420;
    
    // 山门
    const gate = new THREE.Mesh(
      new THREE.BoxGeometry(15, 6, 5),
      new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
    );
    gate.position.set(tx, 3, tz + 30);
    gate.castShadow = true;
    scene.add(gate);
    
    // 山门屋顶
    const gateRoof = new THREE.Mesh(
      new THREE.ConeGeometry(10, 3, 4),
      new THREE.MeshStandardMaterial({ color: 0x4a6670, roughness: 0.6 })
    );
    gateRoof.position.set(tx, 7.5, tz + 30);
    gateRoof.rotation.y = Math.PI / 4;
    scene.add(gateRoof);
    
    // 大雄宝殿
    const hall = new THREE.Mesh(
      new THREE.BoxGeometry(25, 10, 18),
      new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
    );
    hall.position.set(tx, 5, tz - 10);
    hall.castShadow = true;
    scene.add(hall);
    
    // 大殿屋顶
    const hallRoof = new THREE.Mesh(
      new THREE.ConeGeometry(18, 6, 4),
      new THREE.MeshStandardMaterial({ color: 0x4a6670, roughness: 0.6 })
    );
    hallRoof.position.set(tx, 13, tz - 10);
    hallRoof.rotation.y = Math.PI / 4;
    hallRoof.castShadow = true;
    scene.add(hallRoof);
    
    // 庭院地面
    const courtyard = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 50),
      new THREE.MeshStandardMaterial({ color: 0xc8b89a, roughness: 0.9 })
    );
    courtyard.position.set(tx, 0.02, tz + 10);
    courtyard.rotation.x = -Math.PI / 2;
    courtyard.receiveShadow = true;
    scene.add(courtyard);
    
    console.log('[TemplesV2] 大慈恩寺庭院添加完成');
  }
  
  // 经幢 — 石经柱
  function addDiamondThrone() {
    if (typeof scene === 'undefined') return;
    
    console.log('[TemplesV2] 添加经幢...');
    
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.85 });
    
    // 大雁塔前经幢
    const tx = 300, tz = 420;
    
    for (const side of [-1, 1]) {
      // 基座
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.5, 2),
        stoneMat
      );
      base.position.set(tx + side * 15, 0.25, tz + 10);
      scene.add(base);
      
      // 幢身
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 5, 6),
        stoneMat
      );
      pillar.position.set(tx + side * 15, 3, tz + 10);
      pillar.castShadow = true;
      scene.add(pillar);
      
      // 幢顶
      const top = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 1, 6),
        stoneMat
      );
      top.position.set(tx + side * 15, 6, tz + 10);
      scene.add(top);
    }
    
    console.log('[TemplesV2] 经幢添加完成');
  }
  
  // 香炉 — 寺庙前的大香炉
  function addIncenseBurner() {
    if (typeof scene === 'undefined') return;
    
    console.log('[TemplesV2] 添加香炉...');
    
    const bronzeMat = new THREE.MeshStandardMaterial({ 
      color: 0x8b6914, 
      roughness: 0.4,
      metalness: 0.7
    });
    
    // 大雁塔前香炉
    const burner = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.2, 2, 8),
      bronzeMat
    );
    burner.position.set(300, 1, 420 + 10);
    burner.castShadow = true;
    scene.add(burner);
    
    // 炉耳
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(
        new THREE.TorusGeometry(0.4, 0.08, 4, 8),
        bronzeMat
      );
      ear.position.set(300 + side * 1.5, 2.2, 420 + 10);
      ear.rotation.y = Math.PI / 2;
      scene.add(ear);
    }
    
    // 香烟
    for (let i = 0; i < 5; i++) {
      const smoke = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 1, 4),
        new THREE.MeshBasicMaterial({ 
          color: 0xaaaaaa,
          transparent: true,
          opacity: 0.3
        })
      );
      smoke.position.set(
        300 + (Math.random() - 0.5) * 1,
        2.5 + Math.random(),
        420 + 10 + (Math.random() - 0.5) * 1
      );
      scene.add(smoke);
    }
    
    console.log('[TemplesV2] 香炉添加完成');
  }
  
  // 钟鼓楼 — 寺庙两侧
  function addBellDrumTowers() {
    if (typeof scene === 'undefined') return;
    
    console.log('[TemplesV2] 添加钟鼓楼...');
    
    const tx = 300, tz = 420;
    
    // 钟楼（东）
    const bellTower = new THREE.Mesh(
      new THREE.BoxGeometry(6, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
    );
    bellTower.position.set(tx - 20, 4, tz + 5);
    bellTower.castShadow = true;
    scene.add(bellTower);
    
    const bellRoof = new THREE.Mesh(
      new THREE.ConeGeometry(5, 3, 4),
      new THREE.MeshStandardMaterial({ color: 0x4a6670, roughness: 0.6 })
    );
    bellRoof.position.set(tx - 20, 9.5, tz + 5);
    bellRoof.rotation.y = Math.PI / 4;
    scene.add(bellRoof);
    
    // 鼓楼（西）
    const drumTower = new THREE.Mesh(
      new THREE.BoxGeometry(6, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
    );
    drumTower.position.set(tx + 20, 4, tz + 5);
    drumTower.castShadow = true;
    scene.add(drumTower);
    
    const drumRoof = new THREE.Mesh(
      new THREE.ConeGeometry(5, 3, 4),
      new THREE.MeshStandardMaterial({ color: 0x4a6670, roughness: 0.6 })
    );
    drumRoof.position.set(tx + 20, 9.5, tz + 5);
    drumRoof.rotation.y = Math.PI / 4;
    scene.add(drumRoof);
    
    console.log('[TemplesV2] 钟鼓楼添加完成');
  }
  
  // 僧人 — 寺庙里的和尚
  function addMonks() {
    if (typeof scene === 'undefined') return;
    
    console.log('[TemplesV2] 添加僧人...');
    
    const robeMat = new THREE.MeshStandardMaterial({ color: 0xff8800, roughness: 0.8 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd8a888, roughness: 0.7 });
    
    // 10个僧人
    for (let i = 0; i < 10; i++) {
      const group = new THREE.Group();
      
      // 身体
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.28, 0.9, 6),
        robeMat
      );
      body.position.y = 0.85;
      body.castShadow = true;
      group.add(body);
      
      // 头 — 光头
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 6, 5),
        skinMat
      );
      head.position.y = 1.45;
      group.add(head);
      
      group.position.set(
        300 + (Math.random() - 0.5) * 40,
        0,
        420 + (Math.random() - 0.5) * 30
      );
      group.rotation.y = Math.random() * Math.PI * 2;
      
      scene.add(group);
    }
    
    console.log('[TemplesV2] 僧人添加完成，共10个');
  }
  
  // 经幡 — 寺庙周围的彩旗
  function addPrayerFlags() {
    if (typeof scene === 'undefined') return;
    
    console.log('[TemplesV2] 添加经幡...');
    
    const flagColors = [0xff4444, 0xffaa00, 0xffff00, 0x44ff44, 0x4488ff, 0xaa44ff];
    
    // 大雁塔周围经幡
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.5),
        new THREE.MeshBasicMaterial({ 
          color: flagColors[i % flagColors.length],
          side: THREE.DoubleSide
        })
      );
      flag.position.set(
        300 + Math.cos(angle) * 25,
        3 + Math.random() * 2,
        420 + Math.sin(angle) * 25
      );
      flag.rotation.y = -angle + Math.PI / 2;
      scene.add(flag);
    }
    
    console.log('[TemplesV2] 经幡添加完成');
  }
  
  init();
})();
