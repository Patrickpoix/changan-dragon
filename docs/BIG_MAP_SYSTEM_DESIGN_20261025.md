# 大地图系统设计（2026-10-25）

> 长安城大地图的设计方案。

---

## 一、地图规格

### 尺寸
- **东西宽**：9721米
- **南北长**：8652米
- **总面积**：84.1平方公里

### 比例
- 1游戏单位 = 1米
- 等比例复刻

---

## 二、地图元素

### 主干道
- **朱雀大街**：宽150m，长6.9km
- **城市干道**：宽30-50m，东西南北各几条

### 里坊
- **108坊**：大小约500m×500m
- **坊墙**：高2-3m，厚1m
- **坊门**：每坊4个门

### 地标
- **明德门**：城南正门
- **大雁塔**：慈恩寺
- **小雁塔**：荐福寺
- **大明宫**：东北高地
- **曲江池**：东南风景区

---

## 三、大地图UI

### 打开方式
- 按M键打开
- 全屏地图

### 功能
- **缩放**：滚轮放大缩小
- **拖动**：鼠标拖动移动地图
- **标记**：显示玩家位置/任务目标/地标
- **传送**：点击已探索地标快速传送

### 样式
- **仿古地图风格**：羊皮纸质感
- **手绘风格**：像古地图
- **标注**：坊名/地名

---

## 四、地图数据

```javascript
{
  bounds: {
    minX: -4860,
    maxX: 4860,
    minZ: -4326,
    maxZ: 4326
  },
  
  landmarks: [
    {
      name: '明德门',
      position: { x: 0, z: -4000 },
      type: 'gate'
    },
    {
      name: '大雁塔',
      position: { x: 500, z: -3000 },
      type: 'pagoda'
    },
    {
      name: '曲江池',
      position: { x: 1000, z: -2000 },
      type: 'lake'
    },
    {
      name: '大明宫',
      position: { x: 0, z: 3000 },
      type: 'palace'
    }
  ],
  
  fang: [
    // 108坊列表
    { name: '务本坊', position: { x: -500, z: 500 }, type: 'noble' },
    { name: '崇义坊', position: { x: 500, z: 500 }, type: 'commoner' },
    // ...
  ]
}
```

---

## 五、技术实现

### 大地图管理器
```javascript
class MapManager {
  constructor() {
    this.mapData = mapData;
    this.isOpen = false;
  }

  openMap() {
    this.isOpen = true;
    this.showMapUI();
  }

  closeMap() {
    this.isOpen = false;
    this.hideMapUI();
  }

  update(playerPosition) {
    if (this.isOpen) {
      // 更新玩家位置标记
      this.updatePlayerMarker(playerPosition);
    }
  }

  teleportTo(landmarkName) {
    const landmark = this.mapData.landmarks.find(l => l.name === landmarkName);
    if (landmark) {
      player.position.set(landmark.position.x, 0, landmark.position.z);
      this.closeMap();
    }
  }
}
```

---

## 六、传送点

### 已解锁传送点
- 明德门
- 大雁塔
- 曲江池
- 大明宫
- 西市
- 东市

### 解锁条件
- 第一次到达自动解锁
- 可以快速旅行

---

文档日期：2026-10-25
