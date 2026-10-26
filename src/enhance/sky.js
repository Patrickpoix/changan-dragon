/* ============================================================
   Sky - 天空系统Owner
   负责：天空/太阳/月亮/星星/云/远山
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;
  let clouds = [];

  function init() {
    if (initialized) return;
    initialized = true;
    console.log('[Sky] 初始化天空系统...');
    try {
      if (typeof scene === 'undefined') return;

      // 远山（秦岭）
      const mountainMat = new THREE.MeshStandardMaterial({ color: 0x6a7a8a, roughness: 1, fog: true });
      for (let i = 0; i < 8; i++) {
        const mountain = new THREE.Mesh(new THREE.ConeGeometry(100 + Math.random() * 50, 50 + Math.random() * 80, 5), mountainMat);
        mountain.position.set(-500 + i * 150, 40, -600 - Math.random() * 100);
        scene.add(mountain);
      }

      // 云朵
      const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, fog: false });
      for (let i = 0; i < 10; i++) {
        const cloud = new THREE.Mesh(new THREE.SphereGeometry(10 + Math.random() * 15, 6, 5), cloudMat);
        cloud.position.set(-400 + Math.random() * 800, 80 + Math.random() * 40, -400 + Math.random() * 800);
        cloud.scale.y = 0.3;
        cloud.userData.speed = 0.02 + Math.random() * 0.03;
        clouds.push(cloud);
        scene.add(cloud);
      }

      // 太阳
      const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffee88, fog: false }));
      sunMesh.position.set(200, 120, -300);
      scene.add(sunMesh);

      // 月亮
      const moon = new THREE.Mesh(new THREE.SphereGeometry(15, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xfff8e0, fog: false }));
      moon.position.set(-200, 150, -300);
      scene.add(moon);

      // 星星
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(500 * 3);
      for (let i = 0; i < 500; i++) {
        starPos[i*3] = -500 + Math.random() * 1000;
        starPos[i*3+1] = 100 + Math.random() * 200;
        starPos[i*3+2] = -500 + Math.random() * 1000;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, fog: false }));
      scene.add(stars);

      console.log('[Sky] 天空系统初始化完成');
    } catch(e) { console.warn('[Sky] 初始化失败:', e); }
  }

  function animate() {
    if (!initialized) return;
    clouds.forEach(cloud => {
      cloud.position.x += cloud.userData.speed;
      if (cloud.position.x > 500) cloud.position.x = -500;
    });
    requestAnimationFrame(animate);
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(init, 14000);
      setTimeout(animate, 15000);
    } else {
      setTimeout(checkReady, 300);
    }
  }
  checkReady();
})();
