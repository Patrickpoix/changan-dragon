/* ============================================================
   统一视觉风格管控系统 — 盛唐国风电影质感
   v1: 统一色调、材质、光照、后处理、风格配置中心
   ============================================================ */

(function() {
  'use strict';
  
  // ===== 全局视觉风格配置（单一权威源）=====
  const ChanganStyle = {
    // 色调 — 敦煌唐风
    palette: {
      shadowTint: [0.85, 0.90, 1.15],    // 阴影偏蓝紫
      highlightTint: [1.15, 1.08, 0.82],  // 高光偏暖金
      saturation: 1.22,                    // 饱和度
      contrast: 1.12,                      // 对比度
      exposure: 1.2,                       // 曝光
    },
    
    // 材质风格
    material: {
      woodColor: 0x8b4513,                // 木色
      woodRoughness: 0.7,                  // 木材粗糙度
      redLacquer: 0xc0392b,               // 朱漆
      redLacquerRoughness: 0.4,           // 朱漆粗糙度
      goldMetalness: 0.8,                  // 金色金属度
      tileColor: 0x4a6670,                // 瓦色
      stoneColor: 0xd4c4a8,                // 石色
      brickColor: 0xc4a882,               // 砖色
      paperColor: 0xf5e6c8,               // 纸色
      environmentIntensity: 0.7,          // 环境反射强度
    },
    
    // 光照风格
    lighting: {
      sunColor: 0xffe6b0,                  // 阳光色
      sunIntensity: 1.2,                   // 阳光强度
      ambientColor: 0x8899bb,              // 环境光色
      ambientIntensity: 0.4,               // 环境光强度
      hemiSkyColor: 0x88aacc,              // 半球天光色
      hemiGroundColor: 0x665544,           // 半球地光色
      hemiIntensity: 0.5,                  // 半球光强度
    },
    
    // 后处理风格
    postfx: {
      bloomStrength: 0.45,                 // 光晕强度
      bloomRadius: 0.6,                    // 光晕半径
      bloomThreshold: 1.02,                // 光晕阈值
      saoIntensity: 0.1,                   // 环境遮蔽强度
      saoScale: 50,                        // 环境遮蔽范围
      vignetteStrength: 0.35,              // 暗角强度
      vignetteRadius: 0.78,                // 暗角半径
      grainAmount: 0.05,                   // 胶片颗粒量
      dofStrength: 0.3,                    // 景深强度
    },
    
    // 建筑风格
    architecture: {
      roofOverhang: 1.15,                  // 屋檐出挑倍数
      roofPitch: 0.6,                       // 屋顶坡度
      columnRatio: 0.08,                    // 柱径比例
      platformHeight: 1.5,                  // 台基高度
      dougongLayers: 3,                     // 斗拱层数
    },
    
    // 植被风格
    vegetation: {
      treeColor: 0x4a7a4a,                  // 树叶色
      trunkColor: 0x5a4a3a,                 // 树干色
      pineColor: 0x2d5a3d,                  // 松色
      blossomColor: 0xf2a7b6,               // 花色
      willowColor: 0x6a9a5a,                // 柳色
    },
    
    // 水景风格
    water: {
      deepColor: 0x397f83,                  // 深水色
      shallowColor: 0x87b6a4,               // 浅水色
      sunColor: 0xffe6b0,                   // 阳光色
      rippleSpeed: 1.2,                     // 波纹速度
      fresnelPower: 2.5,                    // 菲涅尔强度
    },
    
    // 城市生活风格
    city: {
      lanternColor: 0xff4422,               // 灯笼色
      lanternEmissive: 0xff2200,            // 灯笼发光色
      lanternIntensity: 0.8,                // 灯笼发光强度
      streetWidth: 60,                       // 街道宽度
      wardSize: 100,                        // 坊里大小
    }
  };
  
  // ===== 材质工厂 — 统一生成唐式PBR材质 =====
  const ChanganMaterials = {
    // 木材材质
    wood(darkness = 1) {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(ChanganStyle.material.woodColor).multiplyScalar(darkness),
        roughness: ChanganStyle.material.woodRoughness,
        metalness: 0.0,
      });
    },
    
    // 朱漆材质
    redLacquer(darkness = 1) {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(ChanganStyle.material.redLacquer).multiplyScalar(darkness),
        roughness: ChanganStyle.material.redLacquerRoughness,
        metalness: 0.1,
      });
    },
    
    // 金色材质
    gold(intensity = 1) {
      return new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.25,
        metalness: ChanganStyle.material.goldMetalness * intensity,
        emissive: 0x886600,
        emissiveIntensity: 0.1 * intensity,
      });
    },
    
    // 瓦面材质
    tile(darkness = 1) {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(ChanganStyle.material.tileColor).multiplyScalar(darkness),
        roughness: 0.6,
        metalness: 0.2,
      });
    },
    
    // 石材材质
    stone(darkness = 1) {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(ChanganStyle.material.stoneColor).multiplyScalar(darkness),
        roughness: 0.9,
        metalness: 0.0,
      });
    },
    
    // 砖材材质
    brick(darkness = 1) {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(ChanganStyle.material.brickColor).multiplyScalar(darkness),
        roughness: 0.9,
        metalness: 0.0,
      });
    },
    
    // 窗纸材质
    paper() {
      return new THREE.MeshStandardMaterial({
        color: ChanganStyle.material.paperColor,
        transparent: true,
        opacity: 0.7,
        roughness: 0.9,
        emissive: 0xffeecc,
        emissiveIntensity: 0.1,
      });
    },
    
    // 树叶材质
    leaves(darkness = 1) {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(ChanganStyle.vegetation.treeColor).multiplyScalar(darkness),
        roughness: 0.85,
        metalness: 0.0,
      });
    },
    
    // 灯笼材质
    lantern() {
      return new THREE.MeshStandardMaterial({
        color: ChanganStyle.city.lanternColor,
        emissive: ChanganStyle.city.lanternEmissive,
        emissiveIntensity: ChanganStyle.city.lanternIntensity,
        roughness: 0.5,
      });
    }
  };
  
  // ===== 建筑组件工厂 — 统一唐式建筑生成 =====
  const ChanganArchitecture = {
    // 创建标准唐式殿堂
    createHall(width, depth, height, options = {}) {
      const group = new THREE.Group();
      const platformH = options.platform || ChanganStyle.architecture.platformHeight;
      const roofH = options.roofHeight || height * 0.5;
      
      // 台基
      const platform = new THREE.Mesh(
        new THREE.BoxGeometry(width + 4, platformH, depth + 4),
        ChanganMaterials.stone(0.9)
      );
      platform.position.y = platformH / 2;
      platform.castShadow = true;
      platform.receiveShadow = true;
      group.add(platform);
      
      // 墙体
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        options.redWall ? ChanganMaterials.redLacquer(0.9) : ChanganMaterials.wood(0.8)
      );
      wall.position.y = platformH + height / 2;
      wall.castShadow = true;
      group.add(wall);
      
      // 屋顶
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(Math.max(width, depth) * ChanganStyle.architecture.roofOverhang, roofH, 4),
        ChanganMaterials.tile(0.9)
      );
      roof.position.y = platformH + height + roofH / 2;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);
      
      // 鸱吻
      if (options.chiwen !== false) {
        for (const side of [-1, 1]) {
          const chiwen = new THREE.Mesh(
            new THREE.ConeGeometry(0.5, 1.5, 4),
            ChanganMaterials.gold(0.8)
          );
          chiwen.position.set(side * width * 0.45, platformH + height + roofH, 0);
          chiwen.rotation.y = Math.PI / 4;
          group.add(chiwen);
        }
      }
      
      // 柱子
      if (options.columns !== false) {
        const colMat = ChanganMaterials.redLacquer();
        for (let i = -2; i <= 2; i++) {
          const col = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.35, height, 8),
            colMat
          );
          col.position.set(i * width / 5, platformH + height / 2, depth / 2 + 0.2);
          col.castShadow = true;
          group.add(col);
        }
      }
      
      return group;
    },
    
    // 创建标准唐式亭子
    createPavilion(size, options = {}) {
      const group = new THREE.Group();
      const platformH = 0.5;
      
      // 台基
      const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(size + 1, size + 1.5, platformH, 8),
        ChanganMaterials.stone()
      );
      platform.position.y = platformH / 2;
      platform.receiveShadow = true;
      group.add(platform);
      
      // 柱子
      const colMat = ChanganMaterials.redLacquer();
      for (let i = 0; i < 4; i++) {
        const angle = i * Math.PI / 2 + Math.PI / 4;
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.25, 3, 6),
          colMat
        );
        col.position.set(Math.cos(angle) * size * 0.7, platformH + 1.5, Math.sin(angle) * size * 0.7);
        group.add(col);
      }
      
      // 屋顶
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(size, 2.5, 4),
        ChanganMaterials.tile()
      );
      roof.position.y = platformH + 4.25;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);
      
      // 宝顶
      const finial = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 6, 6),
        ChanganMaterials.gold()
      );
      finial.position.y = platformH + 5.6;
      group.add(finial);
      
      return group;
    },
    
    // 创建标准行道树
    createTree(type = 'oak', scale = 1) {
      const group = new THREE.Group();
      
      // 树干
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2 * scale, 0.35 * scale, 3 * scale, 6),
        new THREE.MeshStandardMaterial({ color: ChanganStyle.vegetation.trunkColor, roughness: 0.9 })
      );
      trunk.position.y = 1.5 * scale;
      trunk.castShadow = true;
      group.add(trunk);
      
      // 树冠 — 多层球体，更自然
      const leafColor = type === 'pine' ? ChanganStyle.vegetation.pineColor :
                        type === 'willow' ? ChanganStyle.vegetation.willowColor :
                        ChanganStyle.vegetation.treeColor;
      
      const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.85 });
      
      if (type === 'pine') {
        // 松树 — 锥形
        for (let i = 0; i < 3; i++) {
          const tier = new THREE.Mesh(
            new THREE.ConeGeometry((1.5 - i * 0.3) * scale, 1.5 * scale, 6),
            leafMat
          );
          tier.position.y = (3 + i * 1.2) * scale;
          tier.castShadow = true;
          group.add(tier);
        }
      } else {
        // 阔叶树 — 多层球体
        const crown1 = new THREE.Mesh(
          new THREE.SphereGeometry(1.5 * scale, 8, 6),
          leafMat
        );
        crown1.position.y = 3.5 * scale;
        crown1.castShadow = true;
        group.add(crown1);
        
        const crown2 = new THREE.Mesh(
          new THREE.SphereGeometry(1.0 * scale, 6, 5),
          leafMat
        );
        crown2.position.set(0.5 * scale, 4.5 * scale, 0.3 * scale);
        crown2.castShadow = true;
        group.add(crown2);
        
        // 花树
        if (type === 'blossom') {
          blossomMat = new THREE.MeshStandardMaterial({ color: ChanganStyle.vegetation.blossomColor, roughness: 0.8 });
          for (let i = 0; i < 5; i++) {
            const blossom = new THREE.Mesh(
              new THREE.SphereGeometry(0.3 * scale, 4, 4),
              blossomMat
            );
            blossom.position.set(
              (Math.random() - 0.5) * 2 * scale,
              (3 + Math.random()) * scale,
              (Math.random() - 0.5) * 2 * scale
            );
            group.add(blossom);
          }
        }
      }
      
      return group;
    }
  };
  
  // ===== 应用统一风格到全局 =====
  function applyGlobalStyle() {
    console.log('[ChanganStyle] 应用统一视觉风格...');
    
    // 调整渲染参数
    if (typeof GameRendering !== 'undefined') {
      GameRendering.setExposure(ChanganStyle.palette.exposure);
      GameRendering.setEnvironmentIntensity(ChanganStyle.material.environmentIntensity);
    }
    
    // 注册到全局
    window.ChanganStyle = ChanganStyle;
    window.ChanganMaterials = ChanganMaterials;
    window.ChanganArchitecture = ChanganArchitecture;
    
    console.log('[ChanganStyle] ✓ 统一视觉风格已应用');
    console.log('[ChanganStyle] 风格配置:', ChanganStyle);
  }
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 200);
      return;
    }
    
    applyGlobalStyle();
  }
  
  init();
})();
