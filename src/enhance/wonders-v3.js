/* ============================================================
   仙侠奇观建筑群v3 — 超现实盛唐气象
   v3: 悬空寺、彩虹天桥、仙山楼阁、龙宫水府、凤凰台、雷峰塔、摘星楼
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 2000);
      return;
    }
    
    console.log(['WondersV3] 开始建造仙侠奇观v3...']);
    
    buildHangingTemple();      // 悬空寺 — 悬崖上的寺庙
    buildRainbowBridge();       // 彩虹天桥 — 空中虹桥
    buildStarTower();           // 摘星楼 — 最高楼
    buildDragonPalace();        // 龙宫水府 — 曲江池下
    buildPhoenixPlatform();     // 凤凰台 — 明德门外
    buildFloatingIslands();      // 悬浮仙岛群
    
    console.log('[WondersV3] ✓ 仙侠奇观v3完成');
  }
  
  // 悬空寺 — 建在悬崖上的寺庙群
  function buildHangingTemple() {
    const group = new THREE.Group();
    group.position.set(-600, 50, -400);
    
    // 悬崖 — 巨大岩壁
    const cliffMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.95 });
    const cliff = new THREE.Mesh(
      new THREE.CylinderGeometry(80, 120, 200, 8),
      cliffMat
    );
    cliff.position.y = 50;
    cliff.castShadow = true;
    cliff.receiveShadow = true;
    group.add(cliff);
    
    // 悬空寺庙 — 挂在崖壁上
    for (let i = 0; i < 5; i++) {
      const y = 30 + i * 25;
      const angle = i * 0.5;
      
      // 小殿
      const hall = new THREE.Mesh(
        new THREE.BoxGeometry(15, 8, 10),
        new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
      );
      hall.position.set(
        Math.cos(angle) * 70,
        y,
        Math.sin(angle) * 70
      );
      hall.rotation.y = -angle;
      hall.castShadow = true;
      group.add(hall);
      
      // 屋顶
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(10, 5, 4),
        new THREE.MeshStandardMaterial({ color: 0x5a6a6a, roughness: 0.6 })
      );
      roof.position.copy(hall.position);
      roof.position.y += 6.5;
      roof.rotation.y = Math.PI / 4 - angle;
      group.add(roof);
      
      // 支撑木柱
      for (let j = 0; j < 2; j++) {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 15, 6),
          new THREE.MeshStandardMaterial({ color: 0x6b3410, roughness: 0.8 })
        );
        pillar.position.set(
          hall.position.x + (j - 0.5) * 10,
          y - 7.5,
          hall.position.z + 3
        );
        pillar.rotation.z = (j - 0.5) * 0.2;
        group.add(pillar);
      }
    }
    
    scene.add(group);
    console.log('[WondersV3] 悬空寺已建成');
  }
  
  // 彩虹天桥 — 空中拱形彩虹桥
  function buildRainbowBridge() {
    const bx = 0, bz = -200;
    
    // 彩虹桥曲线
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-150, 20, bz),
      new THREE.Vector3(-75, 60, bz),
      new THREE.Vector3(0, 80, bz),
      new THREE.Vector3(75, 60, bz),
      new THREE.Vector3(150, 20, bz)
    ]);
    
    // 七彩光带
    const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
    
    colors.forEach((color, i) => {
      const offset = (i - 3) * 2;
      const offsetCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-150, 20 + offset, bz + offset),
        new THREE.Vector3(-75, 60 + offset, bz + offset),
        new THREE.Vector3(0, 80 + offset, bz + offset),
        new THREE.Vector3(75, 60 + offset, bz + offset),
        new THREE.Vector3(150, 20 + offset, bz + offset)
      ]);
      
      const tubeGeo = new THREE.TubeGeometry(offsetCurve, 32, 0.8, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);
    });
    
    // 桥面 — 实际可走的桥
    const deckGeo = new THREE.TubeGeometry(curve, 32, 5, 8, false);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0xd4c4a8,
      roughness: 0.8
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.castShadow = true;
    deck.receiveShadow = true;
    scene.add(deck);
    
    console.log('[WondersV3] 彩虹天桥已建成');
  }
  
  // 摘星楼 — 全城最高建筑
  function buildStarTower() {
    const sx = 0, sz = -100;
    
    // 基座
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(40, 50, 5, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.8 })
    );
    base.position.set(sx, 2.5, sz);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    
    // 9层塔楼
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const layerH = 10 - t * 3;
      const layerW = 30 - t * 15;
      
      // 楼体
      const layer = new THREE.Mesh(
        new THREE.BoxGeometry(layerW, layerH, layerW),
        new THREE.MeshStandardMaterial({ 
          color: 0xd4a574,
          roughness: 0.7,
          emissive: i % 2 ? 0x221100 : 0x000000,
          emissiveIntensity: 0.2
        })
      );
      layer.position.set(sx, 5 + i * 10 + layerH / 2, sz);
      layer.castShadow = true;
      scene.add(layer);
      
      // 屋檐
      const eave = new THREE.Mesh(
        new THREE.BoxGeometry(layerW + 5, 1, layerW + 5),
        new THREE.MeshStandardMaterial({ color: 0x5a6a6a, roughness: 0.6 })
      );
      eave.position.set(sx, 5 + i * 10 + layerH, sz);
      eave.castShadow = true;
      scene.add(eave);
      
      // 每层灯笼
      for (const side of [-1, 1]) {
        const lantern = new THREE.Mesh(
          new THREE.SphereGeometry(0.6, 6, 4),
          new THREE.MeshStandardMaterial({
            color: 0xff6644,
            emissive: 0xff4422,
            emissiveIntensity: 0.8
          })
        );
        lantern.position.set(sx + side * layerW / 2, 5 + i * 10 + layerH / 2, sz);
        scene.add(lantern);
      }
    }
    
    // 金色塔刹
    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(8, 30, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xffaa00,
        emissiveIntensity: 0.4
      })
    );
    spire.position.set(sx, 5 + 9 * 10 + 15, sz);
    spire.castShadow = true;
    scene.add(spire);
    
    // 塔顶灯光
    const topLight = new THREE.PointLight(0xffd700, 2, 100);
    topLight.position.set(sx, 120, sz);
    scene.add(topLight);
    
    console.log('[WondersV3] 摘星楼已建成');
  }
  
  // 龙宫水府 — 曲江池水下宫殿
  function buildDragonPalace() {
    const group = new THREE.Group();
    group.position.set(520, -10, 470);
    
    // 水下宫殿 — 半透明
    const palaceMat = new THREE.MeshStandardMaterial({
      color: 0x1a4a6a,
      transparent: true,
      opacity: 0.7,
      roughness: 0.3,
      metalness: 0.5,
      emissive: 0x004466,
      emissiveIntensity: 0.3
    });
    
    // 主殿
    const mainHall = new THREE.Mesh(
      new THREE.BoxGeometry(40, 15, 30),
      palaceMat
    );
    mainHall.position.y = 5;
    group.add(mainHall);
    
    // 屋顶
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(25, 10, 4),
      palaceMat
    );
    roof.position.y = 17.5;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);
    
    // 珊瑚装饰
    const coralColors = [0xff6b9d, 0x4ecdc4, 0xffe66d, 0xff6b6b];
    for (let i = 0; i < 12; i++) {
      const coral = new THREE.Mesh(
        new THREE.ConeGeometry(1 + Math.random() * 2, 5 + Math.random() * 5, 6),
        new THREE.MeshStandardMaterial({
          color: coralColors[i % coralColors.length],
          roughness: 0.8,
          emissive: coralColors[i % coralColors.length],
          emissiveIntensity: 0.1
        })
      );
      coral.position.set(
        (Math.random() - 0.5) * 60,
        0,
        (Math.random() - 0.5) * 50
      );
      group.add(coral);
    }
    
    // 珍珠光
    const pearl = new THREE.Mesh(
      new THREE.SphereGeometry(3, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xffe4b5 })
    );
    pearl.position.y = 10;
    group.add(pearl);
    
    // 水下光源
    const light = new THREE.PointLight(0x44aaff, 1.5, 80);
    light.position.set(0, 10, 0);
    group.add(light);
    
    scene.add(group);
    console.log('[WondersV3] 龙宫水府已建成');
  }
  
  // 凤凰台 — 明德门外的金色凤凰雕塑
  function buildPhoenixPlatform() {
    const group = new THREE.Group();
    group.position.set(0, 0, 750);
    
    // 高台
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(25, 30, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.8 })
    );
    platform.position.y = 4;
    platform.castShadow = true;
    platform.receiveShadow = true;
    group.add(platform);
    
    // 凤凰身体
    const body = new THREE.Mesh(
      new THREE.ConeGeometry(4, 10, 6),
      new THREE.MeshStandardMaterial({
        color: 0xff4500,
        metalness: 0.6,
        roughness: 0.3,
        emissive: 0xff2200,
        emissiveIntensity: 0.3
      })
    );
    body.position.y = 18;
    group.add(body);
    
    // 展开的翅膀
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(20, 0.5, 6),
        new THREE.MeshStandardMaterial({
          color: 0xff6347,
          metalness: 0.5,
          roughness: 0.4,
          emissive: 0xff4400,
          emissiveIntensity: 0.2
        })
      );
      wing.position.set(side * 12, 20, 0);
      wing.rotation.z = side * 0.4;
      group.add(wing);
    }
    
    // 金色尾羽
    for (let i = -3; i <= 3; i++) {
      const tail = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 10, 4),
        new THREE.MeshStandardMaterial({
          color: 0xffd700,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0xffaa00,
          emissiveIntensity: 0.3
        })
      );
      tail.position.set(i * 1.5, 15, -4);
      tail.rotation.x = Math.PI / 4;
      group.add(tail);
    }
    
    // 凤凰光源
    const light = new THREE.PointLight(0xff6600, 2, 80);
    light.position.set(0, 20, 0);
    group.add(light);
    
    scene.add(group);
    console.log('[WondersV3] 凤凰台已建成');
  }
  
  // 悬浮仙岛群 — 空中漂浮的小岛
  function buildFloatingIslands() {
    const islands = [
      { x: -400, y: 100, z: -500, size: 30 },
      { x: 500, y: 120, z: -400, size: 25 },
      { x: -300, y: 150, z: 300, size: 20 },
      { x: 400, y: 90, z: 400, size: 35 },
      { x: 0, y: 180, z: -600, size: 40 },
    ];
    
    islands.forEach((island, i) => {
      const group = new THREE.Group();
      group.position.set(island.x, island.y, island.z);
      
      // 岛体 — 倒锥形
      const rock = new THREE.Mesh(
        new THREE.ConeGeometry(island.size, island.size * 2, 6),
        new THREE.MeshStandardMaterial({ color: 0x6a7a6a, roughness: 0.9 })
      );
      rock.rotation.x = Math.PI; // 倒过来
      rock.castShadow = true;
      group.add(rock);
      
      // 岛上植被
      const tree = new THREE.Mesh(
        new THREE.SphereGeometry(island.size * 0.6, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0x4a7a4a, roughness: 0.85 })
      );
      tree.position.y = island.size;
      tree.castShadow = true;
      group.add(tree);
      
      // 小亭子
      if (i % 2 === 0) {
        const pavilion = new THREE.Mesh(
          new THREE.BoxGeometry(5, 4, 5),
          new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
        );
        pavilion.position.y = island.size + 3;
        group.add(pavilion);
        
        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(4, 3, 4),
          new THREE.MeshStandardMaterial({ color: 0x5a6a6a, roughness: 0.6 })
        );
        roof.position.y = island.size + 6.5;
        roof.rotation.y = Math.PI / 4;
        group.add(roof);
      }
      
      scene.add(group);
    });
    
    console.log('[WondersV3] 悬浮仙岛群已建成，共5座');
  }
  
  init();
})();
