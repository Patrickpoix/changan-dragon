# 龙游长安 · 项目架构总览

> 唐长安城 开放世界游戏 · Three.js r160
> 更新：2026-10-27 v5

## 技术栈

- **引擎**：Three.js r160 正式版（页游，上限高、易扩展）
- **渲染**：WebGL2 + ACESFilmicToneMapping + PCFSoftShadowMap
- **后处理**：SAO环境光遮蔽 + Bloom辉光 + FXAA抗锯齿
- **优化**：Batch实例化（InstancedMesh+空间分区+LOD，幂等重建）+ 共享几何体 + 单一主循环
- **快速启动**：fastStart模式（开始界面低质量渲染，入城时upgradeToFullQuality升级）

## 目录结构

```
├── src/                    # 正式游戏引擎（主版，index.html 直接加载）
│   ├── 00-core.js          # 核心工具/共享材质库MAT/共享几何体UNIT_*/Batch(幂等重建)/碰撞
│   ├── 04-compatibility.js # 兼容性处理
│   ├── 05-rendering.js      # 渲染管线（GameRendering/fastStart/upgradeToFullQuality/DPR/质量档）
│   ├── 06-surfaces.js       # 地面/路面
│   ├── 07-water.js          # 水面Shader（waterMat/waterUniforms）
│   ├── 08-assets.js         # 资源加载（WorldAssets.populate非阻塞）
│   ├── 09-botany.js          # 植被（addTree/Batch+LOD）
│   ├── 10-world.js           # 108坊/城墙(角楼垛口门楼)/街景
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
│   ├── 28-weather.js        # 天气系统（晴/阴/雨，包装GameRendering.render）
│   ├── enhance/            # 按Owner分类的增强模块（统一调度器注册，GAME.ready后动态加载）
│   │   ├── performance.js     # 性能Owner（优先级30：各向异性16x+阴影±140m）
│   │   ├── landmarks.js       # 地标精修Owner（优先级40：东西市牌坊+两塔石碑）
│   │   ├── vegetation.js      # 植被Owner（优先级50：花圃/蓝花/菊花/岸草/竹林）
│   │   ├── water.js           # 水景Owner（优先级60：护城河三面+木桥+岸石芦苇鸭）
│   │   ├── night-light.js     # 夜景灯光Owner（优先级70：补充灯笼+点光源昼夜联动）
│   │   └── outside.js         # 城外环境Owner（优先级80：驿站/水井/里程碑/树林）
│   ├── 99-safe-init.js      # 统一生命周期调度器（__enhance.register + 完成后自动rebuild）
│   ├── 30-main.js          # 主循环/操控/镜头/昼夜(GRADE)/诗笺/存档/__changan.rebuild/async startGame
│   └── boot.js             # 启动加载器v5（所有script标签一次性创建，浏览器并行下载）
├── assets/                  # 共享素材库（材质/纹理/字体/GLB）
├── vendor/                  # Three r160 + 许可证
├── tools/                   # 素材准备/测试脚本
├── _qa/                     # CDP浏览器验收工具
├── .github/workflows/       # CI（node --check + boot.js清单验证 + 防新模块白名单 + index.html完整性）
├── README.md                # 项目总览
├── ARCHITECTURE.md          # 本文件
├── agent.md                 # 开发纪律（时间纪律/Owner分类/反臃肿规范）
├── HANDOVER.md              # 交接文档（最新commits/架构状态/下一步建议）
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
- 大雁塔 (216,283) 7层49m / 小雁塔 (-216,349) 13层41m
- 明德门 (0,380) 五门洞、朱雀大街 x=0（四座彩绘牌楼）、东市(174,-14)/西市(-258,-14)

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
- 诗笺收集系统（16枚，localStorage存档）
- 碰撞检测（colliderGrid/resolveCollisions/groundPatchGrid/waterRects/bridgeZones/landZones）
- 人物动画（updateNPCs）、画舫（updateBoats）、自然（updateNature）
- 景点16个 + 赏景运镜16组（FILM_SHOTS）

### 6. 水面系统（07-water.js / 12-landmarks.js / enhance/water.js）
- waterMat Shader: time Uniform + 波纹 + 高光 + 昼夜联动
- 曲江池（WaterSurface真平面反射）/ 龙池/太液池 + 护城河三面（共享waterMat，注册waterRects）
- 木桥（bridgeZones）注册可通行

## 增强模块架构（按Owner分类）

### 生命周期（99-safe-init.js 统一调度器 + 自动重建）
```
加载：boot.js v5（所有script标签一次性创建，浏览器并行下载）
      → 25小文件+2大素材全部就绪 → 30-main.js（buildWorld置GAME.ready）
执行：GAME.ready → __enhance.start() → 按优先级RAF分帧执行（每帧一个模块）
      → 全部完成 → __changan.rebuild() → GAME.fullyReady
```
- 禁止散装 setTimeout 固定延迟（旧机制已废弃）
- 禁止覆盖 buildWorld
- 禁止独立 requestAnimationFrame 循环（逐帧更新须包装 GameRendering.render 或 __nightLights 钩子）
- **批处理增量重建**：enhance模块在GAME.ready后追加的物体必须通过 __changan.rebuild() 重建实例网格

### Owner 职责表

| Owner | 优先级 | 职责 | 关键实现 |
|-------|--------|------|----------|
| performance | 30 | 性能 | TEX各向异性16x；sun.shadow ±140m/far 500 |
| landmarks | 40 | 地标精修 | 东西市牌坊、两塔石碑；不重复角楼/垛口/台阶 |
| vegetation | 50 | 植被 | 花圃/蓝花/菊花/岸草（共享材质）、竹林(院内)；isWaterPoint过滤 |
| water | 60 | 水景 | 护城河三面(共享waterMat、waterRects)、木桥6座(bridgeZones)、岸石芦苇鸭 |
| night-light | 70 | 夜景 | 64灯笼；7组点光源(登记__nightLights，主循环updateDayNight尾部驱动) |
| outside | 80 | 城外 | 4驿站/2水井/16里程碑(碰撞+飞行障碍)、100树(addTree→rebuild后可见) |

## 世界坐标权威

```js
CITY  = { x0: -450, x1: 450, z0: -380, z1: 380 };
WORLD = { x0: -780, x1: 780, z0: -660, z1: 660 };
城墙：addCityWalls 高10.5 厚6.5，四角角楼(addPavilion gold)，垛口(B.stone批量)
城门：明德门(0,380) 丹凤门(150,-380) 玄武门(0,-380) 春明门(450,55) 金光门(-450,55)
护城河：南侧 z=400 宽20m；东侧 x=465 / 西侧 x=-465
```

## 性能配置

| 指标 | 桌面 | 移动端 |
|---|---|---|
| 目标FPS | 60 | 30 |
| DPR上限 | 1.65 | 1.25 |
| 阴影贴图 | 2048 | 2048 |
| 阴影范围 | ±140m（跟随玩家） | 同左 |
| 各向异性过滤 | 16x | 16x |

### 快速启动策略（fastStart）
1. **开始界面**：跳过PMREM环境贴图和SAO/Bloom/FXAA后处理，低质量快速渲染
2. **入城时**：startGame()异步化，先禁用按钮显示"正在进入长安城…"，await nextFrame()让浏览器绘制加载状态
3. **升级质量**：upgradeToFullQuality()创建PMREM环境贴图+后处理管线，renderer.compile()编译所有材质
4. **首屏并行**：boot.js v5一次性创建所有script标签，浏览器并行下载25小文件+2大素材
5. **preload预热**：index.html添加<link rel=preload>预热three.js+渲染插件+boot.js+16.6MB大素材
6. **非阻塞素材**：WorldAssets.populate()不等待外部GLB加载就先渲染开始界面
7. **enhance延迟加载**：6个增强模块在GAME.ready后动态注入，不占首屏请求

## 正式构建

- **主版（权威）**：index.html + src/ + vendor/ + assets/，静态文件直接部署，无构建步骤

## CI工作流

- `.github/workflows/ci.yml`：push/PR 到 main 触发：
  1. JS语法检查（所有src/*.js和enhance/*.js通过node --check）
  2. boot.js清单验证（引用文件必须存在）
  3. orphan检测（enhance文件必须被30-main.js引用）
  4. index.html完整性（必须以</html>结尾，大小>40KB）
  5. 防新模块白名单（src/下数字开头文件必须在已知白名单内）
  6. 禁用变量名检测（不得出现sunLight/ambientLight）

## 开发规范

详见 [agent.md](./agent.md)
