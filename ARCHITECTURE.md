# 龙游长安 · 项目架构总览

> 唐长安城 开放世界游戏 · Three.js r160
> 更新：2026-10-27

## 技术栈

- **引擎**：Three.js r160 正式版（页游，上限高、易扩展）
- **渲染**：WebGL2 + ACESFilmicToneMapping + PCFSoftShadowMap
- **后处理**：SAO环境光遮蔽 + Bloom辉光 + FXAA抗锯齿
- **优化**：Batch实例化（InstancedMesh+空间分区+LOD，幂等重建）+ 共享几何体 + 单一主循环

## 目录结构

```
├── src/                    # 正式游戏引擎（主版，index.html 直接加载）
│   ├── 00-core.js          # 核心工具/共享材质库MAT/共享几何体UNIT_*/Batch(幂等重建)/碰撞
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
│   ├── 25b-film-shots-extra.js # 赏景运镜追加8组（16景点）
│   ├── 26-extra-places.js   # 景点扩展4个
│   ├── 26b-extra-places-2.js# 景点扩展第二批4个（共16个景点）
│   ├── 27-session.js        # 会话/存档
│   ├── 27b-extra-poems.js   # 追加诗笺（IIFE立即执行+makePoemScroll）
│   ├── 27c-extra-poems-2.js # 追加诗笺第二批（曲江池/兴庆宫岸线落点）
│   ├── 28-weather.js        # 天气系统（晴/阴/雨，GRADE相对因子）
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
│   ├── 99-safe-init.js      # 统一生命周期调度器（__enhance.register + 完成后自动rebuild）
│   ├── 30-main.js          # 主循环/操控/镜头/昼夜(GRADE)/诗笺/存档/__changan.rebuild
│   └── boot.js             # 启动加载器（enhance → 99-safe-init → 30-main）
├── assets/                  # 共享素材库（材质/纹理/字体/GLB）
├── vendor/                  # Three r160 + 许可证
├── tools/                   # 素材准备/测试脚本（build_standalone.py SOURCES与boot.js同步）
├── _qa/                     # CDP浏览器验收工具
├── dist/                    # 单文件兼容版（可选；重建需本地运行 tools/build_standalone.py）
├── .github/workflows/       # CI（node --check 语法校验）
├── README.md                # 项目总览
├── ARCHITECTURE.md          # 本文件
├── AGENTS.md                # 用户约束/交接必读
├── agent.md                 # 开发纪律
└── docs/                    # 设计/素材/索引（DOCS_INDEX.md）
```

## 世界尺度设计（统一单位系统）

> 2026-10-27 定稿：**1 world unit ≈ 2 米**（艺术化缩尺，相对真实长安水平缩约 1/3）

| 对象 | 真实长安 | 游戏世界 | 说明 |
|------|----------|----------|------|
| 全城 | 东西9721m×南北8651m（84km²） | WORLD ±780/±660（≈3.1km×2.6km） | 全境含城外田畴/驿站/河流 |
| 核心城区 | 同上 | CITY ±450/±380（≈1.8km×1.5km） | 城墙内游玩核心 |
| 坊 | 约500-600m见方 | 70×54 单位 ≈ 140×108m | 保留坊市格局感 |
| 朱雀大街 | 宽155m | 宽26 单位 ≈ 52m | 视觉仍开阔 |
| 护城河 | — | 宽20 单位 ≈ 40m | 三面环绕 |

速度（游戏化）：步行 4.5 / 骑行 14.2 / 飞行 21 单位/秒；横穿 CITY 骑行约 63 秒。
依据：雾距 600-690 单位内 LOD 生效、55° 追尾镜头 8.4 单位距离、飞行/骑行体验节奏。
所有坐标/尺寸/速度统一使用该单位系统。

## 核心系统

### 1. 共享材质库（00-core.js）
- MAT: plaster/wood/red/stone/roof/roofGlazed/lantern/lanternGlow/gold/dark/leaf/trunk/blossom/window等
- TEX: stone/roof/wood/grass/dirt/lattice/bark等Canvas生成纹理
- 共享几何体: UNIT_BOX/UNIT_CYL/UNIT_SPHERE/UNIT_CONE/UNIT_PLANE/ROOF_UNIT/ROOF_SMALL
- Batch类: InstancedMesh + 空间分区 + LOD；**幂等重建**（首次构建后仍可继续add，
  再次build先移除旧实例组再按完整条目重建）；`Object.values(B).forEach(build)` 在buildWorld末尾统一构建

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
- 诗笺收集系统（12+4=16枚，localStorage存档，loadCollectedPoems按运行时poems.length动态校验）
- 碰撞检测（colliderGrid/resolveCollisions/groundPatchGrid/waterRects/bridgeZones/landZones）
- 人物动画（updateNPCs）、画舫（updateBoats）、自然（updateNature）
- 景点16个（25-exploration 8 + 26/26b 追加8）+ 赏景运镜16组（FILM_SHOTS 8 + 25b 追加8）

### 6. 水面系统（07-water.js / 12-landmarks.js / enhance/water.js）
- waterMat Shader: time Uniform + 波纹(w1/w2/local) + 高光 + 昼夜联动（deep/shallow/sunColor/sunDir）
- 曲江池（WaterSurface真平面反射，detailed/fallback档位）/ 龙池/太液池（原系统）+ 护城河三面（enhance/water.js，共享waterMat，注册waterRects）
- 木桥（bridgeZones）注册可通行

## 增强模块架构（按Owner分类）

### 生命周期（99-safe-init.js 统一调度器 + 自动重建）
```
加载：boot.js → 8个enhance模块(IIFE注册) → 99-safe-init.js(接管pending+启动) → 30-main.js(buildWorld置GAME.ready)
执行：GAME.ready → __enhance.start() → 按优先级串行(间隔500ms) → 全部完成 → __changan.rebuild()
      （重建全部Batch实例 + 刷新Explore.buildRoofGrid飞行包络）→ GAME.fullyReady
```
- 禁止散装 setTimeout 固定延迟（旧机制已废弃）
- 禁止覆盖 buildWorld
- 禁止独立 requestAnimationFrame 循环（逐帧更新须包装 window.updateDayNight 钩子）
- **批处理增量重建**：enhance模块在GAME.ready后追加的物体（如outside 100棵树）必须
  通过 __changan.rebuild() 重建实例网格，保证“已登记即已渲染、已登记即已阻挡”

### Owner 职责表

| Owner | 优先级 | 职责 | 关键实现 |
|-------|--------|------|----------|
| visual-grade | 10 | 视觉自检 | window.__visualGrade 诊断对象 |
| sky | 20 | 天空自检 | 不重复创建天空 |
| performance | 30 | 性能 | TEX各向异性16x；sun.shadow ±140m/far 500（2048贴图≈7.3cm/texel） |
| landmarks | 40 | 地标精修 | 东西市牌坊(碰撞+飞行障碍)、两塔石碑(碰撞)；不重复角楼/垛口/台阶 |
| vegetation | 50 | 植被 | 花圃/蓝花/菊花/岸草（共享材质）、竹林(院内)；isWaterPoint过滤 |
| water | 60 | 水景 | 护城河南/东/西三面(共享waterMat、waterRects)、木桥6座(bridgeZones)、岸石芦苇鸭 |
| night-light | 70 | 夜景 | 宫殿塔寺明德门64灯笼；7组点光源(包装window.updateDayNight昼夜联动) |
| outside | 80 | 城外 | 4驿站/2水井/16里程碑(碰撞+飞行障碍)、100树(addTree→rebuild后可见) |

## 世界坐标权威

```js
CITY  = { x0: -450, x1: 450, z0: -380, z1: 380 };
WORLD = { x0: -780, x1: 780, z0: -660, z1: 660 };
城墙：addCityWalls 高10.5 厚6.5，四角角楼(addPavilion gold)，垛口(B.stone批量)
城门：明德门(0,380) 丹凤门(150,-380) 玄武门(0,-380) 春明门(450,55) 金光门(-450,55)
护城河：南侧 z=400 宽20m 两段(x:-450..-25 / 25..450，御道通道x∈[-25,25])；
        东侧 x=465 / 西侧 x=-465，z两段(-380..45 / 65..380，城门通道z∈[45,65])；
        木桥6座：南2座 x=±90 沿z跨河，东西4座 z=±150 沿x跨河（注册bridgeZones，可通行）
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

## 正式构建

- **主版（权威）**：index.html + src/ + vendor/ + assets/，静态文件直接部署，无构建步骤
- **单文件兼容版（可选）**：dist/changan-dragon.html，由 `python3 tools/build_standalone.py` 生成；
  SOURCES 清单与 src/boot.js 严格同步（2026-10-27 补全全部模块）；需在本地克隆环境运行，结果推回 main

## CI工作流

- `.github/workflows/ci.yml`：push/PR 到 main 触发 `node --check src/*.js src/enhance/*.js` + boot.js 中 grep "src/enhance/" 校验加载清单

## 开发规范

详见 [agent.md](./agent.md)
