# 《龙游长安》全域成熟素材批量检索（2026-10-24）

> 本批次是**有实际公开来源链接的候选搜集**。唯一结构化主目录仍是 [resource-catalog.json](resource-catalog.json)；**没有下载本轮新候选的模型原始文件，也没有运行 Blender/引擎验证。** 用户允许桌面16英寸笔记本画质优先、数百MB/GB级资产及服务器动态加载。不得拿资源条数或纹理尺寸等同完成品。

本次从公开 Fab、Sketchfab、GitHub、Blender Studio、Poly Haven、Sonniss、CGTrader 等页面进一步筛选完整院落/唐式屋顶/市场、男女自然人物和唐服/布料工具、骨骼风动垂柳及园林、古桥和木船、真马和骆驼、完整水体/大气 shader 与真实环境音。高完成度优先于资料多，所有目录入库条目是 candidate—not acquired。现有 Codex Cloud 已在做 Einar 与 Grab3D 龙源，**先查进度，禁止覆盖或重复获取**。

## 高价值优先序

1. 首先核实真正能取得并合法改造的完整高质量建筑和商铺，如 Fab 茶果铺、完整中式院落和唐式屋顶，近看前后侧与室内均完整，不能只搭外立面。
2. 同时推进 Style3D 唐装与合规人体/Blender 裁片缝纫，尤其检查长袖下垂、领襟、裙褶、衣内穿模和正常成年人头脸，不拿粗糙程序化衣服交付。
3. 柳树等植被优先真实枝条层次+可风动美术源，选择写实树包并统一唐风园林季相与光照。
4. 水面分湖泊 glints 与弯曲小溪方向场/桥石涡流、真实河床 PBR、空间音频；所有水材质/湖面 shader demo 都需验证能否适配真实曲流。
5. 30动画真马/驼队、古桥木船、市井茶具/茶灯，经过历史与许可证核对后才进入一段完整街区。

## 本轮新增候选（同URL去重）

### architecture（4）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| A | [古式中式完整庭院](https://www.fab.com/listings/31342a68-5574-44df-8862-0851efa3ddcb) | FBX/OBJ/USD；厅堂庭院廊道齐全；平台商业授权、非唐史实 |
| A | [唐风模块殿柱与歇山屋顶](https://www.fab.com/listings/adcb95c8-1270-4b6e-83e4-0ec6a9bd5e0d) | 唐式屋顶拼装系统；仅UE蓝图，AI生成标签，迁移待核 |
| B | [中国传统院落景观](https://www.fab.com/listings/116112f1-1d13-4afe-b1f2-de6aa16821e9) | 庭院建筑和植被全场景 FBX OBJ USD；现代院落非唐 |
| B | [唐代宫苑商品场景](https://www.cgtrader.com/3d-models/exterior/historic-exterior/tang-dynasty-chinese-palace-architecture-imperial-palace) | 宫殿亭榭和莲池大型模型候选；真实性仅卖家宣称 |

### market（5）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| A | [中式茶果铺完整环境](https://www.fab.com/listings/b4f3d9b3-0850-42f1-8689-85362d3fcc76) | 茶柜水果铺木亭与大量器物 FBX OBJ；付费，食材年代待核 |
| B | [古代东南亚市场摊位](https://sketchfab.com/3d-models/low-poly-traditional-market-stall-83f6b14a28094a5ab5f8396ea6f4c1e9) | 8.4k三角形CC BY；木摊结构适合改造，非唐文化 |
| A | [成熟精细市集帐篷+蔬菜货品](https://sketchfab.com/3d-models/medieval-market-tent-prop-01-328464a4350745ffbfdab11d328320ab) | 660k三角形2K贴图CC BY公开页；另有购买包，不确定免费文件范围 |
| B | [中古木质果摊](https://sketchfab.com/3d-models/medieval-market-stall-b5d87398b87a4e7ab8959da2c6a47056) | 21.7k三角形CC BY；完整摊铺局部，可深度改造 |
| B | [果蔬摊游戏道具](https://sketchfab.com/3d-models/market-stall-6bb15dc7056241bfac6ee747fc866e45) | 25.1k三角形CC BY；完整蔬果货架但低美术完成度 |

### props（6）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| B | [市场桌布篮子果品装饰](https://sketchfab.com/3d-models/medieval-market-table-and-decorative-objects-c2752265b43c4e4898515d6e0a8d7f50) | 82.6k三角形2K贴图CC BY公开页；西式需唐化，另有购买入口 |
| A | [中式古餐盒](https://sketchfab.com/3d-models/chinese-tableware-8008b8c234c048369d329483afacaf46) | 27k三角形CC BY；餐盒和贴图，年代需核 |
| B | [可发光纸灯笼](https://sketchfab.com/3d-models/old-chinese-lantern-lowpoly-for-free-download-73b1e60901e6494fb0cb39affca6f850) | 976三角形CC BY；PBR发光贴图；灯型未必唐制 |
| B | [4K细节中式宫灯](https://sketchfab.com/3d-models/chinese-lamp-4096px2-9eddb4de98274410b7405f7ea6667f3a) | 47.8k三角形/4K贴图CC BY；高精灯饰非唐证据 |
| B | [带动画中国灯笼](https://sketchfab.com/3d-models/chinese-lantern-690d8633f7f5460fa886fb87edc96645) | 6.2k三角形CC BY；animated标签但绑定文件需核 |
| C | [写实中式茶壶扫描](https://sketchfab.com/3d-models/chinese-teapot-707c02279e1c4be4a45007c4321c962b) | 398k三角形CC BY；现代实物非唐代器形 |

### interior（1）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| B | [中式茶桌茶具](https://sketchfab.com/3d-models/tea-table-set-36b31b3484df46a781409825a9903d00) | 11.9k三角形CC BY；Blender Substance制作 |

### clothing（2）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| A | [Style3D唐齐胸印花汉服A](https://sketchfab.com/3d-models/tang-dynasty-chest-length-printed-hanfu-427e40b1f7134b2b8ca2e79b8651b236) | 136.6k三角形CC BY页面；齐胸汉服PBR，完整导出格式需联系作者 |
| A | [Style3D唐齐胸印花汉服B](https://sketchfab.com/3d-models/chest-length-printed-hanfu-of-tang-dynasty-cdcb01bcd11342c19446d9037732c3fe) | 303.7k三角形CC BY页面；复杂褶皱，无现成完整Rig |

### characters（3）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| A | [Blender Studio Human Base Meshes](https://www.blender.org/download/demo-files/#assets) | 官方演示CC0专业人体基础拓扑约49MB；并非完成唐人 |
| A | [VitruvianGodot成人FACS脸](https://github.com/ibrews/VitruvianGodot) | CC0写实人体声称，真实FACS表情和皮肤；Godot渲染不能直接搬网页 |
| B | [Hanfu Hero男装绑定角色](https://sketchfab.com/3d-models/3d-hanfu-hero-8fa0155c8dd042a28bf84119a0ce9712) | 32.8k三角形，Rig/7脸部动画；付费Fab另有资产，形象偏动漫 |

### character-tool（2）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| A | [3D-Gen全身角色与62动作](https://github.com/olatunde85/3d-gen) | MIT代码+CC0 MakeHuman自述，65骨，骑车划船骑马动作；需跑实测/查依赖 |
| A | [CharacterCreator可换装人体方案](https://github.com/kblood/CharacterCreator) | Blender MPFB glTF布物理动画人体；授权变更需按固定提交审查，已有穿模缺陷 |

### clothing-tool（1）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| A | [OpenSew-2专业服装缝纫](https://github.com/MarcelloMorettoni/opensew-2) | GPL Blender5.2裁片缝合/动态褶皱/权重传递；需单独设计唐服裁片 |

### animation-tool（1）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| B | [Mixamo人物自动绑定和动作](https://www.mixamo.com/) | Adobe账户服务/授权单独核对；人物步行闲逛动画 |

### vegetation（7）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| A | [四株骨骼与动画垂柳](https://sketchfab.com/3d-models/rigged-animated-weeping-willows-c315c039042240dbbc0c2704f7cec83c) | 760k三角形CC BY，单树约250骨；高精风动但性能需LOD |
| B | [高精密柳树](https://sketchfab.com/3d-models/willow-tree-2378d616b9da4ba39b5ccbe157e22e86) | 405.8k三角形CC BY；真实树型，风动材质未核 |
| B | [老柳枝干裸树](https://sketchfab.com/3d-models/old-willow-high-poly-96c207c7da174429b304b6129c6d04ce) | 276.8k三角形CC BY；树干8000枝，无树叶 |
| A | [七款真实树种包](https://sketchfab.com/3d-models/realistic-trees-collection-fe67c886eebf4bcb988d7c45e69995ad) | 127.7k三角形CC BY；七类树冠实际树种待核 |
| B | [优化的真实树模型](https://sketchfab.com/3d-models/realistic-tree-d989c0f801d847b9a74992ec4ddcfdfc) | 19.9k三角形CC BY；真实冠形OpenGL法线 |
| A | [五款垂柳花树资产](https://www.fab.com/listings/cd525b36-f8d3-4aea-9b91-7bec96ebcafb) | 5套 Blend/FBX/GLB+PBR2K，含柳和花树；商业，无LOD |
| A | [十款柳银杏花树](https://www.fab.com/listings/dc5976d8-1175-4d5d-8d3c-c2752dfa550a) | 10套完整GLB/Blend/FBX/PBR；付费且尚无风动 |

### vegetation-tool（2）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| A | [MTree现代Blender树生成](https://github.com/GoodPie/modular_tree) | Blender4.3+柳/松生长与风动数据；许可证以固定提交核 |
| C | [TreeGen LLM树形试验](https://github.com/YuutoSeki/treegen-llm) | MIT Blender4.3+ Geometry Nodes；只能做辅助，不当最后美术 |

### material（1）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| A | [Poly Haven森林落叶地面](https://polyhaven.com/a/leaves_forest_ground) | CC0最高8K，树林土壤草叶/置换法线材质，非立体模型 |

### bridges（1）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| B | [PBR古石桥](https://sketchfab.com/3d-models/stone-bridge-low-poly-21042e4094c6453b8ea997d602de6dac) | 87.6k三角形CC BY，2K完整PBR；并非唐石桥制式 |

### boats（4）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| B | [中国古商帆船](https://sketchfab.com/3d-models/chinese-junk-a331d56c34ff4d958763114dc8e7c275) | 23.4k三角形CC BY，海船非曲江画舫 |
| B | [中国木船分离船帆和橹](https://sketchfab.com/3d-models/chinese-junk-inspired-boat-with-sails-paddles-683ba5a442ae43ebbe041fe69327ad7e) | 10.4k三角形CC BY，作者注明不是准确中国古船 |
| B | [高面中国帆船](https://sketchfab.com/3d-models/chinese-junk-ship-35b340bce9fb4e0680bc0116cebc35c9) | 205k三角形CC BY；学习模型不等于成熟商用美术 |
| B | [内河木制货船](https://sketchfab.com/3d-models/gabarre-freight-river-boat-2dc4f3fb8e884b74af4d3674895a35fe) | 13.3k三角形CC BY；欧洲船体仅供船身结构参考 |

### animals（4）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| A | [30动作真马GLB FBX](https://www.fab.com/listings/2182ce90-52db-470c-9987-671112831f3c) | 10.4k三角形30动作PBR，2K/FBX GLB；商业授权未购 |
| A | [十二毛色高质马](https://www.fab.com/listings/3fb40390-633d-43c1-bf82-6a3b33a34c9c) | 真实毛皮和多动作，必须核下载原格式与动画 |
| A | [骆驼Rig和五动作](https://www.fab.com/listings/4848b5cc-9434-429d-8d4b-07897a08efc3) | Blender/FBX/GLB，Idle/Walk/Run/Eat，唐双峰驼形制待核 |
| B | [骆驼另一版模型包](https://www.fab.com/listings/86b1d3a4-60cb-4c3a-b502-ef21bbf78d71) | BLEND FBX OBJ GLB，可能和前者同源需要去重购买 |

### audio（2）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| A | [Sonniss 2026 GDC音效库](https://gdc.sonniss.com/) | 7.47GB 347+真实素材，商业媒体授权，但不允许AI训练或原声库再分发 |
| A | [Sonniss 2026音频授权文本](https://sonniss.com/gdc-bundle-license/) | 2026年8月27日版本EULA，必须按媒体成品声音而非原包分发 |

### rendering（6）

|优先|候选与原链接|页面具体能力、待核缺口|
|---|---|---|
| A | [Three WebGPU天空云日照](https://threejs.org/examples/webgpu_sky.html) | 官方WebGPU大气太阳云材质，需现代Three迁移后整合 |
| A | [Clearwater WebGL2浅水焦散](https://github.com/Aureliengmz/clearwater) | MIT FFT/涟漪/透明浅水+焦散，不含完整弯溪河流 |
| A | [PlayCanvas WebGPU高阶水](https://github.com/willeastcott/webgpu-water-playcanvas) | MIT水波/反射/折射WebGPU-WebGL2双后端，池水几何限制 |
| B | [原生WebGL2涟漪焦散](https://github.com/HowdyKeith/swek-webgl2-water) | MIT GPU乒乓波纹/菲涅尔/焦散，非溪流方向场 |
| B | [Web Ocean Three TSL水体](https://github.com/2600th/web-ocean-3d) | FFT/岸泡沫/船尾波/反射，许可和高GPU成本核实 |
| B | [Caustic Volume高级水透射](https://github.com/JesusGalindez/caustic-volume-threejs-water) | Three r186水下焦散/浮力/灯光复杂demo，溪流适配未完成 |

## 严格执行边界

- 公开页面称 CC BY、MIT、CC0 仅说明**初步许可证信息**；具体模型、部分贴图、动画、依赖可能另有要求。平台标 NoAI、NonCommercial、受限商品，不得直接进入模型加工或公开分发。商业资产付费须先由用户授权，禁止绕过账号或把购买原包上传公开仓库。
- 某些资源属清明宫殿、现代中式红灯、西方市集或东南亚木船，只适合作**制作工艺与素材可编辑性参考**；唐长安的建筑形制、唐服、商贸货品必须另有史料支持。
- 同价货源可能同一供应商重售，应查 SHA、截图和原创声明以免重复购买；若找不到合法可编辑成熟源，研究专业造型/雕刻工艺，不以低精几何代替。
- 商用音效库通常允许**作品中使用声音**，不意味着允许将原音频全集原样公开传播，也不允许用于 AI 训练。
- 进行视觉验收前，状态必须停留在 candidate。下载后明确 source SHA256、许可和字节，真正导入 Blender 验证前后侧/俯视/灰模/PBR/绑定或流动帧视频；用户最终主观验收另列。

## 第二轮补充：宫苑、庭院与可定位溪流原声

| 级别 | 成熟来源 | 公开规格、局限 |
|---|---|---|
| A | [唐代宫殿建筑群5座原始Blend](https://www.cgtrader.com/3d-models/exterior/historic-exterior/tang-dynasty-palace-complex) | 五座唐式宫苑建筑组合；纹理内置Blend，卖家明确无室内，仅可外景，商业购买待核 |
| B | [Sketchfab中式庭院公园大场景](https://sketchfab.com/3d-models/ancient-chinese-courtyard-park-55d8371278844dbbbe43e1f867b5fcde) | 268.6k三角形 CC BY，庭院/园林全景，非严格唐代；需四向检查 |
| C | [Sketchfab中国民居院落结构](https://sketchfab.com/3d-models/ancient-chinese-courtyard-house-ed4ea9eb5f024d989eec182d48fa72d8) | 7.7k三角形CC BY，只作院落类型结构草样，精细程度不足最终近景 |
| B | [Sketchfab现代高精中式庭院景观](https://sketchfab.com/3d-models/contemporary-zen-chinese-courtyard-f4e8ebb55f9b49b7b763b97a6436c6fb) | 140万三角形CC BY，完整庭院花园/水景空间，现代风格只借园林多层构图 |
| A | [Freesound野外河溪实录30秒](https://freesound.org/people/kentspublicdomain/sounds/325182/) | 44.1kHz双声道30.55s约5.1MB，作者原录溪流水声CC0；Freesound下载需登录 |
| A | [Freesound瀑布入溪实录67秒](https://freesound.org/people/Tom_Kaszuba/sounds/660252/) | 48kHz24bit双声道1:07约18.4MB，近距离跌水/小瀑布CC0，下载条件待核 |
| A | [Freesound苏格兰温柔溪流](https://freesound.org/people/BurghRecords/sounds/415151/) | 24bit96kHz约29s/15.9MB，流水氛围CC0；需平滑循环和空间化 |
| A | [Freesound环境小溪流64秒](https://freesound.org/people/BurghRecords/sounds/446019/) | 24bit96kHz 63.7s/35MB CC0，柔缓水声；可能与其另一声音内容重合 |
| B | [Freesound长时溪流水实录](https://freesound.org/people/INNORECORDS/sounds/469009/) | CC0 5分钟/50MB真实流水，长时自然声底；登录下载和循环音色待听 |

水声建议：在主溪浅滩、桥下、跌水位置用不同CC0源作为空间化声音层，动态根据 WaterDomain 的流速/水高衰减。**CC0原声尚未下载，更未试听、切循环或入城。**
