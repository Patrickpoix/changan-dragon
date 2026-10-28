/* ============================================================
   高质量唐式建筑生成器 v1.0
   使用ExtrudeGeometry/LatheGeometry替代简单Box/Cone拼接
   ============================================================ */

const HighQualityArchitecture = {
  
  // 创建飞檐翘角屋顶（用ExtrudeGeometry）
  createCurvedRoof(width, depth, height, upturn) {
    // 屋顶轮廓线（侧面）
    const shape = new THREE.Shape();
    const w = width / 2;
    const d = depth / 2;
    
    // 绘制飞檐翘角的剖面
    shape.moveTo(-w, 0);
    shape.lineTo(-w + upturn, height * 0.3);  // 起翘
    shape.lineTo(-w * 0.6, height * 0.7);     // 上升
    shape.lineTo(0, height);                    // 屋脊
    shape.lineTo(w * 0.6, height * 0.7);
    shape.lineTo(w - upturn, height * 0.3);
    shape.lineTo(w, 0);
    shape.lineTo(-w, 0);
    
    // 挤压厚度
    const extrudeSettings = {
      depth: depth,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 0.3,
      bevelSegments: 2
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(-Math.PI / 2);
    
    return geometry;
  },
  
  // 创建圆柱（用LatheGeometry）
  createColumn(radius, height) {
    const points = [];
    // 柱础
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(radius * 1.3, 0));
    points.push(new THREE.Vector2(radius * 1.3, height * 0.05));
    points.push(new THREE.Vector2(radius * 1.1, height * 0.05));
    points.push(new THREE.Vector2(radius * 1.1, height * 0.08));
    // 柱身（微收分）
    points.push(new THREE.Vector2(radius, height * 0.1));
    points.push(new THREE.Vector2(radius * 0.95, height * 0.9));
    // 柱头
    points.push(new THREE.Vector2(radius * 1.1, height * 0.92));
    points.push(new THREE.Vector2(radius * 1.1, height * 0.95));
    points.push(new THREE.Vector2(radius * 1.3, height * 0.95));
    points.push(new THREE.Vector2(radius * 1.3, height));
    points.push(new THREE.Vector2(0, height));
    
    const geometry = new THREE.LatheGeometry(points, 16);
    return geometry;
  },
  
  // 创建斗拱（多层结构）
  createDougong(scale) {
    const group = new THREE.Group();
    
    // 坐斗
    const baseGeo = new THREE.BoxGeometry(0.8 * scale, 0.2 * scale, 0.6 * scale);
    const base = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({ color: 0xd4a574 }));
    base.position.y = 0.1 * scale;
    group.add(base);
    
    // 横拱
    const crossGeo = new THREE.BoxGeometry(1.2 * scale, 0.15 * scale, 0.3 * scale);
    const cross = new THREE.Mesh(crossGeo, new THREE.MeshStandardMaterial({ color: 0x8b4513 }));
    cross.position.y = 0.3 * scale;
    group.add(cross);
    
    // 翘
    const tipGeo = new THREE.BoxGeometry(0.4 * scale, 0.12 * scale, 0.8 * scale);
    const tip = new THREE.Mesh(tipGeo, new THREE.MeshStandardMaterial({ color: 0xd4a574 }));
    tip.position.y = 0.48 * scale;
    group.add(tip);
    
    return group;
  },
  
  // 创建格扇门窗（精细格纹）
  createLatticeWindow(width, height) {
    const group = new THREE.Group();
    
    // 窗框
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x6b3410 });
    
    // 上框
    const top = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, 0.12), frameMat);
    top.position.y = height / 2;
    group.add(top);
    
    // 下框
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, 0.12), frameMat);
    bottom.position.y = -height / 2;
    group.add(bottom);
    
    // 左框
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.1, height, 0.12), frameMat);
    left.position.x = -width / 2;
    group.add(left);
    
    // 右框
    const right = new THREE.Mesh(new THREE.BoxGeometry(0.1, height, 0.12), frameMat);
    right.position.x = width / 2;
    group.add(right);
    
    // 窗纸
    const paper = new THREE.Mesh(
      new THREE.PlaneGeometry(width - 0.1, height - 0.1),
      new THREE.MeshStandardMaterial({ color: 0xfff8dc, side: THREE.DoubleSide })
    );
    paper.position.z = 0.02;
    group.add(paper);
    
    // 竖格
    const barMat = new THREE.MeshStandardMaterial({ color: 0x6b3410 });
    const vBars = Math.floor(width / 0.5);
    for (let i = 1; i < vBars; i++) {
      const t = i / vBars;
      const x = (t - 0.5) * (width - 0.1);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, height - 0.1, 0.04), barMat);
      bar.position.set(x, 0, 0.05);
      group.add(bar);
    }
    
    // 横格
    const hBars = Math.floor(height / 0.5);
    for (let i = 1; i < hBars; i++) {
      const t = i / hBars;
      const y = (t - 0.5) * (height - 0.1);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(width - 0.1, 0.04, 0.04), barMat);
      bar.position.set(0, y, 0.05);
      group.add(bar);
    }
    
    return group;
  },
  
  // 创建完整唐式大殿
  createHall(width, depth, height, options = {}) {
    const group = new THREE.Group();
    
    const {
      columns = true,
      windows = true,
      dougong = true,
      platform = true
    } = options;
    
    // 台基
    if (platform) {
      const platformGeo = new THREE.BoxGeometry(width + 4, 1.5, depth + 4);
      const platformMat = new THREE.MeshStandardMaterial({ color: 0xd8c9ad, roughness: 0.9 });
      const platformMesh = new THREE.Mesh(platformGeo, platformMat);
      platformMesh.position.y = 0.75;
      platformMesh.receiveShadow = true;
      group.add(platformMesh);
    }
    
    const baseY = platform ? 1.5 : 0;
    
    // 墙体
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x9c4938, roughness: 0.8 });
    const wallGeo = new THREE.BoxGeometry(width, height * 0.6, depth);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = baseY + height * 0.3;
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);
    
    // 柱子
    if (columns) {
      const columnRadius = 0.4;
      const columnHeight = height * 0.65;
      const columnGeo = this.createColumn(columnRadius, columnHeight);
      const columnMat = new THREE.MeshStandardMaterial({ color: 0xb54d37 });
      
      const colCount = Math.floor(width / 4);
      for (let i = 0; i <= colCount; i++) {
        const t = i / colCount;
        const x = (t - 0.5) * width;
        
        // 前柱
        const colFront = new THREE.Mesh(columnGeo, columnMat);
        colFront.position.set(x, baseY, depth / 2 + 0.3);
        colFront.castShadow = true;
        group.add(colFront);
        
        // 后柱
        const colBack = new THREE.Mesh(columnGeo, columnMat);
        colBack.position.set(x, baseY, -depth / 2 - 0.3);
        colBack.castShadow = true;
        group.add(colBack);
      }
    }
    
    // 格扇门窗
    if (windows) {
      const windowCount = Math.floor(width / 5);
      for (let i = 0; i < windowCount; i++) {
        const t = (i + 0.5) / windowCount;
        const x = (t - 0.5) * (width - 2);
        
        const win = this.createLatticeWindow(3, 3);
        win.position.set(x, baseY + height * 0.35, depth / 2 + 0.1);
        group.add(win);
      }
    }
    
    // 斗拱
    if (dougong) {
      const dougongCount = Math.floor(width / 3);
      for (let i = 0; i <= dougongCount; i++) {
        const t = i / dougongCount;
        const x = (t - 0.5) * width;
        
        const dg = this.createDougong(1);
        dg.position.set(x, baseY + height * 0.6, depth / 2 + 0.3);
        group.add(dg);
      }
    }
    
    // 飞檐翘角屋顶
    const roofGeo = this.createCurvedRoof(width + 2, depth + 2, height * 0.4, 1);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x5c7475, roughness: 0.7 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = baseY + height * 0.6;
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);
    
    return group;
  }
};

// 导出
window.HighQualityArchitecture = HighQualityArchitecture;

console.log('[HQ-Architecture] 高质量唐式建筑生成器加载完成');
