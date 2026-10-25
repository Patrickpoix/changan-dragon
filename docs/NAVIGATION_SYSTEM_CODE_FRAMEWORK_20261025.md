# 导航系统代码框架设计（2026-10-25）

> 导航系统的代码结构设计。

---

## 一、文件结构

```
src/navigation/
├── NavigationManager.js  # 导航管理器
├── PathFinder.js         # 寻路器
├── WaypointSystem.js     # 路径点系统
├── Minimap.js            # 小地图
└── utils/
    └── navUtils.js        # 导航工具
```

---

## 二、NavigationManager类

```javascript
class NavigationManager {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.pathFinder = new PathFinder();
    this.waypointSystem = new WaypointSystem();
    this.minimap = new Minimap();

    // 传送点列表
    this.teleportPoints = [
      { name: '明德门', position: new THREE.Vector3(0, 0, -4000) },
      { name: '大雁塔', position: new THREE.Vector3(500, 0, -3000) },
      { name: '曲江池', position: new THREE.Vector3(1000, 0, -2000) },
      { name: '大明宫', position: new THREE.Vector3(0, 0, 3000) },
      { name: '西市', position: new THREE.Vector3(-1500, 0, 0) },
      { name: '东市', position: new THREE.Vector3(1500, 0, 0) }
    ];
  }

  update(playerPosition) {
    // 更新小地图
    this.minimap.update(playerPosition);

    // 更新导航路径
    if (this.destination) {
      this.updateNavigationPath(playerPosition);
    }
  }

  setDestination(position) {
    this.destination = position;
    // 计算路径
    this.path = this.pathFinder.findPath(player.position, position);
    this.waypointSystem.showPath(this.path);
  }

  teleportTo(pointName) {
    const point = this.teleportPoints.find(p => p.name === pointName);
    if (point) {
      player.position.copy(point.position);
      console.log('Teleported to', pointName);
    }
  }
}
```

---

## 三、PathFinder类

```javascript
class PathFinder {
  constructor() {
    // 导航网格(简化版)
    this.navMesh = this.createNavMesh();
  }

  createNavMesh() {
    // 从路网生成导航网格
    // 简化：使用道路中心线作为路径点
    const roads = [
      { x: 0, z: -4000, width: 150 },  // 朱雀大街
      { x: -1500, z: 0, width: 50 },   // 东西干道
      { x: 1500, z: 0, width: 50 }
    ];
    return roads;
  }

  findPath(start, end) {
    // 简化寻路：直接直线
    // 实际项目中用A*算法
    const path = [];
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      path.push(new THREE.Vector3(
        start.x + (end.x - start.x) * t,
        0,
        start.z + (end.z - start.z) * t
      ));
    }

    return path;
  }
}
```

---

## 四、WaypointSystem类

```javascript
class WaypointSystem {
  constructor() {
    this.waypoints = [];
    this.waypointGroup = new THREE.Group();
    scene.add(this.waypointGroup);
  }

  showPath(path) {
    // 清除旧路径
    this.waypointGroup.clear();

    // 创建路径点
    for (let i = 0; i < path.length; i++) {
      const waypoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })\n      );
      waypoint.position.copy(path[i]);
      waypoint.position.y = 1;
      this.waypointGroup.add(waypoint);
    }
  }

  hidePath() {
    this.waypointGroup.clear();
  }
}
```

---

## 五、Minimap类

```javascript
class Minimap {
  constructor() {
    // 创建小地图UI
    this.canvas = document.createElement('canvas');
    this.canvas.width = 200;
    this.canvas.height = 200;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '10px';
    this.canvas.style.right = '10px';
    this.canvas.style.border = '2px solid white';
    this.canvas.style.borderRadius = '50%';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
  }

  update(playerPosition) {
    // 绘制小地图
    this.ctx.clearRect(0, 0, 200, 200);

    // 背景
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fillRect(0, 0, 200, 200);

    // 玩家位置(中心点)
    this.ctx.fillStyle = 'red';
    this.ctx.beginPath();
    this.ctx.arc(100, 100, 5, 0, Math.PI * 2);
    this.ctx.fill();

    // 标记重要地点
    this.ctx.fillStyle = 'yellow';
    this.ctx.fillRect(150, 50, 5, 5);  // 大雁塔
  }
}
```

---

## 六、使用示例

```javascript
const navigationManager = new NavigationManager(camera, scene);

// 设置导航目的地
navigationManager.setDestination(new THREE.Vector3(500, 0, -3000));

// 传送
navigationManager.teleportTo('曲江池');

function gameLoop() {
  navigationManager.update(player.position);
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
```

---
文档日期：2026-10-25
