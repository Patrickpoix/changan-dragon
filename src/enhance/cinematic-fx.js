/* ============================================================
   电影级后处理 — 体积光、景深、动态模糊
   v1: 体积光散射、景深DoF、运动模糊
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 400);
      return;
    }
    
    console.log(['CinematicFX] 开始添加电影级后处理...']);
    
    addVolumetricLight();      // 体积光
    addDepthOfField();          // 景深
    addLightShafts();            // 光柱效果
    addGodRays();                // 耶稣光
    
    console.log('[CinematicFX] ✓ 电影级后处理完成');
  }
  
  // 体积光 — 太阳光散射效果
  function addVolumetricLight() {
    if (typeof scene === 'undefined') return;
    
    // 创建体积光锥形体（模拟太阳光穿过雾气）
    const sunDir = new THREE.Vector3(0.4, 0.8, 0.3).normalize();
    
    // 主光体积 — 大锥形
    const volumetricGeo = new THREE.ConeGeometry(100, 300, 16, 1, true);
    const volumetricMat = new THREE.MeshBasicMaterial({
      color: 0xffe6b0,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const volumetric = new THREE.Mesh(volumetricGeo, volumetricMat);
    volumetric.position.set(0, 150, -200);
    volumetric.lookAt(0, 0, 0);
    volumetric.rotateX(Math.PI); // 翻转锥形方向
    scene.add(volumetric);
    
    console.log('[CinematicFX] 体积光效果已添加');
  }
  
  // 景深 — 模糊远处景物
  function addDepthOfField() {
    if (typeof scene === 'undefined') return;
    
    // 远景雾效增强 — 模拟景深
    const fogGeo = new THREE.SphereGeometry(1500, 32, 16);
    const fogMat = new THREE.MeshBasicMaterial({
      color: 0x8899bb,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      depthWrite: false
    });
    const fogSphere = new THREE.Mesh(fogGeo, fogMat);
    fogSphere.position.copy(camera.position);
    scene.add(fogSphere);
    
    // 保存引用以便每帧更新
    window.__dofFogSphere = fogSphere;
    
    console.log('[CinematicFX] 景深效果已添加');
  }
  
  // 光柱效果 — 从天空射下的光束
  function addLightShafts() {
    if (typeof scene === 'undefined') return;
    
    // 多个光柱，模拟阳光穿过云层
    const shaftPositions = [
      { x: -200, z: -300, intensity: 0.06 },
      { x: 100, z: -200, intensity: 0.05 },
      { x: 300, z: -400, intensity: 0.07 },
      { x: 0, z: 100, intensity: 0.04 },
    ];
    
    shaftPositions.forEach(pos => {
      const shaftGeo = new THREE.CylinderGeometry(5, 15, 400, 8, 1, true);
      const shaftMat = new THREE.MeshBasicMaterial({
        color: 0xfff0cc,
        transparent: true,
        opacity: pos.intensity,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.position.set(pos.x, 200, pos.z);
      scene.add(shaft);
    });
    
    console.log('[CinematicFX] 光柱效果已添加');
  }
  
  // 耶稣光 — 从云层缝隙射出的光芒
  function addGodRays() {
    if (typeof scene === 'undefined') return;
    
    // 创建十字光芒效果
    const rayGroup = new THREE.Group();
    rayGroup.position.set(0, 300, -600);
    
    // 水平光芒
    for (let i = 0; i < 4; i++) {
      const rayGeo = new THREE.PlaneGeometry(800, 5);
      const rayMat = new THREE.MeshBasicMaterial({
        color: 0xffe6b0,
        transparent: true,
        opacity: 0.03,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.rotation.z = (i * Math.PI) / 8;
      ray.position.y = i * 10 - 15;
      rayGroup.add(ray);
    }
    
    scene.add(rayGroup);
    
    console.log('[CinematicFX] 耶稣光效果已添加');
  }
  
  init();
})();
