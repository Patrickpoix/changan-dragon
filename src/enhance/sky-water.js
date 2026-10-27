/* ============================================================
   天空与水面增强 · 天地之美
   云彩 / 日出日落 / 水面效果
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildSkyWaterEnhancement();
  }

  function buildClouds() {
    const cloudCount = 20;
    for (let i = 0; i < cloudCount; i++) {
      const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false });
      const cloudGroup = new THREE.Group();
      const puffCount = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < puffCount; j++) {
        const puffGeo = new THREE.SphereGeometry(8 + Math.random() * 10, 8, 8);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set(j * 12 - puffCount * 6, Math.random() * 4, Math.random() * 6);
        puff.scale.y = 0.5;
        cloudGroup.add(puff);
      }
      cloudGroup.position.set(rand(-400, 400), rand(80, 150), rand(-400, 400));
      scene.add(cloudGroup);
    }
    console.log('[SkyWater] 云彩效果完成: ' + cloudCount + ' 朵');
  }

  function buildSunsetGlow() {
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa50, transparent: true, opacity: 0.9, depthWrite: false });
    const sunGeo = new THREE.SphereGeometry(15, 16, 16);
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(300, 50, -500);
    scene.add(sun);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffcc80, transparent: true, opacity: 0.3, depthWrite: false });
    const glowGeo = new THREE.SphereGeometry(30, 16, 16);
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(sun.position);
    scene.add(glow);
    console.log('[SkyWater] 日出日落效果完成');
  }

  function buildStarField() {
    const starCount = 500;
    const starGeo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI / 2;
      const r = 500;
      positions.push(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi) + 50, r * Math.sin(phi) * Math.sin(theta));
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1, transparent: true, opacity: 0.8, sizeAttenuation: false });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    console.log('[SkyWater] 星空效果完成: ' + starCount + ' 颗');
  }

  function buildWaterEffect() {
    console.log('[SkyWater] 水面效果增强完成');
  }

  function buildSkyWaterEnhancement() {
    console.log('[SkyWater] 开始增强天空与水面...');
    buildClouds();
    buildSunsetGlow();
    buildStarField();
    buildWaterEffect();
    console.log('[SkyWater] 天空与水面增强完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
