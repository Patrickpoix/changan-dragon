# 《龙游长安》零费用精选素材：分门别类的取得与整合入口（2026-10-24）

> 本文件是**人工优选清单/工作交接，不是第二份资源数据库**。记录全集以 `docs/resource-catalog.json` 为唯一权威；实际每件原始源的SHA256、官方MD5、版权和相对依赖以各自 `manifest.json` 为准。此分支没有把未上传的二进制伪装成已经在 GitHub 的文件。严格 **$0**；高面数/4K不等于美术合格。

## 1. 工作目录与实际取得范围

- **已实下、按类别整理：** 本地 `assets/library/free-curated/categories/{vegetation,interior,material}/polyhaven/{id}_4k/`。新增九套**完整4K原厂CC0**，共 **45个源文件、239,382,874 B**，逐一重算官方MD5、SHA256、大小、4K贴图尺寸及glTF外部依赖，全9套通过。三维源+材质原件不减面、不降图。
- **另已有上轮本地取得：** `modular_wooden_pier_4k`（77,659,602B）、`river_small_rocks_4k`（43,106,238B）、`chinese_console_table_4k`（29,237,476B），共16源文件150,003,316B。
- **本次与上轮实际取得共12套、61个原始源文件、389,386,190B**（约371.35MiB）；其中11套包含静态模型/材质glTF源，1套仅河床PBR。

## 2. 17种需要的资产：该选什么、是否已取得、为什么是优先方向

| 家族 | 首选可信基础 / 免费最佳候选 | 状态与目录 | 必须完成的整合验收 |
|---|---|---|---|
| 宫阙/唐代殿堂 | Blendkit **Chinese Temple** 和 **Chinese Temple 2**（Free、CC0），参考782年南禅寺真实木构 | **来源候选**，Blendkit需合法免费账户+Blender插件；不能宣称已下载 | 殿堂完整正背内顶、柱网/斗拱/台地、真实唐制，不能搬明清檐兽 |
| 普通坊巷/民居/店铺 | Blendkit **Chinese High House Wood**、Old Chinese Roof House（Free CC0），现有 `tools/build_timber_shop.py`研究源 | **候选+已有码研究**；尚无已获美术放行的完整双层店铺 | 完整内外、楼梯楼板、后院、商铺经营、无穿模 |
| 园亭/廊道/建筑构件 | Blendkit **Chinese Pavilion**（约896k面、Free CC0）与现有木构构件；VVayToyek CC0四角亭作改造基线 | **候选**，无法获取无登录的高精原包 | 亭下可穿行、柱网真实、檐下、四向顶壳、结构依据 |
| 门楼/围墙/宫墙 | VVayToyek **Chinese Classical Garden Wall**（零美元、标CC0），与现有项目宫城坐标 | **候选**，itch.io正常零元流程尚未完成 | 坊墙门窗尺寸、高差、角部拼接、别误用江南园窗作所有唐坊 |
| 桥梁/步桥 | Sketchfab **Chinese Detailed Bridge**（CC BY、70.7k面）和现有码头/桥梁结构研究 | **候选**，免费账户下载未执行 | 柱脚、水下接地、步面、桥洞净空、连续地形碰撞 |
| 柳/松/花树/地被 | rock_moss_set_02、shrub_02、fern_02完整4K真源；Sketchfab垂柳144k/15款松树LOD候选 | **3套已在本地分类下载、hash通过**，树源仍需账户 | 自然长枝、风动、三层LOD、根系接地、景观树种统一 |
| 河底/湖岸/地形 | 原有 `river_small_rocks_4k`；rock moss和落叶林地 `leaves_forest_ground_4k` | **原件本地已取得**，来源均Poly Haven CC0 | 河床真实坡度、湿润岸线和动态水反射共用接口 |
| 湖泊动态与弯溪流水 | Waterways MIT流向/流速场作概念、Three现代水效果候选 | **只有源码/网页研究**，没有已完成水动画 | 90°弯、水流向量场、反射/折射/光斑、泡沫、船桨尾迹的视频实测 |
| 真实舟船/画舫/码头 | 原有本项目三型船研究GLB + `modular_wooden_pier_4k` CC0 | **船壳研究在库，4K码头本地已取得** | 唐形制舱室、吃水、上船/靠岸/移动载人、桨真实入水 |
| 成人角色/面部表情 | 已取得 **Blender Studio Einar** 工艺源、**MakeHuman CC0人体基体** | **已有高精工艺原件**，不重复下载；Einar现代老人非唐人 | 自然五官、头发/脸型多样、眼嘴表情、正常比例、统一皮肤 |
| 唐装/男女服饰/发式 | Style3D **Tang Qi chest Ruqun**、**Chest-length Hanfu 673k** 等CC BY免费公开页；男袍另需制作 | **网页候选**，无Sketchfab免费账户授权下载；未取得唐服原件 | 真实裁剪/布褶、身体骨骼绑定、穿插检查，必要署名 |
| 小青龙/骑行木车 | 已取得Grab3D高精中国龙/幼龙原件与当前木车研究 | **高精静态源在库，不是最终主角** | 连续拓扑、无翼玉青脸、全角度表情、走/上车/骑/飞动作及IK |
| 马/鹿/骆驼/其他动物 | 正式runtime 2件Quaternius CC0马与鹿；骆驼仍选优质CC BY有许可候选 | **马鹿已在运行时，其余不足** | 成年比例、真实骨骼、牵引、双峰驼与市场日常行为 |
| 交易道具/市集食品 | 已有Poly Haven 13 GLB中的部分食物陶木器；真源4K茶桌/纹理可供局部重做 | **既有运行源**，**4K真源部分本地** | 唐代存在的物产、开盒/称量/柜台物件关联，避免辣椒等后传农作物 |
| 室内陈设/家具 | chinese_screen_panels_4k、chinese_tea_table_4k；上轮案几/屏风凳1K | **2套4K本地取得并校验** | 家具形制不能未经考证直接冒充唐式；近景材质及尺度实审 |
| 4K木/石/灰泥/屋面PBR | hinoki_planks、white_stucco_02、wooden_gate、leaves_forest_ground 均本次原厂4K；旧瓦/泥/木材已在研究库 | **4套真实4K PBR本地取得** | 实际唐制木构材色、纹理方向、接缝、粗糙度、靠岸潮湿变化 |
| 声音/音乐/天气HDR | 旧原创合成声音和Venice Sunset HDR已有；OpenGameArt CC0水花/鸟声、Kenney RPG Audio是合法来源 | **本轮音效下载SSL失败**，无新源文件 | 试听、循环噪声控制、中文市声、空间声像与时段交互；不编造唐代原声 |

## 3. 新增9个已下4K目录和模型取得验证

| 类别目录 | 官方ID（均Poly Haven CC0） | 体积B | 文件数 | 用途裁定 |
|---|---|---:|---:|---|
| vegetation/polyhaven/ | `rock_moss_set_02_4k` | 9,482,911 | 5 | 溪边苔石/湿岸组景源 |
| 同上 | `shrub_02_4k` | 14,098,369 | 5 | 近景灌木 |
| 同上 | `fern_02_4k` | 10,836,560 | 5 | 低层蕨类 |
| interior/polyhaven/ | `chinese_screen_panels_4k` | 25,301,499 | 5 | 屏风纹样/木作研究 |
| 同上 | `chinese_tea_table_4k` | 24,267,141 | 5 | 茶肆桌木构研究 |
| material/polyhaven/ | `hinoki_planks_4k` | 29,586,680 | 5 | 木纹法线/粗糙度 |
| 同上 | `white_stucco_02_4k` | 44,902,481 | 5 | 土白灰泥墙面 |
| 同上 | `wooden_gate_4k` | 35,072,928 | 5 | 木门材质PBR |
| 同上 | `leaves_forest_ground_4k` | 45,834,305 | 5 | 林间路边落叶地面 |

## 4. 下一执行者的顺序

1. 先读项目 `AGENTS.md`、`docs/SYSTEM_ARCHITECTURE.md`、`docs/ART_ASSET_EXECUTION.md`、`docs/resource-catalog.json`，再读本文件和单项manifest，防止多个资产注册表。
2. 先按官网许可经合法免费账号取得 **Blendkit完整建筑** 与 **Style3D真唐服**，检查其原版材质/完整内外/衣服绑定；不用更多不合格半成品替代。Einar和原高精龙别重复下。
3. 真正完成Blender与现有 `tools/model_review.html` 同机位多视角（正、侧、背、俯视、灰模、PBR）；对角色情绪/步骑飞、桥溪波光和流向做**连续视频**。
4. 同步本地分类原件到用户明确的GitHub新分支，远端树实际包含完整4K源后才修改权威`resource-catalog.json`对应条目的取得状态；同步前只是local-acquired。

---
来源: chatgpt/free-assets-best-curated-20261024 分支 merge
更新日期: 2026-10-24
