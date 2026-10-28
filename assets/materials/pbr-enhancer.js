/* ============================================================
   PBR材质增强 v2.0
   法线贴图、粗糙度贴图、AO贴图
   ============================================================ */

const PBRMaterialEnhancer = {
  
  generateNormalMap(width, height, strength = 1.0) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30 * strength;
      data[i] += noise;
      data[i + 1] += noise;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  },
  
  generateRoughnessMap(width, height, baseRoughness = 0.8, variation = 0.2) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const value = (baseRoughness + (Math.random() - 0.5) * variation) * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  },
  
  generateAOMap(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, width / 2
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#808080');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  },
  
  createEnhancedMaterial(baseColor, options = {}) {
    const {
      roughness = 0.8,
      metalness = 0.0,
      normalScale = 0.5,
      mapSize = 256
    } = options;
    
    const material = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: roughness,
      metalness: metalness,
      normalMap: this.generateNormalMap(mapSize, mapSize, normalScale),
      roughnessMap: this.generateRoughnessMap(mapSize, mapSize, roughness),
      aoMap: this.generateAOMap(mapSize, mapSize),
    });
    
    return material;
  },
  
  createWoodMaterial(color = 0x8b6f47) {
    const material = this.createEnhancedMaterial(color, {
      roughness: 0.7,
      metalness: 0.0,
      normalScale: 0.8
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, 256, 256);
    
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 12 + Math.random() * 5);
      ctx.lineTo(256, i * 12 + Math.random() * 5);
      ctx.stroke();
    }
    
    material.map = new THREE.CanvasTexture(canvas);
    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    
    return material;
  },
  
  createStoneMaterial(color = 0xd8c9ad) {
    const material = this.createEnhancedMaterial(color, {
      roughness: 0.9,
      metalness: 0.0,
      normalScale: 1.0
    });
    
    return material;
  },
  
  createRoofTileMaterial(color = 0x5c7475) {
    const material = this.createEnhancedMaterial(color, {
      roughness: 0.6,
      metalness: 0.2,
      normalScale: 0.7
    });
    
    return material;
  }
};

window.PBRMaterialEnhancer = PBRMaterialEnhancer;

console.log('[PBR] PBR材质增强模块加载完成');
