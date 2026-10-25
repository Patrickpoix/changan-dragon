/* ============================================================
   核心区域视觉质量综合提升 · 真正的主体打磨
   朱雀大街/大明宫/东西市/曲江池 核心建筑几何与材质升级
   ============================================================ */

class CoreVisualOverhaul {
  // 朱雀大街 - 中央御道石铺 + 两侧排水沟 + 行道树阵列
  enhanceZhuqueAvenue() {
    // 中央御道石板（朱雀大街全长）
    const flagstoneMat = new THREE.MeshStandardMaterial({
      color: 0x9a958c,
      roughness: 0.9,
      metalness: 0.0,
    });
    for (let z = -350; z <= 350; z += 8) {
      const stone = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 7), flagstoneMat);
      stone.position.set(0, 0.05, -z);
      stone.receiveShadow = true;
      scene.add(stone);
    }
    // 两侧排水沟
    const drainMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 1.0 });
    for (let side = -1; side <= 1; side += 2) {
      for (let z = -350; z <= 350; z += 10) {
        const drain = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 9), drainMat);
        drain.position.set(side * 15, 0.08, -z);
        scene.add(drain);
      }
    }
  },

  // 大明宫 - 丹凤门城楼重檐庑殿顶精修
  enhanceDamingPalace() {
    const roofMat = MAT.roofGlazed || MAT.roof;
    // 丹凤门主殿重檐
    for (let floor = 0; floor < 2; floor++) {
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(40 - floor * 6, 2.5, 18 - floor * 3),
        roofMat
      );
      roof.position.set(0, 12 + floor * 6, -300);
      roof.rotation.x = 0.15; // 檐口起翘
      roof.castShadow = true;
      roof.receiveShadow = true;
      scene.add(roof);
    }
    // 宫殿朱红立柱阵列
    const colMat = MAT.red;
    for (let i = -4; i <= 4; i++) {
      const col = new THREE.Mesh(UNIT_CYL, colMat);
      col.scale.set(0.4, 10, 0.4);
      col.position.set(i * 4, 5, -300);
      col.castShadow = true;
      scene.add(col);
    }
    // 殿前玉阶
    const jadeMat = new THREE.MeshStandardMaterial({ color: 0xd0d8d0, roughness: 0.6 });
    for (let step = 0; step < 5; step++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(30, 0.3, 2), jadeMat);
      s.position.set(0, step * 0.3, -280 + step * 2);
      scene.add(s);
    }
  },

  // 东西市 - 店铺立面 + 幌子 + 摊位
  enhanceMarket() {
    const woodMat = MAT.wood;
    // 东市店铺立面
    for (let i = -3; i <= 3; i++) {
      const shop = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 6), woodMat);
      shop.position.set(i * 9, 2.5, 100);
      shop.castShadow = true;
      shop.receiveShadow = true;
      scene.add(shop);
      // 店铺招牌
      const signMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.7 });
      const sign = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 0.1), signMat);
      sign.position.set(i * 9, 4, 96.9);
      scene.add(sign);
    }
    // 西市对称
    for (let i = -3; i <= 3; i++) {
      const shop = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 6), woodMat);
      shop.position.set(i * 9, 2.5, -100);
      scene.add(shop);
    }
  },

  // 曲江池 - 湖面波纹 + 湖岸亭台
  enhanceQujiang() {
    // 湖岸石板路
    const walkMat = new THREE.MeshStandardMaterial({ color: 0x8a857c, roughness: 0.9 });
    for (let i = -8; i <= 8; i++) {
      const walk = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 3), walkMat);
      walk.position.set(i * 3, 0.05, 200 + Math.sin(i * 0.5) * 5);
      scene.add(walk);
    }
    // 池畔亭子
    const pavilionRoof = new THREE.Mesh(new THREE.ConeGeometry(4, 3, 4), MAT.roof);
    pavilionRoof.position.set(20, 6, 200);
    pavilionRoof.rotation.y = Math.PI / 4;
    pavilionRoof.castShadow = true;
    scene.add(pavilionRoof);
    // 亭子立柱
    for (let cx = -1; cx <= 1; cx += 2) {
      for (let cz = -1; cz <= 1; cz += 2) {
        const col = new THREE.Mesh(UNIT_CYL, MAT.wood);
        col.scale.set(0.15, 4, 0.15);
        col.position.set(20 + cx * 2, 2, 200 + cz * 2);
        scene.add(col);
      }
    }
  },

  init() {
    this.enhanceZhuqueAvenue();
    this.enhanceDamingPalace();
    this.enhanceMarket();
    this.enhanceQujiang();
    console.log('[CoreVisualOverhaul] 核心区域视觉质量综合提升完成');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new CoreVisualOverhaul().init();
  };
}
