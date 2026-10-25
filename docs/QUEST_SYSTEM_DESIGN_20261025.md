# 任务系统设计（2026-10-25）

> 游戏任务系统的设计方案。

---

## 一、任务类型

### 主线任务
- 推动剧情发展
- 引导玩家探索长安城
- 关键节点任务

### 支线任务
- 丰富世界内容
- NPC个人故事
- 可选完成

### 日常任务
- 重复性任务
- 每日刷新
- 奖励稳定

---

## 二、任务结构

### 任务数据
```javascript
{
  id: 'quest_001',
  name: '初入长安',
  description: '你化身小青龙，初到长安城，先去朱雀大街看看吧。',
  type: 'main',  // main/side/daily

  objectives: [
    {
      id: 'obj_1',
      description: '到达朱雀大街',
      type: 'reach',  // reach/talk/collect/kill
      target: { x: 0, z: 0 },
      completed: false
    }
  ],

  rewards: {
    experience: 100,
    items: ['铜币_100'],
    reputation: 10
  },

  prerequisites: [],  // 前置任务
  nextQuests: ['quest_002']  // 后续任务
}
```

---

## 三、任务流程

### 接任务
- 与NPC对话
- NPC头上有感叹号(!)
- 选择接受任务

### 进行中
- NPC头上有问号(?)
- 任务追踪显示目标
- 完成目标后提示

### 交任务
- 回到NPC处
- 交付任务
- 获得奖励
- NPC头上打勾(✓)

---

## 四、任务示例

### 主线：初入长安
1. 到达朱雀大街
2. 与街边老者交谈
3. 去西市看看
4. 认识胡商
5. 去大雁塔

### 支线：寻人
- 老者的孙子走丢了
- 在平民坊找到孩子
- 带回给老者

### 日常：采购
- 去西市买香料
- 去东市买绢帛
- 带回给雇主

---

## 五、技术实现

### 任务管理器
```javascript
class QuestManager {
  constructor() {
    this.activeQuests = [];
    this.completedQuests = [];
  }

  acceptQuest(questId) {
    const quest = questData[questId];
    this.activeQuests.push(quest);
  }

  updateObjective(questId, objectiveId, value) {
    const quest = this.activeQuests.find(q => q.id === questId);
    if (!quest) return;

    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (!objective) return;

    // 检查是否完成
    if (this.checkObjectiveComplete(objective, value)) {
      objective.completed = true;
      // 检查所有目标是否完成
      if (quest.objectives.every(o => o.completed)) {
        this.onQuestComplete(quest);
      }
    }
  }

  onQuestComplete(quest) {
    this.completedQuests.push(quest);
    this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id);
    // 发放奖励
  }
}
```

---

## 六、UI设计

### 任务追踪
- 屏幕右侧显示当前任务
- 显示任务目标
- 完成时打勾

### 任务日志
- 按J键打开
- 分类显示(主线/支线/日常)
- 可追踪/放弃

---

文档日期：2026-10-25
