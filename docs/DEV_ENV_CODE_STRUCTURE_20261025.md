# 开发环境与代码结构

> 创建时间：2026-10-25

---

## 技术栈

### 核心
- **引擎**: Three.js r169
- **构建**: Vite
- **语言**: JavaScript (ES6+)
- **包管理**: npm

### 工具库
- DRACOLoader（几何压缩）
- MeshoptDecoder
- KTX2Loader（纹理压缩）

---

## 目录结构

```
changan-dragon/
├── docs/                    # 设计文档
├── src/
│   ├── main.js              # 入口
│   ├── core/
│   │   ├── engine.js        # Three.js封装
│   │   ├── scene.js         # 场景管理
│   │   ├── camera.js        # 相机控制
│   │   └── renderer.js      # 渲染器
│   ├── systems/
│   │   ├── chunk-loader.js  # 流加载
│   │   ├── npc-system.js    # NPC系统
│   │   ├── weather.js       # 天气系统
│   │   ├── audio.js         # 音频系统
│   │   ├── water.js         # 水面系统
│   │   └── postfx.js        # 后处理
│   ├── world/
│   │   ├── ward-generator.js # 坊生成器
│   │   ├── building-kit.js  # 建筑kit
│   │   ├── vegetation.js     # 植被系统
│   │   └── landmarks.js      # 地标建筑
│   ├── player/
│   │   ├── controller.js    # 玩家控制
│   │   ├── dragon.js        # 小青龙模型
│   │   └── human.js         # 人形模式
│   └── ui/
│       ├── hud.js           # 抬头显示
│       ├── map.js           # 大地图
│       └── dialog.js        # 对话框
├── public/
│   ├── models/              # GLB模型
│   ├── textures/            # PBR贴图
│   ├── audio/               # 音效BGM
│   └── hdri/                # 环境贴图
├── index.html
├── package.json
└── vite.config.js
```

---

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版
npm run build

# 预览构建
npm run preview
```

---

## 代码规范
- ES6模块
- 函数式 + 面向对象混合
- 注释用中文
- 变量名驼峰
- 组件化、模块化

---

## Git工作流
- main分支：唯一权威
- 功能直接在main上开发
- 提交信息：docs: / feat: / fix: / refactor:
- 推送：git push origin main

---

*代码结构清晰，模块化，方便后续扩展。*
