/* ============================================================
   核心建筑几何精修 · 中式斗拱/飞檐/鸱吻/瓦垄
   真正提升主体建筑的结构质感
   ============================================================ */

class CoreGeometryRefine {
  // 斗拱组件 - 为大明宫主殿添加完整斗拱层
  addDougongLayer(x, z, width) {
    const dougongMat = MAT.wood;
    // 每开间一组斗拱
    const bays = Math.floor(width / 5);
    for (let i = 0; i <= bays; i++) {
      const bx = x - width / 2 + i * (width / bays);
      // 坐斗
      const zuodou = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.6), dougongMat);
      zuodou.position.set(bx, 9.5, z + 9);
      scene.add(zuodou);
      // 翘（向外挑出）
      const qiao = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 1.2), dougongMat);
      qiao.position.set(bx, 9.8, z + 9.5);
      scene.add(qiao);
      // 昂（斜向挑出）
      const ang = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 1.5), dougongMat);
      ang.position.set(bx, 10.0, z + 10);
      ang.rotation.x = -0.2;
      scene.add(ang);
    }
  },

  // 鸱吻 - 屋顶两端的脊兽
  addChiwen(x, y, z, rotY) {
    const chiwenMat = new THREE.MeshStandardMaterial({ color: 0x2a4a3a, roughness: 0.5, metalness: 0.3 });
    // 鸱吻主体（龙形卷尾）
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 6), chiwenMat);
    body.position.set(x, y, z);
    body.rotation.y = rotY;
    body.rotation.z = 0.3;
    scene.add(body);
    // 鸱吻尾巴（上扬）
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.08, 6, 8, Math.PI), chiwenMat);
    tail.position.set(x + Math.cos(rotY) * 0.3, y + 0.5, z + Math.sin(rotY) * 0.3);
    tail.rotation.y = rotY;
    scene.add(tail);
  },

  // 瓦垄 - 屋顶上的筒瓦行列
  addTileRows(x, y, z, width, depth, rotY) {
    const tileMat = MAT.roofGlazed || MAT.roof;
    const rows = Math.floor(depth / 0.6);
    for (let r = 0; r < rows; r++) {
      const tz = z - depth / 2 + r * 0.6;
      const cols = Math.floor(width / 0.5);
      for (let c = 0; c < cols; c++) {
        const tx = x - width / 2 + c * 0.5;
        const tile = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6), tileMat);
        tile.rotation.z = Math.PI / 2;
        tile.rotation.y = rotY;
        tile.position.set(tx, y + r * 0.05, tz);
        scene.add(tile);
      }
    }
  },

  // 大明宫主殿完整精修
  refineDamingHall() {
    // 斗拱层（正面+背面）
    this.addDougongLayer(0, -300, 36);
    this.addDougongLayer(0, -300, 36); // 背面镜像
    // 鸱吻（屋顶两端）
    this.addChiwen(-18, 15, -300, 0);
    this.addChiwen(18, 15, -300, Math.PI);
    // 瓦垄（主屋顶）
    this.addTileRows(0, 13, -300, 36, 16, 0);
  },

  // 朱雀大街两侧坊门精修
  refineWardGates() {
    const gateMat = MAT.red;
    const roofMat = MAT.roof;
    // 朱雀大街东侧坊门（每隔50m）
    for (let z = -300; z <= 300; z += 100) {
      // 坊门立柱
      for (let side = -1; side <= 1; side += 2) {
        const col = new THREE.Mesh(UNIT_CYL, gateMat);
        col.scale.set(0.3, 5, 0.3);
        col.position.set(side * 20, 2.5, -z);
        col.castShadow = true;
        scene.add(col);
      }
      // 坊门屋顶
      const gateRoof = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 3), roofMat);
      gateRoof.position.set(0, 5.5, -z);
      gateRoof.castShadow = true;
      scene.add(gateRoof);
      // 鸱吻
      this.addChiwen(-3, 6, -z, 0);
      this.addChiwen(3, 6, -z, Math.PI);
    }
  },

  // 东西市店铺屋顶精修
  refineMarketRoofs() {
    const roofMat = MAT.roof;
    // 东市店铺屋顶（小坡顶）
    for (let i = -3; i <= 3; i++) {
      const roof = new THREE.Mesh(new THREE.BoxGeometry(9, 0.6, 7), roofMat);
      roof.position.set(i * 9, 5.5, 100);
      roof.rotation.x = 0.1; // 微坡
      roof.castShadow = true;
      scene.add(roof);
    }
    // 西市对称
    for (let i = -3; i <= 3; i++) {
      const roof = new THREE.Mesh(new THREE.BoxGeometry(9, 0.6, 7), roofMat);
      roof.position.set(i * 9, 5.5, -100);
      roof.rotation.x = -0.1;
      scene.add(roof);
    }
  },

  init() {
    this.refineDamingHall();
    this.refineWardGates();
    this.refineMarketRoofs();
    console.log('[CoreGeometryRefine] 核心建筑几何精修完成（斗拱/鸱吻/瓦垄）');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new CoreGeometryRefine().init();
  };
}
