/* ============================================================
   地形道路增强 v2.0
   地形纹理、道路细节、路缘、人行道
   ============================================================ */

const TerrainRoadEnhancer = {
  
  createRoadMaterial(width = 10) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#d7d0bd';
    ctx.fillRect(0, 0, 256, 256);
    
    ctx.strokeStyle = '#b0a890';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 32);
      ctx.lineTo(256, i * 32);
      ctx.stroke();
    }
    
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 32, 0);
      ctx.lineTo(i * 32, 256);
      ctx.stroke();
    }
    
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = 'rgba(100, 90, 70, 0.1)';
      ctx.beginPath();
      ctx.arc(
        Math.random() * 256,
        Math.random() * 256,
        Math.random() * 10 + 5,
        0, Math.PI * 2
      );
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(width / 10, 1);
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
      metalness: 0.0
    });
  },
  
  createCurb(length, height = 0.15, width = 0.3) {
    const curbGeo = new THREE.BoxGeometry(length, height, width);
    const curbMat = new THREE.MeshStandardMaterial({ 
      color: 0xd8c9ad, 
      roughness: 0.9 
    });
    
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.y = height / 2;
    curb.receiveShadow = true;
    
    return curb;
  },
  
  createSidewalk(width, length) {
    const group = new THREE.Group();
    
    const sidewalkGeo = new THREE.BoxGeometry(width, 0.1, length);
    const sidewalkMat = new THREE.MeshStandardMaterial({ 
      color: 0xc8b99d, 
      roughness: 0.9 
    });
    const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalk.position.y = 0.05;
    sidewalk.receiveShadow = true;
    group.add(sidewalk);
    
    const curb = this.createCurb(length, 0.15, 0.2);
    curb.position.set(width / 2, 0, 0);
    group.add(curb);
    
    return group;
  },
  
  createGroundTexture(type = 'grass') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    const colors = {
      grass: '#7a9a5a',
      dirt: '#a08060',
      stone: '#b8a88a',
    };
    
    ctx.fillStyle = colors[type] || colors.grass;
    ctx.fillRect(0, 0, 256, 256);
    
    const imageData = ctx.getImageData(0, 0, 256, 256);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30;
      data[i] += noise;
      data[i + 1] += noise;
      data[i + 2] += noise;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  },
  
  createStairs(width, steps, stepHeight = 0.15, stepDepth = 0.4) {
    const group = new THREE.Group();
    
    const stepMat = new THREE.MeshStandardMaterial({ 
      color: 0xd8c9ad, 
      roughness: 0.9 
    });
    
    for (let i = 0; i < steps; i++) {
      const stepGeo = new THREE.BoxGeometry(width, stepHeight, stepDepth);
      const step = new THREE.Mesh(stepGeo, stepMat);
      step.position.set(0, i * stepHeight + stepHeight / 2, i * stepDepth);
      step.receiveShadow = true;
      step.castShadow = true;
      group.add(step);
    }
    
    return group;
  }
};

window.TerrainRoadEnhancer = TerrainRoadEnhancer;

console.log('[Terrain-Road] 地形道路增强模块加载完成');
