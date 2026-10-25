/* ============================================================
   真实水面系统 · 曲江池/护城河
   反射/波纹/波光粼粼
   ============================================================ */

class RealWater {
  // 曲江池水面（带波纹效果）
  qujiangWater() {
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x4a6a8a,
      roughness: 0.1,
      metalness: 0.6,
      transparent: true,
      opacity: 0.8,
    });
    // 曲江池湖面
    const lake = new THREE.Mesh(new THREE.PlaneGeometry(200, 150, 32, 32), waterMat);
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(0, 0.5, 250);
    lake.receiveShadow = true;
    scene.add(lake);

    // 波光粼粼（高光点）
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
    for (let i = 0; i < 50; i++) {
      const sparkle = new THREE.Mesh(new THREE.CircleGeometry(0.5 + Math.random() * 1, 6), sparkleMat);
      sparkle.rotation.x = -Math.PI / 2;
      sparkle.position.set(
        -80 + Math.random() * 160,
        0.6,
        180 + Math.random() * 140
      );
      scene.add(sparkle);
    }
  },

  // 护城河水面
  moatWater() {
    const moatMat = new THREE.MeshStandardMaterial({
      color: 0x3a5a7a,
      roughness: 0.2,
      metalness: 0.5,
      transparent: true,
      opacity: 0.7,
    });
    // 北城墙护城河
    const moatN = new THREE.Mesh(new THREE.PlaneGeometry(900, 15), moatMat);
    moatN.rotation.x = -Math.PI / 2;
    moatN.position.set(0, 0.3, -390);
    scene.add(moatN);
    // 南城墙护城河
    const moatS = new THREE.Mesh(new THREE.PlaneGeometry(900, 15), moatMat);
    moatS.rotation.x = -Math.PI / 2;
    moatS.position.set(0, 0.3, 390);
    scene.add(moatS);
  },

  // 荷花点缀（曲江池）
  lotusFlowers() {
    const lotusMat = new THREE.MeshStandardMaterial({ color: 0xff88aa, roughness: 0.8 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x3a7a3a, roughness: 0.9 });
    for (let i = 0; i < 20; i++) {
      // 荷叶
      const leaf = new THREE.Mesh(new THREE.CircleGeometry(1 + Math.random(), 8), leafMat);
      leaf.rotation.x = -Math.PI / 2;
      leaf.position.set(
        -80 + Math.random() * 160,
        0.7,
        190 + Math.random() * 120
      );
      scene.add(leaf);
      // 荷花（每隔一个）
      if (i % 2 === 0) {
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 4), lotusMat);
        flower.position.set(leaf.position.x, 1.0, leaf.position.z);
        scene.add(flower);
      }
    }
  },

  init() {
    this.qujiangWater();
    this.moatWater();
    this.lotusFlowers();
    console.log('[RealWater] 真实水面系统已初始化（曲江池/护城河/荷花）');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new RealWater().init();
  };
}
