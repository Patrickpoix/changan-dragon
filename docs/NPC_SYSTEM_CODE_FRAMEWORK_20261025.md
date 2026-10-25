# NPC系统代码框架设计（2026-10-25）

> NPC系统的代码结构设计。

---

## 一、文件结构

```
src/npc/
├── NPCManager.js       # NPC管理器
├── NPCSpawner.js       # NPC生成器
├── NPCBehaviour.js     # NPC行为
├── NPCAnimation.js     # NPC动画
├── NPCPathfinding.js   # NPC寻路
└── types/
    ├── Official.js     # 官员
    ├── Scholar.js      # 文人
    ├── Merchant.js     # 商人
    ├── Monk.js         # 僧侣
    └── Commoner.js     # 平民
```

---

## 二、NPCManager类

```javascript
class NPCManager {
  constructor(config) {
    this.maxNPCs = 800;  // 全城上限
    this.npcs = [];
    this.spawner = new NPCSpawner();
    this.behaviour = new NPCBehaviour();
    this.animation = new NPCAnimation();
    this.pathfinding = new NPCPathfinding();
  }

  update(playerPosition, deltaTime) {
    // 1. 生成/移除NPC
    this.updateSpawning(playerPosition);

    // 2. 更新所有NPC
    for (const npc of this.npcs) {
      this.updateNPC(npc, deltaTime);
    }

    // 3. LOD优化
    this.updateLOD(playerPosition);
  }

  updateNPC(npc, deltaTime) {
    // 更新行为状态机
    this.behaviour.update(npc, deltaTime);

    // 更新动画
    this.animation.update(npc, deltaTime);

    // 更新位置
    this.pathfinding.update(npc, deltaTime);
  }
}
```

---

## 三、NPCBehaviour类

```javascript
class NPCBehaviour {
  update(npc, deltaTime) {
    switch(npc.state) {
      case 'idle':
        this.updateIdle(npc, deltaTime);
        break;
      case 'walk':
        this.updateWalk(npc, deltaTime);
        break;
      case 'work':
        this.updateWork(npc, deltaTime);
        break;
      case 'talk':
        this.updateTalk(npc, deltaTime);
        break;
    }
  }

  updateIdle(npc, deltaTime) {
    // 站立，偶尔转头
    npc.timer -= deltaTime;
    if (npc.timer <= 0) {
      // 随机决定下一步
      const r = Math.random();
      if (r < 0.3) npc.state = 'walk';
      else if (r < 0.5) npc.state = 'talk';
      else npc.timer = 2 + Math.random() * 3;
    }
  }

  updateWalk(npc, deltaTime) {
    // 走向目标点
    if (npc.position.distanceTo(npc.target) < 1) {
      npc.state = 'idle';
      npc.timer = 1 + Math.random() * 5;
    }
  }
}
```

---

## 四、NPCSpawner类

```javascript
class NPCSpawner {
  spawnNPC(fangType, position) {
    // 根据坊类型选择NPC类型
    const npcTypes = this.getNPCTypesForFang(fangType);
    const type = npcTypes[Math.floor(Math.random() * npcTypes.length)];

    // 创建NPC
    const npc = {
      type: type,
      position: position.clone(),
      rotation: Math.random() * Math.PI * 2,
      state: 'idle',
      timer: 0,
      target: position.clone(),
      speed: 1 + Math.random() * 0.5
    };

    return npc;
  }

  getNPCTypesForFang(fangType) {
    switch(fangType) {
      case 'GOVERNMENT': return ['official_high', 'official_mid', 'soldier'];
      case 'MARKET': return ['merchant', 'customer', 'foreigner'];
      case 'TEMPLE': return ['monk', 'pilgrim'];
      case 'COMMONER': return ['commoner', 'woman', 'child'];
      default: return ['commoner'];
    }
  }
}
```

---

## 五、使用示例

```javascript
const npcManager = new NPCManager({
  maxNPCs: 800
});

function gameLoop() {
  npcManager.update(player.position, deltaTime);
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
```

---
文档日期：2026-10-25
