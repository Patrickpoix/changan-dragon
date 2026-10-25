# 交互系统代码框架设计（2026-10-25）

> 交互系统的代码结构设计。

---

## 一、文件结构

```
src/interaction/
├── InteractionManager.js  # 交互管理器
├── InteractionRaycaster.js # 交互射线检测
├── DialogueSystem.js       # 对话系统
├── ShopSystem.js          # 商店系统
└── utils/
    └── interactionUtils.js # 交互工具
```

---

## 二、InteractionManager类

```javascript
class InteractionManager {
  constructor(camera) {
    this.camera = camera;
    this.raycaster = new InteractionRaycaster(camera);
    this.dialogueSystem = new DialogueSystem();
    this.shopSystem = new ShopSystem();

    this.currentInteractable = null;

    // 交互提示UI
    this.promptElement = document.createElement('div');
    this.promptElement.style.position = 'absolute';
    this.promptElement.style.bottom = '100px';
    this.promptElement.style.left = '50%';
    this.promptElement.style.transform = 'translateX(-50%)';
    this.promptElement.style.padding = '10px 20px';
    this.promptElement.style.background = 'rgba(0,0,0,0.7)';
    this.promptElement.style.color = 'white';
    this.promptElement.style.borderRadius = '5px';
    this.promptElement.style.display = 'none';
    document.body.appendChild(this.promptElement);

    // 按键交互
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE' && this.currentInteractable) {
        this.interact();
      }
    });
  }

  update() {
    // 检测可交互物体
    this.currentInteractable = this.raycaster.raycast();

    // 显示/隐藏提示
    if (this.currentInteractable) {
      this.promptElement.style.display = 'block';
      this.promptElement.textContent = '[E] ' + this.currentInteractable.userData.interactName;
    } else {
      this.promptElement.style.display = 'none';
    }
  }

  interact() {
    if (!this.currentInteractable) return;

    const type = this.currentInteractable.userData.interactType;
    switch(type) {
      case 'talk':
        this.dialogueSystem.startDialogue(this.currentInteractable);
        break;
      case 'shop':
        this.shopSystem.openShop(this.currentInteractable);
        break;
      case 'enter':
        // 进入建筑
        break;
    }
  }
}
```

---

## 三、InteractionRaycaster类

```javascript
class InteractionRaycaster {
  constructor(camera) {
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.interactables = [];  // 所有可交互物体
    this.maxDistance = 5;  // 最大交互距离
  }

  addInteractable(object) {
    object.userData.interactable = true;
    this.interactables.push(object);
  }

  raycast() {
    // 从相机中心发射射线
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    // 检测与可交互物体的交点
    const intersects = this.raycaster.intersectObjects(this.interactables, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      // 检查距离
      if (hit.distance < this.maxDistance) {
        return hit.object;
      }
    }

    return null;
  }
}
```

---

## 四、DialogueSystem类

```javascript
class DialogueSystem {
  constructor() {
    // 对话框UI
    this.dialogueBox = document.createElement('div');
    this.dialogueBox.style.position = 'absolute';
    this.dialogueBox.style.bottom = '0';
    this.dialogueBox.style.left = '0';
    this.dialogueBox.style.right = '0';
    this.dialogueBox.style.padding = '20px';
    this.dialogueBox.style.background = 'rgba(0,0,0,0.8)';
    this.dialogueBox.style.color = 'white';
    this.dialogueBox.style.display = 'none';
    document.body.appendChild(this.dialogueBox);
  }

  startDialogue(npc) {
    this.dialogueBox.style.display = 'block';
    this.dialogueBox.innerHTML = `
      <h3>${npc.userData.name}</h3>
      <p>${npc.userData.dialogueText}</p>
      <button onclick="dialogueSystem.close()">继续</button>
    `;
  }

  close() {
    this.dialogueBox.style.display = 'none';
  }
}
```

---

## 五、使用示例

```javascript
const interactionManager = new InteractionManager(camera);

// 添加可交互NPC
const npc = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.5, 1.5),
  new THREE.MeshStandardMaterial({ color: 0x8b4513 })
);
npc.userData.interactName = '交谈';
npc.userData.interactType = 'talk';
npc.userData.name = '老者';
npc.userData.dialogueText = '少年人，从何处来？';
interactionManager.raycaster.addInteractable(npc);

function gameLoop() {
  interactionManager.update();
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
```

---
文档日期：2026-10-25
