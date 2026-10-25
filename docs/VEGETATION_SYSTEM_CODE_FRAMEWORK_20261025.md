# 植被系统代码框架设计（2026-10-25）

> 植被系统的代码结构设计。

---

## 一、文件结构

```
src/vegetation/
├── VegetationManager.js  # 植被管理器
├── TreeGenerator.js      # 树木生成器
├── GrassGenerator.js     # 草地生成器
├── BushGenerator.js      # 灌木生成器
└── utils/
    └── windUtils.js      # 风动工具
```

---

## 二、VegetationManager类

```javascript
class VegetationManager {
  constructor() {
    this.treeGenerator = new TreeGenerator();
    this.grassGenerator = new GrassGenerator();
    this.bushGenerator = new BushGenerator();

    this.trees = [];
    this.grass = null;
    this.bushes = [];
  }

  plantTrees(position, type, count) {
    for (let i = 0; i < count; i++) {
      const tree = this.treeGenerator.createTree(type);
      tree.position.set(
        position.x + (Math.random() - 0.5) * 50,
        0,
        position.z + (Math.random() - 0.5) * 50
      );
      tree.rotation.y = Math.random() * Math.PI * 2;
      this.trees.push(tree);
      scene.add(tree);
    }
  }

  plantGrass(position, size, density) {
    this.grass = this.grassGenerator.createGrass(position, size, density);
    scene.add(this.grass);
  }

  update(deltaTime, windDirection) {
    // 更新风动效果
    for (const tree of this.trees) {
      this.updateWind(tree, windDirection, deltaTime);
    }
  }

  updateWind(tree, windDirection, deltaTime) {
    // 顶点着色器风动效果
    // 简单实现：轻微摇摆
    tree.rotation.z = Math.sin(clock.elapsedTime * 0.5 + tree.position.x) * 0.02;
  }
}
```

---

## 三、TreeGenerator类

```javascript
class TreeGenerator {
  createTree(type) {
    switch(type) {
      case 'locust':  // 槐树
        return this.createLocustTree();
      case 'pine':    // 松树
        return this.createPineTree();
      case 'willow':  // 柳树
        return this.createWillowTree();
      case 'blossom': // 花树
        return this.createBlossomTree();
      default:
        return this.createLocustTree();
    }
  }

  createLocustTree() {
    // 树干
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 8, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 4;

    // 树冠
    const crownGeometry = new THREE.SphereGeometry(3, 8, 8);
    const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x4a7c3f });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 9;

    // 组合
    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(crown);

    return tree;
  }

  createPineTree() {
    // 松树：圆锥形树冠
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2.5;

    const crownGeometry = new THREE.ConeGeometry(2, 8, 8);
    const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 9;

    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(crown);

    return tree;
  }

  createWillowTree() {
    // 柳树：下垂枝条
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 6, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3;

    const crownGeometry = new THREE.SphereGeometry(3, 8, 8);
    const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x90b878 });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 7;
    crown.scale.y = 1.5;  // 拉长

    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(crown);

    return tree;
  }

  createBlossomTree() {
    // 花树：粉白色
    const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.25, 4, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;

    const crownGeometry = new THREE.SphereGeometry(2.5, 8, 8);
    const crownMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1 });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 6;

    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(crown);

    return tree;
  }
}
```

---

## 四、使用示例

```javascript
const vegetationManager = new VegetationManager();

// 朱雀大街种槐树
vegetationManager.plantTrees(
  new THREE.Vector3(0, 0, 0),  // 位置
  'locust',                    // 槐树
  20                           // 数量
);

// 曲江池种柳树
vegetationManager.plantTrees(
  new THREE.Vector3(1000, 0, -1000),
  'willow',
  30
);

function gameLoop() {
  vegetationManager.update(deltaTime, new THREE.Vector2(1, 0));
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
```

---
文档日期：2026-10-25
