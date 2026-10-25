/* ============================================================
   唐代长安植被系统 · 真实质感
   行道槐/花桃/垂柳/松柏
   ============================================================ */

class TangVegetation {
  // 行道树（朱雀大街两侧槐树）
  streetTrees() {
    const trunkMat = MAT.trunk;
    const leafMat = MAT.leaf;
    // 朱雀大街两侧行道树
    for (let z = -350; z <= 350; z += 20) {
      for (let side = -1; side <= 1; side += 2) {
        // 树干
        const trunk = new THREE.Mesh(UNIT_CYL, trunkMat);
        trunk.scale.set(0.2, 4, 0.2);
        trunk.position.set(side * 18, 2, -z);
        trunk.castShadow = true;
        scene.add(trunk);
        // 树冠（圆形）
        const crown = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 6), leafMat);
        crown.position.set(side * 18, 6, -z);
        crown.castShadow = true;
        scene.add(crown);
      }
    }
  },

  // 花树（曲江池/兴庆宫桃花）
  blossomTrees() {
    const blossomMat = MAT.blossom;
    const trunkMat = MAT.trunk;
    // 曲江池畔桃花
    for (let i = 0; i < 15; i++) {
      const x = -80 + Math.random() * 160;
      const z = 180 + Math.random() * 60;
      // 树干
      const trunk = new THREE.Mesh(UNIT_CYL, trunkMat);
      trunk.scale.set(0.15, 3, 0.15);
      trunk.position.set(x, 1.5, z);
      scene.add(trunk);
      // 花团
      const blossom = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 6), blossomMat);
      blossom.position.set(x, 4, z);
      blossom.castShadow = true;
      scene.add(blossom);
    }
  },

  // 垂柳（曲江池边）
  willowTrees() {
    const trunkMat = MAT.trunk;
    const willowMat = new THREE.MeshStandardMaterial({ color: 0x6a9a4a, roughness: 0.9 });
    // 曲江池边垂柳
    for (let i = 0; i < 10; i++) {
      const x = -90 + i * 20;
      const z = 170;
      // 树干
      const trunk = new THREE.Mesh(UNIT_CYL, trunkMat);
      trunk.scale.set(0.2, 5, 0.2);
      trunk.position.set(x, 2.5, z);
      scene.add(trunk);
      // 垂柳枝条（下垂的圆柱体）
      for (let branch = 0; branch < 5; branch++) {
        const angle = (branch / 5) * Math.PI * 2;
        const branchMesh = new THREE.Mesh(UNIT_CYL, willowMat);
        branchMesh.scale.set(0.05, 3, 0.05);
        branchMesh.position.set(
          x + Math.cos(angle) * 1.5,
          5,
          z + Math.sin(angle) * 1.5
        );
        branchMesh.rotation.z = 0.2;
        scene.add(branchMesh);
      }
    }
  },

  // 松柏（大明宫/寺庙）
  pineTrees() {
    const trunkMat = MAT.trunk;
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.9 });
    // 大明宫前松柏
    for (let i = -5; i <= 5; i++) {
      if (i === 0) continue;
      const x = i * 6;
      const z = -280;
      // 树干
      const trunk = new THREE.Mesh(UNIT_CYL, trunkMat);
      trunk.scale.set(0.25, 3, 0.25);
      trunk.position.set(x, 1.5, z);
      scene.add(trunk);
      // 松塔（三层锥形）
      for (let layer = 0; layer < 3; layer++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(2 - layer * 0.5, 2, 6), pineMat);
        cone.position.set(x, 3 + layer * 1.5, z);
        cone.castShadow = true;
        scene.add(cone);
      }
    }
  },

  init() {
    this.streetTrees();
    this.blossomTrees();
    this.willowTrees();
    this.pineTrees();
    console.log('[TangVegetation] 唐代植被系统已初始化（行道槐/桃花/垂柳/松柏）');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new TangVegetation().init();
  };
}
