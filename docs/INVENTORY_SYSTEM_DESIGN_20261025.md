# 物品栏系统设计（2026-10-25）

> 物品栏/背包系统的设计方案。

---

## 一、物品类型

### 消耗品
- **食物**：恢复体力
- **药品**：恢复生命
- **酒水**：特殊效果

### 材料
- **药材**：炼丹/制药
- **矿石**：锻造
- **布料**：裁缝

### 贵重品
- **珠宝**：值钱
- **字画**：收藏品
- **古董**：稀有

### 任务物品
- 任务专用
- 不能丢弃
- 不能出售

---

## 二、物品数据

```javascript
{
  id: 'item_rice',
  name: '大米',
  type: 'food',  // food/material/valuable/quest
  description: '日常主食',
  price: 10,
  stackable: true,  // 可堆叠
  maxStack: 99,
  icon: 'rice.png'
}
```

---

## 三、物品栏

### 容量
- 默认：20格
- 可扩展：最多40格

### 操作
- **使用**：双击或右键
- **丢弃**：拖出界面
- **出售**：商店中出售
- **整理**：自动排序

---

## 四、技术实现

### 物品栏管理器
```javascript
class InventoryManager {
  constructor() {
    this.items = [];  // 物品列表
    this.maxSlots = 20;
  }

  addItem(item) {
    // 检查是否可堆叠
    if (item.stackable) {
      const existing = this.items.find(i => i.id === item.id);
      if (existing && existing.count < existing.maxStack) {
        existing.count++;
        return true;
      }
    }

    // 检查空格
    if (this.items.length >= this.maxSlots) {
      console.warn('Inventory full');
      return false;
    }

    // 添加新物品
    this.items.push({ ...item, count: 1 });
    return true;
  }

  removeItem(itemId, count = 1) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return false;

    item.count -= count;
    if (item.count <= 0) {
      this.items = this.items.filter(i => i.id !== itemId);
    }
    return true;
  }

  useItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    switch(item.type) {
      case 'food':
        player.restoreHealth(item.restoreAmount);
        this.removeItem(itemId, 1);
        break;
      case 'potion':
        player.restoreMana(item.restoreAmount);
        this.removeItem(itemId, 1);
        break;
    }
  }
}
```

---

## 五、UI设计

### 物品栏界面
- 按I键打开
- 网格布局(20格)
- 每格显示物品图标+数量
- 悬停显示详细信息
- 底部显示铜钱总数

### 拖拽操作
- 拖拽物品到地上=丢弃
- 拖拽到商人=出售
- 双击=使用

---

文档日期：2026-10-25
