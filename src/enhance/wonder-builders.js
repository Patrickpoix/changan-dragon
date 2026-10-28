/* ============================================================
   仙侠魔幻奇观建筑
   v1.0: 悬空寺、云中楼阁、摘星楼、浮空仙山
   ============================================================ */

(function() {
  if (typeof GAME === 'undefined' || !GAME.ready) {
    setTimeout(arguments.callee, 500);
    return;
  }

  console.log('[WonderBuilders] 仙侠魔幻奇观建筑加载中...');

  // 奇观建筑数据
  const wonders = [
    {
      id: 'xuankong-si',
      name: '悬空寺',
      x: -500,
      z: -600,
      height: 60,
      color: 0x8b9dc3,
      description: '悬挂于悬崖峭壁之上的仙境寺庙'
    },
    {
      id: 'yunzhong-louge',
      name: '云中楼阁',
      x: 500,
      z: -550,
      height: 80,
      color: 0xb4a7d6,
      description: '漂浮于云海之中的仙家楼阁'
    },
    {
      id: 'zhaixing-lou',
      name: '摘星楼',
      x: 0,
      z: -700,
      height: 120,
      color: 0xd4af37,
      description: '高耸入云，手可摘星辰的通天楼阁'
    },
    {
      id: 'fukong-xianshan',
      name: '浮空仙山',
      x: 0,
      z: 650,
      height: 50,
      color: 0x7ec8a0,
      description: '漂浮于半空的仙山，上有琼楼玉宇'
    },
  ];

  // 创建悬空寺
  function createXuankongSi(x, z, height) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // 悬崖背景
    const cliffMat = new THREE.MeshStandardMaterial({
      color: 0x6b6b6b,
      roughness: 0.9,
      metalness: 0.1,
    });
    const cliff = new THREE.Mesh(new THREE.BoxGeometry(80, height * 2, 30), cliffMat);
    cliff.position.set(0, height, 0);
    cliff.castShadow = true;
    cliff.receiveShadow = true;
    group.add(cliff);

    // 寺庙主体
    const templeMat = new THREE.MeshStandardMaterial({
      color: 0xc4a882,
      roughness: 0.7,
      metalness: 0.1,
    });
    
    for (let i = 0; i < 5; i++) {
      const floorY = height - 10 - i * 15;
      const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 12), templeMat);
      floor.position.set(15, floorY, 0);
      floor.castShadow = true;
      group.add(floor);

      // 屋顶
      const roofMat = new THREE.MeshStandardMaterial({
        color: 0x4a6670,
        roughness: 0.6,
        metalness: 0.2,
      });
      const roof = new THREE.Mesh(new THREE.ConeGeometry(14, 6, 4), roofMat);
      roof.position.set(15, floorY + 7, 0);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);

      // 支撑柱
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.8,
      });
      for (const side of [-1, 1]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 15, 8), pillarMat);
        pillar.position.set(15 + side * 8, floorY - 7, 5);
        pillar.castShadow = true;
        group.add(pillar);
      }
    }

    scene.add(group);
    console.log('[WonderBuilders] 悬空寺创建完成:', x, z);
  }

  // 创建云中楼阁
  function createYunzhongLouge(x, z, height) {
    const group = new THREE.Group();
    group.position.set(x, height, z);

    // 云海底座
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      transparent: true,
      opacity: 0.8,
    });
    
    for (let i = 0; i < 10; i++) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(8 + Math.random() * 5, 16, 12), cloudMat);
      cloud.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 40
      );
      group.add(cloud);
    }

    // 楼阁主体
    const pavilionMat = new THREE.MeshStandardMaterial({
      color: 0xd4c5a0,
      roughness: 0.6,
      metalness: 0.2,
    });

    for (let i = 0; i < 6; i++) {
      const floorY = i * 12;
      const size = 20 - i * 2;
      
      const floor = new THREE.Mesh(new THREE.BoxGeometry(size, 6, size), pavilionMat);
      floor.position.y = floorY + 3;
      floor.castShadow = true;
      group.add(floor);

      // 金色屋顶
      const roofMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.3,
        metalness: 0.8,
      });
      const roof = new THREE.Mesh(new THREE.ConeGeometry(size * 0.7, 5, 4), roofMat);
      roof.position.y = floorY + 8.5;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);
    }

    // 底部悬浮效果
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(15, 16, 12), glowMat);
    glow.position.y = -5;
    group.add(glow);

    scene.add(group);
    console.log('[WonderBuilders] 云中楼阁创建完成:', x, z);
  }

  // 创建摘星楼
  function createZhaixingLou(x, z, height) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // 底座
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.8,
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(40, 10, 40), baseMat);
    base.position.y = 5;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // 塔身
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xc4a882,
      roughness: 0.7,
      metalness: 0.1,
    });

    for (let i = 0; i < 10; i++) {
      const floorY = 10 + i * 10;
      const size = 30 - i * 2.5;
      
      const floor = new THREE.Mesh(new THREE.BoxGeometry(size, 8, size), towerMat);
      floor.position.y = floorY;
      floor.castShadow = true;
      group.add(floor);

      // 金色飞檐
      const eaveMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.3,
        metalness: 0.8,
      });
      const eave = new THREE.Mesh(new THREE.BoxGeometry(size + 4, 1, size + 4), eaveMat);
      eave.position.y = floorY + 4.5;
      eave.castShadow = true;
      group.add(eave);
    }

    // 顶部宝珠
    const pearlMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0xffff00,
      emissiveIntensity: 0.5,
    });
    const pearl = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 12), pearlMat);
    pearl.position.y = 115;
    group.add(pearl);

    scene.add(group);
    console.log('[WonderBuilders] 摘星楼创建完成:', x, z);
  }

  // 创建浮空仙山
  function createFukongXianshan(x, z, height) {
    const group = new THREE.Group();
    group.position.set(x, height, z);

    // 山体
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x7ec8a0,
      roughness: 0.9,
    });
    const mountain = new THREE.Mesh(new THREE.ConeGeometry(30, 40, 8), mountainMat);
    mountain.castShadow = true;
    group.add(mountain);

    // 山上的亭子
    const pavilionMat = new THREE.MeshStandardMaterial({
      color: 0xd4c5a0,
      roughness: 0.6,
    });
    const pavilion = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 8), pavilionMat);
    pavilion.position.y = 22;
    pavilion.castShadow = true;
    group.add(pavilion);

    // 屋顶
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x4a6670,
      roughness: 0.6,
    });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(7, 4, 4), roofMat);
    roof.position.y = 26.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // 底部悬浮光环
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x98fb98,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(new THREE.TorusGeometry(20, 2, 8, 32), glowMat);
    glow.position.y = -15;
    glow.rotation.x = Math.PI / 2;
    group.add(glow);

    scene.add(group);
    console.log('[WonderBuilders] 浮空仙山创建完成:', x, z);
  }

  // 初始化所有奇观建筑
  function initWonders() {
    wonders.forEach(wonder => {
      switch (wonder.id) {
        case 'xuankong-si':
          createXuankongSi(wonder.x, wonder.z, wonder.height);
          break;
        case 'yunzhong-louge':
          createYunzhongLouge(wonder.x, wonder.z, wonder.height);
          break;
        case 'zhaixing-lou':
          createZhaixingLou(wonder.x, wonder.z, wonder.height);
          break;
        case 'fukong-xianshan':
          createFukongXianshan(wonder.x, wonder.z, wonder.height);
          break;
      }
    });
    console.log('[WonderBuilders] 所有仙侠魔幻奇观建筑加载完成！');
  }

  // 延迟初始化
  setTimeout(initWonders, 2000);

  // 导出到全局
  window.WonderBuilders = {
    wonders,
    initWonders,
  };

  console.log('[WonderBuilders] 模块加载完成');
})();
