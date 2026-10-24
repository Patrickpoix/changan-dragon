# 龙游长安：全域电影级美术与长期架构总纲（2026-10-24）

> **新会话必须先读本文件。** 本文唯一负责架构与系统边界；PRODUCT_BRIEF 负责用户需求，DESIGN_FRAMEWORK 负责世界地区与历史，production-spec.json 负责制作数据，resource-catalog.json / asset-manifest.json 负责资源权利与取得状态，CONTINUE 负责最新实绩。禁止再建平行权威文档/数据库。**本文件是经过公开资料核实的设计/技术决策研究，不是软件迁移完成的声明。**

## 最高优先级

用户已决定将16英寸笔记本桌面浏览器作为首发目标，允许数百 MB 乃至合理 GB 级美术资产、服务器/静态托管和按区加载。**所有**建筑、宫阙、亭台、街市、院落、人物、服装、小龙、桥、水岸、树林、山石、舟船、声景都应完整精细，不能以低质积木、静态半成品或技术测试 PASS 代替电影美术。湖面应当有随太阳与镜头变化的波光粼粼；弯曲小溪应有沿河道方向持续潺潺流动的**实际动态图像与可定位声音**。自上而下设计地区与体验，自下而上依据成熟模型、真实水效果与兼容性反证结构，避免补丁叠补丁。

**用户本次明确授权比选乃至替换现有 Three.js、渲染器、水/物理引擎、模块结构、资产格式和分发方式；不能引用旧“固定 r160 / 单 HTML”约定阻止更换。** 但迁移前必须用相同源资产进行独立技术 A/B，保护当前同时运行的 Codex Cloud 线程与未提交文件。当前正式运行时仍是 Three r160；没有做更换。

## I. 自上而下：城市与玩家体验

- 总体世界以明德门、朱雀大街、东西市/里坊、宫阙、兴庆宫、慈恩寺、曲江、坊巷和可进入庭院联通；步行、木车、飞行可地面/侧后/屋顶/高空连续游览，城市地图和道路高程唯一来源。
- 每个 district/chunk 对应实景入口与地形、通行道路、楼阁/庭院内外、NPC/货物/营业、植被树冠、桥/水网、昼夜光、3D 声源、LOD 与预取边界。不同地区有自己的故事和美术节奏，但尺寸、色彩/材质、风/光/声使用统一规范。
- 资产分为完整的高精**家族**：宫殿/楼亭/商铺/普通院落、男女自然人物与唐服、高完成度连续拓扑的小龙和木车、成年动物、园林/柳/花树/岩石、水面/溪底/河岸/桥/舟船、室内/交易/活动道具。建筑必须四向+可进入区域，人物必须正确头脸/表情/服装厚度与剪裁/骨骼动作，流水必须有运动与交互。不能用画布背景或稀疏几何冒充。
- 优先完成一片含店铺、宫/院型、真实溪桥、柳树、人物/主龙的**完整代表区域**，在近景、背后、桥上、桥下、俯视、动态连续视频中都成立，合格后才推广全城。

## II. 自下而上：以实物决定技术

- 每件资源记录原始 `asset_id`、生产源 (.blend/.fbx/.usd/.obj)、作者/许可证/是否允许再分发、来源及 sha256、材质/骨骼/动画/UV、可修改性、原始高精版与发布 LOD。只有页面预览/下载按钮时仍是 candidate；下载实际文件+hash 与许可核实才是 acquired，真正 Blender 多角度+GPU 真实动态测试通过才是 technical_pass，美术由用户批准。
- 实物可用性按“正、侧、背、俯、灰模；近景 PBR；动画/姿态；遮挡/室内外尺度；唐风与别家模型统一；高画质 GPU 成本”顺序检查。高精源与运行版分离，优化用 glTF 2.0、KTX2、meshopt、LOD/实例化，不能通过降低造型水平换小包体。
- 从角色 IK/水流方向/船体吃水/桥面高度/树林冠形的真实可见效果反向检查资产接口与地区布局；发现矛盾返回最上游的数据和模型修，不要往 shader、碰撞、地图分别打独立补丁。

## III. 单一权威架构（候选接口，未上线）

| 领域 | 唯一数据权威 | 消费方 | 不允许 |
|---|---|---|---|
| World/District | 真实地形、坐标、道路和区块/邻接 | 场景/相机/导航/流式加载 | 镜头、碰撞、地图独立写另一份地形 |
| AssetRegistry | 来源/许可证/源SHA、版本、LOD、绑定及派生文件 | Blender、导出、loader、许可审计 | 研究 URL 冒充成品或做多份注册表 |
| Rendering | backend、PBR/植被/水、光与后处理配置 | 各模型物件 | 每个物件脚本私有 onBeforeCompile 打补丁 |
| WaterDomain | 同一水网 spline、真实水面/河床、多边形、速度/深度、桥墩/船交互、声音配置 | 水材质、声音/地图/碰撞/航行 | 水画面和可行走边界不一致 |
| Simulation | 角色状态/动作、交通与市集经营、船舶 | 画面/物理/声音 | 游戏规则绑死某个图形 API |
| World Streaming | chunk/portal/资源引用与生存期、预取、GPU 释放 | UI/游戏视景 | 全城模型首屏同时加载 |
| Evidence | 统一场景/机位/日光/录屏与 GPU 指标 | 技术和艺术双验收 | 测试 PASS=“用户视觉认可” |

最小逻辑数据：`DistrictChunk{id,bounds,neighbor_ids,asset_refs,colliders,water_refs,audio_emitters,spawn/portal_refs}`；`AssetRef{id,source_sha,license_id,glb_variants,material_profile,skeleton_profile?}`；`WaterBody{id,bed_geometry,polygon,spline?,depth_field,velocity_field,surface_profile,foam_profile,obstacles,boat_profile,audio_zones}`。先在 A/B 试片确认，再确定单一正式 schema；此阶段**不要**实现两套 registry。

## IV. 引擎研究：现在有权改变，必须先比选

| 候选 | 长处 | 风险 / 应测之处 | 初步态度 |
|---|---|---|---|
| **现代 Three.js + WebGPU/TSL** | 保留运动/资产 JS 基础；WebGPU 高级节点材质与 WebGL2 fallback，生态丰富 | 官方明确旧 `ShaderMaterial`、`onBeforeCompile` 和 `EffectComposer` 不兼容 WebGPURenderer；r160→新版有较大迁移，WebGPU 路径仍有实验性限制 | 首个 POC，先按官方迁移指南做技术映射 |
| **Babylon.js** | WebGPU/WebGL2、完整动画、场景、FrameGraph、成熟 PBR/WaterMaterial/音频/物理、大场景能力 | 原有 Three 模型/碰撞/脚本需迁移；默认水材质并不会自动实现弯溪流向 | 并行独立 POC 强候选 |
| **PlayCanvas** | JS/TS、WebGPU/WebGL2、ECS、动画、异步 glTF、资源流式加载及成熟游戏运行时 | 现有代码全面更换 API，溪流/水材质插件实际支持需验证 | 第三候选，比较生产效率与长远可维护性 |
| **Unreal + Pixel Streaming** | UE 场景制作和高端画质可由服务器渲染后通过 WebRTC 在浏览器玩 | GPU 服务器、视频编码/网络、长期成本、平台许可、非浏览器本地 3D；需重做已有前端 | 本地网页画质无法满足时的备选 |
| **Godot Web** | 完整编辑器与原生游戏系统 | 官方 4.x 网页端目前只能走 WebGL2 Compatibility，不支持 Forward+ 浏览器渲染 | 当前优先级低 |

证据与官方链接：[Three WebGPU](https://threejs.org/manual/pages/webgpurenderer)、[Three Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)、[Babylon](https://www.babylonjs.com/specifications/)、[PlayCanvas](https://developer.playcanvas.com/user-manual/engine/)、[Unreal Pixel Streaming](https://dev.epicgames.com/documentation/unreal-engine/pixel-streaming-in-unreal-engine)、[Godot Web](https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_web.html)。

**选型关口**：用**完全同一套**高精角色/龙、完整木构/屋顶、桥溪/柳岸、湖面、天空/光照/同机位输入进行隔离 A/B。至少现代 Three WebGPU/TSL 与 Babylon；PlayCanvas 如有实际优势也跑。同一台真实 PC 的 16:10 1920×1200、2560×1600（仅参考测试窗口，用户面板实际像素仍未知）记录 CPU/GPU、冷/热加载、95p frame time、峰值 GPU memory、draw calls、反射/流向画面、骨骼/动画、键鼠/飞行、资源恢复与接口复杂度。根据**实际电影感/稳定度 + 迁移成本 + 长期开发和维护**决定唯一主引擎。实验放在隔离工作树/分支，不覆盖 Codex 正运行的 main。先留可回滚 commit、下沉与 renderer 无关的世界接口，再系统迁移；切换后清理旧 backend，不让多个游戏核心长期共存。

## V. 水系完整质量规格

**不接受**一个蓝色半透明矩形、一张静态贴图或所有水域统一沿世界 X/Z 轴滚动 normal map 来模拟不同河段。

1. **曲江/湖泊**：曲面有连续微波，太阳高光/glints 随摄像机与时刻物理合理移动，环境倒影随树、桥、建筑变化；浅/深水色、Fresnel、折射可见河底，靠岸泡沫/湿地过渡、船桨和船体尾波。
2. **小溪/缓流河**：三维河床、有坡度中心 spline、宽深变化；单一连续 `v(x,z)` 速度场的局部切向投影控制法线/泡沫/漂浮物与水纹的前进；弯道能转向，石块/桥墩处产生局部涡旋、细泡沫、急浅滩涟漪；清澈区能透视卵石/沙泥底。别把正常河流当真正海浪 FFT。
3. **跌水/瀑布/渡槽**：水面高度在落差连续变化，跌坎水沫/水雾/小规模粒子、附近声压变化；可用 flowmap、spline、粒子与局部贴图而非整城求解流体方程，具体技术择优。
4. **互动和声音**：桥上桥下、船只吃水和桨扰动、角色靠岸的声音，3D 音源与深度/速度输入共用 water graph；可见水岸与不可通行/可航行边界必须完全同源。

**真实成熟研究源**：
- [Three WebGPU/TSL stylized water](https://github.com/norio/three-stylized-water)：MIT；Gerstner 波、双向法线、浅深水、反射/折射、泡沫/岸线与 caustics，基于 r185 不能直接往 r160 复制；适合湖和岸，弯溪 flow map 还需设计。
- [jeantimex threejs-water](https://github.com/jeantimex/threejs-water)：MIT；交互水波高度场、反射/折射和焦散；原项目 pool 假设需改才适配长溪。
- [Babylon WaterMaterial](https://github.com/BabylonJS/Babylon.js/blob/master/packages/dev/materials/src/water/readme.md)：已提供反射/折射、波高与 normal 的 WaterMaterial，但是弯溪所需速度图和障碍泡沫另做。
- [Fab Stylized Water Material](https://www.fab.com/listings/63a444e4-623b-4088-9ccf-319bbf898bff)：UE5 专用商品，专业 spline 河流/瀑布/水花/焦散/日光高光可供美术功能比对，**不代表已购买或可直接引入网页代码**。
- [Poly Haven River Small Rocks](https://polyhaven.com/a/river_small_rocks)：CC0 可做实际河床。已实际取得官方 API 的 2K RGB diffuse JPG 3,908,784B MD5 `5e92928b04ca9484c3923d40f18777aa`、OpenGL normal JPG 4,999,539B MD5 `5e9760f36a646b82629f2a69449dd49d`、ARM JPG 3,371,627B MD5 `439eb39a6db2b0001d38408d3476f01e`。官方各自 URL 基础路径为 `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/river_small_rocks/`，文件名分别 `river_small_rocks_{diff,nor_gl,arm}_2k.jpg`。**本轮只核验官方元数据，尚未下载像素文件，不能写成“已入库”。** 补充 [Low Tide Rocks](https://polyhaven.com/a/low_tide_rocks) 岸湿地与 [Pebbles](https://polyhaven.com/a/pebbles)。

**最小水体验收**：固定/移动镜头和昼夜实录看 glints 与环境倒影；溪流至少一段直道、90° 弯、岩石障碍，同一流向场满足合理速度和 `dot(v,tangent)>0`，泡沫不逆向，水下石头不飘，桥/水/岸/碰撞/小地图同源；近水时真实空间水声增强；真实桌面浏览器测 GPU 性能，检测 HDR/阴影/水材无 NaN/黑屏。至少输出短动态录像或逐帧采样，**单张截图不代表潺潺流动通过**。

## VI. 内容资产与发布管线

- 制作母版：保存 Blender/FBX/USD/OBJ 原始源、作者/版权/子纹理来源、sha256、纹理/骨骼绑定/形态键以及被批准美术方向。商业资源不得随意上传/再分发原件，私有仓库并不自动赋予分发权；禁止绕过 401/403/付费登录。
- 引擎独立运行包：glTF 2.0 / GLB（材质、动画、蒙皮/表情）、KTX2、meshopt、LOD/实例化、按 district 分块、首屏懒加载与 GPU 资源释放。参考 [Khronos glTF/KTX](https://www.khronos.org/gltf/) 和 [glTF Transform](https://gltf-transform.dev/)；GB级资源可分布服务器/缓存，并根据网速预测预取。
- Git 放代码、schema、manifest、测试与允许的小型 CC0 文件；大原始高精 Blend/8K/扫描模型使用 Git LFS 或有权限的对象存储并建立可恢复 sha 引用。不要普通 Git 无限追加二进制，避免仓库臃肿。
- 每次引入新技术或素材都记录：源码来源/权利、为什么比旧系统好、旧职责怎么退役、真实视觉改进、近远动态与大包体加载效果、回归/未运行及用户审美状态。不要以更多文档/自动 PASS 替代实际模型和画面。

## VII. 下一步执行顺序与边界

0. 先检查 Codex Cloud 当前工作树/进度与最新 main，保护 Einar/龙源，不重下不覆盖。
1. 只读盘点现有 JS 中世界、碰撞、资产管理、渲染、后处理与水的耦合；列迁移范围和唯一新职责位置。
2. 隔离实现现代 Three/WebGPU/TSL 和 Babylon.js（必要时 PlayCanvas）**同一套桥溪柳岸+一完整人物+龙+可进入店铺** POC，先高质量视觉后性能与交互；不要越过 G0/G1 就扩建全城。
3. 记录清晰的 A/B 决策及失败路径；选择一套统一引擎/流式资源与水领域结构后再系统性替换，旧功能回归并清理旧逻辑，不永久两套业务并存。
4. 基于通过验收的资源扩展完整街区，再宫阙、市井、湖泊与园林；每一区做连贯动态近景，不留永远补不完的半成品。

**边界**：用户已批准积极研究与技术迁移，仍须对需要付费/登录、第三方授权、未获得美术认可、未真实运行的项目如实说明；不代表自动批准所有素材/技术或向用户承诺未发生的成果。
