# 昼夜系统代码框架设计（2026-10-25）

> 昼夜循环的代码结构设计。

---

## 一、文件结构

```
src/daynight/
├── DayNightManager.js   # 昼夜管理器
├── SkySystem.js         # 天空系统
├── LightingSystem.js    # 光照系统
├── StarSystem.js        # 星星系统
└── utils/
    └── colorUtils.js    # 颜色工具
```

---

## 二、DayNightManager类

```javascript
class DayNightManager {
  constructor() {
    this.dayLength = 20 * 60;  // 20分钟现实时间=24小时游戏时间
    this.gameTime = 12 * 60;   // 初始中午12点(分钟)

    this.skySystem = new SkySystem();
    this.lightingSystem = new LightingSystem();
    this.starSystem = new StarSystem();
  }

  update(deltaTime) {
    // 推进游戏时间
    this.gameTime += (deltaTime / this.dayLength) * 24 * 60;
    if (this.gameTime >= 24 * 60) {
      this.gameTime -= 24 * 60;
    }

    // 更新天空颜色
    this.skySystem.update(this.gameTime);

    // 更新光照
    this.lightingSystem.update(this.gameTime);

    // 更新星星
    this.starSystem.update(this.gameTime);
  }

  getHour() {
    return Math.floor(this.gameTime / 60);
  }

  getMinute() {
    return Math.floor(this.gameTime % 60);
  }
}
```

---

## 三、LightingSystem类

```javascript
class LightingSystem {
  constructor() {
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.ambientLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.5);
  }

  update(gameTime) {
    const hour = gameTime / 60;

    // 太阳角度
    const sunAngle = ((hour - 6) / 12) * Math.PI;  // 6点日出,18点日落
    const sunHeight = Math.sin(sunAngle);

    // 白天
    if (sunHeight > 0) {
      // 太阳位置
      this.sunLight.position.x = Math.cos(sunAngle) * 100;
      this.sunLight.position.y = sunHeight * 100;

      // 强度
      this.sunLight.intensity = sunHeight;

      // 颜色(清晨/黄昏偏暖)
      const t = Math.abs(sunHeight);
      if (t < 0.3) {
        // 清晨/黄昏
        this.sunLight.color.set(0xffaa66);
      } else {
        // 白天
        this.sunLight.color.set(0xffffff);
      }
    } else {
      // 夜晚
      this.sunLight.intensity = 0;
    }

    // 环境光
    this.ambientLight.intensity = 0.3 + Math.max(0, sunHeight) * 0.3;
  }
}
```

---

## 四、SkySystem类

```javascript
class SkySystem {
  constructor() {
    // 程序化天空
    this.scene = scene;
  }

  update(gameTime) {
    const hour = gameTime / 60;

    // 根据时间调整天空颜色
    let skyColor;

    if (hour >= 6 && hour < 8) {
      // 清晨
      skyColor = new THREE.Color(0xff9966);
    } else if (hour >= 8 && hour < 17) {
      // 白天
      skyColor = new THREE.Color(0x87ceeb);
    } else if (hour >= 17 && hour < 19) {
      // 黄昏
      skyColor = new THREE.Color(0xff6644);
    } else {
      // 夜晚
      skyColor = new THREE.Color(0x0a0a20);
    }

    // 应用到场景背景和雾
    this.scene.background = skyColor;
    this.scene.fog.color.copy(skyColor);
  }
}
```

---

## 五、使用示例

```javascript
const dayNightManager = new DayNightManager();

function gameLoop() {
  dayNightManager.update(deltaTime);
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
```

---
文档日期：2026-10-25
