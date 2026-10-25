# 项目代码结构与目录组织

> 设计文档版本：v1.0
> 日期：2026-10-25

---

## 一、目录结构

```
changan-dragon/
├── src/                    # 源代码
│   ├── core/              # 核心引擎
│   │   ├── engine.js      # Three.js封装
│   │   ├── chunkManager.js # 块管理
│   │   └── sceneManager.js
│   ├── generators/        # 生成器
│   │   ├── wardGenerator.js # 坊生成器
│   │   ├── buildingGenerator.js
│   │   ├── natureGenerator.js
│   │   └── cityGateGenerator.js
│   ├── systems/           # 系统
│   │   ├── dayNightSystem.js
│   │   ├── weatherSystem.js
│   │   ├── npcSystem.js
│   │   ├── audioSystem.js
│   │   └── questSystem.js
│   └── ui/                # 界面
│       ├── HUD.js
│       ├── minimap.js
│       └── dialog.js
├── public/                # 静态资源
│   ├── assets/            # 素材
│   │   ├── models/        # GLB模型
│   │   ├── textures/      # PBR贴图
│   │   ├── hdr/           # HDRI
│   │   └── audio/         # 音效音乐
│   └── index.html
├── docs/                  # 设计文档
└── package.json
```

---

## 二、命名规范
- 文件：camelCase.js
- 类：PascalCase
- 函数：camelCase
- 常量：UPPER_SNAKE_CASE

---

设计日期：2026-10-25 15:55
