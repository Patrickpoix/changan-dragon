# 开源参考仓库深度研究：chinese-ancient-architecture-sandbox

> 发现日期：2026-10-25
> 仓库地址：https://github.com/hafewa/chinese-ancient-architecture-sandbox
> 许可证：MIT
> 技术栈：Three.js + Vite

---

## 一、项目概述

《清明上河图·宋韵林泉》3D古建自由沙盒营造游戏，完全用Three.js程序化生成中国古代建筑。与我们的龙游长安项目高度相关——都是WebGL+Three.js+中国古建。

---

## 二、核心代码模块（engine/目录）

### 1. BuildingGenerator.js (24KB)
- 建筑程序化生成核心
- 可生成不同形制的中国古建
- 包含屋顶、梁柱、门窗等构件

### 2. CityGateGenerator.js (6KB)
- 城门楼生成器
- 可直接参考用于明德门、朱雀门等城门

### 3. Decorations.js (57KB)
- **最大文件，装饰件库**
- 包含各类古建装饰构件
- 可能含斗拱、雀替、匾额、栏杆等

### 4. Presets.js (47KB)
- **预设参数库**
- 各类建筑的参数化配置
- 可直接参考用于108坊差异化

### 5. SiheyuanManager.js (11KB)
- 四合院布局管理
- 可直接用于普通坊巷民居生成

### 6. WallGenerator.js (10KB)
- 坊墙/城墙生成器
- 可参考用于108坊坊墙

### 7. PathGenerator.js (5KB)
- 道路/路径生成器
- 可参考用于坊内街道

### 8. NatureGenerator.js (18KB)
- 自然环境生成
- 植被、地形等

### 9. LakeManager.js (9KB)
- 湖泊管理
- 可参考用于曲江池、太液池

### 10. WeatherManager.js (9KB)
- 天气系统
- 可参考用于我们的天气系统设计

---

## 三、核心框架（core/目录）

| 文件 | 大小 | 功能 |
|---|---|---|
| FirstPersonController.js | 14KB | 第一人称控制器 |
| InputManager.js | 37KB | 输入管理（最大） |
| SceneManager.js | 12KB | 场景管理 |
| AudioManager.js | 10KB | 音频管理 |

---

## 四、对我们项目的价值

### 直接可复用
1. **古建程序化生成逻辑** - BuildingGenerator + Presets
2. **四合院布局** - SiheyuanManager（普通坊巷民居）
3. **城门生成** - CityGateGenerator（明德门等）
4. **坊墙生成** - WallGenerator
5. **道路生成** - PathGenerator
6. **湖泊系统** - LakeManager（曲江池）
7. **天气系统** - WeatherManager
8. **第一人称控制器** - FirstPersonController

### 需要改造的部分
1. 宋代建筑风格 → 唐代建筑风格（斗拱更硕大、出檐更深）
2. 清明上河图（北宋）→ 唐长安（都城形制）
3. 沙盒营造 → 开放世界探索
4. 单一场景 → 84平方公里大世界

---

## 五、其他参考仓库

### solara (Johannett321/solara)
- 完全程序化生成的开放世界
- 城市、人群、海岸线、天气、音频全是代码生成
- 零资产文件，Three.js + TypeScript
- 可参考其零资产程序化生成策略

### neon-mayhem (pranshuparmar/neon-mayhem)
- 浏览器开放世界驾驶游戏
- Vanilla Three.js，无构建步骤
- 可参考其无构建部署方案

---

## 六、下一步行动

1. 克隆 chinese-ancient-architecture-sandbox 到本地研究
2. 重点分析 BuildingGenerator.js 和 Presets.js 的参数化体系
3. 将其古建生成逻辑改造为唐代风格
4. 参考其 WeatherManager 完善我们的天气系统
5. 参考其 SiheyuanManager 设计108坊民居生成

---

研究日期：2026-10-25 13:15
