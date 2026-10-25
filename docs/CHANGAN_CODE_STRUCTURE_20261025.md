# 长安项目：代码结构设计

> 创建时间：2026-10-25

---

## 目录结构

```
changan-dragon/
├── src/
│   ├── main.js              # 入口
│   ├── engine/              # 引擎层
│   │   ├── renderer.js      # 渲染器
│   │   ├── camera.js        # 相机
│   │   ├── lights.js        # 光照
│   │   └── postprocess.js   # 后处理
│   ├── world/               # 世界层
│   │   ├── chunk-manager.js # chunk管理
│   │   ├── ward-generator.js # 坊生成器
│   │   ├── building-kit.js   # 建筑kit
│   │   └── vegetation.js     # 植被
│   ├── systems/             # 系统层
│   │   ├── npc-crowd.js      # NPC群集
│   │   ├── day-night.js      # 昼夜
│   │   ├── weather.js        # 天气
│   │   ├── audio.js          # 音频
│   │   └── water.js          # 水面
│   ├── player/              # 玩家层
│   │   ├── controller.js     # 控制器
│   │   ├── protagonist.js    # 主角
│   │   └── abilities.js      # 能力
│   └── ui/                  # UI层
│       ├── hud.js            # HUD
│       ├── menu.js           # 菜单
│       └── minimap.js         # 小地图
├── assets/                  # 素材
│   ├── models/               # 3D模型
│   ├── textures/             # 贴图
│   ├── audio/                # 音频
│   └── data/                 # 数据
├── docs/                    # 文档
└── index.html               # 入口HTML
```

---

## 模块划分

### 引擎层
- 负责渲染、相机、光照、后处理
- 不关心游戏内容

### 世界层
- 负责chunk加载、坊生成、建筑、植被
- 不关心玩家

### 系统层
- 负责NPC、昼夜、天气、音频、水面
- 独立运行

### 玩家层
- 负责控制、主角、能力
- 和世界交互

### UI层
- 负责HUD、菜单、小地图
- 显示信息

---

*代码结构清晰，模块化设计，方便维护和扩展。*
