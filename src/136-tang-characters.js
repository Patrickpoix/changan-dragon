/* ============================================================
   唐代人物角色系统 · 国风漫剧风格
   替代胶囊体NPC，添加唐代服饰和简单行走动画
   ============================================================ */

class TangCharacterSystem {
  // 创建唐代人物
  createTangCharacter(options = {}) {
    const { x = 0, z = 0, type = 'pedestrian', scale = 1 } = options;
    const group = new THREE.Group();

    // 唐代服饰颜色方案
    const colorSchemes = {
      pedestrian: { robe: 0x8b4513, trim: 0x2f4f4f, hat: 0x333333 },
      merchant: { robe: 0x8b0000, trim: 0xffd700, hat: 0x2f4f4f },
      monk: { robe: 0xd2b48c, trim: 0x8b4513, hat: 0xd2b48c },
      scholar: { robe: 0x4a5568, trim: 0xffd700, hat: 0x2d3748 },
      soldier: { robe: 0x2f4f4f, trim: 0xffd700, hat: 0x2f4f4f },
    };

    const colors = colorSchemes[type] || colorSchemes.pedestrian;

    // 长袍（身体）
    const robeMat = new THREE.MeshStandardMaterial({ color: colors.robe, roughness: 0.8 });
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8), robeMat);
    robe.position.y = 0.9;
    robe.castShadow = true;
    group.add(robe);

    // 衣领（镶边）
    const trimMat = new THREE.MeshStandardMaterial({ color: colors.trim, roughness: 0.7 });
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 4, 8), trimMat);
    collar.position.y = 1.5;
    collar.rotation.x = Math.PI / 2;
    group.add(collar);

    // 头部
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.6 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), headMat);
    head.position.y = 1.75;
    group.add(head);

    // 唐代头巾/帽子
    const hatMat = new THREE.MeshStandardMaterial({ color: colors.hat, roughness: 0.8 });
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.1, 8), hatMat);
    hat.position.y = 1.92;
    group.add(hat);

    // 手臂
    const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);
    const leftArm = new THREE.Mesh(armGeometry, robeMat);
    leftArm.position.set(-0.35, 1.1, 0);
    leftArm.rotation.z = 0.2;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, robeMat);
    rightArm.position.set(0.35, 1.1, 0);
    rightArm.rotation.z = -0.2;
    group.add(rightArm);

    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.userData = { type, leftArm, rightArm, walkTime: Math.random() * 10 };

    return group;
  },

  // 在朱雀大街添加行人
  populateZhuqueStreet() {
    const characterTypes = ['pedestrian', 'merchant', 'scholar', 'monk'];
    for (let i = 0; i < 30; i++) {
      const type = characterTypes[Math.floor(Math.random() * characterTypes.length)];
      const x = (Math.random() - 0.5) * 20; // 街道中央
      const z = (Math.random() - 0.5) * 800; // 街道长度
      const char = this.createTangCharacter({ x, z, type });
      scene.add(char);
    }
    console.log('[TangCharacterSystem] 朱雀大街添加了30个唐代人物');
  },

  // 在东西市添加商人
  populateMarket() {
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      const char = this.createTangCharacter({ x, z, type: 'merchant' });
      scene.add(char);
    }
    console.log('[TangCharacterSystem] 东西市添加了20个商人');
  },

  // 简单行走动画（在主循环中调用）
  animate(dt) {
    if (typeof scene === 'undefined') return;
    scene.traverse((obj) => {
      if (obj.userData && obj.userData.leftArm && obj.userData.rightArm) {
        obj.userData.walkTime += dt * 2;
        const swing = Math.sin(obj.userData.walkTime) * 0.3;
        obj.userData.leftArm.rotation.x = swing;
        obj.userData.rightArm.rotation.x = -swing;
      }
    });
  },

  init() {
    this.populateZhuqueStreet();
    this.populateMarket();

    // 注册动画更新
    if (typeof onAnimate === 'function') {
      const origAnimate = onAnimate;
      onAnimate = function(dt) {
        origAnimate(dt);
        tangCharacterSystem.animate(dt);
      };
    }

    console.log('[TangCharacterSystem] 唐代人物角色系统初始化完成');
  },
}

// 全局实例
let tangCharacterSystem = null;

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    tangCharacterSystem = new TangCharacterSystem();
    tangCharacterSystem.init();
  };
}
