# 《龙游长安》开发文档索引

> 文档整合原则（写入 agent.md 的开发纪律）：
> 1. 文档只保留少量核心（本项目根目录 README/ARCHITECTURE/agent.md + docs 少量设计文档）；
> 2. 早期大量历史快照（BATCH*/NEW_*/SUPPLEMENT*/状态汇总等约1000份）已部分清理，剩余作为历史归档保留，**不再新增**此类快照；
> 3. 任何开发记录统一写入根目录文档或 docs/DOCS_INDEX.md 追加小节，禁止散落新建 md 文件。

## 权威文档（仓库根目录）

| 文档 | 内容 |
|---|---|
| `README.md` | 项目总览、玩法、运行方式、美术风格定位（国风漫剧/电影画风/开放世界） |
| `ARCHITECTURE.md` | 引擎架构、模块 Owner 分类、生命周期调度、材质/碰撞/水体/昼夜/天空等系统权威说明、坐标权威表 |
| `agent.md` | 开发纪律：校准时间、按 Owner 分类、不硬编码坐标、共享素材不重复、不建过多小模块、先整合再删 |
| `.github/workflows/ci.yml` | CI：`node --check src/*.js src/enhance/*.js` 语法校验 + boot.js 加载清单校验 |

## 本目录保留的设计/素材文档

| 文件 | 说明 |
|---|---|
| `DESIGN_FRAMEWORK.md` | 设计框架（国风漫剧/电影画风、开放世界定位） |
| `FILM_STYLE_RESEARCH.md` | 电影风格参考资料 |
| `CHANGELOG_20261025.md` | 开发变更日志 |
| `COMPLETE_ASSET_SOURCE_LIST_20261025.md` | 免费素材来源清单 |
| `COMPLETE_CC0_ASSET_SOURCES_20261025.md` | CC0 素材来源清单 |
| `ENVIRONMENT.md` | 环境与运行说明 |
| `IMPLEMENTATION_PLAN.md` | 实施计划 |

## 历史归档说明

docs 目录现存的其他 md 文件均为历史探索快照（素材批次记录、设计草案变体、每日状态汇总）。它们记录的是当时的探索过程，**不代表当前代码状态**；当前权威实现一律以 `src/` 源码与根目录文档为准。后续如需再次精简，可参考本索引按主题分批删除。

## 素材与共享原则（摘要）

1. 美术资源优先复用原系统共享几何体（UNIT_BOX/UNIT_CYL/UNIT_SPHERE/ROOF_UNIT/ROOF_SMALL）、共享材质库（MAT/TEX）、共享系统（Batch 实例化、quadBatch、waterMat 水面 Shader、addCollider 碰撞、recordFlightObstacle、updateDayNight 昼夜、addTree、addLantern、addSignMesh 汉字招牌）。
2. 新增实体必须注册碰撞网格与飞行障碍；坐标以 `src/00-core.js` 的 CITY/WORLD 与 `src/12-landmarks.js` 地标为唯一权威，禁止硬编码重建同名地标。
3. 增强模块按 Owner 分类：visual-grade(10) / sky(20) / performance(30) / landmarks(40) / vegetation(50) / water(60) / night-light(70) / outside(80)，统一走 `src/99-safe-init.js` 生命周期调度器（`window.__enhance.register`），禁止散装 setTimeout 与独立 RAF 循环。
4. 引擎选择：Three.js r160（页游，WebGL，上限高易扩展），原系统已含批处理/天空 Shader/水面 Shader/昼夜/碰撞/寻路/诗笺交互/后处理。
