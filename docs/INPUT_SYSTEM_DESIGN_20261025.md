# 输入系统设计（2026-10-25）

> 游戏输入系统的设计方案。

---

## 一、输入设备

### 键盘
- **WASD**：移动
- **空格**：上升(龙)
- **Shift**：下降(龙)
- **E**：交互
- **I**：物品栏
- **J**：任务日志
- **M**：大地图
- **N**：成就
- **Esc**：菜单

### 鼠标
- **移动**：控制视角
- **左键**：交互/选择
- **右键**：旋转视角
- **滚轮**：缩放/快速切换

---

## 二、输入映射

```javascript
const InputMap = {
  // 移动
  forward: 'KeyW',
  back: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  
  // 龙控制
  ascend: 'Space',
  descend: 'ShiftLeft',
  
  // 交互
  interact: 'KeyE',
  
  // UI
  inventory: 'KeyI',
  questLog: 'KeyJ',
  map: 'KeyM',
  achievements: 'KeyN',
  pause: 'Escape'
};
```

---

## 三、输入管理器

```javascript
class InputManager {
  constructor() {
    this.keys = {};
    this.mouse = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      leftButton: false,
      rightButton: false
    };
    
    this.setupListeners();
  }

  setupListeners() {
    // 键盘
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // 鼠标移动
    document.addEventListener('mousemove', (e) => {
      this.mouse.dx = e.movementX;
      this.mouse.dy = e.movementY;
    });

    // 鼠标按键
    document.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouse.leftButton = true;
      if (e.button === 2) this.mouse.rightButton = true;
    });
    
    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.leftButton = false;
      if (e.button === 2) this.mouse.rightButton = false;
    });

    // 阻止右键菜单
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  isPressed(action) {
    const keyCode = InputMap[action];
    return this.keys[keyCode] || false;
  }

  getMouseDelta() {
    const delta = { x: this.mouse.dx, y: this.mouse.dy };
    // 重置
    this.mouse.dx = 0;
    this.mouse.dy = 0;
    return delta;
  }
}
```

---

## 四、使用示例

```javascript
const inputManager = new InputManager();

function gameLoop(deltaTime) {
  // 移动
  if (inputManager.isPressed('forward')) {
    dragon.translateZ(-speed * deltaTime);
  }
  if (inputManager.isPressed('back')) {
    dragon.translateZ(speed * deltaTime);
  }
  
  // 视角
  const mouseDelta = inputManager.getMouseDelta();
  camera.handleMouseMove(mouseDelta.x, mouseDelta.y);
  
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
```

---

## 五、键位自定义

### 可修改
- 玩家可以在设置中修改键位
- 保存到localStorage
- 恢复默认按钮

---

文档日期：2026-10-25
