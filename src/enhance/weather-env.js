/* ============================================================
   天气与环境增强 · 四时之景
   雾效 / 雨丝 / 雪粒 / 环境氛围
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildWeatherEnhancement();
  }

  function buildMorningFog() {
    for (let i = 0; i < 10; i++) {
      const fogMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const fogGeo = new THREE.PlaneGeometry(200, 50);
      const fog = new THREE.Mesh(fogGeo, fogMat);
      fog.rotation.x = -Math.PI / 2;
      fog.position.set(rand(-300, 300), rand(2, 8), rand(-300, 300));
      scene.add(fog);
    }
    console.log('[Weather] 晨雾效果完成');
  }

  function buildSnowParticles() {
    const snowCount = 500;
    const snowGeo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < snowCount; i++) {
      positions.push(rand(-400, 400), rand(20, 150), rand(-400, 400));
    }
    snowGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff, size: 1.5, transparent: true, opacity: 0.8, sizeAttenuation: true
    });
    const snow = new THREE.Points(snowGeo, snowMat);
    scene.add(snow);
    console.log('[Weather] 飘雪粒子完成: ' + snowCount + ' 片');
  }

  function buildFallingLeaves() {
    const leafCount = 200;
    const leafGeo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < leafCount; i++) {
      positions.push(rand(-200, 200), rand(10, 30), rand(-200, 200));
    }
    leafGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const leafMat = new THREE.PointsMaterial({
      color: 0xd0a050, size: 2, transparent: true, opacity: 0.7, sizeAttenuation: true
    });
    const leaves = new THREE.Points(leafGeo, leafMat);
    scene.add(leaves);
    console.log('[Weather] 落叶粒子完成: ' + leafCount + ' 片');
  }

  function buildWeatherEnhancement() {
    console.log('[Weather] 开始增强天气与环境...');
    buildMorningFog();
    buildSnowParticles();
    buildFallingLeaves();
    console.log('[Weather] 天气与环境增强完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
