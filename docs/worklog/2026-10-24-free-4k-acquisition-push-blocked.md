# 2026-10-24 免费素材深入检索及 4K 原始文件（上传受阻）

## 任务目的与范围
用户要求只搜索合法免费、电影级目标不降级，连续研究并完成 GitHub 收集提交。本轮已把去重后的 38 个新候选写进 docs/resource-catalog.json，资源目录由 331 增至 369 条；参见提交 dd909abb31df477c45542f3f0791a7a33dd79d80（该文本目录提交已在 GitHub main 上）。候选来自 BlenderKit、Sketchfab、BlenderSwap、Poly Haven、OpenGameArt、MIT 开源水流技术等。NC、NoAI、付费/Full Plan 和许可不明项均未作为可获取资产。

## 真实取得，但尚未上传 GitHub 的 4K 原件
下载到用户本机隔离目录 E:\\ChanganResearch_20261024，未动 Codex 正运行的工作区。官方 Poly Haven，全部 CC0、免费无登录：
- modular_wooden_pier_4k，Rico Cilliers，8源文件77,659,602B：glTF 2.0/BIN/6幅4K PBR，官方 API https://api.polyhaven.com/files/modular_wooden_pier
- river_small_rocks_4k，3幅4K PBR 43,106,238B：Diffuse、OpenGL normal、ARM，官方 API https://api.polyhaven.com/files/river_small_rocks
- chinese_console_table_4k，Kirill Sannikov，5源文件29,237,476B：glTF 2.0/BIN/3幅4K PBR，官方 API https://api.polyhaven.com/files/chinese_console_table
**共16个原始素材文件150,003,316字节。上述16文件及manifest/README仍仅在本机隔离克隆中，不能声称已进入 GitHub。** 本地各自目录存有完整 manifest.json、原始来源 URL、逐文件 MD5、SHA256、原文件、README 及 -text 属性以保护换行原字节。原材质无减面降纹理。

## 已实际运行的验证
- 16/16源文件逐一比对官方 API size/MD5、另外复算 SHA256，全部通过。合计 150,003,316B。
- glTF 2.0 JSON静态完整性：木码头7 meshes、2 materials、7外部引用、84,780三角形；中式案几1 mesh、1 material、4外部引用、13,648三角形。引用路径及原BIN大小均有效。PBR贴图全为4096×4096像素。
- 369项资源唯一 ID/规范化URL、分类和阶段汇总逐项核算一致。git diff --cached --check 在修正两处 README 末尾空行后通过；原 glTF原字节 Git blob 校验相等。
- 本地正常 Git commit 已创建原件 e6b115b（后经 rebase 变为 d0bcbac）和目录/工作日志 cab4c51（后变为 b45e03b）。它们是**本地提交，没有推送成功**。

## GitHub 上传故障与安全界限
- 含77.7MB+43.1MB源的第一轮 HTTPS push运行900秒，最终 timeout（exitCode 1），没有成功反馈，不能算提交到远端。
- 并行Codex在同一 main 新增 4 个提交；为保护别人改动，曾 fetch 并无冲突 rebase。随后推送被非快进拒绝，禁止强推；另一次 fetch/ls-remote 因代理网络 Connection reset 失败。没有覆盖、reset、强推任何并行改动。
- 因此没有提前把 catalog 的候选升级为源文件已在GitHub的 source_acquired，也没有在 main 创建指向缺失二进制的 manifest 路径。
- 本轮并未进行购买/开通付费、带费用LFS或绕过付费限制。小于16MB的单个大贴图在普通Git暂存；无付费套餐更改。

## 未进行的相关验证与遗留
- Windows环境无可调用的 Blender，可校验glTF静态完整性但没进行真实Blender导入、四面灰模/PBR、艺术同场对照、唐风改造、动画/水系/岸船碰撞或实机GPU/浏览器回归。下载成功不等于用户美术批准。
- 木码头和案几为后世/通用形制，不能冒称唐代标准；河床石纹不是动态溪水。
- 三套实际原件**同步GitHub仍是未解决事项**；优先恢复网络后以非强推方式 fetch/rebase、尝试直接推隔离分支或main，检查所有二进制文件和manifest确实远端存在后再更新 resource-catalog 状态；不能因本地 commit 存在就声称推送成功。
- 下一执行者先读 AGENTS.md、docs/FREE_ONLY_RESOURCES_20261024.md、docs/SYSTEM_ARCHITECTURE.md、docs/ART_ASSET_EXECUTION.md、docs/resource-catalog.json、本记录；再核对隔离本机目录及并行Codex提交。真素材视觉验收应优先复用现有 tools/model_review.html。
