/* ============================================================
   PBR材质库真正升级 · 国风电影级质感
   基于真实唐代建筑材质：朱红/琉璃瓦/青灰砖/原木/汉白玉
   ============================================================ */

class PBRMaterialUpgrade {
  // 创建高质量Canvas纹理
  makeCanvasTexture(size, drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    drawFn(ctx, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  },

  // 朱红漆材质（大明宫立柱/门窗）
  makeVermilionLacquer() {
    const map = this.makeCanvasTexture(256, (ctx, s) => {
      ctx.fillStyle = '#8b2500';
      ctx.fillRect(0, 0, s, s);
      // 漆面光泽变化
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = `rgba(${139 + Math.random() * 30}, ${37 + Math.random() * 15}, 0, 0.1)`;
        ctx.fillRect(Math.random() * s, Math.random() * s, 2, 2);
      }
      // 木纹
      ctx.strokeStyle = 'rgba(60, 10, 0, 0.2)';
      for (let y = 0; y < s; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.random() * 2);
        ctx.lineTo(s, y + Math.random() * 2);
        ctx.stroke();
      }
    });
    return new THREE.MeshStandardMaterial({
      map,
      color: 0x8b2500,
      roughness: 0.35,
      metalness: 0.1,
    });
  },

  // 琉璃瓦材质（大明宫屋顶）
  makeGlazedTile() {
    const map = this.makeCanvasTexture(256, (ctx, s) => {
      ctx.fillStyle = '#1a3a5c';
      ctx.fillRect(0, 0, s, s);
      // 瓦垄纹理
      for (let x = 0; x < s; x += 16) {
        ctx.fillStyle = 'rgba(20, 50, 80, 0.5)';
        ctx.fillRect(x, 0, 8, s);
        ctx.fillStyle = 'rgba(40, 80, 120, 0.3)';
        ctx.fillRect(x + 8, 0, 8, s);
      }
      // 高光点
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = 'rgba(100, 150, 200, 0.2)';
        ctx.fillRect(Math.random() * s, Math.random() * s, 3, 1);
      }
    });
    return new THREE.MeshStandardMaterial({
      map,
      color: 0x1a3a5c,
      roughness: 0.25,
      metalness: 0.4,
    });
  },

  // 青灰砖材质（城墙/坊墙）
  makeGreyBrick() {
    const map = this.makeCanvasTexture(256, (ctx, s) => {
      ctx.fillStyle = '#6a6a6a';
      ctx.fillRect(0, 0, s, s);
      // 砖缝
      ctx.strokeStyle = '#4a4a4a';
      ctx.lineWidth = 2;
      for (let y = 0; y < s; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(s, y);
        ctx.stroke();
        const offset = (y / 32) % 2 === 0 ? 0 : 32;
        for (let x = offset; x < s; x += 64) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 32);
          ctx.stroke();
        }
      }
      // 砖面质感
      for (let i = 0; i < 300; i++) {
        ctx.fillStyle = `rgba(${100 + Math.random() * 30}, ${100 + Math.random() * 30}, ${100 + Math.random() * 30}, 0.15)`;
        ctx.fillRect(Math.random() * s, Math.random() * s, 2, 2);
      }
    });
    return new THREE.MeshStandardMaterial({
      map,
      color: 0x6a6a6a,
      roughness: 0.9,
      metalness: 0.0,
    });
  },

  // 汉白玉材质（台基/栏杆）
  makeWhiteMarble() {
    const map = this.makeCanvasTexture(256, (ctx, s) => {
      ctx.fillStyle = '#e8e8e0';
      ctx.fillRect(0, 0, s, s);
      // 大理石纹理
      for (let i = 0; i < 20; i++) {
        ctx.strokeStyle = `rgba(180, 180, 170, ${0.1 + Math.random() * 0.2})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * s, Math.random() * s);
        ctx.bezierCurveTo(
          Math.random() * s, Math.random() * s,
          Math.random() * s, Math.random() * s,
          Math.random() * s, Math.random() * s
        );
        ctx.stroke();
      }
    });
    return new THREE.MeshStandardMaterial({
      map,
      color: 0xe8e8e0,
      roughness: 0.4,
      metalness: 0.0,
    });
  },

  // 原木材质（民居/店铺）
  makeRawWood() {
    const map = this.makeCanvasTexture(256, (ctx, s) => {
      ctx.fillStyle = '#8b6f47';
      ctx.fillRect(0, 0, s, s);
      // 木纹
      for (let y = 0; y < s; y += 6) {
        ctx.strokeStyle = `rgba(${100 + Math.random() * 30}, ${70 + Math.random() * 20}, 30, 0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y + Math.random() * 3);
        ctx.bezierCurveTo(s * 0.3, y + Math.random() * 5, s * 0.7, y - Math.random() * 5, s, y + Math.random() * 3);
        ctx.stroke();
      }
      // 木节
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = 'rgba(60, 40, 20, 0.4)';
        ctx.beginPath();
        ctx.ellipse(Math.random() * s, Math.random() * s, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    return new THREE.MeshStandardMaterial({
      map,
      color: 0x8b6f47,
      roughness: 0.8,
      metalness: 0.0,
    });
  },

  init() {
    // 注册高质量材质到全局MAT对象
    if (typeof MAT !== 'undefined') {
      MAT.vermilion = this.makeVermilionLacquer();
      MAT.glazedBlue = this.makeGlazedTile();
      MAT.greyBrick = this.makeGreyBrick();
      MAT.whiteMarble = this.makeWhiteMarble();
      MAT.rawWood = this.makeRawWood();
      console.log('[PBRMaterialUpgrade] 5种高质量PBR材质已注册：朱红漆/蓝琉璃/青灰砖/汉白玉/原木');
    }
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new PBRMaterialUpgrade().init();
  };
}
