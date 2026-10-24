# 当前续做记录（2026-10-24）

## 最新执行：已同步用户新研究，保留完整高精源（2026-10-24）

- 已 fetch 并快进同步到用户最新 `db20754`，阅读 ART_ASSET_EXECUTION / HIGH_FIDELITY_RESOURCE_LEADS，保留新增屏风/木凳原件及135条目录。进行中修改先stash后恢复，冲突按资源ID合并，两边内容均保留；没有重置、强推或覆盖用户素材。
- **用户最新明确：不要为缩小文件而扣减建模；16英寸电脑桌面页游、质量最重要。** 原手机预算仅兼容参考。原始高精工程/贴图全部保留，默认研究台直接加载80万面/4K龙原件；早期45k/1K衍生有严重破面，已明确否决并禁作默认，生成器默认禁止运行。
- Einar官方约580MB ZIP实际完整取得，原blend无损gzip与全部原始纹理入库（含面部高精位移/服饰/机械臂贴图），CC BY4.0原ReadMe与逐文件哈希保留，72项原件/依赖和gzip恢复校验通过。两只Grab3D龙同时保存原GLB、原Blend、发布者CC0及AI辅助来源披露，不能冒称手工拓扑或带绑定成品。来源/限制见各库README与manifest。
- Einar为现代老年角色，是成熟面部/肤材/毛发工艺源，未变成唐人；幼龙有翼四足，中国龙为盘曲雕塑，均无骨骼/动画，不是已完成无翼小青龙。Scales v2仍需账号，报告内其他收费/账号候选未假称取得；本次公开源访问另遇403，不绕过。
- 先前自然人物与统一组合保留为**用户否决的技术对照**，源生成器固定写入 style_rejected_by_user / production_basis_allowed=false；61骨/真实表情/经营手势的技术检查不能推翻美术否决。证据已持久化 natural-character-preparation。
- 复用既有 model_review 增加原始素材选择器及本站多文件glTF支持，保留原材质与设备像素比。没有新建重复应用或更换引擎。桌面1920×1200/2560×1600原件专项与更高质量原肤材Cycles检查正在执行，最终结果另记，不能提前称通过。
- 当前目录140条、17族、569份库存、41研究GLB技术审计，正式15GLB来源与src/dist仍未改；单文件旧版SHA不变。准备/全城美术仍未完成，不能停止在这批素材或文档上宣称达到最终目标。


## 2026-10-24 10:52 用户最新决策：桌面页游与高精成熟模型第一优先

- 用户认可 Codex 当前在云端找到 Blender Studio Einar 写实面部/服装和精致小龙的**精细完成度作为工艺标杆**，明确拒绝拼接式粗造型、偷工减料和半成品；仍需唐代人物与认可小龙造型的风格转换与合法使用。
- 原手机横屏、单 HTML 离线版、production-spec 旧 45MiB/1K/192MiB GPU 预算均退为**可选兼容口径**。第一发行目标为用户16英寸笔记本上的高质量**桌面浏览器**，允许数百MB至合理GB级资源及服务器/静态站点、多文件/流式加载、缓存；不因旧低配默认损失高质量近景。初始按 16:10 1920×1200 与 2560×1600 QA，真实屏幕分辨率/性能待测。
- AGENTS、PRODUCT_BRIEF、ART_ASSET_EXECUTION 与 production-spec 追加最高优先级的覆盖规则，新增已核实的高精建模候选 [HIGH_FIDELITY_RESOURCE_LEADS_20261024.md](HIGH_FIDELITY_RESOURCE_LEADS_20261024.md)；每个候选分清页面可见/账号或付费限制/许可/实际下载/Blender验收，不宣称第三方来源已经取得。
- 现有 Codex Cloud 会话正在取得 Einar 等素材，避免重复下载、重建、改写其进行中的工作。本轮仅文档/资源候选更新，正式运行时 src、dist、原模型保持不变；未做 Bl​​ender实际导入/渲染和回归，仅做目录结构化统计检查，见 [工作记录](worklog/2026-10-24-desktop-quality-pivot.md)。

## 新增：跨会话美术生产纠偏和已实际入库的 CC0 研究物件（2026-10-24）

- 新执行入口 [ART_ASSET_EXECUTION.md](ART_ASSET_EXECUTION.md)：正式游戏的技术测试通过不等于电影级形体/角色/材质获得认可；下一轮优先成熟合法可编辑源 → Blender 有针对性的改造/专门造型 → 正侧背俯灰模与 PBR → 独立同场街段艺术验证，禁止仅堆程序化几何和资源目录。
- 从 Poly Haven 官方取得原始 1K **Chinese Screen Panels** 和 **Chinese Stool** 两套完整 glTF（各 1 glTF、1 BIN、3 JPG），按官方 API 逐文件 MD5 校验。存放 assets/library/curated-polyhaven/，许可 CC0、作者与链接见 README。二者是未加入运行时的**小道具研究资产**，年代/艺术可用性和 Blender 多视角尚未验收，不代表取得唐代建筑/人物/小龙的成熟生产资源。
- 正式城市的 15 个 GLB 来源、src/dist 与 Three r160 均未改；**不重跑游戏测试冒充新视觉通过**。具体变更、已执行及未执行检查见 [本轮工作记录](worklog/2026-10-24-curated-art-assets.md)。核心缺口和 G0/G1 关口仍然未解除，后续优先新建完整建筑、自然唐服、连续龙的视觉样板。


**新会话入口：先读 [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md) 和根目录 [AGENTS.md](../AGENTS.md)。** 前者保存完整长期目标与验收标准，后者保存工作约束；本文件只承担实际进度交接。用户已经发布环境，并要求继续开发、持久记录要求。

## 最新：三型舟船、实际搭板与准备库存审计（2026-10-24）

- 起始仍是干净work@6dfb352，读取用户指定文件前发现本地main过旧；fetch后安全切main并快进到远端0c0e414，设计框架/目录及前轮恢复素材均已取得，未重建丢弃、reset、强推或覆盖原件。环境当前running/connected、观测spec2匹配，网络unrestricted但API state=unknown；恢复8877。本轮只由主代理工作。
- 资源目录116条、17族合同本地输入复核，新增`tools/audit_preparation.py`一条命令审计460份库内文件、36研究GLB自包含/primitive/贴图上界、7组材质40项原件/派生哈希；实际列表和摘要在`qa-evidence/preparation-20261024/inventory.json`。库存存在/技术检查不等于许可法律结论、美术或真机性能。
- 新`tools/build_boat_studies.py`从统一production-spec读取三型尺寸，实际生成小舟4.2×1.3、轻篷船6.2×1.8、画舫12×3.6m，各3LOD；代码原生中空厚壳、独立舱型、完整甲板/四坡屋面/舱内坐具/端部茶桌/栏杆登船口，以及座/桨/系泊/甲板具名接口。目录`assets/library/boats/construction-studies/`的9GLB不是候选链接，也不冒充最终电影美术；无外部样本/纹理，不改项目整体许可。
- L0/L1/L2面数：小舟6516/2672/1336、篷船8420/3936/2232、画舫23076/8760/2704；各船2–4实际材质批次。另有真实码头/1.2m搭板/透明水面fixture。已修正旋转构件合并导致AABB虚增、船壳/舷条中舷约8cm门槛；近景图暴露码头桩顶与板面共面，也已降低隐藏桩顶并专项复验。不是只让栏杆留洞就声称可上船。
- `boat_study_test.py`检查三型三级LOD共18次r160现代1120×720/强制WebGL1 844×390加载，有限属性、四方向/俯视/灰模、具名接口跨LOD不漂移、甲板/横向入口/头部净空及刚体接口；另两次码头fixture射线连续性与透明材质/灰模保留。Browser插件缺失，使用现有Python Playwright/Chromium SwiftShader；未测试手机真机、真实游戏人物登船或随船搭乘。最终桩顶修订仅改变fixture，9船GLB摘要不变；完整船检查与fixture专项分开留证，不伪装同一次运行。
- 最终生成器离线重跑10GLB逐字节一致；SHA与源摘要见`boats-reproducibility.json`。已看小舟/篷船/画舫正侧背/俯视/灰模及码头近景；技术通过，唐风船形/近景木材/生活陈设/电影光材与负载稳性仍未通过。刚体变换fixture不是游戏乘船实现，射线不是实际控制器步行。
- 人物仍执行自然人体/正常五官；本轮发现MakeHuman目录README留有旧5.5–6.5头身指令，已清除，DESIGN_FRAMEWORK的“重塑比例脸形”残留也改为保持自然结构、调整服饰发型与个体特征。没有改原始OBJ/宏目标/权重，也不恢复被否决的Snow/Rain造型。
- 更新目录、制作规范、合同、asset-manifest研究分区、准备审查、计划与QA。正式src/index/vendor/运行素材包/dist不变，仍Three r160，离线包SHA256 `d9ede61fd366a3cbd2f056aab21b521ca69c75fd0995f41a1884fb3f2230e373`；未重复全城测试、未声称正式船已替换。
- **准备目标继续，不作全部完成/受用户批准阻塞：** 自然唐服的完整剪裁/肩领袖/权重/表情和真实经营动作、连续龙/木车IK、完整店铺/院落/楼梯/LOD，以及植物/材质同场统一仍是关键缺口。新船关闭“没有完整结构文件”缺口；电影美术和动态登乘另待制作。继续这些已授权工作，不要再次把目录数量/研究报告当阶段放行，也不必等待付费候选或新确认。

## 本轮最新：准备核验、补回参考与自然人物纠正（2026-10-23）

- **用户最后纠正优先：唐人保持正常人体与脸部结构，与现代人无本质区别，主要改变发式、服饰、妆容、身份装束。** 取消夸张头眼/头身的方向。Snow/Rain头脸虽为成熟源，但本轮尝试后被用户否决作为人物造型基础，已从最新组合试片撤回，仅保留隔离的拓扑/绑定研究，不可在续做时再默认为优选。电影质感通过模型完成度、材质、光影、表情、动作与真实空间实现，不做简单卡通积木。
- 起始实际为干净work@6dfb352；安全切main，fetch发现origin/main已到7b550b9，快进同步，不把3515f00当当前保证。7组材质/21图核验通过，EZ-Tree固定源码和12LOD离线重生成逐字节一致；恢复专项24次现代/WebGL1加载、文件替换/坏文件保留检查实际重跑通过。未重复下载恢复素材或重新生图。
- 用户三张附件起初尚未落盘，随后实际出现，已逐张查看并原字节归档`docs/user-references/2026-10-23/`。第1张材质联系表、第2张人物/衣服/表情、第3张完整单/双层店铺与侧后/院落，SHA256/原名在manifest。此部分已先行提交推送d57ea17；不再声称人物/店铺图完全找不到，也不能把它们当三维成品或考古图。
- 新增`production-spec.json`（米制/前向/尺寸/色板/屋顶木构/人物/船/光照/镜头/预算）和17族`production-contracts.json`（现有源/取得状态/参数算法/输出/成本/验收/缺口）。资源索引逐项补取得状态、适用场景和改造/手机成本，未取得候选仍不计作资源。**未执行的生成合同不是已完成资产。** 详见`PREPARATION_REVIEW.md`。
- 实际取得Blender Studio Snow/Rain v2官方ZIP与CC BY4.0依据，保留原blend及40项脸/体/眼/发贴图（合计42项原文件）和逐件哈希；完整110.8/199.3MB ZIP仓库外缓存。源内ReadMe也确认CC BY4.0；静态头脸4次r160加载与多视角/灰模通过，**用户否决其夸张造型，不能当唐人生产模型**。原制作rig过重，静态转换没有导出原绑定/表情。`fetch_studio_sources.py`核验/按缓存恢复，禁用源文件自动Python。
- 已根据人物纠正取得MakeHuman固定提交官方`asian-male-young.target`/`asian-female-young.target`，原件CC0与摘要入库；最新`build_preparation_study.py`使用自然成人原比例，不放大头眼，唐代差异主要留给服饰发型。完整基体/骨架/权重保留，衣内人体遮蔽，helper不导出；这些仍不是完整剪裁/表情/生产绑定验收。
- 独立组合`assets/library/preparation-study/assembly.glb`复用完整MIT木构、CC0自然人物源/PBR、原创龙雕塑/木车、新悬垂柳和恢复的alpha针叶；未接入主游戏。支持原验收台正侧背/俯视/灰模/米尺；修复组合导入破坏层级、衣内人体露出、袖轴方向及未引用顶点错误扩大包围盒。小龙含角约1.22m，仍是过简的未通过雕塑，不能直接替换最终主角。
- 灰模验收台现在保留alpha mask/双面/opacity，仅去图像RGB，避免树叶变成实心方卡。新原创植物4种各3LOD保留真实根点/悬垂枝/长叶/五瓣花，恢复12GLB原样不改。新24次现代/WebGL1加载、四视角/灰模/替换通过；已实际看图，枝层仍机械、冠簇与树皮/透光/风动未达电影参考，不放行美术。
- 音景：JC Sounds包确实下载解出4条，但页面评论显示混入所购音库且未公开上游许可链，隔离在缓存，不提交音频为可用资源。`audio-rights-review.md`记录。新原创确定性合成风/水感/木轮/远钟/土路脚步五PCM层，源/哈希/循环/电平及Web Audio实解码/手势时钟通过；**非实地录音、非人耳听审、没有中文叫卖**。人声录制授权/试听仍缺，不代用户联系他人。
- 验证使用现有Python Playwright/Chromium SwiftShader（Browser插件缺失），同一时刻单个WebGL浏览器；不宣称真机或全浏览器/手机本地文件通过。当前完整木构/自然人物服装/龙/树的统一电影美术仍未通过，G0/G1不作全部放行，不能把研究资产和新合同说成准备质量全部达标。
- 下一步直接做自然人体上的完整唐服剪裁/领袖/发式/表情、连续龙拓扑与绑定/木车IK，再重做用户店铺图对应完整类型与LOD/图集，同尺度中性光通过后才进入代表街段/水岸/宫苑。新画舫/轻篷船、双峰驼、经营动作、人声仍按合同制作/取得，不把缺口交给用户重复批准。
- 正式src/index/vendor/运行包/dist保持原样，离线包SHA256仍`d9ede61fd366a3cbd2f056aab21b521ca69c75fd0995f41a1884fb3f2230e373`；本轮未重复构建或冒称整城新美术通过。只在main提交推送，无子代理、无强推、无覆盖用户/恢复原件。
- 最后自然人体版本组合实测完成：`qa-evidence/preparation-20261023/natural-assembly-results.json`及四张精选图，现代1120×720/强制WebGL1 844×390，2次组合加载/有限属性/四视角/灰模alpha/米尺/人物近景，r160、glError0、零页面/控制台/请求错误；当前GLB摘要在结果内。已实际看最终人物近景和手机总览，头眼不再人为放大，但领袖接合/服装厚度与剪裁、肤材表情、龙雕塑仍不合格。新树24次检查、隔离成熟源4次检查/5条声音解码和文件库存也在同目录，后者技术通过不取消用户造型否决。

## 2026-10-24：旧环境未提交研究资产恢复

- 本次起始在干净的work分支（6dfb352）；main/origin/main均为3515f00，已安全切回main。未删除分支、重置或覆盖用户文件。工作树、Git悬空对象和workspace缓存均未找到用户列出的原目录/脚本；缓存保留来源请求、旧预览脚本及独立树木依赖，故按来源重建，**不是逐字节恢复旧成果**。
- 重建 `assets/library/production-materials/`：7组原件，21张512² basecolor/OpenGL-normal/roughness，来源/API/CC0/校验与脚本 `tools/prepare_production_materials.py`。详见目录README；本地哈希校验和尺寸检查通过，不声称已完成电影材质统一。
- 重建 `assets/library/vegetation/ez-tree-source/` 固定提交源码/MIT/叶片及逐文件SHA256；`studies/` 包含street/willow/pine/blossom各3级LOD与完整参数。`tools/prepare_vegetation_studies.mjs`用独立Three0.167.1/esbuild工具构建，重跑12个GLB字节一致，不升级正式r160。
- `tools/model_review.html`补回本站GLB路径查询、本地文件选择、自动包围盒取景/缩放范围/裁剪面/地面与阴影范围；保留已有多视角、灰模、米尺。加载错误保留前一个有效模型，替换时释放旧模型资源。
- 本次浏览器结果见 `qa-evidence/resource-recovery/results.json`：Chromium SwiftShader现代1120×720及强制WebGL1 844×390，共24次GLB加载、包围盒取景、四视角/灰模、本地文件替换和无效输入保留通过，glError0、无页面/控制台错误。只验证这次重建产物和验收台，不沿用旧图冒充本次证据。已实际查看四类截图；原压缩包叶片为LFS指针导致首测纹理加载失败，已按LFS SHA256/大小取回图片并重生成后复测，失败版本未计为通过。非真机/全浏览器验收，最终美术仍为false。
- 四种植物仍是研究样板：垂柳冠形仅近似，花树仅给绿色橡叶乘粉色，实际截图偏褐，不能作为花朵成品，树皮未完成，风动不在静态GLB中；未获G0/G1放行，未替换正式城市。src/vendor/正式运行素材包/dist保持不变，不重建整个项目。
- 两张新增人物/店铺设计图**未找回**。workspace保留的6张生成图片逐一hash对应现有art-direction、market、palace、qujiang、dragon-turnaround、barge-study，没有人物/店铺新图；不伪造、不用旧图冒充。以后取得原文件再入库。

## 最新用户阶段：总体设计与资源研究先行，暂未正式整合

- 最新要求：“先把总体的设计框架确定准确，把我要的元素都构思好具体怎么样才是对的，怎么改合适，联网找到所有需要的素材、材质包、模组、引擎、素材库等等，然后再开始正式整合。” **本段优先于下文旧的‘下一步直接改善单栋/铺实景’。** 不开子代理，不重复环境搭建，不继续批量添加旧造型。
- 已重看认可市集/宫苑/曲江概念与当前市集运行基线，完成 [DESIGN_FRAMEWORK.md](DESIGN_FRAMEWORK.md)：历史/幻想边界，10类地区体验，7类完整建筑族，小龙/木车/唐服人物与动作、6类经营活动、园林/桥廊/舟船、材质/日夜/镜头、引擎/管线/手机预算、G0–G4关口。所有尺寸/预算是待测制作起点，不是考古定论或已通过性能。
- 扩大实际联网研究并保存 [resource-catalog.json](resource-catalog.json)：109条具体资源/工具/史料记录，76条有实际预览图检查，包括Fab完整模块/人物、Style3D唐服、BlenderKit/Free poly古建、舟船/柳树/双峰驼、23个材料、7个声音源及博物馆唐器资料。详见 [ASSET_RESEARCH.md](ASSET_RESEARCH.md) 最新表；候选/否决不计作下载素材数量。
- 按认可概念另生成并实际看图 `concept-dragon-turnaround.png` 与 `concept-barge-study.png`，分别补充小龙正侧背/走骑飞、画舫侧面/舱内俯视/端部方向。二者是新辅助设计研究，未获用户新确认，不是精确工程图或三维模型；小龙尺标/车传动、画舫登船口/吃水/屋顶与跨视图一致性问题已在DESIGN_FRAMEWORK写明，必须用同源三维参数校准。没有作为平面模型/游戏背景导入。
- 新取得MakeHuman官方固定提交 `a8bc2d54ff0ac92e78ff71431b1023eda42bf482` 核心CC0基体、163骨架及实际引用权重，位于 `assets/library/characters/makehuman-base/`，含完整CC0、许可分离说明、逐文件URL/SHA256。19158顶点/18486面（含辅助部分），有限坐标/有效面索引、骨架/权重JSON通过；没有导出成品GLB/做服装/动作，不是已完成唐服人物，不增加15个运行GLB计数。
- 重要取舍：保留现有Three r160/Blender/静态+单HTML路线。EZ-Tree MIT可独立工具生成GLB，peer Three≥0.167，不能直接塞入r160；MPFB插件GPL/核心图形CC0分开；商业UE包的Groom/Lumen/Nanite/PCG/Chaos不在浏览器自动可用，需通用可编辑源与烘焙/绑定路线。付费原包不可当公共素材库提交。声音源只读元数据，本轮未试听。
- 具体访问边界：Sketchfab结构/唐服/画舫下载实际401；BlenderKit两件CC0/isFree古建下载接口403；BlendSwap检索403；无绕过。两个漂亮幻想楼参考了他人概念，柳树明确使用Megascans，重复双峰驼上传许可冲突，均没有据标签直接采用。没有购买、登录、联系作者或取得影视资产使用权。
- **G0准备仍未放行正式整合。** 主要缺口：小龙/画舫新设计的跨视图与尺度校准、连续网格/表情骨架；完整唐风建筑类型与LOD/材质；可编辑唐服与统一人物/营业动作；完整画舫/游船原件及登乘；专门柳/松/花树形；经试听的离线中文叫卖/音景。已有明确来源路线和改造合同，但不声称所有生产资源已取得。
- 下一步按缺口取得/核验可用原件并完成专门设计页，利用已有模型验收台检查候选和新完整类型；通过G0/G1后才把代表性街段、宫苑、水岸正式整合。不能以搜索链接、现有7.3万面木构样板、增加物件数量或后处理代替美术关口。
- 本轮正式 `src/`、`index.html`、`vendor/`、运行素材包与离线HTML不变；正式游戏仍为下文18,693,882B、SHA256 `d9ede61fd366a3cbd2f056aab21b521ca69c75fd0995f41a1884fb3f2230e373`。研究验证见 `qa-evidence/design-research.json`；不重复声称跑了与本轮无关的整城/真机测试。

## 最新用户纠正：基础造型返工优先

- 用户明确指出“不是只有精细度，而是建筑、人物、风景建模本身就不对”，认可生图方向，指定详细研究《长安三万里》《大理寺日志》。不要把下一步继续写成增加旧模型密度、瓦片、滤镜或随机摆放。
- 已完成公开资料/图像研究和代码诊断，见FILM_STYLE_RESEARCH.md：三维市街/水岸、人物服饰设定、长安城坊布局制作图、大理寺院落与临水木构背景均已实际看图。核实《大理寺日志》主要背景为武周洛阳，不能把洛阳城图直接当长安。未观看完整影片或逐集全番，不声称取得制作模型或影视资产授权。
- 当前方向：以《长安三万里》的风格化三维/电影质感与认可概念为主，借鉴《大理寺日志》的木构/院落/造型与色彩组织。先做完整建筑和人物/小龙的建模试片，经多视角/中性光对照后再铺代表街段、水岸与宫苑，最后推广全城。
- 本轮此前已有内街/退廊实验：东西市各4间内街店铺；二层实际退进、楼板/格窗/支承/木地板、共享人物和CC0器物/蕨类。它们保留作空间与通行基线，**美术未通过，生产模型仍需替换**。
- 环境后续观测版本变为5，running/connected，网络mode unrestricted但state仍unknown。实例切换使旧/tmp产物和服务消失；已恢复8877，最新临时诊断转存仓库外 `/workspace/.environment/changan-dragon/`；重要最终记录应继续存仓库，不能依赖易失路径。
- 最新包18,693,882B，SHA256 `d9ede61fd366a3cbd2f056aab21b521ca69c75fd0995f41a1884fb3f2230e373`。新字体子集433676B，15GLB来源保持不变，8动物、192共享行人和46位共享楼廊观景人物；不把这些数量当成美术质量。
- `qa-evidence/market-traversal.json`：该包844×390真实键盘/运动求解走完东西市目标路线并进入全部8间内街店铺，地面y=.55；模式切换、飞行、赏景返回、44px控件、断网medium通道、1120×630固定建筑视点，glError0、零外部请求/页面/控制台错误。此JSON的初始成人包围体误含气泡，已明确备注并另行改用真实mesh测量；初始手动“gallery”机位贴入梁底，已修正测试机位并在源码专项重新拍摄，未把旧坏图作验收。
- `qa-evidence/source-model-review.json`：当前源码入口实际使用用户原r160，强制WebGL1、9蒙皮、楼廊几何渲染、手机布局、飞行/赏景与high安全回退，glError0、零页面/控制台错误；新机位图 `gallery-model-baseline.png` 已看。修正的纯网格尺度：小龙约2.20m、男成人1.65m、女成人1.84m，证实主角相对尺度也需要重做。两张model-baseline是**未通过美术的当前基线**，不是电影级成品截图。
- 首件完整木构研究样板已经开始：`tools/build_timber_shop.py` → `assets/library/architecture/timber-shop/runtime.glb`，独立验收台 `tools/model_review.html`。先检查灰模、正侧背与俯视；修过侧坡缺瓦、斗拱穿屋面、腰檐侵入楼廊地面。新生产模型尚未替换正式城市，材质/生活陈设/LOD与类型变体仍需继续，人物/小龙/景观也尚未重做。详见FILM_STYLE_RESEARCH第7节和样板README；不退回随机加物件的旧路线。
- 当前样板73096三角形、19网格、2,587,440B，SHA256 `a05e98a19167431ad7fdd93f323738c79d59291754c3cb79efb351d42df1103c`，GLB根节点内嵌完整MIT构件通知。`qa-evidence/timber-model-study.json`：现代1120×720/强制WebGL1手机844×390，有限几何、正侧背/俯视/灰模/米尺通过；楼廊3处从主屋顶下方射线均命中木地板y≈3.985，未误中腰檐；glError0、无页面/控制台错误。对应色块/灰模图已实际查看，**仍不是最终电影美术通过**。
- 主游戏未加载该研究样板，正式15GLB与18,693,882B离线包保持原测试版本；不能说新模型已经替换全城。下一步从已有样板继续改善结构/材料并做LOD与整场景；不用再创建一套验收工具。可编辑.blend缓存可丢失，生成脚本、MIT构件数据和GLB都应从Git恢复。

## 最新接续：长期要求归档与环境恢复

- 新增PRODUCT_BRIEF和AGENTS，README首屏提供入口。明确国漫电影/真正三维、完整长安生活场景、横屏手机、三种移动、多视角、成熟素材整合与循环精修；明确不再开子代理、main开发并及时推送、功能与美术分开验收。
- 已核对发布后当前实例running/connected，spec_revision=4且观测版本匹配；网络文件显示unrestricted，状态API策略state=unknown，不能沿用旧版enforced结论。无凭据/账号依赖。恢复了本项目8877静态服务；不是仅凭“已发布”就声称所有运行检查完成。
- 随后用户进一步纠正基础模型语言；以顶部“基础造型返工优先”和FILM_STYLE_RESEARCH为最新方案。下文城墙“待实施”旧建议已完成，以末段城墙/HDR验收和实际main为准。

用户要求继续完成唐代长安真正三维的小龙自由探索产品：国漫电影美术、宏伟建筑、丰富坊市/商旅/行人/画舫/游船/亭台连廊，横屏手机浏览器，步行/木自行车/飞行、多视角与电影赏景。当前可玩但视觉仍未达到认可概念，不得称为AAA、最终成熟或已完成全部需求。概念图只用于参考，绝不作为3D背景替身。

## 工作约束与文件安全

- 工程 `/workspace/changan-dragon`，main分支。原成果 `9493a63` 已按用户要求快进合并并推送到origin/main，独立备份分支codex/changan-dragon-progress也保留。后续在main继续，完成检查后提交推送，保护用户文件，不reset或强推。
- 用户明确停止新子代理以节省额度，由主代理继续。未创建定时“继续”消息，当前没有可靠的会话定时工具。
- 用户授权不限域名网络；配置草稿保存 `allowed_domains:["*"]`。历史spec3曾观测策略enforced；发布后的新观察见顶部，不将旧实例的版本/状态冒充当前验证。
- 2026-10-23用户说原本地剩余文件已上传。已核对远端main `39357e2d13c42c069e7341cd42face4e93c2040e`，只取回本地缺失文件并逐一校验Git blob SHA1，保留所有本地改动。新取回 `vendor/three.min.js` 与3张旧版验收截图。原引擎SHA256与本地兼容包完全一致（Three0.160.1），可直接使用原入口。导入清单见 `upload-import.json`。此远端树没有22张独立PNG；现有代码素材/运行模型自包含，不因此停工。

## 已实际实现

- 本地静态HTML/JS/WebGL；独立r160兼容引擎、官方GLTF/RGBE/PMREM/Water/SAO/Bloom/Output/FXAA/SkeletonUtils。原上传r160引擎优先，单文件固定校验兼容包。自动手机流畅，medium/high增强渲染。
- `04-compatibility.js` 新补WebGL1蒙皮：采用Three r150官方MIT骨纹理读取公式，为每个骨纹理宽度注入uniform，含蒙皮阴影材质。修复r160在WebGL1使用textureSize/texelFetch/int取余导致尾巴、马鹿消失。WebGL2不修改。低能力水面走兼容shader，不尝试HDR倒影。
- 核心/渲染05/表面06/水面07/导入08/植物09/城市10/地标12/人物20/探索25/存档27/循环30分模块；新增11-shorelines沿湖园路模块；两处脚本清单位于src/boot.js和tools/build_standalone.py，增加模块必须同步。
- 程序柳/桃/松真实枝叶，空间合批/近远几何、地面高度、树干碰撞与飞行冠层包络。成熟作者树8处。共享镜头和庙阶/宫阶/街铺种植净空。
- 软边噪声云/昼夜天空、HDR只作环境光；圆角几何正确归一；城市土色与局部园地、实比例石材/近景圆角铺路石、空间地面高度索引。
- 含元殿重檐庑殿裙顶+真实木构上层/歇山顶、逐开间屏门格窗、斗拱、真实盖瓦条；城门上层窗廊/栏杆、下层木门金钉；upperStorey避免楼上出现巨大石台。
- 店铺可进入、布幔矢量团花边饰+CC0织物法线、弧形摊篷、实物货架/藤篮/陶器/木器/新鲜果品。圆润陶器24段、布卷改真实布材质，作者木碗/姜对齐实际柜台。
- 玉色大眼小龙、连续7骨骼尾、分叉角/鬃毛、真实木自行车/脚踏与步行飞行动画。188位共享实例行人与原有商贾守卫等，服装顶点mask织物微法线、闭合肩口、衣摆/肢体/阴影GPU步态。5位胡商复用作者面部/头发，唐风圆领长袍和头巾由代码实现，不采用西式服装。
- 8只CC0马鹿，独立骨架与原作者Walk/Idle/Eating，4匹马真实巡游；动态蒙皮未合批，静态素材按几何/材质/64米空间合批。
- 四跟随镜头、近墙/摊位避障、开场右侧实景小龙、8处景点、电影镜头/暂停/留影/返回、横屏单行44px控件、本机存档/存储禁用回退、触摸摇杆/双指缩放/飞行升降。
- 水上长廊/湖心亭/桥面/码头/停泊画舫/商铺/宫阶实际可走。诗笺可选，主路诗笺移到路边15.3/350、缩小弱化；电影时隐藏。

## 正式素材与体积

- 当前15个GLB源：13个Poly Haven CC0（陶锅、木凳、藤篮、木碗、木桶、苔石6形、阔叶树、蕨、草、姜、荔枝、亚洲梨5形、石榴），2个Quaternius CC0（马、鹿）；另2种Quaternius索引几何：Farmer面部1577顶点/2976面，以及Ships Pack中空小船790顶点/1460面。
- GLB二进制7,182,492B，runtime-models.js 9,582,151B。市场果品约900余处实例，单次布局总计约1045–1075个逻辑模型摆放（代码消耗固定随机序列，改布局会改计数）；实际对象约273–280，不能将逻辑数误称绘制调用。
- CC0瓦/灰泥法线粗糙、布料normal/ORM、Venice Sunset HDR；MIT miniLibs斗拱与Three；OFL马善政字体子集433168B。原许可/作者/源哈希/优化元数据保留在assets/library。Quaternius旧CC0包使用固定公开镜像commit722c39e…，作者具体许可页也保存，未用镜像仓库许可冒充模型许可。
- 最新单文件 `dist/changan-dragon.html` 18,687,084B；源变动后重建。内嵌代码/字体/材质/GLB/许可，加载后移除脚本DOM并释放GLB原base64，保留解码共享资源。
- Ships Pack小船已加工接入：22mm三段圆角/加权法线，保留作者中空轮廓与木色分区；数据在assets/boat-hulls.js，源文件、CC0作者页、固定镜像SHA和加工元数据在quaternius/boat_hull。船板/坐凳/桨座/人物/双桨/尾流为可编辑JS。

## 最新测试证据（不要把旧测试当最新）

- `/tmp/changan-round9-fixed-qa/results.json` 通过：844×390完整交互、667×375与390×844布局。首次round9因旧诗笺坐标夹具失败，已修正并检查“旧主路无提示→新路边拾取→刷新”。该轮早于最后果品/兼容层改动。
- `/tmp/changan-offline-round10/results.json` 通过：15GLB源、真实长廊/亭/画舫/铺面/宫阶通行、刷新地面y=.117、断网high SAO/Bloom/FXAA/曲江倒影/PNG，零外部资源请求/页面与控制台错误。早于最新树净空/WebGL1层。
- `/tmp/changan-webgl1-acceptance/results.json` 最新单文件兼容专项通过：强制WebGL1、16属性、floatVertexTextures=true，9个蒙皮网格（8动物+龙尾）、动作变化/飞行/赏景/高画质安全回退、glError=0，无页面和控制台错误。真实截图dragon-and-rigs.png已查看。
- `/tmp/changan-food-integration/food-counter.png`与log验证15来源、果品实例、base64释放，无异常；首次果品第五颗悬浮已改成同高度平摆，托盘比例和陶器布卷已后续精修。
- `/tmp/changan-round6-art/`相机距目标5.79m，地面空间索引与穷举误差0。`/tmp/changan-entry-review/entry.png`确认hero在右侧画面内。`/tmp/changan-merchant-review/merchant.png`已人工检查闭合肩口/作者脸/腰带。
- Browser插件当前缺失，Python Playwright + /usr/bin/chromium SwiftShader；同一时刻只跑一个完整WebGL浏览器。软件渲染不证明实际手机帧率。管理策略阻止file://，不绕过；单文件以HTTP取文档再断网验收，未宣称手机本地文件已测。

## 合并main后的舟船与湖岸精修

- 画舫龙骨从水面上方下延至局部y=-.22，保留停泊甲板1.11及登船通行面。小船替换为作者真中空船壳，龙骨-.20、舷边.63，增加木板横凳/桨座/划桨人物/同步双桨。每船独立动作相位，浅尾流跟随水面/昼夜，人物远景裁剪。
- 曲江增加小型碧帘画舫；总共6船，含2移动画舫、1停泊画舫、曲江2小舟和兴庆1小舟。旧小船航线中心两次各有6/256采样落在低桥上，现改分离航线并按米/秒设小舟速度。
- 新11-shorelines：曲江东岸2.4米宽园路，随真实湖岸并绕开作者石块/树根/亭柱。225几何中心点、地面高度索引、岸边低栏柱碰撞、柳桃与共享CC0蕨草地被。树根避让道路；栏杆独立沿岸布置，避免凹弯栏柱侵入邻近路段。
- 首轮点采样通过后，真实走路暴露弯道问题，已增加路径细分/根部净空，并检查每20cm细段；栏柱和路面分开沿岸布置后重跑通过。保留失败原因，不把失败目录称为通过。
- 水域碰撞由旧椭圆改为真正ShapeGeometry的多边形，小地图同源。湖心岛通行边界与17×12m实际平台一致；修复可见水面能走、可见干岸不能走的问题。低档水面减白色Fresnel冲淡、增加细波，柳叶投影面积提高但没有增加叶片三角形数。
- `docs/qa-evidence/boats-and-shore.json` 对应 `/tmp/changan-boats-final4/results.json`：最新单文件通过。6船每条512位置，真实变换后的船壳足迹/桨范围对可见水多边形、岛、桥检查无侵入；15组独立航线包络最小间隔约.542m。11163个水域网格与画面轮廓无不符；园路细段无碰撞；224个连续目标由真实键盘+updateMovement求解走完，仅设置起点，未注入终点。实际1120×630/844×390截图、船动作、glError=0和零页面/控制台错误均通过。
- 上一轮round12动作检查两时点恰遇正弦对称，夹具误报不动；现观察三个时点，真实动作变化已通过。旧final/final2/final3发现路面转角/栏柱问题，最终通过目录是final4。
- 最新单文件offline_test已通过（/tmp/changan-offline-round15/results.json，仓库证据offline-boats-shore.json）：四处真实通行/宫阶/刷新存档、断网high倒影+SAO/Bloom/FXAA/PNG，零外部请求/页面/控制台错误。WebGL1也已通过（/tmp/changan-webgl1-round16/results.json，仓库证据webgl1-boats-shore.json），9蒙皮、飞行/赏景/高档安全回退、glError=0、零错误。

## 林下镜头专项（舟船提交之后）

- CityBotany新增每片叶/花瓣共享的局部anchor属性，顶点阶段检查相机近距与镜头到小龙头部视线；只移除遮挡的整片近叶，树干和远景树冠保留。赏景关闭小龙视线净空，仅保留相机极近叶片处理。并未把树木变为平面背景。
- 初次抖动透明方案在截图有明显噪点，已弃用；整叶方案已实际看图通过，见qa-evidence/shore-camera-before.png与shore-camera-after.png。实现只作用程序柳/桃/松；导入作者阔叶树仍使用源材质。
- qa-evidence/foliage-camera.json：最新17,174,676B单文件手机844×390，林下追随/切镜头/电影焦点关闭、断网high FXAA/SAO/Bloom、glError0、零外部请求/页面/控制台错误。相应/tmp/changan-foliage-review下有侧拍和断网高档图。
- qa-evidence/webgl1-foliage.json：同版本WebGL1兼容通过，新增森林机位/叶片遮挡检查，9蒙皮、8动物姿态、飞行、电影和安全回退均正常，glError0、零错误。
- 源码页浏览器自动请求favicon.ico产生404，已增加本地内嵌SVG品牌图标；没有忽略本轮错误，修改后最新单文件复验全控制台通过。

## 继续工作优先项

1. 舟船/园路4f16bf4、林下遮叶e26a2ef、城墙/HDR保护03fcb0f及验收92c6963已推送main，不重复当作未做事项。
2. 先读FILM_STYLE_RESEARCH.md，按用户最新纠正重做建筑、人物/小龙与景观的基础造型。认可概念与两部影视是具体对照来源；不能把继续加细节当成主要修复。
3. 若新增素材继续核对具体作者许可、固定来源/hash、真实3D预览，再做代码整合和实际浏览器检查；不以概念图当场景。
4. 每次改动后做相关真实操作/截图验证、重建单HTML、提交推送main并更新最新状态。需要真机的验收仍明确保留，不由软件渲染推断。

## 环境与命令

Python3、Node24、Blender4.3.2、fontTools、Playwright和Chromium已安装。Three0.160.1/esbuild0.25.12开发依赖在 `/workspace/.environment/changan-rendering`，不要把构建缓存放入仓库。无需账号、API密钥、后端或应用npm安装。

```sh
cd /workspace/changan-dragon
python3 tools/prepare_assets.py
python3 tools/build_standalone.py
python3 -m http.server 8877 --bind 0.0.0.0 --directory /workspace/changan-dragon >/tmp/changan-http.log 2>&1
python3 tools/smoke_test.py --url 'http://127.0.0.1:8877/?quality=low' --viewports landscape compact portrait --output /tmp/changan-review
python3 tools/offline_test.py --output /tmp/changan-offline-review
python3 tools/compatibility_test.py --output /tmp/changan-webgl1-review
```

修改addons后 `node tools/build_rendering_addons.mjs`；修改采用的GLB后 `python3 tools/build_asset_bundle.py --bundle`；字体覆盖修改后 `python3 tools/subset_font.py`。历史详细记录保留在CONTINUE_HISTORY.md；以上当前记录优先。

## 城墙与有限HDR渲染（本轮最新）

- 新clay_plaster（Poly Haven / Amal Kumar / CC0）1k法线与粗糙度已正式接入，约2m物理尺寸、官方MD5/SHA记录、许可和加工说明齐全。开挖土壁否决，柳树皮仅候选。新增PBR不计入15个GLB来源。
- 城墙下宽上窄、物理UV、薄石基/压顶，保留原最大碰撞/飞行包围与城门开口。新SurfaceLibrary.rammedEarth控制暖色夯层和微表面；原Three引擎与addon文件保留不动。
- 人工看图发现“启动/控制台通过”仍可能高档近看全黑。现在维护tools/rendering_test.py，验证实际图像、原故障点和FOV变化；所有派生材质与实际通行都要看运行图。
- 诊断证据确认场景HDR输入18个NaN像素被泛光扩散。补上逆投影同步只是独立修正，单独禁用AO不解决；不能再说根因已确认为AO或法线。修改normalMap/切线/基础材质/环境的临时对照也未消除，所以基础着色/驱动的精确来源仍未确认。
- 已在泛光入口过滤非法值，在输出阶段用有效邻色重建非法像素；有效像素不改变，泛光/AO/FXAA/ACES保留。详细证据和取舍在RENDERING_DIAGNOSIS.md，原始GPU读回在qa-evidence/hdr-invalid-diagnostic.json。
- qa-evidence/rammed-walls-rendering.json：最新18,687,084B单文件现代1120×630/强制WebGL1手机844×390，9段墙有1024²法线/粗糙度、UV与收分；实际穿门397→364.946；断网切高档与FOV43/58/35真实图像通过，黑区比例0、原故障点RGB212/189/159、glError0，零外部请求/页面/控制台错误。截图wall-black-before.png与wall-close-after.png可对照。
- medium通道最后补测已通过（qa-evidence/medium-rendering.json，/tmp/changan-rendering-medium-final）：FOV43黑区0、均亮184.38、原故障点RGB212/189/159，glError0、零外部请求/页面/控制台错误。源码与本轮城墙/HDR保护已推送main提交03fcb0f，后续只补充验收记录。
- 下一步应继续对照认可概念提高建筑/人物/园林层次，当前视觉仍远低于用户AAA期望。有限值防护已解决可见扩散与细线，但未确定底层输入NaN来源，可保留GPU诊断路径供后续硬件比对，不要假装已取得手机真机结论。
