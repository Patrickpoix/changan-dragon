# 龙游长安：在线素材与引擎筛选

调研日期：2026-10-23。此文是实际 HTTPS 请求、作者仓库 README/许可、glTF 文件结构和官方预览图的调查结果。**候选、可选素材库与已接入的运行时素材分开记录；仅通过筛选的资源进入游戏。**

## 当前美术目标与本次可交付素材

用户明确要求以电影级中国动画和高品质三维游戏的空间、材质、光照、细节为目标，不能把简单程序化玩具小城作为最终效果。初轮只看引擎/字体/低模树木的调研范围不足，以下是扩大搜索后取得的成熟素材和具体采用条件。程序化建模仍是编辑几何的手段，最终质量必须由近景模型、真实材质、建筑比例、层次、光影、连续镜头和浏览器实测来证明。

当前实际接入 **7 个成熟 CC0 模型来源**：陶锅、藤篮、木碗、木桶、木凳、一组含六种形态的苔石和一棵有作者枝叶分布的阔叶树；共78处实例、104个网格，优化GLB共约4.47MB。另已接入 CC0 织物法线/ORM、瓦面与灰泥法线/粗糙度、本地 HDR 环境光。所有资源通过本地脚本和 GLTFLoader/RGBELoader 离线加载，不在游戏运行时访问素材平台。

当前版本已通过真实浏览器加载这些模型；“七种来源”不等于七个完整场景包，也不代表电影级全城视觉已经完成。完整唐代建筑、骨骼服饰人物与画舫成品包仍没有取得可直接使用且许可、年代、性能均适配的来源；现有建筑和画舫仍是可编辑代码几何，需要继续提升。

### 已实际下载的成熟素材

新增模型与现有两个来源一样，逐文件核对官方 MD5 并另存 SHA256，原始 glTF/贴图、作者、许可与优化元数据都在相应素材目录：

| 后续实际接入 | 作者与来源 | 实际运行时文件 |
| --- | --- | --- |
| Wooden Bowl 02 | Kuutti Siitonen，[素材页](https://polyhaven.com/a/wooden_bowl_02) | 258,752 B、4,666 三角形、1 网格、512² |
| Wooden Bucket 01 | James Ray Cock，[素材页](https://polyhaven.com/a/wooden_bucket_01) | 275,820 B、5,116 三角形、2 网格、512² |
| Chinese Stool | Kirill Sannikov，[素材页](https://polyhaven.com/a/chinese_stool) | 124,308 B、1,090 三角形、1 网格、512²；只作通用木凳，不据名称认定唐代 |
| Rock Moss Set 01 | Kless Gyzen，[素材页](https://polyhaven.com/a/rock_moss_set_01) | 342,984 B；六种独立节点共 8,995 三角形，从 63,127 三角形压缩；512²。运行时分别归零/摆放，避免把展示用的六石网格阵列搬入岸线 |
| Clay Roof Tiles 02 | Amal Kumar，[素材页](https://polyhaven.com/a/clay_roof_tiles_02) | 1k OpenGL normal/roughness，接入共享屋面材质，保留游戏自身青灰底色 |
| White Plaster Rough 01 | Rob Tuytel，[素材页](https://polyhaven.com/a/white_plaster_rough_01) | 1k normal/roughness，弱强度灰泥细节，不用源文件的污渍底色替代朱漆/暖白配色 |

以下保留初轮来源的详细检查记录：

| 素材、作者与直接来源 | 实际文件、规模与用途 | 许可与状态 |
| --- | --- | --- |
| **Ceramic Pot / Aron Łyczek**：[素材页](https://polyhaven.com/a/ceramic_pot)、[API 信息](https://api.polyhaven.com/info/ceramic_pot)、[原始 1k glTF](https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/ceramic_pot/ceramic_pot_1k.gltf) | `assets/library/polyhaven/ceramic_pot/ceramic_pot_1k.gltf`；3,592 三角形、1 primitive，完整几何+贴图 1,641,542 B。目视预览是带盖双耳、米褐釉面、真实磨损与手工起伏的矮陶锅；适合近处食摊/器物店。源尺寸约 0.656×0.502×0.372 m。 | **CC0 已核验**；API 明示作者，所有文件核对官方 MD5，另存 SHA256。完整原文件与所有外置 binary/1k diffuse/OpenGL normal/ARM 在本地。同目录 `runtime.glb` 已生成，182,396 B、3,592 三角形、512² PBR；非唐代考古器物证明。 |
| **Wicker Basket 01 / Kuutti Siitonen**：[素材页](https://polyhaven.com/a/wicker_basket_01)、[API 信息](https://api.polyhaven.com/info/wicker_basket_01)、[原始 1k glTF](https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/wicker_basket_01/wicker_basket_01_1k.gltf) | `assets/library/polyhaven/wicker_basket_01/wicker_basket_01_1k.gltf`；22,276 三角形、1 primitive，完整源文件 2,730,151 B。真实编织篮底、起伏篮沿、藤条间隙；适合近处蔬果摊。源尺寸约 0.383×0.295×0.117 m。 | **CC0 已核验**；原文件已逐个校验 MD5/SHA256。同目录 `runtime.glb` 已生成，330,044 B、6,000 三角形、512² PBR；源模型保留作高品质依据。不是直接复制到全城的免费性能。 |
| **SheenCloth 材质 / Microsoft**：[官方 README](https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenCloth/README.md) | `assets/library/pbr-cloth/technicalFabricSmall_{basecolor,normal,orm,sheen}_256.png`，四张 256² 平铺图，整份存档约 570 KB。用于有褶皱的遮篷、布幔、旗帜，增加织纹、粗糙度和掠射光泽。源模型 115,200 三角形未下载。 | **Microsoft 捐赠 CC0**，许可和作者原文已归档。ORM 为 R AO/G 粗糙/B 金属；sheen RGB 为颜色、A 为粗糙。原 basecolor 实看为饱和藏蓝/青蓝菱形技术织物，不能直接声称唐代丝绸。暖米色布可只用 normal/ORM，配自有暖色底；简单乘米色仍会偏蓝。 |
| **Venice Sunset HDR / Greg Zaal**：[素材页](https://polyhaven.com/a/venice_sunset)、[API 信息](https://api.polyhaven.com/info/venice_sunset)、[原始 HDR](https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr) | `assets/environment/venice_sunset_1k.hdr`，1,440,400 B。给釉陶、木材、水面提供暖夕照反射与环境能量，使用本地 RGBELoader/PMREM。 | **CC0 已核验**，原始 API MD5 校验通过，SHA256/作者/完整来源保存在 `venice_sunset-provenance.json`。用于光照不等于把威尼斯天际线当作唐长安；背景可以另做渐变天空。 |

两个道具的 `asset-info.json`、`asset-files.json`、`manifest.json`、`README.md`、完整 `LICENSE-CC0-1.0.txt`、官方许可说明均已归档。清单只包含相对路径。全程保留 HTTPS 代理与 TLS 校验；未下载单件超过 20 MB 的资产，没有购买行为。

### 成熟建筑生成器与构件算法的实查结论

| 来源 | 已打开的一手材料 | 实际可行性与缺口 |
| --- | --- | --- |
| **miniLibs / in-a-mist**，[仓库](https://github.com/in-a-mist/miniLibs)、[MIT](https://raw.githubusercontent.com/in-a-mist/miniLibs/main/LICENSE) | 原始 `PrimitiveModel.cs` 的 ShanTou/LuTou 通过多截面放样生成枓，HuaKung/NiTaoKung 等通过卷杀、栱眼、挖槽形成真实轮廓；`TouKungData.cs` 给出模数尺寸，组件明确命名为“宋式”。 | **MIT 明确，可移植算法**。已保存 README、LICENSE 和 6 个核心 C# 文件到 `assets/library/architecture/minilibs-source/`，并保存来源/哈希。原工程是 .NET Framework 4.8 + RhinoCommon/Grasshopper，不能作为 Blender 插件直接装；实施者可将授权算法转为共享 BufferGeometry 或 Blender 网格并保留 MIT。不可把宋式构件移植说成精确唐代考古复原。 |
| **ACA Builder / willimxp，现可读 ppddry 副本**，[仓库](https://github.com/ppddry/ACA-Builder)、[README](https://raw.githubusercontent.com/ppddry/ACA-Builder/main/README.md)、[初始化元数据](https://raw.githubusercontent.com/ppddry/ACA-Builder/main/__init__.py) | 成熟度较高，能生成完整台基、柱网、梁椽、瓦垄并导出 GLB。元数据版本 0.0.22，Blender ≥4.2。作者原文明确“清代北方官式”，依据《清工部·工程做法则例》，清式斗科与和玺彩画。 | **不作为唐代殿堂直接采用**。副本未发现 LICENSE/输出模型授权；原作者仓库 `willimxp/ACA-Builder` 返回 404。关键 `template/acaAssets.blend` 被 .gitignore 排除、仓库没有该文件，template.py 明确缺失会报错；现有机器安装 Blender 仍不足以运行完整生成器。Blender 插件身份不能自动推定 GPL 或资产输出许可。 |
| **yingzao / TanTien-Engine**，[仓库](https://github.com/TanTien-Engine/yingzao) | 实际目录含 `20_foguangsi`、`10_dougong`、`12_frames_tg`，README 有详细七铺作斗拱与转角截图，时代方向比清式生成器更有价值。 | 基于自有 Tantien 系统，未发现根许可，不能直接把代码/模型放入项目；只作为进一步取得授权的候选。 |
| **Ancient-Chinese-Architecture-3D / ylz17965**，[仓库](https://github.com/ylz17965/Ancient-Chinese-Architecture-3D) | 仓库页面实际仅 README。 | 没有可用模型，不计作已经获得的建筑资源。 |

### 已查看但没有加入本次下载的成熟模型

通过 Poly Haven 真实搜索 API 与具体 info/files 记录，已核对：木桶 01（5,116 面，James Ray Cock）、木桶 02（7,252 面）、木碗 02（4,666 面，Kuutti Siitonen）、Chinese Stool（1,090 面，Kirill Sannikov），都有成熟 1k glTF/PBR。它们适合后续逐件选用，但本轮优先完成上面的陶锅与编织篮，其他适用器物继续按场景补充，并未把这两件视为整城所需全部资源。Chinese Stool 的“中国传统”标签不是唐代年代证明。

陶瓶 01/02/03/04 的元数据明确使用 `modern` 标签：03 是长方形现代瓶；01 为现代高白釉花口；04 为单耳现代装饰壶。即使许可清晰也不直接当唐三彩/青瓷。船只搜索实得 Dutch Ship 和 pinnace，时代/船型不合，不导入长安河道。市集家具、植物、海盗/水上套件的 GitHub 镜像可列候选，但不能靠低模海盗船取代中式画舫。

Khronos 官方可获得成熟 PBR 的鱼（12.49 MB）、鲍鱼壳（9.30 MB）、丝绸坐垫（4.63 MB）、茶杯（4.80 MB）等。逐件读取了作者/许可证，没有下载这些大样本凑数量；茶杯/坐垫不是已经核验的唐代器物，带商标的 PotOfCoals 也未采用。

### 网络和许可核验的更新

初轮外站确实返回 CONNECT 403，旧记录保留在下文。用户后来允许不限域名的外网；实际后续请求已成功，不再将 Poly Haven 资源列作当前受阻。Poly Haven API 明确要求项目专用 User-Agent，正常使用 `ChanganDragonAssetResearch/1.0` 后 `api.polyhaven.com` 信息/下载清单、`cdn.polyhaven.com` 预览、`dl.polyhaven.org` 原文件请求均 HTTP 200；没有禁用 TLS/代理。

正确官方组织为 **Poly-Haven（带连字符）**。[官方许可翻译源码](https://raw.githubusercontent.com/Poly-Haven/polyhaven.com/master/public/locales/en/license.json)明确其所有 HDR/纹理/模型为 CC0，可修改、商业使用、再分发；[API 官方 README](https://raw.githubusercontent.com/Poly-Haven/Public-API/master/README.md)与 [ToS](https://raw.githubusercontent.com/Poly-Haven/Public-API/master/ToS.md)另外说明在线 API 服务条款。游戏只打包下载后的本地素材，不依赖在线 API，不能混淆 API 的 AGPL 源码与 CC0 艺术资产。

外部搜索能力也已彻底检查：当时 ALL_TOOLS 中没有 web/search/browser 服务。实际扩大搜索使用 GitHub 搜索 HTML 的结构化结果、作者原始源码、Poly Haven 官方多语言搜索和逐件元数据，不把搜索摘要或仓库名字当许可证明。

## 初轮本地文件检查记录（不是最终整城质量验收）

| 文件/内容 | 实际检查结果 | 来源可信度与使用状态 |
| --- | --- | --- |
| `src/00-core.js`、`src/10-world.js`、`src/12-landmarks.js` | Three.js 场景、批次绘制、程序化建筑和水面 | 项目当前几何；不是下载的建筑模型 |
| `src/20-character.js` | 球体/胶囊体组成青龙、木车、行人与船 | 项目当前角色；不是候选 glTF |
| `assets/materials.js` | `stone` 为 67,776 字节、`wood` 为 16,906 字节；均为 512×512 WebP data URL | 文件注释和 DESIGN.md 标记 Poly Haven CC0；本次外站访问受限，不能独立重新核验资产页/作者/原始下载与该字节内容的对应关系 |
| `index.html` 引用的 `vendor/three.min.js` | 调研开始时 `vendor/` 不在目录内 | 引擎应由实施者补齐并保留上游 LICENSE；不能把一次源码许可检查当成已恢复引擎 |
| 下文 4 个 Kenney GLB | 现已保存在 `assets/library/kenney/` 可选素材库，主游戏未加载 | 文件级 URL、SHA256、上游许可说明、外置纹理均已保存，见 `asset-manifest.json` |

## 可用引擎、工具与字体

所有“已验证”均表示作者仓库内容 HTTP 200，许可正文已读取；不表示库已安装或应用已采用。

| 候选 | 一手证据 / 下载 | 许可、结论与约束 |
| --- | --- | --- |
| **Three.js r160** | [README](https://raw.githubusercontent.com/mrdoob/three.js/r160/README.md)、[LICENSE](https://raw.githubusercontent.com/mrdoob/three.js/r160/LICENSE)、[原版全局构建](https://raw.githubusercontent.com/mrdoob/three.js/r160/build/three.min.js) | **MIT 已验证**。首选：与现有 `THREE` 全局代码、材质属性一致；锁定同一版本，打包本地并带许可证，避免运行时 CDN。勿整仓库下载，其 README 明示全历史约 2 GB。 |
| **Three RoundedBoxGeometry** | [r160 源码](https://raw.githubusercontent.com/mrdoob/three.js/r160/examples/jsm/geometries/RoundedBoxGeometry.js)，同上 MIT | 可评估小尺度梁端、台阶、摊位圆角。当前已有 `roundedBoxGeo`，无需为相同行为增加模块；几何应共享、实例化。源码会转为非索引几何且细分随 segments 增长，不能给所有远处构件高细分。 |
| **Three GLTFLoader** | [r160 源码](https://raw.githubusercontent.com/mrdoob/three.js/r160/examples/jsm/loaders/GLTFLoader.js)，同上 MIT | 候选导入通道。若采用 GLB，连同依赖本地打包并保留许可；其 ESM 源码不能直接当全局脚本使用。外置图片仍需随包分发；本地 HTML 的 fetch/CORS 与字体文件加载要实测，不能仅凭“GLB”宣称单文件离线。 |
| **meshoptimizer** | [作者 README](https://raw.githubusercontent.com/zeux/meshoptimizer/master/js/README.md)、[LICENSE](https://raw.githubusercontent.com/zeux/meshoptimizer/master/LICENSE.md) | **MIT 已验证**。适合未来较大 glTF 几何/动画压缩，单个解码文件可独立分发；当前 9–47 KB 的道具无需增加解码器。WebAssembly ready 必须等待，解码开销和解压后显存仍存在。 |
| **glTF Transform** | [README](https://raw.githubusercontent.com/donmccurdy/glTF-Transform/main/README.md)、[LICENSE](https://raw.githubusercontent.com/donmccurdy/glTF-Transform/main/LICENSE.md) | **MIT 已验证**。建议仅作为离线加工工具做 prune/dedup、减面和图集整理；不是美术风格转换器。不要把 CLI 依赖带到游戏运行时；压缩后仍需检查外置文件和解码依赖。 |
| **Babylon.js** | [作者许可](https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/license.md) | **Apache-2.0 已验证**。是可用备选引擎，本轮不切换：现有几何、动画、交互均围绕 Three.js，迁移成本无法直接改善素材时代与比例。 |
| **cannon-es** | [作者许可](https://raw.githubusercontent.com/pmndrs/cannon-es/master/LICENSE) | **MIT 已验证**。完整刚体动力学可评估，本轮不引入：步行、骑行、飞行主要需要角色移动、地面高度、台阶与建筑阻挡；额外动力学不是画面改善的必要条件。 |
| **马善政 Ma Shan Zheng** | [作者分发元数据](https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/METADATA.pb)、[OFL](https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/OFL.txt)、[TTF](https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/MaShanZheng-Regular.ttf) | **SIL OFL 1.1 已验证**，原始 TTF 已下载至 `assets/fonts/MaShanZheng-Regular.ttf`，5,857,936 B，OFL 位于同目录 `MaShanZheng-OFL.txt`。书写感适合牌匾/片名，首选只取所需字集，不用于所有小号 HUD 字。分发版权与 OFL，修改/子集留意保留字体名要求；Canvas 牌匾绘制前必须等待字体 ready。 |
| **站酷快乐 ZCOOL KuaiLe** | [元数据](https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolkuaile/METADATA.pb)、[OFL](https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolkuaile/OFL.txt)、[TTF](https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf) | **SIL OFL 1.1 已验证**，TTF HEAD 200，1,514,968 B。圆润、可爱，适合作标题替代；与书写体二选一，避免同时增加几种字体。HUD 仍可使用系统中文无衬线。 |
| **Noto Serif SC** | [元数据](https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/METADATA.pb)、[OFL](https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/OFL.txt)、[TTF](https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf) | **SIL OFL 1.1 已验证**，TTF HEAD 200，25,125,512 B。适合诗笺但完整字体过大；本轮不下载完整包，使用系统宋体或离线字集。 |

## 已归档、未接入运行时的 CC0 模型

现保存在 `assets/library/kenney/`：这是可随项目离线归档的可选素材库，主游戏不加载。最初的环境评估副本仍在工作区环境目录。

作者两个仓库的 README 都明确写明：`Assets included in this package (2D sprites, 3D models and sound effects) are CC0 licensed`。这是这些具体模型的许可依据，而不是假设软件仓库的 MIT 自动覆盖资产。各仓库根部 `LICENSE.md` 为模板代码许可，**README 中的资产说明也已一同归档**。官方城市截图亦显示 CC0 说明。每个 GLB 都依赖 `Textures/colormap.png`（10,108 字节），已保留相对路径。

| 文件 / 原始下载 | 验证结果 | 实际用途与取舍 |
| --- | --- | --- |
| [grass-trees.glb](https://raw.githubusercontent.com/KenneyNL/Starter-Kit-City-Builder/4535092b740b378b700efd9df9e27a631815b84a/models/grass-trees.glb) | 38,160 B；380 三角形；1 primitive、1 材质；无动画 | 圆团状树冠可评估作远处坊内园林。是带地块的合并网格，不能假设能直接取独立树节点；要移除地块/重分组或接受整体地块。 |
| [grass-trees-tall.glb](https://raw.githubusercontent.com/KenneyNL/Starter-Kit-City-Builder/4535092b740b378b700efd9df9e27a631815b84a/models/grass-trees-tall.glb) | 47,016 B；472 三角形；1 primitive、1 材质；无动画 | 尖叶树群用于远景层次，颜色需统一；不是长安园林树种复原，不代替近处柳树。合并地块限制同上。 |
| [cloud.glb](https://raw.githubusercontent.com/KenneyNL/Starter-Kit-3D-Platformer/3fa8a04b1c01ab23db43123d4ce814a34c3fc7f0/models/cloud.glb) | 23,788 B；204 三角形；1 primitive、1 材质；无动画 | 柔软体块云可作为慢速背景云候选。重着色为统一米白，避免大量透明层或全场投影；当前程序化云已经足够时无需导入。 |
| [grass-small.glb](https://raw.githubusercontent.com/KenneyNL/Starter-Kit-3D-Platformer/3fa8a04b1c01ab23db43123d4ce814a34c3fc7f0/models/grass-small.glb) | 9,048 B；72 三角形；1 primitive、1 材质；无动画 | 可作水岸稀疏草簇候选，实例化并按距离裁剪，不覆盖道路或在全城密植。 |

许可证据：[City Builder README](https://raw.githubusercontent.com/KenneyNL/Starter-Kit-City-Builder/4535092b740b378b700efd9df9e27a631815b84a/README.md)、[3D Platformer README](https://raw.githubusercontent.com/KenneyNL/Starter-Kit-3D-Platformer/3fa8a04b1c01ab23db43123d4ce814a34c3fc7f0/README.md)。模型总计 118,012 B，四个模型均为 glTF 2.0。SHA256、固定源提交、相对路径与依赖在 `assets/library/kenney/manifest.json` 及本文件旁的 `asset-manifest.json`。固定提交的原文件已重新请求并核对 SHA256 一致。调研检查过作者整体预览图和文件结构，尚未对这四个文件逐个浏览器渲染。

## 其他美术素材：候选或明确舍弃

| 候选 | 一手来源 / 在线证据 | 结论 |
| --- | --- | --- |
| **Kenney City Builder 建筑** | [官方 README](https://raw.githubusercontent.com/KenneyNL/Starter-Kit-City-Builder/main/README.md)、[官方预览](https://raw.githubusercontent.com/KenneyNL/Starter-Kit-City-Builder/main/screenshots/screenshot.png)；许可说明已读、图片已目视检查 | CC0 资产许可明确且可下载，但现代平顶多层街区、车道标线和路灯不适合唐代；拒绝导入建筑。只取其树木圆润形状作为评估。 |
| **Quaternius Ultimate Nature** | [作者网站源码](https://raw.githubusercontent.com/Quaternius/quaternius.github.io/main/packs/ultimatenature.html)、[官方预览](https://raw.githubusercontent.com/Quaternius/quaternius.github.io/main/assets/images/fullres/ultimatenature.jpg)；150 个 FBX/OBJ/Blend 模型 | 预览已目视检查，柳树、阔叶树、石块适合公园，但多边形折面比现有软圆角色更硬，需要法线/调色统一。页面写 CC0；实际 Google Drive 下载被挡，归档内许可未核验。暂不采用。 |
| **Quaternius Universal Animation Library** | [作者网站源码](https://raw.githubusercontent.com/Quaternius/quaternius.github.io/main/packs/universalanimationlibrary.html)；120+ 动画，FBX/GLB/Blend，通用 humanoid rig | 可给未来完整衣袍骨骼角色做走路/坐姿参考，但现有程序化角色不能直接套动画。页面写 CC0；下载到 `quaternius.itch.io` 被挡，当前统一许可与页面不同，暂缓。 |
| **Quaternius Ultimate Animated Animals** | [作者网站源码](https://raw.githubusercontent.com/Quaternius/quaternius.github.io/main/packs/ultimateanimatedanimals.html)；12 动物，每种 12+ 动画，含 glTF | 可评估街巷动物；不是青龙或唐代人物。页面写 CC0，实际归档未验证，暂不采用。 |
| **Quaternius Medieval Village** | [作者网站源码](https://raw.githubusercontent.com/Quaternius/quaternius.github.io/main/packs/medievalvillage.html)；44 建筑/道具，FBX/OBJ/Blend | 西式中世纪建筑不适合；仅桶/箱/手推车等跨时代道具值得未来逐件查看，不把整个村落换皮为长安。下载归档和许可未验证。 |
| **Poly Haven Sandstone Blocks 05** | [素材页](https://polyhaven.com/a/sandstone_blocks_05)、[许可页](https://polyhaven.com/license) | DESIGN.md 的现有材质来源线索；初轮两页受策略限制；后续官方 CC0 已通过作者源码和 API 核验。照片材质只能作台基的低对比细节，不能充当三维建筑。没有重新下载，没有声称已重新核验作者/许可。 |
| **Poly Haven Wood Planks** | [素材页](https://polyhaven.com/a/wood_planks)、[许可页](https://polyhaven.com/license) | 同上。只建议保留现有 512² 嵌入纹理，避免照片中强木纹压过朱漆构架。 |
| **ambientCG WoodFloor051** | [素材页](https://ambientcg.com/view?id=WoodFloor051) | 请求被挡；未能核验该资产和许可。木地板照片不是唐代木构模型；没有下载或使用。 |
| **Sketchfab Small Chinese imperial style building** | [候选页](https://sketchfab.com/3d-models/small-chinese-imperial-style-building-631615777ba4421a98814559dc2d4c5a) | 页面被挡，无法核验几何、可下载状态、面数、许可或真实年代。Imperial 不是 Tang 的证据；不导入清式黄琉璃瓦/密集彩画作为唐长安。 |
| **Sketchfab Cute Dragon** | [候选页](https://sketchfab.com/3d-models/cute-dragon-df14ec74767c4598920132758dab8a49) | 页面被挡，作者/许可/动画/骨骼未核验；不取代已可控的玉色中国小龙。 |
| **Khronos Dragon Attenuation** | [资产 README](https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DragonAttenuation/README.md) | 权威页可读取，但龙网格使用 **Stanford Graphics Library 许可，非 CC0**；只有布背景是 CC0。高细节扫描、玻璃 transmission/volume 材质是测试用途，既不软萌也不适合移动端，拒绝作为角色。 |
| **Khronos Cesium Man** | [资产 README](https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMan/README.md) | CC BY 4.0 角色且带另行商标说明；有骨骼动画，可用作导入测试，现代紧身衣与品牌标识不适合唐代街景，不集成。 |

**Quaternius 许可注意点来自实查而非猜测：**上述旧包页面明确标示 CC0，但作者当前 [license.html 源码](https://raw.githubusercontent.com/Quaternius/quaternius.github.io/main/license.html) 为 **QAL v1.0（2026-08-28）**，允许游戏内使用、禁止单独资产/模板形式的再分发，并声明不追溯已取得资产。新取得包必须查看包内实际许可并保留证据，不能把整个品牌或所有新下载一律写成 CC0。本次没有下载这些模型归档。

## 初轮网络受限记录（后续 Poly Haven 已成功，见上文）

实际使用继承的 HTTPS_PROXY、保留 TLS 校验，读取了运行时网络策略与环境状态。环境状态的 HTTP policy 为 `unknown`，不能称其已确认 enforced；实际请求显示以下域名 CONNECT 返回 **403 Forbidden**：

`kenney.nl`、`quaternius.com`、`polyhaven.com`、`ambientcg.com`、`sketchfab.com`、`drive.google.com`、`quaternius.itch.io`、`qjxq.xa.gov.cn`、`en.chinaculture.org`。

后两个是 DESIGN.md 中的唐建筑参考。初轮不能确认其内容，不把未打开的政府/文化网页当作新取得的历史证据。`github.com` 与 `raw.githubusercontent.com` 的作者源文件请求成功；没有改变代理/路由、关闭 TLS 或尝试绕过拒绝域名。仓库源码属于许可策略允许的独立公开来源。

## 移动端与离线采用条件

- 风格以轮廓、圆角、比例、统一调色和柔光为主；照片纹理只在近景提供弱细节。台基、梁、瓦、栏杆统一复用几何和材质，避免每个构件独立 draw call。
- 低模数量不能只看 GLB 字节：材质 primitive 决定绘制批次数；贴图解压占用远大于 WebP/PNG 文件。1024² RGBA 单层约 4 MiB，带 mipmaps 约 5.3 MiB；优先共享 512² 图集与有限颜色。
- 草簇、树群、瓦头用实例批次及距离裁剪；远处屋顶简化，近处斗拱才细分。阴影只保留关键近景和一盏主光，避免大量透明叠层与全屏后处理。
- 人物优先保留当前可控骨架并增加衣袖、发髻与可读动作；只有实际采用匹配骨架的资产才增加 AnimationMixer/蒙皮成本。船体保留统一木色、简洁舱顶，沿水道位置与摆动是廉价动画。
- 离线包必须包含引擎、许可、字体、模型纹理和解码器等全部依赖；避免 API/CDN、运行时字体请求。当前嵌入 data URL 的材质支持 file://，外置 GLB/font 的本地打开行为需要专门测试。
- 暂定性能目标建议 60 fps 桌面、30 fps 手机及对低档设备降低 DPR/阴影；它们是验收目标，**不是本次素材调研测得的帧率**。最终采用以浏览器多视角、手机尺寸、断网和低画质实测为准。

## 2026-10-23 新一轮成品包检索

不限域名后，Sketchfab v3 公共搜索和模型信息 API 已能实际读取。以下为有具体作者、面数与许可字段的候选；公开下载端点实际返回 401，需要平台登录，**未下载、未接入**。页面写“可下载”不能表述为已取得文件。

| 候选 | 实查与取舍 |
| --- | --- |
| [Chinese Architecture Kitbash](https://sketchfab.com/3d-models/2ef24cb498544d97a9df88864620882d) / Zver 3D | 993,681 面；CC BY 4.0。作者明确说明是演示版、没有准备好的游戏几何，材质在 UE5，不能直接当成浏览器成品包。 |
| [Ancient Chinese Architecture](https://sketchfab.com/3d-models/f624485f6c5c40a697c7130cb9393765) / justin_shenzhen | 1,683,728 面；CC BY 4.0。原归档、贴图与年代适配尚待核验。 |
| [Chinese pavilion](https://sketchfab.com/3d-models/b0f6c1fb43e744ec876faecaba3d4925) / shineSUU | 62,662 面；CC BY 4.0。原归档、贴图与年代适配尚待核验。 |
| [Chinese boat](https://sketchfab.com/3d-models/8c08d196fb814724a97c120d33cdf466) / Murilo Rocha | 5,380 面；CC BY 4.0。原归档、贴图与年代适配尚待核验。 |

另检索了唐代齐胸襦裙/红金刺绣服饰、镇墓兽、佛光寺/南禅寺关键词、中式亭子、画舫、柳树与 OpenGameArt 中国食车。服饰候选约17万至33万面，需要取得源文件后才能做服装/骨骼与移动端改造；食车为 Ouren 的 CC BY 3.0 资源，但题材/样式不直接适合唐代，此轮未采用。没有用现代青花瓶或西式村屋充当唐代成品资产。

Quaternius Ultimate Nature 的作者页仍明确标示 CC0，公开 Google Drive 文件夹这轮可读取，能看到独立 FBX/Blend 文件。实际请求其 License.txt、CommonTree_1.fbx、Bush_1.fbx 均得到 Google Drive 的“Quota exceeded / 太多用户已访问”页面，未取得这些文件，未绕过配额。不能把已打开目录写成下载成功。

Poly Haven 的 Pine Tree 01 虽提供 1k 贴图，完整 glTF 依赖仍约958 MB；Tree Small 02 约101 MB。**贴图分辨率不等于几何轻量化**，需要另查作者提供的源工程/LOD，再做近景树的形态与性能取舍。当前未把这些全量网格直接塞进手机运行包。

### Tree Small 02 后续实际整合

已单独审阅 Tree Small 02 / Rico Cilliers 的官方预览、API及完整 glTF依赖，并明确提高源文件下载预算到100MiB；实际下载100,974,143B，各文件官方MD5/SHA256核验通过，原文件完整保留。源模型2,062,487面，不能直接用于手机全城。

首次普通45,000面减面预览失败：细叶被挤成细线，树冠近乎消失，因此没有采用。`tools/prepare_tree.py` 改为识别30,250个连通叶片组，保留原作者位置、朝向及UV，固定随机种子选择11,600组，以带浅中折的四面叶片保留体积并放大1.45倍；树干/树枝独立减至约7,000面。最终53,399面，三材质，512² PBR，GLB2,953,344B。已实际查看Blender渲染预览并以8个近景树实例接入街巷/曲江，带树干碰撞、冠层飞行包络与200米距离裁剪。未把原始100MB模型装进运行HTML。

此处是通用阔叶树的美术使用，不声称其具体树种或采集地属于唐长安。当前版本还保留远处程序化树冠，近景柳树/桃花的细节仍需继续提升。

## 2026-10-23 植被与动画素材续轮

实际查询 Poly Haven 完整模型目录并审阅 Shrub01/02/03、木灯具与蕨类预览。前三种实际是少量草本茎，并非丰满灌丛；木灯具偏欧式，未采用。正式新增 **Fern02 / Rob Tuytel（扫描）、Rico Cilliers（建模）**及 **Grass Bermuda01 / Rico Cilliers**，CC0。完整源文件分别1,146,361B、1,450,530B，官方MD5及本地SHA256通过；派生6232面/470436B和941面/142852B，512²，保留原Alpha Mask与UV。作者的4种蕨类、21种草簇均按节点独立归零，选用近水石根的36处摆放，不把展示用排列带入场景。

继续扩大单关键词检索后，找到[Quaternius Showcase](https://github.com/trebeljahr/quaternius-showcase)。实际读取完整文件树、README、明确区分网页MIT与模型CC0的LICENSES.md，并直接核验四个作者素材页的“License CC0”。镜像固定于`722c39e964360beff2728a8ee4d103e2d11d457c`。这是独立公开的、注明旧CC0包来源的模型分发，没有绕过此前Google Drive的配额限制；新QAL包未采用。

审阅 Willow1/2/3、Horse、Deer、Farmer及Medieval女性。柳树预览块面过重；人物为西式现代/中古装束，未当作唐服接入。**Horse与Deer**比例合适，正式采用，原文件分别682356B、662108B，包含原作者骨架/权重及13段动作。作者页、镜像许可清单、原GLB、固定版本与SHA256已保留在`assets/library/quaternius/`。

`tools/prepare_animals.py`保留原文件，以Blender给曲面一层细分、平滑法线，原8/7材质的色区转为逐角顶点色，金属度归零，合并为每只动物一个材质；保留Idle/Walk/Eating三段作者动作，骨架与权重继续使用原包。马13092面/703992B，鹿12576面/691736B。专门排除Blender导入时生成的骨骼UI用Icosphere，避免它成为可见道具；构建会检查实际导出的动作与蒙皮，失败不替换有效运行包。

正式扩展加入Three r160的`SkeletonUtils.clone`，每个动物实例有自己的骨骼，几何/材质仍共享。浏览器实际检查八套独立骨架、姿态随时间变化与四匹马的位置变化；两条主街路线逐点检查水面/碰撞，用直线+圆润端弯限制横向范围，避免狭长Catmull环路外鼓穿过摊位。另有东西市驻足马与兴庆宫吃草/驻足鹿。

当前11个GLB来源，总二进制6476664B；九类Poly Haven及两类Quaternius，共122处素材摆放，包含36处新地被与8只动画动物。材质/HDR/字体另计。`tools/sync_asset_manifest.py`同步源许可和派生校验；研究预览与运行采用状态分开。程序柳/桃/松改为枝条、叶片、花瓣与远近几何，不以成熟包中不适合的粗块树代替精修。

## 市场食品与兼容源码（2026-10-23）

已实际取得并整合Poly Haven CC0 food_ginger_01、food_lychee_01、food_pears_asian_01、food_pomegranate_01。保留官方源数据/许可/API校验，优化为姜/荔枝/石榴各2400三角形、亚洲梨五变体合计6000三角形；GLB分别156620/178000/219964/151244B。果品按摊位托盘实际高度平摆、姜平放商铺柜台，静态实例分空间合批。当前共13个PolyHaven GLB+2个Quaternius GLB，另有胡商面部衍生索引几何；不把近千摆放数误称独立来源。

WebGL1蒙皮兼容复用Three r150官方MIT ShaderChunk骨纹理读取公式，原文件/来源记录在vendor，SHA256 517c25af653e1d79e33d16cf201de84202ab48bc89ba9d2bb87d29986da51fbd。现有r160引擎保持原样，由独立模块仅对WebGL1补齐材质uniform及阴影材质。

Ships Pack小船候选已联网取得CC0作者页面并做离线3D预览，但尚未接入。其粗折面船体不直接满足当前圆润风格，需要进一步评估和加工；不能把本次检索计作已采用模型。

## Ships Pack中空船体正式采用

在审阅原船体与实际3D预览后，保留其内外船壳，而不是直接搬入整套西式船只。原source.glb11828B，作者包页ships.html明确CC0，固定镜像722c39e…路径及SHA256保存在quaternius/boat_hull/manifest.json。加工脚本prepare_boats.py焊接接缝、22mm三段圆角/加权法线，导出790顶点/1460面、49927B的可编辑索引几何boat-hulls.js；去除源金属感，保留木色分区。

实际中空舱、木板/横凳、人物、双桨及浅尾流已在运行截图核对。人物沿用单独记录的作者面部；身体和服饰、桨姿/船姿/船道均为本项目代码。GLB来源仍15种，另有面部与船壳2种索引几何来源，不将其混算为第16种GLB或近千个独立模型来源。

## 城墙微表面与植被候选（继续main）

实际检索Poly Haven目录并下载预览/作者数据，对比clay_plaster（Amal Kumar）、excavated_soil_wall（Amal Kumar）、bark_willow_02（Charlotte Baglioni）。开挖土壁裂隙过强，不用于城墙；柳树皮有清楚纵向纹理，但程序树还需专门的枝干UV/叶片材质分离，当前只作候选，不计入运行素材。

正式采用clay_plaster约2×2m的1k OpenGL法线784921B和粗糙度345709B，官方MD5验证通过，SHA256/作者/许可在architecture/pbr/clay_plaster。暖色和夯层仍是可编辑代码生成，墙体真实收分、物理比例UV、薄石基压顶；未借用明清砖墙套件。两份贴图已打入scene-materials.js；仍是15GLB+2索引几何来源，不能把新增PBR当新增整栋建筑来源。
