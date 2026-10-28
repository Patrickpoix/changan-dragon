/* ============================================================
   天气季节v2 — 四时长安
   v2: 春雨、夏荷、秋叶、冬雪、四季变化
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 7500);
      return;
    }
    
    console.log(['SeasonsV2] 开始增强天气季节...']);
    
    addRainEffect();           // 春雨
    addSummerHeat();            // 夏日
    addAutumnLeaves();           // 秋叶
    addWinterSnow();             // 冬雪
    addSeasonalTrees();          // 季节树木
    
    console.log('[SeasonsV2] ✓ 天气季节增强完成');
  }
  
  // 春雨 — 细雨绵绵
  function addRainEffect() {
    if (typeof scene === 'undefined') return;
    
    console.log('[SeasonsV2] 添加春雨效果...');
    
    // 雨滴粒子
    const rainGeo = new THREE.BufferGeometry();
    const rainCount = 500;
    const positions = new Float32Array(rainCount * 3);
    
    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 1] = Math.random() * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    }
    
    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const rainMat = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.3,
      transparent: true,
      opacity: 0.6
    });
    
    const rain = new THREE.Points(rainGeo, rainMat);
    rain.name = 'rainEffect';
    scene.add(rain);
    
    console.log('[SeasonsV2] 春雨效果添加完成');
  }
  
  // 夏日 — 炎热阳光
  function addSummerHeat() {
    if (typeof scene === 'undefined') return;
    
    console.log('[SeasonsV2] 添加夏日效果...');
    
    // 夏日强光
    const summerLight = new THREE.PointLight(0xffff88, 1.5, 500);
    summerLight.position.set(0, 100, 0);
    scene.add(summerLight);
    
    console.log('[SeasonsV2] 夏日效果添加完成');
  }
  
  // 秋叶 — 飘落的枫叶
  function addAutumnLeaves() {
    if (typeof scene === 'undefined') return;
    
    console.log('[SeasonsV2] 添加秋叶效果...');
    
    const leafColors = [0xff6600, 0xff8800, 0xcc4400, 0xdd6600];
    
    // 50片落叶
    for (let i = 0; i < 50; i++) {
      const leaf = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 0.2),
        new THREE.MeshBasicMaterial({ 
          color: leafColors[i % leafColors.length],
          side: THREE.DoubleSide
        })
      );
      leaf.position.set(
        (Math.random() - 0.5) * 800,
        5 + Math.random() * 20,
        (Math.random() - 0.5) * 800
      );
      leaf.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      scene.add(leaf);
    }
    
    console.log('[SeasonsV2] 秋叶效果添加完成');
  }
  
  // 冬雪 — 雪花纷飞
  function addWinterSnow() {
    if (typeof scene === 'undefined') return;
    
    console.log('[SeasonsV2] 添加冬雪效果...');
    
    // 雪花粒子
    const snowGeo = new THREE.BufferGeometry();
    const snowCount = 300;
    const positions = new Float32Array(snowCount * 3);
    
    for (let i = 0; i < snowCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 1] = Math.random() * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    }
    
    snowGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8
    });
    
    const snow = new THREE.Points(snowGeo, snowMat);
    snow.name = 'snowEffect';
    scene.add(snow);
    
    console.log('[SeasonsV2] 冬雪效果添加完成');
  }
  
  // 季节树木 — 不同季节的树木
  function addSeasonalTrees() {
    if (typeof scene === 'undefined') return;
    
    console.log('[SeasonsV2] 添加季节树木...');
    
    // 春季桃树
    for (let i = 0; i < 10; i++) {
      const tree = new THREE.Mesh(
        new THREE.SphereGeometry(2, 6, 5),
        new THREE.MeshStandardMaterial({ 
          color: 0xffb6c1,
          roughness: 0.8
        })
      );
      tree.position.set(
        -300 + (Math.random() - 0.5) * 100,
        4,
        200 + (Math.random() - 0.5) * 100
      );
      tree.castShadow = true;
      scene.add(tree);
    }
    
    // 秋季枫树
    for (let i = 0; i < 10; i++) {
      const tree = new THREE.Mesh(
        new THREE.SphereGeometry(2.5, 6, 5),
        new THREE.MeshStandardMaterial({ 
          color: 0xcc4400,
          roughness: 0.8
        })
      );
      tree.position.set(
        300 + (Math.random() - 0.5) * 100,
        4.5,
        -200 + (Math.random() - 0.5) * 100
      );
      tree.castShadow = true;
      scene.add(tree);
    }
    
    console.log('[SeasonsV2] 季节树木添加完成');
  }
  
  init();
})();
