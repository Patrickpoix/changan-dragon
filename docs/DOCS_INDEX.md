# 文档索引与归档说明（DOCS INDEX）

> 本文档是 docs/ 目录的权威索引。docs/ 下共有历史文档约 1000 份，大部分是 2026-10-25 会话产生的设计快照/状态快照/素材批次记录。
> **原则：核心文档精而少，历史快照只归档不新增。** 后续开发文档统一写回仓库根 README.md / ARCHITECTURE.md / agent.md 与 docs/ 下少量核心文档。

---

## 一、核心文档（长期有效，勿删）

| 文档 | 用途 |
|------|------|
| CONTINUE.md | 会话交接记录（上一会话遗留，可续读） |
| CONTINUE_HISTORY.md | 历史会话交接汇总 |
| PRODUCT_BRIEF.md | 产品需求简报 |
| SYSTEM_ARCHITECTURE.md | 系统架构说明 |
| DESIGN_FRAMEWORK.md | 设计框架（国风漫剧/电影质感） |
| FILM_STYLE_RESEARCH.md | 影视风格研究 |
| QA.md | QA 记录 |
| IMPLEMENTATION_PLAN.md | 实施计划 |
| PREPARATION_REVIEW.md | 准备审查 |
| resource-catalog.json | 素材资源目录（可机读） |
| FACT_CHECK_AND_RECTIFICATION_20261025.md | 史实核查与修正 |
| RESOURCE_SWEEP_20261024.md / FOLLOWUP | 素材盘库（含来源清单） |
| HIGH_FIDELITY_RESOURCE_LEADS_20261024.md | 高清素材线索 |
| FREE_ONLY_RESOURCES_20261024.md | 免费素材清单 |
| FREE_ASSET_CURATED_SELECTION_20261024.md | 免费素材精选 |
| NEW_FREE_ASSETS_20261024.md | 新增免费素材 |
| HIGH_QUALITY_GUOFENG_ASSETS_20261024.md | 国风素材 |

---

## 二、历史快照类（已过时，仅归档，不再新增）

以下类别是历史会话的状态/版本快照，与当前代码无绑定关系：

| 类别 | 说明 | 处理 |
|------|------|------|
| PROGRESS_REPORT / PROGRESS_RECORD V系列 | 进度报告版本快照（V1-V24） | **已删部分（13份），其余归档** |
| STATUS_RECORD / STATUS_UPDATE / SUMMARY_UPDATE V系列 | 状态快照（V1-V24） | 归档，勿再新增 |
| PROJECT_REPORT V系列 / PROJECT_*_SUPPLEMENT | 项目报告/补充快照 | 归档，勿再新增 |
| PROJECT_OVERVIEW_* | 项目总览快照 | 归档，勿再新增 |
| DAILY_* / SESSION_* / PHASE* / FINAL_* / LATEST_* / NEXT_* | 日/会话/阶段总结 | 归档，勿再新增 |
| CHANGELOG / FAQ / GOALS / MILESTONES / LESSONS / RISKS / ROADMAP V系列 | 元信息快照 | 归档，勿再新增 |

> 提示：此类快照内容大多已汇总进 CONTINUE.md 与仓库根文档，按需回读即可，不要作为代码依据。

---

## 三、素材批次记录（NEW_TANG_*_BATCH*，约217份）

记录唐文化素材批次设计（建筑/人物/服饰/武器/植被/天空/市集等主题）。**对应的素材实现已并入代码共享材质库**，文档仅作来源留痕：

- NEW_TANG_BUILDING / _DAMING_PALACE / _CITY_WALL / _TEMPLE_PAGODA / _BRIDGE_RIVER / _QUJIANG_GARDEN
- NEW_TANG_CHARACTER / _NPC / _MAN_CLOTHING / _WOMAN_CLOTHING / _MILITARY / _WEAPON / _CARRIAGE / _ANIMAL / _CAMEL
- NEW_TANG_VEGETATION / _PLANT / _STREET_GARDEN / _STREET_PAVEMENT / _FESTIVAL_LANTERN / _LANTERN_LAMP
- NEW_TANG_MARKET / _SHOP_SIGN / _CALLIGRAPHY / _MUSIC / _WEATHER / _SKY_HDRI / _PBR_TEXTURE 等

> 后续素材工作直接更新 resource-catalog.json 与代码内共享材质/几何，不再按批次生成独立文档。

---

## 四、系统设计文档（CHANGAN_* / 各系统 *_DESIGN / *_IMPLEMENTATION，约300份）

覆盖游戏系统设计：经济/法律/医学/军事/交通/教育/宗教/节日/故事/战斗/多人/存档/输入/导航/碰撞/水面/天空/昼夜/后处理/性能 等。

> 现状：多数设计为纸面方案，未全部实现。**以代码（src/）与 ARCHITECTURE.md 为权威**，设计文档仅作背景参考。已实现系统的设计文档（如水面/天空/昼夜/碰撞/存档/交互）可在对应模块注释中查找。

---

## 五、史料参考（TANG_*，约150份）

唐长安/唐代文化史料参考：建筑/服饰/礼制/市坊/经济/节日/天文/乐器 等。

> 有价值的历史参考，后续美术与玩法开发可回读；碎片化的同类主题可合并阅读。

---

## 六、素材调研（*_SOURCES / *_DISCOVERY / *_RESEARCH，约100份）

开源/免费素材调研记录（CC0模型/HDRI/纹理/音效/字体 等）。已汇总进 resource-catalog.json 与本文档第一节的核心素材文档。

---

## 维护约定

1. 新增开发文档优先写入 README.md / ARCHITECTURE.md / agent.md（仓库根），不在 docs/ 新建碎片文件。
2. 若确需在 docs/ 新建文档，必须先在本文档登记，并在完成后合并进核心文档。
3. 历史快照类不再新增；需要归档的内容统一追加到 CONTINUE.md。
4. 删除 docs 文件前先确认未被 boot.js / README / ARCHITECTURE 引用。
5. 文档数量目标：docs/ 核心文档 ≤ 20 份 + 历史归档（只读不再增长）。