# 项目目录结构说明（2026-10-25）

> 项目目录结构与说明。

---

## 一、整体结构

```
changan-dragon/
├── docs/              # 设计文档
├── src/               # 源代码
├── public/            # 静态资源
├── new-assets/        # 素材库
├── engine-poc/        # 引擎验证
├── package.json       # 依赖
└── README.md          # 说明
```

---

## 二、docs目录

```
docs/
├── 108_FANG_DIFFERENTIATION_SPEC_20261025.md
├── WEST_MARKET_DETAIL_DESIGN_20261025.md
├── EAST_MARKET_DETAIL_DESIGN_20261025.md
├── QUJIANG_POOL_DETAIL_DESIGN_20261025.md
├── DAMING_PALACE_DETAIL_DESIGN_20261025.md
├── ... (100+份设计文档)
└── DOCUMENTS_INDEX_DIRECTORY_20261025.md
```

### 分类
- 区域设计：9大区域详细设计
- 技术方案：20+系统技术实现
- 参考资料：10份唐代参考
- 代码框架：所有系统代码框架

---

## 三、new-assets目录

```
new-assets/
├── categorized/       # 分类素材库
│   ├── 01_buildings/ # 建筑模型
│   ├── 02_characters/ # 角色模型
│   ├── 03_nature/    # 自然材质
│   ├── 04_environment/ # 环境/HDRI
│   ├── 05_props/     # 道具
│   └── 06_audio/     # 音频
├── engine-poc/        # 引擎验证
│   └── zhuque-demo/  # 朱雀大街demo
└── forbidden-city-3d/ # 参考项目
```

---

## 四、src目录(待开发)

```
src/
├── main.js           # 主入口
├── App.js            # 应用主类
├── config.js         # 配置
├── systems/          # 核心系统
├── daynight/         # 昼夜系统
├── weather/          # 天气系统
├── streaming/        # 流加载
├── npc/              # NPC系统
├── player/           # 玩家
├── interaction/      # 交互
├── audio/            # 音频
└── performance/     # 性能
```

---

## 五、文件命名规范

### 文档
- 大写字母+下划线
- 日期后缀
- 示例：`WEST_MARKET_DETAIL_DESIGN_20261025.md`

### 代码
- 小写字母+驼峰
- 示例：`streamingManager.js`

### 素材
- 小写字母+下划线
- 示例：`tang_hall_9bay.glb`

---

文档日期：2026-10-25
