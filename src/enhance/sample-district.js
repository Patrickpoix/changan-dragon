/* ============================================================
   明德门—朱雀大街样板区精修
   High-quality model district: Mingde Gate & Zhuque Avenue
   v1: 精细唐式建筑、PBR材质、真实街景、高质量人物
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    console.log(['SampleDistrict] 开始精修明德门—朱雀大街样板区...']);
    
    refineMingdeGate();
    refineZhuqueAvenue();
    refineShopFronts();
    refineNPCs();
    refineStreetProps();
    
    console.log('[SampleDistrict] ✓ 样板区精修完成');
  }
  
  // 精细材质工厂
  function makeMaterial(options) {
    return new THREE.MeshStandardMaterial(Object.assign({
      roughness: 0.7,
      metalness: 0.1
    }, options));
  }
  
  // 唐式建筑组件库
  function makeDougong(x, y, z, scale) {
    const group = new THREE.Group();
    scale = scale || 1;
    
    // 斗拱层 — 三层结构
    for (let i = 0; i < 3; i++) {
      const layer = new THREE.Mesh(
        new THREE.BoxGeometry(2 * scale - i * 0.3, 0.3 * scale, 0.8 * scale),
        makeMaterial({ color: i === 0 ? 0xd4a574 : 0x8b4513, roughness: 0.6 })
      );
      layer.position.y = i * 0.4 * scale;
      layer.castShadow = true;
      group.add(layer);
    }
    
    group.position.set(x, y, z);
    return group;
  }
  
  function makeTileRoof(width, depth, height) {
    const group = new THREE.Group();
    
    // 屋顶基底 — 歇山顶
    const baseGeo = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, height, 4);
    const roofMat = makeMaterial({ 
      color: 0x4a6670, 
      roughness: 0.5,
      metalness: 0.3
    });
    
    const roof = new THREE.Mesh(baseGeo, roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    
    // 屋脊
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.5, 0.2, 0.3),
      makeMaterial({ color: 0x3a5560, roughness: 0.5 })
    );
    ridge.position.y = height / 2 - 0.1;
    group.add(ridge);
    
    // 鸱吻 — 两端装饰
    for (const side of [-1, 1]) {
      const chiwen = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 6, 5),
        makeMaterial({ color: 0x3a5560, roughness: 0.4 })
      );
      chiwen.position.set(side * width * 0.25, height / 2, 0);
      group.add(chiwen);
    }
    
    return group;
  }
  
  function makeColumn(x, y, z, height) {
    const group = new THREE.Group();
    
    // 柱身
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, height, 8),
      makeMaterial({ color: 0x8b0000, roughness: 0.5, metalness: 0.2 })
    );
    shaft.position.y = height / 2;
    shaft.castShadow = true;
    group.add(shaft);
    
    // 柱础
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.4, 0.2, 8),
      makeMaterial({ color: 0xd4c4a8, roughness: 0.8 })
    );
    base.position.y = 0.1;
    group.add(base);
    
    // 柱头
    const capital = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.15, 0.4),
      makeMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 })
    );
    capital.position.y = height + 0.075;
    group.add(capital);
    
    group.position.set(x, y, z);
    return group;
  }
  
  function makeWindow(x, y, z, width, height) {
    const group = new THREE.Group();
    
    // 窗框
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.1),
      makeMaterial({ color: 0x6b3410, roughness: 0.7 })
    );
    group.add(frame);
    
    // 窗纸
    const paper = new THREE.Mesh(
      new THREE.PlaneGeometry(width - 0.1, height - 0.1),
      new THREE.MeshStandardMaterial({
        color: 0xfff8dc,
        emissive: 0xffeecc,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.9,
        roughness: 0.9
      })
    );
    paper.position.z = 0.06;
    group.add(paper);
    
    // 窗格 — 十字格
    const barMat = makeMaterial({ color: 0x6b3410, roughness: 0.7 });
    
    const vbar = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, height - 0.1, 0.05),
      barMat
    );
    vbar.position.z = 0.08;
    group.add(vbar);
    
    const hbar = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.1, 0.05, 0.05),
      barMat
    );
    hbar.position.z = 0.08;
    group.add(hbar);
    
    group.position.set(x, y, z);
    return group;
  }
  
  // 精修明德门
  function refineMingdeGate() {
    if (typeof scene === 'undefined') return;
    
    console.log('[SampleDistrict] 精修明德门...');
    
    const gx = 0, gz = 550;
    
    // 基座 — 汉白玉石台基
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(80, 10, 25),
      makeMaterial({ color: 0xf0f0f0, roughness: 0.6 })
    );
    base.position.set(gx, 5, gz);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    
    // 台阶
    for (let i = 0; i < 5; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(20 - i * 2, 0.5, 1),
        makeMaterial({ color: 0xe8e8e8, roughness: 0.7 })
      );
      step.position.set(gx, i * 0.5 + 0.25, gz + 12 + i);
      step.receiveShadow = true;
      scene.add(step);
    }
    
    // 城楼主体
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(60, 15, 20),
      makeMaterial({ color: 0xd4a574, roughness: 0.6 })
    );
    tower.position.set(gx, 17.5, gz);
    tower.castShadow = true;
    scene.add(tower);
    
    // 城楼柱子 — 朱红立柱
    for (let i = -4; i <= 4; i++) {
      const col = makeColumn(gx + i * 6, 10, gz + 10, 15);
      scene.add(col);
    }
    
    // 斗拱层
    for (let i = -5; i <= 5; i++) {
      const dg = makeDougong(gx + i * 5, 25, gz + 10, 1.2);
      scene.add(dg);
    }
    
    // 重檐歇山顶
    const roof = makeTileRoof(70, 28, 8);
    roof.position.set(gx, 30, gz);
    scene.add(roof);
    
    // 二层屋檐
    const eave = new THREE.Mesh(
      new THREE.BoxGeometry(65, 1, 23),
      makeMaterial({ color: 0x4a6670, roughness: 0.5 })
    );
    eave.position.set(gx, 23, gz);
    eave.castShadow = true;
    scene.add(eave);
    
    // 城门洞 — 拱形门洞（深色）
    const gateOpening = new THREE.Mesh(
      new THREE.BoxGeometry(18, 12, 2),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 })
    );
    gateOpening.position.set(gx, 6, gz + 12.6);
    scene.add(gateOpening);
    
    // 牌匾
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(12, 4, 0.3),
      makeMaterial({ color: 0x8b0000, roughness: 0.5 })
    );
    sign.position.set(gx, 20, gz + 10.3);
    scene.add(sign);
    
    // 金色字
    const text = new THREE.Mesh(
      new THREE.BoxGeometry(10, 3, 0.1),
      makeMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 })
    );
    text.position.set(gx, 20, gz + 10.5);
    scene.add(text);
    
    console.log('[SampleDistrict] 明德门精修完成');
  }
  
  // 精修朱雀大街
  function refineZhuqueAvenue() {
    if (typeof scene === 'undefined') return;
    
    console.log('[SampleDistrict] 精修朱雀大街...');
    
    // 石板路面 — 更精细的纹理
    const roadMat = makeMaterial({ 
      color: 0xb8a88a, 
      roughness: 0.85,
      metalness: 0.05
    });
    
    // 主路面
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 1000),
      roadMat
    );
    road.position.set(0, 0.02, 0);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    scene.add(road);
    
    // 石板拼接缝 — 用网格线模拟
    for (let z = -480; z < 500; z += 8) {
      const seam = new THREE.Mesh(
        new THREE.BoxGeometry(40, 0.01, 0.1),
        makeMaterial({ color: 0x9a8a6a, roughness: 0.9 })
      );
      seam.position.set(0, 0.03, z);
      scene.add(seam);
    }
    
    // 两侧人行道
    for (const side of [-1, 1]) {
      const sidewalk = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 1000),
        makeMaterial({ color: 0xc8b89a, roughness: 0.85 })
      );
      sidewalk.position.set(side * 23, 0.03, 0);
      sidewalk.rotation.x = -Math.PI / 2;
      sidewalk.receiveShadow = true;
      scene.add(sidewalk);
    }
    
    // 排水沟
    for (const side of [-1, 1]) {
      const ditch = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.3, 1000),
        makeMaterial({ color: 0x5a5a5a, roughness: 0.9 })
      );
      ditch.position.set(side * 20, 0.15, 0);
      scene.add(ditch);
    }
    
    console.log('[SampleDistrict] 朱雀大街精修完成');
  }
  
  // 精修店铺门面
  function refineShopFronts() {
    if (typeof scene === 'undefined') return;
    
    console.log('[SampleDistrict] 精修店铺门面...');
    
    // 朱雀大街东侧店铺
    for (let i = 0; i < 8; i++) {
      const sx = 30;
      const sz = 400 - i * 50;
      
      // 店铺主体
      const shop = new THREE.Mesh(
        new THREE.BoxGeometry(12, 6, 8),
        makeMaterial({ color: 0xd4a574, roughness: 0.7 })
      );
      shop.position.set(sx, 3, sz);
      shop.castShadow = true;
      scene.add(shop);
      
      // 屋顶
      const roof = makeTileRoof(14, 10, 3);
      roof.position.set(sx, 6, sz);
      scene.add(roof);
      
      // 格扇门窗
      const window = makeWindow(sx - 6, 3, sz, 3, 2.5);
      window.rotation.y = -Math.PI / 2;
      scene.add(window);
      
      // 招牌
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(4, 1.5, 0.2),
        makeMaterial({ color: 0x8b0000, roughness: 0.5 })
      );
      sign.position.set(sx - 6.1, 5, sz);
      sign.rotation.y = -Math.PI / 2;
      scene.add(sign);
    }
    
    console.log('[SampleDistrict] 店铺门面精修完成');
  }
  
  // 精修NPC
  function refineNPCs() {
    if (typeof scene === 'undefined') return;
    
    console.log('[SampleDistrict] 精修NPC...');
    
    // 唐代书生
    const scholar = new THREE.Group();
    
    // 长袍
    const robe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8),
      makeMaterial({ color: 0x4a6fa5, roughness: 0.8 })
    );
    robe.position.y = 0.9;
    robe.castShadow = true;
    scholar.add(robe);
    
    // 头部
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 6),
      makeMaterial({ color: 0xe8b89a, roughness: 0.7 })
    );
    head.position.y = 1.65;
    scholar.add(head);
    
    // 头巾
    const hat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.1, 8),
      makeMaterial({ color: 0x2a2a2a, roughness: 0.8 })
    );
    hat.position.y = 1.78;
    scholar.add(hat);
    
    scholar.position.set(10, 0, 300);
    scene.add(scholar);
    
    // 唐代仕女
    const lady = new THREE.Group();
    
    const dress = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.45, 1.1, 8),
      makeMaterial({ color: 0xc0392b, roughness: 0.7 })
    );
    dress.position.y = 0.85;
    dress.castShadow = true;
    lady.add(dress);
    
    const ladyHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 6),
      makeMaterial({ color: 0xf0c8a8, roughness: 0.7 })
    );
    ladyHead.position.y = 1.55;
    lady.add(ladyHead);
    
    // 发髻
    const bun = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 5),
      makeMaterial({ color: 0x1a1a1a, roughness: 0.6 })
    );
    bun.position.set(0, 1.7, -0.05);
    lady.add(bun);
    
    lady.position.set(-10, 0, 250);
    scene.add(lady);
    
    console.log('[SampleDistrict] NPC精修完成');
  }
  
  // 精修街道道具
  function refineStreetProps() {
    if (typeof scene === 'undefined') return;
    
    console.log('[SampleDistrict] 精修街道道具...');
    
    // 沿街灯笼 — 更精细
    for (let i = 0; i < 20; i++) {
      const z = 400 - i * 40;
      
      for (const side of [-1, 1]) {
        // 灯杆
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.1, 4, 6),
          makeMaterial({ color: 0x3a2a1a, roughness: 0.8 })
        );
        pole.position.set(side * 25, 2, z);
        pole.castShadow = true;
        scene.add(pole);
        
        // 灯笼
        const lantern = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 8, 6),
          new THREE.MeshStandardMaterial({
            color: 0xff4422,
            emissive: 0xff2200,
            emissiveIntensity: 1.0,
            roughness: 0.5
          })
        );
        lantern.position.set(side * 25, 4.3, z);
        lantern.scale.y = 1.3;
        scene.add(lantern);
        
        // 流苏
        const tassel = new THREE.Mesh(
          new THREE.ConeGeometry(0.08, 0.25, 4),
          makeMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.4 })
        );
        tassel.position.set(side * 25, 3.8, z);
        scene.add(tassel);
      }
    }
    
    console.log('[SampleDistrict] 街道道具精修完成');
  }
  
  // 注册到统一生命周期
  if (typeof window.__enhance !== 'undefined') {
    window.__enhance.register('sample-district', init, 10);
  } else if (typeof window.__enhancePending !== 'undefined') {
    window.__enhancePending.push({ owner: 'sample-district', fn: init, priority: 10 });
  } else {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      init();
    } else {
      setTimeout(init, 2000);
    }
  }
})();
