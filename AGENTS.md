# 龙游长安：后续会话必读

## 立即上手

1. 读 [agent.md](agent.md) — 开发规范、模块Owner映射、性能优化原则、CI门禁
2. 读 [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md) — 系统架构
3. 读 [docs/QA.md](docs/QA.md) — 浏览器验收流程
4. 读仓库根目录的 ARCHITECTURE.md 和 HANDOVER.md（如存在）

## 项目定位

《龙游长安》是以盛唐长安城为原型的3D开放世界网页游戏（Three.js），
融合国风漫剧/电影画风与仙侠魔幻奇观。

## 核心开发原则（2026-10-28 更新）

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

## 已修复的已知问题（不要重复修复）

- 护城河平面朝向（UNIT_PLANE旋转-90°X）
- 重复角楼/垛口（统一由10-world.js创建）
- 批处理增量重建（__changan.rebuild()）
- 固定延迟初始化（改为__enhance.register分帧调度）
- 夜景灯光与昼夜联动（__nightLights钩子）
- 阴影范围
- 雨滴粒子双重位移
- 音频无限递归（已删除/合并）
- atmosphere.js的THREE.SpriteGeometry错误（v2修复，用Canvas纹理+SpriteMaterial）

## 模块Owner划分

### 核心引擎（src/）
- `00-core.js` — 世界坐标、常量、GAME状态
- `05-rendering.js` — 渲染管线、后处理、阴影、色调映射
- `10-world.js` — 地形、地面、坊里、基础建筑
- `12-landmarks.js` — 历史地标坐标与建筑
- `30-main.js` — 主循环、输入控制、游戏状态机

### 增强模块（src/enhance/）
- `atmosphere.js` — 全局氛围、雾效、天空、大气粒子
- `sample-district.js` — 明德门—朱雀大街样板区精修
- `wonders-v3.js` — 仙侠奇观建筑
- `night-v2.js` — 夜景灯光系统

## 生命周期规范

### 正确注册方式
```javascript
// 必须使用统一注册系统，禁止setTimeout轮询
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
5. ❌ 禁止使用 `sunLight`/`ambientLight` 变量名（正式核心用 `sun`/`ambient`）
6. ❌ 禁止重复创建已有建筑
7. ❌ 禁止用基础几何体冒充高品质美术

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
| docs/resource-catalog.json | 素材目录 |
| docs/asset-manifest.json | 素材清单 |
| src/boot.js | 启动加载器 |
| src/30-main.js | 主循环/buildWorld/startGame |
| src/10-world.js | 世界生成核心 |
| src/12-landmarks.js | 地标建筑权威坐标 |
| src/20-character.js | NPC/玩家角色 |

## 美术参考

- docs/art-direction.png — 整体美术方向
- docs/concept-market.png — 东市/西市场景
- docs/concept-palace.png — 宫殿场景
- docs/concept-qujiang.png — 曲江池场景
- 参考影片：《长安三万里》《大理寺日志》
