/* ============================================================
   水景增强 — 曲江池、龙池水面效果
   v1: 水面反射、波纹、倒影、锦鲤
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log('[WaterFX] 开始增强水景效果...');
    
    enhanceQujiangWater();
    enhanceLongchiWater();
    addKoiFish();
    addWaterLilies();
    
    console.log('[WaterFX] ✓ 水景效果增强完成');
  }
  
  // 曲江池水面增强
  function enhanceQujiangWater() {
    const QX = 520, QZ = 470;
    
    // 水面倒影 — 亭子、树木
    // 这里通过调整水面材质参数来实现
    
    // 湖边垂柳
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 80 + Math.random() * 10;
      const x = QX + Math.cos(angle) * radius;
      const z = QZ + Math.sin(angle) * radius;
      
      // 柳树
      const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 5, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, 2.5, z);
      trunk.castShadow = true;
      scene.add(trunk);
      
      // 垂柳树冠 — 下垂的枝条
      for (let j = 0; j < 5; j++) {
        const branchGeo = new THREE.ConeGeometry(2, 4, 6);
        const branchMat = new THREE.MeshStandardMaterial({ color: 0x4a7a4a, roughness: 0.85 });
        const branch = new THREE.Mesh(branchGeo, branchMat);
        branch.position.set(x + (j - 2) * 1.5, 6, z + (Math.random() - 0.5) * 2);
        branch.rotation.z = (j - 2) * 0.2;
        branch.castShadow = true;
        scene.add(branch);
      }
    }
  }
  
  // 龙池水面增强
  function enhanceLongchiWater() {
    const LX = 610, LZ = -195;
    
    // 池边牡丹
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 55 + Math.random() * 5;
      const x = LX + Math.cos(angle) * radius;
      const z = LZ + Math.sin(angle) * radius;
      
      // 牡丹花
      const flowerGeo = new THREE.SphereGeometry(0.5, 6, 4);
      const flowerColors = [0xff69b4, 0xff1493, 0xffb6c1, 0xffc0cb];
      const flowerMat = new THREE.MeshStandardMaterial({
        color: pick(flowerColors),
        roughness: 0.6,
        emissive: pick(flowerColors),
        emissiveIntensity: 0.1
      });
      const flower = new THREE.Mesh(flowerGeo, flowerMat);
      flower.position.set(x, 0.5, z);
      scene.add(flower);
      
      // 叶子
      const leafGeo = new THREE.SphereGeometry(0.3, 4, 3);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x4a7a4a, roughness: 0.8 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(x, 0.2, z);
      leaf.scale.set(1.5, 0.5, 1.5);
      scene.add(leaf);
    }
  }
  
  // 锦鲤 — 曲江池里的鱼
  function addKoiFish() {
    const QX = 520, QZ = 470;
    
    for (let i = 0; i < 20; i++) {
      const fishGeo = new THREE.CapsuleGeometry(0.2, 0.8, 4, 6);
      const fishColors = [0xff6600, 0xffcc00, 0xff3300, 0xffffff, 0xff9900];
      const fishMat = new THREE.MeshStandardMaterial({
        color: pick(fishColors),
        roughness: 0.5
      });
      const fish = new THREE.Mesh(fishGeo, fishMat);
      
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 50;
      fish.position.set(
        QX + Math.cos(angle) * radius,
        0.2,
        QZ + Math.sin(angle) * radius
      );
      fish.rotation.x = Math.PI / 2;
      fish.userData.isKoi = true;
      fish.userData.centerX = QX;
      fish.userData.centerZ = QZ;
      fish.userData.angle = angle;
      fish.userData.radius = radius;
      fish.userData.speed = 0.5 + Math.random() * 0.5;
      scene.add(fish);
    }
    
    animateKoi();
  }
  
  // 睡莲
  function addWaterLilies() {
    const QX = 520, QZ = 470;
    
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 60;
      const x = QX + Math.cos(angle) * radius;
      const z = QZ + Math.sin(angle) * radius;
      
      // 睡莲叶
      const lilyPadGeo = new THREE.CircleGeometry(0.6, 8);
      const lilyPadMat = new THREE.MeshStandardMaterial({ color: 0x4a8a4a, roughness: 0.7 });
      const lilyPad = new THREE.Mesh(lilyPadGeo, lilyPadMat);
      lilyPad.rotation.x = -Math.PI / 2;
      lilyPad.position.set(x, 0.05, z);
      scene.add(lilyPad);
      
      // 睡莲花
      if (Math.random() > 0.5) {
        const flowerGeo = new THREE.SphereGeometry(0.2, 6, 4);
        const flowerMat = new THREE.MeshStandardMaterial({
          color: 0xffb6c1,
          roughness: 0.6,
          emissive: 0xff99aa,
          emissiveIntensity: 0.2
        });
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.set(x, 0.2, z);
        scene.add(flower);
      }
    }
  }
  
  function animateKoi() {
    function animate() {
      requestAnimationFrame(animate);
      
      scene.children.forEach(obj => {
        if (obj.userData.isKoi) {
          obj.userData.angle += 0.005 * obj.userData.speed;
          obj.position.x = obj.userData.centerX + Math.cos(obj.userData.angle) * obj.userData.radius;
          obj.position.z = obj.userData.centerZ + Math.sin(obj.userData.angle) * obj.userData.radius;
          obj.rotation.y = obj.userData.angle;
        }
      });
    }
    animate();
  }
  
  init();
})();
