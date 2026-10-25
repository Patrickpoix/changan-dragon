# 性能优化代码框架设计（2026-10-25）

> 性能优化的代码结构设计。

---

## 一、文件结构

```
src/performance/
├── PerformanceManager.js   # 性能管理器
├── InstancedManager.js      # 合批管理器
├── LODManager.js           # LOD管理器
├── FrustumCuller.js         # 视锥体裁剪
└── utils/
    └── statsUtils.js        # 统计工具
```

---

## 二、PerformanceManager类

```javascript
class PerformanceManager {
  constructor() {
    this.instancedManager = new InstancedManager();
    this.lodManager = new LODManager();
    this.frustumCuller = new FrustumCuller();

    // 性能统计
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();

    // 自动质量调整
    this.autoQuality = true;
  }

  update(camera, scene) {
    // 统计FPS
    this.updateFPS();

    // 自动调整质量
    if (this.autoQuality) {
      this.adjustQuality();
    }

    // 更新LOD
    this.lodManager.update(camera);

    // 视锥体裁剪
    this.frustumCuller.update(camera, scene);
  }

  updateFPS() {
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
      console.log('FPS:', this.fps);
    }
  }

  adjustQuality() {
    if (this.fps < 30) {
      // 降低质量
      this.lowerQuality();
    } else if (this.fps > 55) {
      // 提高质量
      this.raiseQuality();
    }
  }

  lowerQuality() {
    // 减少阴影大小
    // 降低像素比
    // 减少DrawCall
  }

  raiseQuality() {
    // 提高阴影大小
    // 提高像素比
  }
}
```

---

## 三、InstancedManager类

```javascript
class InstancedManager {
  constructor() {
    this.instancedMeshes = new Map();
  }

  createInstancedMesh(name, geometry, material, count) {
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.instancedMeshes.set(name, instancedMesh);
    scene.add(instancedMesh);
    return instancedMesh;
  }

  setInstanceMatrix(name, index, matrix) {
    const instancedMesh = this.instancedMeshes.get(name);
    if (instancedMesh) {
      instancedMesh.setMatrixAt(index, matrix);
      instancedMesh.instanceMatrix.needsUpdate = true;
    }
  }

  // 示例：创建沿街树木
  createStreetTrees(count) {
    const geometry = new THREE.CylinderGeometry(0.2, 0.4, 8, 6);
    const material = new THREE.MeshStandardMaterial({ color: 0x8b7355 });

    const trees = this.createInstancedMesh('street_trees', geometry, material, count);

    // 设置每个树的位置
    for (let i = 0; i < count; i++) {
      const matrix = new THREE.Matrix4();
      matrix.setPosition(-100 + i * 20, 4, 0);
      this.setInstanceMatrix('street_trees', i, matrix);
    }
  }
}
```

---

## 四、LODManager类

```javascript
class LODManager {
  update(camera) {
    // 遍历所有带LOD的物体
    scene.traverse((object) => {
      if (object.userData.lod) {
        this.updateObjectLOD(object, camera);
      }
    });
  }

  updateObjectLOD(object, camera) {
    const distance = object.position.distanceTo(camera.position);
    const lod = object.userData.lod;

    // 根据距离选择LOD级别
    let level = 0;
    if (distance > lod.level1Distance) level = 1;
    if (distance > lod.level2Distance) level = 2;
    if (distance > lod.level3Distance) level = 3;

    // 切换LOD
    if (object.userData.currentLevel !== level) {
      this.switchLOD(object, level);
      object.userData.currentLevel = level;
    }
  }

  switchLOD(object, level) {
    // 显示对应LOD的子物体
    for (let i = 0; i < object.children.length; i++) {
      object.children[i].visible = (i === level);
    }
  }
}
```

---

## 五、使用示例

```javascript
const performanceManager = new PerformanceManager();

function gameLoop() {
  performanceManager.update(camera, scene);
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
```

---
文档日期：2026-10-25
