/* ============================================================
   专业级唐式屋顶生成器 v1.0
   参考 Forbidden City 3D 项目的举折剖面、翼角起翘算法
   ============================================================ */

const ProRoofBuilder = {
  
  // 举折剖面：t=0屋脊 → 1檐口，凹曲线（脊部陡、檐部缓）
  profile(a) {
    return (t) => {
      const q = 1 - t;
      return a * q + (1 - a) * q * q;
    };
  },
  
  // 生成等高线多边形顶点（矩形）
  rectCorners(halfW, halfD) {
    return [
      [-halfW, -halfD],
      [ halfW, -halfD],
      [ halfW,  halfD],
      [-halfW,  halfD]
    ];
  },
  
  // 生成等高线多边形顶点（八边形攒尖）
  octCorners(radius) {
    const corners = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      corners.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
    }
    return corners;
  },
  
  // 创建屋顶坡面（等高线多边形族）
  createRoofSurface(width, depth, height, options = {}) {
    const {
      upturn = 0.8,
      overhang = 1.5,
      profileParam = 0.55,
      segments = 8
    } = options;
    
    const halfW = width / 2 + overhang;
    const halfD = depth / 2 + overhang;
    
    const P = this.profile(profileParam);
    
    const positions = [];
    const uvs = [];
    const indices = [];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = P(t) * height;
      const cornerLift = t * upturn;
      
      const corners = this.rectCorners(halfW * (1 - t * 0.8), halfD * (1 - t * 0.8));
      
      for (let j = 0; j < 4; j++) {
        let [x, z] = corners[j];
        const isCorner = (j === 0 || j === 2);
        const yOffset = isCorner ? cornerLift * 0.5 : cornerLift * 0.2;
        
        positions.push(x, y + yOffset, z);
        uvs.push(j / 4, t);
      }
    }
    
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < 4; j++) {
        const a = i * 4 + j;
        const b = i * 4 + ((j + 1) % 4);
        const c = (i + 1) * 4 + j;
        const d = (i + 1) * 4 + ((j + 1) % 4);
        indices.push(a, c, b, b, c, d);
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  },
  
  // 创建正脊（屋脊）
  createMainRidge(length, radius) {
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
    geometry.rotateZ(Math.PI / 2);
    return geometry;
  },
  
  // 创建角脊（四条斜脊）
  createHipRidge(start, end, radius) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(start[0], start[1], start[2]),
      new THREE.Vector3((start[0] + end[0]) / 2, (start[1] + end[1]) / 2 + 0.2, (start[2] + end[2]) / 2),
      new THREE.Vector3(end[0], end[1], end[2])
    ]);
    return new THREE.TubeGeometry(curve, 8, radius, 6, false);
  },
  
  // 创建完整歇山顶屋顶
  createXieshanRoof(width, depth, height) {
    const group = new THREE.Group();
    
    const roofGeo = this.createRoofSurface(width, depth, height, {
      upturn: height * 0.15,
      overhang: 1.2,
      profileParam: 0.55
    });
    
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x5c7475,
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);
    
    const ridgeGeo = this.createMainRidge(width * 0.6, 0.2);
    const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x4a6670, roughness: 0.6 });
    const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
    ridge.position.y = height;
    group.add(ridge);
    
    const halfW = width / 2 + 1.2;
    const halfD = depth / 2 + 1.2;
    const corners = [
      [-halfW, 0, -halfD],
      [ halfW, 0, -halfD],
      [ halfW, 0,  halfD],
      [-halfW, 0,  halfD]
    ];
    const ridgeEnds = [
      [-width * 0.3, height, -depth * 0.3],
      [ width * 0.3, height, -depth * 0.3],
      [ width * 0.3, height,  depth * 0.3],
      [-width * 0.3, height,  depth * 0.3]
    ];
    
    corners.forEach((corner, i) => {
      const hipGeo = this.createHipRidge(ridgeEnds[i], corner, 0.12);
      const hip = new THREE.Mesh(hipGeo, ridgeMat);
      group.add(hip);
    });
    
    return group;
  },
  
  // 创建攒尖顶亭子屋顶
  createPavilionRoof(width, height) {
    const group = new THREE.Group();
    
    const halfW = width / 2 + 1.0;
    const P = this.profile(0.45);
    
    const segments = 8;
    const positions = [];
    const uvs = [];
    const indices = [];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = P(t) * height;
      const r = halfW * (1 - t);
      
      const corners = this.octCorners(r);
      for (let j = 0; j < 8; j++) {
        let [x, z] = corners[j];
        const yOffset = t * 0.3;
        positions.push(x, y + yOffset, z);
        uvs.push(j / 8, t);
      }
    }
    
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < 8; j++) {
        const a = i * 8 + j;
        const b = i * 8 + ((j + 1) % 8);
        const c = (i + 1) * 8 + j;
        const d = (i + 1) * 8 + ((j + 1) % 8);
        indices.push(a, c, b, b, c, d);
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    const mat = new THREE.MeshStandardMaterial({
      color: 0x5c7475,
      roughness: 0.7,
      side: THREE.DoubleSide
    });
    
    const roof = new THREE.Mesh(geometry, mat);
    roof.castShadow = true;
    group.add(roof);
    
    const finialGeo = new THREE.SphereGeometry(0.3, 8, 6);
    const finialMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });
    const finial = new THREE.Mesh(finialGeo, finialMat);
    finial.position.y = height + 0.2;
    group.add(finial);
    
    return group;
  }
};

window.ProRoofBuilder = ProRoofBuilder;

console.log('[Pro-RoofBuilder] 专业级唐式屋顶生成器加载完成');
