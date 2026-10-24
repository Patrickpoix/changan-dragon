# 2026-10-24 续轮：唐代史实证据 + 可编辑成熟场景/河岸生态与天气

本批与[此前的61条跨域检索](RESOURCE_SWEEP_20261024.md)不重复。唯一机器来源目录为 [resource-catalog.json](resource-catalog.json)。**以下仅是已通过公开发布页核实的网址候选**，本轮没有下载任何模型/贴图，也没有安装任何引擎、运行 Blender/实时河流，因此不能宣称素材已取得或画质已提升。

这次提高了研究质量：不再只泛搜“Chinese”，而是把**唐代有实物来源的证据模型**与**可合法改造为高品质游戏资产的技术原件**分开，且具体列出宋/明/清误用风险。

## 优先级与生产决策

- **A：结构与史实**：唐宋结构教学殿宇、斗拱（其中宋《营造法式》不能直接当唐制），唐俑/唐代敦煌造像和盛唐边城遗址。博物馆实扫可以解决头髻、衣褶、三彩表面与建造比例争议，但绝不直接当带骨骼游戏人物。
- **A：溪边自然**：Poly Haven CC0 青苔石、蕨丛、松、灌木、近景细石、真实河岸HDRI。保留高精母版和法线贴图；逐级压缩运行 LOD 时比较近景视觉，树种/生态必须校核。
- **A：气候与光学**：现代Three WebGPU天空和湖面 glints 与河床水面同源太阳参数，WebGPU/TSL版本不可未经测试覆盖 r160。瀑布包若只有静态水网格，不是已完成动画流水。
- **不合适候选应明确排除**：Sketchfab NoAI、NC和明显盗用电影/游戏原包不得被误认为可用产品素材，即使网页展示“Download”。典型如迪士尼《花木兰》游戏导出宫殿、非商用唐兽/屋脊、NoAI中国塔/建筑、仅宋清式扫描。必要时**人工只读研究文化信息**，不得进入AI模型加工/商用资源包。

## 分类索引（均为未取得、待许可和审美验证的候选）

### architecture — 8 条

| 等级 | 直接来源 | 具体公开证据/价值 | 唐代/授权/技术风险 |
|---|---|---|---|
| A | [唐宋斗拱整殿结构研究](https://sketchfab.com/3d-models/temple-e28da4013d554cb7b1fb6bc46cb71615) | 60.3k tris; 唐宋寺庙斗拱结构教学模型（引用南禅寺研究） | CC BY; 并非完整精雕唐殿，仅木构制作源参考 |
| A | [木构斗拱分件组](https://sketchfab.com/3d-models/brackets-9ac0f880d6d44b46a6dfdbd30caafb25) | 27.8k tris; 木构件可分离研究 | CC BY; 是否有层级与榫卯、唐宋时代、UV需核 |
| A | [中国古亭完整中面数](https://sketchfab.com/3d-models/chinese-pavilion-b0f6c1fb43e744ec876faecaba3d4925) | 62.7k tris；独立中式亭子完整模型 | CC BY; 唐代轮廓/内部和贴图待验 |
| B | [中国庭园湖中茶亭](https://sketchfab.com/3d-models/chinese-style-tea-pavilion-7625f6818cab4fe58a4e1a09f186d7b1) | 4.9k tris；湖中茶亭实际完整结构 | CC BY; Maya/Photoshop，几何细节不足近景最终版 |
| B | [中式多层寺塔轻量可编辑参考](https://sketchfab.com/3d-models/temple-prop-82293facfae94157b6132db43a27e05d) | 101.7k tris；多层屋檐立体结构 | CC BY；时代地域模糊，必须唐化 |
| A | [中国古建可调模块包](https://www.fab.com/listings/1f7bf050-0e26-46bd-a58a-b03c81ab5fee) | 以苏州园林为基的院墙/殿堂/塔式模块，可自定义拼接 | 商业、Unreal Engine only；购前评估合法跨引擎及唐制差异 |
| A | [中国模块寺庙 PBR 构件](https://www.fab.com/listings/f083b1c2-05df-4de8-b01c-6ee7dce60228) | 砖墙、木门、石瓦、青瓦/柱梁多个模块，现代PBR | UE Marketplace商业专用授权，非直接Blender/Three项目源 |
| B | [传统中国楼阁单建筑](https://sketchfab.com/3d-models/chinese-hut-1b9c99b0fa9d49b88c4aa5b8c9c097da) | 40k tris；红木柱/曲线屋顶/雕刻 | CC BY；通用中国风不等于唐代形制 |

### historical-reference — 8 条

| 等级 | 直接来源 | 具体公开证据/价值 | 唐代/授权/技术风险 |
|---|---|---|---|
| B | [建筑斗拱单构件工艺参考](https://sketchfab.com/3d-models/bracketing-components-e4495d2427a240bcb706761f1af77a24) | 3.1k tris; 基于1103年宋《营造法式》的斗拱尺寸重建 | CC BY; **宋式不是盛唐式**，仅研究构件术语/关系 |
| C | [中式阁楼/庭亭写实扫描](https://sketchfab.com/3d-models/langya-pavilion-a5855420988e48b7a767758a95db83da) | 984.5k tris；无人机扫描五层琅琊阁 | CC BY；真实建筑始建明代，不能作为唐阁直接入城 |
| A | [唐代城堡遗址大场景扫描](https://sketchfab.com/3d-models/abandoned-7th-century-fortress-bffb7b6929824b43b9051ad2c67a576c) | 3.2M tris；开阳堡整体夯土城墙实景扫描约300×215m | CC BY；遗址混合后世时期，**布局与土城墙研究**而非直接复原盛唐长安 |
| A | [敦煌唐代第328窟菩萨写实扫描](https://sketchfab.com/3d-models/kneeling-attendant-bodhisattva-129635ad396947a7975c9e5ba6095f32) | Harvard Art Museums；七世纪唐代泥塑上彩，999.3k tris | CC BY；仅用于唐代服饰、色彩、雕塑实证，非普通活人 rig |
| A | [唐代站立女俑真实扫描](https://sketchfab.com/3d-models/standing-chinese-woman-figure-tang-dynasty-d2118efe2b8d4df28661e4ff0501b75e) | Mount Holyoke College 博物馆618–906唐女子陶俑，6M tris | CC BY；制作成人体比例与高髻衣裙形制参考，彩釉与实人脸区别 |
| A | [唐代骑马俑二件扫描](https://sketchfab.com/3d-models/chinese-equestrian-figures-tang-dynasty-55e4c6ae757b455d970debc51a742e6c) | Mount Holyoke 唐代骑马陶俑 10.5M tris | CC BY；胡服/鞍马姿态参考，陶俑本身不能直接当动态人物 |
| A | [唐代天龙山坐佛扫描](https://sketchfab.com/3d-models/19435322-model-caea-university-of-chicago-047235675c0242bb90398a1f333042ed) | Harvard/Chicago大学石佛造像8世纪，1.8M tris | CC BY；寺院造像唐代材质/比例艺术参考，不随意当城市路边装饰 |
| B | [唐代镇墓兽三彩雕塑](https://sketchfab.com/3d-models/tang-dynasty-tomb-guardian-zhenmushou-46a7591d54a443248d95a6fa394ac210) | Mount Holyoke真文物扫描约6M tris，唐代釉色与瑞兽参考 | CC BY；墓葬器物不能随意在市街摆设或冒充小青龙 |

### props — 2 条

| 等级 | 直接来源 | 具体公开证据/价值 | 唐代/授权/技术风险 |
|---|---|---|---|
| A | [真实雕刻门口石狮高精源](https://sketchfab.com/3d-models/stone-big-lion-01-68e7b4db10214d12bf4ae6ec53bf1e4f) | 游戏艺术家高模约400k tris，原高模约10M tris | CC BY；不等于唐狮子造型；下载是否附高模待核 |
| B | [写实石狮摄影扫描](https://sketchfab.com/3d-models/3d-scanned-chinese-lion-517afad18b154b3f9ded1052b2ce5fad) | 504k tris，可做宫墙石雕真实材质实验 | CC BY-SA；衍生分享约束应评估后再正式采用 |

### environment — 5 条

| 等级 | 直接来源 | 具体公开证据/价值 | 唐代/授权/技术风险 |
|---|---|---|---|
| A | [CC0巨石真实扫描 1.8m](https://polyhaven.com/a/boulder_01) | Poly Haven Boulder 01；1.8m/124k tris/8K、青苔矿物自然雕刻面 | CC0；曲江园林山石/溪石源，岩性未必对应长安需美术调色 |
| A | [CC0六件青苔岩石套装](https://polyhaven.com/a/rock_moss_set_01) | Poly Haven 6种形态/约63k tris/8K，林间溪岸组景 | CC0；河石、苔藓地表和暗部湿度需真实统一 |
| A | [CC0第二套苔石](https://polyhaven.com/a/rock_moss_set_02) | Poly Haven青苔石组合约58k tris/8K | CC0；同站多套近景可复用纹理，需一致湿润度与真机成本 |
| B | [CC0树根/枯落物](https://polyhaven.com/a/single_root) | Poly Haven真实外露树根、落叶与泥土完整底座 | CC0；用于曲江岸边树根侵蚀、潮湿地面 |
| B | [CC0 8K单体岩石材质母版](https://polyhaven.com/a/rock_09) | Poly Haven 8K近景岩石约23k tris | CC0；供脚底近景及溪流散石 |

### vegetation — 6 条

| 等级 | 直接来源 | 具体公开证据/价值 | 唐代/授权/技术风险 |
|---|---|---|---|
| A | [CC0苔藓实体模型](https://polyhaven.com/a/moss_01) | Poly Haven Moss 01、246k tris/4K、Geometry Nodes源/LOD、0.8m覆盖 | CC0；精细近景供溪石、瓦缝、园林，远景需实例或贴图烘焙 |
| A | [CC0真实蕨类草丛](https://polyhaven.com/a/fern_02) | Poly Haven四丛蕨/约6k tris/8K、精细叶缘 | CC0；园林背阴/近溪植被，具体植物地域适配待核 |
| A | [CC0松树林三株高精](https://polyhaven.com/a/pine_tree_01) | Poly Haven松树原始源约17M tris/8K/LOD、自然树皮和枝针 | CC0；仅保存高精制作母版，运行时优化/风动画；树种和形态需唐长安园林化 |
| B | [CC0常绿冷杉组三株](https://polyhaven.com/a/fir_tree_01) | Poly Haven冷杉源约8M tris/8K、3棵不同体量 | CC0；可能不适合长安气候常见树种，仅山间可选 |
| A | [CC0小树树冠近景](https://polyhaven.com/a/tree_small_02) | Poly Haven完整树干、树皮、稀疏透光树冠，8K源 | CC0；逐项校树种与动物生态/实际可下载几何 |
| A | [CC0真实灌木丛](https://polyhaven.com/a/shrub_02) | Poly Haven多枝树苗与自然叶片、约52k tris | CC0；近景生态变化与过渡植栽，动态风需验证 |

### rendering — 5 条

| 等级 | 直接来源 | 具体公开证据/价值 | 唐代/授权/技术风险 |
|---|---|---|---|
| A | [CC0清晨河岸真实照明HDRI](https://polyhaven.com/a/river_rocks) | Poly Haven River Rocks HDRI、16K解压动态范围21EV自然河岸晴天 | CC0；主要作为真实光照/太阳/水面反射标定，不是湖泊动态水代码 |
| A | [Three现代WebGPU物理天空系统](https://github.com/pmndrs/sky) | MIT @pmndrs/sky：太阳角驱动空气散射、夜空星河、IMBL与远景雾，WebGPU专用 | 初期独立基准，真实渲染GPU耗时/Three版本约束需实测 |
| B | [Eanpa-Sky高精云雨光实验](https://github.com/SkyeShark/Eanpa-Sky) | MIT Three WebGPU天气：体积云、雷暴、云前线、日夜、可行走世界 | v0.1早期demo，云层性能/兼容仍不稳定；且第三方鸟鸣可能NC不可一并复用 |
| B | [Tideline水天海面完整实验](https://github.com/expertping/tideline-threejs) | MIT Three Gerstner海面/镜面反射/折射/太阳闪光/体积云雨雪等 | fork上游通知/版权和技术质量要评估；大海波形不适合溪流，取工艺而不是直接移植 |
| B | [完整可编辑瀑布喷泉GLB套件](https://www.fab.com/listings/39ad6fb8-fc5f-4429-acc4-04ed27ecdef3) | Fab免费 17 个瀑布/喷泉/跌水静态组件、GLB+Blender+FBX | AI-assisted，512贴图且**仅静态水几何、没有动态缓存**，不能直接称流水动画 |

### asset-optimization — 1 条

| 等级 | 直接来源 | 具体公开证据/价值 | 唐代/授权/技术风险 |
|---|---|---|---|
| A | [gltfpack高精资源压缩工具](https://github.com/zeux/meshoptimizer) | meshoptimizer gltfpack: glTF量化/meshopt压缩/KTX2、运行时各引擎支持 | MIT；需要与动画形变及PBR实画对照，不能只求包小 |

### spatial-query — 1 条

| 等级 | 直接来源 | 具体公开证据/价值 | 唐代/授权/技术风险 |
|---|---|---|---|
| B | [Three WebGPU地形/城市chunk实验](https://github.com/vibe-stack/super-terrain) | 4km×4km逻辑地形、5 LOD、洞穴CSG、资源分区/WebGPU | 项目早期，许可/依赖要固定版本检查；没有WebGL2回退 |

### architecture-tool — 1 条

| 等级 | 直接来源 | 具体公开证据/价值 | 唐代/授权/技术风险 |
|---|---|---|---|
| B | [自定义中式建筑模块JS程序集](https://github.com/achrefelouafi/ProceduralBuildingsThreeJS) | Blender导出kit/graph、UTF文字牌匾/UV/PBR的可编辑建筑模块构成 | 未知LICENSE需核；最重要的是画质/唐式比例，不可再拿自动拼积木当终稿 |

## 关键筛选与操作次序

1. 当前 Codex Cloud 已获得 Einar 和两只 Grab3D 龙源，禁止重下/覆写。与它分工：优先取**官方CC0苔石、蕨丛、森林岩石**的完整高精源，而不是再下载低精中式家具。
2. 验证官方文件及材质依赖/许可证/作者、取得 SHA256。对于巨型8K/17M三角形松树，源项目可保留高模母版，实际网页要做分区加载与适度 LOD；体积变大不是允许直接耗尽16英寸笔记本显存。
3. 历史参考以博物馆实物编号、年代、材质和作者/许可存证，与幻想青龙、影视美术风格分离。模型美术验收前不得以“唐代”字样作为真实性合格证明。
4. 一组可进入店铺、柳岸、弯曲溪流、小桥、唐人和主角完整高精区，用统一镜头、真实动态视频、历史正确性与GPU测试最终选引擎和材质管线。
