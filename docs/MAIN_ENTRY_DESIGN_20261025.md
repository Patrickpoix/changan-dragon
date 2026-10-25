# 主入口文件设计（2026-10-25）

> 游戏主入口的代码结构设计。

---

## 一、文件结构

```
src/
├── main.js               # 主入口
├── App.js                # 应用主类
├── config.js             # 配置文件
└── systems/
    ├── RendererManager.js
    ├── SceneManager.js
    ├── CameraManager.js
    └── ...
```

---

## 二、App类

```javascript
import * as THREE from 'three';
import { RendererManager } from './systems/RendererManager.js';
import { SceneManager } from './systems/SceneManager.js';
import { CameraManager } from './systems/CameraManager.js';
import { DayNightManager } from './daynight/DayNightManager.js';
import { WeatherManager } from './weather/WeatherManager.js';
import { ChunkManager } from './streaming/ChunkManager.js';
import { NPCManager } from './npc/NPCManager.js';
import { PlayerManager } from './player/PlayerManager.js';
import { InteractionManager } from './interaction/InteractionManager.js';
import { AudioManager } from './audio/AudioManager.js';
import { PerformanceManager } from './performance/PerformanceManager.js';

class App {
  constructor(canvas) {
    // 核心系统
    this.renderer = new RendererManager(canvas);
    this.scene = new SceneManager();
    this.camera = new CameraManager();

    // 游戏系统
    this.dayNightManager = new DayNightManager();
    this.weatherManager = new WeatherManager();
    this.chunkManager = new ChunkManager();
    this.npcManager = new NPCManager();
    this.playerManager = new PlayerManager();
    this.interactionManager = new InteractionManager(this.camera.mainCamera);
    this.audioManager = new AudioManager();
    this.performanceManager = new PerformanceManager();

    // 时钟
    this.clock = new THREE.Clock();

    // 开始游戏循环
    this.gameLoop();
  }

  gameLoop() {
    const deltaTime = this.clock.getDelta();

    // 更新所有系统
    this.dayNightManager.update(deltaTime);
    this.weatherManager.update(deltaTime);
    this.chunkManager.update(this.playerManager.dragon.position);
    this.npcManager.update(this.playerManager.dragon.position, deltaTime);
    this.playerManager.update(deltaTime);
    this.interactionManager.update();
    this.audioManager.update(this.playerManager.dragon.position);
    this.performanceManager.update(this.camera.mainCamera, this.scene.scene);

    // 渲染
    this.renderer.render(this.scene.scene, this.camera.mainCamera);

    requestAnimationFrame(() => this.gameLoop());
  }
}

// 启动游戏
export function init(canvas) {
  const app = new App(canvas);
  return app;
}
```

---

## 三、main.js

```javascript
import { init } from './App.js';

// 等待DOM加载
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const app = init(canvas);

  // 窗口大小调整
  window.addEventListener('resize', () => {
    app.camera.onResize();
    app.renderer.onResize();
  });
});
```

---

## 四、config.js

```javascript
export const CONFIG = {
  // 渲染
  renderer: {
    antialias: true,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    shadowMapSize: 4096,
    toneMapping: 'ACESFilmic'
  },

  // 世界
  world: {
    size: 84.1,  // km²
    chunkSize: 500,  // m
    loadRadius: 3,  // chunks
    prefetchRadius: 7
  },

  // 昼夜
  dayNight: {
    dayLength: 20 * 60,  // 20分钟现实时间 = 24小时游戏时间
    startTime: 12 * 60  // 中午
  },

  // NPC
  npc: {
    maxNPCs: 800,
    spawnRate: 0.1
  },

  // 性能
  performance: {
    targetFPS: 60,
    autoQuality: true
  }
};
```

---

## 五、index.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>龙游长安</title>
  <style>
    body { margin: 0; overflow: hidden; }
    #game-canvas { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <canvas id="game-canvas"></canvas>
  <script type="module" src="src/main.js"></script>
</body>
</html>
```

---

## 六、启动流程

```
1. 页面加载
2. 初始化渲染器
3. 创建场景/相机
4. 加载初始chunk
5. 生成初始NPC
6. 开始游戏循环
7. 持续更新+渲染
```

---
文档日期：2026-10-25
