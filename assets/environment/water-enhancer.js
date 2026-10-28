/* ============================================================
   水景增强 v2.0
   水面反射、波纹、流动、水下
   ============================================================ */

const WaterEnhancer = {
  
  createWaterMaterial(options = {}) {
    const {
      deepColor = 0x397f83,
      shallowColor = 0x87b6a4,
      sunColor = 0xffe6b0,
      waveSpeed = 1.0,
      waveHeight = 0.05
    } = options;
    
    const waterUniforms = {
      time: { value: 0 },
      deep: { value: new THREE.Color(deepColor) },
      shallow: { value: new THREE.Color(shallowColor) },
      sunColor: { value: new THREE.Color(sunColor) },
      sunDir: { value: new THREE.Vector3(0.4, 0.8, 0.3).normalize() },
      waveSpeed: { value: waveSpeed },
      waveHeight: { value: waveHeight }
    };
    
    const waterMat = new THREE.ShaderMaterial({
      uniforms: waterUniforms,
      transparent: false,
      fog: true,
      vertexShader: `
        #include <fog_pars_vertex>
        uniform float time;
        uniform float waveSpeed;
        uniform float waveHeight;
        varying vec3 vWorld;
        varying vec3 vNormalW;
        void main() {
          vec3 pos = position;
          float wave1 = sin(pos.x * 0.5 + time * waveSpeed);
          float wave2 = sin(pos.y * 0.3 + time * waveSpeed * 0.7);
          pos.z += (wave1 + wave2) * waveHeight;
          vec4 wp = modelMatrix * vec4(pos, 1.0);
          vWorld = wp.xyz;
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vec4 mvPosition = viewMatrix * wp;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: `
        #include <fog_pars_fragment>
        uniform float time;
        uniform vec3 deep;
        uniform vec3 shallow;
        uniform vec3 sunColor;
        uniform vec3 sunDir;
        varying vec3 vWorld;
        varying vec3 vNormalW;
        void main() {
          vec2 p = vWorld.xz;
          float w1 = sin(p.x * 0.42 + p.y * 0.23 + time * 1.2);
          float w2 = sin(p.x * 0.18 - p.y * 0.31 - time * 0.8);
          float ripple = (w1 + w2) / 2.0;
          vec3 viewDir = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - max(dot(viewDir, vNormalW), 0.0), 2.5);
          vec3 col = mix(deep, shallow, 0.4 + ripple * 0.1);
          vec3 reflectedSky = mix(shallow, vec3(0.34, 0.52, 0.55), 0.4);
          col = mix(col, reflectedSky, fres * 0.5);
          vec3 refl = reflect(-sunDir, vNormalW);
          float spec = pow(max(dot(refl, viewDir), 0.0), 90.0);
          col += sunColor * spec * 0.8;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }
      `
    });
    
    return waterMat;
  },
  
  createFountain(height, count) {
    const group = new THREE.Group();
    
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.7,
      depthWrite: false
    });
    
    const positions = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.5;
      positions.push(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const particles = new THREE.Points(geo, particleMat);
    group.add(particles);
    
    group.userData.update = function(time) {
      const pos = geo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const yIndex = i * 3 + 1;
        pos[yIndex] = ((time * 2 + i * 0.1) % height);
      }
      geo.attributes.position.needsUpdate = true;
    };
    
    return group;
  },
  
  createShoreRocks(count, radius) {
    const group = new THREE.Group();
    
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x8a8a8a,
      roughness: 0.9,
      flatShading: true
    });
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(Math.random() * 0.5 + 0.2),
        rockMat
      );
      rock.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      group.add(rock);
    }
    
    return group;
  },
  
  createReeds(count, radius) {
    const group = new THREE.Group();
    
    const reedMat = new THREE.MeshStandardMaterial({
      color: 0x6a8c4a,
      roughness: 0.8
    });
    
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0x8b6f47,
      roughness: 0.9
    });
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = radius + Math.random() * 1;
      
      const reed = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.03, 1.5, 4),
        reedMat
      );
      reed.position.set(
        Math.cos(angle) * r,
        0.75,
        Math.sin(angle) * r
      );
      reed.rotation.x = (Math.random() - 0.5) * 0.2;
      group.add(reed);
      
      const tip = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.05, 0.2, 2, 4),
        tipMat
      );
      tip.position.set(
        Math.cos(angle) * r,
        1.55,
        Math.sin(angle) * r
      );
      group.add(tip);
    }
    
    return group;
  }
};

window.WaterEnhancer = WaterEnhancer;

console.log('[Water] 水景增强模块加载完成');
