# Agent 开发规范

## 核心思想（最重要）

### 为什么要这样写规范？
因为之前的开发方式出了严重问题：
- 写了90个细小模块（210-300号），每个模块只做一点点小事
- 写了1000+份文档，大部分是版本文档和重复记录
- 大量重复创建已有系统（水面、树木、建筑、灯光、角楼、垛口、台阶各做了第二遍）
- 模块之间互相冲突，初始化失效，坐标错乱
- 结果就是代码看起来很多，但实际能运行的没多少

**所以现在的原则是：少即是多。**
一个系统一个模块，一个模块一个Owner，所有素材共享，不重复造轮子。

---

## 核心原则

### 1. 时间纪律（用户强制要求）
- 每次开始工作前必须校准北京时间（Asia/Shanghai, UTC+8）
- 用户要求的停止时间前绝不允许中途停下汇报
- 想停下来时先校准时间，时间没到就继续做
- 用户说"继续/禁止停下来/全部完成"时必须持续工作直到截止时间或用户叫停

### 2. 模块组织原则
- **按 Owner 分类，不按功能碎片分文件**
- 禁止写大量细小的单功能模块
- 每个模块应该是一个完整的系统，由一个owner负责
- 新增功能优先在现有enhance模块内扩展，不轻易新建模块
- **能整合就不拆分，能复用就不新建**
- **新增 src/*.js 编号文件前必须三思**：新功能应放入 src/enhance/ 下已有owner文件

### 3. 冗余模块与文档处理原则
- 删除冗余文件前，先确认它确实没被boot.js加载
- 不要上来就删，可以先把有价值的内容整合进现有模块，再删原文件
- **GitHub 删除纪律**：批量删除每批 ≤20 个并行；删除后必须拉目录复核

### 4. 禁止硬编码
- 所有坐标、尺寸、数量等参数必须从配置读取
- 地标坐标必须引用 src/12-landmarks.js 的权威数据
- 全局变量必须使用原引擎的正确名称（sun/ambient/hemi/rim/MAT/scene/renderer等）
- 禁止使用错误变量名：sunLight（应为sun）、ambientLight（应为ambient）

### 5. 架构原则
- 不创建与原系统平行的重复系统
- 复用已有能力（材质库MAT/几何体UNIT_*/NPC/水面Shader/昼夜/音频/交互）
- **先问：原系统已经有了吗？有了就不要重做**

### 6. 世界坐标权威
- **CITY = { x0: -450, x1: 450, z0: -380, z1: 380 }**
- **WORLD = { x0: -780, x1: 780, z0: -660, z1: 660 }**
- 城墙角楼在(±450, ±380)

### 6b. 世界尺度设计
- **1 world unit ≈ 2 米**：艺术化缩尺
- 速度：步行4.5 / 骑行14.2 / 飞行21 单位/秒

### 7. 初始化原则
- **统一生命周期调度器**：src/99-safe-init.js 提供 window.__enhance.register(owner, fn, priority)
- GAME.ready 后 requestAnimationFrame 分帧执行
- 禁止散装 setTimeout 固定延迟；禁止覆盖buildWorld
- 需要逐帧更新的内容必须接入主循环，不建第二套RAF

### 7b. 批处理增量重建原则
- Batch.build() 幂等重建；全局重建入口 window.__changan.rebuild()

### 8. 光影与渲染原则
- 不要直接修改sun/ambient/hemi/rim的颜色和强度，会被updateDayNight()主循环覆盖
- 阴影范围：±140m
- 天空/天气/昼夜：统一在 updateDayNight() 主循环管理

---

## 9. 启动性能优化原则（2026-10-27 v8.5 定稿）

### 9a. 首屏加载策略（关键路径）
**关键路径 = 25个小文件(~1MB) → 30-main.js → buildWorld() → 开始界面**

- **boot.js v8.5**：
  - 25个小文件script标签一次性创建，浏览器并行下载、按文档顺序执行
  - **scene-materials.js(7MB) 和 runtime-models.js(9.58MB) 全部移出关键路径**
  - 两个大文件后台并行延迟加载，不阻塞开始界面
  - 关键路径下载从16.6MB降到~1MB
- **大文件加载后自动补绑PBR**：
  - scene-materials.js onload → GameRendering.refreshEnvironment() (HDRI替换fallback)
  - → SurfaceLibrary.architecture() (建筑屋顶/墙面/灰泥法线+粗糙度贴图)
  - → SurfaceLibrary.refreshClothMaterials() (衣物/布料法线贴图)
  - → requestAnimationFrame(renderer.compile()) 重新编译着色器
  - runtime-models.js onload → WorldAssets.reset() + populate() 自动重试
- **竞态处理**：大文件先于30-main.js到达时设 `window.__DEFERRED_ASSETS_READY` 计数器，Promise.all后补发populate()
- **Service Worker**：sw.js缓存changan-v1，HTML网络优先+其他资源缓存优先后台更新
- enhance 模块不在 boot 阶段加载，GAME.ready 后动态 script 标签加载

### 9b. 进入游戏优化（startGame）
- **GameRendering fastStart模式**：开始界面跳过PMREM和后处理管线
- **05-rendering v5 prewarm()**：GAME.ready后requestIdleCallback同时做三件事：
  1. PMREM环境贴图生成（RoomEnvironment fallback，后续HDRI替换）
  2. EffectComposer后处理管线创建（SAO+Bloom+FXAA）
  3. renderer.compile(scene, camera) 材质预编译
- 利用用户看开始界面的几秒，进入游戏时upgradeToFullQuality()几乎零等待
- startGame()为async：先显示"正在进入长安城…"，await nextFrame()让浏览器绘制

### 9c. PBR材质延迟绑定模式
- buildWorld()时SCENE_MATERIALS未加载，SurfaceLibrary.architecture()直接return
- 建筑材质（MAT.roof/MAT.plaster等）在buildWorld时创建，normalMap为null
- scene-materials.js加载后补绑：设置normalMap/roughnessMap + needsUpdate
- 衣物材质通过clothMaterials数组追踪，refreshClothMaterials()统一补绑
- 补绑后必须requestAnimationFrame重新compile，避免进入游戏时卡顿

### 9d. 性能优化纪律
- 先测量，再优化；不要把默认功能重新设置一遍就宣称完成优化
- 新增建筑优先纳入批处理、实例化、LOD和距离裁剪体系
- 不得未经对比修改已有性能策略（DPR上限、阴影范围）

### 9e. 资源共享原则
- 绝大部分内容使用共享素材包，不重复存储
- 原GLB + 共享材质源方式，不上传重复贴图
- 新增纹理必须检查是否已有同款，优先复用 MAT 材质库

---

## 10. 推送事故教训

- **推送大文件（>10KB）后必须立即回读验证字节数**
- **关键文件推送后必须检查文件结尾**
- create_or_update_file推送大文件时content可能被静默截断，GitHub不报错
- 推送前在本地验证content长度

---

## 11. 模块 Owner 映射表（权威）

### 核心引擎层（src/*.js，boot.js 并行加载）
| 文件 | Owner | 职责 |
|------|-------|------|
| 00-core.js | 核心状态 | GAME/CITY/WORLD常量、MAT材质库、UNIT_*几何体 |
| 04-compatibility.js | 兼容性 | 旧浏览器API兜底 |
| 05-rendering.js | 渲染器 | WebGL渲染、fastStart/prewarm/upgradeToFullQuality、后处理管线 |
| 06-surfaces.js | 地面材质 | 路面、广场、PBR材质库、衣物材质追踪 |
| 07-water.js | 水面 | 曲江池/龙池水面Shader |
| 08-assets.js | 资源加载 | GLB模型加载、WorldAssets.populate()非阻塞、reset()重试 |
| 09-botany.js | 植被 | 行道树、荷花、灌木生成与实例化 |
| 10-world.js | 世界构建 | 108坊、城墙、角楼、垛口、街道、Batch批处理系统 |
| 11-shorelines.js | 岸线 | 河岸、湖岸 |
| 12-landmarks.js | 地标 | 大明宫/太极殿/兴庆宫/大雁塔/小雁塔/曲江池权威坐标 |
| 20-character.js | 角色 | NPC、玩家角色、小青龙、动画更新 |
| 25-exploration.js | 探索 | 移动模式、碰撞、寻路、飞行障碍 |
| 25b-film-shots-extra.js | 电影镜头 | 额外机位定义 |
| 26-extra-places.js | 景点 | 额外景点数据 |
| 26b-extra-places-2.js | 景点 | 额外景点数据（续） |
| 27-session.js | 会话 | 存档、诗笺收集 |
| 27b-extra-poems.js | 诗笺 | 额外诗笺数据 |
| 27c-extra-poems-2.js | 诗笺 | 额外诗笺数据（续） |
| 28-weather.js | 天气 | 晴/阴/雨、包装GameRendering.render |
| 30-main.js | 主入口 | buildWorld()、主循环、startGame()、GAME.ready |
| 99-safe-init.js | 生命周期 | __enhance.register()分帧调度 |
| boot.js | 启动加载 | 并行加载清单、大文件延迟加载、PBR补绑 |

### 增强模块层（src/enhance/*.js，GAME.ready后动态加载）
| 文件 | Owner | 职责 |
|------|-------|------|
| landmarks.js | 地标精修 | 原有地标建筑细节增强 |
| night-light.js | 夜景灯光 | 灯笼照明与昼夜联动 |
| outside.js | 城外环境 | 城外树木、远山 |
| performance.js | 性能诊断 | FPS统计、DrawCall监控 |
| vegetation.js | 植被增强 | 行道树补植 |
| water.js | 水面增强 | 护城河、小河 |

### 新增功能归属规则
- 建筑细节 → enhance/landmarks.js
- 灯光/夜景 → enhance/night-light.js
- 植被 → enhance/vegetation.js
- 水面 → enhance/water.js
- 城外 → enhance/outside.js
- 性能 → enhance/performance.js
- 核心渲染 → 05-rendering.js
- 世界/城墙/坊 → 10-world.js
- 地标坐标 → 12-landmarks.js
- 角色/NPC → 20-character.js
- 移动/碰撞 → 25-exploration.js
- 天气 → 28-weather.js
- **不要新建 src/新编号文件或 enhance/新文件，除非以上所有owner都不覆盖**

---

## 12. CI 门禁规则

CI 每次 push 自动执行：
1. JS语法检查：所有 src/*.js 通过 node --check
2. boot.js清单验证：引用文件必须存在
3. index.html完整性：必须以 `</html>` 结尾且 >40KB
4. 禁止新增编号模块：src/下数字开头文件必须在白名单内
5. 禁用变量名检测：不得出现 sunLight、ambientLight

违反规则 CI 失败。