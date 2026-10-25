/* ============================================================
   兴庆宫精修 · 唐代宫殿园林
   花萼相辉楼/沉香亭/牡丹园
   ============================================================ */

class XingqingPalace {
  // 花萼相辉楼（兴庆宫主殿）
  mainHall() {
    const redMat = MAT.vermilion || MAT.red;
    const roofMat = MAT.roofGlazed || MAT.roof;
    // 宫殿基座
    const base = new THREE.Mesh(new THREE.BoxGeometry(50, 4, 30), MAT.whiteMarble || MAT.stone);
    base.position.set(100, 2, -200);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    // 殿身
    const hall = new THREE.Mesh(new THREE.BoxGeometry(40, 8, 20), redMat);
    hall.position.set(100, 8, -200);
    hall.castShadow = true;
    scene.add(hall);
    // 重檐屋顶
    const roof1 = new THREE.Mesh(new THREE.BoxGeometry(45, 2, 25), roofMat);
    roof1.position.set(100, 13, -200);
    roof1.castShadow = true;
    scene.add(roof1);
    const roof2 = new THREE.Mesh(new THREE.BoxGeometry(35, 1.5, 18), roofMat);
    roof2.position.set(100, 15.5, -200);
    roof2.castShadow = true;
    scene.add(roof2);
    // 立柱阵列
    for (let i = -4; i <= 4; i++) {
      const col = new THREE.Mesh(UNIT_CYL, redMat);
      col.scale.set(0.3, 6, 0.3);
      col.position.set(100 + i * 4, 7, -189);
      col.castShadow = true;
      scene.add(col);
    }
  },

  // 沉香亭（牡丹园中的亭子）
  chenxiangPavilion() {
    const woodMat = MAT.wood;
    const roofMat = MAT.roof;
    // 亭子基座
    const base = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 10), MAT.whiteMarble || MAT.stone);
    base.position.set(100, 0.25, -150);
    scene.add(base);
    // 四根立柱
    for (let dx = -3; dx <= 3; dx += 6) {
      for (let dz = -3; dz <= 3; dz += 6) {
        const col = new THREE.Mesh(UNIT_CYL, woodMat);
        col.scale.set(0.2, 4, 0.2);
        col.position.set(100 + dx, 2.5, -150 + dz);
        col.castShadow = true;
        scene.add(col);
      }
    }
    // 攒尖顶
    const roof = new THREE.Mesh(new THREE.ConeGeometry(6, 4, 4), roofMat);
    roof.position.set(100, 6.5, -150);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
    // 宝顶
    const finial = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 6, 4),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 })
    );
    finial.position.set(100, 8.7, -150);
    scene.add(finial);
  },

  // 牡丹园（花团锦簇）
  peonyGarden() {
    const peonyColors = [0xff6699, 0xff4444, 0xffcc00, 0xff88ff];
    for (let i = 0; i < 30; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: peonyColors[i % peonyColors.length],
        roughness: 0.8
      });
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 6, 4), mat);
      flower.position.set(
        60 + Math.random() * 80,
        0.5,
        -130 + Math.random() * 40
      );
      scene.add(flower);
    }
  },

  // 龙池（兴庆宫水池）
  dragonPool() {
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x4a6a8a,
      roughness: 0.1,
      metalness: 0.6,
      transparent: true,
      opacity: 0.8,
    });
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(80, 50, 16, 16), waterMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(50, 0.3, -180);
    pool.receiveShadow = true;
    scene.add(pool);
  },

  init() {
    this.mainHall();
    this.chenxiangPavilion();
    this.peonyGarden();
    this.dragonPool();
    console.log('[XingqingPalace] 兴庆宫精修完成（花萼相辉楼+沉香亭+牡丹园+龙池）');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new XingqingPalace().init();
  };
}
