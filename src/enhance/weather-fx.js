/* ============================================================
   天气氛围增强 — 四时之景不同
   v1: 晴天、阴天、雨天、雪天、雾天
   ============================================================ */

(function() {
  'use strict';
  
  let weatherState = 'sunny';
  let rainParticles = null;
  let snowParticles = null;
  let fogMesh = null;
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Weather] 开始增强天气氛围效果...']);
    
    createRainParticles();
    createSnowParticles();
    createFogEffects();
    setupWeatherCycle();
    
    console.log('[Weather] ✓ 天气氛围效果增强完成');
  }
  
  // 雨天粒子
  function createRainParticles() {
    const rainCount = 2000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 1000;
      rainPositions[i * 3 + 1] = Math.random() * 100;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    }
    
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    
    const rainMat = new THREE.PointsMaterial({
      color: 0x88aacc,
      size: 0.3,
      transparent: true,
      opacity: 0.6
    });
    
    rainParticles = new THREE.Points(rainGeo, rainMat);
    rainParticles.visible = false;
    scene.add(rainParticles);
  }
  
  // 雪天粒子
  function createSnowParticles() {
    const snowCount = 1500;
    const snowGeo = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);
    
    for (let i = 0; i < snowCount; i++) {
      snowPositions[i * 3] = (Math.random() - 0.5) * 1000;
      snowPositions[i * 3 + 1] = Math.random() * 100;
      snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    }
    
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
    
    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8
    });
    
    snowParticles = new THREE.Points(snowGeo, snowMat);
    snowParticles.visible = false;
    scene.add(snowParticles);
  }
  
  // 雾效
  function createFogEffects() {
    // 多层雾效
    for (let i = 0; i < 3; i++) {
      const fogGeo = new THREE.PlaneGeometry(2000, 100);
      const fogMat = new THREE.MeshBasicMaterial({
        color: 0xdddddd,
        transparent: true,
        opacity: 0.1 - i * 0.03,
        depthWrite: false
      });
      const fog = new THREE.Mesh(fogGeo, fogMat);
      fog.position.y = 10 + i * 20;
      fog.rotation.x = -Math.PI / 2;
      fogMesh = fog;
      scene.add(fog);
    }
  }
  
  // 天气循环
  function setupWeatherCycle() {
    const weathers = ['sunny', 'cloudy', 'rainy', 'foggy'];
    let weatherIndex = 0;
    
    setInterval(() => {
      weatherIndex = (weatherIndex + 1) % weathers.length;
      setWeather(weathers[weatherIndex]);
    }, 60000); // 每分钟切换一次天气
  }
  
  function setWeather(type) {
    weatherState = type;
    
    switch(type) {
      case 'sunny':
        rainParticles.visible = false;
        snowParticles.visible = false;
        if (typeof scene !== 'undefined') scene.fog = new THREE.Fog(0x87ceeb, 200, 1200);
        break;
        
      case 'cloudy':
        rainParticles.visible = false;
        snowParticles.visible = false;
        if (typeof scene !== 'undefined') scene.fog = new THREE.Fog(0x999999, 150, 800);
        break;
        
      case 'rainy':
        rainParticles.visible = true;
        snowParticles.visible = false;
        if (typeof scene !== 'undefined') scene.fog = new THREE.Fog(0x666666, 100, 500);
        animateRain();
        break;
        
      case 'foggy':
        rainParticles.visible = false;
        snowParticles.visible = false;
        if (typeof scene !== 'undefined') scene.fog = new THREE.Fog(0xcccccc, 50, 300);
        break;
    }
    
    console.log('[Weather] 天气切换为: ' + type);
  }
  
  function animateRain() {
    function animate() {
      if (!rainParticles.visible) return;
      
      requestAnimationFrame(animate);
      const positions = rainParticles.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 2;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 100;
        }
      }
      
      rainParticles.geometry.attributes.position.needsUpdate = true;
    }
    animate();
  }
  
  init();
})();
