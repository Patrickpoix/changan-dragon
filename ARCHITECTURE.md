# 龙游长安 · 项目架构总览

> 唐长安城 开放世界游戏 · Three.js r160
> 更新：2026-10-26

## 技术栈

- **引擎**：Three.js r160 正式版（页游，上限高、易扩展）
- **渲染**：WebGL2 + ACESFilmicToneMapping + PCFSoftShadowMap
- **后处理**：SAO环境光遮蔽 + Bloom辉光 + FXAA抗锯齿
- **优化**：Batch实例化（InstancedMesh+空间分区+LOD）+ 共享几何体 + 单一主循环

## 目录结构

```
├── src/                    # 正式游戏引擎
│   ├── 00-core.js          # 核心工具/共享材质库MAT/共享几何体UNIT_*/Batch/碰撞
│   ├── 04-compatibility.js # 兼容性处理
│   ├── 05-rendering.js      # 渲染管线（GameRendering/DPR/质量档）
│   ├── 06-surfaces.js       # 地面/路面
│   ├── 07-water.js          # 水面Shader（waterMat/waterUniforms）
│   ├── 08-assets.js         # 资源加载（WorldAssets）
│   ├── 09-botany.js         # 植被（addTree/Batch+LOD）
│   ├── 10-world.js          # 108坊/城墙(角楼垛口门楼)/街景
│   ├── 11-shorelines.js     # 岸线
│   ├── 12-landmarks.js     # 地标建筑（权威坐标：含元殿/太极宫/兴庆宫/曲江/两塔/两市/朱雀大街）
│   ├── 20-character.js      # 角色/NPC
│   ├── 25-exploration.js    # 探索/移动模式
│   ├── 27-session.js        # 会话/存档
│   ├── 28-weather.js        # 天气系统
│   ├── 29-lanterns.js       # 灯笼系统
│   ├── enhance/            # 按Owner分类的增强模块（统一调度器注册）
│   │   ├── visual-grade.js   # 视觉调色Owner（优先级10，自检；基调在主循环GRADE）
│   │   ├── sky.js             # 天空Owner（优先级20，自检）
│   │   ├── performance.js     # 性能Owner（优先级30：各向异性16x+阴影±140m）
│   │   ├── landmarks.js       # 地标精修Owner（优先级40：东西市牌坊+两塔石碑）
│   │   ├── vegetation.js      # 植被Owner（优先级50：花圃/蓝花/菊花/岸草/竹林）
│   │   ├── water.js           # 水景Owner（优先级60：护城河三面+木桥+岸石芦苇鸭）
│   │   ├── night-light.js     # 夜景灯光Owner（优先级70：补充灯笼+点光源昼夜联动）
│   │   └── outside.js         # 城外环境Owner（优先级80：驿站/水井/里程碑/树林）
│   ├── 99-safe-init.js      # 统一生命周期调度器（__enhance.register）
│   ├── 30-main.js          # 主循环/操控/镜头/昼夜(GRADE)/诗笺/存档
│   └── boot.js             # 启动加载器（enhance → 99-safe-init → 30-main）
├── assets/                  # 共享素材库（材质/纹理/字体/GLB）
├── .github/workflows/       # CI（node --check 语法校验）
├── README.md                # 项目总览
├── ARCHITECTURE.md          # 本文件
├── agent.md                 # 开发纪律
└── docs/                    # 设计/素材/索引（DOCS_INDEX.md）
```

## 核心系统

### 1. 共享材质库（00-core.js）
- MAT: plaster/wood/red/stone/roof/roofGlazed/lantern/lanternGlow/gold/dark/leaf/trunk/blossom/window等
- TEX: stone/roof/wood/grass/dirt/lattice/bark等Canvas生成纹理
- 共享几何体: UNIT_BOX/UNIT_CYL/UNIT_SPHERE/UNIT_CONE/UNIT_PLANE/ROOF_UNIT/ROOF_SMALL
- Batch类: InstancedMesh + 空间分区 + LOD；`Object.values(B).forEach(build)` 在buildWorld末尾统一构建

### 2. 地标建筑（12-landmarks.js，权威坐标）
- 大明宫含元殿 (150, -432)：双檐+斗拱+彩绘梁枋+檐下灯笼+太液池
- 太极宫太极殿 (0, -334)、兴庆宫龙池 (342, -152)+花萼相辉楼(398,-108)
- 曲江池 (354,318)：湖心岛+紫云楼三层+曲桥+画舫+荷叶荷花
- 大雁塔 (216,283) 7层49m / 小雁塔 (-216,349) 13层41m（addPagoda+砖砌壁柱+字牌）
- 明德门 (0,380) 五门洞、朱雀大街 x=0（四座彩绘牌楼）、东市(174,-14)/西市(-258,-14)（市楼+店铺+摊位+灯笼串）

### 3. 天空系统（00-core.js / 30-main.js）
- sky Shader: 大气散射 + 云层（cloudNoise DataTexture）+ 太阳
- stars: 700颗星星点云（夜晚可见）
- 远山: 连续山脊线两层（半径1180/1460）
- 昼夜：updateDayNight() 每帧统一驱动 skyUniforms/雾/曝光/灯光/水面颜色

### 4. 国风基调（30-main.js GRADE常量，唯一权威）
```js
const GRADE = {
  dayExposure: 1.15,    nightExposure: 0.92,
  dayFogNear: 60,       dayFogFar: 600,
  nightFogNear: 95,     nightFogFar: 590,
};
Colors.dayFog = 0xe8d8b8;  // 国风暖灰雾色
```
由 updateDayNight() 每帧驱动，enhance模块**不得**重复设置曝光/雾/灯光（会被覆盖）。

### 5. NPC与交互（20-character.js / 25-exploration.js）
- 步行/骑行/飞行三种移动模式（WASD+触控摇杆）
- 诗笺收集系统（12枚，localStorage存档）
- 碰撞检测（colliderGrid/resolveCollisions/groundPatchGrid/waterRects/bridgeZones/landZones）
- 人物动画（updateNPCs）、画舫（updateBoats）、自然（updateNature）

### 6. 水面系统（07-water.js / 12-landmarks.js / enhance/water.js）
- waterMat Shader: time Uniform + 波纹(w1/w2/local) + 高光 + 昼夜联动（deep/shallow/sunColor/sunDir）
- 曲江池/龙池/太液池（原系统）+ 护城河三面（enhance/water.js，共享waterMat，注册waterRects）
- 木桥（bridgeZones）注册可通行

## 增强模块架构（按Owner分类）

### 生命周期（99-safe-init.js 统一调度器）
```
加载：boot.js → 8个enhance模块(IIFE注册) → 99-safe-init.js(接管pending+启动) → 30-main.js(buildWorld置GAME.ready)
执行：GAME.ready → __enhance.start() → 按优先级串行(间隔500ms) → GAME.fullyReady
```
- 禁止散装 setTimeout 固定延迟（旧机制已废弃）
- 禁止覆盖 buildWorld
- 禁止独立 requestAnimationFrame 循环（逐帧更新须包装 window.updateDayNight 钩子）

### Owner 职责表

| Owner | 优先级 | 职责 | 关键实现 |
|-------|--------|------|----------|
| visual-grade | 10 | 视觉自检 | window.__visualGrade 诊断对象 |
| sky | 20 | 天空自检 | 不重复创建天空 |
| performance | 30 | 性能 | TEX各向异性16x；sun.shadow ±140m/far 500（2048贴图≈7.3cm/texel） |
| landmarks | 40 | 地标精修 | 东西市牌坊(碰撞+飞行障碍)、两塔石碑(碰撞)；不重复角楼/垛口/台阶 |
| vegetation | 50 | 植被 | 花圃/蓝花/菊花/岸草（共享材质）、竹林(院内)；isWaterPoint过滤 |
| water | 60 | 水景 | 护城河南/东/西三面(共享waterMat、waterRects)、木桥(bridgeZones)、岸石芦苇鸭 |
| night-light | 70 | 夜景 | 宫殿塔寺明德门64灯笼；7组点光源(包装window.updateDayNight昼夜联动) |
| outside | 80 | 城外 | 4驿站/2水井/16里程碑(碰撞+飞行障碍)、100树(addTree) |

## 世界坐标权威

```js
CITY  = { x0: -450, x1: 450, z0: -380, z1: 380 };
WORLD = { x0: -780, x1: 780, z0: -660, z1: 660 };
城墙：addCityWalls 高10.5 厚6.5，四角角楼(addPavilion gold)，垛口(B.stone批量)
城门：明德门(0,380) 丹凤门(150,-380) 玄武门(0,-380) 春明门(450,55) 金光门(-450,55)
护城河：南侧 z=400 宽20m 两段(x:-450..-25 / 25..450，御道通道x∈[-25,25])；
        东侧 x=460 / 西侧 x=-460，z两段(-380..45 / 65..380，城门通道z∈[45,65])；木桥 x=±90 / z=±150
```

## 性能配置

| 指标 | 桌面 | 移动端 |
|---|---|---|
| 目标FPS | 60 | 30 |
| DPR上限 | 原系统（触控1.25/其他1.65） | 同左 |
| 阴影贴图 | 原系统2048 | 同左 |
| 阴影范围 | ±140m（跟随玩家，2048≈7.3cm/texel） | 同左 |
| 各向异性过滤 | 16x | 16x |

> 注意：enhance/performance.js 不修改DPR与阴影贴图尺寸（原系统已按设备设置），只设各向异性16x与阴影相机范围。

## CI工作流

- `.github/workflows/ci.yml`：push/PR 到 main 触发 `node --check src/*.js src/enhance/*.js` + boot.js 中 grep "src/enhance/" 校验加载清单

## 开发规范

详见 [agent.md](./agent.md)
