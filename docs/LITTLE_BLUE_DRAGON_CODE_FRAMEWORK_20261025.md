# 小青龙主角代码框架设计（2026-10-25）

> 小青龙主角的代码结构设计。

---

## 一、文件结构

```
src/player/
├── PlayerManager.js       # 玩家管理器
├── DragonController.js      # 小龙控制器
├── DragonAnimation.js       # 小龙动画
├── DragonModel.js          # 小龙模型
└── utils/
    └── dragonUtils.js       # 小龙工具
```

---

## 二、PlayerManager类

```javascript
class PlayerManager {
  constructor() {
    this.dragonController = new DragonController();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
  }

  update(deltaTime) {
    // 更新小龙
    this.dragonController.update(deltaTime);

    // 更新相机跟随
    this.updateCamera();
  }

  updateCamera() {
    const dragon = this.dragonController.dragon;
    // 第三人称跟随
    this.camera.position.lerp(
      new THREE.Vector3(
        dragon.position.x,
        dragon.position.y + 5,
        dragon.position.z + 10
      ),
      0.1
    );
    this.camera.lookAt(dragon.position);
  }
}
```

---

## 三、DragonController类

```javascript
class DragonController {
  constructor() {
    this.dragon = new DragonModel();
    this.animation = new DragonAnimation();

    // 状态
    this.state = 'fly';  // fly/swim/hover
    this.speed = 20;  // 飞行速度
    this.verticalSpeed = 0;

    // 输入
    this.keys = {};
    this.setupInput();
  }

  setupInput() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  update(deltaTime) {
    // 处理输入
    this.handleInput(deltaTime);

    // 更新位置
    this.updatePosition(deltaTime);

    // 更新动画
    this.animation.update(this.state, deltaTime);
  }

  handleInput(deltaTime) {
    // WASD移动
    if (this.keys['KeyW']) {
      this.dragon.translateZ(-this.speed * deltaTime);
    }
    if (this.keys['KeyS']) {
      this.dragon.translateZ(this.speed * deltaTime);
    }
    if (this.keys['KeyA']) {
      this.dragon.rotation.y += deltaTime * 2;
    }
    if (this.keys['KeyD']) {
      this.dragon.rotation.y -= deltaTime * 2;
    }

    // 上升/下降
    if (this.keys['Space']) {
      this.dragon.position.y += this.speed * 0.5 * deltaTime;
    }
    if (this.keys['ShiftLeft']) {
      this.dragon.position.y -= this.speed * 0.5 * deltaTime;
    }
  }
}
```

---

## 四、DragonModel类

```javascript
class DragonModel extends THREE.Group {
  constructor() {
    super();

    // 身体
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 2, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a9eff,
      metalness: 0.3,
      roughness: 0.5
    });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.add(this.body);

    // 头
    const headGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    this.head = new THREE.Mesh(headGeometry, bodyMaterial);
    this.head.position.set(0, 0.3, -1.2);
    this.add(this.head);

    // 角(鹿角)
    const hornGeometry = new THREE.ConeGeometry(0.08, 0.5, 4);
    this.horn1 = new THREE.Mesh(hornGeometry, new THREE.MeshStandardMaterial({ color: 0xdddddd }));
    this.horn1.position.set(-0.15, 0.6, -1.2);
    this.add(this.horn1);

    this.horn2 = this.horn1.clone();
    this.horn2.position.x = 0.15;
    this.add(this.horn2);

    // 尾巴
    const tailGeometry = new THREE.ConeGeometry(0.2, 1.5, 4);
    this.tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    this.tail.position.set(0, 0, 1.5);
    this.tail.rotation.x = Math.PI;
    this.add(this.tail);
  }
}
```

---

## 五、使用示例

```javascript
const playerManager = new PlayerManager();
scene.add(playerManager.dragonController.dragon);

function gameLoop() {
  playerManager.update(deltaTime);
  renderer.render(scene, playerManager.camera);
  requestAnimationFrame(gameLoop);
}
```

---
文档日期：2026-10-25
