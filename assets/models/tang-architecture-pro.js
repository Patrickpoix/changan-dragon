/* ============================================================
   唐式建筑精修 v2.0
   专业级建筑细节：举折屋顶、斗拱、格扇、彩画、瓦垄
   ============================================================ */

const TangArchitecturePro = {
  
  // 屋顶生成器 — 举折剖面 + 翼角起翘
  createHippedRoof(width, depth, height, options = {}) {
    const {
      upturn = 0.8,
      overhang = 1.5,
      profileParam = 0.55,
      segments = 12,
      roofColor = 0x5c7475
    } = options;
    
    const halfW = width / 2 + overhang;
    const halfD = depth / 2 + overhang;
    
    const profile = (t) => {
      const q = 1 - t;
      return profileParam * q + (1 - profileParam) * q * q;
    };
    
    const positions = [];
    const uvs = [];
    const indices = [];
    
    const sides = [
      { axis: 'z', sign: 1 },
      { axis: 'z', sign: -1 },
      { axis: 'x', sign: 1 },
      { axis: 'x', sign: -1 },
    ];
    
    let vertexOffset = 0;
    
    sides.forEach((side) => {
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = profile(t) * height;
        const cornerLift = t * upturn;
        
        for (let j = 0; j <= 1; j++) {
          const s = j === 0 ? -1 : 1;
          const along = s * (1 - t * 0.7);
          
          let x, z;
          if (side.axis === 'z') {
            x = along * halfW * 0.7;
            z = side.sign * halfD;
          } else {
            x = side.sign * halfW;
            z = along * halfD * 0.7;
          }
          
          const yOffset = Math.abs(s) > 0.5 ? cornerLift * 0.3 : cornerLift * 0.1;
          
          positions.push(x, y + yOffset, z);
          uvs.push(j, t);
        }
      }
      
      for (let i = 0; i < segments; i++) {
        const a = vertexOffset + i * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;
        indices.push(a, c, b, b, c, d);
      }
      
      vertexOffset += (segments + 1) * 2;
    });
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
      color: roofColor,
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  },
  
  // 斗拱生成器 — 三层结构
  createDougong(scale = 1) {
    const group = new THREE.Group();
    
    const baseGeo = new THREE.BoxGeometry(1.0 * scale, 0.25 * scale, 0.7 * scale);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xd4a574 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.125 * scale;
    group.add(base);
    
    const crossGeo = new THREE.BoxGeometry(1.6 * scale, 0.18 * scale, 0.35 * scale);
    const crossMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const cross = new THREE.Mesh(crossGeo, crossMat);
    cross.position.y = 0.35 * scale;
    group.add(cross);
    
    const tipGeo = new THREE.BoxGeometry(0.5 * scale, 0.15 * scale, 1.0 * scale);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xd4a574 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = 0.52 * scale;
    group.add(tip);
    
    return group;
  },
  
  // 格扇门窗生成器
  createLatticeWindow(width, height) {
    const group = new THREE.Group();
    
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x6b3410 });
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xfff8dc, side: THREE.DoubleSide });
    
    const top = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, 0.12), frameMat);
    top.position.y = height / 2;
    group.add(top);
    
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, 0.12), frameMat);
    bottom.position.y = -height / 2;
    group.add(bottom);
    
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.12, height, 0.12), frameMat);
    left.position.x = -width / 2;
    group.add(left);
    
    const right = new THREE.Mesh(new THREE.BoxGeometry(0.12, height, 0.12), frameMat);
    right.position.x = width / 2;
    group.add(right);
    
    const paper = new THREE.Mesh(
      new THREE.PlaneGeometry(width - 0.12, height - 0.12),
      paperMat
    );
    paper.position.z = 0.02;
    group.add(paper);
    
    const barMat = new THREE.MeshStandardMaterial({ color: 0x6b3410 });
    const vBars = Math.floor(width / 0.5);
    for (let i = 1; i < vBars; i++) {
      const t = i / vBars;
      const x = (t - 0.5) * (width - 0.12);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, height - 0.12, 0.04), barMat);
      bar.position.set(x, 0, 0.05);
      group.add(bar);
    }
    
    const hBars = Math.floor(height / 0.5);
    for (let i = 1; i < hBars; i++) {
      const t = i / hBars;
      const y = (t - 0.5) * (height - 0.12);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(width - 0.12, 0.04, 0.04), barMat);
      bar.position.set(0, y, 0.05);
      group.add(bar);
    }
    
    return group;
  },
  
  // 彩画生成器 — 梁枋彩绘
  createCaifeng(width) {
    const group = new THREE.Group();
    
    const mainGeo = new THREE.BoxGeometry(width, 0.35, 0.08);
    const mainMat = new THREE.MeshStandardMaterial({ color: 0x2d5a3d });
    const main = new THREE.Mesh(mainGeo, mainMat);
    group.add(main);
    
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.4 });
    const topBorder = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.1), borderMat);
    topBorder.position.y = 0.19;
    group.add(topBorder);
    
    const bottomBorder = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.1), borderMat);
    bottomBorder.position.y = -0.19;
    group.add(bottomBorder);
    
    const redMat = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
    const count = Math.floor(width / 1.5);
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const x = (t - 0.5) * (width - 0.5);
      const dot = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.1), redMat);
      dot.position.set(x, 0, 0.02);
      group.add(dot);
    }
    
    return group;
  },
  
  // 完整大殿生成器
  createHall(width, depth, height, options = {}) {
    const {
      platform = true,
      columns = true,
      windows = true,
      dougong = true,
      caifeng = true,
      roofColor = 0x5c7475
    } = options;
    
    const group = new THREE.Group();
    
    if (platform) {
      const platformGeo = new THREE.BoxGeometry(width + 4, 1.5, depth + 4);
      const platformMat = new THREE.MeshStandardMaterial({ color: 0xd8c9ad, roughness: 0.9 });
      const platformMesh = new THREE.Mesh(platformGeo, platformMat);
      platformMesh.position.y = 0.75;
      platformMesh.receiveShadow = true;
      group.add(platformMesh);
    }
    
    const baseY = platform ? 1.5 : 0;
    
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x9c4938, roughness: 0.8 });
    const wallGeo = new THREE.BoxGeometry(width, height * 0.6, depth);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = baseY + height * 0.3;
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);
    
    if (columns) {
      const columnMat = new THREE.MeshStandardMaterial({ color: 0xb54d37 });
      const colCount = Math.floor(width / 4);
      
      for (let i = 0; i <= colCount; i++) {
        const t = i / colCount;
        const x = (t - 0.5) * width;
        
        const colFront = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.4, height * 0.65, 12),
          columnMat
        );
        colFront.position.set(x, baseY + height * 0.325, depth / 2 + 0.4);
        colFront.castShadow = true;
        group.add(colFront);
        
        const colBack = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.4, height * 0.65, 12),
          columnMat
        );
        colBack.position.set(x, baseY + height * 0.325, -depth / 2 - 0.4);
        colBack.castShadow = true;
        group.add(colBack);
      }
    }
    
    if (windows) {
      const winCount = Math.floor(width / 5);
      for (let i = 0; i < winCount; i++) {
        const t = (i + 0.5) / winCount;
        const x = (t - 0.5) * (width - 2);
        
        const win = this.createLatticeWindow(3, 3);
        win.position.set(x, baseY + height * 0.35, depth / 2 + 0.1);
        group.add(win);
      }
    }
    
    if (dougong) {
      const dgCount = Math.floor(width / 3);
      for (let i = 0; i <= dgCount; i++) {
        const t = i / dgCount;
        const x = (t - 0.5) * width;
        
        const dg = this.createDougong(1.2);
        dg.position.set(x, baseY + height * 0.6, depth / 2 + 0.4);
        group.add(dg);
      }
    }
    
    if (caifeng) {
      const cf = this.createCaifeng(width - 1);
      cf.position.set(0, baseY + height * 0.58, depth / 2 + 0.05);
      group.add(cf);
    }
    
    const roof = this.createHippedRoof(width, depth, height * 0.4, {
      roofColor: roofColor
    });
    roof.position.y = baseY + height * 0.6;
    group.add(roof);
    
    return group;
  }
};

window.TangArchitecturePro = TangArchitecturePro;

console.log('[Tang-Architecture-Pro] 专业级唐式建筑生成器加载完成');
