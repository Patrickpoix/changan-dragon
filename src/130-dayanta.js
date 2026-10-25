/* ============================================================
   大雁塔精修 · 唐代佛塔真实质感
   七层楼阁式砖塔
   ============================================================ */

class BigWildGoosePagoda {
  pagodaBody() {
    const brickMat = MAT.greyBrick || MAT.stone;
    const base = new THREE.Mesh(new THREE.BoxGeometry(20, 3, 20), brickMat);
    base.position.set(200, 1.5, -85);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);
    for (let floor = 0; floor < 7; floor++) {
      const size = 14 - floor * 1.2;
      const y = 3 + floor * 4;
      const body = new THREE.Mesh(new THREE.BoxGeometry(size, 3.5, size), brickMat);
      body.position.set(200, y, -85);
      body.castShadow = true;
      body.receiveShadow = true;
      scene.add(body);
      const eave = new THREE.Mesh(new THREE.BoxGeometry(size + 1, 0.3, size + 1), brickMat);
      eave.position.set(200, y + 1.8, -85);
      eave.castShadow = true;
      scene.add(eave);
      const archMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
      const arch = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 0.2), archMat);
      arch.position.set(200, y, -85 + size / 2 + 0.1);
      scene.add(arch);
    }
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.5, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 })
    );
    spire.position.set(200, 3 + 7 * 4 + 2, -85);
    scene.add(spire);
  },

  burnerBase() {
    const stoneMat = MAT.whiteMarble || MAT.stone;
    const base = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 4), stoneMat);
    base.position.set(200, 0.25, -75);
    base.receiveShadow = true;
    scene.add(base);
    for (let step = 0; step < 3; step++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(5 - step * 0.5, 0.15, 1), stoneMat);
      s.position.set(200, step * 0.15, -72 - step * 1);
      scene.add(s);
    }
  },

  templeGrounds() {
    const wallMat = MAT.greyBrick || MAT.stone;
    const wallN = new THREE.Mesh(new THREE.BoxGeometry(60, 3, 1), wallMat);
    wallN.position.set(200, 1.5, -120);
    scene.add(wallN);
    const wallS = new THREE.Mesh(new THREE.BoxGeometry(60, 3, 1), wallMat);
    wallS.position.set(200, 1.5, -50);
    scene.add(wallS);
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 70), wallMat);
    wallE.position.set(230, 1.5, -85);
    scene.add(wallE);
    const wallW = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 70), wallMat);
    wallW.position.set(170, 1.5, -85);
    scene.add(wallW);
    for (let i = -2; i <= 2; i++) {
      const x = 200 + i * 10;
      const z = -100 + (i % 2) * 15;
      const trunk = new THREE.Mesh(UNIT_CYL, MAT.trunk);
      trunk.scale.set(0.2, 3, 0.2);
      trunk.position.set(x, 1.5, z);
      scene.add(trunk);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 6), new THREE.MeshStandardMaterial({ color: 0x2a4a2a }));
      crown.position.set(x, 4, z);
      crown.castShadow = true;
      scene.add(crown);
    }
  },

  init() {
    this.pagodaBody();
    this.burnerBase();
    this.templeGrounds();
    console.log('[BigWildGoosePagoda] 大雁塔精修完成');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new BigWildGoosePagoda().init();
  };
}
