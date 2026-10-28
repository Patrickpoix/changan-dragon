/* ============================================================
   昼夜循环系统增强 v2.0
   完整的昼夜变化、日出日落、星空
   ============================================================ */

const DayNightCycleEnhancer = {
  
  timeOfDay: 0.3,
  
  dayLength: 120,
  
  paused: false,
  
  sunLight: null,
  
  moonLight: null,
  
  starField: null,
  
  init(scene, sunLight, moonLight) {
    this.scene = scene;
    this.sunLight = sunLight;
    this.moonLight = moonLight;
    
    this.createStarField();
    
    console.log('[Day-Night] 昼夜循环系统初始化完成');
  },
  
  createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI / 2;
      
      positions[i * 3] = Math.cos(theta) * Math.sin(phi) * 500;
      positions[i * 3 + 1] = Math.cos(phi) * 500;
      positions[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * 500;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0,
    });
    
    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starField);
  },
  
  update(deltaTime) {
    if (this.paused) return;
    
    this.timeOfDay += deltaTime / this.dayLength;
    if (this.timeOfDay >= 1) {
      this.timeOfDay -= 1;
    }
    
    this.updateLighting();
  },
  
  updateLighting() {
    const t = this.timeOfDay;
    
    const sunAngle = t * Math.PI * 2 - Math.PI / 2;
    const sunHeight = Math.sin(sunAngle);
    
    if (this.sunLight) {
      this.sunLight.position.x = Math.cos(sunAngle) * 100;
      this.sunLight.position.y = sunHeight * 100;
      this.sunLight.position.z = 50;
      
      const sunIntensity = Math.max(0, sunHeight);
      this.sunLight.intensity = sunIntensity * 1.5;
      
      if (sunHeight > 0 && sunHeight < 0.3) {
        const t = sunHeight / 0.3;
        this.sunLight.color.setRGB(1, 0.5 + t * 0.5, 0.3 + t * 0.7);
      } else {
        this.sunLight.color.setRGB(1, 1, 1);
      }
    }
    
    if (this.moonLight) {
      const moonAngle = sunAngle + Math.PI;
      const moonHeight = Math.sin(moonAngle);
      
      this.moonLight.position.x = Math.cos(moonAngle) * 100;
      this.moonLight.position.y = moonHeight * 100;
      
      this.moonLight.intensity = Math.max(0, moonHeight) * 0.3;
    }
    
    if (this.starField) {
      const starOpacity = Math.max(0, -sunHeight);
      this.starField.material.opacity = starOpacity * 0.8;
    }
    
    this.updateSkyAndFog();
  },
  
  updateSkyAndFog() {
    const t = this.timeOfDay;
    const sunHeight = Math.sin(t * Math.PI * 2 - Math.PI / 2);
    
    let skyColor, fogColor, fogNear, fogFar;
    
    if (sunHeight > 0.5) {
      skyColor = 0x87ceeb;
      fogColor = 0xd4e5f0;
      fogNear = 100;
      fogFar = 800;
    } else if (sunHeight > 0) {
      const blend = sunHeight / 0.5;
      skyColor = new THREE.Color(0xff6b35).lerp(new THREE.Color(0x87ceeb), blend);
      fogColor = new THREE.Color(0xffb380).lerp(new THREE.Color(0xd4e5f0), blend);
      fogNear = 50;
      fogFar = 500;
    } else {
      skyColor = 0x1a1a2e;
      fogColor = 0x2a2a4a;
      fogNear = 30;
      fogFar = 300;
    }
    
    if (this.scene) {
      if (this.scene.background?.setRGB) {
        this.scene.background.set(skyColor);
      }
      if (this.scene.fog) {
        this.scene.fog.color.set(fogColor);
        this.scene.fog.near = fogNear;
        this.scene.fog.far = fogFar;
      }
    }
  },
  
  setTime(hours) {
    this.timeOfDay = hours / 24;
    this.updateLighting();
  },
  
  getHours() {
    return Math.floor(this.timeOfDay * 24);
  },
  
  getTimeName() {
    const h = this.getHours();
    if (h >= 5 && h < 8) return '日出';
    if (h >= 8 && h < 12) return '上午';
    if (h >= 12 && h < 14) return '正午';
    if (h >= 14 && h < 18) return '下午';
    if (h >= 18 && h < 20) return '日落';
    if (h >= 20 && h < 22) return '黄昏';
    return '夜晚';
  }
};

window.DayNightCycleEnhancer = DayNightCycleEnhancer;

console.log('[Day-Night] 昼夜循环系统增强模块加载完成');
