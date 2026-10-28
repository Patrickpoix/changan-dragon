/* ============================================================
   唐代人物生成器 v2.0
   精细服饰、姿态、发型 — 替代简单圆柱体+球体
   ============================================================ */

const TangCharacterBuilder = {
  
  // 创建唐代官员角色
  createOfficial(scale = 1) {
    const group = new THREE.Group();
    
    const headGeo = new THREE.SphereGeometry(0.15 * scale, 12, 10);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf0d0b0, roughness: 0.8 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.7 * scale;
    group.add(head);
    
    const hatGeo = new THREE.BoxGeometry(0.2 * scale, 0.1 * scale, 0.2 * scale);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 1.85 * scale;
    group.add(hat);
    
    const wingGeo = new THREE.BoxGeometry(0.15 * scale, 0.02 * scale, 0.05 * scale);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(-0.15 * scale, 1.85 * scale, 0);
    group.add(wingL);
    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingR.position.set(0.15 * scale, 1.85 * scale, 0);
    group.add(wingR);
    
    const bodyGeo = new THREE.CylinderGeometry(0.18 * scale, 0.22 * scale, 0.8 * scale, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a4a7a, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.1 * scale;
    group.add(body);
    
    const beltGeo = new THREE.CylinderGeometry(0.21 * scale, 0.21 * scale, 0.05 * scale, 12);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.4 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = 1.1 * scale;
    group.add(belt);
    
    const sleeveGeo = new THREE.CylinderGeometry(0.06 * scale, 0.05 * scale, 0.5 * scale, 8);
    const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x2a4a7a, roughness: 0.8 });
    
    const sleeveL = new THREE.Mesh(sleeveGeo, sleeveMat);
    sleeveL.position.set(-0.22 * scale, 1.2 * scale, 0);
    sleeveL.rotation.z = 0.3;
    group.add(sleeveL);
    
    const sleeveR = new THREE.Mesh(sleeveGeo, sleeveMat);
    sleeveR.position.set(0.22 * scale, 1.2 * scale, 0);
    sleeveR.rotation.z = -0.3;
    group.add(sleeveR);
    
    const legGeo = new THREE.CylinderGeometry(0.08 * scale, 0.07 * scale, 0.6 * scale, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 });
    
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.08 * scale, 0.5 * scale, 0);
    group.add(legL);
    
    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.08 * scale, 0.5 * scale, 0);
    group.add(legR);
    
    const bootGeo = new THREE.BoxGeometry(0.1 * scale, 0.08 * scale, 0.15 * scale);
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    
    const bootL = new THREE.Mesh(bootGeo, bootMat);
    bootL.position.set(-0.08 * scale, 0.04 * scale, 0.02 * scale);
    group.add(bootL);
    
    const bootR = new THREE.Mesh(bootGeo, bootMat);
    bootR.position.set(0.08 * scale, 0.04 * scale, 0.02 * scale);
    group.add(bootR);
    
    return group;
  },
  
  // 创建唐代仕女角色
  createLady(scale = 1) {
    const group = new THREE.Group();
    
    const headGeo = new THREE.SphereGeometry(0.14 * scale, 12, 10);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf5d5b5, roughness: 0.8 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.65 * scale;
    group.add(head);
    
    const hairGeo = new THREE.SphereGeometry(0.12 * scale, 10, 8);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.78 * scale;
    hair.scale.y = 0.8;
    group.add(hair);
    
    const flowerGeo = new THREE.SphereGeometry(0.03 * scale, 6, 4);
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf2a7b6 });
    const flower = new THREE.Mesh(flowerGeo, flowerMat);
    flower.position.set(0.08 * scale, 1.82 * scale, 0);
    group.add(flower);
    
    const bodyGeo = new THREE.CylinderGeometry(0.16 * scale, 0.25 * scale, 0.9 * scale, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf2a7b6, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.05 * scale;
    group.add(body);
    
    const topGeo = new THREE.CylinderGeometry(0.16 * scale, 0.16 * scale, 0.3 * scale, 12);
    const topMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 1.35 * scale;
    group.add(top);
    
    const sleeveGeo = new THREE.CylinderGeometry(0.05 * scale, 0.04 * scale, 0.6 * scale, 8);
    const sleeveMat = new THREE.MeshStandardMaterial({ color: 0xf2a7b6, roughness: 0.8 });
    
    const sleeveL = new THREE.Mesh(sleeveGeo, sleeveMat);
    sleeveL.position.set(-0.2 * scale, 1.25 * scale, 0);
    sleeveL.rotation.z = 0.5;
    group.add(sleeveL);
    
    const sleeveR = new THREE.Mesh(sleeveGeo, sleeveMat);
    sleeveR.position.set(0.2 * scale, 1.25 * scale, 0);
    sleeveR.rotation.z = -0.5;
    group.add(sleeveR);
    
    const skirtGeo = new THREE.CylinderGeometry(0.25 * scale, 0.3 * scale, 0.3 * scale, 12);
    const skirtMat = new THREE.MeshStandardMaterial({ color: 0xf2a7b6, roughness: 0.8 });
    const skirt = new THREE.Mesh(skirtGeo, skirtMat);
    skirt.position.y = 0.55 * scale;
    group.add(skirt);
    
    return group;
  },
  
  // 创建普通百姓
  createCommoner(scale = 1) {
    const group = new THREE.Group();
    
    const headGeo = new THREE.SphereGeometry(0.14 * scale, 10, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xe8c8a8, roughness: 0.9 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.6 * scale;
    group.add(head);
    
    const hatGeo = new THREE.SphereGeometry(0.14 * scale, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 1.6 * scale;
    group.add(hat);
    
    const bodyGeo = new THREE.CylinderGeometry(0.17 * scale, 0.2 * scale, 0.7 * scale, 10);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.05 * scale;
    group.add(body);
    
    const beltGeo = new THREE.CylinderGeometry(0.19 * scale, 0.19 * scale, 0.04 * scale, 10);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = 1.05 * scale;
    group.add(belt);
    
    const legGeo = new THREE.CylinderGeometry(0.07 * scale, 0.06 * scale, 0.6 * scale, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9 });
    
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.07 * scale, 0.5 * scale, 0);
    group.add(legL);
    
    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.07 * scale, 0.5 * scale, 0);
    group.add(legR);
    
    return group;
  }
};

window.TangCharacterBuilder = TangCharacterBuilder;

console.log('[Tang-Character] 唐代人物生成器加载完成');
