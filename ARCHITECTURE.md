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
│   ├── 04-compatibility.js # 兼容性处理
│   ├── 05-rendering.js      # 渲染管线
│   ├── 06-surfaces.js       # 地面/路面
│   ├── 07-water.js          # 水面Shader
│   ├── 08-assets.js         # 资源加载
│   ├── 09-botany.js         # 植被
│   ├── 10-world.js          # 108坊/城墙/街景
│   ├── 11-shorelines.js     # 岸线
│   ├── 12-landmarks.js     # 地标建筑（权威坐标）
│   ├── 20-character.js      # 角色/NPC
│   ├── 25-exploration.js    # 探索/移动模式
│   ├── 27-session.js        # 会话/存档
│   ├── 28-weather.js        # 天气系统
│   ├── 29-lanterns.js       # 灯笼系统
│   ├── enhance/            # 按Owner分类的增强模块
│   │   ├── visual-grade.js   # 视觉调色Owner
│   │   ├── landmarks.js      # 地标精修Owner
│   │   ├── vegetation.js     # 植被系统Owner
│   │   ├── water.js           # 水景系统Owner
│   │   ├── sky.js             # 天空系统Owner
│   │   ├── outside.js         # 城外环境Owner
│   │   ├── night-light.js     # 夜景灯光Owner
│   │   └── performance.js     # 性能优化Owner
│   ├── 99-safe-init.js      # 安全初始化
│   ├── 30-main.js          # 主循环/游戏逻辑
│   └── boot.js             # 启动加载器
├── assets/                  # 共享素材库
├── .github/workflows/       # CI工作流
└── agent.md                 # 开发规范
```

## 核心系统

### 1. 共享材质库（00-core.js）
- MAT: plaster/wood/red/stone/roof/roofGlazed/lantern/lanternGlow/gold/dark/leaf/trunk/blossom/window等
- TEX: stone/roof/wood/grass/dirt/lattice/bark等Canvas生成纹理
- 共享几何体: UNIT_BOX/UNIT_CYL/UNIT_SPHERE/UNIT_CONE/UNIT_PLANE/ROOF_UNIT/ROOF_SMALL
- Batch类: InstancedMesh + 空间分区 + LOD

### 2. 地标建筑（12-landmarks.js）
- 大明宫含元殿 (150, -432)
- 大明宫丹凤门 (150, -380)
- 太极宫太极殿 (0, -334)
- 兴庆宫龙池 (342, -152)
- 兴庆宫花萼相辉楼 (398, -108)
- 曲江池中心 (354, 318)
- 大雁塔 (216, 283)
- 小雁塔 (-216, 349)
- 青龙寺塔 (300, 100)
- 西明寺塔 (-300, 150)
- 明德门 (0, 380)
- 朱雀大街 x=0，贯穿南北
- 西市中心 (-258, -14)
- 东市中心 (174, -14)

### 3. 天空系统（00-core.js）
- sky Shader: 大气散射 + 云层 + 太阳
- stars: 700颗星星点云
- 远山: 连续山脊线两层

### 4. 昼夜系统（30-main.js）
- updateDayNight()每帧动态调整sun/ambient/fog/exposure
- 黄金时刻/蓝调时刻/夜景自动切换

### 5. NPC与交互（20-character.js / 25-exploration.js）
- 步行/骑行/飞行三种移动模式
- 诗笺收集系统（localStorage存档）
- 碰撞检测

### 6. 水面系统（07-water.js / 12-landmarks.js）
- waterMat Shader: 时间Uniform + 波纹 + 高光计算
- 曲江池/龙池/护城河

## Enhance模块架构（按Owner分类）

### 启动时序
```
GAME.ready → 5s后 visual-grade → 8s后 landmarks → 10s后 vegetation
→ 12s后 water → 14s后 sky → 16s后 outside → 18s后 night-light → 20s后 performance
```

### 素材共享策略

**核心原则**：不重复存储纹理，全部复用共享几何体和材质。

- 所有enhance模块使用共享UNIT_BOX/UNIT_CYL/UNIT_SPHERE/ROOF_UNIT/ROOF_SMALL
- 所有材质使用共享MAT
- 不重复创建天空/水面/农田等已有系统
- 新增内容只做精修和增强
- 统一使用原系统变量名：sun/ambient/hemi/rim（禁止使用sunLight/ambientLight）

## 性能配置

| 指标 | 桌面 | 移动端 |
|---|---|---|
| 目标FPS | 60 | 30 |
| DPR上限 | 2.0 | 1.5 |
| 阴影地图 | 4096 | 2048 |
| 各向异性过滤 | 16x | 16x |
| 阴影距离 | 1000m | 1000m |

## CI工作流

- `.github/workflows/ci.yml`：JS语法检查
- 每次push到main自动运行

## 开发规范

详见 [agent.md](./agent.md)