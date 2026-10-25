/* ============================================================
   坊区细节增强 · 提升108坊质感
   ============================================================ */

class WardDetails {
  // 为坊区添加坊门
  addWardGates() {
    const gateMat = MAT.wood;
    
    // 几个主要坊门
    const gates = [
      { x: -216, z: -47, name: '大通坊' },
      { x: -132, z: -47, name: '昭国坊' },
      { x: -48, z: -47, name: '务本坊' },
      { x: 48, z: -47, name: '崇义坊' },
      { x: 132, z: -47, name: '平康坊' },
      { x: 216, z: -47, name: '宣阳坊' },
    ];
    
    gates.forEach(gate => {
      // 坊门柱
      const post1 = new THREE.Mesh(UNIT_CYL, gateMat);
      post1.scale.set(0.3, 4, 0.3);
      post1.position.set(gate.x - 3, 2, gate.z);
      scene.add(post1);
      
      const post2 = new THREE.Mesh(UNIT_CYL, gateMat);
      post2.scale.set(0.3, 4, 0.3);
      post2.position.set(gate.x + 3, 2, gate.z);
      scene.add(post2);
      
      // 坊门屋顶
      const roof = new THREE.Mesh(UNIT_BOX, MAT.roof);
      roof.scale.set(8, 1, 3);
      roof.position.set(gate.x, 4.5, gate.z);
      scene.add(roof);
    });
  },
  
  init() {
    this.addWardGates();
    console.log('[WardDetails] 坊区细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new WardDetails().init();
  };
}
