/* ============================================================
   PBR材质系统增强 — 法线贴图、粗糙度变化、AO
   v1: 程序化生成法线/粗糙度/AO贴图
   ============================================================ */

(function() {
  'use strict';
  
  // ===== 程序化纹理生成器 =====
  const ProceduralTextures = {
    // 生成木纹法线贴图
    woodNormalMap(size = 256) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // 填充基础法线方向 (128,128,255) = 向上
      ctx.fillStyle = 'rgb(128,128,255)';
      ctx.fillRect(0, 0, size, size);
      
      // 生成木纹波浪
      ctx.strokeStyle = 'rgb(100,128,255)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 20; i++) {
        const y = (i / 20) * size;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < size; x += 4) {
          ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 3);
        }
        ctx.stroke();
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      return texture;
    },
    
    // 生成石材粗糙度贴图
    stoneRoughnessMap(size = 256) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // 基础粗糙度 200 = 0.78
      ctx.fillStyle = 'rgb(200,200,200)';
      ctx.fillRect(0, 0, size, size);
      
      // 随机噪点
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const brightness = 180 + Math.random() * 40;
        ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
        ctx.fillRect(x, y, 2, 2);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      return texture;
    },
    
    // 生成砖缝AO贴图
    brickAOMap(size = 256) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // 基础AO 255 = 无遮蔽
      ctx.fillStyle = 'rgb(255,255,255)';
      ctx.fillRect(0, 0, size, size);
      
      // 砖缝 — 暗色
      ctx.strokeStyle = 'rgb(180,180,180)';
      ctx.lineWidth = 2;
      
      const brickH = size / 8;
      const brickW = size / 4;
      
      for (let row = 0; row < 8; row++) {
        const y = row * brickH;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
        
        const offset = row % 2 ? brickW / 2 : 0;
        for (let col = 0; col < 5; col++) {
          const x = col * brickW + offset;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + brickH);
          ctx.stroke();
        }
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      return texture;
    },
    
    // 生成瓦面法线贴图
    tileNormalMap(size = 256) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // 基础法线
      ctx.fillStyle = 'rgb(128,128,255)';
      ctx.fillRect(0, 0, size, size);
      
      // 瓦垄 — 弧形起伏
      const rows = 8;
      const rowH = size / rows;
      
      for (let row = 0; row < rows; row++) {
        const y = row * rowH;
        // 中间凸起
        const grad = ctx.createLinearGradient(0, y, 0, y + rowH);
        grad.addColorStop(0, 'rgb(100,128,255)');
        grad.addColorStop(0.5, 'rgb(128,128,255)');
        grad.addColorStop(1, 'rgb(156,128,255)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, y, size, rowH);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      return texture;
    }
  };
  
  // ===== 增强材质应用 =====
  function applyEnhancedMaterials() {
    if (typeof scene === 'undefined') return;
    
    console.log('[PBREnhance] 应用增强PBR材质...');
    
    // 生成纹理
    const woodNormal = ProceduralTextures.woodNormalMap();
    const stoneRough = ProceduralTextures.stoneRoughnessMap();
    const brickAO = ProceduralTextures.brickAOMap();
    const tileNormal = ProceduralTextures.tileNormalMap();
    
    // 遍历场景，增强材质
    let enhancedCount = 0;
    scene.traverse(object => {
      if (!object.material) return;
      
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      
      materials.forEach(mat => {
        // 只处理MeshStandardMaterial
        if (!mat.isMeshStandardMaterial) return;
        
        // 根据颜色判断材质类型
        const color = mat.color;
        const hex = color.getHex();
        
        // 木材类（棕色系）
        if (hex >= 0x6b3410 && hex <= 0xa0522d) {
          if (!mat.normalMap) {
            mat.normalMap = woodNormal;
            mat.normalScale = new THREE.Vector2(0.5, 0.5);
            enhancedCount++;
          }
        }
        
        // 石材类（灰色/米色）
        if (hex >= 0xc8b89a && hex <= 0xe8d8b8) {
          if (!mat.roughnessMap) {
            mat.roughnessMap = stoneRough;
            mat.roughness = 1.0;
            enhancedCount++;
          }
        }
        
        // 砖类（红棕色）
        if (hex >= 0x9c4938 && hex <= 0xc4a882) {
          if (!mat.aoMap) {
            mat.aoMap = brickAO;
            mat.aoMapIntensity = 0.5;
            enhancedCount++;
          }
        }
        
        // 瓦面（蓝灰色）
        if (hex >= 0x4a6670 && hex <= 0x6b7f76) {
          if (!mat.normalMap) {
            mat.normalMap = tileNormal;
            mat.normalScale = new THREE.Vector2(0.6, 0.6);
            enhancedCount++;
          }
        }
        
        mat.needsUpdate = true;
      });
    });
    
    console.log(`[PBREnhance] ✓ 增强了 ${enhancedCount} 个材质`);
  }
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 600);
      return;
    }
    
    // 延迟一下，等场景完全构建
    setTimeout(applyEnhancedMaterials, 500);
    
    console.log('[PBREnhance] ✓ PBR材质增强模块已加载');
  }
  
  init();
  
  // 暴露纹理生成器
  window.ProceduralTextures = ProceduralTextures;
})();
