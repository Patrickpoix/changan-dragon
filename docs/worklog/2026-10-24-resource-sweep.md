# 2026-10-24 全域资源检索留痕

目的：为唐风城市各域大量检索成熟可编辑高精资源，并留下跨会话真实来源，覆盖殿宇、亭台、商铺、货物、人物、唐服、植被、桥、船、动物、光水与声景。

实际修改：docs/resource-catalog.json 新增 61 条未取得候选（159→220）；新增 docs/RESOURCE_SWEEP_20261024.md 和本日志。删除、移动、重命名：无。未触动正式 src、dist、vendor 和已有 Einar/龙等原始数据。

实际检验：联网查询相关公开页面的资源种类、作者宣传规格、授权标签和可得格式；根据最新仓库目录 source_url 去重；将所有新条目标记 preview_candidate / PUBLIC_PAGE_RESEARCH_ONLY；通过程序统计 resource_count、by_category、by_stage，均 = 220。这些检查属于目录结构验证，不代表模型美术技术验收。

未运行：未购买、下载这批三维源、导入 Blender、验证网格/贴图/骨骼/动态水，未运行场景 A/B、游戏回归或真机 GPU 性能，因为本批次只研究资源来源，正式运行代码未修改。非商业/NoAI/第三方纹理和模型页面与实际文件不一致是待核风险。

边界：不绕过登录/付费，未改变项目私有数据、安全配置与代码执行路径，不偷用无法再分发的包；当前另一 Codex Cloud 并行工作，研究不覆盖其成果。

下一位执行者：先读 AGENTS、PRODUCT_BRIEF、SYSTEM_ARCHITECTURE、CONTINUE，再读 RESOURCE_SWEEP_20261024 与资源目录。优先 A 类完整建筑/唐装/风动树/水-音效，合法取得文件、存证、做动态多视角 Blender 样板，而不是再次复制资料库。

第二轮追加：9条新的古建/庭院与CC0水声页面，仍标preview_candidate且未下载。追加后目录 totals应为220（以本次回读为准）。
