# 天气系统代码框架设计（2026-10-25）

> 天气系统的代码结构设计。

---

## 一、文件结构

```
src/weather/
├── WeatherManager.js    # 天气管理器
├── RainSystem.js        # 雨粒子系统
├── SnowSystem.js        # 雪粒子系统
├── FogSystem.js         # 雾系统
└── utils/
    └── particleUtils.js # 粒子工具
```

---

## 二、WeatherManager类

```javascript
class WeatherManager {
  constructor() {
    this.currentWeather = 'clear';  // clear/rain/snow/fog
    this.rainSystem = new RainSystem();
    this.snowSystem = new SnowSystem();
    this.fogSystem = new FogSystem();

    // 天气概率
    this.weatherProbability = {
      clear: 0.6,
      cloud: 0.2,
      rain: 0.1,
      snow: 0.05,
      fog: 0.05
    };
  }

  setWeather(weather) {
    // 切换天气
    this.currentWeather = weather;

    // 启用对应系统
    this.rainSystem.setVisible(weather === 'rain');
    this.snowSystem.setVisible(weather === 'snow');
    this.fogSystem.setIntensity(weather === 'fog' ? 0.02 : 0.002);

    // 调整光照
    this.adjustLighting(weather);
  }

  randomizeWeather() {
    // 随机切换天气
    const r = Math.random();
    let cumulative = 0;
    for (const [weather, prob] of Object.entries(this.weatherProbability)) {
      cumulative += prob;
      if (r < cumulative) {
        this.setWeather(weather);
        break;
      }
    }
  }

  adjustLighting(weather) {
    switch(weather) {
      case 'clear':
        this.sunLight.intensity = 1.0;
        this.sunLight.color.set(0xffffff);
        break;
      case 'cloud':
        this.sunLight.intensity = 0.6;
        this.sunLight.color.set(0xeeeeee);
        break;
      case 'rain':
        this.sunLight.intensity = 0.4;
        this.sunLight.color.set(0xaaaaaa);
        break;
      case 'snow':
        this.sunLight.intensity = 0.7;
        this.sunLight.color.set(0xf0f0ff);
        break;
      case 'fog':
        this.sunLight.intensity = 0.5;
        this.sunLight.color.set(0xdddddd);
        break;
    }
  }
}
```

---

## 三、RainSystem类

```javascript
class RainSystem {
  constructor() {
    const particleCount = 3000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    // 随机初始位置
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x8888ff,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });

    this.particles = new THREE.Points(geometry, material);
    this.velocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      this.velocities[i] = 10 + Math.random() * 10;  // 下落速度
    }
  }

  update(deltaTime) {
    const positions = this.particles.geometry.attributes.position.array;

    for (let i = 0; i < positions.length / 3; i++) {
      // 下落
      positions[i * 3 + 1] -= this.velocities[i] * deltaTime;

      // 落地后重置到顶部
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 50;
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  setVisible(visible) {
    this.particles.visible = visible;
  }
}
```

---

## 四、使用示例

```javascript
const weatherManager = new WeatherManager();
weatherManager.setWeather('clear');

// 随机切换天气
setInterval(() => {
  weatherManager.randomizeWeather();
}, 60000);  // 每分钟随机切换

function gameLoop() {
  weatherManager.rainSystem.update(deltaTime);
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
```

---
文档日期：2026-10-25
