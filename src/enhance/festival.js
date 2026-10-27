/* ============================================================
   节日庆典增强 — 盛唐万国来朝
   v1: 灯笼、烟花、彩灯、舞狮
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Festival] 开始增强节日庆典效果...']);
    
    addStreetLanterns();
    addFireworks();
    addColorfulLights();
    addLionDance();
    
    console.log('[Festival] ✓ 节日庆典效果增强完成');
  }
  
  // 街道灯笼
  function addStreetLanterns() {
    // 朱雀大街两侧灯笼
    for (let z = -500; z <= 600; z += 30) {
      createLantern(-35, z);
      createLantern(35, z);
    }
    
    // 东西市灯笼
    for (let x = 100; x <= 200; x += 20) {
      for (let z = -100; z <= 100; z += 20) {
        if (Math.random() > 0.5) createLantern(x, z);
      }
    }
    
    for (let x = -200; x <= -100; x += 20) {
      for (let z = -100; z <= 100; z += 20) {
        if (Math.random() > 0.5) createLantern(x, z);
      }
    }
  }
  
  // 烟花
  function addFireworks() {
    // 定时放烟花
    setInterval(() => {
      launchFirework(
        (Math.random() - 0.5) * 400,
        100 + Math.random() * 100,
        (Math.random() - 0.5) * 400
      );
    }, 8000);
  }
  
  // 彩灯
  function addColorfulLights() {
    // 大明宫彩灯
    for (let i = 0; i < 50; i++) {
      createColorLight(
        320 + (Math.random() - 0.5) * 100,
        20 + Math.random() * 30,
        -460 + (Math.random() - 0.5) * 80
      );
    }
  }
  
  // 舞狮
  function addLionDance() {
    createLion(0, 400);
    createLion(50, 400);
  }
  
  // 工具函数
  function createLantern(x, z) {
    const lanternGeo = new THREE.SphereGeometry(0.5, 8, 6);
    const lanternColors = [0xff4444, 0xff6600, 0xffdd00];
    const lanternMat = new THREE.MeshStandardMaterial({
      color: pick(lanternColors),
      emissive: pick(lanternColors),
      emissiveIntensity: 0.6,
      roughness: 0.6
    });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.set(x, 5, z);
    scene.add(lantern);
    
    // 灯笼绳
    const ropeGeo = new THREE.CylinderGeometry(0.02, 0.02, 2, 4);
    const ropeMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.position.set(x, 6.5, z);
    scene.add(rope);
  }
  
  function launchFirework(x, y, z) {
    // 烟花粒子
    const fireworkCount = 100;
    const fireworkGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(fireworkCount * 3);
    const velocities = [];
    
    for (let i = 0; i < fireworkCount; i++) {
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      velocities.push({
        x: Math.cos(angle) * speed,
        y: Math.random() * 2,
        z: Math.sin(angle) * speed
      });
    }
    
    fireworkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const fireworkColors = [0xff4444, 0xffdd00, 0x44ff44, 0x4488ff, 0xff44ff];
    const fireworkMat = new THREE.PointsMaterial({
      color: pick(fireworkColors),
      size: 0.5,
      transparent: true,
      opacity: 1
    });
    
    const firework = new THREE.Points(fireworkGeo, fireworkMat);
    scene.add(firework);
    
    // 动画
    let frame = 0;
    function animate() {
      frame++;
      if (frame > 100) {
        scene.remove(firework);
        return;
      }
      
      requestAnimationFrame(animate);
      const pos = firework.geometry.attributes.position.array;
      
      for (let i = 0; i < fireworkCount; i++) {
        pos[i * 3] += velocities[i].x * 0.1;
        pos[i * 3 + 1] += velocities[i].y * 0.1 - 0.02;
        pos[i * 3 + 2] += velocities[i].z * 0.1;
      }
      
      firework.material.opacity = 1 - frame / 100;
      firework.geometry.attributes.position.needsUpdate = true;
    }
    animate();
  }
  
  function createColorLight(x, y, z) {
    const lightGeo = new THREE.SphereGeometry(0.3, 6, 4);
    const lightColors = [0xff4444, 0xffdd00, 0x44ff44, 0x4488ff, 0xff44ff];
    const lightMat = new THREE.MeshBasicMaterial({
      color: pick(lightColors),
      transparent: true,
      opacity: 0.8
    });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(x, y, z);
    scene.add(light);
  }
  
  function createLion(x, z) {
    const lionGroup = new THREE.Group();
    
    // 狮身
    const bodyGeo = new THREE.CapsuleGeometry(0.5, 1.5, 4, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    lionGroup.add(body);
    
    // 狮头
    const headGeo = new THREE.SphereGeometry(0.5, 8, 6);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffdd00, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.2;
    head.castShadow = true;
    lionGroup.add(head);
    
    lionGroup.position.set(x, 0, z);
    scene.add(lionGroup);
  }
  
  init();
})();
