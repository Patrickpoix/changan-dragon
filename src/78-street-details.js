/* ============================================================
   街道细节增强 · 提升长安街景质感
   ============================================================ */

class StreetDetails {
  // 为街道添加排水沟
  addDrains() {
    const drainMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
    
    // 朱雀大街排水沟
    for (let z = -380; z <= 380; z += 20) {
      const drain = new THREE.Mesh(UNIT_BOX, drainMat);
      drain.scale.set(0.5, 0.1, 2);
      drain.position.set(-12, 0.05, z);
      scene.add(drain);
      
      const drain2 = new THREE.Mesh(UNIT_BOX, drainMat);
      drain2.scale.set(0.5, 0.1, 2);
      drain2.position.set(12, 0.05, z);
      scene.add(drain2);
    }
  },
  
  // 为街道添加路缘石
  addCurbs() {
    const curbMat = MAT.stone;
    
    // 朱雀大街路缘石
    for (let z = -380; z <= 380; z += 10) {
      const curb = new THREE.Mesh(UNIT_BOX, curbMat);
      curb.scale.set(0.3, 0.2, 5);
      curb.position.set(-13, 0.1, z);
      scene.add(curb);
      
      const curb2 = new THREE.Mesh(UNIT_BOX, curbMat);
      curb2.scale.set(0.3, 0.2, 5);
      curb2.position.set(13, 0.1, z);
      scene.add(curb2);
    }
  },
  
  init() {
    this.addDrains();
    this.addCurbs();
    console.log('[StreetDetails] 街道细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new StreetDetails().init();
  };
}
