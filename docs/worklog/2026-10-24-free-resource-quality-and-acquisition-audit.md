# 2026-10-24 《龙游长安》资源真实取得状态、最优候选与缺口专项核查

> 本文为一次只读实盘与公开来源复核的工作记录。资源注册和获取状态仍以 `docs/resource-catalog.json`、逐素材 manifest 为唯一权威；不是第二套资产数据库。只允许真正 **$0** 资源，电影级美术标准不降低。

## 1. 先回答：369条是否都下载了？

**没有。369 是研究记录，不是369个模型，也不是369个已下载压缩包。** 此刻 GitHub `main` 的资源目录显示369条，按阶段统计如下（重复模型、同一模型多个格式、工具/文物参考不可当模型数）：

- 阶段计数：existing_runtime: 1; not_selected: 12; source_acquired_research: 17; source_acquired: 2; offline_tool_candidate: 5; runtime_candidate: 4; reference_only: 42; account_required: 12; rejected: 16; rights_hold: 10; purchase_candidate: 6; preview_candidate: 235; rejected_character_style_research_only: 4; original_source_acquired_not_production_approved: 3。各阶段之和369，来源URL/ID唯一369。
- 其中 **preview_candidate 235** 是预览/网页级候选；**reference_only 42** 是参照而非游戏资产；**account_required 12** 未正常取得；**rights_hold 10** 权利待核；**purchase_candidate 6** 是旧历史收费记录，在当前$0政策下绝不购买。
- 核验为研究源的 **source_acquired_research 17**、**source_acquired 2** 和 **original_source_acquired_not_production_approved 3** 并不代表可直接投放游戏：包含工具源码、材质、原始角色或龙、工艺试片等。有些 source_acquired 标注是旧文件/工作源而非成熟可用模型。
- `docs/asset-manifest.json` 中运行时仍声明 **15个外来GLB来源**（13 Poly Haven、2 Quaternius）；人物/龙/城楼/水面大多仍依赖项目程序模型或研究组件。项目QA已有操作通过，但人物、龙、木构及水景并未完成用户美术验收。
- 其他已经下载且文件在 GitHub 被记录为来源研究（不等于已进游戏）：Blender Studio Einar写实人物工程与源贴图、Grab3D 2只高精龙静态原件、MakeHuman基体/权重、Snow/Rain（造型被用户否决，仅作绑定参考）、研究版三种船壳、部分木构/植物/材质、Poly Haven CC0小道具与4K陶器等。应逐个打开原件验证，不能简单相加为“可用成品”。

## 2. 三套这次真下载的4K源：本地有，GitHub远端尚未同步成功

- `E:\\ChanganResearch_20261024` 和独立 `E:\\ChanganResearch_ChunkPush_20261024` 已实际保存：Poly Haven **Modular Wooden Pier** 8件、77,659,602字节；**River Small Rocks** 3张4K、43,106,238字节；**Chinese Console Table** 5件、29,237,476字节。共16个原始字节文件150,003,316字节。
- 源自 `api.polyhaven.com` 指定的 `dl.polyhaven.org` 官方URL，全部API MD5、size与本机计算SHA256匹配；两套glTF JSON外部BIN/贴图引用齐，木码头7 mesh/2材质/84,780三角；案几1 mesh/1材质/13,648三角，所有贴图确认为4096×4096。
- **没有取得 GitHub 远端成功接收这16个源文件的凭据。** 单次批量Git push超时、后续非快进冲突（已安全rebase）、再经小批次独立分支尝试仍因网络失败。`docs/CONTINUE.md` 已明确登记不可将本地Commit当作远端已完成。目前3套应继续标为 *local-acquired / remote-sync-pending*，不能把官方网页和GitHub链接当作二进制已经在GitHub。
- 木码头是通用码头、案几为后世家具、河床是静态PBR——均未通过唐代形制/五面灰模/Blender实景/高画质桌面浏览器或用户审美批准。没有改变游戏正式模型、`src/`、`dist/`。

## 3. 按真实制作缺口横向排序（不是简单比较面数）

| 家族 | 当前最好实际拥有的基础 | 更优的免费公开来源/替代路线 | 为什么还不够 / 本轮裁定 |
| --- | --- | --- | --- |
| 完整殿堂/宫殿/双层店铺 | 既有程序城市/完整木构研究样板，技术可走但造型被否决 | [Blendkit Chinese Temple 349k CC0](https://www.blendkit.com/asset-gallery-detail/27de2944-5605-4075-a409-e0dfb85dc12a/)、[Chinese Pavilion 896k CC0](https://www.blendkit.com/asset-gallery-detail/30a0078c-8465-43a5-82a2-66c327f30a71/)、[Chinese High House Wood 365k CC0](https://www.blendkit.com/asset-gallery-detail/6a944c19-fa36-4f4f-bc72-24d61eb5aa88/) | **优先G0取得源**；免费账号/Blender插件未实际下载。历代混合、后部/室内/楼梯是否完整须检，不能仅看官网面数宣称比现有好 |
| 唐代结构真实性 | 现有图纸研究/木构规则/后代寺庙形式参考 | [Vincerew唐宋斗拱教学模型 CC BY](https://sketchfab.com/3d-models/temple-e28da4013d554cb7b1fb6bc46cb71615)、[Tekton 南禅寺782年结构校验代码](https://github.com/tangxiya-star/Tekton) | 斗拱教学不能作宫殿完整成品；Tekton代码未发现明示许可证，**rights_hold、只读研究不得复制代码**。唐形制应从考古测绘交叉检验 |
| 自然人物/神态 | 高精Einar已取得，是头脸/肤材/毛发表情基准；MakeHuman真实成人基体 | Einar原工程复用正常皮肤工艺+合法唐发服自制；免费[Blender Studio Human Base Meshes CC0](https://www.blender.org/download/demo-files/)可作为拓扑补充 | Einar是现代老年男性/带机械臂，不能直接当唐人；Snow/Rain头脸被用户否决。**尚无通过自然脸+唐装+表情+动作的男女可用NPC** |
| 唐代衣装 | 有MakeHuman、但完整服装未取得 | [Style3D唐代齐胸汉服174.4k CC BY](https://sketchfab.com/3d-models/tang-dynasty-chest-high-hanfu-63fc3f79926c4e999accc0a6407c23bd)、[673k齐胸襦裙 CC BY](https://sketchfab.com/3d-models/chest-length-hanfu-of-tang-dynasty-bdf94b5384414899a81a15016b4f13ca) | 原素材公开免费但需Sketchfab账号/部分源格式另需联系，衣服**不等于已绑定人体**；男袍、工服、侍者、守卫更缺 |
| 主角小青龙 | 已取得Grab3D 80万三角/4K中国龙和可爱幼龙原件 | [Blender Studio Scales v2](https://studio.blender.org/characters/5703a17dc379cf032c7b2616/v2/)有成熟动画工艺、[现有Sketchfab中国龙骨架动画候选](https://sketchfab.com/3d-models/chinese-dragon-a5ad5ec06f43461f95bb93e95fe7553b) | **现有高精源均静态，且4足/翅膀/盘曲姿态与无翼小青龙不同**；Scales风格偏西式且需免费账号，不是可直接套用的成品。连续脸/骨骼/走骑飞需专门美术工艺 |
| 柳树/松树/花树 | 自建4类植被/LOD研究，有真实树源配合但柳形和风动未通过 | [可绑定垂柳144k CC BY](https://sketchfab.com/3d-models/weeping-willow-tree-48c090ce93d543cf8b19d3c6f2b6788a)、[15款带LOD松树 CC BY](https://sketchfab.com/3d-models/pine-trees-pack-lowpoly-game-ready-lods-e1e9c07b8e2e445c943fec660beefba2) | 垂柳只带基础漫反射、未验证自然风动；松种和古典园景需改。画面欠完整枝型、风声与整体布景，低模套包不足以替代近景 |
| 桥、湖岸、画舫与溪流 | 主游戏桥/舟船/湖岸可通行；研究有真实船壳及分LOD画舫，木码头4K已本地下载 | [70.7k中式石桥 CC BY](https://sketchfab.com/3d-models/chinese-detailed-bridge-d7b336d1ab24418ea1a429dbe2c59bfe)、[SeedOcean MIT alpha](https://github.com/expertping/SeedOcean-threejs)、[Waterways MIT曲线水流参考](https://github.com/Arnklit/Waterways) | **无实际弯溪方向速度场/流水视频/船只真实乘坐/动态靠岸完整视觉**。模型下载与真实交互相差很远；Sea FFT不能原封不动充当溪水 |
| 环境音与市井 | 原创合成多层+音频试验，部分第三方来源被发现许可混杂已隔离 | [OpenGameArt CC0 water-splash](https://opengameart.org/content/water-splash-and-sand-footsteps)、[OpenGameArt CC0 water collection](https://opengameart.org/content/40-cc0-water-splash-slime-sfx) | 缺多场景实地真实声、唐风街市叫卖/方位衰减，音量/空间音源/与场景事件关联尚未整合 |

## 4. 本次外部核查发现的反证，阻止误判“最好”

- 免费**不等于无条件可用**：Blendswap [`Chinese palace` 835210面/5147 objects](https://www.blendswap.com/blend/14878) 实际是 **CC BY-NC-SA**，即便外观精美、能免费账号下载也不符合本项目长期商用/自由改造边界，明确排除。 [Sketchfab Sacred Peak Shrine](https://sketchfab.com/3d-models/chinese-temple-sacred-peak-shrine-fe474ef5e0ee4e8d808f6a65516da008) 页面虽有下载入口同时写 **$4.99 Gumroad**，免费内容是否完整可用不明确，不能当0元成熟寺庙源。
- [Grab3D](https://grab3d.com/how-we-make-models/) 官方声明其大量高精有AI辅助生成+Blender修正，并不等于手工拓扑或动画；不能因为800k/4K就断定是可动电影级成品。已有两龙原件应优先验证真网格与变形，不重复取得。
- [3DAssets.dev Imperial China Palace and Garden](https://3dassets.dev/packs/imperial-china-palace-and-garden) 官方为CC0整套63个模块、255434三角、6.2MB，自述全部AI生成，可作**统一尺度/接口/动效数据的小型灰模场景对照**；但不能作为当前高精宫殿成品来源。避免因“63件”再造低质场景。
- [Tekton](https://github.com/tangxiya-star/Tekton) 与[应县木塔项目](https://github.com/huangbai-AI/yingxian-pagoda)均能启发构件证据分级与真结构测试，但此轮未找到可再使用的许可证，代码与场景按rights_hold只阅读。应县木塔为辽代，与盛唐长安宫殿的时代不符。

## 5. 下一步只有三项真正改变结果的关口

1. **G0真正取得并核许可**：优先免费高精Blendkit完整建筑、Sketchfab真实唐代衣服和实树；原包保存 SHA/作者/所有地图依赖；对需免费登录的条目必须走合法账户，禁止绕过、不混淆Free与Full Plan。不再重复Einar/两龙。
2. **G1可视审查**：在现有 `tools/model_review.html` 和Blender做同一套完整院落+成年男女唐装+龙与岸桥的正/侧/背/顶、灰模+中性PBR，真实检查室内/楼梯/骨架/嘴眼/姿态/风动。仅技术入库不代表审美通过。
3. **G2同场动态/性能**：弯溪90度弯和桥墩流向视频、湖面日照高光/船尾流与实3D音、角色骑车IK，与旧渲染基线同机位在用户16寸桌面页测真实GPU成本。通过后才允许批量整合正式城市和改变引擎。

## 工作记录：执行、未测与边界

- 本次执行：通过GitHub connector读取 `resource-catalog.json`、`asset-manifest.json`、`CONTINUE.md`、`ASSET_RESEARCH.md`、最新Free原件manifest及上一轮日志，按分类/状态清点并联网交叉校验上述最佳候选的官方发布页、明确排除的NC/付费条件。已核实总数和状态和。没有修改游戏源码。
- 与本记录相关的原件来源情况来自前轮的官方大小/MD5/本机SHA校验；本轮**没有再运行 Blender 多视角渲染、水动画或现场GPU回归**。独立Windows稀疏工作区已做Git独立分支小块推送测试但网络超时；不冒充上传成功。批量模型视觉美术结论仍待实际观察。
- 未触碰项目安全/付款边界：只寻找 $0 CC0/CC BY/经核准开源免费源；未购买、未收费试用、未覆盖正在运行的Codex Einar/龙资产、不强推、不改正式 `src`/`dist`。
- 本记录仅是可交接的审计结论，后续重点看 `AGENTS.md`、`docs/SYSTEM_ARCHITECTURE.md`、`docs/ART_ASSET_EXECUTION.md`、`docs/resource-catalog.json`、`docs/asset-manifest.json`、`docs/CONTINUE.md` 和各资源manifest。任何下载状态必须由仓库实际文件验证，不凭“报告声称”推导远端存在。
