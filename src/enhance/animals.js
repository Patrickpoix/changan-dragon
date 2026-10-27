/* ============================================================
   动物宠物增强 — 长安生机盎然
   v1: 飞鸟、蝴蝶、猫狗、马匹
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Animals] 开始增强动物宠物效果...']);
    
    addBirds();
    addButterflies();
    addCatsDogs();
    addHorses();
    
    console.log('[Animals] ✓ 动物宠物效果增强完成');
  }
  
  // 飞鸟
  function addBirds() {
    const birdCount = 50;
    
    for (let i = 0; i < birdCount; i++) {
      const birdGeo = new THREE.ConeGeometry(0.2, 0.8, 4);
      const birdColors = [0x4a4a4a, 0x8b4513, 0x2e8b57, 0x4169e1];
      const birdMat = new THREE.MeshStandardMaterial({
        color: pick(birdColors),
        roughness: 0.6
      });
      const bird = new THREE.Mesh(birdGeo, birdMat);
      
      bird.position.set(
        (Math.random() - 0.5) * 800,
        30 + Math.random() * 50,
        (Math.random() - 0.5) * 800
      );
      
      bird.userData.isBird = true;
      bird.userData.baseY = bird.position.y;
      bird.userData.speed = 0.5 + Math.random() * 1;
      bird.userData.flapPhase = Math.random() * Math.PI * 2;
      
      scene.add(bird);
    }
    
    animateBirds();
  }
  
  // 蝴蝶
  function addButterflies() {
    const butterflyCount = 30;
    
    for (let i = 0; i < butterflyCount; i++) {
      const butterflyGeo = new THREE.PlaneGeometry(0.3, 0.2);
      const butterflyColors = [0xff69b4, 0xffd700, 0x9370db, 0xff6347];
      const butterflyMat = new THREE.MeshBasicMaterial({
        color: pick(butterflyColors),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const butterfly = new THREE.Mesh(butterflyGeo, butterflyMat);
      
      // 蝴蝶主要在花丛附近
      butterfly.position.set(
        520 + (Math.random() - 0.5) * 150,
        2 + Math.random() * 3,
        470 + (Math.random() - 0.5) * 120
      );
      
      butterfly.userData.isButterfly = true;
      butterfly.userData.baseX = butterfly.position.x;
      butterfly.userData.baseZ = butterfly.position.z;
      butterfly.userData.phase = Math.random() * Math.PI * 2;
      
      scene.add(butterfly);
    }
    
    animateButterflies();
  }
  
  // 猫狗
  function addCatsDogs() {
    // 街道上的猫
    for (let i = 0; i < 10; i++) {
      createCat((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 600);
    }
    
    // 市场里的狗
    for (let i = 0; i < 8; i++) {
      createDog(150 + (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200);
    }
  }
  
  // 马匹
  function addHorses() {
    // 驿站的马
    for (let i = 0; i < 12; i++) {
      createHorse(0 + (Math.random() - 0.5) * 100, 400 + (Math.random() - 0.5) * 50);
    }
  }
  
  // 动画
  function animateBirds() {
    function animate() {
      requestAnimationFrame(animate);
      
      scene.children.forEach(obj => {
        if (obj.userData.isBird) {
          obj.position.x += obj.userData.speed * 0.1;
          obj.position.y = obj.userData.baseY + Math.sin(Date.now() * 0.001 + obj.userData.flapPhase) * 2;
          obj.rotation.y = obj.userData.flapPhase;
          
          // 边界循环
          if (obj.position.x > 500) obj.position.x = -500;
        }
      });
    }
    animate();
  }
  
  function animateButterflies() {
    function animate() {
      requestAnimationFrame(animate);
      
      scene.children.forEach(obj => {
        if (obj.userData.isButterfly) {
          obj.userData.phase += 0.02;
          obj.position.x = obj.userData.baseX + Math.sin(obj.userData.phase) * 5;
          obj.position.z = obj.userData.baseZ + Math.cos(obj.userData.phase * 0.7) * 5;
          obj.position.y += Math.sin(obj.userData.phase * 3) * 0.02;
          obj.rotation.z = Math.sin(obj.userData.phase * 5) * 0.3;
        }
      });
    }
    animate();
  }
  
  // 工具函数
  function createCat(x, z) {
    const catGeo = new THREE.CapsuleGeometry(0.15, 0.4, 4, 6);
    const catColors = [0x3a3a3a, 0x8b4513, 0xffd700, 0xffffff];
    const catMat = new THREE.MeshStandardMaterial({ color: pick(catColors), roughness: 0.8 });
    const cat = new THREE.Mesh(catGeo, catMat);
    cat.position.set(x, 0.3, z);
    cat.castShadow = true;
    scene.add(cat);
  }
  
  function createDog(x, z) {
    const dogGeo = new THREE.CapsuleGeometry(0.25, 0.6, 4, 6);
    const dogColors = [0x8b4513, 0xd2691e, 0x3a3a3a, 0xffffff];
    const dogMat = new THREE.MeshStandardMaterial({ color: pick(dogColors), roughness: 0.8 });
    const dog = new THREE.Mesh(dogGeo, dogMat);
    dog.position.set(x, 0.5, z);
    dog.castShadow = true;
    scene.add(dog);
  }
  
  function createHorse(x, z) {
    const horseGeo = new THREE.CapsuleGeometry(0.4, 1.5, 4, 6);
    const horseColors = [0x8b4513, 0x2f4f4f, 0x696969, 0xffffff];
    const horseMat = new THREE.MeshStandardMaterial({ color: pick(horseColors), roughness: 0.7 });
    const horse = new THREE.Mesh(horseGeo, horseMat);
    horse.position.set(x, 1, z);
    horse.castShadow = true;
    scene.add(horse);
  }
  
  init();
})();
