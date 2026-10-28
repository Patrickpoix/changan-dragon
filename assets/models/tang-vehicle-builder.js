/* ============================================================
   唐代交通工具生成器 v2.0
   精细马车、牛车、船只 — 替代简单几何体交通工具
   ============================================================ */

const TangVehicleBuilder = {
  
  // 马车 — 唐代贵族马车
  createCarriage(scale = 1) {
    const group = new THREE.Group();
    
    const cabinGeo = new THREE.BoxGeometry(1.5 * scale, 1.2 * scale, 1.2 * scale);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.y = 1.2 * scale;
    cabin.castShadow = true;
    group.add(cabin);
    
    const roofGeo = new THREE.CylinderGeometry(0.6 * scale, 0.6 * scale, 1.5 * scale, 8, 1, false, 0, Math.PI);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x5c7475, roughness: 0.7 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 1.8 * scale;
    roof.rotation.z = Math.PI / 2;
    roof.castShadow = true;
    group.add(roof);
    
    const windowMat = new THREE.MeshStandardMaterial({ 
      color: 0x87ceeb, 
      transparent: true, 
      opacity: 0.6 
    });
    
    const windowL = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4 * scale, 0.4 * scale),
      windowMat
    );
    windowL.position.set(0, 1.3 * scale, 0.61 * scale);
    group.add(windowL);
    
    const windowR = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4 * scale, 0.4 * scale),
      windowMat
    );
    windowR.position.set(0, 1.3 * scale, -0.61 * scale);
    windowR.rotation.y = Math.PI;
    group.add(windowR);
    
    const wheelGeo = new THREE.CylinderGeometry(0.4 * scale, 0.4 * scale, 0.1 * scale, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x6b4f2a, roughness: 0.9 });
    
    const wheelPositions = [
      [0.5 * scale, 0.4 * scale, 0.6 * scale],
      [0.5 * scale, 0.4 * scale, -0.6 * scale],
      [-0.5 * scale, 0.4 * scale, 0.6 * scale],
      [-0.5 * scale, 0.4 * scale, -0.6 * scale],
    ];
    
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(x, y, z);
      wheel.rotation.x = Math.PI / 2;
      wheel.castShadow = true;
      group.add(wheel);
    });
    
    const shaftGeo = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 1.5 * scale, 6);
    const shaft = new THREE.Mesh(shaftGeo, wheelMat);
    shaft.position.set(1.2 * scale, 0.8 * scale, 0);
    shaft.rotation.z = Math.PI / 2;
    group.add(shaft);
    
    return group;
  },
  
  // 牛车 — 普通百姓牛车
  createOxCart(scale = 1) {
    const group = new THREE.Group();
    
    const bedGeo = new THREE.BoxGeometry(2 * scale, 0.1 * scale, 1.2 * scale);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.9 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.y = 0.6 * scale;
    bed.castShadow = true;
    group.add(bed);
    
    const railMat = new THREE.MeshStandardMaterial({ color: 0x6b4f2a });
    
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(2 * scale, 0.4 * scale, 0.05 * scale),
        railMat
      );
      rail.position.set(0, 0.85 * scale, side * 0.6 * scale);
      group.add(rail);
    }
    
    const wheelGeo = new THREE.CylinderGeometry(0.5 * scale, 0.5 * scale, 0.08 * scale, 10);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x6b4f2a, roughness: 0.9 });
    
    const wheelPositions = [
      [0.6 * scale, 0.5 * scale, 0.6 * scale],
      [0.6 * scale, 0.5 * scale, -0.6 * scale],
      [-0.6 * scale, 0.5 * scale, 0.6 * scale],
      [-0.6 * scale, 0.5 * scale, -0.6 * scale],
    ];
    
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(x, y, z);
      wheel.rotation.x = Math.PI / 2;
      group.add(wheel);
    });
    
    return group;
  },
  
  // 游船 — 曲江池画舫
  createBoat(scale = 1) {
    const group = new THREE.Group();
    
    const hullGeo = new THREE.CapsuleGeometry(0.4 * scale, 2 * scale, 4, 8);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x6b4f2a, roughness: 0.8 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.rotation.z = Math.PI / 2;
    hull.position.y = 0.3 * scale;
    hull.castShadow = true;
    group.add(hull);
    
    const cabinGeo = new THREE.BoxGeometry(1 * scale, 0.6 * scale, 0.8 * scale);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.y = 0.9 * scale;
    cabin.castShadow = true;
    group.add(cabin);
    
    const roofGeo = new THREE.CylinderGeometry(0.4 * scale, 0.4 * scale, 1 * scale, 8, 1, false, 0, Math.PI);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x5c7475, roughness: 0.7 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 1.2 * scale;
    roof.rotation.z = Math.PI / 2;
    group.add(roof);
    
    const oarGeo = new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 1.5 * scale, 6);
    const oarMat = new THREE.MeshStandardMaterial({ color: 0x6b4f2a });
    
    const oarL = new THREE.Mesh(oarGeo, oarMat);
    oarL.position.set(0.5 * scale, 0.6 * scale, 0.8 * scale);
    oarL.rotation.z = 0.3;
    group.add(oarL);
    
    const oarR = new THREE.Mesh(oarGeo, oarMat);
    oarR.position.set(0.5 * scale, 0.6 * scale, -0.8 * scale);
    oarR.rotation.z = -0.3;
    group.add(oarR);
    
    return group;
  }
};

window.TangVehicleBuilder = TangVehicleBuilder;

console.log('[Tang-Vehicle] 唐代交通工具生成器加载完成');
