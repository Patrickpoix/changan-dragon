/* ============================================================
   夜景灯光增强 v2.0
   灯笼、街灯、宫灯、光晕效果
   ============================================================ */

const NightLightingEnhancer = {
  
  createLantern(size, color = 0xff6b35) {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.SphereGeometry(size, 12, 8);
    bodyGeo.scale(1, 1.2, 1);
    
    const bodyMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9
    });
    
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);
    
    const capGeo = new THREE.CylinderGeometry(size * 0.6, size * 0.6, size * 0.2, 8);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.3 });
    
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.y = size * 1.2;
    group.add(topCap);
    
    const bottomCap = new THREE.Mesh(capGeo, capMat);
    bottomCap.position.y = -size * 1.2;
    group.add(bottomCap);
    
    const tasselGeo = new THREE.CylinderGeometry(0.02, 0.01, size * 0.5, 4);
    const tasselMat = new THREE.MeshStandardMaterial({ color: 0xd4af37 });
    const tassel = new THREE.Mesh(tasselGeo, tasselMat);
    tassel.position.y = -size * 1.5;
    group.add(tassel);
    
    const light = new THREE.PointLight(color, 0.5 * size, 10 * size);
    light.position.y = 0;
    group.add(light);
    
    const glowTexture = this.createGlowTexture(color);
    const glowMat = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(size * 3, size * 3, 1);
    group.add(glow);
    
    return group;
  },
  
  createStreetLight(height = 5) {
    const group = new THREE.Group();
    
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, height, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = height / 2;
    pole.castShadow = true;
    group.add(pole);
    
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.position.set(0.5, height - 0.5, 0);
    arm.rotation.z = Math.PI / 2;
    group.add(arm);
    
    const lantern = this.createLantern(0.3);
    lantern.position.set(1, height - 0.5, 0);
    group.add(lantern);
    
    return group;
  },
  
  createPalaceLantern(size = 1) {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.BoxGeometry(size, size * 1.2, size);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xfff0c0,
      emissive: 0xffd080,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8
    });
    
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);
    
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });
    
    const corners = [
      [size/2, size*0.6, size/2],
      [size/2, size*0.6, -size/2],
      [-size/2, size*0.6, size/2],
      [-size/2, size*0.6, -size/2],
    ];
    
    corners.forEach(([x, y, z]) => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, size * 1.3, 0.05),
        frameMat
      );
      post.position.set(x, 0, z);
      group.add(post);
    });
    
    const light = new THREE.PointLight(0xffd080, 1, 15);
    group.add(light);
    
    return group;
  },
  
  createGlowTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    const colorHex = '#' + color.toString(16).padStart(6, '0');
    gradient.addColorStop(0, colorHex);
    gradient.addColorStop(0.5, colorHex + '80');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    return new THREE.CanvasTexture(canvas);
  },
  
  getNightIntensity(timeOfDay) {
    if (timeOfDay > 0.25 && timeOfDay < 0.75) return 0;
    
    const nightStart = 0.75;
    const nightEnd = 0.25;
    
    if (timeOfDay >= nightStart || timeOfDay <= nightEnd) {
      if (timeOfDay >= 0.9 || timeOfDay <= 0.1) return 1.0;
      return 0.5;
    }
    
    return 0;
  }
};

window.NightLightingEnhancer = NightLightingEnhancer;

console.log('[Night-Lighting] 夜景灯光增强模块加载完成');
