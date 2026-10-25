# 渲染管线代码框架设计（2026-10-25）

> 渲染管线的代码结构设计。

---

## 一、文件结构

```
src/rendering/
├── RendererManager.js    # 渲染器管理器
├── PostProcessing.js     # 后处理
├── ShadowSystem.js       # 阴影系统
├── MaterialLibrary.js     # 材质库
└── utils/
    └── colorUtils.js      # 颜色工具
```

---

## 二、RendererManager类

```javascript
class RendererManager {
  constructor(canvas) {
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });

    // 渲染设置
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 色调映射
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // 输出颜色空间
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 阴影
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 后处理
    this.postProcessing = new PostProcessing();

    // 材质库
    this.materialLibrary = new MaterialLibrary();
  }

  render(scene, camera) {
    // 渲染
    this.postProcessing.render(scene, camera);
  }

  setQuality(level) {
    switch(level) {
      case 'high':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.shadowMapSize = 4096;
        break;
      case 'medium':
        this.renderer.setPixelRatio(1.5);
        this.shadowMapSize = 2048;
        break;
      case 'low':
        this.renderer.setPixelRatio(1);
        this.shadowMapSize = 1024;
        break;
    }
  }
}
```

---

## 三、PostProcessing类

```javascript
class PostProcessing {
  constructor() {
    // 后处理管线
    this.composer = new THREE.EffectComposer(renderer);

    // 渲染通道
    this.renderPass = new THREE.RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // Bloom后处理(灯笼光晕)
    this.bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8,  // 强度
      0.4,  // 半径
      0.85  // 阈值
    );
    this.composer.addPass(this.bloomPass);

    // 输出通道
    this.outputPass = new THREE.OutputPass();
    this.composer.addPass(this.outputPass);
  }

  render(scene, camera) {
    this.renderPass.scene = scene;
    this.renderPass.camera = camera;
    this.composer.render();
  }

  setBloomIntensity(intensity) {
    this.bloomPass.strength = intensity;
  }
}
```

---

## 四、ShadowSystem类

```javascript
class ShadowSystem {
  constructor() {
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.sunLight.castShadow = true;

    // 阴影贴图大小
    this.sunLight.shadow.mapSize.width = 4096;
    this.sunLight.shadow.mapSize.height = 4096;

    // 阴影范围
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 500;
    this.sunLight.shadow.camera.left = -100;
    this.sunLight.shadow.camera.right = 100;
    this.sunLight.shadow.camera.top = 100;
    this.sunLight.shadow.camera.bottom = -100;

    // 阴影偏移(避免 acne)
    this.sunLight.shadow.bias = -0.001;
  }

  update(cameraPosition) {
    // 让阴影跟随相机
    this.sunLight.position.x = cameraPosition.x + 50;
    this.sunLight.position.y = 100;
    this.sunLight.position.z = cameraPosition.z + 50;
    this.sunLight.target.position.set(cameraPosition.x, 0, cameraPosition.z);
  }
}
```

---

## 五、使用示例

```javascript
const rendererManager = new RendererManager(canvas);

function gameLoop() {
  rendererManager.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
```

---
文档日期：2026-10-25
