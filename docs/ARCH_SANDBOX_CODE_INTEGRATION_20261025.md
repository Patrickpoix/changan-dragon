# chinese-ancient-architecture-sandbox代码集成实施方案

> 设计文档版本：v1.0
> 日期：2026-10-25

---

## 一、集成步骤

### 1. Fork仓库
- Fork hafewa/chinese-ancient-architecture-sandbox
- 作为我们的基础

### 2. 改造为唐代风格
- 修改BuildingGenerator.js参数
- 修改颜色为唐代风格
- 新增庑殿顶形制

### 3. 模块化提取
- 提取BuildingGenerator为独立模块
- 提取Decorations为独立模块
- 提取NatureGenerator为独立模块

### 4. 集成到我们项目
- 放入src/generators/目录
- 修改import路径
- 测试运行

---

## 二、需要修改的文件

| 文件 | 修改内容 |
|---|---|
| BuildingGenerator.js | 屋顶坡度、出檐、颜色 |
| Presets.js | 替换为唐代场景预设 |
| Decorations.js | 新增唐代装饰件 |
| WallGenerator.js | 坊墙形制调整 |

---

## 三、保留的部分
- 整体架构
- 模块化设计
- 代码风格

---

设计日期：2026-10-25 14:10
