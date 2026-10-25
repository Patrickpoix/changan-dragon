/* ============================================================
   石碑细节增强 · 提升文化氛围
   ============================================================ */

class SteleDetails {
  // 为大雁塔添加石碑
  addDayantaStele() {
    const steleMat = MAT.stone;
    
    // 大雁塔石碑
    const stele = new THREE.Mesh(UNIT_BOX, steleMat);
    stele.scale.set(1, 3, 0.3);
    stele.position.set(200, 1.5, -90);
    scene.add(stele);
  },
  
  // 为曲江池添加石碑
  addQujiangStele() {
    const steleMat = MAT.stone;
    
    // 曲江池石碑
    const stele = new THREE.Mesh(UNIT_BOX, steleMat);
    stele.scale.set(1, 3, 0.3);
    stele.position.set(400, 1.5, 270);
    scene.add(stele);
  },
  
  init() {
    this.addDayantaStele();
    this.addQujiangStele();
    console.log('[SteleDetails] 石碑细节已添加');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new SteleDetails().init();
  };
}
