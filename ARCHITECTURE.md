# 龙游长安 · 项目架构总览

> 唐长安城 开放世界游戏 · Three.js r160
> 更新：2026-10-26

## 技术栈

- **引擎**：Three.js r160 正式版
- **渲染**：WebGL2 + ACESFilmicToneMapping + PCFSoftShadowMap
- **后处理**：SAO环境光遮蔽 + Bloom辉光 + FXAA抗锯齿
- **优化**：建筑批处理 + InstancedMesh实例化 + 空间分区 + LOD

## 目录结构

```
├── src/                    # 正式游戏引擎
│   ├── 00-core.js          # 核心工具/材质库/共享几何体
│   ├── 05-rendering.js      # 渲染管线
│   ├── 12-landmarks.js     # 地标建筑（权威坐标）
│   ├── 30-main.js          # 主循环/游戏逻辑
│   ├── enhance/            # 按Owner分类的增强模块
│   │   ├── visual-grade.js   # 视觉调色Owner
│   │   ├── landmarks.js      # 地标精修Owner
│   │   ├── vegetation.js     # 植被系统Owner
│   │   ├── water.js           # 水景系统Owner
│   │   ├── sky.js             # 天空系统Owner
│   │   ├── outside.js         # 城外环境Owner
│   │   ├── night-light.js     # 夜景灯光Owner
│   │   └── performance.js     # 性能优化Owner
│   └── boot.js             # 启动加载器
├── assets/                  # 共享素材库
├── docs/                    # 历史文档
└── agent.md                 # 开发规范
```

## 核心系统

### 1. 共享材质库（00-core.js）
- MAT: plaster/wood/red/stone/roof/roofGlazed/lantern等
- TEX: stone/roof/wood/grass/dirt/lattice/bark等Canvas生成纹理
- 共享几何体: UNIT_BOX/UNIT_CYL/UNIT_SPHERE/ROOF_UNIT
- Batch类: InstancedMesh + 空间分区 + LOD

### 2. 地标建筑（12-landmarks.js）
- 大明宫含元殿 (150, -432)
- 太极宫太极殿 (0, -334)
- 兴庆宫龙池 (342, -152)
- 曲江池中心 (354, 318)
- 大雁塔 (216, 283)
- 小雁塔 (-216, 349)
- 明德门 (0, 380)
- 朱雀大街 x=0，贯穿南北

### 3. 天空系统（00-core.js）
- sky Shader: 大气散射 + 云层 + 太阳
- stars: 700颗星星点云
- 远山: 连续山脊线两层

### 4. 昼夜系统（30-main.js）
- updateDayNight()每帧动态调整sun/ambient/fog/exposure
- 黄金时刻/蓝调时刻/夜景自动切换

### 5. NPC与交互（20-character.js / 25-exploration.js）
- 步行/骑行/飞行三种移动模式
- 诗笺收集系统
- 碰撞检测

## 素材共享策略

**核心原则**：不重复存储纹理，全部复用共享几何体和材质。

- 所有enhance模块使用共享UNIT_BOX/UNIT_CYL/UNIT_SPHERE
- 所有材质使用共享MAT
- 不重复创建天空/水面/农田等已有系统
- 新增内容只做精修和增强

## 开发规范

详见 [agent.md](./agent.md)

## 性能指标（目标）

| 指标 | 桌面 | 移动端 |
|---|---|---|
| FPS | 60 | 30 |
| DPR上限 | 1.65 | 1.25 |
| 阴影地图 | 2048 | 1024 |
