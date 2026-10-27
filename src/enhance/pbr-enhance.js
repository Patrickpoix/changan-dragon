/* ============================================================
   PBR材质增强 — 电影级唐式建筑材质
   v1: 增强木材、石材、瓦面、朱漆材质质感
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log('[PBR] 开始增强PBR材质...');
    
    enhanceWoodMaterials();
    enhanceStoneMaterials();
    enhanceRoofMaterials();
    enhancePaintMaterials();
    
    console.log('[PBR] ✓ PBR材质增强完成');
  }
  
  // 木材材质 — 真实木纹
  function enhanceWoodMaterials() {
    const woodTex = createWoodTexture();
    
    // 遍历场景中的木材材质
    scene.traverse(obj => {
      if (obj.material && obj.material.color) {
        const color = obj.material.color.getHex();
        // 检测棕色系材质
        if (isWoodColor(color)) {
          obj.material.map = woodTex;
          obj.material.roughness = 0.7;
          obj.material.metalness = 0.1;
          obj.material.needsUpdate = true;
        }
      }
    });
  }
  
  // 石材材质 — 真实石纹
  function enhanceStoneMaterials() {
    const stoneTex = createStoneTexture();
    
    scene.traverse(obj => {
      if (obj.material && obj.material.color) {
        const color = obj.material.color.getHex();
        if (isStoneColor(color)) {
          obj.material.map = stoneTex;
          obj.material.roughness = 0.8;
          obj.material.metalness = 0.05;
          obj.material.needsUpdate = true;
        }
      }
    });
  }
  
  // 瓦面材质 — 陶瓦质感
  function enhanceRoofMaterials() {
    const roofTex = createRoofTexture();
    
    scene.traverse(obj => {
      if (obj.material && obj.material.color) {
        const color = obj.material.color.getHex();
        if (isRoofColor(color)) {
          obj.material.map = roofTex;
          obj.material.roughness = 0.6;
          obj.material.metalness = 0.15;
          obj.material.needsUpdate = true;
        }
      }
    });
  }
  
  // 朱漆材质 — 宫殿红墙
  function enhancePaintMaterials() {
    scene.traverse(obj => {
      if (obj.material && obj.material.color) {
        const color = obj.material.color.getHex();
        if (isRedPaintColor(color)) {
          obj.material.roughness = 0.4;
          obj.material.metalness = 0.2;
          obj.material.envMapIntensity = 1.2;
          obj.material.needsUpdate = true;
        }
      }
    });
  }
  
  // 颜色检测
  function isWoodColor(hex) {
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    // 棕色系
    return r > 100 && r < 200 && g > 60 && g < 150 && b < 100;
  }
  
  function isStoneColor(hex) {
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    // 灰黄棕色系
    return r > 150 && r < 230 && g > 140 && g < 220 && b > 120 && b < 200 && Math.abs(r - g) < 30;
  }
  
  function isRoofColor(hex) {
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    // 青灰色系
    return r > 70 && r < 110 && g > 90 && g < 120 && b > 90 && b < 120;
  }
  
  function isRedPaintColor(hex) {
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    // 朱红色系
    return r > 140 && g < 80 && b < 80;
  }
  
  // 纹理生成
  function createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // 底色
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(0, 0, 256, 256);
    
    // 木纹
    for (let i = 0; i < 30; i++) {
      ctx.strokeStyle = `rgba(${100 + Math.random() * 30}, ${70 + Math.random() * 20}, ${40 + Math.random() * 20}, 0.3)`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * 256);
      ctx.bezierCurveTo(
        80, Math.random() * 256,
        160, Math.random() * 256,
        256, Math.random() * 256
      );
      ctx.stroke();
    }
    
    // 木节
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = 5 + Math.random() * 10;
      ctx.fillStyle = 'rgba(80, 50, 30, 0.3)';
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }
  
  function createStoneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // 底色
    ctx.fillStyle = '#d4c4a0';
    ctx.fillRect(0, 0, 256, 256);
    
    // 石材纹理
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${180 + Math.random() * 40}, ${160 + Math.random() * 30}, ${130 + Math.random() * 30}, 0.2)`;
      ctx.beginPath();
      ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 石材裂缝
    for (let i = 0; i < 10; i++) {
      ctx.strokeStyle = 'rgba(120, 100, 80, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 256, Math.random() * 256);
      ctx.lineTo(Math.random() * 256, Math.random() * 256);
      ctx.stroke();
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
  }
  
  function createRoofTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // 底色
    ctx.fillStyle = '#5a6a6a';
    ctx.fillRect(0, 0, 256, 256);
    
    // 瓦垄
    for (let y = 0; y < 256; y += 16) {
      ctx.fillStyle = 'rgba(60, 70, 70, 0.5)';
      ctx.fillRect(0, y, 256, 8);
      ctx.fillStyle = 'rgba(90, 100, 100, 0.3)';
      ctx.fillRect(0, y + 8, 256, 8);
    }
    
    // 瓦当
    for (let x = 0; x < 256; x += 16) {
      for (let y = 0; y < 256; y += 16) {
        ctx.fillStyle = 'rgba(100, 110, 110, 0.4)';
        ctx.beginPath();
        ctx.arc(x + 8, y + 8, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }
  
  init();
})();
