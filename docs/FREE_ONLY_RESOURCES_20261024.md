# 2026-10-24 免费资源协议（只能 $0）

## 规则

用户新增绝对价格边界：**只要免费的素材、免费技术或免费引擎**。以前的 Fab、CGTrader、BOOTH 付费素材只作为历史研究，不得自动付费、试用收费套餐、额外索取商业授权或把必须付费的 Source 版本当作免费。零元的 CC0、CC BY、明确许可商用的开源项目可列入；登录免费的 Sketchfab 资源可以继续筛选；CC BY 仍需署名，商用/AI/第三方贴图许可必须最终核查。

质量边界**没有降低**。不能因为免费而使用低质模型冒充高精成品；成熟美术达不到要求，应主动继续筛选合法高品质免费资源或采用专业 Blender 建模工艺，自做原创内容而不是买付费包。每次新会话请在系统正式选型/下载前应用 docs/resource-catalog.json 的 free_only_policy。

## 本轮找到的实际高价值免费来源

| 类型 | 精选免费来源 | 真实状态/限制 |
| --- | --- | --- |
| 中国四角亭 | [VVayToyek — CC0](https://vvaytoyek.itch.io/chinese-four-corner-pavilion-free) | $0可下载2.6MB Blender亭子；无纹理，有UV，后续需要精细木构材质与唐代形制验证 |
| 中式传统围墙 | [VVayToyek](https://vvaytoyek.itch.io/chinese-classical-garden-wall-free) | $0下载18MB，门洞、花窗、墙高、转角成套；原作者的 [Godot Asset Store 同款发布页](https://store.godotengine.org/asset/vvaytoyek/chinese-classical-garden-wall/) 已标示 CC0 1.0。下载后仍须核对压缩包内文件及附加依赖，暂未入库。 |
| 曲面中式房屋 | [Sketchfab — CC BY](https://sketchfab.com/3d-models/traditional-chinese-house-low-poly-stylized-0f5fbcbf1489432a81e372e6d38699dd) | 236.9k三角，曲瓦/木窗/台阶，免费账户下载；与唐木构形制/内外细节仍需比较 |
| 中式石桥 | [Sketchfab — CC BY](https://sketchfab.com/3d-models/chinese-detailed-bridge-d7b336d1ab24418ea1a429dbe2c59bfe) | 70.7k三角，桥栏/桥面可编辑候选；需实测碰撞和溪流贴合 |
| 东方中国龙动画 | [Sketchfab — CC BY](https://sketchfab.com/3d-models/chinese-dragon-a5ad5ec06f43461f95bb93e95fe7553b) | 50.6k三角，页面声称动画已就绪；**尚未下载检查骨骼/动作/完整拓扑或小青龙风格** |
| 带简单Rig垂柳 | [Sketchfab — CC BY](https://sketchfab.com/3d-models/weeping-willow-tree-48c090ce93d543cf8b19d3c6f2b6788a) | 144k三角，网格简单绑定、只有漫反射颜色，需真实 PBR/风动重做 |
| 成人角色高精基本绑定 | [THEUNSEENVULGA — CC0](https://theunseenvulga.itch.io/3d-character-riggedema) | 76k三角FBX/GLTF/OBJ，免费完整角色但非唐装，只有后续高精改造及变形测试通过才能采用 |
| 免费室内外模块化建筑工程 | [Quaternius 标准版 CC0](https://quaternius.itch.io/medieval-village-megakit) | 免费 Standard 153MB，含前后墙、楼梯、屋顶、道具；**付费 Pro / Source 均明确排除**，低模结构用作技术验证不作唐代成品 |
| 风格化自然树木生态包 | [Quaternius Standard CC0](https://quaternius.com/packs/stylizednaturemegakit.html) | 免费子集仅60–70% (并非全116款)，可以统一原版叶色和分枝，不能冒充高精写实 |
| 人物动作 | [Quaternius Universal Animation Library CC0](https://quaternius.com/packs/universalanimationlibrary.html) | 标准免费子集，可研究行走、转身、游泳等通用骨骼重定向，不购买Source |
| 超完整材质/家具 | [Poly Haven CC0](https://polyhaven.com/) | 官方无注册下载、作者手工PBR；Chinese Tea Table、Chinese Cabinet/Chandelier、真实园林岩石及泥土地表，高分辨率授权免费 |
| 建筑植被技术辅料 | [Kenney Nature Kit CC0](https://kenney.nl/assets/nature-kit) | 330款组件但大多低模，必须限制为占位/远景；不允许冒充完成度 |
| 高精通用材料 | [ambientCG CC0](https://ambientcg.com/) | 完整 PBR，木/砖/岩/泥/地面；使用时核实作者原件与具体地图，不通过收费第三方再下载 |
| 河床真实 PBR | [Poly Haven River Small Rocks CC0](https://polyhaven.com/a/river_small_rocks) | **本轮实际入库1K漫反射/法线/ARM三张原始纹理并核 MD5，后续用2K/4K源提高最终质量；尚没有动态溪水** |

**免费不等于可商用、不等于可再分发原包、更不等于美术合格。** 明确把“只有0元预览、付费原始文件”、“NoAI”、“CC BY-NC”、“需要订阅或必须捐赠”等资源排除自动采集；有权限疑点的条目保留研究但不整合。

## 本轮实际新增的 CC0 原始文件

`assets/library/free-curated/polyhaven/` 新增中式茶桌 1K glTF + BIN + 3 PBR，以及河底石 1K 的漫反射、法线GL、ARM，合计 8 个**实际字节文件**。全部来自 Poly Haven 官方公开 URL 并对照官方 API MD5；这只是资产工艺预览源，不是画质上限。请从原站后续获取4K+（存在时最高8K）主资产在受控高精素材仓库储存；不要以1K降模/降纹理替代用户电影质量。

下一阶段优先把三类免费成熟高质资源真正取得（建筑/唐服、可动人物小龙、风动植被/桥溪），通过 Bl​​ender 五面完整真实渲染 + 动态水视频 + 实机高画质。仍不可将模型网页当已下载成果。

## 本轮免费四角亭源包追加状态（未入库）

在 [Godot Asset Store 的原作者免费 CC0 页面](https://store.godotengine.org/asset/vvaytoyek/chinese-four-corner-pavilion-free/) 实际取得 2,777,866 字节 ZIP，下载时计算 SHA256 为 `008fb5c4508ce57c4203e5763fd01a177ded16ca94fd5de34ea26c422b483efa`。但向 GitHub main 提交这个 ZIP 的操作被系统安全检查阻止；因此**未将该 ZIP 计入仓库已取得资产**。仅保留公开来源与校验信息，禁止宣称文件已在 GitHub；后续应先安全检查其内容和许可，不绕过检查强行提交。


## 2026-10-24 继续检索与4K实际入库（免费严格规则）

新发现的来源均标示可免费取得（或开源/CC0）。历史不匹配、CC BY-SA或需要账号的资源只作为研究候选，不自动整合。以下18个来源是在已有唯一资源目录中去重后新增。

|优先级|具体资源|公开能力|未解决的风险|
|---|---|---|---|
| A | [Modular Wooden Pier (Poly Haven)](https://polyhaven.com/a/modular_wooden_pier) | CC0 modular pier: rope, timber piles, 85K tris, 4K provider pack 77,659,602 B; use for waterfront wharf source | Generic weathered dock, not authenticated Tang, no download |
| C | [Chinese Armchair (Poly Haven)](https://polyhaven.com/a/chinese_armchair) | CC0 8K hand-carved wood, useful finished PBR lacquer source | Ming-like shape explicitly not Tang historical source |
| C | [Chinese Sofa (Poly Haven)](https://polyhaven.com/a/chinese_sofa) | CC0 8K vintage carved sofa; surface finish and wood profiles | Not Tang furniture type |
| C | [Chinese Console Table (Poly Haven)](https://polyhaven.com/a/chinese_console_table) | CC0 8K old Chinese wood, 4K pack 29,237,476 B provider API | Later-era style; not acquired; never label as Tang |
| C | [Chinese Commode (Poly Haven)](https://polyhaven.com/a/chinese_commode) | CC0 ornate storage cabinet, finish/material reference | Later-era hardware and form |
| B | [Antique Ceramic Vase 01 (Poly Haven) actual 4K](https://polyhaven.com/a/antique_ceramic_vase_01) | CC0 full 4K editable glTF geometry+PBR and original textures acquired, all hashes verified | Exact historical dating unknown, not a verified Tang vessel or user-approved art |
| A | [SeedOcean WebGPU river/lake engine](https://github.com/expertping/SeedOcean-threejs) | MIT v0.6-alpha WebGPU/WebGL2, bounded river and mountain lake presets, foam/wake; fork of upstream | Experimental fork; actual river direction, performance and bundled licenses untested |
| B | [Three Water Free JONSWAP FFT](https://github.com/baditaflorin/threejs-water-free) | MIT r181+ TSL WebGPU ocean, sun glints/refraction/caustics and buoyancy | Ocean math more suitable for lake than shallow curved creek |
| A | [Spring Open Movie production source](https://studio.blender.org/projects/spring/pages/about/) | Blender Studio full film CC BY source including forest, animated animals and detailed cloth workflow | Source download/account may vary; character/forest aesthetic is not Tang |
| B | [Spring Hero Production Rig](https://studio.blender.org/characters/spring/v1/) | Free CC BY full film-quality heroine rig, skin and garment deformation | Stylized young heroine not normal Tang adult; old rig Blender2.8-3.6 |
| A | [Cloth Lab Blender cloth sewing GPL](https://slohero.com/tools/blender/en/) | Free $0 GPL 3.0+ Blender5.2 cloth pattern/physics/sewing add-on, 6 starter patterns | Not a Tang pattern; independent install/license/runtime separation required |
| A | [Anhui Bridge and Riverbank scan](https://sketchfab.com/3d-models/old-bridge-and-riverbank-fdbcbceb954b49af9234e997869d6312) | CC BY ~972K triangle real stone bridge riverbank photogrammetry | Late Anhui/photogram scene, not Tang city |
| B | [Anhui Riverside Buildings and Bridge scan](https://sketchfab.com/3d-models/residential-buildings-by-the-river-and-bridge-7081097d56f04ba38f1a890a7ec5400b) | CC BY ~977K real riverside building bridge photoscan | Region/period wrong; only structural/material reference |
| C | [Chinese Pavilion Grease Pencil study](https://sketchfab.com/3d-models/chinese-pavilion-82b254fe1f5b4381959db8799181edbe) | CC BY Blender Grease Pencil ink pavilion art ~1.1M triangles | Not guaranteed usable watertight 3D building, art direction only |
| A | [Tang Chinese Coin downloadable](https://sketchfab.com/3d-models/chinese-coin-384f557db51a407e807c59af188cc9cc) | CC BY 30.9K triangle Tang coin, small close-up cultural item | Mint and inscription authenticity not checked |
| A | [Tang Bronze Mirror scanned](https://sketchfab.com/3d-models/chinese-bronze-mirror-81e693050be345dd9db8ace54fea5de5) | Museum Tang 705-907 ~960K triangle bronze mirror, bird grape lion relief | CC BY-SA, obligation before derivatives; research only until reviewed |
| A | [CC0 OpenGameArt OwlishMedia Foley](https://opengameart.org/content/sound-effects-pack) | OpenGameArt CC0 142MB foley: footsteps, cloth, water, doors, people | Real audio screening/mixing required; not yet downloaded |
| A | [Blender Demo Files Official CC0 subsets](https://www.blender.org/download/demo-files/) | Blender human base 49MB CC0, procedural Tree Leaves Grass & Pebble Scattering CC0 | Per-demo license differs; do not infer CC0 for whole page |

已真实下载第一套完整4K模型： [Poly Haven Antique Ceramic Vase 01原始GLTF](../assets/library/free-curated/polyhaven/antique_ceramic_vase_01_4k/README.md)。glTF、BIN和三张4K原件共3,129,647B，五个文件与Poly Haven官方MD5一致，记录了SHA256和原始下载地址。**这是可编辑真实源，不是唐代形制或正式游戏模型的批准。**

免费CC0木码头4K官方8文件共77,659,602B，复古中式案几4K官方5文件共29,237,476B，**仅获取了元数据，并未下载这些文件**。新水候选SeedOcean可做湖泊/弯曲河道动态，处于alpha，必须使用同场景A/B评估真实帧率、流速、岸泡沫与反射。
