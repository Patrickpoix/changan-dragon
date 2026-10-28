/* ============================================================
   天气系统增强 v2.0
   晴、阴、雨、雪、雾 — 完整天气过渡
   ============================================================ */

const WeatherEnhancer = {
  
  types: {
    SUNNY: 'sunny',
    CLOUDY: 'cloudy',
    RAIN: 'rain',
    SNOW: 'snow',
    FOG: 'fog'
  },
  
  current: 'sunny',
  
  rainParticles: null,
  snowParticles: null,
  
  createRain(count = 1000) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      velocities[i] = Math.random() * 0.5 + 0.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.2,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });
    
    const rain = new THREE.Points(geometry, material);
    rain.userData.velocities = velocities;
    rain.visible = false;
    
    return rain;
  },
  
  createSnow(count = 500) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.3,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    
    const snow = new THREE.Points(geometry, material);
    snow.visible = false;
    
    return snow;
  },
  
  setWeather(type) {
    this.current = type;
    console.log('[Weather] 切换到天气:', type);
  },
  
  update(deltaTime, cameraPosition) {
    if (this.rainParticles && this.current === 'rain') {
      const positions = this.rainParticles.geometry.attributes.position.array;
      const velocities = this.rainParticles.userData.velocities;
      
      for (let i = 0; i < velocities.length; i++) {
        positions[i * 3 + 1] -= velocities[i] * deltaTime * 50;
        
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 100;
          positions[i * 3] = cameraPosition.x + (Math.random() - 0.5) * 200;
          positions[i * 3 + 2] = cameraPosition.z + (Math.random() - 0.5) * 200;
        }
      }
      
      this.rainParticles.geometry.attributes.position.needsUpdate = true;
    }
  },
  
  getWeatherParams(type) {
    const params = {
      sunny: {
        fogColor: 0xd4e5f0,
        fogNear: 100,
        fogFar: 800,
        sunIntensity: 1.5,
        ambientIntensity: 0.6,
      },
      cloudy: {
        fogColor: 0xc0c8d0,
        fogNear: 50,
        fogFar: 500,
        sunIntensity: 0.8,
        ambientIntensity: 0.5,
      },
      rain: {
        fogColor: 0x808890,
        fogNear: 20,
        fogFar: 200,
        sunIntensity: 0.4,
        ambientIntensity: 0.4,
      },
      snow: {
        fogColor: 0xe0e8f0,
        fogNear: 30,
        fogFar: 300,
        sunIntensity: 0.6,
        ambientIntensity: 0.5,
      },
      fog: {
        fogColor: 0xa0a8b0,
        fogNear: 5,
        fogFar: 100,
        sunIntensity: 0.3,
        ambientIntensity: 0.3,
      }
    };
    
    return params[type] || params.sunny;
  }
};

window.WeatherEnhancer = WeatherEnhancer;

console.log('[Weather] 天气系统增强模块加载完成');
