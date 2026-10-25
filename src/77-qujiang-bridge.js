/* ============================================================
   曲江池桥细节增强 · 提升水景质感
   ============================================================ */

class QujiangBridgeDetails {
  // 为曲江池添加小桥
  addBridges() {
    const bridgeMat = MAT.wood;
    
    // 曲江池小桥
    const bridge = new THREE.Mesh(UNIT_BOX, bridgeMat);
    bridge.scale.set(20, 0.5, 3);
    bridge.position.set(420, 1, 300);
    scene.add(bridge);
    
    // 桥栏杆
    const railMat = MAT.wood;
    
    const rail1 = new THREE.Mesh(UNIT_BOX, railMat);
    rail1.scale.set(20, 0.8, 0.2);
    rail1.position.set(420, 1.5, 298);
    scene.add(rail1);
    
    const rail2 = new THREE.Mesh(UNIT_BOX, railMat);
    rail2.scale.set(20, 0.8, 0.2);
    rail2.position.set(420, 1.5, 302);
    scene.add(rail2);
  },
  
  init() {
    this.addBridges();
    console.log('[QujiangBridgeDetails] 曲江池桥细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new QujiangBridgeDetails().init();
  };
}
