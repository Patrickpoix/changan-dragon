# 长安项目：108坊数据格式定义

> 创建时间：2026-10-25

---

## 坊JSON格式

```json
{
  "name": "平康坊",
  "id": "pingkang",
  "position": {
    "x": 5200,
    "z": 3500,
    "width": 600,
    "depth": 500
  },
  "type": "entertainment",
  "seed": 12345,
  "buildings": [
    {
      "type": "tavern",
      "x": 100,
      "z": 50,
      "rotation": 0,
      "scale": 1.0,
      "level": 2
    }
  ],
  "npcs": [
    {
      "type": "singing_girl",
      "x": 200,
      "z": 150,
      "schedule": "evening"
    }
  ],
  "vegetation": [
    {
      "type": "peach_tree",
      "x": 100,
      "z": 100
    }
  ],
  "gates": {
    "north": { "x": 300, "z": 0 },
    "south": { "x": 300, "z": 500 }
  }
}
```

---

## 字段说明

### 基础信息
- **name**: 坊名（中文）
- **id**: 唯一标识（英文）
- **position**: 位置和大小
- **type**: 坊类型
- **seed**: 随机种子（保证一致性）

### 内容
- **buildings**: 建筑列表
- **npcs**: NPC列表
- **vegetation**: 植被列表
- **gates**: 坊门位置

---

## 坊类型枚举
- `palace`: 宫殿区
- `government`: 官署区
- `noble`: 贵族住宅区
- `ordinary`: 平民住宅区
- `commercial_east`: 东市商业区
- `commercial_west`: 西市胡商区
- `temple`: 寺庙区
- `entertainment`: 娱乐区
- `garden`: 园林区
- `workshop`: 作坊区

---

*数据格式清晰，方便程序化生成和加载。*
