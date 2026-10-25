# 建筑系统代码框架设计（2026-10-25）

> 建筑系统的代码结构设计。

---

## 一、文件结构

```
src/buildings/
├── BuildingManager.js     # 建筑管理器
├── BuildingFactory.js      # 建筑工厂
├── BuildingKit.js         # 建筑Kit
├── RoofBuilder.js          # 屋顶生成器
├── WallBuilder.js          # 墙体生成器
└── utils/
    └── geometryUtils.js   # 几何工具
```

---

## 二、BuildingManager类

```javascript
class BuildingManager {
  constructor() {
    this.factory = new BuildingFactory();
    this.buildings = [];
  }

  spawnBuilding(type, position, rotation) {
    const building = this.factory.createBuilding(type);
    building.position.copy(position);
    building.rotation.y = rotation;
    this.buildings.push(building);
    scene.add(building);
    return building;
  }

  spawnBuildingKit(kitType, position, rotation) {
    const buildingKit = new BuildingKit(kitType);
    buildingKit.position.copy(position);
    buildingKit.rotation.y = rotation;
    this.buildings.push(buildingKit);
    scene.add(buildingKit);
    return buildingKit;
  }
}
```

---

## 三、BuildingFactory类

```javascript
class BuildingFactory {
  constructor() {
    this.buildingTypes = {
      'hall_9bay': { model: '/models/buildings/hall_9bay.glb', scale: 1 },
      'gate_tower': { model: '/models/buildings/gate_tower.glb', scale: 1 },
      'pagoda_5': { model: '/models/buildings/pagoda_5.glb', scale: 1 },
      'fang_gate': { model: '/models/buildings/fang_gate.glb', scale: 1 },
      'paifang': { model: '/models/buildings/paifang.glb', scale: 1 },
      'shop_front': { model: '/models/buildings/shop_front.glb', scale: 1 },
      'pavilion': { model: '/models/buildings/pavilion.glb', scale: 1 },
      'house_1story': { model: '/models/buildings/house_1story.glb', scale: 1 },
      'stone_lion': { model: '/models/buildings/stone_lion.glb', scale: 1 },
      'lantern': { model: '/models/buildings/lantern.glb', scale: 1 }
    };
  }

  createBuilding(type) {
    const config = this.buildingTypes[type];
    if (!config) {
      console.warn('Unknown building type:', type);
      return new THREE.Group();
    }

    // 加载GLB模型
    const loader = new THREE.GLTFLoader();
    // 实际项目中用缓存
    return this.loadModel(config.model);
  }

  loadModel(url) {
    // 异步加载模型
    const group = new THREE.Group();
    // ... 实际加载逻辑
    return group;
  }
}
```

---

## 四、RoofBuilder类

```javascript
class RoofBuilder {
  constructor() {
    // 参考Forbidden City 3D的屋顶生成逻辑
  }

  createHippedRoof(width, depth, height) {
    // 庑殿顶
    const geometry = new THREE.ConeGeometry(1, 1, 4);
    geometry.scale(width, height, depth);
    return geometry;
  }

  createGableRoof(width, depth, height) {
    // 歇山顶/悬山顶
    const shape = new THREE.Shape();
    // ... 形状定义
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: depth });
    return geometry;
  }

  createHipGableRoof(width, depth, height) {
    // 歇山顶
    // ... 混合形状
  }
}
```

---

## 五、使用示例

```javascript
const buildingManager = new BuildingManager();

// 放置朱雀大街两侧建筑
buildingManager.spawnBuilding('gate_tower', new THREE.Vector3(0, 0, -500), 0);
buildingManager.spawnBuilding('fang_gate', new THREE.Vector3(-100, 0, 0), Math.PI/2);
buildingManager.spawnBuilding('fang_gate', new THREE.Vector3(100, 0, 0), -Math.PI/2);
buildingManager.spawnBuilding('paifang', new THREE.Vector3(0, 0, -200), 0);
buildingManager.spawnBuilding('stone_lion', new THREE.Vector3(-30, 0, -200), 0);
buildingManager.spawnBuilding('stone_lion', new THREE.Vector3(30, 0, -200), 0);

// 沿街商铺
for (let i = 0; i < 10; i++) {
  buildingManager.spawnBuilding('shop_front', 
    new THREE.Vector3(-150, 0, i * 50),
    Math.PI/2
  );
}
```

---
文档日期：2026-10-25
