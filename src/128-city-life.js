/* ============================================================
   长安城市生活 · 真实街景
   行人/商贩/马车/骆驼商队
   ============================================================ */

class ChangAnCityLife {
  // 行人（朱雀大街）
  pedestrians() {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.8 });
    // 朱雀大街行人（每隔20m一个）
    for (let z = -300; z <= 300; z += 25) {
      for (let side = -1; side <= 1; side += 2) {
        const person = new THREE.Group();
        // 身体
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.2, 6), bodyMat);
        body.position.y = 0.8;
        person.add(body);
        // 头
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 4), headMat);
        head.position.y = 1.6;
        person.add(head);
        // 位置
        person.position.set(side * 5 + (Math.random() - 0.5) * 3, 0, -z);
        person.rotation.y = Math.random() * Math.PI * 2;
        scene.add(person);
      }
    }
  },

  // 商贩摊位（东西市）
  marketStalls() {
    const stallMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.9 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0xaa4444, roughness: 0.8 });
    // 东市摊位
    for (let i = -4; i <= 4; i++) {
      const stall = new THREE.Group();
      // 货架
      const counter = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 1), stallMat);
      counter.position.y = 0.5;
      stall.add(counter);
      // 布篷
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 1.5), clothMat);
      canopy.position.y = 1.8;
      stall.add(canopy);
      // 柱子
      for (let px = -1; px <= 1; px += 2) {
        for (let pz = -0.5; pz <= 0.5; pz += 1) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 4), stallMat);
          post.position.set(px * 1.2, 0.9, pz * 0.7);
          stall.add(post);
        }
      }
      stall.position.set(i * 4, 0, 95);
      scene.add(stall);
    }
  },

  // 骆驼商队（西市，丝绸之路）
  camelCaravan() {
    const camelMat = new THREE.MeshStandardMaterial({ color: 0xc4a574, roughness: 0.9 });
    // 西市骆驼商队（5只骆驼）
    for (let i = 0; i < 5; i++) {
      const camel = new THREE.Group();
      // 身体
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 0.6), camelMat);
      body.position.y = 1.2;
      camel.add(body);
      // 驼峰
      const hump = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 4), camelMat);
      hump.position.set(0, 1.8, 0);
      camel.add(hump);
      // 头
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3), camelMat);
      head.position.set(0.9, 1.6, 0);
      camel.add(head);
      // 腿
      for (let lx = -0.5; lx <= 0.5; lx += 1) {
        for (let lz = -0.2; lz <= 0.2; lz += 0.4) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 4), camelMat);
          leg.position.set(lx, 0.4, lz);
          camel.add(leg);
        }
      }
      camel.position.set(-50 + i * 4, 0, -90);
      camel.rotation.y = Math.PI / 2;
      scene.add(camel);
    }
  },

  // 马车（朱雀大街）
  horseCarriages() {
    const woodMat = MAT.wood;
    const horseMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.9 });
    // 朱雀大街马车（3辆）
    for (let i = 0; i < 3; i++) {
      const carriage = new THREE.Group();
      // 车厢
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 1.5), woodMat);
      cabin.position.y = 1.2;
      carriage.add(cabin);
      // 车轮
      for (let wx = -1; wx <= 1; wx += 2) {
        for (let wz = -0.7; wz <= 0.7; wz += 1.4) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 8), woodMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 0.4, wz);
          carriage.add(wheel);
        }
      }
      // 马（简化）
      const horse = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.4), horseMat);
      horse.position.set(1.8, 1, 0);
      carriage.add(horse);
      carriage.position.set(0, 0, -100 - i * 80);
      scene.add(carriage);
    }
  },

  init() {
    this.pedestrians();
    this.marketStalls();
    this.camelCaravan();
    this.horseCarriages();
    console.log('[ChangAnCityLife] 长安城市生活已初始化（行人/商贩/骆驼/马车）');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new ChangAnCityLife().init();
  };
}
