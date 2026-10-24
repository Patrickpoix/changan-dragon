# 龙游长安

可编辑的 HTML / JavaScript / WebGL 三维漫游：小青龙在艺术化缩尺的唐长安步行、骑木自行车、飞行，游览坊市、宫苑、塔寺与曲江。建筑、角色、街景和舟船均为真实三维网格；概念图只作美术参考。

横屏优先。诗笺为可选收集，没有倒计时或必须完成的骑行任务。

**继续开发请先读：[产品目标与验收标准](docs/PRODUCT_BRIEF.md) → [当前进度与下一步](docs/CONTINUE.md) → [环境恢复](docs/ENVIRONMENT.md)。** [AGENTS.md](AGENTS.md) 保存新会话必须遵守的工作约定。目标是国漫电影质感的完整三维长安，目前可玩版本需要重做基础造型，不能将功能测试通过视为最终完成。

用户已明确要求重做当前不合格的建筑/人物/景观造型。指定的《长安三万里》《大理寺日志》研究、实际来源与建模方案见 [影视风格研究](docs/FILM_STYLE_RESEARCH.md)；新增物件和滤镜不能代替模型返工。

**当前先完成总体设计与资源准备，再正式整合。** [总体设计框架](docs/DESIGN_FRAMEWORK.md)规定地区体验、完整建筑族、小龙/木车/人物动作、经营活动、园林舟船、材质/镜头、制作管线与验收关口。[资源研究](docs/ASSET_RESEARCH.md)与[具体目录](docs/resource-catalog.json)保存109条资源/工具/史料的预览、许可与取得状态；核心成品源尚未齐，不能把候选链接视为已下载或把本轮研究称为游戏画面已经重做。

## 运行与交付

开发时保持 `index.html`、`src/`、`vendor/`、`assets/` 的相对位置，在仓库根目录启动静态服务：

```sh
python3 -m http.server 8877 --bind 0.0.0.0
```

完整单文件版的生成命令：

```sh
python3 tools/prepare_assets.py
python3 tools/pack_scene_materials.py
python3 tools/build_asset_bundle.py --bundle
python3 tools/build_standalone.py
```

输出为 `dist/changan-dragon.html`。它内嵌游戏脚本、引擎、三维模型、材质、环境光、字体与许可，运行时无需 CDN、账号、API 密钥或后端。支持正常执行 JavaScript/WebGL 的浏览器可以直接打开该文件。部分手机系统的文件预览器不是完整浏览器；此时通过静态 HTTP/HTTPS 页面在 Safari/Chrome 打开。手机本地文件策略与实际 GPU 表现仍需在对应真机上核对。

源码入口优先使用用户上传且与扩展匹配的 Three r160 原包 `vendor/three.min.js`；不存在或不兼容时使用独立的 `vendor/three.compat.min.js`。不会覆盖用户原包。单文件版固定内嵌经过校验的 r160 兼容包，与扩展构建版本一致。

## 操作

| 功能 | 桌面 | 手机 |
| --- | --- | --- |
| 漫游/转向 | WASD / 方向键 | 左下摇杆 |
| 步行/骑行/飞行 | 1 / 2 / 3 | 底部三态按钮 |
| 飞行升降 | Q / E | 飞行时的升降按钮 |
| 加速 | Shift / 空格 | 按住加速 |
| 环视/缩放 | 拖动画面 / 滚轮 | 拖动 / 双指缩放 |
| 四种跟随镜头 | C | 镜头按钮 |
| 景点直达 | G | 顶部景点 |
| 电影赏景 | P | 顶部赏景 |
| 昼夜 | N | 日/月按钮 |
| 拾取附近诗笺 | E（地面） | 拾取按钮 |
| 诗囊/帮助/退出面板 | L / H / Esc | 相应按钮 |

赏景模式支持前后景、暂停、留影和返回游城。飞行落地会检查水面、建筑和地面安全。宫门、桥面、含元殿正面台阶可实际通行；水上长廊、湖心亭、临街店铺和停泊画舫有实际可进入空间。

诗笺、位置、移动方式、镜头和音画设置保存在本机浏览器。无法使用本地存储时仍可游玩。声音在首次实际交互后启动。

帮助内可选自动/流畅/精致/电影画面。手机自动优先流畅；精致/电影启用接触阴影和曲江实时倒影，电影档增加克制的泛光。画质选择影响功耗和帧率。

## 修改与验证

`src/00-core.js` 管理核心/材质/批次；`10-world.js` 管理坊市与建筑；`12-landmarks.js` 管理宫苑塔寺与水域；`20-character.js` 管理角色/人群/舟船；`25-exploration.js` 管理探索与电影镜头；`27-session.js` 管理本机存档；`30-main.js` 组合启动与游戏循环。渲染、表面材质、水面、外部模型与程序植物分别位于 `05`、`06`、`07`、`08`、`09` 模块；`11-shorelines.js` 管理真实湖岸步道与园地。

基础建模返工已开始：首件完整木构研究样板可在静态服务的 [建模验收台](tools/model_review.html) 独立旋转查看，支持正侧背/俯视、灰模与米尺。它尚未部署全城或通过最终美术验收；生成脚本、构件来源和待办见 [样板说明](assets/library/architecture/timber-shop/README.md)。

本轮准备成果、资源取得与未通过项见 [准备审查](docs/PREPARATION_REVIEW.md)、[统一制作规格](docs/production-spec.json) 和 [17族制作合同](docs/production-contracts.json)。[补回的人物/完整店铺参考](docs/user-references/2026-10-23/README.md) 已原样保留。用户明确人物保持自然人体与脸形，主要通过发式服饰表现唐代；夸张人物头脸方案已撤回。独立组合试片仍未通过电影美术验收，正式城市未替换。

许可与下载证据见 [素材调研](docs/ASSET_RESEARCH.md)、[素材清单](docs/asset-manifest.json) 和各素材目录。正式使用的 Poly Haven 道具/植物/材质与环境光、Quaternius 马鹿、原作者动作、胡商面部和中空船体几何均为 CC0，miniLibs 构件移植遵循 MIT，马善政字体遵循 OFL。已保留作者与源文件校验。没有将现代/清式套件标成唐代考古复原。

已安装 Python Playwright 与 Chromium 的环境可运行：

```sh
python3 tools/smoke_test.py --viewports desktop landscape compact portrait
python3 tools/offline_test.py
python3 tools/rendering_test.py
```

测试证据默认写到临时目录。完整说明见 [浏览器验收](docs/QA.md)。当前进展和剩余的视觉验收记录见 [续做记录](docs/CONTINUE.md)，不能把旧截图或概念图视为最终运行画面。

开发环境恢复与启动见 [ENVIRONMENT.md](docs/ENVIRONMENT.md)。仓库保留可直接下载的 `dist/changan-dragon.html`；修改源码后重新运行打包脚本并更新该文件。

舟船采用真实吃水的画舫和中空小舟，含划桨人物/双桨动作与轻尾流。曲江东岸新增可行走的园路；可见湖岸、水域判断与小地图使用同一实际轮廓。

外郭城墙采用实际收分体积、按2米物理尺度的黏土微表面与代码夯层。高档后处理增加非法HDR颜色的过滤与局部恢复，避免少数异常像素扩散成大片黑屏。

准备阶段新增三型舟船/三级LOD与码头搭板的独立结构试片，重建和查看见[船型说明](assets/library/boats/construction-studies/README.md)；素材恢复/合同输入/成本可运行`python3 tools/audit_preparation.py`复核。它们未接入正式城市，人物服装、主角绑定和统一电影美术仍未全部通过，不能当作最终游戏完成。
