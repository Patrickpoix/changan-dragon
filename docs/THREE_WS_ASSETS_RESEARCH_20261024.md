# three.ws 免费素材平台研究（2026-10-24）

> 平台：https://three.ws
> 完全免费：无需账号、无需API key、无需付费
> 素材许可：CC0
> 已克隆CLI工具研究：752 KB

---

## 一、平台特点

| 特点 | 说明 |
|------|------|
| 完全免费 | $0，无任何隐藏费用 |
| 无需注册 | 直接搜索下载 |
| CC0许可 | 可商用，无署名要求 |
| 素材数量 | 数千个，持续增长 |
| 分类 | 道具/角色/动作三大类 |
| 格式 | GLB/GLTF |
| CLI工具 | npx直接使用 |

---

## 二、素材分类

### 1. Object（道具）
- 家具、灯具、器皿、建筑构件等
- 适合：街市场景、室内陈设、道具

### 2. Character（绑定角色）
- 带骨骼绑定的人形角色
- 适合：NPC、路人、商人、卫兵

### 3. Animation（动作片段）
- 走路、跑步、挥手、交谈等动作
- 适合：角色动画复用

---

## 三、使用方式

### 搜索素材
```bash
npx @three-ws/assets search wooden chair --kind object
npx @three-ws/assets search walk --kind animation --limit 5
npx @three-ws/assets search --kind character --json
```

### 下载素材
```bash
npx @three-ws/assets add object:painted_wooden_chair_01
```
自动下载GLB到 public/three-ws/ 目录

---

## 四、对唐长安项目的价值

### 可搜索的方向

| 类别 | 搜索关键词 | 用途 |
|------|-----------|------|
| 家具 | wooden chair, table, screen | 厅堂茶馆 |
| 道具 | lantern, basket, barrel | 街市场景 |
| 角色 | human, man, woman, guard | NPC路人 |
| 动作 | walk, run, talk, sit | 角色动画 |

### 注意事项
- 主要是西式素材，需要筛选合适的
- 中式灯笼、招牌等可能需要自己做
- 角色需要调整服饰为唐代风格

---

## 五、下一步

1. 搜索并下载可用的家具和道具
2. 搜索并下载基础人形角色
3. 搜索常用动作片段
4. 评估改造为唐代风格的工作量

---
研究日期：2026-10-24
本地克隆路径：new-assets/three-ws-assets/
