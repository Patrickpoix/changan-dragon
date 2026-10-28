/* ============================================================
   夜景氛围v3 — 盛唐长安夜不眠
   v3: 万家灯火、月光、夜市、烟花、流萤
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 6500);
      return;
    }
    
    console.log(['NightV3] 开始增强夜景氛围...']);
    
    addHouseLights();          // 万家灯火
    addMoonlight();              // 月光
    addNightMarket();            // 夜市
    addFireworks();              // 烟花
    addFireflies();              // 流萤
    
    console.log('[NightV3] ✓ 夜景氛围增强完成');
  }
  
  // 万家灯火 — 坊里窗户灯光
  function addHouseLights() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NightV3] 添加万家灯火...');
    
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xffeecc,
      emissive: 0xffcc88,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.7
    });
    
    // 随机分布的窗户灯光
    for (let i = 0; i < 100; i++) {
      const window = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 1),
        windowMat
      );
      window.position.set(
        (Math.random() - 0.5) * 1000,
        2 + Math.random() * 3,
        (Math.random() - 0.5) * 900
      );
      window.rotation.y = Math.random() * Math.PI * 2;
      scene.add(window);
    }
    
    console.log('[NightV3] 万家灯火添加完成，共100个窗户');
  }
  
  // 月光 — 皎洁月亮
  function addMoonlight() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NightV3] 添加月光...');
    
    // 月亮
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(30, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xfff8dc })
    );
    moon.position.set(-500, 400, -800);
    scene.add(moon);
    
    // 月亮光晕
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(50, 16, 12),
      new THREE.MeshBasicMaterial({
        color: 0xfff8dc,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    halo.position.copy(moon.position);
    scene.add(halo);
    
    console.log('[NightV3] 月光添加完成');
  }
  
  // 夜市 — 朱雀大街夜市
  function addNightMarket() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NightV3] 添加夜市...');
    
    // 夜市摊位灯
    for (let z = -100; z < 300; z += 20) {
      // 摊位灯
      const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 6, 4),
        new THREE.MeshStandardMaterial({
          color: 0xff6633,
          emissive: 0xff4400,
          emissiveIntensity: 1.2
        })
      );
      light.position.set(-20, 3, z);
      scene.add(light);
      
      const light2 = light.clone();
      light2.position.x = 20;
      scene.add(light2);
      
      // 点光源
      if (z % 60 === 0) {
        const pl = new THREE.PointLight(0xff6633, 0.5, 30);
        pl.position.set(-20, 3, z);
        scene.add(pl);
      }
    }
    
    console.log('[NightV3] 夜市添加完成');
  }
  
  // 烟花 — 夜空中绽放的烟花
  function addFireworks() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NightV3] 添加烟花...');
    
    // 5组烟花
    for (let i = 0; i < 5; i++) {
      const fx = (Math.random() - 0.5) * 600;
      const fy = 80 + Math.random() * 60;
      const fz = (Math.random() - 0.5) * 600;
      
      // 烟花中心
      const center = new THREE.Mesh(
        new THREE.SphereGeometry(1, 8, 6),
        new THREE.MeshBasicMaterial({ 
          color: [0xff4444, 0xffaa00, 0x4488ff, 0xff44ff, 0x44ff88][i],
          transparent: true,
          opacity: 0.8
        })
      );
      center.position.set(fx, fy, fz);
      scene.add(center);
      
      // 烟花放射状粒子
      for (let j = 0; j < 12; j++) {
        const angle = (j / 12) * Math.PI * 2;
        const particle = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 4, 3),
          new THREE.MeshBasicMaterial({ 
            color: [0xff4444, 0xffaa00, 0x4488ff, 0xff44ff, 0x44ff88][i],
            transparent: true,
            opacity: 0.6
          })
        );
        particle.position.set(
          fx + Math.cos(angle) * (5 + Math.random() * 5),
          fy + (Math.random() - 0.5) * 10,
          fz + Math.sin(angle) * (5 + Math.random() * 5)
        );
        scene.add(particle);
      }
    }
    
    console.log('[NightV3] 烟花添加完成，共5组');
  }
  
  // 流萤 — 夏夜飞舞的萤火虫
  function addFireflies() {
    if (typeof scene === 'undefined') return;
    
    console.log('[NightV3] 添加流萤...');
    
    // 30只萤火虫
    for (let i = 0; i < 30; i++) {
      const firefly = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 4, 3),
        new THREE.MeshBasicMaterial({ 
          color: 0xffff44,
          transparent: true,
          opacity: 0.8
        })
      );
      firefly.position.set(
        (Math.random() - 0.5) * 800,
        2 + Math.random() * 5,
        (Math.random() - 0.5) * 800
      );
      scene.add(firefly);
    }
    
    console.log('[NightV3] 流萤添加完成，共30只');
  }
  
  init();
})();
