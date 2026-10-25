# 成就系统设计（2026-10-25）

> 成就/奖杯系统的设计方案。

---

## 一、成就分类

### 探索类
- **初入长安**：到达朱雀大街
- **东西两市**：逛完西市和东市
- **大雁塔**：登上大雁塔
- **曲江胜景**：游览曲江池
- **大明宫**：参观大明宫
- **走遍长安**：探索所有108坊

### 收集类
- **第一桶金**：赚到1000文铜钱
- **富商**：赚到10000文铜钱
- **收藏家**：收集10件珍品
- **美食家**：尝遍长安美食

### 社交类
- **初遇**：与第一个NPC对话
- **广结善缘**：与10个NPC对话
- **人脉广阔**：与50个NPC对话

### 特殊类
- **上元灯节**：经历一次上元灯节
- **科举放榜**：观看科举放榜
- **雨中漫步**：在雨天游览长安
- **星夜观天**：在夜晚看星空

---

## 二、成就数据

```javascript
{
  id: 'ach_first_step',
  name: '初入长安',
  description: '到达朱雀大街，开始你的长安之旅',
  icon: 'first_step.png',
  hidden: false,  // 是否隐藏成就
  reward: {
    experience: 100,
    title: '初入长安'
  }
}
```

---

## 三、成就系统

### 管理器
```javascript
class AchievementManager {
  constructor() {
    this.unlockedAchievements = [];
    this.allAchievements = achievementData;
  }

  unlockAchievement(achievementId) {
    if (this.unlockedAchievements.includes(achievementId)) return;

    this.unlockedAchievements.push(achievementId);
    const achievement = this.allAchievements.find(a => a.id === achievementId);

    // 显示成就解锁提示
    this.showUnlockNotification(achievement);

    // 发放奖励
    if (achievement.reward) {
      player.experience += achievement.reward.experience;
    }

    // 保存
    this.saveProgress();
  }

  showUnlockNotification(achievement) {
    // 右上角弹出成就解锁提示
    const notification = document.createElement('div');
    notification.innerHTML = `
      <h3>成就解锁！</h3>
      <p>${achievement.name}</p>
      <p>${achievement.description}</p>
    `;
    notification.style.cssText = `
      position: absolute;
      top: 50px;
      right: 20px;
      padding: 20px;
      background: rgba(0,0,0,0.8);
      color: gold;
      border-radius: 10px;
      border: 2px solid gold;
    `;
    document.body.appendChild(notification);

    // 3秒后消失
    setTimeout(() => notification.remove(), 3000);
  }
}
```

---

## 四、成就列表UI

- 按J键打开成就界面
- 分类显示(探索/收集/社交/特殊)
- 已解锁：彩色图标
- 未解锁：灰色图标
- 显示完成进度

---

文档日期：2026-10-25
