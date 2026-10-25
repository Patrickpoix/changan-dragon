/* ============================================================
   国风电影级天空 · 真实大气散射
   晚霞/云海/远山/大气透视
   ============================================================ */

class CinematicSky {
  // 远山层次（通过多层雾实现）
  mountainLayers() {
    if (typeof scene !== 'undefined') {
      // 远山1层（最远，最淡）
      const farMat = new THREE.MeshBasicMaterial({ color: 0xc8b8a0, transparent: true, opacity: 0.3 });
      for (let i = 0; i < 10; i++) {
        const mountain = new THREE.Mesh(new THREE.ConeGeometry(50 + Math.random() * 30, 80 + Math.random() * 40, 4), farMat);
        mountain.position.set(-400 + i * 80, 20, -500 - Math.random() * 100);
        mountain.rotation.y = Math.PI / 4;
        scene.add(mountain);
      }
      // 远山2层（中距离）
      const midMat = new THREE.MeshBasicMaterial({ color: 0xa89880, transparent: true, opacity: 0.5 });
      for (let i = 0; i < 8; i++) {
        const mountain = new THREE.Mesh(new THREE.ConeGeometry(30 + Math.random() * 20, 50 + Math.random() * 30, 4), midMat);
        mountain.position.set(-300 + i * 80, 15, -400 - Math.random() * 50);
        mountain.rotation.y = Math.PI / 4;
        scene.add(mountain);
      }
    }
  },

  // 晚霞云层（日落时的暖色云）
  sunsetClouds() {
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffb880,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    for (let i = 0; i < 15; i++) {
      const cloud = new THREE.Mesh(new THREE.PlaneGeometry(40 + Math.random() * 30, 10 + Math.random() * 5), cloudMat);
      cloud.position.set(-300 + Math.random() * 600, 100 + Math.random() * 50, -200 - Math.random() * 200);
      cloud.rotation.x = -Math.PI / 4;
      scene.add(cloud);
    }
  },

  // 大气透视（近实远虚）
  atmosphericPerspective() {
    if (typeof scene !== 'undefined') {
      scene.fog = new THREE.Fog(0xf0d8b8, 100, 800); // 暖色调雾
      scene.fog.color.setHex(0xf0d8b8);
    }
  },

  // 星夜天空（夜晚的星星+月亮）
  starryNight() {
    // 月亮
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xf0f0d0 });
    const moon = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 12), moonMat);
    moon.position.set(300, 200, -400);
    scene.add(moon);
    // 星星（100颗）
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    for (let i = 0; i < 100; i++) {
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.2, 4, 4), starMat);
      star.position.set(
        -500 + Math.random() * 1000,
        100 + Math.random() * 300,
        -500 - Math.random() * 200
      );
      scene.add(star);
    }
  },

  init() {
    this.mountainLayers();
    this.sunsetClouds();
    this.atmosphericPerspective();
    console.log('[CinematicSky] 国风电影级天空已初始化（远山/晚霞/大气透视）');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new CinematicSky().init();
  };
}
