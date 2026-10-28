/* ============================================================
   天空大气系统增强 v2.0
   渐变天空、云层、星空、雾效
   ============================================================ */

const SkyAtmosphereEnhancer = {
  
  createGradientSky(topColor, bottomColor) {
    const skyGeo = new THREE.SphereGeometry(500, 32, 32);
    
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(topColor) },
        bottomColor: { value: new THREE.Color(bottomColor) },
        offset: { value: 20 },
        exponent: { value: 0.5 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide,
      fog: false
    });
    
    const sky = new THREE.Mesh(skyGeo, skyMat);
    return sky;
  },
  
  createCloudLayer(count, width, depth) {
    const cloudGroup = new THREE.Group();
    
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      roughness: 1,
      depthWrite: false
    });
    
    for (let i = 0; i < count; i++) {
      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(Math.random() * 10 + 5, 8, 6),
        cloudMat
      );
      cloud.position.set(
        (Math.random() - 0.5) * width,
        Math.random() * 20 + 80,
        (Math.random() - 0.5) * depth
      );
      cloud.scale.y = 0.3;
      cloudGroup.add(cloud);
    }
    
    return cloudGroup;
  },
  
  createStarfield(count) {
    const starGeo = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    for (let i = 0; i < count; i++) {
      const radius = 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI / 2;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      positions.push(x, y, z);
      
      const color = new THREE.Color();
      color.setHSL(0.6, Math.random() * 0.3, 0.8 + Math.random() * 0.2);
      colors.push(color.r, color.g, color.b);
    }
    
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const starMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      depthWrite: false
    });
    
    const stars = new THREE.Points(starGeo, starMat);
    return stars;
  },
  
  getFogParams(timeOfDay) {
    const isDay = timeOfDay > 0.25 && timeOfDay < 0.75;
    
    return {
      color: isDay ? 0xd4e5f0 : 0x1a2a4a,
      near: isDay ? 100 : 30,
      far: isDay ? 800 : 300,
      density: isDay ? 0.001 : 0.005
    };
  }
};

window.SkyAtmosphereEnhancer = SkyAtmosphereEnhancer;

console.log('[Sky-Atmosphere] 天空大气系统增强模块加载完成');
