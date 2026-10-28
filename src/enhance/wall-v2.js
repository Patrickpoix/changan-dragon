/* ============================================================
   城墙城门v2 — 雄伟长安城
   v2: 垛口、城楼、角楼、城门洞、城墙灯、守卫
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 3000);
      return;
    }
    
    console.log(['WallV2] 开始增强城墙城门...']);
    
    addCrenellations();        // 垛口
    addGateTower();             // 明德门城楼
    addCornerTowers();          // 四角角楼
    addWallLights();             // 城墙灯
    addGateGuards();             // 城门守卫
    
    console.log('[WallV2] ✓ 城墙城门增强完成');
  }
  
  // 垛口 — 城墙顶部锯齿状
  function addCrenellations() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WallV2] 添加垛口...');
    
    const brickMat = new THREE.MeshStandardMaterial({ color: 0xb89878, roughness: 0.9 });
    
    // 南城墙垛口
    for (let x = -600; x <= 600; x += 4) {
      const merlon = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 1),
        brickMat
      );
      merlon.position.set(x, 6.5, 550);
      merlon.castShadow = true;
      scene.add(merlon);
    }
    
    // 北城墙垛口
    for (let x = -600; x <= 600; x += 4) {
      const merlon = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 1),
        brickMat
      );
      merlon.position.set(x, 6.5, -550);
      merlon.castShadow = true;
      scene.add(merlon);
    }
    
    // 东城墙垛口
    for (let z = -550; z <= 550; z += 4) {
      const merlon = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 2),
        brickMat
      );
      merlon.position.set(620, 6.5, z);
      merlon.castShadow = true;
      scene.add(merlon);
    }
    
    // 西城墙垛口
    for (let z = -550; z <= 550; z += 4) {
      const merlon = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 2),
        brickMat
      );
      merlon.position.set(-620, 6.5, z);
      merlon.castShadow = true;
      scene.add(merlon);
    }
    
    console.log('[WallV2] 垛口添加完成');
  }
  
  // 明德门城楼 — 宏伟城门楼
  function addGateTower() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WallV2] 添加明德门城楼...');
    
    const gateX = 0, gateZ = 550;
    
    // 城楼基座
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(60, 8, 15),
      new THREE.MeshStandardMaterial({ color: 0xc8b89a, roughness: 0.85 })
    );
    base.position.set(gateX, 4, gateZ);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    
    // 城门洞 — 拱形（简化为深色开口）
    const gateOpening = new THREE.Mesh(
      new THREE.BoxGeometry(15, 6, 16),
      new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 })
    );
    gateOpening.position.set(gateX, 3, gateZ);
    scene.add(gateOpening);
    
    // 城楼主体
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(40, 12, 20),
      new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
    );
    tower.position.set(gateX, 14, gateZ);
    tower.castShadow = true;
    scene.add(tower);
    
    // 城楼屋顶 — 重檐歇山顶
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(28, 8, 4),
      new THREE.MeshStandardMaterial({ color: 0x4a6670, roughness: 0.6 })
    );
    roof.position.set(gateX, 24, gateZ);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
    
    // 二层屋檐
    const eave = new THREE.Mesh(
      new THREE.BoxGeometry(45, 1, 25),
      new THREE.MeshStandardMaterial({ color: 0x5a7a8a, roughness: 0.6 })
    );
    eave.position.set(gateX, 19, gateZ);
    eave.castShadow = true;
    scene.add(eave);
    
    // 城楼牌匾
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(10, 3, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.6 })
    );
    sign.position.set(gateX, 16, gateZ + 10.2);
    scene.add(sign);
    
    // 金色字
    const text = new THREE.Mesh(
      new THREE.BoxGeometry(8, 2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7 })
    );
    text.position.set(gateX, 16, gateZ + 10.4);
    scene.add(text);
    
    console.log('[WallV2] 明德门城楼添加完成');
  }
  
  // 四角角楼
  function addCornerTowers() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WallV2] 添加四角角楼...');
    
    const corners = [
      { x: -620, z: -550 },
      { x: 620, z: -550 },
      { x: -620, z: 550 },
      { x: 620, z: 550 },
    ];
    
    corners.forEach(corner => {
      // 角楼基座
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(15, 7, 15),
        new THREE.MeshStandardMaterial({ color: 0xc8b89a, roughness: 0.85 })
      );
      base.position.set(corner.x, 3.5, corner.z);
      base.castShadow = true;
      scene.add(base);
      
      // 角楼
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(10, 6, 10),
        new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
      );
      tower.position.set(corner.x, 10, corner.z);
      tower.castShadow = true;
      scene.add(tower);
      
      // 角楼屋顶
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(8, 4, 4),
        new THREE.MeshStandardMaterial({ color: 0x4a6670, roughness: 0.6 })
      );
      roof.position.set(corner.x, 15, corner.z);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      scene.add(roof);
    });
    
    console.log('[WallV2] 四角角楼添加完成');
  }
  
  // 城墙灯 — 城墙上的灯笼
  function addWallLights() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WallV2] 添加城墙灯...');
    
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xff4422,
      emissive: 0xff2200,
      emissiveIntensity: 0.8,
      roughness: 0.5
    });
    
    // 南城墙灯笼
    for (let x = -600; x <= 600; x += 50) {
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 6, 4),
        lanternMat
      );
      lantern.position.set(x, 7.5, 550);
      lantern.scale.y = 1.3;
      scene.add(lantern);
    }
    
    // 北城墙灯笼
    for (let x = -600; x <= 600; x += 50) {
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 6, 4),
        lanternMat
      );
      lantern.position.set(x, 7.5, -550);
      lantern.scale.y = 1.3;
      scene.add(lantern);
    }
    
    console.log('[WallV2] 城墙灯添加完成');
  }
  
  // 城门守卫 — 明德门士兵
  function addGateGuards() {
    if (typeof scene === 'undefined') return;
    
    console.log('[WallV2] 添加城门守卫...');
    
    const armorMat = new THREE.MeshStandardMaterial({ 
      color: 0x4a5a6a, 
      roughness: 0.5,
      metalness: 0.6
    });
    
    // 8个守卫
    for (let i = 0; i < 8; i++) {
      const group = new THREE.Group();
      
      // 身体
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.3, 1.0, 6),
        armorMat
      );
      body.position.y = 0.9;
      body.castShadow = true;
      group.add(body);
      
      // 头
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 6, 5),
        new THREE.MeshStandardMaterial({ color: 0xd8a888, roughness: 0.7 })
      );
      head.position.y = 1.55;
      group.add(head);
      
      // 头盔
      const helmet = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.15, 0.15, 6),
        new THREE.MeshStandardMaterial({ color: 0x3a4a5a, metalness: 0.7 })
      );
      helmet.position.y = 1.65;
      group.add(helmet);
      
      // 长矛
      const spear = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.8, 4),
        new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.8 })
      );
      spear.position.set(0.3, 1.2, 0);
      group.add(spear);
      
      group.position.set(
        -20 + i * 6,
        0,
        540
      );
      group.rotation.y = Math.PI;
      
      scene.add(group);
    }
    
    console.log('[WallV2] 城门守卫添加完成，共8个');
  }
  
  init();
})();
