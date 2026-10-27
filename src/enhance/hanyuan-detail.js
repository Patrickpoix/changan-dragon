/* ============================================================
   大明宫含元殿深度精修 — 唐式木构细节极致版
   v1: 斗拱层叠、彩绘梁枋、格扇门窗、台基栏杆、柱础石雕
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 1500);
      return;
    }
    
    console.log('[HanyuanDetail] 开始深度精修含元殿...');
    
    const DX = 320, DZ = -460; // 大明宫中心
    
    addDougongLayers(DX, DZ);      // 斗拱层叠
    addPaintedBeams(DX, DZ);       // 彩绘梁枋
    addLatticeDoors(DX, DZ);       // 格扇门窗
    addStoneRailings(DX, DZ);      // 台基栏杆
    addColumnBases(DX, DZ);        // 柱础石雕
    addRoofDetails(DX, DZ);        // 屋顶细节
    
    console.log('[HanyuanDetail] ✓ 含元殿深度精修完成');
  }
  
  // 斗拱层叠 — 三层出挑
  function addDougongLayers(DX, DZ) {
    const dougongMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });
    const caihuiMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.5 });
    
    // 正面斗拱 — 11组
    for (let i = -5; i <= 5; i++) {
      const x = DX + i * 5.5;
      const z = DZ - 8;
      
      // 第一层斗拱
      const dou1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 1.0), dougongMat);
      dou1.position.set(x, 19.0, z);
      dou1.castShadow = true;
      scene.add(dou1);
      
      // 第二层拱
      const gong2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 0.6), dougongMat);
      gong2.position.set(x, 19.4, z);
      gong2.castShadow = true;
      scene.add(gong2);
      
      // 彩绘装饰
      const cai = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 0.65), caihuiMat);
      cai.position.set(x, 19.55, z);
      scene.add(cai);
      
      // 第三层翘
      const qiao3 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 1.8), dougongMat);
      qiao3.position.set(x, 19.7, z);
      qiao3.castShadow = true;
      scene.add(qiao3);
    }
    
    console.log('[HanyuanDetail] 斗拱层叠完成');
  }
  
  // 彩绘梁枋 — 红蓝金三色
  function addPaintedBeams(DX, DZ) {
    const redMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.6 });
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x2c3e8c, roughness: 0.6 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.3 });
    
    // 正立面额枋
    const beam = new THREE.Mesh(new THREE.BoxGeometry(60, 0.6, 0.3), redMat);
    beam.position.set(DX, 18.5, DZ - 8);
    beam.castShadow = true;
    scene.add(beam);
    
    // 额枋上的彩画装饰
    for (let i = -5; i <= 5; i++) {
      const x = DX + i * 5.5;
      const panel = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 0.1), i % 2 ? blueMat : goldMat);
      panel.position.set(x, 18.5, DZ - 7.8);
      scene.add(panel);
    }
    
    console.log('[HanyuanDetail] 彩绘梁枋完成');
  }
  
  // 格扇门窗 — 精细窗格
  function addLatticeDoors(DX, DZ) {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x6b3410, roughness: 0.7 });
    const paperMat = new THREE.MeshStandardMaterial({ 
      color: 0xf5e6c8, 
      transparent: true, 
      opacity: 0.7,
      roughness: 0.9
    });
    
    // 正门 — 3扇格扇门
    for (let i = -1; i <= 1; i++) {
      const x = DX + i * 6;
      
      // 门框
      const frame = new THREE.Mesh(new THREE.BoxGeometry(5, 6, 0.2), frameMat);
      frame.position.set(x, 12, DZ - 8);
      scene.add(frame);
      
      // 窗格横条
      for (let j = 0; j < 5; j++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.06, 0.05), frameMat);
        bar.position.set(x, 9.5 + j * 1.2, DZ - 7.8);
        scene.add(bar);
      }
      
      // 窗格竖条
      for (let j = -2; j <= 2; j++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 5.6, 0.05), frameMat);
        bar.position.set(x + j * 0.9, 12, DZ - 7.8);
        scene.add(bar);
      }
      
      // 窗纸
      const paper = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 5.6), paperMat);
      paper.position.set(x, 12, DZ - 8.1);
      scene.add(paper);
    }
    
    console.log('[HanyuanDetail] 格扇门窗完成');
  }
  
  // 台基栏杆 — 汉白玉栏杆
  function addStoneRailings(DX, DZ) {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xf0ebe0, roughness: 0.85 });
    
    // 前排栏杆
    for (let i = -20; i <= 20; i++) {
      const x = DX + i * 2;
      
      // 望柱
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.2, 0.25), stoneMat);
      post.position.set(x, 10.2, DZ - 42);
      post.castShadow = true;
      scene.add(post);
      
      // 柱头莲蕾
      const bud = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 6), stoneMat);
      bud.position.set(x, 10.9, DZ - 42);
      scene.add(bud);
    }
    
    // 栏板
    for (let i = -20; i < 20; i++) {
      const x = DX + i * 2 + 1;
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 0.12), stoneMat);
      panel.position.set(x, 10.0, DZ - 42);
      panel.castShadow = true;
      scene.add(panel);
    }
    
    // 扶手
    const rail = new THREE.Mesh(new THREE.BoxGeometry(81, 0.12, 0.18), stoneMat);
    rail.position.set(DX, 10.8, DZ - 42);
    rail.castShadow = true;
    scene.add(rail);
    
    console.log('[HanyuanDetail] 台基栏杆完成');
  }
  
  // 柱础石雕 — 覆盆柱础
  function addColumnBases(DX, DZ) {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.9 });
    
    // 正面11根柱子的柱础
    for (let i = -5; i <= 5; i++) {
      const x = DX + i * 5.5;
      const z = DZ - 8.6;
      
      // 覆盆柱础
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.35, 8), stoneMat);
      base.position.set(x, 9.7, z);
      base.castShadow = true;
      base.receiveShadow = true;
      scene.add(base);
      
      // 柱颈
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.2, 8), stoneMat);
      neck.position.set(x, 10.05, z);
      scene.add(neck);
    }
    
    console.log('[HanyuanDetail] 柱础石雕完成');
  }
  
  // 屋顶细节 — 鸱吻、脊兽、瓦当
  function addRoofDetails(DX, DZ) {
    const tileMat = new THREE.MeshStandardMaterial({ color: 0x4a6670, roughness: 0.6 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
    
    // 正脊鸱吻 — 两端
    for (const side of [-1, 1]) {
      const chiwen = new THREE.Group();
      chiwen.position.set(DX + side * 32, 26, DZ - 22);
      
      // 主体
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.5, 4), tileMat);
      body.rotation.y = Math.PI / 4;
      body.position.y = 1.25;
      chiwen.add(body);
      
      // 尾部上翘
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.5, 4), tileMat);
      tail.rotation.z = -Math.PI / 4;
      tail.position.set(0, 2.2, 0.4);
      chiwen.add(tail);
      
      // 金色剑把
      const sword = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), goldMat);
      sword.position.set(0, 2.5, 0);
      chiwen.add(sword);
      
      scene.add(chiwen);
    }
    
    // 脊兽 — 5个小跑兽
    for (let i = 0; i < 5; i++) {
      const beast = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 4), goldMat);
      beast.position.set(DX - 20 + i * 10, 26.5, DZ - 22);
      scene.add(beast);
    }
    
    console.log('[HanyuanDetail] 屋顶细节完成');
  }
  
  init();
})();
