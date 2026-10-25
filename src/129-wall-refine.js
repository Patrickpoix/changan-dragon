/* ============================================================
   唐长安城墙精修 · 真实质感
   城墙/垛口/城楼/角楼
   ============================================================ */

class CityWallRefine {
  // 北城墙（含明德门城楼）
  northWall() {
    const wallMat = MAT.greyBrick || MAT.stone;
    // 主城墙（东西向，900m长）
    const wall = new THREE.Mesh(new THREE.BoxGeometry(900, 12, 8), wallMat);
    wall.position.set(0, 6, -380);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    // 垛口（每隔5m一个）
    for (let x = -440; x <= 440; x += 5) {
      const crenel = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 1), wallMat);
      crenel.position.set(x, 12.5, -380);
      scene.add(crenel);
    }
  },

  // 南城墙
  southWall() {
    const wallMat = MAT.greyBrick || MAT.stone;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(900, 12, 8), wallMat);
    wall.position.set(0, 6, 380);
    wall.castShadow = true;
    scene.add(wall);
    for (let x = -440; x <= 440; x += 5) {
      const crenel = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 1), wallMat);
      crenel.position.set(x, 12.5, 380);
      scene.add(crenel);
    }
  },

  // 东城墙
  eastWall() {
    const wallMat = MAT.greyBrick || MAT.stone;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 760), wallMat);
    wall.position.set(450, 6, 0);
    wall.castShadow = true;
    scene.add(wall);
  },

  // 西城墙
  westWall() {
    const wallMat = MAT.greyBrick || MAT.stone;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 760), wallMat);
    wall.position.set(-450, 6, 0);
    wall.castShadow = true;
    scene.add(wall);
  },

  // 明德门城楼（南城墙中央）
  mingdeGate() {
    const roofMat = MAT.roofGlazed || MAT.roof;
    const redMat = MAT.vermilion || MAT.red;
    // 城楼基座
    const base = new THREE.Mesh(new THREE.BoxGeometry(40, 8, 15), MAT.greyBrick || MAT.stone);
    base.position.set(0, 4, 380);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    // 城楼面阔五间
    const hall = new THREE.Mesh(new THREE.BoxGeometry(30, 6, 10), redMat);
    hall.position.set(0, 11, 380);
    hall.castShadow = true;
    scene.add(hall);
    // 城楼重檐屋顶
    const roof = new THREE.Mesh(new THREE.BoxGeometry(35, 2, 14), roofMat);
    roof.position.set(0, 16, 380);
    roof.castShadow = true;
    scene.add(roof);
    // 鸱吻
    const chiwenMat = new THREE.MeshStandardMaterial({ color: 0x2a4a3a, roughness: 0.5 });
    for (let x = -1; x <= 1; x += 2) {
      const chiwen = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.5, 6), chiwenMat);
      chiwen.position.set(x * 16, 17.5, 380);
      scene.add(chiwen);
    }
    // 门洞
    const gateMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    const gate = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 1), gateMat);
    gate.position.set(0, 3, 376);
    scene.add(gate);
  },

  // 四角角楼
  cornerTowers() {
    const roofMat = MAT.roof;
    const towerMat = MAT.stone;
    const corners = [
      [450, -380], [450, 380], [-450, -380], [-450, 380]
    ];
    for (const [x, z] of corners) {
      // 角楼基座
      const base = new THREE.Mesh(new THREE.BoxGeometry(15, 10, 15), towerMat);
      base.position.set(x, 5, z);
      base.castShadow = true;
      scene.add(base);
      // 角楼屋顶（攒尖顶）
      const roof = new THREE.Mesh(new THREE.ConeGeometry(8, 5, 4), roofMat);
      roof.position.set(x, 15, z);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      scene.add(roof);
    }
  },

  init() {
    this.northWall();
    this.southWall();
    this.eastWall();
    this.westWall();
    this.mingdeGate();
    this.cornerTowers();
    console.log('[CityWallRefine] 唐长安城墙精修完成（四面城墙+明德门+四角角楼）');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new CityWallRefine().init();
  };
}
