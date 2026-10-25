# 动态水面代码框架设计（2026-10-25）

> 动态水面的代码结构设计。

---

## 一、文件结构

```
src/water/
├── WaterManager.js      # 水面管理器
├── OceanShader.js        # 湖面色器
├── RiverShader.js       # 河面色器
├── Reflection.js         # 反射
├── WakeEffect.js        # 船行尾波
└── utils/
    ├── noiseUtils.js    # 噪声工具
    └── waveUtils.js      # 波浪工具
```

---

## 二、WaterManager类

```javascript
class WaterManager {
  constructor(config) {
    this.oceanMaterial = new OceanShader({
      size: 2048,
      windDirection: new THREE.Vector2(1, 0),
      windSpeed: 0.5,
      waveHeight: 0.2,
      waveLength: 5
    });

    this.riverMaterial = new RiverShader({
      flowSpeed: 1.0,
      waveHeight: 0.05
    });

    this.ocean = null;
    this.rivers = [];
  }

  createOcean(position, size) {
    const geometry = new THREE.PlaneGeometry(size, size, 128, 128);
    this.ocean = new THREE.Mesh(geometry, this.oceanMaterial);
    this.ocean.rotation.x = -Math.PI / 2;
    this.ocean.position.copy(position);
    scene.add(this.ocean);
  }

  createRiver(points, width) {
    // 沿曲线创建河流
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 100, width/2, 8, false);
    const river = new THREE.Mesh(geometry, this.riverMaterial);
    this.rivers.push(river);
    scene.add(river);
  }

  update(time) {
    // 更新波浪动画
    this.oceanMaterial.uniforms.time.value = time;
    this.riverMaterial.uniforms.time.value = time;

    // 更新反射
    this.updateReflection();

    // 更新尾波
    this.updateWakes();
  }
}
```

---

## 三、OceanShader类

```javascript
class OceanShader extends THREE.ShaderMaterial {
  constructor(config) {
    super({
      uniforms: {
        time: { value: 0 },
        waveHeight: { value: config.waveHeight },
        waveLength: { value: config.waveLength },
        deepColor: { value: new THREE.Color(0x003366) },
        shallowColor: { value: new THREE.Color(0x6699cc) },
        skyColor: { value: new THREE.Color(0x87ceeb) }
      },

      vertexShader: `
        uniform float time;
        uniform float waveHeight;
        uniform float waveLength;

        varying vec2 vUv;
        varying float vElevation;

        void main() {
          vUv = uv;

          // 正弦波叠加
          float wave1 = sin(position.x * 0.1 + time * 1.5) * waveHeight;
          float wave2 = sin(position.y * 0.15 + time * 1.2) * waveHeight * 0.5;
          float wave3 = sin((position.x + position.y) * 0.08 + time * 0.8) * waveHeight * 0.3;

          float elevation = wave1 + wave2 + wave3;
          vElevation = elevation;

          vec3 newPosition = position;
          newPosition.z += elevation;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,

      fragmentShader: `
        uniform vec3 deepColor;
        uniform vec3 shallowColor;
        uniform vec3 skyColor;

        varying vec2 vUv;
        varying float vElevation;

        void main() {
          // 根据高度混合颜色
          float mixRatio = smoothstep(-0.2, 0.2, vElevation);
          vec3 color = mix(shallowColor, deepColor, mixRatio);

          // 菲涅尔反射
          float fresnel = pow(1.0 - abs(vUv.y), 2.0);
          color = mix(color, skyColor, fresnel * 0.5);

          gl_FragColor = vec4(color, 1.0);
        }
      `
    });
  }
}
```

---

## 四、使用示例

```javascript
// 创建水面管理器
const waterManager = new WaterManager();

// 创建曲江池湖面
waterManager.createOcean(
  new THREE.Vector3(1000, 0, -1000),  // 位置
  1000  // 大小1km
);

// 在游戏循环中更新
function gameLoop() {
  waterManager.update(clock.getElapsedTime());
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
```

---
文档日期：2026-10-25
