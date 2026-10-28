/* ============================================================
   唐代动物生成器 v2.0
   精细马、骆驼、鸟 — 替代简单几何体动物
   ============================================================ */

const TangAnimalBuilder = {
  
  // 马 — 唐代战马
  createHorse(scale = 1) {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.CapsuleGeometry(0.2 * scale, 0.6 * scale, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.8 * scale;
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    group.add(body);
    
    const headGeo = new THREE.BoxGeometry(0.15 * scale, 0.2 * scale, 0.25 * scale);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0.45 * scale, 1.1 * scale, 0);
    head.castShadow = true;
    group.add(head);
    
    const maneGeo = new THREE.BoxGeometry(0.3 * scale, 0.05 * scale, 0.05 * scale);
    const maneMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 });
    const mane = new THREE.Mesh(maneGeo, maneMat);
    mane.position.set(0.1 * scale, 1.15 * scale, 0);
    group.add(mane);
    
    const legGeo = new THREE.CylinderGeometry(0.05 * scale, 0.04 * scale, 0.6 * scale, 6);
    
    const legPositions = [
      [0.25, 0.3, 0.1],
      [0.25, 0.3, -0.1],
      [-0.25, 0.3, 0.1],
      [-0.25, 0.3, -0.1],
    ];
    
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, bodyMat);
      leg.position.set(x * scale, y * scale, z * scale);
      leg.castShadow = true;
      group.add(leg);
    });
    
    const tailGeo = new THREE.CylinderGeometry(0.03 * scale, 0.02 * scale, 0.4 * scale, 6);
    const tail = new THREE.Mesh(tailGeo, maneMat);
    tail.position.set(-0.4 * scale, 0.9 * scale, 0);
    tail.rotation.z = 0.5;
    group.add(tail);
    
    return group;
  },
  
  // 骆驼 — 丝路驼队
  createCamel(scale = 1) {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.CapsuleGeometry(0.25 * scale, 0.7 * scale, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xc4a574, roughness: 0.9 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1 * scale;
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    group.add(body);
    
    const humpGeo = new THREE.SphereGeometry(0.15 * scale, 8, 6);
    
    const hump1 = new THREE.Mesh(humpGeo, bodyMat);
    hump1.position.set(0.15 * scale, 1.25 * scale, 0);
    hump1.scale.y = 1.3;
    group.add(hump1);
    
    const hump2 = new THREE.Mesh(humpGeo, bodyMat);
    hump2.position.set(-0.15 * scale, 1.25 * scale, 0);
    hump2.scale.y = 1.3;
    group.add(hump2);
    
    const headGeo = new THREE.BoxGeometry(0.15 * scale, 0.2 * scale, 0.2 * scale);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0.55 * scale, 1.3 * scale, 0);
    group.add(head);
    
    const legGeo = new THREE.CylinderGeometry(0.06 * scale, 0.05 * scale, 0.8 * scale, 6);
    
    const legPositions = [
      [0.3, 0.4, 0.12],
      [0.3, 0.4, -0.12],
      [-0.3, 0.4, 0.12],
      [-0.3, 0.4, -0.12],
    ];
    
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, bodyMat);
      leg.position.set(x * scale, y * scale, z * scale);
      leg.castShadow = true;
      group.add(leg);
    });
    
    return group;
  },
  
  // 飞鸟 — 燕子
  createBird(scale = 1) {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.SphereGeometry(0.05 * scale, 8, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.z = 1.5;
    group.add(body);
    
    const wingGeo = new THREE.PlaneGeometry(0.2 * scale, 0.05 * scale);
    const wingMat = new THREE.MeshStandardMaterial({ 
      color: 0x4a4a4a, 
      side: THREE.DoubleSide 
    });
    
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(0, 0.02 * scale, 0.08 * scale);
    wingL.rotation.x = 0.3;
    group.add(wingL);
    
    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingR.position.set(0, 0.02 * scale, -0.08 * scale);
    wingR.rotation.x = -0.3;
    group.add(wingR);
    
    const tailGeo = new THREE.ConeGeometry(0.03 * scale, 0.08 * scale, 4);
    const tail = new THREE.Mesh(tailGeo, bodyMat);
    tail.position.set(-0.08 * scale, 0, 0);
    tail.rotation.z = Math.PI / 2;
    group.add(tail);
    
    return group;
  },
  
  // 鱼 — 锦鲤
  createFish(scale = 1) {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.SphereGeometry(0.1 * scale, 8, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff6b35, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.z = 2;
    group.add(body);
    
    const tailGeo = new THREE.ConeGeometry(0.06 * scale, 0.08 * scale, 4);
    const tail = new THREE.Mesh(tailGeo, bodyMat);
    tail.position.set(-0.2 * scale, 0, 0);
    tail.rotation.z = Math.PI / 2;
    group.add(tail);
    
    const finGeo = new THREE.PlaneGeometry(0.05 * scale, 0.03 * scale);
    const finMat = new THREE.MeshStandardMaterial({ 
      color: 0xff8c5a, 
      side: THREE.DoubleSide 
    });
    
    const finL = new THREE.Mesh(finGeo, finMat);
    finL.position.set(0, 0.05 * scale, 0.05 * scale);
    group.add(finL);
    
    const finR = new THREE.Mesh(finGeo, finMat);
    finR.position.set(0, 0.05 * scale, -0.05 * scale);
    group.add(finR);
    
    return group;
  }
};

window.TangAnimalBuilder = TangAnimalBuilder;

console.log('[Tang-Animal] 唐代动物生成器加载完成');
