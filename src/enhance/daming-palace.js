/* ============================================================
   大明宫核心精修
   Daming Palace refinement: Hanyuan Hall, Danfeng Gate, Taiye Pool
   ============================================================ */

(function() {
  'use strict';
  
  const DX = 320, DZ = -460;
  
  function init() {
    console.log(['DamingPalace] 开始精修大明宫...']);
    
    refineDanfengGate();
    refineHanyuanHall();
    refineTaiyePool();
    refinePalaceGarden();
    
    console.log('[DamingPalace] ✓ 大明宫精修完成');
  }
  
  function makeMat(options) {
    return new THREE.MeshStandardMaterial(Object.assign({
      roughness: 0.7,
      metalness: 0.1
    }, options));
  }
  
  // 精修丹凤门
  function refineDanfengGate() {
    if (typeof scene === 'undefined') return;
    
    console.log('[DamingPalace] 精修丹凤门...');
    
    const gx = DX, gz = DZ + 80;
    
    // 高大基座
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(100, 15, 30),
      makeMat({ color: 0xd4c4a8, roughness: 0.8 })
    );
    base.position.set(gx, 7.5, gz);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    
    // 五个门洞 — 明德五门道
    for (let i = -2; i <= 2; i++) {
      const gate = new THREE.Mesh(
        new THREE.BoxGeometry(8, 10, 2),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 })
      );
      gate.position.set(gx + i * 15, 5, gz + 15.2);
      scene.add(gate);
    }
    
    // 城楼
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(80, 20, 25),
      makeMat({ color: 0xd4a574, roughness: 0.6 })
    );
    tower.position.set(gx, 25, gz);
    tower.castShadow = true;
    scene.add(tower);
    
    // 朱红立柱
    for (let i = -6; i <= 6; i++) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 20, 8),
        makeMat({ color: 0x8b0000, roughness: 0.5, metalness: 0.2 })
      );
      col.position.set(gx + i * 6, 25, gz + 12);
      col.castShadow = true;
      scene.add(col);
    }
    
    // 重檐庑殿顶
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(55, 12, 4),
      makeMat({ color: 0x8b0000, roughness: 0.4, metalness: 0.3 })
    );
    roof.position.set(gx, 41, gz);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
    
    // 金色鸱吻
    for (const side of [-1, 1]) {
      const chiwen = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 8, 6),
        makeMat({ color: 0xffd700, metalness: 0.8, roughness: 0.2 })
      );
      chiwen.position.set(gx + side * 30, 47, gz);
      scene.add(chiwen);
    }
    
    console.log('[DamingPalace] 丹凤门精修完成');
  }
  
  // 精修含元殿
  function refineHanyuanHall() {
    if (typeof scene === 'undefined') return;
    
    console.log('[DamingPalace] 精修含元殿...');
    
    const hx = DX, hz = DZ - 20;
    
    // 龙尾道 — 三层台阶
    for (let i = 0; i < 3; i++) {
      const terrace = new THREE.Mesh(
        new THREE.BoxGeometry(80 - i * 10, 3, 40 - i * 5),
        makeMat({ color: 0xd4c4a8, roughness: 0.8 })
      );
      terrace.position.set(hx, 3 + i * 3, hz + 20 - i * 5);
      terrace.castShadow = true;
      terrace.receiveShadow = true;
      scene.add(terrace);
    }
    
    // 大殿主体
    const hall = new THREE.Mesh(
      new THREE.BoxGeometry(60, 25, 35),
      makeMat({ color: 0xd4a574, roughness: 0.6 })
    );
    hall.position.set(hx, 20, hz);
    hall.castShadow = true;
    scene.add(hall);
    
    // 蟠龙柱 — 金色立柱
    for (let i = -5; i <= 5; i++) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 25, 12),
        makeMat({ color: 0x8b0000, roughness: 0.4, metalness: 0.4 })
      );
      col.position.set(hx + i * 5, 20, hz + 18);
      col.castShadow = true;
      scene.add(col);
    }
    
    // 斗拱层 — 三层斗拱
    for (let layer = 0; layer < 3; layer++) {
      const dgLayer = new THREE.Mesh(
        new THREE.BoxGeometry(65 - layer * 3, 1.5, 40 - layer * 2),
        makeMat({ color: layer === 0 ? 0xd4a574 : 0x8b4513, roughness: 0.6 })
      );
      dgLayer.position.set(hx, 33 + layer * 2, hz);
      dgLayer.castShadow = true;
      scene.add(dgLayer);
    }
    
    // 庑殿顶 — 最高等级
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(45, 15, 4),
      makeMat({ color: 0x8b0000, roughness: 0.35, metalness: 0.4 })
    );
    roof.position.set(hx, 43, hz);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
    
    // 翔鸾阁、栖凤阁 — 两侧阙楼
    for (const side of [-1, 1]) {
      const pavilion = new THREE.Mesh(
        new THREE.BoxGeometry(15, 20, 15),
        makeMat({ color: 0xd4a574, roughness: 0.6 })
      );
      pavilion.position.set(hx + side * 45, 15, hz + 10);
      pavilion.castShadow = true;
      scene.add(pavilion);
      
      const pavilionRoof = new THREE.Mesh(
        new THREE.ConeGeometry(12, 8, 4),
        makeMat({ color: 0x8b0000, roughness: 0.4 })
      );
      pavilionRoof.position.set(hx + side * 45, 29, hz + 10);
      pavilionRoof.rotation.y = Math.PI / 4;
      scene.add(pavilionRoof);
    }
    
    console.log('[DamingPalace] 含元殿精修完成');
  }
  
  // 精修太液池
  function refineTaiyePool() {
    if (typeof scene === 'undefined') return;
    
    console.log('[DamingPalace] 精修太液池...');
    
    const tx = DX + 80, tz = DZ - 80;
    
    // 湖面
    const lake = new THREE.Mesh(
      new THREE.CircleGeometry(60, 24),
      new THREE.MeshStandardMaterial({
        color: 0x4a7a9a,
        roughness: 0.2,
        metalness: 0.6,
        transparent: true,
        opacity: 0.85
      })
    );
    lake.position.set(tx, 0.1, tz);
    lake.rotation.x = -Math.PI / 2;
    scene.add(lake);
    
    // 池岸 — 汉白玉栏杆
    for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 1, 0.3),
        makeMat({ color: 0xf0f0f0, roughness: 0.6 })
      );
      post.position.set(
        tx + Math.cos(angle) * 60,
        0.5,
        tz + Math.sin(angle) * 60
      );
      scene.add(post);
    }
    
    // 蓬莱山 — 池中小岛
    const island = new THREE.Mesh(
      new THREE.ConeGeometry(15, 20, 8),
      makeMat({ color: 0x6a7a6a, roughness: 0.9 })
    );
    island.position.set(tx, 10, tz);
    island.castShadow = true;
    scene.add(island);
    
    // 岛上亭子
    const pavilion = new THREE.Mesh(
      new THREE.BoxGeometry(8, 6, 8),
      makeMat({ color: 0xd4a574, roughness: 0.7 })
    );
    pavilion.position.set(tx, 23, tz);
    pavilion.castShadow = true;
    scene.add(pavilion);
    
    const pavilionRoof = new THREE.Mesh(
      new THREE.ConeGeometry(7, 4, 4),
      makeMat({ color: 0x4a6670, roughness: 0.6 })
    );
    pavilionRoof.position.set(tx, 28, tz);
    pavilionRoof.rotation.y = Math.PI / 4;
    scene.add(pavilionRoof);
    
    console.log('[DamingPalace] 太液池精修完成');
  }
  
  // 精修御花园
  function refinePalaceGarden() {
    if (typeof scene === 'undefined') return;
    
    console.log('[DamingPalace] 精修御花园...');
    
    // 宫廷松树
    for (let i = 0; i < 15; i++) {
      const tree = new THREE.Group();
      
      // 树干
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.5, 6, 6),
        makeMat({ color: 0x6a5a4a, roughness: 0.9 })
      );
      trunk.position.y = 3;
      trunk.castShadow = true;
      tree.add(trunk);
      
      // 松针 — 多层
      for (let j = 0; j < 3; j++) {
        const foliage = new THREE.Mesh(
          new THREE.ConeGeometry(3 - j * 0.5, 2, 8),
          makeMat({ color: 0x2d5a3d, roughness: 0.85 })
        );
        foliage.position.y = 5 + j * 1.5;
        foliage.castShadow = true;
        tree.add(foliage);
      }
      
      tree.position.set(
        DX + (Math.random() - 0.5) * 150,
        0,
        DZ + (Math.random() - 0.5) * 150
      );
      
      scene.add(tree);
    }
    
    console.log('[DamingPalace] 御花园精修完成');
  }
  
  // 注册到统一生命周期
  if (typeof window.__enhance !== 'undefined') {
    window.__enhance.register('daming-palace', init, 20);
  } else if (typeof window.__enhancePending !== 'undefined') {
    window.__enhancePending.push({ owner: 'daming-palace', fn: init, priority: 20 });
  } else {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      init();
    } else {
      setTimeout(init, 2000);
    }
  }
})();
