/* ============================================================
   小雁塔精修 · 唐代密檐式砖塔
   十五层密檐，秀丽玲珑
   ============================================================ */

class SmallWildGoosePagoda {
  pagodaBody() {
    const brickMat = MAT.greyBrick || MAT.stone;
    // 塔基座
    const base = new THREE.Mesh(new THREE.BoxGeometry(12, 2, 12), brickMat);
    base.position.set(-150, 1, 50);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    // 十五层密檐塔（每层很窄，密集出檐）
    for (let floor = 0; floor < 15; floor++) {
      const size = 8 - floor * 0.3; // 逐层收窄
      const y = 2 + floor * 1.5;
      // 塔身（很薄）
      const body = new THREE.Mesh(new THREE.BoxGeometry(size, 1, size), brickMat);
      body.position.set(-150, y, 50);
      body.castShadow = true;
      scene.add(body);
      // 密檐（每层出檐很宽，紧密排列）
      const eave = new THREE.Mesh(new THREE.BoxGeometry(size + 1.5, 0.15, size + 1.5), brickMat);
      eave.position.set(-150, y + 0.55, 50);
      scene.add(eave);
    }
    // 塔刹
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.3, 2, 6),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.4 })
    );
    spire.position.set(-150, 2 + 15 * 1.5 + 1, 50);
    scene.add(spire);
  },

  templeGrounds() {
    const wallMat = MAT.greyBrick || MAT.stone;
    // 寺院围墙
    const wallN = new THREE.Mesh(new THREE.BoxGeometry(40, 2.5, 1), wallMat);
    wallN.position.set(-150, 1.25, 30);
    scene.add(wallN);
    const wallS = new THREE.Mesh(new THREE.BoxGeometry(40, 2.5, 1), wallMat);
    wallS.position.set(-150, 1.25, 70);
    scene.add(wallS);
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 40), wallMat);
    wallE.position.set(-130, 1.25, 50);
    scene.add(wallE);
    const wallW = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 40), wallMat);
    wallW.position.set(-170, 1.25, 50);
    scene.add(wallW);
  },

  init() {
    this.pagodaBody();
    this.templeGrounds();
    console.log('[SmallWildGoosePagoda] 小雁塔精修完成（十五层密檐+塔刹+寺院围墙）');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new SmallWildGoosePagoda().init();
  };
}
