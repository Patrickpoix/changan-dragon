# 龙游长安：后续会话必读

## 立即上手

1. 读 [agent.md](agent.md) — 开发规范、模块Owner映射、性能优化原则、CI门禁
2. 读 [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md) — 系统架构
3. 读 [docs/QA.md](docs/QA.md) — 浏览器验收流程
4. 读仓库根目录的 ARCHITECTURE.md 和 HANDOVER.md（如存在）

## 项目定位

《龙游长安》是以盛唐长安城为原型的3D开放世界网页游戏（Three.js r160），
融合国风漫剧/电影画风。当前原型范围900×760世界单位，后续扩展为完整长安城。

## 用户已确定的约束

- **桌面高质量优先**：16英寸笔记本Chrome为主目标，不设10GB容量上限
- **免费素材**：只使用CC0/CC BY/开源免费素材，保留许可证记录
- **不堆砌基础几何体**：优先复用/获取成熟高精PBR模型，不用cube/cone冒充建筑
- **共享素材不重复**：GLB+共享材质源，不上传重复贴图
- **按Owner分类**：一个系统一个模块，禁止写大量细碎单功能模块
- **推main前在独立分支测试**，验收通过后合并
- **真实截图和性能数据**作为验收依据，不凭控制台日志宣布完成

## 当前技术栈

- Three.js r160（WebGL），原生JS无构建步骤
- 25个核心src文件 + 6个enhance模块，全部由boot.js动态加载
- 关键路径：小文件(~1MB) → buildWorld() → 开始界面
- 后台延迟：scene-materials.js(7MB) + runtime-models.js(9.58MB)
- 开始界面期间requestIdleCallback预生成PMREM+预编译材质

## 已修复的已知问题（不要重复修复）

- 护城河平面朝向（UNIT_PLANE旋转-90°X）
- 重复角楼/垛口（统一由10-world.js创建）
- 批处理增量重建（__changan.rebuild()）
- 固定延迟初始化（改为__enhance.register分帧调度）
- 夜景灯光与昼夜联动（__nightLights钩子）
- 阴影范围±140m
- 雨滴粒子双重位移（v6修复）
- 137号音频无限递归（已删除/合并）
- Cam.zoomBy语法错误（v8.1修复）

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
| src/10-world.js | 世界生成核心(72KB) |
| src/12-landmarks.js | 地标建筑权威坐标 |
| src/20-character.js | NPC/玩家角色 |

## 美术参考

- docs/art-direction.png — 整体美术方向
- docs/concept-market.png — 东市/西市场景
- docs/concept-palace.png — 宫殿场景
- docs/concept-qujiang.png — 曲江池场景
- 参考影片：《长安三万里》《大理寺日志》
