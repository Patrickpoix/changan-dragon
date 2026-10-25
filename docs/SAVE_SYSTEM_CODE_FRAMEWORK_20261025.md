# 存档系统代码框架设计（2026-10-25）

> 存档系统的代码结构设计。

---

## 一、文件结构

```
src/save/
├── SaveManager.js       # 存档管理器
├── Serializer.js        # 序列化器
└── utils/
    └── saveUtils.js     # 存档工具
```

---

## 二、SaveManager类

```javascript
class SaveManager {
  constructor() {
    this.saveSlots = 3;  // 3个存档位
    this.currentSave = null;
  }

  // 保存游戏
  saveGame(slotIndex, gameState) {
    const saveData = {
      version: '1.0',
      timestamp: Date.now(),
      player: {
        position: gameState.player.position.toArray(),
        rotation: gameState.player.rotation.y,
        health: gameState.player.health,
        level: gameState.player.level,
        experience: gameState.player.experience,
        inventory: gameState.player.inventory
      },
      world: {
        time: gameState.world.time,
        weather: gameState.world.weather,
        exploredAreas: gameState.world.exploredAreas
      },
      quests: gameState.quests,
      npcStates: gameState.npcStates
    };

    // 序列化为JSON
    const json = JSON.stringify(saveData, null, 2);

    // 保存到localStorage
    localStorage.setItem(`changan_save_${slotIndex}`, json);

    console.log('Game saved to slot', slotIndex);
    return saveData;
  }

  // 读取游戏
  loadGame(slotIndex) {
    const json = localStorage.getItem(`changan_save_${slotIndex}`);
    if (!json) {
      console.warn('No save data in slot', slotIndex);
      return null;
    }

    try {
      const saveData = JSON.parse(json);
      this.currentSave = saveData;
      console.log('Game loaded from slot', slotIndex);
      return saveData;
    } catch (e) {
      console.error('Failed to load save:', e);
      return null;
    }
  }

  // 自动存档
  autoSave(gameState) {
    this.saveGame(0, gameState);  // 自动存档到0号位
  }

  // 删除存档
  deleteSave(slotIndex) {
    localStorage.removeItem(`changan_save_${slotIndex}`);
  }

  // 获取存档列表
  getSaveList() {
    const saves = [];
    for (let i = 0; i < this.saveSlots; i++) {
      const json = localStorage.getItem(`changan_save_${i}`);
      if (json) {
        const data = JSON.parse(json);
        saves.push({
          slot: i,
          timestamp: data.timestamp,
          playerLevel: data.player.level,
          position: data.player.position
        });
      }
    }
    return saves;
  }
}
```

---

## 三、使用示例

```javascript
const saveManager = new SaveManager();

// 保存游戏
function onSaveGame() {
  const gameState = {
    player: {
      position: new THREE.Vector3(0, 0, 0),
      rotation: 0,
      health: 100,
      level: 5,
      experience: 1000,
      inventory: ['item1', 'item2']
    },
    world: {
      time: 12 * 60,  // 中午
      weather: 'clear',
      exploredAreas: ['zhuque', 'west_market']
    },
    quests: [],
    npcStates: {}
  };

  saveManager.saveGame(1, gameState);
}

// 加载游戏
function onLoadGame() {
  const saveData = saveManager.loadGame(1);
  if (saveData) {
    // 恢复玩家位置
    player.position.fromArray(saveData.player.position);
    player.rotation.y = saveData.player.rotation;

    // 恢复世界状态
    world.time = saveData.world.time;
    world.weather = saveData.world.weather;

    console.log('Game loaded successfully');
  }
}

// 自动存档(每5分钟)
setInterval(() => {
  saveManager.autoSave(currentGameState);
}, 5 * 60 * 1000);
```

---

## 四、存档数据格式

```json
{
  "version": "1.0",
  "timestamp": 1234567890,
  "player": {
    "position": [0, 0, 0],
    "rotation": 0,
    "health": 100,
    "level": 5,
    "experience": 1000,
    "inventory": ["item1", "item2"]
  },
  "world": {
    "time": 720,
    "weather": "clear",
    "exploredAreas": ["zhuque", "west_market"]
  },
  "quests": [],
  "npcStates": {}
}
```

---
文档日期：2026-10-25
