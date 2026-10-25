# 龙游长安 · 项目架构总览

> 唐长安城 84km² 开放世界游戏 · Three.js 现代Web端
> 更新：2026-10-26

## 技术栈

- **引擎**：Three.js r160（正式）/ r169（Demo Vite版）
- **渲染**：WebGL2 + ACESFilmicToneMapping + PCFSoftShadowMap
- **后处理**：SSAO + SSR + Bloom + LUT + Vignette + FilmGrain + FXAA
- **资源**：GLB模型（InstancedMesh实例化）+ PBR材质共享 + HDRI环境光
- **数据**：108坊程序化生成（mulberry32种子化PRNG）+ JSON布局

## 坐标系统

考古坐标原点在外郭城西南角，X东向正，Z北向正。
Three.js中 worldX=archX, worldZ=-archZ。
城市尺寸：9721m × 8652m，朱雀大街中心X=4860，宽150m。

## 目录结构

```
├── src/                    # 正式游戏引擎（Three.js r160）
│   ├── 00-core.js ~ 30-main.js
│   └── vendor/three.min.js
├── demos/                  # 可运行Demo（Vite + Three r169）
│   ├── zhuque-walkable/     # 朱雀大街1km可走Demo（自包含HTML）
│   ├── ward-generator/      # 108坊程序化生成器
│   ├── npc-crowd/           # 500 NPC LOD群集系统
│   ├── daming-palace/       # 大明宫精模场景
│   ├── sky-weather/         # 昼夜循环+天气粒子系统
│   ├── postprocessing/      # 电影级后处理管线
│   ├── integrated/          # 1km²片区整合Demo
│   ├── city-viewer/         # 全城84km²流加载Viewer
│   ├── special-areas/       # 特殊区域布局数据（12门/东西市/曲江/大明宫）
│   └── HANDOVER.md          # 交接文档
├── docs/                    # 历史文档（待整合精简）
├── assets/                  # 共享素材库（GLB模型/PBR纹理/HDRI）
└── tools/                   # 开发工具脚本
```

## 核心系统

### 1. 108坊程序化生成（ward-generator）
- mulberry32种子化PRNG，同一seed生成相同布局
- 7种坊型：A-G（住宅/市/寺/宫/园林/城门）
- 每坊生成：坊墙+坊门+内部建筑+道路+绿化
- 运行 `node generate_layout.js` 重新生成完整数据

### 2. NPC群集（npc-crowd）
- 三档LOD：近(<50m) SkinnedMesh / 中(50-150m) InstancedMesh / 远(>150m) fog淡出
- 200 NPC：80% walk / 15% idle / 5% talk
- 简化RVO避碰（O(n·20)而非O(n²)）
- 时间密度：白天500 / 夜晚50 / 上元灯节1000

### 3. 大明宫场景（daming-palace）
- 中轴对称：丹凤门→含元殿→宣政殿→紫宸殿→麟德殿→太液池
- InstancedMesh回廊（250+实例）+ 树木（160+实例）
- WASD飞行控制，6个预设机位，T键切换黄昏

### 4. 天空天气（sky-weather）
- 24h昼夜循环：太阳角度/颜色/阴影实时变化
- 粒子系统：雨/雪/落叶/樱花花瓣
- 天空Shader：大气散射 + 云层覆盖

### 5. 后处理管线（postprocessing）
- Render → SSAO → SSR → Bloom → LUT → Vignette → FilmGrain → FXAA
- 4套LUT预设：day/dusk/night/rain
- SSAO近景自动裁切（<50m才开）
- 移动端降级模式：关SSAO/SSR/Vignette/Film

### 6. 全城Viewer（city-viewer）
- 500m chunk × 20×18 = 360 slots
- 三档LOD：近(≤250m)完整textured / 中(250-750m)去墙 / 远(750-1200m)盒体billboard
- 全局InstancedMesh预分配 + 动态填矩阵
- 模型共享：同一GLB所有坊复用，不重复存储纹理

## 素材共享策略

**核心原则**：不重复存储纹理。原GLB + 共享材质源。

- 市集亭屋和庭院门楼共用同一套PBR材质源（木材/瓦面/灰泥/石材）
- 25个建筑材质组统一绑定
- 避免上传两份各约13MB的重复贴图模型
- 新增缺失法线恢复 + 按实际几何坐标生成UV

## 性能指标（目标）

| 指标 | 桌面 | 移动端 |
|---|---|---|
| DrawCalls | <200 | <100 |
| Triangles | <2M | <500k |
| FPS | 60 | 30 |
| 内存 | <500MB | <200MB |

## 待办（下一步开发）

1. 整合docs/上千份历史文档为精简架构文档
2. 接入共享PBR材质库到正式引擎src/
3. 实现坊间连通路网 + 寻路
4. NPC接入108坊真实路径
5. 大明宫+东市+西市+曲江池 全区域连通
6. 游戏UI系统（任务/对话/背包）
7. 音效系统（背景音乐+环境音+人声）
