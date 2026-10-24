# 2026-10-24 | 龙游长安跨会话美术流程纠偏与 CC0 素材入库

## 目标与实际变更范围

用户要求新 Codex 会话不再重复以程序几何拼装和工程 PASS 代替电影质量，并协助主动获取成熟合法三维资产。本次**只修改交接/研究文档，新增研究资产**，不替换游戏任何正式模型、不改游戏脚本、引擎、离线包，不进行大规模美术“放行”。

## 文件变更

- 修改：`AGENTS.md`、`docs/PRODUCT_BRIEF.md`、`docs/CONTINUE.md`、`docs/resource-catalog.json`、`docs/asset-manifest.json`。
- 新增：`docs/ART_ASSET_EXECUTION.md`、本工作日志、`assets/library/curated-polyhaven/README.md`。
- 新增（原字节）：两套 Poly Haven 1K glTF，每套 1 glTF、1 BIN、3 JPG，共 **10 个二进制/文本资产文件**。下载来源、许可、作者与逐文件 MD5 见 README。
- 删除、移动、重命名：无。正式 `src/`、`dist/`、既有 `assets/runtime-models.js` 不变。

## 实际验证与结果

1. 读取最新 GitHub 的 AGENTS、PRODUCT_BRIEF、CONTINUE、资源目录、清单和脚本，确认技术进度及美术否决/新阶段仍有效。
2. 从 Poly Haven 官方 API 读取 1K glTF 依赖列表；**10 个文件下载时计算 MD5，均与 API 原值一致**；仅完整来源进入仓库。
3. **提交后实际回读 main 仓库**：两个资产目录共 10 文件、3,486,048 B。分别解析两份 glTF JSON 并对照 GitHub 目录，8 条 BIN/贴图引用均能解析且相对路径存在，两份 BIN 声明 byteLength 均等于仓库实际文件大小；屏风 2 个 mesh primitives，木凳 1 个。\n4. **提交后解析资源 JSON**：resource-catalog.json 有 118 条，resource_count=118、by_stage 合计=118、by_category 合计=118；asset-manifest 的 curated_cc0_sources=2。
5. 文档不涉及运行时改动，因此未重新运行全城交互、离线构建、WebGL1/Playwright 大回归，避免虚假的“全面通过”。

## 未运行、未知与未解决项

- **未运行**：Blender 导入、灰模/五视角截图、实际 PBR 视觉验收、唐代史实适配、正式游戏集成、手机真机性能；这些必须由后续制作/验收补齐。
- 两套新增资产是可编辑的**物件源**，不是完成的建筑、唐服角色、小青龙或树林。重要主体美术源缺口仍存在，不能以本次数量掩盖。
- 若未来正式使用，须先确认年代适配、比例、颜色、裁剪/优化及多视角视觉效果。
- 当前临时网络访问偶发 TLS 失败，下载已逐字节比对成功，不等于候选平台的 401/403 问题已经解决。

## 权限/安全/研究边界

仅使用公开 Poly Haven 官方公开下载与 CC0 页面；无登录、购买、绕过下载限制或泄露凭据。没有改变项目安全数据、执行机制或用户原图。保留用户未批准美术不得自称获认可的界限；尊重仅主代理、不强推、正式整合须过阶段门槛。

## 下一位执行者先读

`AGENTS.md` → `docs/PRODUCT_BRIEF.md` → `docs/CONTINUE.md` → `docs/ART_ASSET_EXECUTION.md` → `assets/library/curated-polyhaven/README.md`。先完成首个完整店铺+自然唐服人物+小青龙的可环视高质量样板，优先解决核心主体缺口，再考虑这些新道具的用法。
