# 菜单系统设计（2026-10-25）

> 游戏菜单/UI系统的设计方案。

---

## 一、主菜单

### 启动界面
- **游戏标题**：龙游长安
- **开始游戏**：新游戏/继续游戏
- **设置**：游戏选项
- **关于**：项目介绍

### 游戏内菜单
- 按Esc打开
- **继续游戏**：关闭菜单
- **保存游戏**：存档
- **设置**：游戏选项
- **主菜单**：退出到主菜单
- **退出游戏**：关闭页面

---

## 二、HUD界面

### 屏幕上方
- **时间**：游戏内时间(昼夜)
- **天气**：当前天气

### 屏幕下方
- **生命值**：玩家状态
- **铜钱**：当前金币

### 屏幕右侧
- **任务追踪**：当前任务目标
- **小地图**：右上角

### 屏幕中心
- **准星**：交互提示

---

## 三、菜单系统

### 管理器
```javascript
class MenuManager {
  constructor() {
    this.menus = new Map();
    this.currentMenu = null;
    this.isPaused = false;
  }

  openMenu(menuName) {
    // 关闭当前菜单
    if (this.currentMenu) {
      this.closeMenu(this.currentMenu);
    }

    // 打开新菜单
    const menu = this.menus.get(menuName);
    if (menu) {
      menu.show();
      this.currentMenu = menuName;
      this.isPaused = true;
    }
  }

  closeMenu(menuName) {
    const menu = this.menus.get(menuName);
    if (menu) {
      menu.hide();
    }
    this.currentMenu = null;
    this.isPaused = false;
  }

  togglePause() {
    if (this.isPaused) {
      this.closeMenu('pause');
    } else {
      this.openMenu('pause');
    }
  }
}
```

---

## 四、UI元素

### 对话框
- NPC对话
- 选项按钮
- 继续/退出

### 商店界面
- 商品列表
- 玩家背包
- 买/卖按钮

### 物品栏
- 网格布局
- 物品图标
- 数量显示

### 小地图
- 圆形/方形
- 玩家位置
- 地标标记

---

## 五、快捷键

| 按键 | 功能 |
|---|---|
| Esc | 暂停菜单 |
| I | 物品栏 |
| J | 任务日志 |
| M | 大地图 |
| N | 成就 |
| E | 交互 |
| WASD | 移动 |
| 空格 | 上升(龙) |
| Shift | 下降(龙) |

---

文档日期：2026-10-25
