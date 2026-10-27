/* ============================================================
   唐式建筑精修引擎 — 斗拱、鸱吻、瓦垄、格扇门窗、台基栏杆
   v1: 高质量唐式建筑组件库
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 300);
      return;
    }
    
    console.log('[TangDetail] 开始精修唐式建筑...');
    
    // 注册唐式建筑组件到全局
    window.TangArchitecture = {
      // 斗拱组件
      addDougong(parent, x, y, z, scale = 1, rotationY = 0) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.rotation.y = rotationY;
        group.scale.setScalar(scale);
        
        // 斗
        const dou = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.4, 0.8),
          new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 })
        );
        dou.position.y = 0.2;
        group.add(dou);
        
        // 拱
        const gong = new THREE.Mesh(
          new THREE.BoxGeometry(2.0, 0.25, 0.5),
          new THREE.MeshStandardMaterial({ color: 0x6b3410, roughness: 0.8 })
        );
        gong.position.y = 0.55;
        group.add(gong);
        
        // 翘
        const qiao = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.2, 1.6),
          new THREE.MeshStandardMaterial({ color: 0x6b3410, roughness: 0.8 })
        );
        qiao.position.y = 0.8;
        group.add(qiao);
        
        // 彩绘装饰
        const caihui = new THREE.Mesh(
          new THREE.BoxGeometry(2.1, 0.08, 0.55),
          new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.6 })
        );
        caihui.position.y = 0.68;
        group.add(caihui);
        
        parent.add(group);
        return group;
      },
      
      // 鸱吻组件
      addChiwen(parent, x, y, z, scale = 1) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.scale.setScalar(scale);
        
        // 主体
        const body = new THREE.Mesh(
          new THREE.ConeGeometry(0.6, 2.0, 4),
          new THREE.MeshStandardMaterial({ color: 0x5a7a8a, roughness: 0.5, metalness: 0.3 })
        );
        body.rotation.y = Math.PI / 4;
        body.position.y = 1.0;
        group.add(body);
        
        // 尾部上翘
        const tail = new THREE.Mesh(
          new THREE.ConeGeometry(0.3, 1.2, 4),
          new THREE.MeshStandardMaterial({ color: 0x5a7a8a, roughness: 0.5, metalness: 0.3 })
        );
        tail.rotation.z = -Math.PI / 4;
        tail.position.set(0, 1.8, 0.3);
        group.add(tail);
        
        // 金色装饰
        const gold = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.8 })
        );
        gold.position.y = 2.1;
        group.add(gold);
        
        parent.add(group);
        return group;
      },
      
      // 瓦垄组件（实例化）
      addTileRows(parent, x, y, z, width, depth, rows = 20) {
        const tileGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 6);
        const tileMat = new THREE.MeshStandardMaterial({ color: 0x4a6670, roughness: 0.7 });
        const count = rows * Math.floor(width / 0.5);
        const instanced = new THREE.InstancedMesh(tileGeo, tileMat, count);
        
        const matrix = new THREE.Matrix4();
        let idx = 0;
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < Math.floor(width / 0.5); j++) {
            const tx = x - width/2 + j * 0.5;
            const tz = z - depth/2 + i * (depth / rows);
            matrix.makeTranslation(tx, y, tz);
            matrix.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
            instanced.setMatrixAt(idx++, matrix);
          }
        }
        instanced.castShadow = true;
        instanced.receiveShadow = true;
        parent.add(instanced);
        return instanced;
      },
      
      // 格扇门窗
      addLatticeWindow(parent, x, y, z, width, height, rotationY = 0) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.rotation.y = rotationY;
        
        // 窗框
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x6b3410, roughness: 0.7 });
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(width, height, 0.15),
          frameMat
        );
        group.add(frame);
        
        // 窗格（横竖条）
        const barMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6 });
        const cols = Math.floor(width / 0.3);
        const rows = Math.floor(height / 0.3);
        
        for (let i = 1; i < cols; i++) {
          const bar = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, height, 0.05),
            barMat
          );
          bar.position.x = -width/2 + i * (width / cols);
          bar.position.z = 0.08;
          group.add(bar);
        }
        
        for (let i = 1; i < rows; i++) {
          const bar = new THREE.Mesh(
            new THREE.BoxGeometry(width, 0.04, 0.05),
            barMat
          );
          bar.position.y = -height/2 + i * (height / rows);
          bar.position.z = 0.08;
          group.add(bar);
        }
        
        // 纸窗（半透明）
        const paper = new THREE.Mesh(
          new THREE.PlaneGeometry(width - 0.1, height - 0.1),
          new THREE.MeshStandardMaterial({ 
            color: 0xf5e6c8, 
            transparent: true, 
            opacity: 0.6,
            roughness: 0.9
          })
        );
        paper.position.z = -0.05;
        group.add(paper);
        
        parent.add(group);
        return group;
      },
      
      // 台基栏杆
      addBalustrade(parent, x, y, z, length, rotationY = 0) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.rotation.y = rotationY;
        
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.9 });
        
        // 栏板
        const panels = Math.floor(length / 1.5);
        for (let i = 0; i < panels; i++) {
          const px = -length/2 + i * 1.5 + 0.75;
          const panel = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.6, 0.1),
            stoneMat
          );
          panel.position.set(px, 0.5, 0);
          group.add(panel);
        }
        
        // 望柱
        for (let i = 0; i <= panels; i++) {
          const px = -length/2 + i * 1.5;
          const post = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 1.0, 0.15),
            stoneMat
          );
          post.position.set(px, 0.5, 0);
          group.add(post);
          
          // 柱头
          const cap = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 6, 6),
            stoneMat
          );
          cap.position.set(px, 1.05, 0);
          group.add(cap);
        }
        
        // 扶手
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(length, 0.08, 0.12),
          stoneMat
        );
        rail.position.y = 1.0;
        group.add(rail);
        
        parent.add(group);
        return group;
      },
      
      // 柱础
      addColumnBase(parent, x, y, z, scale = 1) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.scale.setScalar(scale);
        
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0xc8b89a, roughness: 0.9 });
        
        // 石鼓
        const drum = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.5, 0.3, 8),
          stoneMat
        );
        drum.position.y = 0.15;
        group.add(drum);
        
        // 雕刻
        const carving = new THREE.Mesh(
          new THREE.TorusGeometry(0.25, 0.05, 6, 8),
          stoneMat
        );
        carving.position.y = 0.35;
        carving.rotation.x = Math.PI / 2;
        group.add(carving);
        
        parent.add(group);
        return group;
      }
    };
    
    console.log('[TangDetail] ✓ 唐式建筑组件库已注册');
    
    // 应用到大明宫含元殿
    applyToDamingHall();
    
    // 应用到大雁塔
    applyToPagoda();
    
    // 应用到朱雀大街
    applyToZhuqueStreet();
  }
  
  // 大明宫含元殿精修
  function applyToDamingHall() {
    if (typeof scene === 'undefined' || !window.TangArchitecture) return;
    
    const DX = 320, DZ = -460;
    
    // 含元殿斗拱
    for (let i = -5; i <= 5; i++) {
      TangArchitecture.addDougong(scene, DX + i * 5.5, 18.5, DZ - 8, 1.0);
    }
    
    // 鸱吻
    TangArchitecture.addChiwen(scene, DX - 32, 26, DZ - 22, 1.2);
    TangArchitecture.addChiwen(scene, DX + 32, 26, DZ - 22, 1.2);
    
    // 台基栏杆
    TangArchitecture.addBalustrade(scene, DX, 9.5, DZ - 45, 80);
    TangArchitecture.addBalustrade(scene, DX - 45, 9.5, DZ - 25, 40, Math.PI / 2);
    TangArchitecture.addBalustrade(scene, DX + 45, 9.5, DZ - 25, 40, Math.PI / 2);
    
    console.log('[TangDetail] ✓ 大明宫含元殿精修完成');
  }
  
  // 大雁塔精修
  function applyToPagoda() {
    if (typeof scene === 'undefined' || !window.TangArchitecture) return;
    
    const x = 300, z = 420;
    
    // 塔基栏杆
    TangArchitecture.addBalustrade(scene, x, 3.2, z - 22, 40);
    TangArchitecture.addBalustrade(scene, x - 22, 3.2, z, 44, Math.PI / 2);
    TangArchitecture.addBalustrade(scene, x + 22, 3.2, z, 44, Math.PI / 2);
    
    console.log('[TangDetail] ✓ 大雁塔精修完成');
  }
  
  // 朱雀大街精修
  function applyToZhuqueStreet() {
    if (typeof scene === 'undefined' || !window.TangArchitecture) return;
    
    // 牌坊斗拱
    TangArchitecture.addDougong(scene, -14, 13.5, 540, 0.8);
    TangArchitecture.addDougong(scene, 14, 13.5, 540, 0.8);
    
    console.log('[TangDetail] ✓ 朱雀大街精修完成');
  }
  
  init();
})();
