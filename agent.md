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
- 每次开始工作前必须校准北京时间（Asia/Shanghai, UTC+8），用 get_current_time
- 用户要求的停止时间前绝不允许中途停下汇报
- 想停下来时先校准时间，时间没到就继续做；校准结果写入回复首句
- 用户说"继续/禁止停下来/全部完成"时必须持续工作直到截止时间或用户叫停
- 每轮回复首句必须给出校准后的北京时间

### 2. 模块组织原则
- **按 Owner 分类，不按功能碎片分文件**
- 禁止写大量细小的单功能模块（如210-300号共90个、121-140号共20个）
- 每个模块应该是一个完整的系统，由一个owner负责
- 模块命名应该是系统级别的，不是细节级别的
- 新增功能优先在现有enhance模块内扩展，不轻易新建模块
- **能整合就不拆分，能复用就不新建**
- 121-140号模块已按审查意见整体批删，不得再生成此类编号模块
- **新增 src/*.js 编号文件前必须三思**：现有编号体系（00-30）是核心引擎层，
  新功能应放入 src/enhance/ 下已有owner文件，而非新增 31/32/33 号文件

### 3. 冗余模块与文档处理原则
- 删除冗余文件前，先确认它确实没被boot.js加载
- 不要上来就删，可以先把有价值的内容整合进现有模块，再删原文件
- 删除前先看文件内容，有价值的逻辑要迁移，不是直接扔掉
- docs目录的版本文档分批删，核心设计文档保留
- **GitHub 删除纪律**：delete_file 高并发会因基于同一父 commit 产生假成功或假失败
  ① 批量删除每批 ≤20 个并行；② 删除后必须 get_file_contents 拉目录复核；
  ③ 发现残留就串行补删；④ 失败先探存在性再决定重试

### 4. 禁止硬编码
- 所有坐标、尺寸、数量等参数必须从配置读取
- 地标坐标必须引用 src/12-landmarks.js 的权威数据
- 全局变量必须使用原引擎的正确名称（sun/ambient/hemi/rim/MAT/scene/renderer等）
- 禁止使用错误变量名：sunLight（应为sun）、ambientLight（应为ambient）

### 5. 架构原则
- 不创建与原系统平行的重复系统
- 复用已有能力（材质库MAT/几何体UNIT_*/NPC/水面Shader/昼夜/音频/交互）
- 新增功能必须建立在原有引擎之上
- 不要通过增加更多模块来掩盖架构问题
- 原GLB + 共享材质源，不重复存储纹理
- **先问：原系统已经有了吗？有了就不要重做**

### 6. 世界坐标权威
- **CITY = { x0: -450, x1: 450, z0: -380, z1: 380 }**（核心城市边界）
- **WORLD = { x0: -780, x1: 780, z0: -660, z1: 660 }**（世界范围）
- 城墙角楼在(±450, ±380)，由原系统addCityWalls创建
- **角楼/城墙边界必须与CITY一致（±380），不得出现 z=±450 之类的越界值**

### 6b. 世界尺度设计
- **1 world unit ≈ 2 米**：艺术化缩尺，相对真实长安水平缩约 1/3
- 坊 70×54 单位 ≈ 140×108m；朱雀大街宽 26 单位 ≈ 52m；护城河宽 20 单位 ≈ 40m
- 速度：步行4.5 / 骑行14.2 / 飞行21 单位/秒

### 7. 初始化原则
- **统一生命周期调度器**：src/99-safe-init.js 提供 window.__enhance.register(owner, fn, priority)
- GAME.ready 后 requestAnimationFrame 分帧执行（每帧一个模块）
- 全部完成后自动调用 __changan.rebuild() 并置 GAME.fullyReady
- 禁止散装 setTimeout 固定延迟；禁止覆盖buildWorld
- 需要逐帧更新的内容必须接入主循环：包装 GameRendering.render(dt)
  或 updateDayNight 尾部 __nightLights 钩子；禁止包装 window.updateDayNight

### 7b. 批处理增量重建原则
- Batch.build() 幂等重建：首次构建后仍可继续 add
- 全局重建入口：window.__changan.rebuild()
- 任何登记了碰撞/飞行障碍的物体，必须真实渲染

### 8. 光影与渲染原则
- 不要直接修改sun/ambient/hemi/rim的颜色和强度，会被updateDayNight()主循环覆盖
- 阴影范围：±140m（已验证；过大降低阴影精度）
- 天空/天气/昼夜：统一在 updateDayNight() 主循环管理，不建第二套天空/灯光控制器

---

## 9. 启动性能优化原则（2026-10-27 v5 定稿）

### 9a. 首屏加载策略
- **boot.js v5**：所有25个小文件script标签一次性创建，浏览器并行下载、按文档顺序执行
  （不再串行创建一个onload再加载下一个）
- 大素材（scene-materials.js 7MB + runtime-models.js 9.58MB）与小引擎文件同时开始下载
- **index.html preload标签**：预热 vendor/three.min.js、rendering-addons.js、boot.js、
  **scene-materials.js、runtime-models.js**（16.6MB大素材在HTML解析阶段就开始下载）
- enhance 模块不在 boot 阶段加载，GAME.ready 后由 30-main.js 动态 script 标签加载
- WorldAssets.populate() 非阻塞：不等待外部素材完成就先渲染开始界面
- renderer.compile() 移到 startGame()：开始界面只做低质量快速渲染
- GameRendering fastStart 模式：跳过 makeEnvironment() 和 makePipeline()，
  startGame() 时调用 upgradeToFullQuality() 升级完整质量
- startGame() 为 async：先禁用按钮显示"正在进入长安城…"，await nextFrame()
  让浏览器绘制加载状态，再执行 upgradeToFullQuality()+renderer.compile()

### 9b. 性能优化纪律
- 先测量，再优化；不要把默认功能重新设置一遍就宣称完成优化
- 不得未经对比修改已有性能策略（如DPR上限、阴影范围）
- 新增建筑优先纳入批处理、实例化、LOD和距离裁剪体系
- 不要以提高分辨率、扩大阴影范围或增加光源数量作为画质提升的唯一手段
- 高DPR设备单独测量，不得一刀切提高DPR上限

### 9c. 资源共享原则
- 绝大部分内容（实际建模、PBR材质、纹理）使用共享素材包，不重复存储
- 原GLB + 共享材质源方式，不上传两份各约13MB的重复贴图模型
- 新增纹理必须检查是否已有同款，优先复用 MAT 材质库

---

## 10. 推送事故教训（2026-10-27 index.html 截断事故）

### 事故经过
- create_or_update_file 推送 index.html（52KB）时，content 被静默截断为 1444 字节
- GitHub 不报错直接接受截断后的文件，导致线上白屏崩溃
- 修复：从本地备份找到完整 52791 字节版本，重新推送成功

### 教训与规则
- **推送大文件（>10KB）后必须立即回读验证字节数**：
  推送后用 get_file_contents 拉取线上版本，对比返回的 size 字段与预期一致
- **推送前在本地验证 content 长度**：确保 content 变量完整，不是字符串截断
- **关键文件（index.html、boot.js）推送后必须检查文件结尾**：
  index.html 必须以 `</html>` 结尾；boot.js 必须完整闭合
- **事故发生后不要慌**：从本地工作目录备份恢复，不要重新生成完整文件

---

## 11. 模块 Owner 映射表（权威）

### 核心引擎层（src/*.js，boot.js 并行加载）
| 文件 | Owner | 职责 |
|------|-------|------|
| 00-core.js | 核心状态 | GAME/CITY/WORLD常量、MAT材质库、UNIT_*几何体、全局状态 |
| 04-compatibility.js | 兼容性 | 旧浏览器API兜底 |
| 05-rendering.js | 渲染器 | WebGL渲染、fastStart/upgradeToFullQuality、后处理管线 |
| 06-surfaces.js | 地面 | 路面、广场、台阶地面生成 |
| 07-water.js | 水面 | 曲江池/龙池水面Shader、波纹/高光/时间Uniform |
| 08-assets.js | 资源加载 | GLB模型加载、WorldAssets.populate()非阻塞素材填充 |
| 09-botany.js | 植被 | 行道树、荷花、灌木生成与实例化 |
| 10-world.js | 世界构建 | 108坊、城墙、角楼、垛口、街道、批处理Batch系统 |
| 11-shorelines.js | 岸线 | 河岸、湖岸、护城河边缘 |
| 12-landmarks.js | 地标 | 大明宫/太极殿/兴庆宫/大雁塔/小雁塔/曲江池/东西市权威坐标与建筑 |
| 20-character.js | 角色 | NPC生成、玩家角色、小青龙、动画更新 |
| 25-exploration.js | 探索 | 移动模式(步行/骑行/飞行)、碰撞、寻路、飞行障碍 |
| 25b-film-shots-extra.js | 电影镜头 | 额外机位定义 |
| 26-extra-places.js | 景点 | 额外景点数据 |
| 26b-extra-places-2.js | 景点 | 额外景点数据（续） |
| 27-session.js | 会话 | 存档、诗笺收集、进度持久化 |
| 27b-extra-poems.js | 诗笺 | 额外诗笺数据 |
| 27c-extra-poems-2.js | 诗笺 | 额外诗笺数据（续） |
| 28-weather.js | 天气 | 晴/阴/雨切换、雨滴粒子、包装GameRendering.render做天气微调 |
| 30-main.js | 主入口 | buildWorld()、主循环animate()、startGame()、GAME.ready/fullyReady |
| 99-safe-init.js | 生命周期 | __enhance.register()分帧调度、__changan.rebuild() |
| boot.js | 启动加载 | 并行加载清单（25小文件+2大素材），enhance模块动态加载入口 |

### 增强模块层（src/enhance/*.js，GAME.ready后动态加载）
| 文件 | Owner | 职责 |
|------|-------|------|
| landmarks.js | 地标精修 | 原有地标建筑细节增强（斗拱/鸱吻/彩绘） |
| night-light.js | 夜景灯光 | 灯笼照明与昼夜联动、__nightLights钩子 |
| outside.js | 城外环境 | 城外树木、远山、护城河外侧 |
| performance.js | 性能诊断 | FPS统计、DrawCall监控、质量档位适配 |
| vegetation.js | 植被增强 | 行道树补植、季节变化 |
| water.js | 水面增强 | 护城河、小河、喷泉（注意：必须水平放置，UNIT_PLANE需旋转-90°X） |

### 新增功能归属规则
- 建筑细节 → enhance/landmarks.js
- 灯光/夜景 → enhance/night-light.js
- 植被 → enhance/vegetation.js
- 水面 → enhance/water.js（或修改07-water.js）
- 城外 → enhance/outside.js
- 性能 → enhance/performance.js
- 核心渲染 → 05-rendering.js
- 世界/城墙/坊 → 10-world.js
- 地标坐标 → 12-landmarks.js
- 角色/NPC → 20-character.js
- 移动/碰撞 → 25-exploration.js
- 天气 → 28-weather.js
- **不要新建 src/141-*.js 或 src/enhance/新文件，除非以上所有owner都不覆盖**

---

## 12. CI 门禁规则（防臃肿）

CI 每次 push 自动执行以下检查：
1. **JS语法检查**：所有 src/*.js 和 src/enhance/*.js 通过 node --check
2. **boot.js清单验证**：boot.js 引用的文件必须存在（防止404断载）
3. **orphan检测**：enhance目录中的文件必须被动态加载清单引用
4. **index.html完整性**：必须以 `</html>` 结尾且 >40KB（防止截断事故）
5. **禁止新增编号模块**：src/ 下数字开头文件必须在已知白名单内（21个核心文件）
6. **硬编码坐标检测**：enhance模块中不得出现明显硬编码的地标坐标（应引用12-landmarks.js）
7. **禁用变量名检测**：不得出现 sunLight、ambientLight 等错误变量名

违反以上规则 CI 失败，不得合并到 main。
