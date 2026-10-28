# 龙游长安：后续会话必读

## 立即上手

1. 读 [agent.md](agent.md) — 开发规范、模块Owner映射、性能优化原则、CI门禁
2. 读 [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md) — 系统架构
3. 读 [docs/QA.md](docs/QA.md) — 浏览器验收流程
4. 读仓库根目录的 ARCHITECTURE.md 和 HANDOVER.md（如存在）

## 项目定位

《龙游长安》是以盛唐长安城为原型的3D开放世界网页游戏（Three.js），
融合国风漫剧/电影画风与仙侠魔幻奇观。

## 核心开发原则（2026-10-28 紧急更新）

### ⚠️ 最高优先级：停止创建新模块，集中精力精修建模

**用户明确要求：**
- ❌ **禁止继续创建新的enhance模块**（dungeon/imperial-exam/sect/festival等已创建的也不再扩展）
- ❌ **禁止用基础几何体（Box/Cone/Sphere）拼接冒充高品质美术**
- ✅ **集中精力精修核心地标建模**：大明宫含元殿、大雁塔、朱雀大街、明德门
- ✅ **提升PBR材质质量**：法线/粗糙度/AO贴图，真实唐式木构细节
- ✅ **整合现有模块**：把零散功能整合到对应Owner，不新增细碎模块
- ✅ **优先下载真实GLB高精模型**，而不是程序化生成

### 其他原则
1. **质量优先，数量其次** — 不堆砌模块数量，专注提升现有系统质量
2. **统一Owner，禁止重复** — 每个系统只有一个权威实现，新功能扩展到已有Owner
3. **真实美术，拒绝几何体** — 不允许用Box/Cone/Sphere拼接冒充高品质美术
4. **架构稳定，禁止并行系统** — 不创建与原引擎平行的第二套系统
5. **可运行，可验证** — 每个改动必须有浏览器验证证据，不能只靠静态检查

## 用户已确定的约束

- **桌面高质量优先**：16英寸笔记本Chrome为主目标，不设10GB容量上限
- **免费素材**：只使用CC0/CC BY/开源免费素材，保留许可证记录
- **不堆砌基础几何体**：优先复用/获取成熟高精PBR模型，不用cube/cone冒充建筑
- **共享素材不重复**：GLB+共享材质源，不上传重复贴图
- **按Owner分类**：一个系统一个模块，禁止写大量细碎单功能模块
- **推main前在独立分支测试**，验收通过后合并
- **真实截图和性能数据**作为验收依据，不凭控制台日志宣布完成

## 当前技术栈

- Three.js（WebGL），原生JS无构建步骤
- 核心src文件 + enhance模块，全部由boot.js动态加载
- 关键路径：小文件 → buildWorld() → 开始界面
- 后台延迟：scene-materials.js + runtime-models.js

## 高精模型生成器（assets/models/）

| 文件 | 功能 | 导出对象 |
|------|------|----------|
| hq-architecture.js | 高质量唐式建筑（ExtrudeGeometry/LatheGeometry） | HQArch |
| pro-roof-builder.js | 专业屋顶生成器（举折剖面、翼角起翘） | ProRoof |
| tang-architecture-pro.js | 唐式建筑精修v2.0（斗拱、格扇、彩画） | TangArchPro |
| fantasy-wonder-builder.js | 仙侠奇观建筑（浮空岛、摘星楼、云海） | FantasyWonderBuilder |
| tang-character-builder.js | 唐代人物（官员、仕女、百姓） | TangCharacterBuilder |
| tang-nature-builder.js | 唐代植被（松、柳、桃、竹、荷） | TangNatureBuilder |
| tang-bridge-builder.js | 唐代桥梁（石拱、木桥、廊桥） | TangBridgeBuilder |
| tang-animal-builder.js | 唐代动物（马、骆驼、鸟、鱼） | TangAnimalBuilder |
| tang-vehicle-builder.js | 唐代交通工具（马车、牛车、船） | TangVehicleBuilder |
| model-library.js | 统一模型库入口 | ChangAnModelLibrary |

## 工具与增强模块（assets/）

| 文件 | 功能 | 导出对象 |
|------|------|----------|
| postfx/cinematic-postfx.js | 电影级后处理参数配置 | CinematicPostFX |
| optimization/performance-optimizer.js | LOD+实例化+阴影优化 | PerformanceOptimizer |
| materials/pbr-enhancer.js | PBR材质增强（法线/粗糙度/AO） | PBRMaterialEnhancer |
| environment/sky-atmosphere.js | 天空大气（渐变天空、云层、星空、雾） | SkyAtmosphereEnhancer |
| environment/water-enhancer.js | 水景增强（波纹、反射、喷泉、石头、芦苇） | WaterEnhancer |
| environment/night-lighting.js | 夜景灯光（灯笼、街灯、宫灯、光晕） | NightLightingEnhancer |

## 游戏系统模块（assets/system/）

**注意：以下模块已创建，不再新增或扩展，专注精修核心建模。**

| 文件 | 功能 | 导出对象 |
|------|------|----------|
| save-enhancer.js | 存档系统（自动存档、手动存档、读档） | SaveEnhancer |
| interaction-enhancer.js | 交互系统（拾取、对话、互动提示） | InteractionEnhancer |
| quest-enhancer.js | 任务系统（主线、支线、日常、任务追踪） | QuestEnhancer |
| achievement-enhancer.js | 成就系统（成就列表、成就点、称号） | AchievementEnhancer |
| settings-enhancer.js | 设置系统（画质、音效、操作、界面） | SettingsEnhancer |
| help-enhancer.js | 帮助系统（操作说明、常见问题、新手指引） | HelpEnhancer |
| notification-enhancer.js | 通知系统（系统通知、邮件、公告、奖励） | NotificationSystemEnhancer |
| map-enhancer.js | 地图系统（大地图、标记、导航、快速传送） | MapEnhancer |
| inventory-enhancer.js | 背包系统（物品分类、堆叠、整理、使用） | InventoryEnhancer |
| perf-stats-enhancer.js | 性能统计面板（FPS、DrawCall、显存、加载时间） | PerfStatsEnhancer |
| start-screen-enhancer.js | 启动界面（开始界面、设置、加载动画） | StartScreenEnhancer |
| photo-mode-enhancer.js | 拍照模式（滤镜、角度、保存、分享） | PhotoModeEnhancer |
| fast-travel-enhancer.js | 快速传送系统（已解锁地点、传送点） | FastTravelEnhancer |
| npc-enhancer.js | NPC系统（商人、任务、对话、好感度） | NPCEnhancer |
| animal-enhancer.js | 动物系统（宠物、野生动物、骑乘） | AnimalEnhancer |
| vehicle-enhancer.js | 交通工具系统（马车、牛车、船、飞行） | VehicleEnhancer |
| economy-enhancer.js | 经济系统（货币、商店、交易、物价） | EconomyEnhancer |
| tutorial-enhancer.js | 新手引导系统（步骤、提示、完成度） | TutorialEnhancer |
| announcement-enhancer.js | 游戏公告系统（版本更新、活动、维护） | AnnouncementEnhancer |
| feedback-enhancer.js | 用户反馈系统（bug报告、建议、投诉） | FeedbackEnhancer |
| privacy-enhancer.js | 隐私安全设置系统（隐私、2FA、登录通知） | PrivacyEnhancer |
| event-enhancer.js | 活动赛事系统（节日、比赛、诗词、龙舟） | EventEnhancer |
| achievement-collection-enhancer.js | 成就图鉴系统（地标、美食、文物、收集） | AchievementCollectionEnhancer |
| social-enhancer.js | 社交互动系统（好友、聊天、组队、公会） | SocialEnhancer |
| character-growth-enhancer.js | 角色成长系统（等级、经验、属性、技能） | CharacterGrowthEnhancer |
| equipment-enhancer.js | 装备系统（穿戴、品质、强化、镶嵌） | EquipmentEnhancer |
| home-enhancer.js | 家园系统（宅邸、家具、装饰、商店） | HomeEnhancer |
| pet-enhancer.js | 宠物系统（猫、狗、鹤、兔、麒麟、跟随） | PetEnhancer |
| mount-enhancer.js | 坐骑系统（马、骆驼、麒麟、骑乘） | MountEnhancer |
| guild-enhancer.js | 帮派系统（创建、加入、成员、帮派战） | GuildEnhancer |
| leaderboard-enhancer.js | 排行榜系统（等级、财富、探索、成就） | LeaderboardEnhancer |
| mail-enhancer.js | 邮件系统（收件箱、发件、系统邮件、附件） | MailEnhancer |
| combat-enhancer.js | 战斗系统（技能、HP/MP、伤害、战斗面板） | CombatEnhancer |
| skill-tree-enhancer.js | 技能树系统（武学、文学、轻功分支、技能点） | SkillTreeEnhancer |
| shop-auction-enhancer.js | 商店拍卖行系统（商店、拍卖行、购买、出价） | ShopAuctionEnhancer |
| equipment-craft-enhancer.js | 装备打造强化系统（打造、强化、材料、品质） | EquipmentCraftEnhancer |
| pet-mount-collection-enhancer.js | 宠物坐骑收集养成进化系统（收集、升级、稀有度） | PetMountCollectionEnhancer |
| home-decor-enhancer.js | 家园建造家具装饰园林布置系统（家具、园林、购买、放置） | HomeDecorEnhancer |
| combat-loot-enhancer.js | 战斗技能装备掉落经验升级系统（经验、升级、金币、掉落） | CombatLootEnhancer |
| quest-story-enhancer.js | 主线支线任务剧情对话故事背景系统（主线、支线、剧情、对话） | QuestStoryEnhancer |
| social-chat-enhancer.js | 好友聊天组队公会社交系统（好友、聊天、组队、在线状态） | SocialChatEnhancer |
| economy-shop-enhancer.js | 货币商店交易拍卖行经济系统（铜币、银币、金币、商店、拍卖行） | EconomyShopEnhancer |
| item-craft-enhancer.js | 装备物品品质打造合成系统（品质、配方、材料、打造、分解） | ItemCraftEnhancer |
| dungeon-boss-enhancer.js | 副本BOSS挑战系统（副本、BOSS、挑战、奖励、通关） | DungeonBossEnhancer |
| imperial-exam-enhancer.js | 科举考试官职升迁系统（乡试、会试、殿试、官职、俸禄） | ImperialExamEnhancer |
| sect-enhancer.js | 门派加入修炼升级系统（道教、佛教、诗社、贡献、等级） | SectSystemEnhancer |

### 使用示例
```javascript
// 创建唐式宫殿
const palace = TangArchPro.createPalace(20, 12, 8);

// 创建仙侠浮空岛
const island = FantasyWonderBuilder.createFloatingIsland(15, 20);

// 创建唐代官员
const official = TangCharacterBuilder.createOfficial(1);

// 创建松树
const pine = TangNatureBuilder.createPine(1.5);

// 创建石拱桥
const bridge = TangBridgeBuilder.createStoneArchBridge(30, 5, 4);

// 电影级后处理参数
const dofParams = CinematicPostFX.getDOFParams();

// PBR材质
const woodMat = PBRMaterialEnhancer.createWoodMaterial(0x8b6f47);

// 渐变天空
const sky = SkyAtmosphereEnhancer.createGradientSky(0x4a90d9, 0x87ceeb);

// 水景材质
const waterMat = WaterEnhancer.createWaterMaterial();

// 灯笼
const lantern = NightLightingEnhancer.createLantern(0.5);
```

## 已修复的已知问题（不要重复修复）

- 护城河平面朝向（UNIT_PLANE旋转-90°X）
- 重复角楼/垛口（统一由10-world.js创建）
- 批处理增量重建（__changan.rebuild()）
- 固定延迟初始化（改为__enhance.register分帧调度）
- 夜景灯光与昼夜联动（__nightLights钩子）
- 阴影范围
- 雨滴粒子双重位移
- 音频无限递归（已删除/合并）
- atmosphere.js的THREE.SpriteGeometry错误（v2修复）

## 模块Owner划分

### 核心引擎（src/）
- `00-core.js` — 世界坐标、常量、GAME状态
- `05-rendering.js` — 渲染管线、后处理、阴影、色调映射
- `10-world.js` — 地形、地面、坊里、基础建筑
- `12-landmarks.js` — 历史地标坐标与建筑（精修重点）
- `30-main.js` — 主循环、输入控制、游戏状态机

### 增强模块（src/enhance/）
- `atmosphere.js` — 全局氛围、雾效、天空、大气粒子
- `sample-district.js` — 明德门—朱雀大街样板区精修（重点）
- `wonders-v3.js` — 仙侠奇观建筑
- `night-v2.js` — 夜景灯光系统

## 生命周期规范

### 正确注册方式
```javascript
if (window.__enhance) {
  window.__enhance.register('owner-name', initFunction, priority);
}
```

### 优先级
- priority 10：核心视觉精修（样板区）
- priority 50：氛围增强
- priority 100：游戏系统

### 失败处理
- 初始化失败必须记录到 `GAME.initErrors`
- 不得静默吞掉异常
- 提供 `__enhance.retry(owner)` 重试接口

## 美术标准

### 建筑质量要求
- ✅ 唐式木构：斗拱、鸱吻、瓦垄、格扇门窗、台基栏杆
- ✅ PBR材质：法线贴图、粗糙度贴图、AO贴图
- ✅ 层级结构：台基→柱网→斗拱→梁枋→屋顶
- ❌ 禁止：Box+Cone拼接冒充建筑
- ❌ 禁止：Canvas纹理冒充PBR

### 人物质量要求
- ✅ 唐代服饰：宽袖长袍、腰带、头巾/发髻
- ✅ 真实比例：头身比约7.5:1
- ❌ 禁止：圆柱体+球体拼接冒充人物

### 奇观设计原则
- 必须服从长安城整体空间规划
- 不能破坏原有城市构图
- 要有可探索性，不能只是视觉装饰

## 性能规范

### 唯一权威
- DPR、阴影质量、后处理参数只由 `05-rendering.js` 管理
- 其他模块不得修改这些全局参数

### 优化方向
- LOD分级：远处物体自动降低细节
- 实例化：重复物体用InstancedMesh
- 批处理：相似物体合并绘制
- 阴影：小物体不投影，远处物体不投影

## 禁止事项

1. ❌ 禁止继续创建细碎编号模块（121-140等）
2. ❌ 禁止用setTimeout固定延迟初始化
3. ❌ 禁止创建独立RAF循环（必须接入主循环）
4. ❌ 禁止覆盖 `buildWorld()` 函数
5. ❌ 禁止使用 `sunLight`/`ambientLight` 变量名
6. ❌ 禁止重复创建已有建筑
7. ❌ 禁止用基础几何体冒充高品质美术
8. ❌ **【新】禁止继续创建新的游戏系统模块**
9. ❌ **【新】禁止扩展已有的游戏系统模块**

## 当前工作重点（2026-10-28）

### P0：精修核心地标建模
1. **大明宫含元殿** — 增加更多木构细节、斗拱层次、彩画、栏杆
2. **大雁塔** — 精修砖塔细节、门窗装饰、塔檐纹理
3. **朱雀大街** — 精修路面、两侧建筑、街道细节
4. **明德门** — 精修城门楼、城墙、垛口

### P1：提升PBR材质质量
1. 木材材质：真实木纹、法线、粗糙度
2. 石材材质：石缝、风化、AO
3. 屋顶材质：瓦垄、屋脊、鸱吻
4. 红墙材质：颜色渐变、剥落、肌理

### P2：下载真实GLB高精模型
1. 唐式建筑GLB模型
2. 唐代人物GLB模型
3. 植被GLB模型
4. 集成到游戏中替换程序化几何体

## 开发流程

1. 先读代码，理解现有系统
2. 扩展已有Owner，不创建新模块
3. 浏览器实际运行验证
4. 提交截图和性能数据
5. 确认无回归后合并

## 关键文件

| 文件 | 用途 |
|------|------|
| agent.md | 开发规范（必读） |
| docs/SYSTEM_ARCHITECTURE.md | 架构设计 |
| docs/QA.md | 验收流程 |
| docs/model-resources.md | 3D模型资源目录 |
| src/boot.js | 启动加载器（v105） |
| src/30-main.js | 主循环/buildWorld/startGame |
| src/10-world.js | 世界生成核心 |
| src/12-landmarks.js | 地标建筑权威坐标（v4，精修重点） |
| src/20-character.js | NPC/玩家角色 |
| src/30-models.js | GLB模型加载器（v2.0） |

## 美术参考

- docs/art-direction.png — 整体美术方向
- docs/concept-market.png — 东市/西市场景
- docs/concept-palace.png — 宫殿场景
- docs/concept-qujiang.png — 曲江池场景
- 参考影片：《长安三万里》《大理寺日志》
