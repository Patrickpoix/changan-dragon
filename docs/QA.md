# 浏览器验收

## 2026-10-31 西市首街独立试段

`qa-evidence/hero-street.json` 对应独立页面
`content/street/index.html`，不是旧城整场景验收：

- 1280×720 与 844×390 手机横屏尺寸均实际加载 r160、2 个构件 GLB、19 个
  建筑实例与本地 PBR；完成入场、键盘/触摸移动、飞行升降、近看、返回街口。
- 44px 控件、无溢出、近看机位到龙首约 1.85m、glError=0；无页面异常、
  控制台错误或坏请求。
- 已人工查看 `hero-street-desktop.png`、`hero-street-mobile.png` 与两张
  近看图。它们仍是**未通过最终美术**的当前基线：龙首偏球、人物偏套筒、
  白墙/店面重复、街面生活细节不足。
- 使用 Chromium SwiftShader；手机横屏只是尺寸/触摸模拟，不是手机真机
  帧率、真机触摸或本地文件通过。

## 最新：总体设计与资源研究检查

本轮用户要求在正式整合前先完成设计/资源研究。记录见 [design-research.json](qa-evidence/design-research.json)，**不是新游戏画面的浏览器/美术/真机验收**：

- 109条资源/工具/史料有唯一ID、实际访问证据与明确阶段；76条实际看过公开预览，未取得的文件未做四面/动作承诺。
- 63处本轮相关本地文档链接存在；MakeHuman固定提交5份源文件的字节/SHA256通过，原OBJ有限坐标/有效面索引、163骨架与57107条权重的索引/数值/骨名检查通过。它是未导出的制作基体，非成品唐服角色。
- 小龙/画舫两张新辅助设计实际查看并保存哈希；新增参考尚未获用户确认，数值标尺、机械/结构与跨视图问题在DESIGN_FRAMEWORK列出，不能当作工程图或3D实现。
- `src/`、`vendor/`、`index.html`、运行素材包、`dist/`与研究前版本无差异；离线包仍18,693,882B、SHA256 `d9ede61fd366a3cbd2f056aab21b521ca69c75fd0995f41a1884fb3f2230e373`。无应用改动，因此本轮没有重复运行整城浏览器测试，也没有新增手机真机/帧率结论。

## 已有游戏的浏览器验证方法

先在仓库根目录运行静态服务，例如 `python3 -m http.server 8877`。在已安装 Python Playwright 和 Chromium 的开发环境中运行：

```sh
python3 tools/smoke_test.py --url http://127.0.0.1:8877/
```

脚本依次检查桌面 1280×720、手机横屏 844×390、小屏横屏 667×375、竖屏 390×844。同一时刻只打开一个 WebGL 页面；不要并行运行多个浏览器验收。截图、留影及 `results.json` 默认保存在新建的临时目录，不写入源代码目录。通过 `--output /tmp/changan-review` 指定证据目录，或用 `--viewports landscape` 单独检查一种尺寸。

桌面与主要手机横屏会使用实际按钮、键盘和触摸输入检查：三种移动方式、上升、摇杆方向与释放、失焦复位、四种镜头、八处景点、弹窗切换、电影暂停与前后切景、留影、返回游城、昼夜、拾取诗笺与刷新后存档。水上拒绝落地和空地着陆使用明确的调试位置夹具设置初始位置，然后点击实际移动方式按钮。暂停检查会将已暂停镜头置于场景结束边界，确认它不会自行切景。

画面检查包括启动内容、错误覆盖层、必需请求、控制项可见性、点击命中、44px 触摸目标、屏幕边界和溢出。还需人工查看保存的 `game.png` 和 `cinema.png`，确认实际截图中 HUD 正常绘制、建筑与角色具有可绕看的体积、桥面连续、相机没有穿墙。DOM 可见性通过并不能替代截图检查。

默认使用 Chromium SwiftShader 验证云环境中的实际 WebGL 状态；它不代表真机帧率。`--hardware` 使用浏览器默认 GPU，`--browser` 指定 Chromium 可执行文件。最终交付前仍需在实际手机浏览器上检查持续骑行、多指操作、横竖屏切换、画面质量选择、声音、留影下载和发热情况。

额外检查：以 `?quality=high` 打开页面并查看 `window.__changan.rendering`，确认电影画面通道完成初始化且没有未解释的回退；三种画面质量均应保持操作可用。原始 `vendor/three.min.js` 尚未提供时，加载器会使用独立兼容引擎，其原始路径请求失败是已知回退条件；其他必需文件请求失败应作为错误调查。

脚本返回成功仅证明该次运行中执行的检查通过。未运行的脚本、旧版 `_qa` JSON、软件渲染截图均不应表述为手机真机性能验收。

## 单文件与真实通行面专项

```sh
python3 tools/build_standalone.py
python3 tools/offline_test.py --output /tmp/changan-offline-review
```

该脚本以静态 HTTP 取得单文件，确认没有其他 HTTP 资产请求，再把浏览器上下文设为离线，继续切景、实时反射及 PNG 留影。还通过实际键盘和运动/碰撞求解器，检查水上长廊、湖心亭、码头至停泊画舫、临街店铺入口及含元殿台阶，并刷新验证位置/方式/镜头恢复。位置夹具只设置起点，不直接写入终点。

云环境 Chromium 的管理策略禁止 file:// 导航（ERR_BLOCKED_BY_ADMINISTRATOR），未绕过此策略。上述结果证明打包资源自包含和断网后功能，不能表述为已在手机文件管理器或 Safari 本地文件中完成测试。

2026-10-23 当前已取得：

- `/tmp/changan-complete-qa/results.json`：桌面1280×720、横屏844×390、小横屏667×375、竖屏390×844通过。桌面和主横屏执行完整键盘/触摸/模式/镜头/景点/电影/存档交互；后两种尺寸检查启动、布局、44px命中与溢出。该次版本为70处模型、最新石材/窗格/抗锯齿版本，早于八棵新增作者树。
- `/tmp/changan-offline-final/results.json`：78处模型、7来源、104网格真实加载，长廊/亭台/画舫/商铺/宫阶通行通过；刷新恢复通过；断网后曲江倒影+SAO/Bloom/FXAA正常、无回退；PNG留影通过，零外部资源请求和页面异常。树的位置随后微调，八处根部y=0的浏览器检查已通过；功能索引随启动重建。小圆角/侧面木框精修后已补跑最新启动与宫殿切景，零页面异常；截图`/tmp/changan-visual/palace-refined.png`。

软件渲染只证明本次执行功能。最终视觉仍未达到已认可概念图的细节/光照/人物水准，不能将这些结果称为AAA或手机真机性能验收。


2026-10-23 续轮新增证据：

- `/tmp/changan-art-round2/`及`/tmp/changan-art-round3/`：天空、含元殿重檐、曲江机位、小龙与新增地被实际截图，medium/high官方通道和着色器无异常。
- `/tmp/changan-animals-qa.log`：11来源、122摆放，8只马鹿有独立骨架；动作姿态随时间变化，4匹行走马沿已检查路线前进。未把西式服装或粗块柳树采用到唐代场景。
- `/tmp/changan-round5-qa/results.json`：844×390执行完整交互，667×375和390×844执行启动/44px命中/布局/溢出检查，全部通过，无页面、必需请求或控制台错误。包含11来源、近景铺路石、布纹/摊篷和横屏单行赏景栏。此后增加城门窗廊/木门、铺路灰缝、入城前低机位，须看后续专项证据。
- `/tmp/changan-offline-round4/results.json`：9来源14.18MB版本的真实通行、存档、断网高画质与PNG通过；早于动物和近景铺地，不能代替当前16MB版本的离线复验。

## 15来源与WebGL1补充（2026-10-23）

已将关键结果复制到 `docs/qa-evidence`，避免临时目录消失后丢失进度。`mobile-round9.json`为修正诗笺位置夹具后的横屏完整交互及小横屏/竖屏布局通过，早于最终食品和兼容层。`offline-round10.json`为15来源的17.1MB版本，实际通行、刷新存档、断网高画质/倒影/PNG通过，零外部资源请求/页面与控制台错误。

`webgl1-acceptance.json`为兼容层修复后的专项：强制WebGL1、16顶点属性/浮点骨纹理可用，9个蒙皮（8动物+龙尾）正常，动作变化、飞行、赏景、高档选择安全回退、glError=0、无页面/控制台错误。WebGL1不用HDR倒影和后处理。该结果不证明8属性或缺少浮点骨纹理硬件，也不代表旧手机真机测试。相关实际截图同时保留。

用户上传引擎已取回并通过实际源码启动：`qa-evidence/uploaded-engine.json`，source=original、revision160，667×375启动/实际帧/触控44px布局通过，无必需请求/页面/控制台错误。环境6个静态入口均HTTP200；本次不重新宣称全套手机交互或真机性能。

## 舟船与真实湖岸（main合并后）

`qa-evidence/boats-and-shore.json`：最新单文件完整专项通过，6船每航线512位置与所有15组独立航线组合，船壳/桨范围无岸/岛/桥侵入，最小包络间距约.542m。11163水域采样与可见多边形一致；园路1311细段样点无碰撞；从起点用实际键盘和运动求解器走完224连续目标，未直接写入终点。1120×630和844×390实际截图、动作变化、glError=0、零页面与控制台错误。

`offline-boats-shore.json`：最新17,171,852B单文件通过真实长廊/亭/停泊画舫/店铺/宫阶、刷新存档、断网high倒影/SAO/Bloom/FXAA/PNG，零外部资源/页面/控制台错误。`webgl1-boats-shore.json`：同版本强制WebGL1通过，9蒙皮/8动物动作/飞行/赏景、高画质安全回退、glError=0、无错误。

首轮园路点采样通过后真实行走暴露转角问题，随后增加路径细分/根部净空和每20cm检查；新栏柱在凹弯侵入邻近路径，已改为独立沿岸布置。最终通过目录为`/tmp/changan-boats-final4`，不要将final/final2/final3当作通过。截图还发现林下追随相机近叶遮挡角色，已记录待继续修复；通行成功不等于此视觉问题已解决。

## 林下角色视野

相机近叶与玩家视线遮挡按整片叶处理，保留树干和远处树冠；赏景关闭玩家净空。抖动透明初稿出现噪点，已弃用。`shore-camera-before.png` / `shore-camera-after.png`为相同机位实际画面对照。`foliage-camera.json`验证17,174,676B新版单文件，844×390实际追随、切镜头、电影焦点关闭、断网high FXAA/SAO/Bloom通过，零外部请求/页面/控制台错误、glError0。`webgl1-foliage.json`进一步验证同包WebGL1森林画面、9蒙皮/8动物动作、飞行/赏景/高画质安全回退，无错误。之前整段园路/通行面已在该改动前一版通过，本次未重复宣称全套通行面重测。

## 城墙近景与HDR边界防护

原先墙体脚本仅验证控制台/材质/通行会返回PASS，但实际高档近景全黑；人工否决后新增`tools/rendering_test.py`，真实复现并锁定像素检查。详见RENDERING_DIAGNOSIS.md。`rammed-walls-rendering.json`：18,687,084B版本在现代1120×630/强制WebGL1手机844×390通过，实际穿门、法线/粗糙度/物理UV/收分、断网高档、FOV43/58/35画面、原黑点恢复、零外部请求/页面/控制台错误、glError0。原始HDR输入少数NaN由后处理边界过滤与局部恢复保护；底层着色/驱动精确来源未确认，不将本次修复冒称所有输入浮点值都正常。

同一18,687,084B应用版本进一步通过medium输出复验：`medium-rendering.json`，FOV43无黑区、均亮184.38、原故障点RGB212/189/159，glError0、无外部请求/页面/控制台错误。验证命令：`python3 tools/rendering_test.py --profiles modern --output /tmp/changan-rendering-medium-final`。

## 内街通行基线与建模返工

```sh
python3 tools/market_test.py --output /tmp/changan-market-review
```

`qa-evidence/market-traversal.json`对应18,693,882B单文件：实际走过东西市连续目标，进入8间内街店铺；三态切换、飞行/赏景返回、手机844×390的44px命中、断网medium、1120×630建筑视点通过；零页面/控制台/外部请求错误，glError0。起点使用位置夹具，终点均由实际键盘与运动/碰撞求解到达。

初次固定楼廊相机落在梁底，不能用它作视觉通过证据；已将维护脚本机位移至廊外，并在`source-model-review.json`对应源码专项重拍。该源码专项实际使用原上传r160、强制WebGL1，9蒙皮、几何、手机控件、飞行/电影和高档安全回退均正常，无错误。图片`market-model-baseline.png` / `gallery-model-baseline.png`已人工查看：它们只记录**需要造型返工的当前基线**，美术没有通过。

初次scaleAudit对成人group测量误包含对话Sprite，不能当成人高度。维护脚本已改为直接测人物mesh，单独源码专项也已用纯mesh重新核对，见source-model-review.json；小龙约2.20m、成人约1.65/1.84m，主角比例同样需要重做。尺度随姿态变化，不能将不同姿态的AABB当作角色设定身高。

用户最新否决的是模型基础造型；验收不能止于上述功能。继续时按 [FILM_STYLE_RESEARCH.md](FILM_STYLE_RESEARCH.md) 的完整模型试片检查轮廓、结构、比例、衣服剪裁、眼窝/口鼻、冠形、材质与多视角，再做代表性场景。真机性能、本地文件策略和最终电影美术仍未验收。

## 完整建筑建模样板专项

```sh
python3 tools/model_test.py --output /tmp/changan-timber-review
```

`timber-model-study.json`对应内嵌MIT通知的研究GLB，2,587,440B / 73096三角形 / 19网格。独立验收台以现代1120×720和强制WebGL1 844×390检查真实模型、有限顶点/法线、四种视角按钮、灰模与米尺，无页面/控制台错误、glError0。楼廊3个位置从屋顶下方射线向下，均首先命中y≈3.985的木板，防止第一轮错误腰檐高于木地板的问题回归。

实际查看了`timber-model-study.png`与`timber-model-grey.png`，以及生成的正侧背/俯视图。此前侧坡无瓦和斗拱穿屋面被人工否决后修正；首次源导出因Blender已删除对象引用报错也已修复，不能把那个失败版本当作通过。当前材质/陈设/造型风格仍需继续，与具体参考的差距见FILM_STYLE_RESEARCH第7节，最终美术验收状态为false。

样板未部署正式城市，没有把它算作新增正式GLB来源；主游戏离线包SHA保持不变。本专项不重复宣称全城新模型已换完、手机真机已测或新增楼层已能在主游戏行走。

## 2026-10-24 研究资产恢复专项

2026-10-23续轮重新核验及新增准备试片：`resource_recovery_test.py`现支持`--models recovered|authored --output <directory>`，默认输出仓库外，避免覆盖恢复证据；旧下述命令仍验证恢复模型。`preparation_study_test.py`检查最新自然人物/木构/材质/植物组合的现代/WebGL1加载、多视角、灰模保留alpha及有限属性；`studio_source_test.py`检查隔离的成熟头脸静态转换与五条Web Audio解码/手势启动音频时钟。**用户已否决Snow/Rain夸张造型，技术加载通过不改变此结论，最新组合已改用自然成人源。** 本轮经选择的证据在`qa-evidence/preparation-20261023/`；没有真机、最终美术、原rig迁移或人耳听审通过声明。

`python tools/prepare_production_materials.py --verify`核验7组原件摘要和21张512²图；`node tools/prepare_vegetation_studies.mjs /path/to/tree-tools`重跑12GLB字节一致。叶片原先是Git LFS指针，首轮浏览器纹理失败，随后取得media原图并按LFS SHA256/大小核验后重跑；不计失败版本为通过。

启动8877静态服务后运行`python tools/resource_recovery_test.py`（本机Playwright/Chromium，未发现Browser工具）。记录见`qa-evidence/resource-recovery/results.json`及四类截图：24次现代/强制WebGL1加载、包围盒取景、四视角/灰模、本地GLB替换、坏文件保留旧模型，零页面/控制台错误、glError0。四图已实际查看；柳冠/树皮/花树仍未通过美术，花树乘色偏褐。软件渲染与手机尺寸不是手机真机或所有浏览器兼容测试。正式场景、离线包本轮未改，未重复做整城验收。
