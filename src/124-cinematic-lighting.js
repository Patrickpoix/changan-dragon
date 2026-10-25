/* ============================================================
   电影级灯光系统 · 国风漫剧光影
   黄金时刻/蓝调时刻/灯笼暖光/体积光
   ============================================================ */

class CinematicLighting {
  // 黄金时刻（日出后/日落前1小时）
  goldenHour() {
    if (typeof sunLight !== 'undefined') {
      sunLight.color.setHex(0xffd4a0); // 暖金色
      sunLight.intensity = 1.2;
      sunLight.position.set(200, 80, 100); // 低角度
    }
    if (typeof ambientLight !== 'undefined') {
      ambientLight.color.setHex(0xffe8d0);
      ambientLight.intensity = 0.4;
    }
    if (typeof scene !== 'undefined' && scene.fog) {
      scene.fog.color.setHex(0xf0d8b8);
    }
  },

  // 蓝调时刻（日落后）
  blueHour() {
    if (typeof sunLight !== 'undefined') {
      sunLight.color.setHex(0x8090c0);
      sunLight.intensity = 0.3;
    }
    if (typeof ambientLight !== 'undefined') {
      ambientLight.color.setHex(0x6070a0);
      ambientLight.intensity = 0.3;
    }
    if (typeof scene !== 'undefined' && scene.fog) {
      scene.fog.color.setHex(0x405080);
    }
  },

  // 夜晚灯笼暖光（朱雀大街/东西市）
  lanternGlow() {
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xff6020,
      emissive: 0xff4000,
      emissiveIntensity: 0.8,
      roughness: 0.5,
    });
    // 朱雀大街两侧灯笼柱
    for (let z = -300; z <= 300; z += 30) {
      for (let side = -1; side <= 1; side += 2) {
        const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), lanternMat);
        lantern.position.set(side * 12, 4, -z);
        scene.add(lantern);
        // 点光源（灯笼发光）
        const light = new THREE.PointLight(0xff6020, 0.5, 15);
        light.position.set(side * 12, 4, -z);
        scene.add(light);
      }
    }
  },

  // 大明宫宫灯（更亮更庄严）
  palaceLanterns() {
    const palaceLanternMat = new THREE.MeshStandardMaterial({
      color: 0xffaa40,
      emissive: 0xff8000,
      emissiveIntensity: 1.2,
      roughness: 0.3,
    });
    // 丹凤门前宫灯
    for (let i = -3; i <= 3; i++) {
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.8, 8), palaceLanternMat);
      lantern.position.set(i * 5, 3, -285);
      scene.add(lantern);
      const light = new THREE.PointLight(0xffaa40, 1.0, 20);
      light.position.set(i * 5, 3, -285);
      scene.add(light);
    }
  },

  // 体积光效果（通过半透明光柱模拟）
  godRays() {
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xfff0d0,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
    });
    // 从大明宫方向射下的体积光柱
    for (let i = -2; i <= 2; i++) {
      const ray = new THREE.Mesh(new THREE.CylinderGeometry(2, 8, 100, 8, 1, true), rayMat);
      ray.position.set(i * 30, 50, -300);
      ray.rotation.z = 0.1;
      scene.add(ray);
    }
  },

  init() {
    this.goldenHour(); // 默认黄金时刻
    this.lanternGlow();
    this.palaceLanterns();
    this.godRays();
    console.log('[CinematicLighting] 电影级灯光系统已初始化（黄金时刻+灯笼+体积光）');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new CinematicLighting().init();
  };
}
