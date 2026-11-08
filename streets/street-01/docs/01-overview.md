# 01 · 设计总纲（street-01）

> 本文件是 `streets/street-01/` 支线的设计细则。**全仓库总纲以仓库根 [`AGENTS.md`](../../AGENTS.md) 为准**；本目录不再另设 `agent.md`，避免出现两套互相冲突的规范。冲突时以 `AGENTS.md` 为准。

## 1. 定位与边界

- 目标：先单独完成**一条街**（`streets/street-01/`）的高精细、高完成度、可用于生产的 PBR 建模素材 + 完整 3D 场景，作为后续扩展的样板与模块库。
- 方法：以生图模型产出的参考图作为风格、配色、纹样与风化程度的视觉依据，从参考图聚类提取调色板，驱动程序化 PBR 贴图生成；再以模块化几何搭建街道并导出 glTF / GLB。
- 交付：离线可用的 PBR 贴图集、标准 glTF 2.0 / GLB 模型、模块化构件库、可交互 Web 预览、完整文档与验收报告。
- 边界：本目录是 `workbuddy` 分支上的**独立新增子树**，未读取、修改、覆盖或删除 `main` 上任何既有建模文件。

## 2. 与主线 `main` 的关系

| 维度 | 主线 `main` | 本支线 |
| --- | --- | --- |
| 规范 | 根 `AGENTS.md`（含设计框架、资源研究、重建计划） | 遵循同一份；本文件为支线细则 |
| 首街入口 | `content/street/index.html` + `src/hero-street.js` | `web/index.html`（独立静态页） |
| 美术目标 | 国漫电影风格（《长安三万里》《大理寺日志》） | 黄昏暖金的**写实 PBR** 盛唐街景 |
| 构件来源 | Blender 参数化构件库 → `assets/kit/architecture/` | 纯 Python 几何生成器 → `assets/models/modules/` |
| 引擎版本 | Three r160 多文件 | Three.js 0.170，本地化在 `web/vendor/` |

> 这是**并行的技术验证线**，不替换、不合并、不依赖主线运行时。若将来要合入主线，必须先按 `AGENTS.md` 的美术口径评估风格差异；本支线可直接复用的是 PBR 素材体系、模块化构件与可复现流水线。

## 3. 参考与风格依据

- `references/generated/` 保存 8 张原始生图；`references/01_..08_*.png` 是按用途重命名的工作参考图；`index.json` 记录用途与提示词。
- `references/palette.json` 由材质研究板（3×4）逐格采样 12 种基色 + 街道全景图 LAB K-Means 聚类得到，是**唯一基色来源**；所有 albedo 主色必须落在调色板色域内（允许 ±12% 明度/饱和度扰动）。
- 时代与地域：**盛唐长安（公元 8 世纪）东/西市商业街** —— 木构抬梁、朱柱、青瓦、夯土与青砖、格扇糊纸、布幡幌子、红灯笼。禁止明清式样、现代元素、玻璃幕墙。
- 主光：**黄昏暖金**（约 3200–3800 K，低角度）；另支持晨 / 正午 / 夜景三套光照预设。

## 4. 技术栈与坐标

| 项 | 约定 |
| --- | --- |
| 贴图生成 | Python 3.11 + numpy + Pillow + SciPy + OpenCV，全程序化、固定 seed 可复现 |
| 模型格式 | glTF 2.0 / GLB，PBR Metallic-Roughness；外置纹理 `.gltf` + 内嵌 `.glb` 双份 |
| 预览 | Three.js 0.170 本地化于 `web/vendor/`，运行时无外网依赖 |
| 坐标 | 右手系，Y 向上，单位 **米**；街道沿 **+Z** 延伸，宽度沿 X |
| 单位尺度 | 1 贴图重复 ≈ 2 m（路面）、≈ 1 m（墙面）、≈ 0.5 m（瓦 / 木构） |

## 5. 目录约定

| 路径 | 职责 | 是否入版本库 |
| --- | --- | --- |
| `src/` | 可复现生成器源码（`pbr/` `geometry/` `tools/`） | 是 |
| `assets/` | 产物资产：`textures/` `models/` | 是 |
| `web/` | 自包含可交互预览（页面 + 轻量资产 + vendor） | 是 |
| `references/` | 生图参考源与调色板（`generated/` 存原始输出） | 是 |
| `docs/` | 文档（编号即阅读顺序）+ `images/` 全部图片 | 是 |
| `manifest.json` | 机器可读全资产清单（由 `build_docs.py` 生成） | 是 |
| `build.sh` | 一键复现入口 | 是 |
| `__pycache__/` | 运行缓存 | 否（`.gitignore`） |

原则：**源码与产物分离**、**文档归口**、**参考源独立**、**预览自包含**。产物全部可由 `bash build.sh` 重建，因此改动应优先落在 `src/`，再重跑生成链，而不是手改产物。

路径相对关系（移动目录时必须同步）：

- `assets/models/*.gltf` 内纹理 URI 为 `../textures/<material>/...`（相对 `assets/models/`）。
- `assets/models/modules/*.glb` 内纹理内嵌，内嵌贴图为 512px 轻量版（`glb_embed_max_px=512`，整库约 24 MB）；其分离式 `.gltf` 用 `../../textures/...` 的 2K 全分辨率贴图。
- `web/` 内所有 URI 以自身为根（`textures/...`、`street_preview.gltf`）。
- 材质浏览器「查看原图」用 `../assets/textures/...`（相对 `web/index.html`）。

## 6. PBR 通道规范（glTF 2.0 Metallic-Roughness）

每个材质输出 `<material>_<channel>.png`：

| 通道 | 色彩空间 | 说明 |
| --- | --- | --- |
| `albedo` | sRGB | 无烘焙光照、无强阴影，仅表面固有色 |
| `normal` | Linear | OpenGL 约定（+Y），由 height 求导，强度统一 |
| `roughness` | Linear | 灰度，需有微观变化 |
| `metallic` | Linear | 仅金属 / 鎏金 / 铜件非零，其余恒 0 |
| `ao` | Linear | 由 height 与缝隙遮蔽导出，不写入 albedo |
| `height` | Linear | 高度 / 位移，供 DCC 与世界空间细节使用 |
| `orm` | Linear | 打包图 R=AO、G=Roughness、B=Metallic，glTF 直接引用 |
| `opacity` / `emissive` | — | 仅透明 / 自发光材质需要 |

硬性要求：

1. 尺寸为 **2 的幂**（主材质 2048²，次要 1024²），**四边无缝平铺**（wrap 验证通过）。
2. albedo 不得烘焙方向光阴影；AO 不得写入 albedo；normal 不得含颜色信息。
3. 采样器 `wrapS/wrapT = REPEAT`，`minFilter = LINEAR_MIPMAP_LINEAR`。
4. 每种材质提供 `material.json`（基色、粗糙度区间、金属度、平铺尺度、来源参考图、接缝误差）。

## 7. 材质清单（六大类，29 种）

| 类别 | 代表材质 |
| --- | --- |
| 路面 | 青石板铺装、路缘石、青砖地、夯土路、车辙泥、积水 |
| 建筑 | 夯土墙、青砖墙、白灰抹面、朱漆柱、木枋梁、木板、格扇糊纸、青筒瓦、屋脊瓦当、台基石、彩画枋、黑漆匾额 |
| 装饰 | 鎏金铜件、灯笼纱、靛蓝布幡、赭黄布幡、竹编 |
| 道具 | 陶器、麻袋、树皮、叶片图集、苔藓、污渍贴花 |

完整参数见 [`02-materials-catalog.md`](02-materials-catalog.md)。

## 8. 一条街的场景范围

- 街道：长 120 m × 净宽 14 m（车行 9 m + 两侧人行道各 2.5 m），沿 +Z；建筑进深 7.4 m，总宽 28.8 m。
- 两侧共 16 栋店铺，业态不重复：酒肆、茶坊、绸缎庄、药铺、铁匠铺、客栈、当铺、书坊、胡商邸、饼铺、染坊、木器行、香阁、酒坊 + 2 栋民居。
- 每栋必备：台基与踏步、柱础与朱柱、额枋、**斗拱层**、墙体、格扇门 / 板门、出檐、**举折双坡筒瓦屋顶**与瓦垄、正脊与鸱吻、匾额（中文店名）、幌子、红绸 / 纸灯笼。部分为二层重檐楼阁。
- 街面必备：石板铺装与车辙、两侧排水沟与沟盖、路缘石、水井与辘轳、槐树、拴马桩、石灯、摊位与货箱、陶罐竹筐麻袋、香炉、旗幡、地面污渍与积水。
- 远景：城门楼与阙楼、坊墙、雾与天空渐变；不依赖外部 HDRI。

构件明细见 [`03-street-inventory.md`](03-street-inventory.md)。

## 9. 命名与分组

- 节点名：`<Zone>/<Category>/<Object>_<index>`，如 `North/Buildings/WineShop_01`。
- 材质名：`MAT_<MaterialName>`，与 `assets/textures/<material>/` 同名。
- 合并策略：按「语义分区 + 材质」合并几何以控制 draw call，同时保留语义节点层级。
- 文件命名：目录与脚本用小写连字符 / 下划线；文档用 `NN-名称.md` 表达阅读顺序；图片用 `名称-用途.png`。

## 10. 验收标准

- [x] 贴图：通道齐全、尺寸合规、四边无缝、色彩空间正确、无光照烘焙错误
- [x] 模型：glTF 校验通过、无 NaN、法线一致、UV 有效、材质 / 纹理引用全部可解析
- [x] 预览：可离线打开、自由漫游、4 套时辰、PBR 通道调试、材质浏览器、构件统计
- [x] 文档：manifest、材质表、构件清单、制作说明、验收自检报告齐全
- [x] **零改动**：未触碰主线任何既有建模版本文件

自动化检查：`python3 src/tools/validate.py`（输出 `docs/05-acceptance-report.md`）。

## 11. 约束与维护约定

- 不改动主线既有建模版本；不引入运行时 CDN 依赖；所有资产可离线使用。
- 生成器必须可复现：`bash build.sh` 一键重建全部产物，随机种子固定。
- 中文店名用本地 Noto Serif CJK 字体烘焙到纹理，不依赖客户端字体。
- 加材质改 `src/pbr/generate_textures.py` 的 `MATERIALS` 表；改几何改 `src/geometry/build_street.py`；加街道复制整个 `street-01/` 为新目录。
- 每次改动后：`bash build.sh` → 浏览器实拍 → `validate.py` 全通过 → 再提交。
- `assets/models/changan_street_01.glb` 为纹理内嵌单文件分发版（114.5 MB），因平台单文件 100 MB 上限不纳入版本库，可用 `bash build.sh` 重建；仓库交付基准是分离式 `.gltf + .bin + assets/textures/`。推送走 `src/tools/push_to_workbuddy.py`（Git Data API，增量挂载到 `workbuddy` 分支）。
