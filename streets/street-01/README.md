# 长安 · 龙街 — street-01（workbuddy 支线）

> 先做**一条街**：8 张生图参考 → 调色板 → 29 种全通道 PBR 贴图 → glTF 2.0 / GLB 整街场景 → 可交互 Web 预览。全部资产离线可用，且可一键复现。

本目录是 `changan-dragon` 仓库 `workbuddy` 分支上的**独立新增子树**，全部为新增文件；`main` 分支上任何既有建模版本均未被读取、修改或覆盖。

## 一眼看懂

| 项 | 值 |
| --- | --- |
| 场景 | 盛唐长安东/西市商业街，长 120 m，净宽 14 m，总宽 28.8 m |
| 店铺 | 两侧共 16 栋，14 种业态 + 2 栋民居 |
| PBR 素材 | **29 种材质**，每种 7–9 通道，共 235 张 PNG / 139.7 MB，四边无缝（误差 0） |
| 模型 | glTF 2.0 + GLB，62 语义分组、**245,046 三角面**、552,904 顶点、32 材质 |
| 模块库 | 7 件可复用构件（灯笼 / 摊位 / 水井 / 槐树 / 拴马桩 / 石灯 / 三开间店铺） |
| 生图参考 | 8 张（全景 / 立面 / 瓦作 / 路面 / 彩画 / 灯幡 / 道具 / 材质研究板） |
| 交互预览 | 自由漫游、4 套时辰、9 种 PBR 通道调试、29 材质浏览器、构件统计 |
| 验收 | **121 / 121 项通过** |

## 与主线仓库的关系（先读）

全仓库总纲以仓库根 [`AGENTS.md`](../../AGENTS.md) 为准；本目录**不再另设 `agent.md`**，避免形成两套冲突规范。细则见 [`docs/01-overview.md`](docs/01-overview.md)。

| | 主线 `main` | 本支线 `workbuddy / streets/street-01` |
| --- | --- | --- |
| 首街入口 | `content/street/index.html` + `src/hero-street.js` | `web/index.html`（独立静态页） |
| 美术风格 | 国漫电影风格（《长安三万里》《大理寺日志》） | 黄昏暖金的**写实 PBR** 盛唐街景（并行技术验证） |
| 建模方式 | Blender 参数化构件库 `content/architecture/` | 纯 Python 几何生成器 `src/geometry/` |
| 素材体系 | `assets/kit/architecture/` 等 | `assets/textures/` 29 种程序化 PBR |
| 运行时 | Three r160 多文件 | 本地化 Three.js 0.170（`web/vendor/`） |

> **本支线不替换、不合并、不依赖**主线运行时的任何文件，可独立构建与运行。若后续要合入主线，需按 `AGENTS.md` 的美术口径重新评估风格；本支线的价值在于 PBR 素材体系、模块化构件与可复现流水线。

## 目录结构

```
streets/street-01/
├── README.md                   本文件：入口、目录、快速开始、复现、维护约定
├── manifest.json               全资产清单（机器可读，由 build_docs.py 生成）
├── build.sh                    一键复现全部产物（固定随机种子）
├── .gitattributes              大二进制 GLB 走 Git LFS
├── .gitignore
│
├── docs/                       文档（编号即阅读顺序）
│   ├── 01-overview.md          设计定位、坐标/尺度、目录约定、PBR 规范、验收标准
│   ├── 02-materials-catalog.md 29 种 PBR 材质总表
│   ├── 03-street-inventory.md  一条街的构件清单与语义分组
│   ├── 04-production-notes.md  制作说明与技术决策
│   ├── 05-acceptance-report.md 验收自检结果（由 validate.py 生成）
│   └── images/                 实拍截图、参考对比、贴图总览、七通道对照
│
├── references/                 生图参考（源素材，不参与运行时）
│   ├── generated/              8 张原始生图（保留原始输出，勿改）
│   ├── 01_..08_*.png           按用途重命名的工作参考图
│   ├── index.json              参考图索引、用途与提示词
│   ├── palette.json            材质板采样 + 全景聚类得到的调色板（唯一基色来源）
│   └── palette_swatches.png    调色板可视化
│
├── src/                        可复现源码（只放代码）
│   ├── pbr/                    texcore.py（噪声/通道/无缝）、materials.py（29 生成器）、
│   │                           generate_textures.py（贴图 + 店招 + 总览）
│   ├── geometry/               gltf_writer.py（glTF 2.0 写出）、build_street.py（整街 + 模块库）
│   └── tools/                  prepare_references / make_preview_assets / build_docs /
│                               make_comparison / capture_preview / validate
│
├── assets/                     产物资产（交付与运行时用）
│   ├── textures/<material>/    29 种材质 × 7–9 通道 PNG + material.json
│   ├── textures/signage/       14 家店名的匾额 / 竖幌图集 + signage.json
│   ├── models/                 整街 .gltf + .bin + .glb、build_stats.json
│   └── models/modules/         7 件模块化构件 GLB + modules.json
│
└── web/                        自包含可交互预览（可整体部署到任意静态服务器）
    ├── index.html              自由漫游 / 4 套时辰 / PBR 通道调试 / 材质浏览器 / 构件统计
    ├── start_preview.sh        启动本地 HTTP 服务
    ├── street_preview.gltf     轻量预览模型（512px 贴图）
    ├── changan_street_01.bin
    ├── materials.json / stats.json
    ├── textures/               512px 预览贴图（214 张）
    └── vendor/                 本地化 three.js（无运行时外网依赖）
```

分层原则：**源码与产物分离**（`src/` ↔ `assets/`）、**文档归口**（`docs/`）、**参考源独立**（`references/generated/`）、**预览自包含**（`web/`）。新增街道时复制整个 `street-01/` 为 `street-02/`，彼此不共享可变状态。

## 快速开始

```bash
bash web/start_preview.sh 8080
# 浏览器打开 http://localhost:8080/web/index.html
```

> ES Module 与 glTF 必须经 HTTP 加载，**不要**用 `file://` 直接打开。服务根目录是本 `street-01/`，因此材质浏览器的「查看原图」可以直接访问 `assets/textures/` 的 2K 原图。

操作：`W/A/S/D` 行走、`Q/E` 升降、`Shift` 加速、鼠标拖拽旋转、滚轮缩放；`1–4` 切换时辰，`R` 回到街口；右侧可浏览全部 29 种材质的每个通道并查看原尺寸图。

## 一键复现

```bash
bash build.sh
```

依次执行：参考图整理与调色板 → 29 种 PBR 贴图 + 店招 → 整街 glTF/GLB 与模块库 → 轻量预览资产 → 清单与文档 → 参考/成果对比 → 验收自检。所有生成器固定随机种子，重跑结果一致。

依赖：Python 3.11 + numpy / Pillow / SciPy / OpenCV；预览页无需安装（three.js 已本地化）。更新实拍截图（可选，需 Playwright + Chromium + Xvfb）：

```bash
bash web/start_preview.sh 8080 &
xvfb-run -a python3 src/tools/capture_preview.py
```

## 制作路线

**生图参考 → 调色板 → 程序化 PBR → 模块化几何 → glTF/GLB → 交互预览**

1. 生图模型产出 8 张参考图，覆盖整体氛围、建筑形制、瓦作、路面、彩画、灯幡、道具与材质样板。
2. 从材质研究板（3×4）逐格采样 12 种基色，从街道全景图做 LAB K-Means 聚类得到环境色，形成 `references/palette.json`，作为所有 albedo 的**唯一色彩来源**。
3. 29 种材质由周期噪声（value / fBm / ridged / Voronoi）程序化生成，输出 albedo / normal / roughness / metallic / AO / height / ORM，另按需输出 opacity / emissive。
4. 自研 glTF 2.0 写出器按「语义路径 + 材质」合并几何，同时导出外置纹理 `.gltf` 与纹理内嵌 `.glb`。
5. Web 预览使用本地化 three.js 与 512px 预览资产，不依赖任何 CDN。

详见 [`docs/04-production-notes.md`](docs/04-production-notes.md)。

## 文档索引

| 文档 | 内容 |
| --- | --- |
| [`01-overview.md`](docs/01-overview.md) | 设计定位、风格依据、坐标与尺度、目录约定、PBR 通道规范、命名与验收标准 |
| [`02-materials-catalog.md`](docs/02-materials-catalog.md) | 29 种材质总表（基色 / 尺寸 / 平铺 / 粗糙度 / 参考） |
| [`03-street-inventory.md`](docs/03-street-inventory.md) | 一条街的构件清单与语义分组 |
| [`04-production-notes.md`](docs/04-production-notes.md) | 完整制作说明与技术决策 |
| [`05-acceptance-report.md`](docs/05-acceptance-report.md) | 121 项验收自检结果 |
| [`images/reference-vs-result.png`](docs/images/reference-vs-result.png) | 生图参考 vs 建模成果对照 |
| [`images/textures-contact-sheet.png`](docs/images/textures-contact-sheet.png) | 全部材质缩略总览 |

## 推送到 workbuddy 分支

本支线位于仓库 `workbuddy` 分支的 `streets/street-01/` 子树，`main` 不受影响。推送工具走 `api.github.com` 的 Git Data API（不依赖 `github.com` 的 git 协议），以 `main` 的 tree 为基线增量挂载，不会改动任何既有文件：

```bash
export GITHUB_TOKEN=<具有 contents:write 权限的 token>
python3 src/tools/push_to_workbuddy.py --dry-run   # 预览将上传什么
python3 src/tools/push_to_workbuddy.py             # 实际推送
```

> 若 GitHub 集成令牌只有只读权限（`403 Resource not accessible by integration`），需在连接器设置中重新授权，或改用有写权限的 PAT。工具会自动跳过超过 99 MB 的文件并列出。

## 验收

```bash
python3 src/tools/validate.py
```

检查 glTF 2.0 结构、accessor 边界、纹理可解析、PBR 通道齐全、尺寸为 2 的幂、四边无缝、GLB 头、模块库、预览资产完整性，并重新生成 `docs/05-acceptance-report.md`。

## 维护约定

- **加材质**：改 `src/pbr/generate_textures.py` 的 `MATERIALS` 表，必要时在 `src/pbr/materials.py` 增加生成器；基色必须来自 `references/palette.json`。
- **改几何**：改 `src/geometry/build_street.py`；glTF 写出细节在 `src/geometry/gltf_writer.py`。
- **加一条街**：复制本目录为 `streets/street-02/`，改 `manifest.json` 的 project 与构建参数，勿改动 `street-01/`。
- **贴图 URI 约定**：`assets/models/*.gltf` 内用 `../textures/<material>/...`（相对 `assets/models/`）；`web/` 内用 `textures/...`（自包含）；材质浏览器原图用 `../assets/textures/...`。移动目录时务必同步这三处。
- **提交前**：`bash build.sh` → 浏览器实拍 → `validate.py` 全通过 → 再提交。
- **大文件**：`assets/models/changan_street_01.glb` 是纹理内嵌的单文件分发版（114.5 MB）。因 GitHub 单文件 100 MB 上限，它**不纳入版本库**（可随时用 `bash build.sh` 重建）；仓库交付基准是分离式 `.gltf + .bin + assets/textures/`。若需入库请启用 Git LFS（`.gitattributes` 已配置）。
- **模块 GLB**：`assets/models/modules/*.glb` 的**内嵌贴图为 512px 轻量版**（用于独立分发与快速预览，整库约 24 MB）；对应的分离式 `.gltf` 仍引用 `../../textures/` 下的 2K 全分辨率贴图。`build_street.py` 中通过 `glb_embed_max_px=512` 控制，主场景 GLB 不受影响。

## 约定速记

- 坐标：右手系，Y 向上，单位米；街道沿 +Z 延伸。
- PBR：glTF 2.0 Metallic-Roughness；`albedo`=sRGB，其余 Linear；ORM 打包 R=AO / G=Rough / B=Metal。
- 所有贴图 `wrapS/wrapT = REPEAT`，四边无缝（验收实测接缝误差 0）。
- 中文店名用本地 Noto Serif CJK 字体烘焙进纹理，不依赖客户端字体。
- 运行时零外网依赖；不改动主线既有资产。
