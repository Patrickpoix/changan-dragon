/* ============================================================
   核心建筑细节提升 · 国风电影质感
   斗拱彩绘/门窗格扇/台阶栏杆/店铺招牌
   ============================================================ */

class CoreBuildingDetails {
  // 大明宫含元殿彩绘斗拱
  damingCaigong() {
    // 斗拱彩绘颜色（唐代：朱红、石青、石绿、描金）
    const caigongColors = [0xc0392b, 0x2980b9, 0x27ae60, 0xf1c40f];

    // 在大明宫主殿前添加斗拱细节
    for (let i = -5; i <= 5; i++) {
      const colorIdx = Math.abs(i) % caigongColors.length;
      const mat = new THREE.MeshStandardMaterial({ color: caigongColors[colorIdx], roughness: 0.7 });

      // 坐斗
      const zuodou = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.6), mat);
      zuodou.position.set(i * 4, 12, -100);
      zuodou.castShadow = true;
      scene.add(zuodou);

      // 翘
      const qiao = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 1.5), mat);
      qiao.position.set(i * 4, 12.5, -100);
      qiao.castShadow = true;
      scene.add(qiao);
    }
    console.log('[CoreBuildingDetails] 大明宫斗拱彩绘完成');
  },

  // 门窗格扇
  doorWindows() {
    // 朱红门框 + 格扇窗
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.6 });
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.3, transparent: true, opacity: 0.7 });

    // 大明宫主殿门窗
    for (let i = -4; i <= 4; i += 2) {
      // 门框
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.2), frameMat);
      frame.position.set(i * 3, 4, -89.9);
      scene.add(frame);

      // 格扇窗
      const window = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.1), windowMat);
      window.position.set(i * 3, 4, -89.8);
      scene.add(window);
    }
    console.log('[CoreBuildingDetails] 大明宫门窗格扇完成');
  },

  // 台阶栏杆（汉白玉栏杆）
  stairsRailing() {
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.4 });

    // 大明宫前台阶栏杆
    for (let x = -10; x <= 10; x += 2) {
      // 望柱
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.3), marbleMat);
      post.position.set(x, 2, -95);
      post.castShadow = true;
      scene.add(post);

      // 栏板
      if (x < 10) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 0.15), marbleMat);
        panel.position.set(x + 1, 1.5, -95);
        panel.castShadow = true;
        scene.add(panel);
      }
    }
    console.log('[CoreBuildingDetails] 大明宫台阶栏杆完成');
  },

  // 东西市店铺招牌
  shopSigns() {
    const signMaterials = [
      { color: 0xc0392b, text: '酒肆' },
      { color: 0x2980b9, text: '茶坊' },
      { color: 0x27ae60, text: '布庄' },
      { color: 0xf39c12, text: '粮行' },
    ];

    // 在东西市街道两侧添加店铺招牌
    for (let i = 0; i < 10; i++) {
      const signInfo = signMaterials[i % signMaterials.length];
      const mat = new THREE.MeshStandardMaterial({ color: signInfo.color, roughness: 0.6 });

      // 招牌板
      const sign = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 0.1), mat);
      sign.position.set(-100 + i * 20, 4, 50 + (i % 2) * 10);
      sign.castShadow = true;
      scene.add(sign);

      // 挂杆
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6), mat);
      pole.position.set(-100 + i * 20, 5, 50 + (i % 2) * 10);
      scene.add(pole);
    }
    console.log('[CoreBuildingDetails] 东西市店铺招牌完成');
  },

  init() {
    this.damingCaigong();
    this.doorWindows();
    this.stairsRailing();
    this.shopSigns();
    console.log('[CoreBuildingDetails] 核心建筑细节提升完成');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new CoreBuildingDetails().init();
  };
}
