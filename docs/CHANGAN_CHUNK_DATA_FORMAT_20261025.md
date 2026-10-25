# 长安项目：Chunk流加载数据格式

> 创建时间：2026-10-25

---

## Chunk定义

### 大小
- **尺寸**: 500m × 500m
- **数量**: 全城约360个chunk
- **坐标系**: 原点西南角，X东Z北

### 命名规则
- `chunk_x{X}_z{Z}.json`
- 例如: `chunk_x0_z0.json`, `chunk_x10_z5.json`

---

## Chunk JSON格式

```json
{
  "x": 0,
  "z": 0,
  "size": 500,
  "objects": [
    {
      "type": "building",
      "model": "hall_9bay",
      "x": 100,
      "z": 200,
      "rotation": 0,
      "scale": 1.0,
      "lod": "high"
    }
  ],
  "npcs": [
    {
      "type": "civilian",
      "x": 250,
      "z": 250,
      "path": "path_001"
    }
  ],
  "trees": [
    {
      "type": "pagoda",
      "x": 50,
      "z": 100
    }
  ],
  "roads": [
    {
      "type": "main_street",
      "points": [[0, 250], [500, 250]]
    }
  ]
}
```

---

## LOD层级

| 距离 | LOD等级 | 模型精度 |
|---|---|---|
| <100m | high | 精模（1万面） |
| 100-300m | medium | 中模（1千面） |
| 300-800m | low | 低模（100面） |
| >800m | billboard | 公告板 |

---

## 加载策略
- **常驻**: 3×3=9个chunk
- **预加载**: 7×7=49个chunk
- **卸载**: 远离的chunk
- **双缓冲**: 预加载和卸载同时进行

---

*Chunk数据格式是流加载的基础，要紧凑高效。*
