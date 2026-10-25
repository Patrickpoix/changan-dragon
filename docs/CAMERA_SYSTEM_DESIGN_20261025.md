# 相机系统设计（2026-10-25）

> 游戏相机系统的设计方案。

---

## 一、相机模式

### 第三人称跟随
- **默认模式**
- 跟随小青龙
- 后方视角
- 可旋转

### 第一人称视角
- **可选模式**
- 沉浸式体验
- 模拟人眼视角

### 鸟瞰视角
- **可选模式**
- 高空俯瞰
- 观察城市布局

---

## 二、第三人称相机

### 参数
- **距离**：8-10米
- **高度**：3-5米
- **跟随速度**：平滑跟随
- **旋转**：鼠标控制

### 碰撞检测
- 相机不要穿墙
- 遇到障碍时自动拉近

```javascript
class ThirdPersonCamera {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;  // 小青龙
    this.distance = 10;
    this.height = 4;
    this.rotationY = 0;
    this.rotationX = 0;
  }

  update(deltaTime) {
    // 计算相机位置
    const offset = new THREE.Vector3(
      Math.sin(this.rotationY) * this.distance,
      this.height + Math.sin(this.rotationX) * this.distance,
      Math.cos(this.rotationY) * this.distance
    );

    // 平滑跟随
    const targetPosition = this.target.position.clone().add(offset);
    this.camera.position.lerp(targetPosition, 0.1);

    // 看向目标
    this.camera.lookAt(this.target.position);
  }

  handleMouseMove(dx, dy) {
    this.rotationY -= dx * 0.01;
    this.rotationX -= dy * 0.01;
    // 限制垂直角度
    this.rotationX = Math.max(-0.5, Math.min(0.5, this.rotationX));
  }
}
```

---

## 三、第一人称相机

### 参数
- **位置**：跟随玩家头部
- **视角**：人眼高度1.7m
- **旋转**：鼠标控制视角

```javascript
class FirstPersonCamera {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
  }

  update() {
    // 相机位置=玩家位置+高度
    this.camera.position.copy(this.target.position);
    this.camera.position.y += 1.7;
  }

  handleMouseMove(dx, dy) {
    this.camera.rotation.y -= dx * 0.005;
    this.camera.rotation.x -= dy * 0.005;
  }
}
```

---

## 四、相机管理

### 管理器
```javascript
class CameraManager {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
    this.mode = 'third';  // third/first/bird
    this.thirdPerson = new ThirdPersonCamera(this.camera, null);
    this.firstPerson = new FirstPersonCamera(this.camera, null);
  }

  setMode(mode) {
    this.mode = mode;
  }

  update(deltaTime) {
    switch(this.mode) {
      case 'third':
        this.thirdPerson.update(deltaTime);
        break;
      case 'first':
        this.firstPerson.update();
        break;
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
```

---

## 五、FOV设置

### 视野范围
- **默认**：75度
- **冲刺时**：85度(动态)
- **飞行时**：80度

### 调整
- 可在设置中调整
- 范围：60-100度

---

文档日期：2026-10-25
