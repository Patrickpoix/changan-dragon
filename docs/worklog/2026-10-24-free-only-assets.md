# 2026-10-24 FREE ONLY resource pass

**Purpose**: user specifies only truly **free ($0)** materials, engines and usable source assets. Do not spend, request payment/trials or retain paid listings as purchase queue. Keep cinematic desktop quality goal unchanged.

**Changed**: root AGENTS.md, docs/PRODUCT_BRIEF.md, docs/CONTINUE.md, docs/resource-catalog.json, docs/asset-manifest.json. Added docs/FREE_ONLY_RESOURCES_20261024.md, assets/library/free-curated/polyhaven/README.md, this log, and **eight original Poly Haven CC0 files** (Chinese Tea Table glTF/BIN/3JPG, River Small Rocks 3 JPG). No deletes/moves/renames; no changes to game's src, vendors or dist. Paid source records preserved as historical but selection policy excludes them.

**Real verification performed**: web review of public $0 source/CC0 or CC-BY labels, with free-vs-paid tier distinctions; official Poly Haven API returned names, byte sizes and MD5. Eight downloaded files were MD5 compared with those API values before Git blob creation; text JSON was parsed and catalog record count matched category and stage sums (280/280/280). GitHub tree/glTF path/readback check should only be reported as performed if subsequently executed (this entry can be supplemented).

**Not run**: Blender import/gray model/five-view PBR, rivulet flow simulation, engine A/B, true laptop GPU frame times, asset historical accuracy or final art acceptance. Reason: focused $0 asset sourcing/document-only production change. 1K downloads only for authenticated staging/preview; true higher-resolution 4K+ production masters are **not** downloaded and no claims to finished film-level art are made.

**Known gaps**: historical paid candidate records remain but are excluded by free_only_policy; free Sketchfab download may require account and CC BY author credits; free Chinese garden wall page omitted explicit license, held from integration; none of the new mature source candidates is approved as finished architecture/hero characters.

**Safety/data/research boundaries**: no paid purchase or bypassed account/subscription, no third-party scripts run, no original private files overwritten, no main engine or user uploaded models touched. Codex Cloud concurrent model work must be protected.

**Next**: AGENTS -> PRODUCT_BRIEF -> FREE_ONLY_RESOURCES_20261024 -> resource-catalog -> CONTINUE -> asset-manifest. Obtain only verified zero-cost production assets, store full-resolution masters in permitted storage (LFS/object store if large), make high-quality complete Tang street/bridge/river demo, review actual visual outcomes.

## 提交后实际回读验证（已执行）

- main 提交 `fbea4a11c8892d6a8ef23e58a84f0509d7590512` 已从远端回读。
- `docs/resource-catalog.json`：JSON 实际解析通过，资源条数、resource_count、分类合计、状态合计四项均为 **280**；新增 **23** 条 free-only 条目，价格上限 0，原已取得资产保留。
- `docs/asset-manifest.json`：实际解析并看到研究性 CC0 来源集合共 **4** 条（包含此前2条）。
- 茶桌原 glTF 实际回读解析成功；5个文件共 **1,581,290 B**，其BIN声明长度与仓库文件大小都是 **78,792 B**，4条 BIN/纹理相对引用均存在。
- 河床PBR三张原件已回读，文件数3，共 **3,326,723 B**。合并茶桌 **8个原始文件、4,908,013 B**。
- 这些验证只涉及原字节完整性、目录和 glTF 引用路径，**没有**假称 Blender 五视角、最终质量、真实流水动画或 GPU 性能测试通过。

## 补充：免费四角亭 ZIP 上传受阻（未入库）

- 通过原作者在 Godot Asset Store 的免费 CC0 下载取得四角亭 ZIP：2,777,866B，SHA256 为 `008fb5c4508ce57c4203e5763fd01a177ded16ca94fd5de34ea26c422b483efa`，暂未进行 Blender 或压缩包内容安全检查。
- GitHub blob 已准备，但尝试把含 ZIP 的提交更新到 main 时被系统安全检查阻止。**远端 main 未包含该 ZIP**，没有尝试绕过安全检查。后来仅更新了免费资源报告，准确记录失败事实及同作者中式园林墙在 Godot 官方发布页标示 CC0。候选也未升级为已取得状态。
- 目录回读最后检验：280 条，分类/阶段总计均 280，零元预算规则保留。后续优先阅读源安全性和版权再决定是否能合法安全入库，切勿把 GitHub 的未挂载 commit SHA 当作已发布资源。
