# 流加载系统代码框架设计（2026-10-25）

> 流加载系统的代码结构设计。

---

## 一、文件结构

```
src/streaming/
├── ChunkManager.js      # chunk管理器
├── ChunkLoader.js       # chunk加载器
├── ChunkUnloader.js     # chunk卸载器
├── ChunkCache.js         # chunk缓存
├── LODManager.js        # LOD管理器
└── utils/
    ├── chunkUtils.js     # chunk工具
    └── priorityQueue.js  # 优先级队列
```

---

## 二、ChunkManager类

```javascript
class ChunkManager {
  constructor(config) {
    this.chunkSize = 500;  // 500m per chunk
    this.loadRadius = 3;   // 3x3=9 chunks常驻
    this.prefetchRadius = 7;  // 7x7=49 chunks预加载
    this.chunks = new Map();  // key: "x,z"
  }

  update(playerPosition) {
    // 1. 计算玩家所在chunk
    const playerChunk = this.positionToChunk(playerPosition);

    // 2. 确定需要的chunk范围
    const neededChunks = this.getChunksInRadius(playerChunk, this.prefetchRadius);

    // 3. 加载需要的chunk
    for (const chunk of neededChunks) {
      const key = chunk.x + ',' + chunk.z;
      if (!this.chunks.has(key)) {
        this.loadChunk(chunk);
      }
    }

    // 4. 卸载远离的chunk
    for (const [key, chunk] of this.chunks) {
      const distance = this.chunkDistance(chunk, playerChunk);
      if (distance > this.prefetchRadius) {
        this.unloadChunk(chunk);
      }
    }
  }

  positionToChunk(position) {
    return {
      x: Math.floor(position.x / this.chunkSize),
      z: Math.floor(position.z / this.chunkSize)
    };
  }

  getChunksInRadius(center, radius) {
    const chunks = [];
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        chunks.push({ x: center.x + dx, z: center.z + dz });
      }
    }
    return chunks;
  }
}
```

---

## 三、LODManager类

```javascript
class LODManager {
  applyLOD(object, distance) {
    let level;

    if (distance < 1) {
      level = 0;  // LOD0: 完整
    } else if (distance < 2) {
      level = 1;  // LOD1: 50%
    } else if (distance < 4) {
      level = 2;  // LOD2: 20%
    } else {
      level = 3;  // LOD3: 5%/impostor
    }

    this.simplifyObject(object, level);
    return object;
  }

  simplifyObject(object, level) {
    switch(level) {
      case 0: break;  // 完整
      case 1: this.reduceTriangles(object, 0.5); break;
      case 2: this.reduceTriangles(object, 0.2); break;
      case 3: this.convertToBillboard(object); break;
    }
  }
}
```

---

## 四、使用示例

```javascript
const chunkManager = new ChunkManager({
  chunkSize: 500,
  loadRadius: 3,
  prefetchRadius: 7
});

function gameLoop() {
  chunkManager.update(player.position);
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
```

---
文档日期：2026-10-25
