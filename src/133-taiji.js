/* ============================================================
   太极宫精修 · 唐代皇宫
   太极殿/两仪殿/甘露殿
   ============================================================ */

class TaijiPalace {
  mainHall() {
    const redMat = MAT.vermilion || MAT.red;
    const roofMat = MAT.roofGlazed || MAT.roof;
    // 宫殿基座
    const base = new THREE.Mesh(new THREE.BoxGeometry(60, 5, 40), MAT.whiteMarble || MAT.stone);
    base.position.set(-200, 2.5, -300);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    // 殿身
    const hall = new THREE.Mesh(new THREE.BoxGeometry(50, 10, 30), redMat);
    hall.position.set(-200, 10, -300);
    hall.castShadow = true;
    scene.add(hall);
    // 重檐屋顶
    const roof1 = new THREE.Mesh(new THREE.BoxGeometry(55, 2.5, 35), roofMat);
    roof1.position.set(-200, 16, -300);
    roof1.castShadow = true;
    scene.add(roof1);
    const roof2 = new THREE.Mesh(new THREE.BoxGeometry(40, 2, 25), roofMat);
    roof2.position.set(-200, 19, -300);
    roof2.castShadow = true;
    scene.add(roof2);
    // 鸱吻
    const chiwenMat = new THREE.MeshStandardMaterial({ color: 0x2a4a3a, roughness: 0.5 });
    for (let x = -22; x <= 22; x += 44) {
      const chiwen = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2, 6), chiwenMat);
      chiwen.position.set(-200 + x, 20.5, -300);
      scene.add(chiwen);
    }
    // 立柱阵列
    for (let i = -5; i <= 5; i++) {
      const col = new THREE.Mesh(UNIT_CYL, redMat);
      col.scale.set(0.35, 8, 0.35);
      col.position.set(-200 + i * 5, 9, -285);
      col.castShadow = true;
      scene.add(col);
    }
  },

  sideHalls() {
    const redMat = MAT.red;
    const roofMat = MAT.roof;
    // 东配殿
    const eastHall = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 15), redMat);
    eastHall.position.set(-160, 5, -300);
    eastHall.castShadow = true;
    scene.add(eastHall);
    const eastRoof = new THREE.Mesh(new THREE.BoxGeometry(22, 1.5, 17), roofMat);
    eastRoof.position.set(-160, 9.5, -300);
    scene.add(eastRoof);
    // 西配殿
    const westHall = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 15), redMat);
    westHall.position.set(-240, 5, -300);
    westHall.castShadow = true;
    scene.add(westHall);
    const westRoof = new THREE.Mesh(new THREE.BoxGeometry(22, 1.5, 17), roofMat);
    westRoof.position.set(-240, 9.5, -300);
    scene.add(westRoof);
  },

  palaceGate() {
    const redMat = MAT.red;
    const roofMat = MAT.roof;
    // 宫门
    const gate = new THREE.Mesh(new THREE.BoxGeometry(15, 8, 5), redMat);
    gate.position.set(-200, 4, -270);
    gate.castShadow = true;
    scene.add(gate);
    const gateRoof = new THREE.Mesh(new THREE.BoxGeometry(18, 1.5, 7), roofMat);
    gateRoof.position.set(-200, 9, -270);
    gateRoof.castShadow = true;
    scene.add(gateRoof);
  },

  init() {
    this.mainHall();
    this.sideHalls();
    this.palaceGate();
    console.log('[TaijiPalace] 太极宫精修完成（太极殿+东西配殿+宫门）');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new TaijiPalace().init();
  };
}
