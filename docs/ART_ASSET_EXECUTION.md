# 龙游长安：高质量资产执行与跨会话交接（2026-10-24）

> 本文是**执行入口**，不是已完成美术或可替代 PRODUCT_BRIEF 的新产品方向。每次新 Codex 会话按 AGENTS.md 先读 PRODUCT_BRIEF、CONTINUE、本文，再读 DESIGN_FRAMEWORK / production-contracts / 资源清单和用户三张参考图，检查 main 实况。保持“仅主代理、保护原始文件、不强推”的既有规则。

## 1. 当前实际结论：技术进度与美术质量必须分开

- 游戏已有 Three.js/WebGL、离线 HTML、移动飞行、场景、相机、浏览器和碰撞测试。**不要因美术差推倒这些已验证的系统**。
- `src/10-world.js` 仍大量用几何构件程序化组合城市；`tools/build_timber_shop.py` 是完整木构**研究样板**，不等于可用的电影美术建筑。2026-10-24 的新舟船和自然人体试片仍未获得美术放行。当前正式城市 15 个 GLB 资产来源数没有因此增加。
- 工程测试通过≠造型/比例/材质/同场风格通过；研究源获得≠已在运行时使用。不能用网页预览、资源条数、三角形数、4K 贴图或滤镜当作电影质量证据。
- **优先解决完整建筑类型、自然人体与唐服、连续小龙及木车动作、植被风格统一。** 不因为容易取得小道具就倒置优先级。

## 2. 有约束的制作决策树（不要无限停留在检索）

1. 先看认可参考 `docs/art-direction.png`、三个 concept、`docs/user-references/2026-10-23/` 和现有实际多机位截图；写出差距是轮廓、结构、头脸、布料、材质、构图中的哪一项。
2. 对资产族先核查 `assets/library`、`docs/resource-catalog.json` 和 `docs/ASSET_RESEARCH.md`，防重复研究。找得到**合规、可获得、可编辑且风格可用**的成熟源，则优先在 Blender 重拓扑、改比例/服饰/材质、LOD、导出；并保留原始来源与校验。找不到才针对缺口做专门雕刻/模型工艺，不用一堆 cube/cone 充当角色头脸、自然衣褶和主建筑的最终艺术造型。
3. 每个候选必须分清 `candidate`（只看到页面）、`acquired`（字节、许可、hash、依赖齐）、`technical_pass`（Blender 导入、拓扑、法线、相对路径/贴图、正侧背俯、灰模及加载通过）、`art_pending`、`art_approved`、`runtime_integrated`。缺证据不升级状态；403/401、需登录/购买不能绕过。
4. **最小高质量闭环**：一间单/双层完整店铺（前后侧/院落/楼梯与可走结构）+ 正常人体唐服人物 + 连续拓扑小龙/木车 + 街树，在同尺度的独立 Blender/GLB 验收台制作，并实景截图。先中性光灰模检查轮廓、结构、五官、褶皱和尺度，再查 PBR；一个资产不过关，不在正式城市批量铺开。
5. 独立样板达标且关键主观美术得到用户认可后，合成一条真正可步行、绕后、俯飞的完整街段，再推广。无需为常规研究/可逆开发重复请示，但**不能代用户宣称审美已批准**。
6. 原始高质量 Blender/FBX/glTF 可保留，另做 GLB 压缩、烘焙、KTX2/LOD/实例化供移动设备；用真机测试后调优。别一开始以低模手机预算牺牲主体大形。保持 Three r160 和单 HTML 交付，不凭空迁移引擎。

## 3. 每次会话的实际交付与停止条件

一次迭代至少说明：(a) 具体改善的**视觉差距**及前后相同视点对照；(b) 原始三维源/许可/校验与实际可重建步骤；(c) 正侧背、3/4、俯视与灰模；(d) 技术测试实际执行/失败、未执行原因；(e) 用户尚未认可的视觉项；(f) 哪些资产实际进入运行时、哪些只在研究库。

**严禁**只交付一批研究链接、生产合同、新脚本、漂亮概念图或测试 PASS 就说模型做好。没有真实艺术提升的工程改动需说明其必要性。失败如实记录，首先修正造成最大可见差距的资产，而不是继续扩建旧式样。

## 4. 本次新增真实 CC0 源与适用边界

`assets/library/curated-polyhaven/` 首次保存两套原始、依赖完整的 Poly Haven **1K glTF**（中式屏风和木凳），逐文件对照 Poly Haven API MD5；作者 Kirill Sannikov，许可 CC0。它们适用于近景**物件研究/可改造候选**，并非唐代形制史证或最终建筑与人物资产。没有这两项的 Blender 多视角/实景渲染、美术放行、真机帧率或正式游戏集成结果。细节见该目录 README。

目前仍无法从已记录的 401/403 平台接口合法取得某些拟选完整唐代建筑、衣服、柳树成品；商业候选未购买。**缺少成熟的唐风完整建筑、唐服可动画成品与主角源，不能把这两项小道具当成根本缺口已经解决。**

## 5. 关键文件一览

- 长期目标：`docs/PRODUCT_BRIEF.md`；最新实际状态：`docs/CONTINUE.md`。
- 用户美术否决/比例原则：`docs/FILM_STYLE_RESEARCH.md` 与 `docs/user-references/2026-10-23/`。
- 17 族合同与阶段关口：`docs/DESIGN_FRAMEWORK.md`、`docs/production-contracts.json`、`docs/production-spec.json`。
- 搜索和许可证：`docs/ASSET_RESEARCH.md`、`docs/resource-catalog.json`、`docs/asset-manifest.json`。
- 真实 CC0 候选源：`assets/library/curated-polyhaven/README.md`。
- 本次已执行的工作及未验证项：`docs/worklog/2026-10-24-curated-art-assets.md`。

>